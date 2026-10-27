import { createServer, type IncomingMessage } from 'node:http';
import { Sessions, checkPassword } from './auth.ts';
import {GitHubReader} from '../../../packages/connectors/src/github-reader.ts';
import type { Resource } from '../../../packages/connectors/src/github.ts';
import { manifests } from '../../../packages/connectors/src/contracts.ts';
import { authorizeTool, redact } from '../../../packages/core/src/index.ts';
export interface Config {origin:string;passwordHash:string;githubToken?:string;transport?:typeof fetch; audit?:(event:unknown)=>void;}
async function json(req:IncomingMessage){
  const chunks:Buffer[]=[];let bytes=0;
  for await(const chunk of req){bytes+=chunk.length;if(bytes>8192)throw new Error('Body too large');chunks.push(chunk);}
  const value=JSON.parse(Buffer.concat(chunks).toString());
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new Error('Invalid body');return value;
}
export function makeServer(config:Config){
  const origin=new URL(config.origin);
  if(origin.protocol!=='http:'||!['127.0.0.1','localhost'].includes(origin.hostname))throw new Error('Local development origin required');
  const sessions=new Sessions();let attempts:number[]=[];let reads:number[]=[];
  const readers=new WeakMap<object,GitHubReader>();
  const readerFor=(session:object)=>{let reader=readers.get(session);if(!reader){reader=new GitHubReader(config.githubToken,config.transport);readers.set(session,reader);}return reader;};
  const audit=(type:string,metadata:unknown={})=>config.audit?.({at:new Date().toISOString(),type,metadata:redact(metadata)});
  return createServer(async(req,res)=>{
    res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
    res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'none'; frame-ancestors 'none'");
    const reply=(status:number,body:unknown)=>{res.statusCode=status;res.end(JSON.stringify(body));};
    try {
      // Reject DNS rebinding and all cross-origin requests, including GET.
      const host=req.headers.host?.split(':')[0];
      if(!host||!['127.0.0.1','localhost'].includes(host))return reply(403,{error:'invalid_host'});
      if(req.headers.origin&&req.headers.origin!==config.origin)return reply(403,{error:'invalid_origin'});
      if(req.headers['sec-fetch-site']==='cross-site')return reply(403,{error:'cross_site_denied'});
      const url=new URL(req.url||'/',config.origin),path=url.pathname;
      const method=req.method||'GET';
      if(method!=='GET'&&method!=='POST')return reply(405,{error:'method_not_allowed'});
      if(method==='POST'&&(req.headers.origin!==config.origin||!req.headers['content-type']?.startsWith('application/json')))return reply(403,{error:'invalid_request'});
      if(path==='/api/health'&&method==='GET')return reply(200,{ok:true,mode:'local-development',configured:Boolean(config.passwordHash)});
      if(path==='/api/session'&&method==='POST'){
        if(!config.passwordHash)return reply(503,{error:'authentication_not_configured'});
        const now=Date.now();attempts=attempts.filter(t=>now-t<60000);
        if(attempts.length>=5)return reply(429,{error:'rate_limited'});attempts.push(now);
        const body=await json(req);
        if(typeof body.password!=='string'||!checkPassword(body.password,config.passwordHash)){audit('auth.denied');return reply(401,{error:'invalid_credentials'});}
        const session=sessions.create();res.setHeader('Set-Cookie',`jarvis_session=${session.token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=3600`);
        audit('auth.accepted');return reply(200,{user:{id:'local-owner',role:'owner'},csrf:session.csrf});
      }
      const token=req.headers.cookie?.match(/(?:^|;\s*)jarvis_session=([a-f0-9]{64})(?:;|$)/)?.[1]||'';
      const session=sessions.get(token);
      if(!session)return reply(401,{error:'authentication_required'});
      if(method==='POST'&&req.headers['x-csrf-token']!==session.csrf)return reply(403,{error:'csrf_required'});
      if(path==='/api/session'&&method==='GET')return reply(200,{user:{id:'local-owner',role:'owner'},csrf:session.csrf});
      if(path==='/api/logout'&&method==='POST'){
        sessions.revoke(token);res.setHeader('Set-Cookie','jarvis_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0');audit('auth.revoked');return reply(200,{ok:true});
      }
      if(path==='/api/connectors'&&method==='GET')return reply(200,{connectors:manifests.map(m=>({...m,...(m.id==='github'?readerFor(session).status():{status:m.domain==='corporate'?'blocked':'disconnected',lastSuccessfulSync:null,freshness:'unavailable',lastError:null})}))});
      if(path==='/api/github'&&method==='GET'){
        if(!authorizeTool({id:'github.read',operation:'read',domain:'personal'},{authenticated:true,domains:['personal']}))return reply(403,{error:'denied'});
        const now=Date.now();reads=reads.filter(t=>now-t<60000);if(reads.length>=30)return reply(429,{error:'rate_limited'});reads.push(now);
        const repo=url.searchParams.get('repo')||'3bHussein/ProgressXX-Web',resource=(url.searchParams.get('resource')||'repository') as Resource;
        const result=await readerFor(session).read(repo,resource,url.searchParams.get('refresh')==='1');
        if(!sessions.get(token))return reply(401,{error:'authentication_required'});
        audit('connector.read',{ready:result.status==='ready'});return reply(200,result);
      }
      if(path==='/api/tools'&&method==='POST'){audit('tool.denied');return reply(403,{error:'writes_disabled'});}
      return reply(404,{error:'not_found'});
    } catch {audit('request.failure');return reply(400,{error:'request_failed'});}
  });
}
