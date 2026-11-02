import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {packagePreview} from '../scripts/package-preview.mjs';
async function fixture(){const root=await mkdtemp(join(tmpdir(),'jarvis preview fixture '));const files:Record<string,string>={'apps/web/dist/index.html':'<script src="/assets/index-abcdef.js"></script>','apps/web/dist/assets/index-abcdef.js':'synthetic frontend','apps/api/src/main.ts':'synthetic API','packages/core/src/index.ts':'synthetic shared source','.env':'PRIVATE_CONFIG','.jarvis-data/personal.enc.json':'PRIVATE_RECORDS','apps/api/src/.env':'PRIVATE_NESTED'};for(const p of ['apps/voice-worker/worker.py','apps/voice-worker/requirements.txt','00-READ-FIRST.md','01-Setup-JARVIS.bat','02-Start-JARVIS.bat','03-Configure-AI-Voice.bat','scripts/installation.mjs','scripts/setup.mjs','scripts/configure.mjs','scripts/engine-config.mjs','Configure-JARVIS.bat','scripts/local-runtime.mjs','scripts/serve-built.mjs','Setup-JARVIS-Preview.bat','Start-JARVIS-Built.bat','.env.example','docs/LOCAL-SPEECH.md','docs/ASSISTANT-ENGINES.md','docs/PERSONAL-BRIEFING.md','docs/USER-ACCEPTANCE.md','docs/PORTABLE-BACKUP.md','docs/DAILY-QUICKSTART.md','docs/WELCOME-AND-REMINDERS.md','docs/ENGINE-SETUP.md','docs/FIRST-USE.md'])files[p]='Public '+p;for(const [p,v] of Object.entries(files)){await mkdir(dirname(join(root,p)),{recursive:true});await writeFile(join(root,p),v);}return root;}
async function walk(root:string,p=''):Promise<string[]>{const all:string[]=[];for(const f of await readdir(join(root,p),{withFileTypes:true})){const path=join(p,f.name);if(f.isDirectory())all.push(...await walk(root,path));else all.push(path);}return all;}
test('PREVIEW-01 clean artifact omits private files, contains runtime bundle and valid hashes',async()=>{
 const root=await fixture();try{const stage=await packagePreview(root,join(root,'out')),files=await walk(stage);assert.ok(!files.some(f=>f.split(/[\\/]/).some(part=>part.startsWith('.'))));assert.equal(await readFile(join(stage,'apps/web/dist/assets/index-abcdef.js'),'utf8'),'synthetic frontend');const manifest=await readFile(join(stage,'MANIFEST.sha256'),'utf8');for(const line of manifest.trim().split('\n')){const [hash,path]=line.split('  ');assert.equal(createHash('sha256').update(await readFile(join(stage,path))).digest('hex'),hash);}assert.equal(JSON.parse(await readFile(join(stage,'BUILD-INFO.json'),'utf8')).release,false);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('PREVIEW-02 packaging creates a new directory and never deletes an existing preview config',async()=>{
 const root=await fixture();try{const a=await packagePreview(root,join(root,'out'));await writeFile(join(a,'.env'),'PRESERVE_EXISTING_USER_CONFIG');const b=await packagePreview(root,join(root,'out'));assert.notEqual(a,b);assert.equal(await readFile(join(a,'.env'),'utf8'),'PRESERVE_EXISTING_USER_CONFIG');assert.ok(!(await walk(b)).includes('.env'));}finally{await rm(root,{recursive:true,force:true});}
});

test('DESKTOP-PACK-01 native distribution includes provenance/lock/executable in manifest without personal files',async()=>{
 const {packageDesktop}=await import('../scripts/package-desktop.mjs');const root=await fixture();try{
  for(const [p,value] of Object.entries({'apps/desktop/src-tauri/target/release/jarvis-desktop.exe':'MZ_SYNTHETIC_NOT_EXECUTABLE','apps/desktop/src-tauri/Cargo.lock':'synthetic-lock','04-Open-Desktop.bat':'synthetic-launcher','docs/DESKTOP-PREVIEW.md':'synthetic-guide'})){await mkdir(dirname(join(root,p)),{recursive:true});await writeFile(join(root,p),value);}
  const stage=await packageDesktop(root,join(root,'desktop-out')),files=(await walk(stage)).map(p=>p.replaceAll('\\','/'));assert.ok(!files.some(p=>p.split('/').some(s=>s.startsWith('.'))));
  const manifest=await readFile(join(stage,'MANIFEST.sha256'),'utf8'),listed=[];for(const line of manifest.trim().split('\n')){const [hash,p]=line.split('  ');listed.push(p);assert.equal(createHash('sha256').update(await readFile(join(stage,p))).digest('hex'),hash);}assert.deepEqual(listed.sort(),files.filter(p=>p!=='MANIFEST.sha256').sort());
  for(const p of ['JARVIS-OS-Desktop.exe','DESKTOP-CARGO.lock','04-Open-Desktop.bat','DESKTOP-README.md','DESKTOP-BUILD.json'])assert.ok(listed.includes(p));const info=JSON.parse(await readFile(join(stage,'DESKTOP-BUILD.json'),'utf8'));assert.equal(info.runtimeBundled,false);assert.equal(info.guiDeviceAcceptance,false);assert.equal(info.signed,false);assert.match(await readFile(join(stage,'README.md'),'utf8'),/04 opens/);assert.equal(await readFile(join(root,'.env'),'utf8'),'PRIVATE_CONFIG');
 }finally{await rm(root,{recursive:true,force:true});}
});
test('DESKTOP-PACK-02 malformed native input is rejected before staging or changing existing personal files',async()=>{
 const {packageDesktop}=await import('../scripts/package-desktop.mjs');const root=await fixture();try{const binary=join(root,'apps/desktop/src-tauri/target/release/jarvis-desktop.exe');await mkdir(dirname(binary),{recursive:true});await writeFile(binary,'not a PE binary');await assert.rejects(packageDesktop(root,join(root,'desktop-out')),/Expected Windows PE/);assert.equal(await readFile(join(root,'.env'),'utf8'),'PRIVATE_CONFIG');await assert.rejects(readdir(join(root,'desktop-out')),{code:'ENOENT'});}finally{await rm(root,{recursive:true,force:true});}
});
