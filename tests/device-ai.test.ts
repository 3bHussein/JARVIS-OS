import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DeviceModel,type DeviceEngine} from '../packages/ai/src/browser.ts';
test('DEVICE-01 no implicit load, explicit progress and stateless generation bounds',async()=>{
 let loads=0,stops=0;const seen:string[]=[];const model=new DeviceModel();assert.equal(loads,0);await assert.rejects(model.ask('hello','en'),/not_ready/);
 const engine:DeviceEngine={stop(){stops++;},async generate(text,lang){seen.push(text+':'+lang);return ' Synthetic answer ';}};const progress:number[]=[];
 await model.load(async(_signal,onProgress)=>{loads++;onProgress(2);return engine;},v=>progress.push(v));assert.equal(loads,1);assert.deepEqual(progress,[1]);assert.equal(await model.ask(' hello ','ar'),'Synthetic answer');assert.deepEqual(seen,['hello:ar']);await assert.rejects(model.ask('x'.repeat(2001),'en'),/invalid_input/);model.clear();assert.equal(stops,1);await assert.rejects(model.ask('hello','en'),/not_ready/);
});
test('DEVICE-02 stop rejects late initialization and destroys returned engine',async()=>{
 const model=new DeviceModel();let release!:(engine:DeviceEngine)=>void,stops=0,aborted=false;const pending=model.load(signal=>{signal.addEventListener('abort',()=>aborted=true);return new Promise(r=>release=r);},()=>{});model.clear();release({stop(){stops++;},generate:async()=>''});await assert.rejects(pending,/cancelled/);assert.equal(aborted,true);assert.equal(stops,1);
});
test('DEVICE-03 clear prevents late reply, concurrent prompts are rejected and answer shape is bounded',async()=>{
 const model=new DeviceModel();let release!:(v:string)=>void,stops=0;await model.load(async()=>({stop(){stops++;},generate:()=>new Promise(r=>release=r)}),()=>{});const answer=model.ask('hello','en');await assert.rejects(model.ask('again','en'),/not_ready/);model.clear();release('PRIVATE_LATE_REPLY');await assert.rejects(answer,/cancelled/);assert.equal(stops,1);
 await model.load(async()=>({stop(){},generate:async()=> 'x'.repeat(12001)}),()=>{});await assert.rejects(model.ask('hello','en'),/invalid_answer/);model.clear();
});
