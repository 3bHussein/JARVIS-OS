import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseProgressBackup,progressSummary} from '../packages/connectors/src/progress-backup.ts';
const now=new Date('2026-10-28T12:00:00Z');
const fixture=()=>({app:'ProgressX',backup_version:3,exported_at:now.toISOString(),food_log:[{id:'f',date:'2026-10-28',calories:'1400',protein:100,carbs:150,fat:44}],nutrition_targets:{calories:2400},workouts:[{id:'w',date:'2026-10-27',exercise:'Squat',day:'Lower',status:'Completed',notes:'DO_NOT_RETAIN'}],progress_photos:[{id:'p',date:'2026-10-28',weight:80,image:'DO_NOT_RETAIN'}],workout_schedule:{wed:'Upper'}});
test('PROGRESS-01 v3 file projection, real arithmetic, schedule labels and no sensitive extras',()=>{
  const b=parseProgressBackup(JSON.stringify(fixture()),now),s=progressSummary(b,'2026-10-28',now);assert.equal(s.remaining,1000);assert.equal(s.food?.protein,100);assert.equal(s.scheduledDay,'Upper');assert.equal(s.sync,'unknown');assert.equal(s.stale,false);assert.ok(!JSON.stringify(b).includes('DO_NOT_RETAIN'));assert.equal(s.weight.delta,null);
});
test('PROGRESS-02 unknown versus zero, incomplete/duplicate/unsupported records fail closed',()=>{
  const f=fixture();f.food_log=[];assert.equal(progressSummary(parseProgressBackup(JSON.stringify(f),now),'2026-10-28',now).food,null);
  f.food_log=[{id:'f',date:'2026-10-28',calories:'0',protein:0,carbs:0,fat:0}];assert.equal(progressSummary(parseProgressBackup(JSON.stringify(f),now),'2026-10-28',now).food?.calories,0);
  const bad:any=fixture();bad.food_log[0].calories='';assert.throws(()=>parseProgressBackup(JSON.stringify(bad),now));bad.food_log=fixture().food_log;delete bad.food_log[0].protein;assert.throws(()=>parseProgressBackup(JSON.stringify(bad),now));
  const duplicate=fixture();duplicate.workouts.push(duplicate.workouts[0]);assert.throws(()=>parseProgressBackup(JSON.stringify(duplicate),now),/duplicate/);
  assert.throws(()=>parseProgressBackup(JSON.stringify({...fixture(),backup_version:2}),now),/unsupported/);
  assert.throws(()=>parseProgressBackup(JSON.stringify({...fixture(),exported_at:'2027-01-01T00:00:00Z'}),now),/export_time/);
});
test('PROGRESS-03 equal weighting per measured day, future exclusion and explicit stale snapshot',()=>{
  const f=fixture();f.exported_at='2026-10-20T00:00:00Z';f.progress_photos=[{id:'a',date:'2026-10-28',weight:80,image:''},{id:'b',date:'2026-10-28',weight:82,image:''},{id:'c',date:'2026-10-27',weight:77,image:''},{id:'d',date:'2027-01-01',weight:500,image:''}];const s=progressSummary(parseProgressBackup(JSON.stringify(f),now),'2026-10-28',now);assert.equal(s.weight.current.mean,79);assert.equal(s.weight.current.days,2);assert.equal(s.stale,true);
});
