import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,symlink,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {hashPassword} from '../apps/api/src/auth.ts';
import {assertFreePort} from '../scripts/local-runtime.mjs';
const source=fileURLToPath(new URL('..',import.meta.url));
function run(script,root,args=[]){
  return new Promise((resolve,reject)=>{
    let output='';const child=spawn(process.execPath,[join(root,'scripts',script),...args],{cwd:root,stdio:['ignore','pipe','pipe']});
    child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);child.once('error',reject);child.once('exit',code=>resolve({code,output}));
  });
}
test('START-03 setup preserves config and one-window launcher starts/authenticates/stops from a path with spaces',{timeout:60000},async()=>{
  await assertFreePort(4310);await assertFreePort(5173);
  const root=await mkdtemp(join(tmpdir(),'jarvis launcher '));let child;let closed=false;let closedPromise;
  try{
    for(const dir of ['scripts','apps','packages'])await cp(join(source,dir),join(root,dir),{recursive:true});
    for(const file of ['package.json','tsconfig.json'])await cp(join(source,file),join(root,file));
    await symlink(join(source,'node_modules'),join(root,'node_modules'),process.platform==='win32'?'junction':'dir');
    const env=`JARVIS_PASSWORD_HASH=${hashPassword('synthetic-launcher-password')}\nJARVIS_ORIGIN=http://127.0.0.1:5173\n`;
    await writeFile(join(root,'.env'),env,{mode:0o600});
    const setup=await run('setup.mjs',root,['--skip-install']);assert.equal(setup.code,0,setup.output);assert.equal(await readFile(join(root,'.env'),'utf8'),env);
    assert.ok(!setup.output.includes('synthetic-launcher-password'));
    let output='';child=spawn(process.execPath,[join(root,'scripts/start.mjs'),'--no-browser'],{cwd:root,stdio:['ignore','pipe','pipe','ipc']});
    closedPromise=once(child,'exit').then(([code])=>{closed=true;return code;});
    child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
    const end=Date.now()+40000;
    while(!output.includes('JARVIS_READY')&&!closed&&Date.now()<end)await new Promise(r=>setTimeout(r,100));
    assert.ok(output.includes('JARVIS_READY'),output);
    const response=await fetch('http://127.0.0.1:5173/api/health');assert.equal((await response.json()).configured,true);
    const login=await fetch('http://127.0.0.1:5173/api/session',{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-launcher-password'})});assert.equal(login.status,200);
    const second=await run('start.mjs',root,['--no-browser']);assert.equal(second.code,1);assert.match(second.output,/in use/);
    assert.equal((await fetch('http://127.0.0.1:5173/api/health')).status,200);
    child.send('stop');assert.equal(await closedPromise,0);
    await assertFreePort(4310);await assertFreePort(5173);assert.ok(!output.includes('synthetic-launcher-password'));
  }finally{
    if(child&&!closed){if(child.connected)child.send('stop');else child.kill();if(closedPromise)await closedPromise;}
    await rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:200});
  }
});

test('START-04 built UI/API runs without node_modules, refuses occupied port and stops owned process',{timeout:60000},async()=>{
  await assertFreePort(5173);const root=await mkdtemp(join(tmpdir(),'jarvis built '));let child,closed=false,closedPromise;
  try{
    for(const dir of ['scripts','apps','packages'])await cp(join(source,dir),join(root,dir),{recursive:true});await cp(join(source,'package.json'),join(root,'package.json'));
    await writeFile(join(root,'.env'),`JARVIS_PASSWORD_HASH=${hashPassword('synthetic-built-password')}\n`,{mode:0o600});
    let output='';child=spawn(process.execPath,[join(root,'scripts/serve-built.mjs'),'--no-browser'],{cwd:root,stdio:['ignore','pipe','pipe','ipc']});closedPromise=once(child,'exit').then(([code])=>{closed=true;return code;});child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
    const end=Date.now()+40000;while(!closed&&!output.includes('JARVIS_BUILT_READY')&&Date.now()<end)await new Promise(r=>setTimeout(r,100));assert.ok(output.includes('JARVIS_BUILT_READY'),output);
    const r=await fetch('http://127.0.0.1:5173/');assert.equal(r.status,200);const html=await r.text(),asset=html.match(/src="(\/assets\/[^\"]+\.js)"/)?.[1];assert.ok(asset);assert.equal((await fetch('http://127.0.0.1:5173'+asset)).status,200);
    assert.equal((await fetch('http://127.0.0.1:5173/.env')).status,404);const second=await run('serve-built.mjs',root,['--no-browser']);assert.equal(second.code,1);assert.match(second.output,/in use/);
    const login=await fetch('http://127.0.0.1:5173/api/session',{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-built-password'})});assert.equal(login.status,200);
    child.send('stop');assert.equal(await closedPromise,0);await assertFreePort(5173);assert.ok(!output.includes('synthetic-built-password'));
  }finally{if(child&&!closed){if(child.connected)child.send('stop');else child.kill();if(closedPromise)await closedPromise;}await rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
});
