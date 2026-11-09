import {test} from 'node:test';
import assert from 'node:assert/strict';
import {accountStatus,sourceReadMessage,sourceTime} from '../packages/connectors/src/account-status.ts';
const now=Date.parse('2026-11-09T12:00:00Z');
test('STATUS-01 expired metadata cannot keep a grant visibly connected; missing/invalid timestamps are safe',()=>{
 assert.equal(accountStatus({connected:true,expiresAt:now,lastRead:null},now).connected,false);
 assert.equal(accountStatus({connected:true,expiresAt:now,lastRead:null},now).expired,true);
 assert.equal(accountStatus({connected:true,expiresAt:now+60000,lastRead:null},now).minutes,1);
 assert.equal(accountStatus(undefined,now).readState,'unread');
 for(const stamp of ['bad','2027-01-01T00:00:00Z'])assert.equal(accountStatus({connected:true,expiresAt:now+60000,lastRead:stamp},now).lastRead,null);
 assert.equal(accountStatus({connected:true,expiresAt:NaN,lastRead:null},now).connected,false);
});
test('STATUS-02 last-read freshness is not vendor/device synchronization',()=>{
 assert.equal(accountStatus({connected:true,expiresAt:now+60000,lastRead:new Date(now-900000).toISOString()},now).readState,'recent');
 assert.equal(accountStatus({connected:true,expiresAt:now+60000,lastRead:new Date(now-900001).toISOString()},now).readState,'old');
});
test('STATUS-03 configured timezone is explicit; messages explain source failure without echoing arbitrary upstream text',()=>{
 assert.match(sourceTime(now,'Asia/Dubai',false),/16:00/);
 assert.match(sourceTime(now,'Africa/Cairo',false),/14:00/);
 for(const code of ['expired','whoop_session_expired','source_session_expired','not_linked','busy','source_rate_limited','source_result_limit','source_invalid_response','source_unavailable'])for(const ar of [false,true])assert.ok(sourceReadMessage(code,ar));
 assert.match(sourceReadMessage('source_session_expired',false)!,/Reconnect/);
 assert.equal(sourceReadMessage('connected',false),null);
 assert.equal(sourceReadMessage('PRIVATE_TOKEN_OR_STACK',false)!.includes('PRIVATE_TOKEN'),false);
});
