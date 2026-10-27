import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {emptyData,localInstant,validateData} from '../packages/personal/src/model.ts';
import {personalBriefing} from '../packages/personal/src/briefing.ts';
import {PersonalStore} from '../apps/api/src/personal-store.ts';
const profile={name:'Synthetic owner',goal:'Strength',interests:'Russian language',sleepTarget:8,calorieTarget:2400,dayStart:'08:00',dayEnd:'22:00'};
const now=new Date('2026-10-28T09:00:00Z');
test('PERSON-01 strict profile, dates, duplicates and unknown-vs-zero validation',()=>{
  const data=validateData({profile,days:[{date:'2026-10-28',sleepHours:0,foodKcal:null,foodComplete:false,scheduleComplete:false}],notes:[]});
  assert.equal(data.days[0].sleepHours,0);assert.equal(data.days[0].foodKcal,null);
  assert.throws(()=>validateData({...data,notes:[{id:'unscheduled',text:'Workout',kind:'workout',at:null,minutes:30,done:false}]}));
  assert.throws(()=>validateData({...data,days:[{...data.days[0],date:'2026-02-30'}]}));
  assert.throws(()=>validateData({...data,days:[data.days[0],data.days[0]]}));assert.throws(()=>validateData({...data,profile:{...profile,calorieTarget:NaN}}));
});
test('PERSON-02 timezone scheduling rejects DST gaps and repeated hours',()=>{
  assert.equal(localInstant('2026-10-28T12:00','Africa/Cairo'),'2026-10-28T09:00:00.000Z');
  assert.throws(()=>localInstant('2026-11-01T01:30','America/New_York'));
  assert.throws(()=>localInstant('2026-03-08T02:30','America/New_York'));
});
test('PERSON-03 calorie arithmetic is only target minus recorded food; unknown is not zero',()=>{
  const data={profile,days:[{date:'2026-10-28',sleepHours:6,foodKcal:1400,foodComplete:false,scheduleComplete:false}],notes:[]};
  const b=personalBriefing(data,now,'Africa/Cairo','en');assert.equal(b.remaining,1000);assert.ok(b.lines.some(x=>x.includes('incomplete')));assert.ok(b.training);assert.equal(b.freeSlot,null);
  assert.equal(personalBriefing({...data,days:[]},now,'Africa/Cairo','en').remaining,null);
  const over=personalBriefing({...data,days:[{...data.days[0],foodKcal:2700}]},now,'Africa/Cairo','en');assert.equal(over.remaining,0);assert.equal(over.over,300);
});
test('PERSON-04 dated WHOOP freshness prevents old observations driving advice',()=>{
  const facts={date:'2026-10-28',sleepHours:6,sleepNeedHours:8,recovery:20,observedAt:now.toISOString(),lastSync:'2026-10-28T08:00:00Z'};
  const data={profile,days:[],notes:[]};assert.equal(personalBriefing(data,now,'Africa/Cairo','ar',facts).sleepSource,'WHOOP');
  assert.equal(personalBriefing(data,now,'Africa/Cairo','ar',{...facts,lastSync:null}).sleep,null);
  assert.equal(personalBriefing(data,now,'Africa/Cairo','en',{...facts,date:'2026-10-27'}).training,null);
  assert.equal(personalBriefing(data,new Date('2026-10-28T10:00:00Z'),'Africa/Cairo','en',facts).sleep,null);
});
test('PERSON-05 reminders are not silently discarded; free time requires explicit schedule completeness',()=>{
  const note={id:'fixture',text:'Synthetic workout',kind:'workout' as const,at:'2026-10-28T09:00:00Z',minutes:60,done:false};
  const data={profile,days:[{date:'2026-10-28',sleepHours:null,foodKcal:null,foodComplete:false,scheduleComplete:true}],notes:[note]};
  const b=personalBriefing(data,now,'Africa/Cairo','en');assert.equal(b.due.length,1);assert.equal(b.freeSlot?.at,'2026-10-28T10:00:00.000Z');assert.ok(b.reading?.includes('not proof'));
  assert.equal(personalBriefing({...data,days:[{...data.days[0],scheduleComplete:false}]},now,'Africa/Cairo','en').freeSlot,null);
});
test('VAULT-01 optional persistence is encrypted, survives restart and rejects stale revisions/wrong passwords',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'jarvis-personal-'));
  try{
    const store=new PersonalStore(directory),ctx=store.unlock('synthetic-personal-password');
    const data={...emptyData(),profile};const saved=store.save(ctx,data,0,true);assert.equal(saved.revision,1);
    const raw=await readFile(join(directory,'personal.enc.json'),'utf8');assert.ok(!raw.includes('Synthetic owner'));assert.ok(!raw.includes('synthetic-personal-password'));
    const restart=new PersonalStore(directory),restored=restart.unlock('synthetic-personal-password');assert.equal(restart.read(restored).data.profile?.name,profile.name);
    assert.equal(restart.read(restart.unlock('wrong-password')).locked,true);assert.throws(()=>store.save(ctx,data,0,true),/personal_conflict/);
    store.erase(ctx);assert.throws(()=>store.read(ctx),/reauthenticate/);
  }finally{await rm(directory,{recursive:true,force:true});}
});
test('VAULT-02 session-only edits can later be persisted without hiding a real concurrent conflict',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'jarvis-personal-cas-'));
  try{
    const store=new PersonalStore(directory),a=store.unlock('synthetic-personal-password');
    store.save(a,{...emptyData(),profile},0,true);
    store.save(a,{...emptyData(),profile:{...profile,goal:'Updated in memory'}},1,false);
    const b=store.unlock('synthetic-personal-password');
    assert.equal(store.save(a,a.state.data,2,true).revision,3);
    assert.equal(store.read(b).revision,3);
    assert.throws(()=>store.save(b,b.state.data,1,true),/personal_conflict/);
  }finally{await rm(directory,{recursive:true,force:true});}
});
