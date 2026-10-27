import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeServer} from '../apps/api/src/server.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
test('STATUS-01 authenticated provenance, per-session cache, blocked corporate and revoked in-flight read',async()=>{
  let calls=0,block=false;
  let release:()=>void=()=>{},started:()=>void=()=>{};
  const start=new Promise<void>(r=>started=r),gate=new Promise<void>(r=>release=r);
  const origin='http://127.0.0.1:5173';
  const server=makeServer({origin,passwordHash:hashPassword('synthetic-status-password'),githubToken:'SYNTHETIC_SECRET',transport:async()=>{
    calls++;if(block){started();await gate;}
    return Response.json({name:'Synthetic project',html_url:'https://github.com/3bHussein/JARVIS-OS'});
  }});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address() as import('node:net').AddressInfo,base=`http://127.0.0.1:${address.port}`;
  const login=async()=>{
    const r=await fetch(base+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-status-password'})});assert.equal(r.status,200);
    const body=await r.json();return {Cookie:r.headers.get('set-cookie')!.split(';')[0],Origin:origin,'Content-Type':'application/json','X-CSRF-Token':body.csrf};
  };
  const status=async(headers:Record<string,string>)=>{const r=await fetch(base+'/api/connectors',{headers});return (await r.json()).connectors;};
  try{
    const a=await login(),b=await login();const initial=await status(a);
    assert.equal(initial.find((x:any)=>x.id==='github').status,'configured');assert.equal(initial.find((x:any)=>x.id==='autel').status,'blocked');assert.ok(!JSON.stringify(initial).includes('SYNTHETIC_SECRET'));
    const path='/api/github?repo=3bHussein%2FJARVIS-OS';
    assert.equal((await fetch(base+path,{headers:a})).status,200);
    assert.equal((await status(a)).find((x:any)=>x.id==='github').status,'ready');assert.equal((await status(b)).find((x:any)=>x.id==='github').lastSuccessfulSync,null);
    await fetch(base+path,{headers:a});assert.equal(calls,1);
    block=true;const pending=fetch(base+path+'&refresh=1',{headers:a});await start;
    assert.equal((await fetch(base+'/api/logout',{method:'POST',headers:a,body:'{}'})).status,200);release();
    assert.equal((await pending).status,401);
  }finally{release();server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
