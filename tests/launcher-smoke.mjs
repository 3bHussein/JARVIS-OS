import {packagePreview} from '../scripts/package-preview.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,cp,symlink,writeFile,readFile,rm} from 'node:fs/promises';
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


test('START-05 packaged personal preview prepares without npm dependencies and serves authenticated UI',{timeout:60000},async()=>{
 await assertFreePort(5173);const out=await mkdtemp(join(tmpdir(),'jarvis packaged trial '));let child,closed=false,closedPromise;
 try{const root=await packagePreview(source,out),env=`JARVIS_PASSWORD_HASH=${hashPassword('synthetic-preview-password')}\n`;await writeFile(join(root,'.env'),env,{mode:0o600});const diagnostic=await run('configure.mjs',root,['--check']);assert.equal(diagnostic.code,0,diagnostic.output);assert.ok(!diagnostic.output.includes('synthetic-preview-password'));const setup=await run('setup.mjs',root,['--built-only']);assert.equal(setup.code,0,setup.output);assert.equal(await readFile(join(root,'.env'),'utf8'),env);let output='';child=spawn(process.execPath,[join(root,'scripts/serve-built.mjs'),'--no-browser'],{cwd:root,stdio:['ignore','pipe','pipe','ipc']});closedPromise=once(child,'exit').then(([code])=>{closed=true;return code;});child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);const end=Date.now()+40000;while(!closed&&!output.includes('JARVIS_BUILT_READY')&&Date.now()<end)await new Promise(r=>setTimeout(r,100));assert.ok(output.includes('JARVIS_BUILT_READY'),output);assert.equal((await fetch('http://127.0.0.1:5173/')).status,200);const r=await fetch('http://127.0.0.1:5173/api/session',{method:'POST',headers:{Origin:'http://127.0.0.1:5173','Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-preview-password'})});assert.equal(r.status,200);child.send('stop');assert.equal(await closedPromise,0);await assertFreePort(5173);
 }finally{if(child&&!closed){if(child.connected)child.send('stop');else child.kill();if(closedPromise)await closedPromise;}await rm(out,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
});

test('START-06 source ZIP without dist builds through preview setup in nested Windows-style path and preserves config',{timeout:60000},async()=>{
 const temp=await mkdtemp(join(tmpdir(),'jarvis source setup ')),root=join(temp,'3B','1-FreeLancer','J.A.R.V.I.S','JARVIS-OS-main','JARVIS-OS-main');
 try{await mkdir(root,{recursive:true});for(const dir of ['scripts','apps','packages'])await cp(join(source,dir),join(root,dir),{recursive:true});for(const file of ['package.json','package-lock.json','tsconfig.json'])await cp(join(source,file),join(root,file));await rm(join(root,'apps/web/dist'),{recursive:true,force:true});await symlink(join(source,'node_modules'),join(root,'node_modules'),process.platform==='win32'?'junction':'dir');const env=`JARVIS_PASSWORD_HASH=${hashPassword('synthetic-source-password')}\nUNRELATED_SETTING=preserve-me\n`;await writeFile(join(root,'.env'),env,{mode:0o600});const result=await run('setup.mjs',root,['--built-only','--skip-install']);assert.equal(result.code,0,result.output);assert.match(result.output,/Source download detected/);assert.match(result.output,/02-Start-JARVIS/);assert.ok(!result.output.includes('ENOENT'));const html=await readFile(join(root,'apps/web/dist/index.html'),'utf8');assert.match(html,/\/assets\/index-/);assert.equal(await readFile(join(root,'.env'),'utf8'),env);if(process.platform==='win32'){for(const file of ['01-Setup-JARVIS.bat','02-Start-JARVIS.bat','03-Configure-AI-Voice.bat','Setup-JARVIS-Preview.bat','Start-JARVIS-Built.bat','Configure-JARVIS.bat'])await cp(join(source,file),join(root,file));for(const file of ['01-Setup-JARVIS.bat','02-Start-JARVIS.bat','03-Configure-AI-Voice.bat']){const code=await new Promise((resolve,reject)=>{const child=spawn('cmd.exe',['/d','/s','/c','call '+file+' --help'],{cwd:root,shell:false,stdio:'ignore'});child.once('error',reject);child.once('exit',resolve);});assert.equal(code,0,'Numbered BAT help in nested path: '+file);}}const repeat=await run('setup.mjs',root,['--built-only','--skip-install']);assert.equal(repeat.code,0,repeat.output);assert.ok(!repeat.output.includes('Building the web application'));assert.equal(await readFile(join(root,'.env'),'utf8'),env);
 }finally{await rm(temp,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
});
test('START-07 incomplete preview missing dist fails with recovery instructions, no raw ENOENT or private-file change',{timeout:60000},async()=>{
 const root=await mkdtemp(join(tmpdir(),'jarvis incomplete preview '));try{for(const dir of ['scripts','apps','packages'])await cp(join(source,dir),join(root,dir),{recursive:true});await rm(join(root,'apps/web/dist'),{recursive:true,force:true});const env=`JARVIS_PASSWORD_HASH=${hashPassword('synthetic-incomplete-password')}\n`;await writeFile(join(root,'.env'),env,{mode:0o600});const setup=await run('setup.mjs',root,['--built-only']);assert.equal(setup.code,1);assert.match(setup.output,/copy is incomplete/);assert.match(setup.output,/01-Setup-JARVIS/);assert.ok(!setup.output.includes('ENOENT'));const start=await run('serve-built.mjs',root,['--no-browser']);assert.equal(start.code,1);assert.match(start.output,/01-Setup-JARVIS/);assert.ok(!start.output.includes('ENOENT'));assert.equal(await readFile(join(root,'.env'),'utf8'),env);}finally{await rm(root,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
});
