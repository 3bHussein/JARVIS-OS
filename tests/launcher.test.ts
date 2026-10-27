import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:net';
// Helpers are executable JavaScript, shared with the one-window launcher.
const {requireNode,configuration,assertFreePort,npmInstallCommand}=await import('../scripts/local-runtime.mjs');
test('START-01 runtime and configuration fail safely without revealing secrets',async()=>{
  assert.throws(()=>requireNode('22.0.0'),/Node.js 24/);assert.doesNotThrow(()=>requireNode('24.0.0'));
  const root=await mkdtemp(join(tmpdir(),'jarvis config '));
  try{
    assert.throws(()=>configuration(root),/Setup-JARVIS/);
    await writeFile(join(root,'.env'),'JARVIS_PASSWORD_HASH=SECRET\nGITHUB_TOKEN=NEVER_PRINT\n');
    assert.throws(()=>configuration(root),error=>error instanceof Error&&!error.message.includes('NEVER_PRINT')&&!error.message.includes('SECRET'));
    const hash='a'.repeat(32)+':'+'b'.repeat(128);
    await writeFile(join(root,'.env'),`JARVIS_PASSWORD_HASH=${hash}\nJARVIS_ORIGIN=https://evil.example\n`);assert.throws(()=>configuration(root),/ports/);
    await writeFile(join(root,'.env'),`JARVIS_PASSWORD_HASH=${hash}\n`);assert.equal(configuration(root).JARVIS_PORT,'4310');
    assert.deepEqual(npmInstallCommand('win32').args,['/d','/s','/c','npm ci --ignore-scripts']);
  }finally{await rm(root,{recursive:true,force:true});}
});
test('START-02 occupied port is rejected without terminating its owner',async()=>{
  const server=createServer();await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const addr=server.address() as import('node:net').AddressInfo;
  try{await assert.rejects(assertFreePort(addr.port),/in use/);assert.equal(server.listening,true);}finally{await new Promise<void>(r=>server.close(()=>r()));}
});
