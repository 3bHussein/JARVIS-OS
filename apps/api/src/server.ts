import {webCsp,type WebBundle} from './web-bundle.ts';
import {speechInput,type SpeechProvider} from './local-speech.ts';
import {clock} from '../../../packages/core/src/index.ts';
import {personalBriefing,science} from '../../../packages/personal/src/briefing.ts';
import {assistantPolicy,chatInput,type AIProvider,type ModelMessage} from '../../../packages/ai/src/ollama.ts';
import { createServer, type IncomingMessage } from 'node:http';
import { Sessions, checkPassword } from './auth.ts';
import {PersonalStore,type PersonalContext} from './personal-store.ts';
import {connectWhoop,readWhoop,whoopFacts,type WhoopConnection} from '../../../packages/connectors/src/whoop.ts';
import {GitHubReader} from '../../../packages/connectors/src/github-reader.ts';
import type { Resource } from '../../../packages/connectors/src/github.ts';
import { manifests } from '../../../packages/connectors/src/contracts.ts';
import { authorizeTool, redact } from '../../../packages/core/src/index.ts';
export interface Config {origin:string;passwordHash:string;githubToken?:string;transport?:typeof fetch; audit?:(event:unknown)=>void;vaultDirectory?:string;whoopTransport?:typeof fetch;aiProvider?:AIProvider;speechProvider?:SpeechProvider;webBundle?:WebBundle;}
async function json(req:IncomingMessage,limit=8192){
  const chunks:Buffer[]=[];let bytes=0;
  for await(const chunk of req){bytes+=chunk.length;if(bytes>limit)throw new Error('Body too large');chunks.push(chunk);}
  const value=JSON.parse(Buffer.concat(chunks).toString());
  if(!value||typeof value!=='object'||Array.isArray(value)) throw new Error('Invalid body');return value;
}
export function makeServer(config:Config){
  const origin=new URL(config.origin);
  if(origin.protocol!=='http:'||!['127.0.0.1','localhost'].includes(origin.hostname))throw new Error('Local development origin required');
  const sessions=new Sessions();let attempts:number[]=[];let reads:number[]=[];
  const personalStore=new PersonalStore(config.vaultDirectory),personal=new WeakMap<object,PersonalContext>(),whoop=new WeakMap<object,WhoopConnection>();
  let whoopAttempts:number[]=[],whoopReads:number[]=[];
  const chats=new WeakMap<object,{scope:string;messages:ModelMessage[];generation:number;busy:boolean;attempts:number[];abort?:AbortController}>();
  let modelRequests=0,speechBusy=false;const speechRuns=new WeakMap<object,AbortController>(),speechAttempts=new WeakMap<object,number[]>();
  const chatFor=(session:object)=>{let state=chats.get(session);if(!state){state={scope:'',messages:[],generation:0,busy:false,attempts:[]};chats.set(session,state);}return state;};
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
      if(config.webBundle&&!path.startsWith('/api/')){
        if(method!=='GET'&&method!=='HEAD')return reply(405,{error:'method_not_allowed'});
        const asset=config.webBundle.get(path);if(!asset)return reply(404,{error:'not_found'});
        res.setHeader('Content-Type',asset.type);res.setHeader('Content-Length',asset.body.length);
        res.setHeader('Cache-Control',asset.immutable?'public, max-age=31536000, immutable':'no-store');res.setHeader('Content-Security-Policy',webCsp);
        res.setHeader('Permissions-Policy','camera=(), geolocation=(), microphone=(self)');
        res.statusCode=200;res.end(method==='HEAD'?undefined:asset.body);return;
      }
      if(method!=='GET'&&method!=='POST')return reply(405,{error:'method_not_allowed'});
      if(method==='POST'&&(req.headers.origin!==config.origin||!req.headers['content-type']?.startsWith('application/json')))return reply(403,{error:'invalid_request'});
      if(path==='/api/health'&&method==='GET')return reply(200,{ok:true,mode:config.webBundle?'local-built':'local-development',configured:Boolean(config.passwordHash)});
      if(path==='/api/session'&&method==='POST'){
        if(!config.passwordHash)return reply(503,{error:'authentication_not_configured'});
        const now=Date.now();attempts=attempts.filter(t=>now-t<60000);
        if(attempts.length>=5)return reply(429,{error:'rate_limited'});attempts.push(now);
        const body=await json(req);
        if(typeof body.password!=='string'||!checkPassword(body.password,config.passwordHash)){audit('auth.denied');return reply(401,{error:'invalid_credentials'});}
        const session=sessions.create();personal.set(sessions.get(session.token)!,personalStore.unlock(body.password));res.setHeader('Set-Cookie',`jarvis_session=${session.token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=3600`);
        audit('auth.accepted');return reply(200,{user:{id:'local-owner',role:'owner'},csrf:session.csrf});
      }
      const token=req.headers.cookie?.match(/(?:^|;\s*)jarvis_session=([a-f0-9]{64})(?:;|$)/)?.[1]||'';
      const session=sessions.get(token);
      if(!session)return reply(401,{error:'authentication_required'});
      if(method==='POST'&&req.headers['x-csrf-token']!==session.csrf)return reply(403,{error:'csrf_required'});
      if(path==='/api/session'&&method==='GET')return reply(200,{user:{id:'local-owner',role:'owner'},csrf:session.csrf});
      if(path==='/api/logout'&&method==='POST'){
        const ctx=personal.get(session);if(ctx)personalStore.forget(ctx);whoop.delete(session);chatFor(session).abort?.abort();chats.delete(session);speechRuns.get(session)?.abort();speechRuns.delete(session);sessions.revoke(token);res.setHeader('Set-Cookie','jarvis_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0');audit('auth.revoked');return reply(200,{ok:true});
      }
      if(path==='/api/personal'&&method==='GET'){
        const ctx=personal.get(session);if(!ctx)return reply(409,{error:'reauthenticate'});
        try{return reply(200,personalStore.read(ctx,url.searchParams.get('reload')==='1'));}catch{return reply(409,{error:'reauthenticate'});}
      }
      if(path==='/api/personal'&&method==='POST'){
        const ctx=personal.get(session);if(!ctx)return reply(409,{error:'reauthenticate'});
        const input=await json(req,524288);
        try{
          if(input.operation==='erase'){
            if(input.confirmation!=='DELETE PERSONAL DATA')return reply(403,{error:'confirmation_required'});
            personalStore.erase(ctx);whoop.delete(session);chatFor(session).abort?.abort();chats.delete(session);speechRuns.get(session)?.abort();speechRuns.delete(session);sessions.revoke(token);res.setHeader('Set-Cookie','jarvis_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0');audit('personal.erased');return reply(200,{ok:true,reauthenticate:true});
          }
          if(input.operation!=='save'||typeof input.remember!=='boolean')return reply(400,{error:'invalid_request'});
          const result=personalStore.save(ctx,input.data,input.revision,input.remember);audit('personal.saved',{persistent:input.remember});return reply(200,result);
        }catch(e){const code=e instanceof Error?e.message:'';return reply(['personal_conflict','personal_locked','reauthenticate'].includes(code)?409:400,{error:['personal_conflict','personal_locked','storage_unavailable','reauthenticate'].includes(code)?code:'invalid_personal_data'});}
      }
      if(path==='/api/whoop/connect'&&method==='POST'){
        const input=await json(req);if(input.consent!==true)return reply(403,{error:'health_read_consent_required'});
        whoopAttempts=whoopAttempts.filter(t=>Date.now()-t<60000);if(whoopAttempts.length>=5)return reply(429,{error:'rate_limited'});whoopAttempts.push(Date.now());
        try{
          const connection=await connectWhoop(input.email,input.password,config.whoopTransport);
          if(!sessions.get(token))return reply(401,{error:'authentication_required'});
          whoop.set(session,connection);audit('whoop.session_linked');return reply(200,{ok:true});
        }catch{return reply(400,{error:'whoop_login_failed'});}
      }
      if(path==='/api/whoop/disconnect'&&method==='POST'){whoop.delete(session);audit('whoop.session_removed');return reply(200,{ok:true});}
      if(path==='/api/whoop'&&method==='GET'){
        const connection=whoop.get(session);if(!connection)return reply(200,{status:'disconnected',facts:null});
        whoopReads=whoopReads.filter(t=>Date.now()-t<60000);if(whoopReads.length>=12)return reply(429,{error:'rate_limited'});whoopReads.push(Date.now());
        try{
          await readWhoop(connection,config.whoopTransport,new Date(),url.searchParams.get('refresh')==='1');
          if(!sessions.get(token))return reply(401,{error:'authentication_required'});
          const facts=whoopFacts(connection,url.searchParams.get('zone')||'Africa/Cairo');audit('whoop.read');return reply(200,{status:connection.connected?'ready':'not_linked',facts});
        }catch(e){const code=e instanceof Error?e.message:'';if(code==='whoop_session_expired')whoop.delete(session);return reply(200,{status:'error',error:code==='whoop_session_expired'?code:'whoop_read_failed',facts:null});}
      }
      if(path==='/api/speech'&&method==='GET')return reply(200,{configured:Boolean(config.speechProvider),engine:config.speechProvider?'faster-whisper-local':null,maxSeconds:30,streaming:false});
      if(path==='/api/speech/cancel'&&method==='POST'){speechRuns.get(session)?.abort();return reply(200,{ok:true});}
      if(path==='/api/speech'&&method==='POST'){
        if(!config.speechProvider)return reply(503,{error:'speech_not_configured'});
        const input=speechInput(await json(req,1300000));
        const attempts=(speechAttempts.get(session)||[]).filter(t=>Date.now()-t<60000);
        if(speechBusy||attempts.length>=3)return reply(429,{error:'speech_busy_or_rate_limited'});
        attempts.push(Date.now());speechAttempts.set(session,attempts);
        const controller=new AbortController();speechRuns.set(session,controller);speechBusy=true;
        const closed=()=>controller.abort();res.once('close',closed);
        try{
          const result=await config.speechProvider.transcribe(input,controller.signal);
          if(!sessions.get(token))return reply(401,{error:'authentication_required'});
          if(controller.signal.aborted)return reply(409,{error:'speech_cancelled'});
          audit('speech.completed',{empty:!result.text});return reply(200,result);
        }catch{audit('speech.failed');return reply(502,{error:'local_transcription_failed'});}
        finally{res.off('close',closed);speechRuns.delete(session);speechBusy=false;}
      }
      if(path==='/api/ai'&&method==='GET')return reply(200,{configured:Boolean(config.aiProvider),provider:config.aiProvider?'ollama-local':null,tools:false});
      if(path==='/api/chat/clear'&&method==='POST'){
        const state=chatFor(session);state.generation++;state.abort?.abort();state.messages=[];audit('chat.cleared');return reply(200,{ok:true});
      }
      if(path==='/api/chat'&&method==='POST'){
        if(!config.aiProvider)return reply(503,{error:'ai_not_configured'});
        const input=chatInput(await json(req)),state=chatFor(session),stamp=Date.now();
        state.attempts=state.attempts.filter(t=>stamp-t<60000);
        if(state.busy||modelRequests>=2||state.attempts.length>=6)return reply(429,{error:'chat_busy_or_rate_limited'});
        const scope=JSON.stringify([input.personal,input.health,input.locale,input.zone]);
        if(state.scope!==scope){state.messages=[];state.scope=scope;state.generation++;}
        const generation=state.generation,now=new Date(),context:Record<string,unknown>={clock:clock(now,input.zone,input.locale),zone:input.zone};
        const sources:{id:string;observedAt:string;description:string}[]=[];
        if(input.personal||input.health){
          const ctx=personal.get(session);if(!ctx)return reply(409,{error:'reauthenticate'});
          const view=personalStore.read(ctx);if(view.locked)return reply(409,{error:'personal_locked'});
          const data=view.data;
          if(input.personal){context.profile=data.profile?{name:data.profile.name,goal:data.profile.goal,interests:data.profile.interests}:null;context.notes=data.notes.filter(n=>!n.done).slice(-30);sources.push({id:'personal',observedAt:now.toISOString(),description:'Owner-entered profile and up to 30 open notes; current session view, not cloud sync.'});}
          if(input.health){
            const connection=whoop.get(session),facts=connection&&connection.expiresAt>+now?whoopFacts(connection,input.zone):null;
            const b=personalBriefing({...data,notes:[]},now,input.zone,input.locale,facts);
            context.health={sleep:b.sleep,sleepSource:b.sleepSource,sleepTarget:b.sleepTarget,sleepTargetSource:b.sleepTargetSource,food:b.food,target:b.target,remaining:b.remaining,foodComplete:b.foodComplete,training:b.training,whoopCurrent:b.whoopCurrent,whoopObservedAt:facts?.observedAt??null,whoopLastSync:facts?.lastSync??null,science};
            sources.push({id:'health',observedAt:now.toISOString(),description:'Labelled manual check-in and only already-read WHOOP sleep when current; no new provider fetch.'});
          }
        }
        const controller=new AbortController();state.abort=controller;state.busy=true;state.attempts.push(stamp);modelRequests++;
        const closed=()=>controller.abort();res.once('close',closed);
        try{
          const answer=await config.aiProvider.complete([{role:'system',content:assistantPolicy+`\nRequested language: ${input.locale}.\nCONTEXT DATA: `+JSON.stringify(context)},...state.messages,{role:'user',content:input.text}],controller.signal);
          if(!sessions.get(token))return reply(401,{error:'authentication_required'});
          if(generation!==state.generation||controller.signal.aborted)return reply(409,{error:'chat_cancelled'});
          state.messages=[...state.messages,{role:'user' as const,content:input.text},{role:'assistant' as const,content:answer}].slice(-8);
          audit('chat.completed',{personal:input.personal,health:input.health});return reply(200,{answer,provider:'ollama-local',sources,generatedAt:new Date().toISOString(),verified:false});
        }catch{audit('chat.failed');return reply(502,{error:controller.signal.aborted?'chat_cancelled':'local_model_failed'});}
        finally{res.off('close',closed);state.busy=false;state.abort=undefined;modelRequests--;}
      }
      if(path==='/api/connectors'&&method==='GET')return reply(200,{connectors:manifests.map(m=>({...m,...(m.id==='github'?readerFor(session).status():m.id==='whoop'&&whoop.get(session)&&whoop.get(session)!.expiresAt>Date.now()?{status:whoop.get(session)!.observedAt?(whoop.get(session)!.connected?'ready':'disconnected'):'configured',lastSuccessfulSync:whoop.get(session)!.observedAt,freshness:whoop.get(session)!.observedAt&&Date.now()-Date.parse(whoop.get(session)!.observedAt!)<=900000?'current':'unavailable',lastError:null}:{status:m.domain==='corporate'?'blocked':'disconnected',lastSuccessfulSync:null,freshness:'unavailable',lastError:null})}))});
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
