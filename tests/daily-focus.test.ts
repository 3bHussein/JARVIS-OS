import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyFocus} from '../packages/personal/src/daily-focus.ts';
import {emptyData,type PersonalData} from '../packages/personal/src/model.ts';
const now=new Date('2026-11-09T12:00:00Z'),profile={name:'Synthetic',goal:'',interests:'',sleepTarget:8,calorieTarget:2400,dayStart:'08:00',dayEnd:'22:00'};
const known={sleep:6,sleepSource:'WHOOP',food:0,foodSource:'manual' as const};
function note(id:string,at:string|null,done=false){return {id,text:'Synthetic '+id,at,done,kind:at?'task' as const:'note' as const,minutes:30};}
function data():PersonalData{return {...emptyData(),profile};}
test('FOCUS-01 missing inputs are unknown; explicit zero remains known and no hidden mutation',()=>{
 const d=data(),before=structuredClone(d);const v=dailyFocus(d,now,'Africa/Cairo','en',{...known,sleep:null,food:null,foodSource:'cloud'});assert.deepEqual(v.items.map(i=>i.id),['sleep','food']);assert.equal(v.items[1].pane,'connections');assert.equal(v.gaps.length,2);assert.match(v.sources,/cloud.*unavailable/);assert.deepEqual(d,before);
 const zero=dailyFocus(d,now,'Africa/Cairo','en',known);assert.equal(zero.gaps.length,0);assert.equal(zero.items[0].id,'review');assert.match(zero.items[0].detail,/incomplete/);
});
test('FOCUS-02 real today commitments and overlap win; excludes completed and next-day appointments, caps three',()=>{
 const d=data();d.notes=[note('next','2026-11-09T13:00:00Z'),note('overlap','2026-11-09T13:15:00Z'),note('old','2026-11-08T12:00:00Z'),note('done','2026-11-09T12:30:00Z',true),note('tomorrow','2026-11-10T12:00:00Z')];
 const v=dailyFocus(d,now,'Africa/Cairo','en',{...known,sleep:null,food:null});assert.deepEqual(v.items.map(i=>i.id),['conflicts','next','due']);assert.match(v.items[1].detail,/15:00.*Synthetic next/);assert.equal(v.gaps.length,2);
 d.notes=d.notes.filter(n=>n.id==='tomorrow'||n.done);assert.equal(dailyFocus(d,now,'Africa/Cairo','en',known).items.some(i=>i.id==='next'),false);
});
test('FOCUS-03 untimed notes are never appointments; Arabic labels and absent profile are honest',()=>{
 const d=data();d.notes=[note('untimed',null)];const v=dailyFocus(d,now,'Africa/Cairo','ar',known);assert.equal(v.items[0].id,'notes');assert.match(v.items[0].detail,/مش مواعيد/);assert.match(v.sources,/الإدخالات المسجّلة فقط/);assert.equal(dailyFocus(emptyData(),now,'Africa/Cairo','en',known).items.length,0);
});
