import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createConnection} from 'node:net';
import {randomBytes} from 'node:crypto';
import {createCloudHandler} from '../apps/api/src/cloud-handler.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
import {emptyData} from '../packages/personal/src/model.ts';

// CI-only loopback service, never an account/production Redis endpoint.
const port=process.env.CI==='true'?Number(process.env.JARVIS_TEST_REDIS_PORT):0;
async function command(args:Array<string|number>):Promise<unknown> {
  return new Promise((resolve,reject)=>{
    const socket=createConnection({host:'127.0.0.1',port});
    const chunks:Buffer[]=[];
    socket.setTimeout(5000,()=>socket.destroy(Error('Synthetic Redis timeout')));
    socket.on('error',reject);
    socket.on('connect',()=>{
      const parts=[Buffer.from(`*${args.length}\r\n`)];
      for(const arg of args){const value=Buffer.from(String(arg));parts.push(Buffer.from(`$${value.length}\r\n`),value,Buffer.from('\r\n'));}
      socket.write(Buffer.concat(parts));
    });
    socket.on('data',chunk=>{
      chunks.push(chunk);const data=Buffer.concat(chunks),end=data.indexOf('\r\n');
      if(end<0)return;
      const type=String.fromCharCode(data[0]),head=data.subarray(1,end).toString();
      if(type==='$'&&Number(head)>=0&&data.length<end+2+Number(head)+2)return;
      socket.end();
      if(type==='-')reject(Error('Synthetic Redis command failed'));
      else if(type===':')resolve(Number(head));
      else if(type==='+')resolve(head);
      else if(type==='$')resolve(Number(head)===-1?null:data.subarray(end+2,end+2+Number(head)).toString());
      else reject(Error('Unsupported synthetic Redis response'));
    });
  });
}

test('RECOVERY-REDIS-01 real Lua TTL, one-use races, session invalidation and retained vault', {skip:!port}, async()=>{
  const keys=new Set<string>();let emailText='';
  const transport:typeof fetch=async(url,init)=>{
    if(String(url)==='https://api.resend.com/emails') {
      emailText=JSON.parse(String(init?.body)).text;
      return Response.json({id:'synthetic-mail-receipt'});
    }
    const args=JSON.parse(String(init?.body));
    if(args[0]==='EVAL')for(const key of args.slice(3,3+args[2]))keys.add(key);
    else if(args[1])keys.add(args[1]);
    return Response.json({result:await command(args)});
  };
  const origin='https://jarvis.example.test';
  const config={origin,endpoint:'https://redis.example.test',token:'synthetic',key:'b'.repeat(64),
    namespace:'test-recovery-'+randomBytes(8).toString('hex'),passwordHash:hashPassword('synthetic-original-password'),
    recovery:{email:'owner@example.test',from:'jarvis@example.test',apiKey:'synthetic'}};
  const call=(path:string,body?:unknown,headers:Record<string,string>={})=>createCloudHandler(config,transport)(new Request(origin+path,{
    method:body===undefined?'GET':'POST',headers:{Origin:origin,'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)}));
  try {
    const login=await call('/api/session',{password:'synthetic-original-password'});assert.equal(login.status,200);
    const headers={Cookie:login.headers.get('set-cookie')!.split(';')[0],'X-CSRF-Token':(await login.json()).csrf};
    const data=emptyData();data.notes.push({id:'fixture',text:'synthetic retained',kind:'note',at:null,minutes:30,done:false});
    assert.equal((await call('/api/personal',{operation:'save',remember:true,revision:0,data},headers)).status,200);
    const sent=await call('/api/recovery/request',{});assert.equal(sent.status,200);
    const {challenge}=await sent.json(),code=emailText.match(/is: (\d{8})/)![1];
    const challengeKey=[...keys].find(key=>key.endsWith(':'+challenge))!;
    assert.ok(Number(await command(['TTL',challengeKey]))>0);
    const bad=code==='00000000'?'00000001':'00000000';
    assert.equal((await call('/api/recovery/complete',{challenge,code:bad,password:'synthetic-next-password'})).status,400);
    assert.ok(Number(await command(['TTL',challengeKey]))>0,'Wrong attempts retain expiry');
    const input={challenge,code,password:'synthetic-next-password'};
    const race=await Promise.all([call('/api/recovery/complete',input),call('/api/recovery/complete',input)]);
    assert.deepEqual(race.map(r=>r.status).sort(),[200,400]);
    assert.equal(await command(['EXISTS',challengeKey]),0);
    assert.equal((await call('/api/personal',undefined,headers)).status,401);
    assert.equal((await call('/api/session',{password:'synthetic-original-password'})).status,401);
    const next=await call('/api/session',{password:input.password});assert.equal(next.status,200);
    assert.deepEqual((await(await call('/api/personal',undefined,{Cookie:next.headers.get('set-cookie')!.split(';')[0]})).json()).data,data);
    assert.equal((await call('/api/recovery/complete',input)).status,400);
  } finally {
    if(keys.size)await command(['DEL',...keys]);
  }
});
