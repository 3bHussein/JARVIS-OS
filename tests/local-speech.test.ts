import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encodeWav,validateWav,maxWavBytes} from '../packages/voice/src/audio.ts';
import {speechInput,LocalSpeech,type SpeechInput} from '../apps/api/src/local-speech.ts';
import {makeServer} from '../apps/api/src/server.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
const wav=()=>encodeWav([new Float32Array(1600)],16000),input=():SpeechInput=>({audio:Buffer.from(wav()).toString('base64'),language:'ar'});
test('LOCAL-STT-01 PCM bounds, resampling, malformed headers and strict base64',()=>{
  assert.equal(validateWav(wav()),0.1);assert.equal(validateWav(encodeWav([new Float32Array(4800)],48000)),0.1);assert.equal(speechInput(input()).language,'ar');
  const corrupted=wav();corrupted[24]=0;assert.throws(()=>validateWav(corrupted));assert.throws(()=>validateWav(new Uint8Array(maxWavBytes+1)));assert.throws(()=>encodeWav([new Float32Array([NaN])],16000));assert.throws(()=>speechInput({...input(),audio:input().audio+'!'}));assert.throws(()=>speechInput({...input(),language:'../shell'}));assert.throws(()=>new LocalSpeech('python','model'));
});
test('LOCAL-STT-02 actual subprocess launch failure is normalized; pre-abort avoids spawning',async()=>{
  const engine=new LocalSpeech(process.platform==='win32'?'C:\\jarvis-missing\\python.exe':'/jarvis-missing/python',process.platform==='win32'?'C:\\jarvis-missing\\model':'/jarvis-missing/model');await assert.rejects(engine.transcribe(input(),new AbortController().signal),/unavailable/);const controller=new AbortController();controller.abort();await assert.rejects(engine.transcribe(input(),controller.signal),/cancelled/);
});
test('LOCAL-STT-HTTP-01 auth, CSRF, no unconsented upload, exclusive worker, cancellation and safe audit',async()=>{
  const origin='http://127.0.0.1:5173',audit:unknown[]=[];let started:()=>void=()=>{},finish:()=>void=()=>{};const began=new Promise<void>(r=>started=r);let calls=0;
  const server=makeServer({origin,passwordHash:hashPassword('synthetic-speech-password'),audit:e=>audit.push(e),speechProvider:{transcribe:async(value,signal)=>{calls++;assert.equal(value.language,'ar');started();await new Promise<void>(r=>{finish=r;signal.addEventListener('abort',()=>r(),{once:true});});return {text:'PRIVATE_TRANSCRIPT',final:true,language:'ar',durationSeconds:0.1,engine:'faster-whisper-local',reviewRequired:true};}}});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
  try{assert.equal((await fetch(base+'/api/speech')).status,401);const login=await fetch(base+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-speech-password'})}),d=await login.json(),headers={Origin:origin,'Content-Type':'application/json',Cookie:login.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':d.csrf};const post=(path:string,body:unknown,h=headers)=>fetch(base+path,{method:'POST',headers:h,body:JSON.stringify(body)});
    assert.equal((await post('/api/speech',input(),{...headers,'X-CSRF-Token':'bad'})).status,403);assert.equal(calls,0);assert.equal((await post('/api/speech',{audio:'bad',language:'ar'})).status,400);assert.equal(calls,0);
    const first=post('/api/speech',input());await began;assert.equal((await post('/api/speech',input())).status,429);assert.equal((await post('/api/speech/cancel',{})).status,200);assert.equal((await first).status,409);finish();assert.ok(!JSON.stringify(audit).includes('PRIVATE_TRANSCRIPT'));assert.ok(!JSON.stringify(audit).includes(input().audio));
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
