import type {AIProvider,ModelMessage} from './ollama.ts';
import {readBoundedText} from '../../../apps/api/src/bounded-body.ts';
export class GatewayError extends Error {status:number;constructor(code:string,status=502){super(code);this.status=status;}}
/** Fixed Gateway host; no browser keys, tools, redirects, retries or implicit provider fallback. */
export class GatewayProvider implements AIProvider {
 private key:string;readonly model:string;private transport:typeof fetch;
 constructor(model:string,key:string,transport:typeof fetch=fetch){
  if(!/^[a-z0-9-]+\/[a-zA-Z0-9._:-]{1,100}$/.test(model)||!key||key.length>12000)throw Error('invalid_gateway_configuration');
  this.model=model;this.key=key;this.transport=transport;
 }
 async complete(messages:ModelMessage[],signal?:AbortSignal){
  let response:Response;
  try{response=await this.transport('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',redirect:'error',cache:'no-store',signal:AbortSignal.any([AbortSignal.timeout(20000),...(signal?[signal]:[])]),headers:{Authorization:'Bearer '+this.key,'Content-Type':'application/json'},body:JSON.stringify({model:this.model,messages,stream:false,max_tokens:700})});}catch{throw new GatewayError('ai_connection_failed');}
  if(!response.ok)throw new GatewayError(response.status===401?'ai_credentials_required':response.status===402?'ai_budget_unavailable':response.status===403?'ai_account_action_required':response.status===429?'ai_rate_limited':'ai_provider_unavailable',response.status===429?429:503);
  try{const value=JSON.parse(await readBoundedText(response,262144));const choice=value.choices?.[0],message=choice?.message;
   if(choice?.finish_reason!=='stop'||message?.role!=='assistant'||message.tool_calls?.length||typeof message.content!=='string'||!message.content.trim()||message.content.length>12000)throw Error();
   return message.content.trim();
  }catch{throw new GatewayError('ai_invalid_response');}
 }
}
