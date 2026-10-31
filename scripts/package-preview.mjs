import {mkdir,mkdtemp,readdir,lstat,readFile,writeFile} from 'node:fs/promises';
import {join,relative,dirname,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {loadWebBundle} from '../apps/api/src/web-bundle.ts';
/** New staging directory every run. Never delete or overwrite an existing preview's data. */
export async function packagePreview(root,output){
  const bundle=loadWebBundle(join(root,'apps/web/dist'));await mkdir(output,{recursive:true});if((await lstat(output)).isSymbolicLink())throw Error('Unsafe preview output');
  const stage=await mkdtemp(join(output,'JARVIS-OS-Personal-Preview-')),files=[];
  const put=async(path,bytes)=>{await mkdir(dirname(join(stage,path)),{recursive:true});await writeFile(join(stage,path),bytes,{flag:'wx'});files.push(path);};
  const copy=async(path)=>{if((await lstat(join(root,path))).isSymbolicLink())throw Error('Preview source symlink rejected');await put(path,await readFile(join(root,path)));};
  async function sourceTree(path){for(const item of await readdir(join(root,path),{withFileTypes:true})){if(item.name.startsWith('.')||['node_modules','dist','test-results','__pycache__'].includes(item.name)||item.isSymbolicLink())continue;const file=join(path,item.name);if(item.isDirectory())await sourceTree(file);else if(item.isFile()&&item.name.endsWith('.ts')&&!item.name.endsWith('.test.ts'))await copy(file);}}
  await sourceTree('apps/api/src');await sourceTree('packages');
  for(const path of ['apps/voice-worker/worker.py','apps/voice-worker/requirements.txt','scripts/setup.mjs','scripts/local-runtime.mjs','scripts/serve-built.mjs','Setup-JARVIS-Preview.bat','Start-JARVIS-Built.bat','docs/LOCAL-SPEECH.md','docs/ASSISTANT-ENGINES.md','docs/PERSONAL-BRIEFING.md','docs/USER-ACCEPTANCE.md','docs/PORTABLE-BACKUP.md'])await copy(path);
  for(const [url,asset] of bundle){if(url==='/index.html')continue;await put('apps/web/dist/'+(url==='/'?'index.html':url.slice(1)),asset.body);}
  await put('package.json',JSON.stringify({name:'jarvis-os-personal-preview',private:true,type:'module',engines:{node:'>=24'},scripts:{setup:'node scripts/setup.mjs --built-only',start:'node scripts/serve-built.mjs'}},null,2)+'\n');
  await put('README.md','# JARVIS OS — Personal Preview\n\nRequires Node.js 24+. Extract into a new folder. Run Setup-JARVIS-Preview.bat once, then Start-JARVIS-Built.bat. No npm install/build is needed in this artifact. Choose your own local password; no accounts, models, secrets or personal records are bundled. Keep the terminal open. Ctrl+C stops the local service.\n\nRead docs/USER-ACCEPTANCE.md for one combined trial. This is a local personal preview, not a signed installer, Tauri application or production release. Optional Ollama/Python/model setup is separate. Keep private .env/.jarvis-data and the original password when updating; do not overwrite an existing installation.\n');
  await put('BUILD-INFO.json',JSON.stringify({source:process.env.GITHUB_SHA||null,generatedAt:new Date().toISOString(),release:false,requiresNode:'24+',modelsBundled:false},null,2)+'\n');
  const hashes=[];for(const path of files.sort()){const hash=createHash('sha256').update(await readFile(join(stage,path))).digest('hex');hashes.push(hash+'  '+path.split(sep).join('/'));}
  await put('MANIFEST.sha256',hashes.join('\n')+'\n');return stage;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){const root=fileURLToPath(new URL('..',import.meta.url));try{const stage=await packagePreview(root,join(root,'test-results'));console.log('Personal preview prepared: '+relative(root,stage));}catch{console.error('Preview packaging failed. Build first and check required public files.');process.exitCode=1;}}
