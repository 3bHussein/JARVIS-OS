import {validDate} from '../../personal/src/model.ts';
/** Projection of the existing ProgressX full backup v3. No queue replay or cloud writes. */
export interface ProgressBackup {exportedAt:string;foods:{date:string;calories:number;protein:number;carbs:number;fat:number}[];workouts:{date:string;exercise:string;day:string;status:string}[];weights:{date:string;weight:number}[];target:number|null;schedule:Record<string,string>;}
const obj=(v:unknown):Record<string,any>=>{if(!v||typeof v!=='object'||Array.isArray(v))throw Error('invalid_backup');return v as Record<string,any>;};
const short=(v:unknown,max=200)=>{if(typeof v!=='string'||v.length>max)throw Error('invalid_backup');return v;};
const num=(v:unknown,max:number)=>{if(typeof v!=='number'&&typeof v!=='string'||typeof v==='string'&&!v.trim())throw Error('invalid_backup');const n=Number(v);if(!Number.isFinite(n)||n<0||n>max)throw Error('invalid_backup');return n;};
const date=(v:unknown)=>{const d=short(v,10);if(!validDate(d))throw Error('invalid_backup');return d;};
function rows(value:unknown){if(!Array.isArray(value)||value.length>50000)throw Error('invalid_backup');const ids=new Set<string>();return value.map(v=>{const r=obj(v);if(r.id!==undefined&&r.id!==null&&String(r.id)!==''){const id=String(r.id);if(id.length>200||ids.has(id))throw Error('duplicate_backup_id');ids.add(id);}return r;});}
export function parseProgressBackup(text:string,now=new Date()):ProgressBackup {
  if(text.length>10*1024*1024)throw Error('backup_too_large');const v=obj(JSON.parse(text));
  if(v.app!=='ProgressX'||v.backup_version!==3)throw Error('unsupported_backup');
  const exportedAt=short(v.exported_at,40),stamp=Date.parse(exportedAt);
  if(!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d\d:\d\d)$/.test(exportedAt)||!Number.isFinite(stamp)||stamp>+now+60000)throw Error('invalid_export_time');
  const foods=rows(v.food_log).map(r=>({date:date(r.date),calories:num(r.calories,20000),protein:num(r.protein,5000),carbs:num(r.carbs,5000),fat:num(r.fat,5000)}));
  const workouts=rows(v.workouts).map(r=>({date:date(r.date),exercise:short(r.exercise),day:short(r.day),status:short(r.status??'')}));
  // progress_photos is the existing app's weight check-in collection. Image fields are discarded.
  const weights=rows(v.progress_photos??[]).filter(r=>r.weight!==undefined&&r.weight!==null&&String(r.weight).trim()!=='').map(r=>({date:date(r.date),weight:num(r.weight,1000)}));
  if(weights.some(r=>r.weight===0))throw Error('invalid_weight');
  const target=v.nutrition_targets?.calories===undefined?null:num(v.nutrition_targets.calories,20000);
  const schedule:Record<string,string>={};if(v.workout_schedule!==undefined){const s=obj(v.workout_schedule);for(const key of ['sun','mon','tue','wed','thu','fri','sat'])if(s[key])schedule[key]=short(s[key]);}
  return {exportedAt,foods,workouts,weights,target,schedule};
}
export function progressSummary(backup:ProgressBackup,today:string,now=new Date()){
  date(today);const foods=backup.foods.filter(r=>r.date===today),sum=(key:'calories'|'protein'|'carbs'|'fat')=>foods.reduce((total,r)=>total+r[key],0);
  const shift=(days:number)=>new Date(Date.parse(today+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
  const weight=(start:string,end:string)=>{const days=new Map<string,number[]>();for(const r of backup.weights){if(r.date<start||r.date>end)continue;days.set(r.date,[...(days.get(r.date)||[]),r.weight]);}const means=[...days.values()].map(values=>values.reduce((a,b)=>a+b,0)/values.length);return {days:means.length,mean:means.length?means.reduce((a,b)=>a+b,0)/means.length:null};};
  const current=weight(shift(-6),today),prior=weight(shift(-13),shift(-7)),food=foods.length?{calories:sum('calories'),protein:sum('protein'),carbs:sum('carbs'),fat:sum('fat')}:null;
  return {today,exportedAt:backup.exportedAt,stale:+now-Date.parse(backup.exportedAt)>86400000,food,foodEntries:foods.length,target:backup.target,remaining:food&&backup.target!==null?Math.max(0,backup.target-food.calories):null,recentWorkouts:backup.workouts.filter(r=>r.date<=today).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5),scheduledDay:backup.schedule[['sun','mon','tue','wed','thu','fri','sat'][new Date(today+'T12:00:00Z').getUTCDay()]]??null,weight:{current,prior,delta:current.days>=3&&prior.days>=3?current.mean!-prior.mean!:null},sync:'unknown' as const};
}
