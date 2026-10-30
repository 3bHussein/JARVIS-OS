import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OllamaProvider,chatInput} from '../packages/ai/src/ollama.ts';
import {makeServer} from '../apps/api/src/server.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
import type {ModelMessage} from '../packages/ai/src/ollama.ts';
test('AI-01 fixed loopback non-streaming adapter and tool-call rejection',async()=>{
  const model=new OllamaProvider('synthetic:tiny',async(url,init)=>{assert.equal(url,'http://127.0.0.1:11434/api/chat');assert.equal(init?.redirect,'error');const body=JSON.parse(String(init?.body));assert.equal(body.stream,false);assert.equal(body.tools,undefined);assert.equal(body.options.num_predict,700);return Response.json({done:true,message:{role:'assistant',content:' Synthetic answer '}});});
  assert.equal(await model.complete([{role:'user',content:'Hello'}]),'Synthetic answer');
  assert.throws(()=>new OllamaProvider('test:cloud'));assert.throws(()=>new OllamaProvider('http://bad host'));
  const bad=new OllamaProvider('synthetic',async()=>Response.json({done:true,message:{role:'assistant',content:'Run this',tool_calls:[{}]}}));await assert.rejects(bad.complete([]),/invalid_model_response/);
});
test('AI-02 rejects invalid input, oversized responses, redirects/errors and incomplete results',async()=>{
  assert.throws(()=>chatInput({text:'x',locale:'ar',zone:'Bad/Zone',personal:true,health:false}));assert.throws(()=>chatInput({text:'x',locale:'en',zone:'Etc/UTC',personal:'yes',health:false}));
  const huge=new OllamaProvider('synthetic',async()=>new Response('x'.repeat(262145)));await assert.rejects(huge.complete([]),/too_large/);
  await assert.rejects(new OllamaProvider('synthetic',async()=>new Response(null,{status:503})).complete([]),/unavailable/);
  await assert.rejects(new OllamaProvider('synthetic',async()=>Response.json({message:{content:'unfinished'}})).complete([]),/invalid_model_response/);
});
test('AI-HTTP-01 authentication, CSRF, scope separation, follow-ups, clear and no sensitive audit strings',async()=>{
  const calls:ModelMessage[][]=[],audit:unknown[]=[],origin='http://127.0.0.1:5173';
  const server=makeServer({origin,passwordHash:hashPassword('synthetic-ai-password'),audit:e=>audit.push(e),aiProvider:{complete:async(messages)=>{calls.push(structuredClone(messages));return 'Synthetic reply';}}});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
  const login=async()=>{const r=await fetch(base+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-ai-password'})});const data=await r.json();return {Origin:origin,'Content-Type':'application/json',Cookie:r.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':data.csrf};};
  try{
    assert.equal((await fetch(base+'/api/ai')).status,401);const a=await login(),b=await login();
    const post=(path:string,body:unknown,headers=a)=>fetch(base+path,{method:'POST',headers,body:JSON.stringify(body)});
    const today=new Date().toISOString().slice(0,10);
    assert.equal((await post('/api/personal',{operation:'save',revision:0,remember:false,data:{profile:{name:'SECRET_PROFILE',goal:'Goal',interests:'Reading',sleepTarget:8,calorieTarget:2400,dayStart:'08:00',dayEnd:'22:00'},days:[{date:today,sleepHours:6,foodKcal:1200,foodComplete:false,scheduleComplete:false}],notes:[{id:'note',text:'PRIVATE_NOTE',kind:'note',at:null,minutes:30,done:false}]}})).status,200);
    const chat=(personal=false,health=false,headers=a)=>post('/api/chat',{text:'SYNTHETIC_QUESTION',locale:'en',zone:'Etc/UTC',personal,health},headers);
    assert.equal((await chat(false,false,{...a,'X-CSRF-Token':'bad'})).status,403);assert.equal(calls.length,0);
    assert.equal((await chat()).status,200);assert.ok(!JSON.stringify(calls[0]).includes('SECRET_PROFILE'));assert.ok(!JSON.stringify(calls[0]).includes('1200'));
    await chat(true,false);assert.ok(JSON.stringify(calls[1]).includes('PRIVATE_NOTE'));assert.ok(!JSON.stringify(calls[1]).includes('1200'));assert.equal(calls[1].length,2);
    await chat(false,true);assert.ok(!JSON.stringify(calls[2]).includes('PRIVATE_NOTE'));assert.ok(JSON.stringify(calls[2]).includes('1200'));assert.equal(calls[2].length,2);
    await chat(false,true);assert.equal(calls[3].length,4);
    await chat(false,false,b);assert.equal(calls[4].length,2);
    assert.equal((await post('/api/chat/clear',{})).status,200);await chat(false,true);assert.equal(calls[5].length,2);
    assert.ok(!JSON.stringify(audit).includes('SYNTHETIC_QUESTION'));assert.ok(!JSON.stringify(audit).includes('PRIVATE_NOTE'));
    assert.equal((await post('/api/tools',{})).status,403);
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
test('AI-HTTP-02 clear aborts pending work and prevents stale completion from restoring memory',async()=>{
  const origin='http://127.0.0.1:5173';let began:()=>void=()=>{},resolve:(s:string)=>void=()=>{};const started=new Promise<void>(r=>began=r);
  const server=makeServer({origin,passwordHash:hashPassword('synthetic-cancel-password'),aiProvider:{complete:async(_messages,signal)=>{began();return new Promise<string>(r=>{resolve=r;signal?.addEventListener('abort',()=>r('Aborted late reply'),{once:true});});}}});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
  try{const r=await fetch(base+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-cancel-password'})});const d=await r.json(),headers={Origin:origin,'Content-Type':'application/json',Cookie:r.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':d.csrf};
    const pending=fetch(base+'/api/chat',{method:'POST',headers,body:JSON.stringify({text:'cancel me',locale:'en',zone:'Etc/UTC',personal:false,health:false})});await started;
    const cleared=await fetch(base+'/api/chat/clear',{method:'POST',headers,body:'{}'});assert.equal(cleared.status,200);assert.equal((await pending).status,409);resolve('late');
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
