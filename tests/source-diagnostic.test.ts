import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceDiagnostic} from '../packages/connectors/src/source-diagnostic.ts';
const read=(code:string,current=false,available=false,busy=false,ar=false)=>sourceDiagnostic({code,current,available,busy},ar);
test('DIAG-01 disconnected, expired and upstream-unlinked states have distinct next actions',()=>{
 assert.equal(read('disconnected').action,'connect');for(const code of ['expired','source_session_expired','whoop_session_expired'])assert.match(read(code).title,/Reconnect/);
 assert.equal(read('not_linked').action,'original');assert.match(read('not_linked').detail,/WHOOP Intelligence/);assert.equal(read('source_access_denied').action,'connect');assert.equal(read('source_schema_unavailable').action,'connect');
});
test('DIAG-02 connection is not a current usable value or proof of complete upstream synchronization',()=>{
 assert.equal(read('connected').state,'attention');assert.equal(read('connected').action,'original');assert.match(read('connected',true,false).title,/value unavailable/);assert.equal(read('connected',true,true).state,'ready');assert.match(read('connected',true,true).detail,/not proof/);assert.equal(read('partial',true,true).state,'attention');assert.equal(read('source_unavailable',true,true).state,'attention');
});
test('DIAG-03 busy state is per provider, rate limits wait and unsafe totals require original app review',()=>{
 assert.equal(read('connected',true,true,true).state,'reading');assert.equal(read('connected',true,true,false).state,'ready');for(const code of ['busy','source_read_in_progress','source_rate_limited'])assert.equal(read(code).action,'wait');for(const code of ['source_result_limit','source_food_identity_conflict','source_invalid_response'])assert.equal(read(code).action,'original');
});
test('DIAG-04 bilingual messages never echo unknown error details or invent zero/manual fallback',()=>{
 for(const ar of [false,true]){const value=read('PRIVATE_SECRET_STACK:food',false,false,false,ar);assert.equal(value.action,'retry');assert.equal(JSON.stringify(value).includes('PRIVATE_SECRET'),false);assert.ok(value.title&&value.detail);assert.equal(read('source_rate_limited:food',false,false,false,ar).action,'wait');}
 assert.match(read('connected',true,false).detail,/does not mean zero/);
});
