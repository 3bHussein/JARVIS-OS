import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCloudHandler} from '../apps/api/src/cloud-handler.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
import type {AIProvider,ModelMessage} from '../packages/ai/src/ollama.ts';
function fixture(provider?:AIProvider){const values=new Map<string,string>(),counts=new Map<string,number>();const transport:typeof fetch=async(_url,init)=>{const [op,...a]=JSON.parse(String(init?.body));let result:unknown=null;if(op==='GET')result=values.get(a[0])??null;else if(op==='SET'){if(a[2]==='NX'&&values.has(a[0]))result=null;else{values.set(a[0],a[1]);result='OK';}}else if(op==='DEL')result=Number(values.delete(a[0]));else if(op==='EVAL'){const [script,,key,expected]=a;if(script.includes("'INCR'")){const n=(counts.get(key)||0)+1;counts.set(key,n);result=n;}else if(script.includes("'DEL'"))result=values.get(key)===expected?Number(values.delete(key)):0;else throw Error('Unexpected script');}return Response.json({result});};
 const origin='https://jarvis.example.test',config={origin,endpoint:'https://redis.example.test',token:'fixture',key:'a'.repeat(64),namespace:'fixture',passwordHash:hashPassword('synthetic-password'),aiProvider:provider,aiModel:'fixture/model'};
 const call=(path:string,headers:Record<string,string>={},body?:unknown)=>createCloudHandler(config,transport)(new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)}));
 return {values,counts,call,async login(){const r=await call('/api/session',{}, {password:'synthetic-password'});return {Cookie:r.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':(await r.json()).csrf};}};
}
const input={text:'Synthetic question',locale:'ar',zone:'Africa/Cairo',personal:false,health:false,consent:true};
test('CLOUD-AI-01 authenticated CSRF/explicit-consent text-only gateway, no implicit context/history',async()=>{
 let calls=0,received:ModelMessage[]=[];const f=fixture({async complete(m){calls++;received=m;return 'Synthetic cloud reply';}}),headers=await f.login();
 assert.equal((await f.call('/api/chat',{},input)).status,401);assert.equal((await f.call('/api/chat',{...headers,'X-CSRF-Token':''},input)).status,403);assert.equal((await f.call('/api/chat',headers,{...input,consent:false})).status,400);assert.equal((await f.call('/api/chat',headers,{...input,health:true})).status,400);assert.equal(calls,0);
 const result=await f.call('/api/chat',headers,input);assert.equal(result.status,200);assert.equal((await result.json()).answer,'Synthetic cloud reply');assert.equal(received.length,2);assert.match(received[0].content,/stateless/);assert.match(received[0].content,/Requested language: ar/);assert.equal(received[1].content,input.text);assert.equal(calls,1);
 const status=await (await f.call('/api/ai',headers)).json();assert.equal(status.configured,true);assert.equal(status.context,false);assert.equal(status.tools,false);assert.equal(status.history,false);
 f.counts.set('jarvis:fixture:ai:daily',50);assert.equal((await f.call('/api/chat',headers,input)).status,429);assert.equal(calls,1);
});
test('CLOUD-AI-02 unconfigured is explicit and revoked sessions cannot receive an in-flight result',async()=>{
 const absent=fixture(),headers=await absent.login();assert.equal((await absent.call('/api/chat',headers,input)).status,503);
 let release!:()=>void,started!:()=>void;const gate=new Promise<void>(r=>release=r),began=new Promise<void>(r=>started=r);const f=fixture({async complete(){started();await gate;return 'MUST_NOT_RETURN';}}),auth=await f.login();const pending=f.call('/api/chat',auth,input);await began;for(const key of f.values.keys())if(key.includes(':session:'))f.values.delete(key);release();const result=await pending;assert.equal(result.status,401);assert.equal((await result.text()).includes('MUST_NOT_RETURN'),false);
});
