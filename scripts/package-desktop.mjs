import {packagePreview} from './package-preview.mjs';
import {join,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {lstat,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function packageDesktop(root,output){
 const binary=join(root,'apps/desktop/src-tauri/target/release/jarvis-desktop.exe'),stat=await lstat(binary);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>100*1024*1024)throw Error('Invalid desktop binary');const bytes=await readFile(binary);if(bytes.subarray(0,2).toString()!=='MZ')throw Error('Expected Windows PE executable');
 const stage=await packagePreview(root,output);await writeFile(join(stage,'JARVIS-OS-Desktop.exe'),bytes,{flag:'wx'});
 for(const [from,to] of [['04-Open-Desktop.bat','04-Open-Desktop.bat'],['scripts/start-desktop.mjs','scripts/start-desktop.mjs'],['docs/DESKTOP-PREVIEW.md','DESKTOP-README.md'],['apps/desktop/src-tauri/Cargo.lock','DESKTOP-CARGO.lock']])await writeFile(join(stage,to),await readFile(join(root,from)),{flag:'wx'});
 await writeFile(join(stage,'DESKTOP-BUILD.json'),JSON.stringify({source:process.env.GITHUB_SHA||null,host:'Tauri 2',architecture:'x86_64-pc-windows-msvc',runtimeBundled:false,signed:false,installer:false,guiDeviceAcceptance:false},null,2)+'\n');
 await writeFile(join(stage,'README.md'),'# JARVIS OS — Windows Desktop Preview\n\nRead DESKTOP-README.md first. Requires Windows x64, Microsoft WebView2 and Node.js24+. Extract the full folder. Run01 once. Step04 opens the native window and starts the local service for that session. No Rust/npm build is required in this artifact. This is an unsigned preview, not an installer. Browser and desktop sessions use separate sign-ins. Save encrypted records before switching. No credentials, models or personal data are bundled.\n');
 const files=[];async function walk(folder,prefix=''){for(const entry of await readdir(folder,{withFileTypes:true})){const p=prefix?prefix+'/'+entry.name:entry.name;if(entry.isDirectory())await walk(join(folder,entry.name),p);else if(p!=='MANIFEST.sha256')files.push(p);}}await walk(stage);const hashes=[];for(const p of files.sort())hashes.push(createHash('sha256').update(await readFile(join(stage,p))).digest('hex')+'  '+p);await writeFile(join(stage,'MANIFEST.sha256'),hashes.join('\n')+'\n');return stage;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){const root=fileURLToPath(new URL('..',import.meta.url));try{console.log('Desktop preview prepared: '+relative(root,await packageDesktop(root,join(root,'test-results/desktop'))));}catch{console.error('Desktop packaging failed. Build and test the Windows host first; no existing personal data was changed.');process.exitCode=1;}}
