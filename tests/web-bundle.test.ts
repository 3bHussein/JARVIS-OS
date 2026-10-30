import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadWebBundle} from '../apps/api/src/web-bundle.ts';
import {makeServer} from '../apps/api/src/server.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
async function fixture(){const dir=await mkdtemp(join(tmpdir(),'jarvis bundle '));await mkdir(join(dir,'assets'));await writeFile(join(dir,'index.html'),'<script type="module" src="/assets/index-abcdef.js"></script><link rel="stylesheet" href="/assets/index-abcdef.css">');await writeFile(join(dir,'assets/index-abcdef.js'),'console.log("synthetic")');await writeFile(join(dir,'assets/index-abcdef.css'),'body{color:white}');await writeFile(join(dir,'.env'),'NEVER_SERVE_SECRET');return dir;}
test('BUNDLE-01 immutable in-memory allowlist excludes private files and requires valid hashed entries',async()=>{
  const dir=await fixture();try{const bundle=loadWebBundle(dir);assert.equal(bundle.size,4);assert.equal(bundle.has('/.env'),false);await writeFile(join(dir,'assets/index-abcdef.js'),'changed');assert.ok(bundle.get('/assets/index-abcdef.js')!.body.toString().includes('synthetic'));
    await writeFile(join(dir,'index.html'),'<script src="/assets/../../.env"></script>');assert.throws(()=>loadWebBundle(dir),/Unsupported/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('BUNDLE-02 symlink assets cannot expose outside bundle',{skip:process.platform==='win32'?'Unprivileged file symlink creation varies on Windows':false},async()=>{
  const dir=await fixture(),other=await mkdtemp(join(tmpdir(),'jarvis outside '));try{await writeFile(join(other,'secret'),'PRIVATE');await rm(join(dir,'assets/index-abcdef.js'));await symlink(join(other,'secret'),join(dir,'assets/index-abcdef.js'));assert.throws(()=>loadWebBundle(dir),/Invalid/);}finally{await rm(dir,{recursive:true,force:true});await rm(other,{recursive:true,force:true});}
});
test('BUNDLE-HTTP-01 public built UI, cache/CSP, denied private paths and preserved API auth/origin',async()=>{
  const dir=await fixture(),origin='http://127.0.0.1:5173';const server=makeServer({origin,passwordHash:hashPassword('synthetic-bundle-password'),webBundle:loadWebBundle(dir)});await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as any).port}`;
  try{const index=await fetch(base+'/');assert.equal(index.status,200);assert.match(index.headers.get('content-type')!,/html/);assert.equal(index.headers.get('cache-control'),'no-store');assert.match(index.headers.get('content-security-policy')!,/script-src 'self'/);assert.ok(!index.headers.get('content-security-policy')!.includes('unsafe-eval'));
    const asset=await fetch(base+'/assets/index-abcdef.js');assert.equal(asset.status,200);assert.match(asset.headers.get('cache-control')!,/immutable/);assert.equal((await fetch(base+'/assets/index-abcdef.js',{method:'HEAD'})).status,200);
    for(const path of ['/.env','/.jarvis-data/personal.enc.json','/apps/api/src/main.ts','/assets/index-abcdef.js.map','/%2eenv','/assets/../.env']){const r=await fetch(base+path);assert.equal(r.status,404);assert.ok(!(await r.text()).includes('NEVER_SERVE_SECRET'));}
    assert.equal((await fetch(base+'/',{headers:{Origin:'https://untrusted.invalid'}})).status,403);assert.equal((await fetch(base+'/api/session')).status,401);assert.equal((await (await fetch(base+'/api/health')).json()).mode,'local-built');
  }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await rm(dir,{recursive:true,force:true});}
});
