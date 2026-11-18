import test from 'node:test';
import assert from 'node:assert/strict';
import {SpeechPlayback,speechChunks,type SpeechDriver,type PlaybackState} from '../packages/voice/src/playback.ts';
test('PLAYBACK-01 bounded chunks preserve Arabic, English and Unicode without splitting words when possible',()=>{
 const text=('صباح الخير يا جارفس. Today is a new day! 💪 تمرين جديد؟ ').repeat(100);
 const parts=speechChunks(text,100);assert.ok(parts.length>1);assert.ok(parts.every(p=>Array.from(p).length<=100));assert.equal(parts.join(' ').replace(/\s+/g,' ').trim(),text.trim().replace(/\s+/g,' '));assert.ok(parts.every(p=>!/[\uD800-\uDBFF]$|^[\uDC00-\uDFFF]/u.test(p)));assert.equal(speechChunks('  ').length,0);assert.throws(()=>speechChunks('x',0));assert.equal(speechChunks('x'.repeat(15000)).join('').length,12000);
});
function fixture(){const calls:{text:string;events:Parameters<SpeechDriver['speak']>[1]}[]=[];const states:PlaybackState[]=[];const failures:string[]=[];let cancels=0;const queue=new SpeechPlayback({speak:(text,events)=>calls.push({text,events}),cancel:()=>{cancels++;}},s=>states.push(s),e=>failures.push(e));return {queue,calls,states,failures,cancels:()=>cancels};}
test('PLAYBACK-02 speaks one chunk at a time, rejects duplicate events and finishes idle',()=>{
 const f=fixture();f.queue.play('x'.repeat(2500));assert.equal(f.calls.length,1);f.calls[0].events.start();assert.deepEqual(f.states.at(-1),{active:true,part:1,total:3});f.calls[0].events.end();assert.equal(f.calls.length,2);f.calls[0].events.end();f.calls[0].events.error('old');assert.equal(f.calls.length,2);assert.equal(f.failures.length,0);f.calls[1].events.end();f.calls[2].events.end();assert.equal(f.states.at(-1)?.active,false);
});
test('PLAYBACK-03 stop and replacement invalidate late start/end/error and erase queued continuation',()=>{
 const f=fixture();f.queue.play('x'.repeat(2500));const old=f.calls[0];f.queue.stop();const count=f.states.length;old.events.start();old.events.end();old.events.error('late');assert.equal(f.states.length,count);assert.equal(f.calls.length,1);assert.deepEqual(f.failures,[]);f.queue.play('replacement');old.events.end();assert.equal(f.calls.length,2);assert.equal(f.calls[1].text,'replacement');f.calls[1].events.end();assert.equal(f.states.at(-1)?.active,false);
});
test('PLAYBACK-04 engine error or synchronous exception stops pending chunks with one safe failure',()=>{
 const f=fixture();f.queue.play('x'.repeat(2500));f.calls[0].events.error('not-allowed');f.calls[0].events.end();assert.deepEqual(f.failures,['not-allowed']);assert.equal(f.calls.length,1);assert.equal(f.states.at(-1)?.active,false);const errors:string[]=[];new SpeechPlayback({cancel(){},speak(){throw Error('private engine detail');}},()=>{},code=>errors.push(code)).play('test');assert.deepEqual(errors,['synthesis-failed']);
});
