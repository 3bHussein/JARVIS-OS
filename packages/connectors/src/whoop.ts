import {clock} from '../../core/src/index.ts';
import type {WhoopFacts} from '../../personal/src/briefing.ts';
// Public project configuration already shipped by WHOOP Intelligence; not a service secret.
const base='https://jsfeybhgobmrydcfnyjg.supabase.co';
const apiKey='sb_publishable_r9VwkZmu87A1OBvoI8vZbg_B_LhDMPJ';
async function body(response:Response){if(!response.body)throw Error('invalid_response');const reader=response.body.getReader();let bytes=0;const chunks:Uint8Array[]=[];try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4000000){await reader.cancel();throw Error('response_too_large');}chunks.push(value);}}finally{reader.releaseLock();}const all=new Uint8Array(bytes);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}return JSON.parse(new TextDecoder().decode(all));}
export interface WhoopConnection {accessToken:string;expiresAt:number;records:Record<string,any[]>;observedAt:string|null;lastSync:string|null;connected:boolean;}
export async function connectWhoop(email:string,password:string,transport:typeof fetch=fetch,now=new Date()):Promise<WhoopConnection>{
  if(typeof email!=='string'||!email||email.length>254||typeof password!=='string'||!password||password.length>256)throw Error('invalid_credentials');
  const response=await transport(base+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:apiKey,'Content-Type':'application/json'},body:JSON.stringify({email,password}),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!response.ok)throw Error(response.status===429?'rate_limited':'whoop_login_failed');const v=await body(response);
  if(Array.isArray(v.user?.factors)&&v.user.factors.some((f:any)=>f?.status==='verified'))throw Error('mfa_not_supported');
  if(typeof v.access_token!=='string'||v.access_token.length>10000||!Number.isFinite(v.expires_in)||v.expires_in<=0)throw Error('invalid_response');
  return {accessToken:v.access_token,expiresAt:+now+Math.min(v.expires_in,3600)*1000,records:{},observedAt:null,lastSync:null,connected:false};
}
export async function readWhoop(connection:WhoopConnection,transport:typeof fetch=fetch,now=new Date(),force=false){
  if(connection.expiresAt<=+now)throw Error('whoop_session_expired');
  if(!force&&connection.observedAt&&+now-Date.parse(connection.observedAt)<300000)return;
  connection.records={};connection.observedAt=null;connection.connected=false;
  const response=await transport(base+'/functions/v1/whoop-data',{method:'POST',headers:{apikey:apiKey,Authorization:'Bearer '+connection.accessToken,'Content-Type':'application/json'},body:JSON.stringify({action:'read'}),signal:AbortSignal.timeout(15000),redirect:'error'});
  if(!response.ok){connection.records={};connection.observedAt=null;throw Error(response.status===401?'whoop_session_expired':'whoop_read_failed');}
  const v=await body(response);if(typeof v.connected!=='boolean'||!v.records||typeof v.records!=='object'||Array.isArray(v.records))throw Error('invalid_response');
  const records:Record<string,any[]>={};for(const k of ['sleep','recovery','cycle','workout']){if(v.records[k]!==undefined&&!Array.isArray(v.records[k]))throw Error('invalid_response');if((v.records[k]||[]).length>5000)throw Error('response_too_large');records[k]=v.records[k]||[];}
  connection.records=records;connection.connected=v.connected;connection.observedAt=now.toISOString();
  connection.lastSync=Array.isArray(v.sync_history)?v.sync_history.filter((s:any)=>s.status==='complete'&&typeof s.finished_at==='string'&&Number.isFinite(Date.parse(s.finished_at))&&Date.parse(s.finished_at)<=+now).sort((a:any,b:any)=>Date.parse(b.finished_at)-Date.parse(a.finished_at))[0]?.finished_at??null:null;
}
const validStamp=(v:unknown):v is string=>typeof v==='string'&&v.length<=40&&/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));
function latest(rows:any[],field:string){const map=new Map<string,any>();for(const row of rows){if(!row||typeof row!=='object'||Array.isArray(row))continue;const id=row[field];if(!(typeof id==='string'&&id.length>0&&id.length<=200||typeof id==='number'&&Number.isSafeInteger(id)))continue;const previous=map.get(String(id));if(!previous||(Date.parse(row.updated_at)||0)>=(Date.parse(previous.updated_at)||0))map.set(String(id),row);}return [...map.values()];}
const num=(v:unknown,max:number):number|null=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=max?v:null;
export function whoopFacts(connection:WhoopConnection,zone:string,now=new Date()):WhoopFacts {
  const date=clock(now,zone).date;
  const sleep=latest(connection.records.sleep||[],'id').filter(s=>s&&s.nap===false&&s.score_state==='SCORED'&&validStamp(s.start)&&validStamp(s.end)&&Date.parse(s.end)<=+now&&Date.parse(s.end)>Date.parse(s.start)&&Date.parse(s.end)-Date.parse(s.start)<=86400000&&clock(new Date(s.end),zone).date===date).sort((a,b)=>Date.parse(b.end)-Date.parse(a.end)||Date.parse(b.updated_at)-Date.parse(a.updated_at))[0];
  const stage=sleep?.score?.stage_summary,values=stage?[stage.total_light_sleep_time_milli,stage.total_slow_wave_sleep_time_milli,stage.total_rem_sleep_time_milli]:[];
  const asleep=values.length===3&&values.every(x=>num(x,86400000)!==null)?values.reduce((a,b)=>a+b,0):null;
  const sleepHours=asleep!==null&&asleep<=Date.parse(sleep.end)-Date.parse(sleep.start)+60000?asleep/3600000:null;
  const need=sleep?.score?.sleep_needed,parts=need?[need.baseline_milli,need.need_from_sleep_debt_milli,need.need_from_recent_strain_milli,need.need_from_recent_nap_milli]:[];
  const needMs=parts.length===4&&parts.every(x=>typeof x==='number'&&Number.isFinite(x))&&parts[0]>=0&&parts[1]>=0&&parts[2]>=0&&parts[3]<=0?parts.reduce((a,b)=>a+b,0):null;
  const recovery=latest(connection.records.recovery||[],'cycle_id').filter(r=>sleep&&r?.sleep_id===sleep.id&&r.score_state==='SCORED').sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at))[0];
  // Current physiological cycle is explicit: never substitute a completed/prior cycle.
  const cycle=latest(connection.records.cycle||[],'id').filter(c=>c.score_state==='SCORED'&&validStamp(c.start)&&Date.parse(c.start)<=+now&&+now-Date.parse(c.start)<=72*3600000&&c.end==null).sort((a,b)=>Date.parse(b.start)-Date.parse(a.start))[0];
  const workouts=latest(connection.records.workout||[],'id').filter(w=>w.score_state==='SCORED'&&validStamp(w.start)&&validStamp(w.end)&&Date.parse(w.end)<=+now&&Date.parse(w.end)>Date.parse(w.start)&&Date.parse(w.end)-Date.parse(w.start)<=86400000&&clock(new Date(w.start),zone).date===date).sort((a,b)=>Date.parse(b.start)-Date.parse(a.start)).slice(0,20).map(w=>({start:w.start,end:w.end,minutes:(Date.parse(w.end)-Date.parse(w.start))/60000,name:typeof w.sport_name==='string'&&w.sport_name.length<=100?w.sport_name:null,strain:num(w.score?.strain,21)}));
  const positive=(v:unknown,max:number)=>{const n=num(v,max);return n!==null&&n>0?n:null;};
  const energy=num(cycle?.score?.kilojoule,1000000);
  const details={hrv:num(recovery?.score?.hrv_rmssd_milli,1000),rhr:positive(recovery?.score?.resting_heart_rate,300),sleepPerformance:num(sleep?.score?.sleep_performance_percentage,100),sleepEfficiency:num(sleep?.score?.sleep_efficiency_percentage,100),calibrating:typeof recovery?.score?.user_calibrating==='boolean'?recovery.score.user_calibrating:null,sleepStart:sleep?.start??null,sleepEnd:sleep?.end??null,cycle:cycle?{start:cycle.start,updatedAt:validStamp(cycle.updated_at)&&Date.parse(cycle.updated_at)<=+now?cycle.updated_at:null,strain:num(cycle.score?.strain,21),energyKcal:energy===null?null:energy/4.184,steps:Number.isSafeInteger(cycle.step_count)&&cycle.step_count>=0?cycle.step_count:null}:null,workouts};
  return {date,details,sleepHours,sleepNeedHours:needMs!==null&&needMs>0&&needMs<=86400000?needMs/3600000:null,recovery:num(recovery?.score?.recovery_score,100),observedAt:connection.observedAt,lastSync:connection.lastSync};
}
