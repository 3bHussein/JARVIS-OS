import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GatewayProvider,GatewayError} from '../packages/ai/src/gateway.ts';
import {aiErrorMessage} from '../packages/ai/src/status.ts';
import {chooseSpeechVoice} from '../packages/voice/src/index.ts';
const messages=[{role:'user' as const,content:'Synthetic greeting'}];
test('GATEWAY-01 fixed host, bounded output, no redirects/tools/secrets returned',async()=>{
 const provider=new GatewayProvider('fixture/synthetic-model','SYNTHETIC_KEY',async(url,init)=>{assert.equal(url,'https://ai-gateway.vercel.sh/v1/chat/completions');assert.equal(init?.redirect,'error');const body=JSON.parse(String(init?.body));assert.equal(body.max_tokens,700);assert.equal(body.stream,false);assert.equal(body.tools,undefined);assert.equal(JSON.stringify(body).includes('SYNTHETIC_KEY'),false);assert.equal(new Headers(init?.headers).get('authorization'),'Bearer SYNTHETIC_KEY');return Response.json({choices:[{finish_reason:'stop',message:{role:'assistant',content:'Synthetic answer'}}]});});
 assert.equal(await provider.complete(messages),'Synthetic answer');assert.throws(()=>new GatewayProvider('https://evil.test','key'));
});
test('GATEWAY-02 safe auth/budget/account/rate errors never leak upstream content',async()=>{
 for(const [status,code] of [[401,'ai_credentials_required'],[402,'ai_budget_unavailable'],[403,'ai_account_action_required'],[429,'ai_rate_limited']] as const){const p=new GatewayProvider('fixture/model','secret',async()=>Response.json({secret:'DO_NOT_ECHO'},{status}));await assert.rejects(p.complete(messages),(e:unknown)=>{assert.ok(e instanceof GatewayError);assert.equal(e.message,code);assert.notEqual(e.status,401);return true;});}
 assert.equal(aiErrorMessage('DO_NOT_ECHO',false).includes('DO_NOT_ECHO'),false);
});
test('GATEWAY-03 refuses incomplete/tool/non-text/oversized answers and normalizes network errors',async()=>{
 for(const value of [{choices:[{finish_reason:'length',message:{role:'assistant',content:'partial'}}]},{choices:[{finish_reason:'stop',message:{role:'assistant',content:'answer',tool_calls:[{}]}}]},{choices:[{finish_reason:'stop',message:{role:'assistant',content:'x'.repeat(12001)}}]}])await assert.rejects(new GatewayProvider('fixture/model','secret',async()=>Response.json(value)).complete(messages),/ai_invalid_response/);
 await assert.rejects(new GatewayProvider('fixture/model','secret',async()=>{throw Error('PRIVATE_NETWORK_DETAIL');}).complete(messages),/ai_connection_failed/);
});
test('VOICE-03 exact locale preference, language-safe explicit choices and network consent',()=>{
 const sa={name:'Arabic SA',lang:'ar-SA',localService:true},eg={name:'Arabic EG',lang:'ar-EG',localService:true},en={name:'English',lang:'en-US',localService:true};
 assert.equal(chooseSpeechVoice([sa,eg,en],'','ar-EG'),eg);assert.equal(chooseSpeechVoice([en],'English','ar-EG',true),null);assert.equal(chooseSpeechVoice([sa,eg],'Arabic SA','ar-EG'),sa);
});
