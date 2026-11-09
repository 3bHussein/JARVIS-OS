import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CloudAccounts} from '../apps/api/src/cloud-accounts.ts';
import {createCloudHandler} from '../apps/api/src/cloud-handler.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
import {CloudRedis} from '../apps/api/src/cloud-redis.ts';
const uid='11111111-1111-4111-8111-111111111111';
function fixture(){
 const values=new Map<string,string>(),ttls=new Map<string,number>(),calls:string[]=[];let gate:Promise<void>|null=null;let fail=false;
 const transport:typeof fetch=async(url,init)=>{
  const u=new URL(String(url));
  if(u.hostname!=='redis.example.test'){
   calls.push(u.pathname);if(gate)await gate;
   if(u.pathname.includes('/auth/'))return Response.json({access_token:'SYNTHETIC_ACCESS',refresh_token:'NEVER_PERSIST_REFRESH',expires_in:3600,user:{id:uid}});
   if(fail)return Response.json({error:'secret'},{status:401});
   assert.deepEqual(JSON.parse(String(init?.body)),{action:'read'});return Response.json({connected:false,records:{}});
  }
  const [op,...a]=JSON.parse(String(init?.body));let result:unknown;
  if(op==='GET')result=values.get(a[0])??null;
  else if(op==='SET'){if(a[2]==='NX'&&values.has(a[0]))result=null;else{values.set(a[0],a[1]);ttls.set(a[0],a[2]==='NX'?a[4]:a[3]);result='OK';}}
  else if(op==='DEL')result=Number(values.delete(a[0]));
  else if(op==='EVAL'){
   const [script,count,key,expected,next,ttl]=a;assert.equal(count,1);
   if(String(script).includes("'INCR'"))result=1;
   else if(String(script).includes("'DEL'")){result=values.get(key)===expected?Number(values.delete(key)):0;}
   else if((values.get(key)??'')===expected){values.set(key,next);ttls.set(key,ttl);result=1;}else result=0;
  }else throw Error('Unexpected Redis command');
  return Response.json({result});
 };
 const accounts=(session='a'.repeat(64),key='b'.repeat(64))=>new CloudAccounts(new CloudRedis('https://redis.example.test','fixture',transport),key,'synthetic',session,transport);
 return {values,ttls,calls,accounts,transport,setGate:(v:Promise<void>|null)=>gate=v,setFail:(v:boolean)=>fail=v};
}
const input={email:'fixture@example.test',password:'NEVER_PERSIST_PASSWORD'};
test('CLOUD-ACCT-01 consent, encrypted short-lived storage, instance continuity and session/provider isolation',async()=>{
 const f=fixture();await assert.rejects(f.accounts().connect('whoop',input,false),/source_consent_required/);assert.equal(f.calls.length,0);
 await f.accounts().connect('whoop',input,true);assert.equal((await f.accounts().status('whoop')).connected,true);assert.equal((await f.accounts('c'.repeat(64)).status('whoop')).connected,false);assert.equal((await f.accounts().status('progress')).connected,false);
 for(const stored of f.values.values())for(const secret of ['SYNTHETIC_ACCESS','NEVER_PERSIST_PASSWORD','NEVER_PERSIST_REFRESH','fixture@example.test'])assert.equal(stored.includes(secret),false);
 for(const ttl of f.ttls.values())assert.ok(ttl>0&&ttl<=3600);
 await assert.rejects(f.accounts('a'.repeat(64),'d'.repeat(64)).status('whoop'),/source_storage_unavailable/);
});
test('CLOUD-ACCT-02 five-minute read cache, refresh cooldown and disconnect stops access',async()=>{
 const f=fixture();await f.accounts().connect('whoop',input,true);assert.equal((await f.accounts().read('whoop','Africa/Cairo')).status,'not_linked');await f.accounts().read('whoop','Africa/Cairo',true);assert.equal(f.calls.filter(p=>p.includes('whoop-data')).length,1);
 await f.accounts().disconnect('whoop');assert.equal((await f.accounts().read('whoop','Africa/Cairo')).status,'disconnected');assert.equal((await f.accounts().status('whoop')).connected,false);
});
test('CLOUD-ACCT-03 disconnect during read discards late health result and cannot resurrect grant',async()=>{
 const f=fixture();await f.accounts().connect('whoop',input,true);let release!:()=>void;f.setGate(new Promise(r=>release=r));const pending=f.accounts().read('whoop','Africa/Cairo');while(!f.calls.some(p=>p.includes('whoop-data')))await new Promise(r=>setTimeout(r,1));await f.accounts().disconnect('whoop');release();assert.equal((await pending).status,'disconnected');assert.equal((await f.accounts().status('whoop')).connected,false);
});
test('CLOUD-ACCT-04 disconnect during connect rejects stale grant and lock coalesces concurrent reads',async()=>{
 const f=fixture();let release!:()=>void;f.setGate(new Promise(r=>release=r));const pending=f.accounts().connect('whoop',input,true);while(!f.calls.length)await new Promise(r=>setTimeout(r,1));await f.accounts().disconnect('whoop');release();await assert.rejects(pending,/source_connection_changed/);f.setGate(null);await f.accounts().connect('whoop',input,true);
 f.setGate(new Promise(r=>release=r));const first=f.accounts().read('whoop','Africa/Cairo');while(!f.calls.some(p=>p.includes('whoop-data')))await new Promise(r=>setTimeout(r,1));assert.equal((await f.accounts().read('whoop','Africa/Cairo')).status,'busy');release();await first;
});
test('CLOUD-ACCT-05 rejected upstream auth clears grant without logging out JARVIS or returning cached facts',async()=>{
 const f=fixture();await f.accounts().connect('whoop',input,true);f.setFail(true);const v=await f.accounts().read('whoop','Africa/Cairo');assert.equal(v.status,'expired');assert.equal('facts'in v?v.facts:null,null);assert.equal((await f.accounts().status('whoop')).connected,false);
});

test('CLOUD-ACCT-06 handler requires JARVIS auth, CSRF, consent and provider allowlist; logout erases grants',async()=>{
 const f=fixture(),origin='https://jarvis.example.test';
 const config={origin,endpoint:'https://redis.example.test',token:'synthetic',key:'b'.repeat(64),namespace:'synthetic',passwordHash:hashPassword('synthetic-owner-password')};
 const call=(path:string,body?:unknown,headers:Record<string,string>={})=>createCloudHandler(config,f.transport)(new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)}));
 assert.equal((await call('/api/integrations')).status,401);
 const login=await call('/api/session',{password:'synthetic-owner-password'}),v=await login.json();const headers={Cookie:login.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':v.csrf};
 const connect={...input,operation:'connect',provider:'whoop',consent:true};
 assert.equal((await call('/api/integrations',connect,{...headers,'X-CSRF-Token':''})).status,403);
 assert.equal((await call('/api/integrations',{...connect,provider:'arbitrary'},headers)).status,400);
 assert.equal((await call('/api/integrations',{...connect,consent:false},headers)).status,400);
 assert.equal((await call('/api/integrations',connect,headers)).status,200);
 const status=await(await call('/api/integrations',undefined,headers)).json();assert.equal(status.whoop.connected,true);assert.equal(JSON.stringify(status).includes('SYNTHETIC_ACCESS'),false);
 assert.equal((await call('/api/logout',{},headers)).status,200);
 assert.equal((await call('/api/whoop',undefined,headers)).status,401);
});
