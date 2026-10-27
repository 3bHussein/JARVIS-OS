import {readGitHub,repositories,type GitHubSummary,type Resource} from './github.ts';
import {freshness} from '../../core/src/index.ts';
import type {ConnectorResult,ConnectorView} from './contracts.ts';
/** Session-owned cache. No durable data and no sharing between authenticated sessions. */
export class GitHubReader {
  private cache=new Map<string,{result:ConnectorResult<GitHubSummary>;etag?:string}>();
  private inflight=new Map<string,Promise<ConnectorResult<GitHubSummary>>>();
  private lastSuccess:string|null=null;
  private lastError:ConnectorResult<unknown>['error']|null=null;
  private retryAt:string|null=null;
  private tail:Promise<unknown>=Promise.resolve();
  private token:string|undefined;
  private transport:typeof fetch;
  private now:()=>Date;
  constructor(token:string|undefined,transport:typeof fetch=fetch,now:()=>Date=()=>new Date()){this.token=token;this.transport=transport;this.now=now;}
  status():Pick<ConnectorView,'status'|'lastSuccessfulSync'|'freshness'|'lastError'> {
    const state=freshness({connector:'github',observedAt:this.lastSuccess,maxAgeMs:300000},this.now());
    return {status:!this.token?'disconnected':this.lastError?'error':state==='current'?'ready':state==='stale'?'stale':'configured',lastSuccessfulSync:this.lastSuccess,freshness:state,lastError:this.lastError};
  }
  read(repo:string,resource:Resource,refresh=false):Promise<ConnectorResult<GitHubSummary>> {
    if(!(repositories as readonly string[]).includes(repo)||!['repository','pulls','issues','actions'].includes(resource))return Promise.reject(new Error('Resource not allowlisted'));
    const key=`${repo}|${resource}`,time=this.now(),cached=this.cache.get(key);
    if(this.retryAt&&Date.parse(this.retryAt)>time.getTime())return Promise.resolve(this.limited());
    const age=time.getTime()-Date.parse(cached?.result.source.observedAt||'');
    if(!refresh&&cached&&age>=0&&age<30000)return Promise.resolve({...cached.result,cache:'hit'});
    const pending=this.inflight.get(key);if(pending)return pending;
    const task=this.tail.then(async()=>{
      if(this.retryAt&&Date.parse(this.retryAt)>this.now().getTime())return this.limited();
      let etag=cached?.etag;
      const result=await readGitHub(repo,resource,this.token,this.transport,this.now(),{etag,previous:cached?.result,onEtag:value=>etag=value});
      this.lastError=result.error||null;
      if(result.status==='ready'){
        this.lastSuccess=result.source.observedAt;this.retryAt=null;
        this.cache.set(key,{result,etag});
      }else if(result.error==='unauthorized'){this.cache.clear();this.lastSuccess=null;}
      if(result.retryAt)this.retryAt=result.retryAt;
      return result;
    }).finally(()=>this.inflight.delete(key));
    this.inflight.set(key,task);this.tail=task.catch(()=>{});return task;
  }
  private limited():ConnectorResult<GitHubSummary>{return {status:'error',source:{connector:'github',observedAt:null,maxAgeMs:300000},data:null,error:'rate_limited',retryAt:this.retryAt!};}
}
