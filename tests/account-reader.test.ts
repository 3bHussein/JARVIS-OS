import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AccountError,authorizeAccount,readAccount} from '../packages/connectors/src/account-reader.ts';
const userId='11111111-1111-4111-8111-111111111111',now=new Date('2026-11-09T12:00:00Z');
const grant={userId,accessToken:'SYNTHETIC_ACCESS',expiresAt:+now+3600000};
const signin={email:'fixture@example.test',password:'synthetic-app-password'};
test('ACCT-01 fixed auth host, no redirect, capped grant, no refresh/password returned; rejects MFA',async()=>{
 let mfa=false;
 const transport:typeof fetch=async(url,init)=>{assert.equal(String(url),'https://cleryiplpqhrtqzryhnx.supabase.co/auth/v1/token?grant_type=password');assert.equal(init?.redirect,'error');assert.deepEqual(JSON.parse(String(init?.body)),signin);return Response.json({access_token:'SYNTHETIC_ACCESS',refresh_token:'NEVER_KEEP_REFRESH',expires_in:7200,user:{id:userId,factors:mfa?[{status:'verified'}]:[]}});};
 assert.deepEqual(await authorizeAccount('progress',signin,transport,+now),grant);
 mfa=true;await assert.rejects(authorizeAccount('progress',signin,transport,+now),/source_mfa_not_supported/);
});
test('ACCT-02 WHOOP existing email link verifies only token hash with fixed app, no redirect/email dispatch',async()=>{
 let calls=0;const transport:typeof fetch=async(url,init)=>{calls++;assert.equal(String(url),'https://jsfeybhgobmrydcfnyjg.supabase.co/auth/v1/verify');assert.deepEqual(JSON.parse(String(init?.body)),{token_hash:'a'.repeat(64),type:'email'});return Response.json({access_token:grant.accessToken,expires_in:3600,user:{id:userId}});};
 const link='https://jsfeybhgobmrydcfnyjg.supabase.co/auth/v1/verify?token='+ 'a'.repeat(64)+'&type=magiclink&redirect_to=https://invalid.example';
 assert.deepEqual(await authorizeAccount('whoop',{link},transport,+now),grant);
 for(const bad of [link.replace('jsfeybhgobmrydcfnyjg.supabase.co','evil.test'),link.replace('type=magiclink','type=recovery'),link.replace('token=','not_token=')])await assert.rejects(authorizeAccount('whoop',{link:bad},transport,+now),/invalid_signin_link/);
 assert.equal(calls,1);
});
function dataTransport(overrides:Record<string,unknown>={},calls:string[]=[]):typeof fetch{return async(url,init)=>{const u=new URL(String(url));calls.push(u.pathname);assert.equal(u.origin,'https://cleryiplpqhrtqzryhnx.supabase.co');assert.equal(init?.method,'GET');assert.equal(u.searchParams.get('user_id'),'eq.'+userId);assert.equal(new Headers(init?.headers).get('authorization'),'Bearer SYNTHETIC_ACCESS');const table=u.pathname.split('/').at(-1)!;
 assert.equal(u.searchParams.get('limit'),table==='user_app_snapshots'?'1':'500');
 if(table==='user_app_snapshots')assert.equal(u.searchParams.get('select'),'updated_at,schedule:payload->>progressx-workout-schedule-v1');
 return Response.json(overrides[table]??({food_entries:[{id:'food-1',logged_at:'2026-11-08T23:30:00Z',calories:400,protein_g:30,carbs_g:40,fat_g:10},{id:'food-2',logged_at:'2026-11-08T12:00:00Z',calories:900,protein_g:30,carbs_g:40,fat_g:10}],legacy_workout_entries:[{source_id:'pxlog:1',original_date:'2026-11-09',exercise_name:'Synthetic Squat',day_name:'Lower',status:'Done'}],weight_checkins:[{id:'w1',measured_at:'2026-11-09T08:00:00Z',weight_kg:'90'}],user_app_snapshots:[{updated_at:now.toISOString(),schedule:'{"mon":"Upper"}'}]} as Record<string,unknown>)[table]);};}
