import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clock,briefing,freshness,authorizeTool,redact} from '../packages/core/src/index.ts';
import {normalizedWordErrorRate,needsTranscriptReview} from '../packages/voice/src/index.ts';
import {planLaunch} from '../apps/windows-agent/src/policy.ts';
test('TIME-01 greeting boundaries use configured timezone',()=>{
 for(const [hour,period] of [[0,'morning'],[11,'morning'],[12,'afternoon'],[16,'afternoon'],[17,'evening'],[23,'evening']] as const)assert.equal(clock(new Date(`2026-01-01T${String(hour).padStart(2,'0')}:00:00Z`),'Etc/UTC').period,period);
});
test('TIME-02 Cairo DST and local date rollover',()=>{
 assert.equal(clock(new Date('2026-07-01T21:30:00Z'),'Africa/Cairo').date,'2026-07-02');
 assert.equal(clock(new Date('2026-01-01T21:30:00Z'),'Africa/Cairo').date,'2026-01-01');
 assert.equal(clock(new Date('2026-01-01T05:00:00Z'),'Africa/Cairo','ar').greeting,'صباح الخير');
 assert.throws(()=>clock(new Date(),'Not/AZone'));assert.throws(()=>clock(new Date('invalid'),'Etc/UTC'));
});
test('DATA-01 no invented tasks and stale/future source excluded',()=>{
 const now=new Date('2026-01-01T12:00:00Z');const source={connector:'synthetic',observedAt:'2026-01-01T11:59:00Z',maxAgeMs:60000};
 assert.equal(briefing([],now,'Etc/UTC','en').tasks.length,0);
 const tasks=[{id:'a',title:'Synthetic',date:'2026-01-01',source}];assert.equal(briefing(tasks,now,'Etc/UTC','en').tasks.length,1);
 assert.equal(freshness({...source,observedAt:'2025-01-01'},now),'stale');assert.equal(freshness({...source,observedAt:'2027-01-01'},now),'unavailable');
 assert.equal(briefing(tasks,new Date('2026-01-01T12:00:01Z'),'Etc/UTC','en').tasks.length,0);
});
test('SEC-01 writes and corporate tools fail closed',()=>{
 const ctx={authenticated:true,domains:['personal'] as ['personal']};
 assert.equal(authorizeTool({id:'g',operation:'read',domain:'personal'},ctx),true);
 for(const operation of ['write','critical'] as const)assert.equal(authorizeTool({id:'g',operation,domain:'personal'},ctx),false);
 assert.equal(authorizeTool({id:'a',operation:'read',domain:'corporate'},ctx),false);
 assert.equal(authorizeTool({id:'g',operation:'read',domain:'personal'},{...ctx,authenticated:false}),false);
});
test('SEC-02 nested redaction excludes free-text secrets',()=>{
 const result=JSON.stringify(redact({items:[{access_token:'SENSITIVE',message:'Bearer SENSITIVE',count:3}],payload:{health:1}}));
 assert.ok(!result.includes('SENSITIVE'));assert.ok(result.includes('3'));assert.ok(!result.includes('health'));
});
test('VOICE-01 uncertainty requires review; bilingual WER metric',()=>{
 assert.equal(needsTranscriptReview({text:'hello',final:true}),true);assert.equal(needsTranscriptReview({text:'hello',final:true,confidence:0.9}),false);
 assert.equal(normalizedWordErrorRate('افتح ProgressXX دلوقتي','افتح ProgressXX دلوقتي'),0);
 assert.equal(normalizedWordErrorRate('Open the project','Open project'),1/3);assert.throws(()=>normalizedWordErrorRate('','hi'));
});
test('AGENT-01 unknown application and absent approval denied',()=>{
 assert.throws(()=>planLaunch('cmd.exe',true));assert.throws(()=>planLaunch('lexora',false));assert.equal(planLaunch('lexora',true).executed,false);
});
