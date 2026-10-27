import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {makeServer} from '../apps/api/src/server.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
test('PERSON-HTTP-01 encrypted consent, revision guards, health consent/isolation and explicit erase',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'jarvis-api-personal-')),origin='http://127.0.0.1:5173';let providerCalls=0;
  const audit:unknown[]=[];
  const server=makeServer({origin,passwordHash:hashPassword('synthetic-personal-login'),vaultDirectory:directory,audit:e=>audit.push(e),whoopTransport:async(url,init)=>{
    providerCalls++;if(String(url).includes('/auth/v1/'))return Response.json({access_token:'PRIVATE_HEALTH_TOKEN',refresh_token:'DO_NOT_RETAIN',expires_in:3600,user:{factors:[]}});
    assert.deepEqual(JSON.parse(String(init?.body)),{action:'read'});return Response.json({connected:true,records:{sleep:[],recovery:[]},sync_history:[]});
  }});
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address() as import('node:net').AddressInfo,base=`http://127.0.0.1:${address.port}`;
  const login=async()=>{const r=await fetch(base+'/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-personal-login'})});assert.equal(r.status,200);const v=await r.json();return {Cookie:r.headers.get('set-cookie')!.split(';')[0],Origin:origin,'Content-Type':'application/json','X-CSRF-Token':v.csrf};};
  try{
    const a=await login(),b=await login();const data={profile:{name:'PRIVATE_PROFILE_NAME',goal:'Strength',interests:'Learning',sleepTarget:8,calorieTarget:2400,dayStart:'08:00',dayEnd:'22:00'},days:[],notes:[]};
    assert.equal((await fetch(base+'/api/personal')).status,401);
    const save=()=>fetch(base+'/api/personal',{method:'POST',headers:a,body:JSON.stringify({operation:'save',remember:true,revision:0,data})});
    assert.equal((await save()).status,200);assert.equal((await save()).status,409);
    const raw=await readFile(join(directory,'personal.enc.json'),'utf8');assert.ok(!raw.includes('PRIVATE_PROFILE_NAME'));
    const connect=(consent:boolean)=>fetch(base+'/api/whoop/connect',{method:'POST',headers:a,body:JSON.stringify({email:'synthetic@example.invalid',password:'synthetic-whoop-password',consent})});
    assert.equal((await connect(false)).status,403);assert.equal(providerCalls,0);assert.equal((await connect(true)).status,200);
    const read=await (await fetch(base+'/api/whoop',{headers:a})).json();assert.equal(read.status,'ready');assert.ok(!JSON.stringify(read).includes('PRIVATE_HEALTH_TOKEN'));
    assert.equal((await (await fetch(base+'/api/whoop',{headers:b})).json()).status,'disconnected');
    assert.equal((await fetch(base+'/api/personal',{method:'POST',headers:a,body:JSON.stringify({operation:'erase'})})).status,403);
    assert.equal((await fetch(base+'/api/personal',{method:'POST',headers:a,body:JSON.stringify({operation:'erase',confirmation:'DELETE PERSONAL DATA'})})).status,200);
    assert.equal((await fetch(base+'/api/personal',{headers:a})).status,401);assert.equal((await fetch(base+'/api/personal',{headers:b})).status,409);
    assert.ok(!JSON.stringify(audit).includes('PRIVATE_PROFILE_NAME'));assert.ok(!JSON.stringify(audit).includes('synthetic-whoop-password'));assert.ok(!JSON.stringify(audit).includes('PRIVATE_HEALTH_TOKEN'));
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await rm(directory,{recursive:true,force:true});}
});
