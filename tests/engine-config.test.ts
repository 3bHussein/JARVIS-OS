import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseEnv} from 'node:util';
import {mkdtemp,writeFile,readFile,mkdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {installedModels,patchEngineConfig,saveEngineConfig,validateSpeechPaths} from '../scripts/engine-config.mjs';
const original='# owner comment\nJARVIS_PASSWORD_HASH='+('a'.repeat(32))+':'+('b'.repeat(128))+'\nUNRELATED_SECRET=synthetic-only\nJARVIS_OLLAMA_MODEL=old-model\n';
test('CONFIG-01 append-only overrides preserve credentials/comments/unknown values and Windows paths roundtrip',()=>{
 const path=String.raw`C:\new folder\python.exe`;const next=patchEngineConfig(original,{JARVIS_OLLAMA_MODEL:'local-model:8b',JARVIS_STT_PYTHON:path});assert.ok(next.startsWith(original));assert.equal(parseEnv(next).JARVIS_STT_PYTHON,path);assert.equal(parseEnv(next).UNRELATED_SECRET,'synthetic-only');assert.equal(parseEnv(next).JARVIS_PASSWORD_HASH,parseEnv(original).JARVIS_PASSWORD_HASH);assert.equal(parseEnv(next).JARVIS_OLLAMA_MODEL,'local-model:8b');assert.throws(()=>patchEngineConfig(original,{JARVIS_PASSWORD_HASH:'other'}));assert.throws(()=>patchEngineConfig(original,{JARVIS_OLLAMA_MODEL:'remote-cloud'}));assert.throws(()=>patchEngineConfig(original,{JARVIS_STT_MODEL:'x\nINJECT=y'}));
});
test('CONFIG-02 fixed-loopback discovery bounds and excludes remote/unsafe names without inference',async()=>{
 const names=await installedModels(async(url,init)=>{assert.equal(String(url),'http://127.0.0.1:11434/api/tags');assert.equal(init?.redirect,'error');assert.equal(init?.method,undefined);return Response.json({models:[{name:'local:8b'},{name:'local:8b'},{name:'x-cloud'},{name:'remote',remote_host:'remote'},{name:'bad\u001b[31m'},{name:'another',remote_model:'foo'}]});});assert.deepEqual(names,['local:8b']);await assert.rejects(installedModels(async()=>Response.json({models:new Array(1001).fill({name:'model'})})));await assert.rejects(installedModels(async()=>new Response('x'.repeat(262145))));
});
test('CONFIG-03 validated paths and conflict-safe save preserve changed configuration',async()=>{
 const root=await mkdtemp(join(tmpdir(),'jarvis engine setup '));try{await writeFile(join(root,'.env'),original);await writeFile(join(root,'python'),'synthetic non-executed file');const model=join(root,'model');await mkdir(model);for(const name of ['model.bin','config.json','tokenizer.json'])await writeFile(join(model,name),'synthetic');assert.equal(validateSpeechPaths(join(root,'python'),model).JARVIS_STT_MODEL,model);assert.throws(()=>validateSpeechPaths('relative',model));saveEngineConfig(root,original,{JARVIS_OLLAMA_MODEL:'local:8b'});assert.equal(parseEnv(await readFile(join(root,'.env'),'utf8')).JARVIS_OLLAMA_MODEL,'local:8b');await assert.rejects(async()=>saveEngineConfig(root,original,{JARVIS_OLLAMA_MODEL:''}));assert.equal(parseEnv(await readFile(join(root,'.env'),'utf8')).JARVIS_OLLAMA_MODEL,'local:8b');}finally{await rm(root,{recursive:true,force:true});}
});
