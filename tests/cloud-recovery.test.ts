import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCloudHandler} from '../apps/api/src/cloud-handler.ts';
import {recoveryRateScript, recoveryCompleteScript} from '../apps/api/src/cloud-recovery.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
import {emptyData} from '../packages/personal/src/model.ts';

function fixture() {
  let now=0, failMail=false;
  const entries=new Map<string,{value:string;expires?:number}>();
  const mails:Array<{to:string[];text:string}>=[];
  const read=(key:string) => {const entry=entries.get(key);if(entry?.expires!==undefined&&entry.expires<=now){entries.delete(key);return null;}return entry?.value??null;};
  const write=(key:string,value:string,ttl?:number) => entries.set(key,{value,expires:ttl===undefined?undefined:now+ttl*1000});
  // REST fake models the documented Redis commands and atomic scripts, with an explicit clock.
  const transport:typeof fetch=async (url,init) => {
    if(String(url)==='https://api.resend.com/emails') {
      assert.equal(init?.redirect,'error');assert.equal(init?.cache,'no-store');
      assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer synthetic-mail-key');
      const message=JSON.parse(String(init?.body));mails.push(message);
      return failMail?Response.json({error:'synthetic'},{status:503}):Response.json({id:'synthetic-id'});
    }
    assert.equal(String(url),'https://redis.example.test/');
    const [op,...args]=JSON.parse(String(init?.body));
    let result:unknown;
    if(op==='GET') result=read(args[0]);
    else if(op==='SET') {write(args[0],args[1],args[2]==='EX'?args[3]:undefined);result='OK';}
    else if(op==='DEL') result=Number(entries.delete(args[0]));
    else if(op==='EVAL') {
      const [script,count,...params]=args;
      if(script===recoveryRateScript) {
        assert.equal(count,1);const n=Number(read(params[0])??0)+1;
        const expires=entries.get(params[0])?.expires;write(params[0],String(n),params[1]);
        if(expires!==undefined)entries.get(params[0])!.expires=expires;result=n;
      } else if(script===recoveryCompleteScript) {
        assert.equal(count,2);
        const [key,authKey,proof,expected,next]=params;const raw=read(key);result=0;
        if(raw) {
          const item=JSON.parse(raw);
          if(item.tries>=5)entries.delete(key);
          else if(item.proof!==proof){item.tries++;entries.get(key)!.value=JSON.stringify(item);}
          else if((read(authKey)??'')!==expected)entries.delete(key);
          else {entries.delete(key);write(authKey,next);result=1;}
        }
      } else if(String(script).includes("'INCR'")) result=1; // Existing login limiter.
      else {
        assert.equal(count,1);const [key,expected,next]=params;
        result=(read(key)??'')===expected?1:0;if(result===1)write(key,next);
      }
    } else throw Error('Unexpected Redis operation');
    return Response.json({result});
  };
  const origin='https://jarvis.example.test';
  const initialPassword='synthetic-old-password';
  const config={origin,endpoint:'https://redis.example.test',token:'synthetic-redis-key',key:'a'.repeat(64),
    namespace:'fixture',passwordHash:hashPassword(initialPassword),
    recovery:{email:'owner@example.test',from:'jarvis@example.test',apiKey:'synthetic-mail-key'}};
  const call=(path:string,body?:unknown,headers:Record<string,string>={})=>createCloudHandler(config,transport)(new Request(origin+path,{
    method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},
    body:body===undefined?undefined:JSON.stringify(body)}));
  const code=()=>mails.at(-1)!.text.match(/is: (\d{8})/)![1];
  return {call,config,transport,initialPassword,entries,mails,code,tick:(ms:number)=>{now+=ms;},fail:()=>{failMail=true;}};
}