test('ACCT-03 four read-only owner-scoped projections; timezone day, empty versus zero, no copied target',async()=>{
 const calls:string[]=[];const v=await readAccount('progress',grant,'Africa/Cairo',dataTransport({},calls),now);assert.equal(v.status,'connected');assert.ok('summary'in v);const s=v.summary!;assert.equal(s.food?.calories,400);assert.equal(s.target,null);assert.equal(s.remaining,null);assert.equal(s.scheduledDay,'Upper');assert.equal(s.recentWorkouts[0].exercise,'Synthetic Squat');assert.equal(s.weight.delta,null);assert.equal(calls.length,4);
 const empty=await readAccount('progress',grant,'Africa/Cairo',dataTransport({food_entries:[]}),now);assert.ok('summary'in empty);assert.equal(empty.summary?.food,null);
 const zero=await readAccount('progress',grant,'Africa/Cairo',dataTransport({food_entries:[{id:'zero',logged_at:now.toISOString(),calories:0,protein_g:0,carbs_g:0,fat_g:0}]}),now);assert.ok('summary'in zero);assert.equal(zero.summary?.food?.calories,0);
});
test('ACCT-04 refuses truncated, duplicate, negative, missing, malformed/future data without totals',async()=>{
 const row={id:'f',logged_at:now.toISOString(),calories:1,protein_g:1,carbs_g:1,fat_g:1};
 for(const foods of [Array.from({length:500},(_,i)=>({...row,id:String(i)})),[row,row],[{...row,calories:-1}],[{...row,protein_g:null}],[{...row,logged_at:'bad'}],[{...row,logged_at:'2027-01-01T00:00:00Z'}]]){const v=await readAccount('progress',grant,'Africa/Cairo',dataTransport({food_entries:foods}),now);assert.equal(v.status,'partial');assert.ok('summary'in v);assert.equal(v.summary!.food,null);assert.equal(v.summary!.issues?.[0].dataset,'food');}
 const badSchedule=await readAccount('progress',grant,'Africa/Cairo',dataTransport({user_app_snapshots:[{schedule:'bad'}]}),now);assert.equal(badSchedule.status,'partial');assert.ok('summary'in badSchedule);assert.equal(badSchedule.summary!.food?.calories,400);assert.equal(badSchedule.summary!.issues?.[0].dataset,'schedule');
});
test('ACCT-05 expiration and timezone errors perform no data read; upstream failures fail closed',async()=>{
 let calls=0;const transport:typeof fetch=async()=>{calls++;return Response.json({error:'private-upstream-error'},{status:403});};
 await assert.rejects(readAccount('progress',{...grant,expiresAt:+now},'Africa/Cairo',transport,now),/source_session_expired/);assert.equal(calls,0);
 await assert.rejects(readAccount('progress',grant,'Invalid/Zone',transport,now));assert.equal(calls,0);
 await assert.rejects(readAccount('progress',grant,'Africa/Cairo',transport,now),/source_access_denied/);
});
test('ACCT-06 WHOOP reuses read action only and distinguishes missing vendor connection',async()=>{
 const transport:typeof fetch=async(url,init)=>{assert.equal(String(url),'https://jsfeybhgobmrydcfnyjg.supabase.co/functions/v1/whoop-data');assert.deepEqual(JSON.parse(String(init?.body)),{action:'read'});return Response.json({connected:false,records:{}});};
 assert.deepEqual(await readAccount('whoop',grant,'Africa/Cairo',transport,now),{status:'not_linked',facts:null});
});

test('ACCT-07 bounded diagnostics identify failing dataset and distinguish source auth/schema/permission',async()=>{
 for(const [status,code] of [[401,'source_session_expired'],[403,'source_access_denied'],[400,'source_schema_unavailable']] as const){
  await assert.rejects(readAccount('progress',grant,'Africa/Cairo',async()=>Response.json({private:'DO_NOT_ECHO'},{status}),now),(error:unknown)=>{assert.ok(error instanceof AccountError);assert.equal(error.message,code);assert.equal(error.status,status===401?401:status===403?403:502);assert.equal(error.dataset,'food');assert.equal(error.message.includes('DO_NOT_ECHO'),false);return true;});
 }
});


test('ACCT-08 one broken legacy section does not suppress valid food; source auth still fails closed',async()=>{
 const v=await readAccount('progress',grant,'Africa/Cairo',dataTransport({legacy_workout_entries:[{source_id:'pxlog:old',original_date:'11/09/2026',exercise_name:'Synthetic',day_name:'Lower',status:'Done'}]}),now);assert.equal(v.status,'partial');assert.ok('summary'in v);assert.equal(v.summary!.food?.calories,400);assert.deepEqual(v.summary!.issues,[{dataset:'workouts',error:'source_invalid_response'}]);assert.deepEqual(v.summary!.recentWorkouts,[]);
 const base=dataTransport();await assert.rejects(readAccount('progress',grant,'Africa/Cairo',async(url,init)=>String(url).includes('food_entries')?Response.json({error:'private'},{status:401}):base(url,init),now),/source_session_expired/);
});
