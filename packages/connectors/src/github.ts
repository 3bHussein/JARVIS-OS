import type { ConnectorResult } from './contracts.ts';
export const repositories = ['3bHussein/ProgressXX-Web','3bHussein/Whoop-Intelligence-','3bHussein/Week-Timesheet-Manager','3bHussein/Project-Factory-AI','3bHussein/Lexora-Academy','3bHussein/CloudHub'] as const;
export type Resource = 'repository' | 'pulls' | 'issues' | 'actions';
export interface GitHubSummary { repository: string; resource: Resource; items: { title: string; url: string; state: string }[]; }
const suffix: Record<Resource,string> = {repository:'',pulls:'/pulls?state=open&per_page=10',issues:'/issues?state=open&per_page=10',actions:'/actions/runs?per_page=10'};
export async function readGitHub(repo: string, resource: Resource, token: string | undefined, transport: typeof fetch = fetch, now = new Date()): Promise<ConnectorResult<GitHubSummary>> {
  const source = {connector:'github',observedAt:null as string|null,maxAgeMs:300000};
  if (!(repositories as readonly string[]).includes(repo) || !Object.hasOwn(suffix,resource)) throw new Error('Resource not allowlisted');
  if (!token) return {status:'disconnected',source,data:null,error:'not_connected'};
  try {
    const response = await transport(`https://api.github.com/repos/${repo}${suffix[resource]}`,{headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(10000),redirect:'error'});
    if (!response.ok) return {status:'error',source,data:null,error:response.status===401?'unauthorized':response.status===429||(response.status===403&&response.headers.get('x-ratelimit-remaining')==='0')?'rate_limited':'upstream_unavailable'};
    if(Number(response.headers.get('content-length'))>2000000||!response.body) throw new Error('Oversized or empty response');
    const reader=response.body.getReader(), chunks:Uint8Array[]=[];let bytes=0;
    try { while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>2000000){await reader.cancel();throw new Error('Oversized response');}chunks.push(value);} } finally {reader.releaseLock();}
    const data=new Uint8Array(bytes);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.byteLength;}
    const text = new TextDecoder().decode(data);
    const body = JSON.parse(text);
    const rows = resource==='repository'?[body]:resource==='actions'?body.workflow_runs:body;
    if (!Array.isArray(rows)) throw new Error('Invalid schema');
    const items = rows.filter((r:any)=>resource!=='issues'||!r.pull_request).slice(0,10).map((r:any)=>{
      const url = new URL(r.html_url);
      if (url.protocol!=='https:'||url.hostname!=='github.com'||!url.pathname.startsWith('/'+repo+'/')&&url.pathname!=='/'+repo) throw new Error('Unsafe source URL');
      const title = r.name ?? r.title ?? r.full_name;
      if (typeof title!=='string') throw new Error('Invalid title');
      return {title:title.slice(0,200),url:url.href,state:String(r.conclusion??r.status??r.state??'available').slice(0,40)};
    });
    return {status:'ready',source:{...source,observedAt:now.toISOString()},data:{repository:repo,resource,items}};
  } catch { return {status:'error',source,data:null,error:'invalid_response'}; }
}
