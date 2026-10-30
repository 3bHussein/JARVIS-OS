import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,readdir,rm} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {packagePreview} from '../scripts/package-preview.mjs';
async function fixture(){const root=await mkdtemp(join(tmpdir(),'jarvis preview fixture '));const files:Record<string,string>={'apps/web/dist/index.html':'<script src="/assets/index-abcdef.js"></script>','apps/web/dist/assets/index-abcdef.js':'synthetic frontend','apps/api/src/main.ts':'synthetic API','packages/core/src/index.ts':'synthetic shared source','.env':'PRIVATE_CONFIG','.jarvis-data/personal.enc.json':'PRIVATE_RECORDS','apps/api/src/.env':'PRIVATE_NESTED'};for(const p of ['apps/voice-worker/worker.py','apps/voice-worker/requirements.txt','scripts/setup.mjs','scripts/local-runtime.mjs','scripts/serve-built.mjs','Setup-JARVIS-Preview.bat','Start-JARVIS-Built.bat','.env.example','docs/LOCAL-SPEECH.md','docs/ASSISTANT-ENGINES.md','docs/PERSONAL-BRIEFING.md','docs/USER-ACCEPTANCE.md'])files[p]='Public '+p;for(const [p,v] of Object.entries(files)){await mkdir(dirname(join(root,p)),{recursive:true});await writeFile(join(root,p),v);}return root;}
async function walk(root:string,p=''):Promise<string[]>{const all:string[]=[];for(const f of await readdir(join(root,p),{withFileTypes:true})){const path=join(p,f.name);if(f.isDirectory())all.push(...await walk(root,path));else all.push(path);}return all;}
test('PREVIEW-01 clean artifact omits private files, contains runtime bundle and valid hashes',async()=>{
 const root=await fixture();try{const stage=await packagePreview(root,join(root,'out')),files=await walk(stage);assert.ok(!files.some(f=>f.split(/[\\/]/).some(part=>part.startsWith('.'))));assert.equal(await readFile(join(stage,'apps/web/dist/assets/index-abcdef.js'),'utf8'),'synthetic frontend');const manifest=await readFile(join(stage,'MANIFEST.sha256'),'utf8');for(const line of manifest.trim().split('\n')){const [hash,path]=line.split('  ');assert.equal(createHash('sha256').update(await readFile(join(stage,path))).digest('hex'),hash);}assert.equal(JSON.parse(await readFile(join(stage,'BUILD-INFO.json'),'utf8')).release,false);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('PREVIEW-02 packaging creates a new directory and never deletes an existing preview config',async()=>{
 const root=await fixture();try{const a=await packagePreview(root,join(root,'out'));await writeFile(join(a,'.env'),'PRESERVE_EXISTING_USER_CONFIG');const b=await packagePreview(root,join(root,'out'));assert.notEqual(a,b);assert.equal(await readFile(join(a,'.env'),'utf8'),'PRESERVE_EXISTING_USER_CONFIG');assert.ok(!(await walk(b)).includes('.env'));}finally{await rm(root,{recursive:true,force:true});}
});
