import {chooseSpeechVoice} from '../packages/voice/src/index.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {agenda,shiftDay,localDateTime,nutritionView,journalCoverage} from '../packages/personal/src/planner.ts';
import {validateData,localInstant,type PersonalData,type PersonalNote} from '../packages/personal/src/model.ts';
const note=(id:string,at:string|null,minutes=30):PersonalNote=>({id,at,minutes,kind:at?'task':'note',text:id,done:false});
const data=():PersonalData=>({profile:{name:'Synthetic',goal:'Goal',interests:'Books',sleepTarget:8,calorieTarget:2400,dayStart:'08:00',dayEnd:'22:00'},days:[{date:'2026-10-30',sleepHours:6,foodKcal:1400,foodComplete:true,scheduleComplete:true}],notes:[]});
test('PLAN-01 timezone agenda, due and overlap boundaries include cross-midnight reservations',()=>{
 const notes=[note('a','2026-10-29T21:45:00Z',60),note('b','2026-10-29T22:15:00Z'),note('c','2026-10-29T22:45:00Z'),note('float',null)];
 const p=agenda(notes,'2026-10-30','Africa/Cairo',new Date('2026-10-29T22:20:00Z'));assert.deepEqual(p.day.map(n=>n.id),['b','c']);assert.ok(p.conflicts.has('a'));assert.ok(p.conflicts.has('b'));assert.ok(!p.conflicts.has('c'));assert.equal(p.due.length,2);assert.equal(p.floating.length,1);
});
test('PLAN-02 completed entries stay visible but do not reserve/conflict or become due',()=>{
 const a={...note('a','2026-10-30T10:00:00Z'),done:true},b=note('b','2026-10-30T10:00:00Z');const p=agenda([a,b],'2026-10-30','Etc/UTC',new Date('2026-10-30T11:00:00Z'));assert.equal(p.day.length,2);assert.equal(p.conflicts.size,0);assert.deepEqual(p.due.map(n=>n.id),['b']);
});
test('PLAN-03 calendar movement and local edit roundtrip are date-specific',()=>{
 assert.equal(shiftDay('2026-03-01',-1),'2026-02-28');const instant='2026-10-30T11:15:00.000Z';assert.equal(localInstant(localDateTime(instant,'Africa/Cairo'),'Africa/Cairo'),instant);assert.throws(()=>shiftDay('2026-02-30',1));
});
test('PLAN-04 selected nutrition snapshot cannot overwrite manual data or silently use stale values',()=>{
 const original=data(),copy=JSON.stringify(original),overlay=nutritionView(original,'2026-10-30',true,{food:1500,target:2600,current:true});assert.equal(overlay.days[0].foodKcal,1500);assert.equal(overlay.days[0].sleepHours,6);assert.equal(overlay.days[0].foodComplete,false);assert.equal(overlay.profile?.calorieTarget,2600);assert.equal(JSON.stringify(original),copy);
 const stale=nutritionView(original,'2026-10-30',true,{food:1500,target:2600,current:false});assert.equal(stale.days[0].foodKcal,null);assert.equal(stale.profile?.calorieTarget,null);assert.equal(nutritionView(original,'2026-10-30',false,null),original);assert.equal(journalCoverage(original,'2026-10-30').filter(d=>d.entry).length,1);
});
test('PLAN-05 invalid note calendar/time cannot roll into a different day',()=>{
 for(const at of ['2026-02-30T10:00:00Z','2026-10-30T24:00:00Z','2026-10-30T10:60:00Z'])assert.throws(()=>validateData({...data(),notes:[note('bad',at)]}));assert.doesNotThrow(()=>validateData({...data(),notes:[note('valid','2026-10-30T10:00:00Z')]}));
});

test('VOICE-02 default/read-aloud selects reported local voices and blocks remote/unknown metadata without consent',()=>{
 const remote={name:'Remote',lang:'en-US',localService:false},local={name:'Local',lang:'en-GB',localService:true},unknown={name:'Unknown',lang:'en-US'};assert.equal(chooseSpeechVoice([remote,unknown],'','en-US'),null);assert.equal(chooseSpeechVoice([remote,local],'','en-US'),local);assert.equal(chooseSpeechVoice([remote,local],'Remote','en-US'),null);assert.equal(chooseSpeechVoice([remote],'Remote','en-US',true),remote);assert.equal(chooseSpeechVoice([local],'','ar-EG'),null);
});
