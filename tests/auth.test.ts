import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,checkPassword,Sessions} from '../apps/api/src/auth.ts';
import {makeServer} from '../apps/api/src/server.ts';
test('AUTH-01 salted hash, bounded input, expiring revocable session',()=>{
 const hash=hashPassword('synthetic-password');assert.equal(checkPassword('synthetic-password',hash),true);assert.equal(checkPassword('wrong',hash),false);assert.equal(checkPassword('x','invalid'),false);assert.throws(()=>hashPassword('short'));
 const sessions=new Sessions();const a=sessions.create(1000);assert.ok(sessions.get(a.token,2000));assert.equal(sessions.get(a.token,3601000),null);const b=sessions.create();sessions.revoke(b.token);assert.equal(sessions.get(b.token),null);
});
test('AUTH-02 HTTP auth, CSRF, origin, redacted audit, writes and logout',async()=>{
 const events:unknown[]=[];const origin='http://127.0.0.1:5173';const server=makeServer({origin,passwordHash:hashPassword('synthetic-password'),audit:e=>events.push(e)});
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
 try{
  assert.equal((await fetch(base+'/api/connectors')).status,401);
  assert.equal((await fetch(base+'/api/health',{headers:{Origin:'https://evil.example'}})).status,403);
  const headers={'Content-Type':'application/json',Origin:origin};
  assert.equal((await fetch(base+'/api/session',{method:'POST',headers,body:JSON.stringify({password:'wrong'})})).status,401);
  const login=await fetch(base+'/api/session',{method:'POST',headers,body:JSON.stringify({password:'synthetic-password'})});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie')!;assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('SameSite=Strict'));const session=await login.json();
  const authed={...headers,Cookie:cookie.split(';')[0]};
  assert.equal((await fetch(base+'/api/connectors',{headers:authed})).status,200);
  assert.equal((await fetch(base+'/api/tools',{method:'POST',headers:authed,body:'{}'})).status,403);
  const csrf={...authed,'X-CSRF-Token':session.csrf};
  const tool=await fetch(base+'/api/tools',{method:'POST',headers:csrf,body:'{}'});assert.equal((await tool.json()).error,'writes_disabled');
  const gh=await fetch(base+'/api/github',{headers:authed});assert.equal((await gh.json()).status,'disconnected');
  assert.equal((await fetch(base+'/api/logout',{method:'POST',headers:csrf,body:'{}'})).status,200);
  assert.equal((await fetch(base+'/api/session',{headers:authed})).status,401);
  assert.ok(!JSON.stringify(events).includes('synthetic-password'));assert.ok(!JSON.stringify(events).includes(session.csrf));
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()))}
});
test('AUTH-03 unconfigured auth fails closed and login rate limited',async()=>{
 const origin='http://127.0.0.1:5173';
 for(const hash of ['',hashPassword('synthetic-password')]){
 const server=makeServer({origin,passwordHash:hash});await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const a=server.address() as import('node:net').AddressInfo;
 try{for(let i=0;i<6;i++){const r=await fetch(`http://127.0.0.1:${a.port}/api/session`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{"password":"bad"}'});assert.equal(r.status,hash?(i<5?401:429):503)}}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()))}
 }
});
