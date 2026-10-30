import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {appUrl,requireNode,configuration,assertFreePort} from './local-runtime.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));let child,stopping=false;
function stop(code=0){if(stopping)return;stopping=true;process.exitCode=code;if(child&&child.exitCode===null)child.kill('SIGTERM');if(process.connected)process.disconnect();}
async function start(){
  if(process.argv.includes('--help')){console.log('JARVIS built-app launcher. Run npm run build first. Serves UI/API from one loopback process; Ctrl+C stops it. Optional --no-browser.');return;}
  requireNode();const env=configuration(root);await assertFreePort(5173);
  process.once('SIGINT',()=>stop());process.once('SIGTERM',()=>stop());
  if(process.send){process.on('message',m=>{if(m==='stop')stop();});process.once('disconnect',()=>stop());}
  child=spawn(process.execPath,[fileURLToPath(new URL('../apps/api/src/main.ts',import.meta.url))],{cwd:root,env:{...process.env,...env,JARVIS_PORT:'5173',JARVIS_BUILT_WEB:'1'},shell:false,stdio:'inherit'});
  child.once('error',()=>{console.error('Built service could not start.');stop(1);});child.once('exit',()=>{if(!stopping){console.error('Built service exited. Rebuild with npm run build and check local configuration.');stop(1);}});
  const deadline=Date.now()+30000;let ready=false;
  while(!stopping&&Date.now()<deadline){try{const r=await fetch(appUrl+'/api/health',{signal:AbortSignal.timeout(1000)}),v=await r.json();if(r.ok&&v.configured&&v.mode==='local-built'){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}
  if(stopping)return;if(!ready)throw Error('Built app did not become ready within 30 seconds. Run npm run build and check configuration.');
  console.log(`JARVIS_BUILT_READY ${appUrl}\nLocal personal use only. Keep this window open; Ctrl+C stops the service.`);
  if(process.platform==='win32'&&!process.argv.includes('--no-browser')){const browser=spawn('rundll32.exe',['url.dll,FileProtocolHandler',appUrl],{shell:false,stdio:'ignore',windowsHide:true});browser.on('error',()=>console.log(`Open ${appUrl} manually.`));browser.unref();}
}
start().catch(error=>{console.error(error.message);stop(1);});