test('RECOVERY-01 email code resets across handler instances, revokes sessions and preserves encrypted records',async()=>{
  const f=fixture();
  assert.deepEqual(await(await f.call('/api/recovery')).json(),{available:true});
  const login=await f.call('/api/session',{password:f.initialPassword});
  const headers={Cookie:login.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':(await login.json()).csrf};
  const data=emptyData();data.notes.push({id:'fixture',text:'synthetic preserved record',kind:'note',at:null,minutes:30,done:false});
  assert.equal((await f.call('/api/personal',{operation:'save',remember:true,revision:0,data},headers)).status,200);
  const request=await f.call('/api/recovery/request',{email:'attacker@example.test'});
  const {challenge}=await request.json();assert.equal(request.status,200);
  assert.deepEqual(f.mails[0].to,['owner@example.test']);
  assert.ok(!JSON.stringify([...f.entries]).includes(f.code()));
  assert.ok(!JSON.stringify([...f.entries]).includes('synthetic preserved record'));
  const input={challenge,code:f.code(),password:'synthetic-new-password'};
  const reset=await f.call('/api/recovery/complete',input);assert.equal(reset.status,200);
  assert.match(reset.headers.get('set-cookie')!,/Max-Age=0/);
  assert.equal((await f.call('/api/personal',undefined,headers)).status,401);
  assert.equal((await f.call('/api/session',{password:f.initialPassword})).status,401);
  assert.equal((await f.call('/api/recovery/complete',input)).status,400);
  const nextLogin=await f.call('/api/session',{password:input.password});assert.equal(nextLogin.status,200);
  const nextHeaders={Cookie:nextLogin.headers.get('set-cookie')!.split(';')[0]};
  assert.deepEqual((await(await f.call('/api/personal',undefined,nextHeaders)).json()).data,data);
});

test('RECOVERY-02 five wrong guesses exhaust a code; expiration and resend limits apply',async()=>{
  const f=fixture();const {challenge}=await(await f.call('/api/recovery/request',{})).json();
  const good=f.code(),bad=good==='00000000'?'00000001':'00000000';
  for(let n=0;n<5;n++)assert.equal((await f.call('/api/recovery/complete',{challenge,code:bad,password:'synthetic-new-password'})).status,400);
  assert.equal((await f.call('/api/recovery/complete',{challenge,code:good,password:'synthetic-new-password'})).status,400);
  assert.equal((await f.call('/api/recovery/request',{})).status,429);
  f.tick(60001);
  const next=await(await f.call('/api/recovery/request',{})).json();const code=f.code();
  f.tick(600001);
  assert.equal((await f.call('/api/recovery/complete',{challenge:next.challenge,code,password:'synthetic-new-password'})).status,400);
  // Previous sends, including cooldown refusals, count toward the hourly abuse budget.
  assert.equal((await f.call('/api/recovery/request',{})).status,429);
});

test('RECOVERY-03 failure and missing mail config fail closed; Origin and malformed input are rejected',async()=>{
  const f=fixture();
  const disabled=createCloudHandler({...f.config,recovery:undefined},f.transport);
  assert.deepEqual(await(await disabled(new Request(f.config.origin+'/api/recovery'))).json(),{available:false});
  assert.equal((await disabled(new Request(f.config.origin+'/api/recovery/request',{method:'POST',headers:{Origin:f.config.origin,'Content-Type':'application/json'},body:'{}'}))).status,503);
  assert.equal((await f.call('/api/recovery/request',{}, {Origin:'https://attacker.test'})).status,403);
  assert.equal((await f.call('/api/recovery/complete',{challenge:'bad',code:'123',password:'short'})).status,400);
  assert.equal((await f.call('/api/recovery/complete',null)).status,400);
  f.fail();assert.equal((await f.call('/api/recovery/request',{})).status,503);
  assert.equal([...f.entries.keys()].filter(key=>key.includes(':recovery:')).length,0);
});

test('RECOVERY-04 racing completions allow only one password update',async()=>{
  const f=fixture();const {challenge}=await(await f.call('/api/recovery/request',{})).json();
  const code=f.code();
  const results=await Promise.all(['synthetic-password-one','synthetic-password-two'].map(password=>f.call('/api/recovery/complete',{challenge,code,password})));
  assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
});


test('RECOVERY-05 corrupt shared credentials fail closed and invalid recipient configuration is disabled',async()=>{
  const f=fixture();
  const handler=createCloudHandler({...f.config,recovery:{...f.config.recovery,email:'owner@example.test\r\nBcc:attacker@test.invalid'}},f.transport);
  assert.deepEqual(await(await handler(new Request(f.config.origin+'/api/recovery'))).json(),{available:false});
  const {challenge}=await(await f.call('/api/recovery/request',{})).json();
  assert.equal((await f.call('/api/recovery/complete',{challenge,code:f.code(),password:'synthetic-new-password'})).status,200);
  const authKey=[...f.entries.keys()].find(key=>key.includes(':password:'))!;
  f.entries.get(authKey)!.value='corrupt-record';
  assert.equal((await f.call('/api/session',{password:f.initialPassword})).status,503);
});

test('RECOVERY-LOG-01 dispatch diagnostics retain booleans only, never origins or input secrets',async(t)=>{
  const f=fixture();const messages:unknown[][]=[];
  t.mock.method(console,'info',(...args:unknown[])=>{messages.push(args);});
  const response=await f.call('/api/recovery/request',{password:'synthetic-private-input'}, {Origin:'https://private-origin.example.test'});
  assert.equal(response.status,403);
  assert.deepEqual(messages,[['jarvis_recovery_dispatch',{knownRoute:true,method:'POST',originMatches:true,senderMatches:false}]]);
  assert.ok(!JSON.stringify(messages).includes('synthetic-private-input'));
  assert.ok(!JSON.stringify(messages).includes('private-origin.example.test'));
});
