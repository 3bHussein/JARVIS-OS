import {test} from 'node:test';
import assert from 'node:assert/strict';
import {connectWhoop,readWhoop,whoopFacts,type WhoopConnection} from '../packages/connectors/src/whoop.ts';
const now=new Date('2026-10-28T10:00:00Z');
function fixture():WhoopConnection{return {accessToken:'SYNTHETIC_ACCESS_TOKEN',expiresAt:+now+3600000,records:{sleep:[{id:'sleep-1',nap:false,score_state:'SCORED',start:'2026-10-27T23:00:00Z',end:'2026-10-28T07:00:00Z',updated_at:'2026-10-28T07:10:00Z',score:{stage_summary:{total_light_sleep_time_milli:3*3600000,total_slow_wave_sleep_time_milli:3600000,total_rem_sleep_time_milli:2*3600000,total_awake_time_milli:2*3600000},sleep_needed:{baseline_milli:8*3600000,need_from_sleep_debt_milli:3600000,need_from_recent_strain_milli:0,need_from_recent_nap_milli:-3600000}}}],recovery:[{sleep_id:'sleep-1',score_state:'SCORED',score:{recovery_score:42}}]},observedAt:now.toISOString(),lastSync:now.toISOString(),connected:true};}
test('WHOOP-01 time asleep excludes awake time; need uses signed nap adjustment; no prior-day substitution',()=>{
  const c=fixture(),v=whoopFacts(c,'Africa/Cairo',now);assert.equal(v.sleepHours,6);assert.equal(v.sleepNeedHours,8);assert.equal(v.recovery,42);
  assert.equal(whoopFacts(c,'Africa/Cairo',new Date('2026-10-29T10:00:00Z')).sleepHours,null);
  c.records.sleep[0].nap=true;assert.equal(whoopFacts(c,'Africa/Cairo',now).sleepHours,null);
});
test('WHOOP-02 credentials go only to fixed auth host and no refresh/OAuth token is retained',async()=>{
  const calls:string[]=[];
  const c=await connectWhoop('synthetic@example.invalid','synthetic-password',async(url,init)=>{calls.push(String(url));assert.equal(init?.redirect,'error');return Response.json({access_token:'SYNTHETIC_ACCESS_TOKEN',refresh_token:'NEVER_RETAIN',expires_in:3600,user:{factors:[]}});},now);
  assert.equal(calls.length,1);assert.equal(new URL(calls[0]).hostname,'jsfeybhgobmrydcfnyjg.supabase.co');assert.ok(!JSON.stringify(c).includes('NEVER_RETAIN'));assert.ok(!JSON.stringify(c).includes('synthetic-password'));
  await assert.rejects(connectWhoop('x','x',async()=>Response.json({access_token:'x',expires_in:3600,user:{factors:[{status:'verified'}]}}),now),/mfa/);
});
test('WHOOP-03 read mode never syncs; short-lived cache and source sync timestamps are distinct',async()=>{
  const c=fixture();c.observedAt=null;let calls=0;
  const transport:typeof fetch=async(url,init)=>{calls++;assert.ok(String(url).endsWith('/whoop-data'));assert.deepEqual(JSON.parse(String(init?.body)),{action:'read'});assert.equal(new Headers(init?.headers).get('authorization'),'Bearer SYNTHETIC_ACCESS_TOKEN');return Response.json({connected:true,records:fixture().records,sync_history:[{status:'complete',finished_at:'2026-10-28T09:00:00Z'}]});};
  await readWhoop(c,transport,now);assert.equal(c.lastSync,'2026-10-28T09:00:00Z');await readWhoop(c,transport,now);assert.equal(calls,1);
  await assert.rejects(readWhoop(c,transport,new Date(c.expiresAt)),/expired/);
});
