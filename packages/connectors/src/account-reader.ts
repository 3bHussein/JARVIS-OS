import {readBoundedText} from '../../../apps/api/src/bounded-body.ts';
import {clock} from '../../core/src/index.ts';
import {readWhoop,whoopFacts} from './whoop.ts';
import {progressSummary,type ProgressBackup} from './progress-backup.ts';
import {validDate} from '../../personal/src/model.ts';
export type AccountProvider='whoop'|'progress';
// Public app configuration from inspected source; never accepts a caller-supplied host/key/table.
const providers={whoop:{base:'https://jsfeybhgobmrydcfnyjg.supabase.co',key:'sb_publishable_r9VwkZmu87A1OBvoI8vZbg_B_LhDMPJ'},progress:{base:'https://cleryiplpqhrtqzryhnx.supabase.co',key:'sb_publishable_zzMo8GM_9JZ7U1uEUnDcgw_xVXn0Crm'}};
export interface AccountGrant {accessToken:string;userId:string;expiresAt:number;}
export class AccountError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
async function json(response:Response){if(!response.ok)throw new AccountError(response.status===401?'source_session_expired':response.status===429?'source_rate_limited':'source_unavailable',response.status===429?429:502);try{return JSON.parse(await readBoundedText(response,4000000));}catch{throw new AccountError('source_invalid_response',502);}}
function headers(provider:AccountProvider,token?:string){return {apikey:providers[provider].key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})};}
export async function authorizeAccount(provider:AccountProvider,input:{email?:unknown;password?:unknown;link?:unknown},transport:typeof fetch=fetch,now=Date.now()):Promise<AccountGrant>{
 const config=providers[provider];let path='/auth/v1/token?grant_type=password',payload:unknown;
 if(typeof input.link==='string'&&input.link.length>4096)throw new AccountError('invalid_signin_link');
 if(provider==='whoop'&&typeof input.link==='string'&&input.link){
  let link:URL;try{link=new URL(input.link);}catch{throw new AccountError('invalid_signin_link');}
  const token=link.searchParams.get('token');
  if(link.origin!==config.base||link.pathname!=='/auth/v1/verify'||link.username||link.password||!token||!/^[a-f0-9]{32,256}$/i.test(token)||!['magiclink','email'].includes(link.searchParams.get('type')||''))throw new AccountError('invalid_signin_link');
  path='/auth/v1/verify';payload={token_hash:token,type:'email'};
 }else{
  if(typeof input.email!=='string'||!input.email.trim()||input.email.length>254||typeof input.password!=='string'||!input.password||input.password.length>256)throw new AccountError('invalid_source_credentials');
  payload={email:input.email.trim(),password:input.password};
 }
 const response=await transport(config.base+path,{method:'POST',headers:headers(provider),body:JSON.stringify(payload),signal:AbortSignal.timeout(15000),redirect:'error',cache:'no-store'});
 if(response.status===400||response.status===401)throw new AccountError('source_signin_failed',400);
 const data=await json(response);
 if(typeof data.access_token!=='string'||!data.access_token||data.access_token.length>10000||!Number.isFinite(data.expires_in)||data.expires_in<=0||typeof data.user?.id!=='string'||!/^[a-f0-9-]{36}$/i.test(data.user.id))throw new AccountError('source_invalid_response',502);
 if(data.user.factors?.some((f:{status?:string})=>f?.status==='verified'))throw new AccountError('source_mfa_not_supported');
 // Access token only. Discard refresh token and password; reconnect after this short grant expires.
 return {accessToken:data.access_token,userId:data.user.id,expiresAt:now+Math.min(data.expires_in,3600)*1000};
}
export type LiveProgress=ReturnType<typeof progressSummary>&{source:'progressxx-cloud';observedAt:string;coverage:string[]};
const number=(v:unknown,max:number)=>{const n=typeof v==='number'?v:typeof v==='string'&&v.trim()?Number(v):NaN;if(!Number.isFinite(n)||n<0||n>max)throw new AccountError('source_invalid_response',502);return n;};
const text=(v:unknown,max=200)=>{if(typeof v!=='string'||v.length>max)throw new AccountError('source_invalid_response',502);return v;};
export async function readAccount(provider:AccountProvider,grant:AccountGrant,zone:string,transport:typeof fetch=fetch,now=new Date()){
 if(grant.expiresAt<=+now)throw new AccountError('source_session_expired',401);
 const today=clock(now,zone).date;
 if(provider==='whoop'){
  const connection={...grant,records:{},observedAt:null,lastSync:null,connected:false};
  try{await readWhoop(connection,transport,now,true);}catch(e){if(e instanceof Error&&e.message==='whoop_session_expired')throw new AccountError('source_session_expired',401);throw new AccountError('source_unavailable',502);}
  return {status:connection.connected?'connected':'not_linked',facts:connection.connected?whoopFacts(connection,zone,now):null};
 }
 const config=providers.progress;
 const query=async(table:string,params:Record<string,string>)=>{
  const url=new URL(config.base+'/rest/v1/'+table);for(const [key,value]of Object.entries({...params,user_id:'eq.'+grant.userId}))url.searchParams.set(key,value);
  const result=await json(await transport(url,{method:'GET',headers:headers('progress',grant.accessToken),signal:AbortSignal.timeout(15000),redirect:'error',cache:'no-store'}));
  if(!Array.isArray(result)||result.length>=500)throw new AccountError('source_result_limit',502);return result;
 };
 // Wide UTC window is filtered again by the configured IANA timezone. Never silently total a truncated page.
 const since=new Date(+now-48*3600000).toISOString();
 const [foods,workouts,weights,snapshots]=await Promise.all([
  query('food_entries',{select:'id,logged_at,calories,protein_g,carbs_g,fat_g',logged_at:'gte.'+since,order:'logged_at.desc,id.asc',limit:'500'}),
  query('legacy_workout_entries',{select:'source_id,original_date,exercise_name,day_name,status',original_date:'gte.'+new Date(+now-30*86400000).toISOString().slice(0,10),source_id:'like.pxlog:*',order:'original_date.desc,source_id.asc',limit:'500'}),
  query('weight_checkins',{select:'id,measured_at,weight_kg',measured_at:'gte.'+new Date(+now-15*86400000).toISOString(),order:'measured_at.desc,id.asc',limit:'500'}),
  query('user_app_snapshots',{select:'updated_at,schedule:payload->>progressx-workout-schedule-v1',limit:'1'}),
 ]);
 const stamp=(v:unknown)=>{const s=text(v,40);if(!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(s)||!Number.isFinite(Date.parse(s))||Date.parse(s)>+now+60000)throw new AccountError('source_invalid_response',502);return s;};
 const date=(v:unknown)=>{const s=text(v,10);if(!validDate(s))throw new AccountError('source_invalid_response',502);return s;};
 const unique=(rows:any[],field:string)=>{const seen=new Set();for(const row of rows){if(!row||typeof row!=='object'||typeof row[field]!=='string'||seen.has(row[field]))throw new AccountError('source_invalid_response',502);seen.add(row[field]);}return rows;};
 const schedule:Record<string,string>={};if(snapshots.length>1)throw new AccountError('source_invalid_response',502);
 if(snapshots[0]?.schedule!==null&&snapshots[0]?.schedule!==undefined){let value;try{value=JSON.parse(snapshots[0].schedule);}catch{throw new AccountError('source_invalid_response',502);}if(!value||typeof value!=='object'||Array.isArray(value))throw new AccountError('source_invalid_response',502);for(const key of ['sun','mon','tue','wed','thu','fri','sat'])if(value[key])schedule[key]=text(value[key]);}
 const backup:ProgressBackup={exportedAt:now.toISOString(),target:null,schedule,
  foods:unique(foods,'id').map(r=>({date:clock(new Date(stamp(r.logged_at)),zone).date,calories:number(r.calories,20000),protein:number(r.protein_g,5000),carbs:number(r.carbs_g,5000),fat:number(r.fat_g,5000)})),
  workouts:unique(workouts,'source_id').map(r=>({date:date(r.original_date),exercise:text(r.exercise_name),day:text(r.day_name),status:text(r.status)})),
  weights:unique(weights,'id').map(r=>{const weight=number(r.weight_kg,1000);if(!weight)throw new AccountError('source_invalid_response',502);return {date:clock(new Date(stamp(r.measured_at)),zone).date,weight};})};
 return {status:'connected',summary:{...progressSummary(backup,today,now),source:'progressxx-cloud',observedAt:now.toISOString(),coverage:['Saved food rows only; excludes pending device changes.','Workout table: last 30 days; older snapshot-only entries excluded.','Weight: last 15 days. Schedule: saved snapshot labels, not appointment times.']} satisfies LiveProgress};
}
