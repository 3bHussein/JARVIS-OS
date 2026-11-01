import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dueReminders,reminderGraceMs} from '../packages/personal/src/reminders.ts';
import {WelcomeGate} from '../packages/voice/src/welcome.ts';
import type {PersonalNote} from '../packages/personal/src/model.ts';
const start=Date.parse('2026-11-01T10:00:00Z');
const note=(id:string,delta:number):PersonalNote=>({id,text:'Synthetic reminder',kind:'task',at:new Date(start+delta).toISOString(),minutes:30,done:false});
test('REMIND-01 explicit arming, grace boundary, completion and once-per-occurrence delivery',()=>{
 const notes=[note('old',-1),note('due',1000),note('later',5000),{...note('done',1000),done:true},{...note('floating',0),at:null}];
 const first=dueReminders(notes,start+2000,start,new Set());assert.deepEqual(first.map(x=>x.note.id),['due']);const delivered=new Set(first.map(x=>x.key));assert.deepEqual(dueReminders(notes,start+6000,start,delivered).map(x=>x.note.id),['later']);
 assert.equal(dueReminders([note('boundary',0)],start+reminderGraceMs,start,new Set()).length,1);assert.equal(dueReminders([note('late',0)],start+reminderGraceMs+1,start,new Set()).length,0);assert.equal(dueReminders(notes,start,start+1,new Set()).length,0);
 const rescheduled={...notes[1],at:new Date(start+3000).toISOString()};assert.equal(dueReminders([rescheduled],start+4000,start,delivered).length,1);
});
test('WELCOME-01 ready/visible/device-voice gate fires once and does not interrupt interaction',()=>{
 const g=new WelcomeGate(),base={epoch:1,authenticated:true,quiet:false,ready:true,overview:true,visible:true,hasVoice:true,interacting:false};
 for(const patch of [{ready:false},{overview:false},{visible:false},{hasVoice:false}])assert.equal(g.decide({...base,...patch}),'wait');assert.equal(g.decide(base),'speak');assert.equal(g.decide(base),'skip');assert.equal(g.decide({...base,epoch:2}),'speak');
});
test('WELCOME-02 quiet and explicit speech consume the session; locked sessions never greet',()=>{
 const g=new WelcomeGate(),base={epoch:1,authenticated:true,quiet:true,ready:true,overview:true,visible:true,hasVoice:true,interacting:false};assert.equal(g.decide(base),'skip');assert.equal(g.decide({...base,quiet:false}),'skip');g.consume(2);assert.equal(g.decide({...base,epoch:2,quiet:false}),'skip');assert.equal(g.decide({...base,epoch:3,quiet:false,authenticated:false}),'skip');assert.equal(g.decide({...base,epoch:3,quiet:false}),'speak');assert.equal(g.decide({...base,epoch:4,quiet:false,interacting:true}),'skip');assert.equal(g.decide({...base,epoch:4,quiet:false}),'skip');
});
