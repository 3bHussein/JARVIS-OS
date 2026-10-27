import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {appUrl,requireNode,configuration,assertFreePort} from './local-runtime.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const children=[];let stopping=false;
function stop(code=0){
  if(stopping)return;stopping=true;process.exitCode=code;
  for(const child of children)if(child.exitCode===null)child.kill('SIGTERM');
  if(process.connected)process.disconnect();
  console.log('JARVIS local services stopped.');
}
function launch(args,env){
  const child=spawn(process.execPath,args,{cwd:root,env,stdio:'inherit',shell:false});children.push(child);
  child.once('error',()=>{console.error('A local service could not start.');stop(1);});
  child.once('exit',()=>{if(!stopping){console.error('A local service exited. Both services will stop.');stop(1);}});
}
async function ready(){
  const end=Date.now()+30000;
  while(Date.now()<end&&!stopping){
    try{
      const response=await fetch(`${appUrl}/api/health`,{signal:AbortSignal.timeout(1500)});
      const data=await response.json();
      if(response.ok&&data.ok&&data.configured&&data.mode==='local-development')return;
    }catch{}
    await new Promise(resolve=>setTimeout(resolve,200));
  }
  throw Error('Startup did not complete within 30 seconds. See the service messages above.');
}
async function start(){
  if(process.argv.includes('--help')){console.log('JARVIS local launcher. Requires setup. Keeps API and UI in this window; Ctrl+C stops both. Optional --no-browser.');return;}
  requireNode();const env=configuration(root);
  const vite=join(root,'node_modules/vite/bin/vite.js');
  if(!existsSync(vite))throw Error('Dependencies are missing. Run Setup-JARVIS.bat first.');
  await assertFreePort(4310);await assertFreePort(5173);
  process.once('SIGINT',()=>stop());process.once('SIGTERM',()=>stop());
  // Optional parent-only IPC is used by automated lifecycle tests on Windows.
  if(process.send){process.on('message',message=>{if(message==='stop')stop();});process.once('disconnect',()=>stop());}
  // Only these owned child processes are terminated. No taskkill or arbitrary OS action.
  launch([join(root,'apps/api/src/main.ts')],{...process.env,...env});
  launch([vite,'--config',join(root,'apps/web/vite.config.ts'),'--host','127.0.0.1'],process.env);
  await ready();if(stopping)return;
  console.log(`JARVIS_READY ${appUrl}\nOpen Settings and unlock with your setup password. Keep this window open. Press Ctrl+C to stop.`);
  if(process.platform==='win32'&&!process.argv.includes('--no-browser')){
    const browser=spawn('rundll32.exe',['url.dll,FileProtocolHandler',appUrl],{stdio:'ignore',windowsHide:true,shell:false});
    browser.on('error',()=>console.log(`Open ${appUrl} manually in your browser.`));browser.unref();
  }
}
start().catch(error=>{console.error(error.message);stop(1);});
