import {existsSync,readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {createServer} from 'node:net';
import {join} from 'node:path';
export const appUrl='http://127.0.0.1:5173';
export function requireNode(version=process.versions.node){
  if(Number(version.split('.')[0])<24)throw Error('Install Node.js 24 LTS or newer from https://nodejs.org/ and reopen this window.');
}
export function configuration(root){
  const path=join(root,'.env');
  if(!existsSync(path))throw Error('Local setup is missing. Run Setup-JARVIS.bat first (or npm run setup).');
  const env=parseEnv(readFileSync(path,'utf8'));
  if(!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.JARVIS_PASSWORD_HASH||''))throw Error('The .env password hash is missing or invalid. See docs/RUN-LOCALLY.md.');
  if(env.JARVIS_ORIGIN&&env.JARVIS_ORIGIN!==appUrl||env.JARVIS_PORT&&env.JARVIS_PORT!=='4310')throw Error('This launcher uses ports 4310/5173. Use the manual commands for custom ports.');
  return {...env,JARVIS_ORIGIN:appUrl,JARVIS_PORT:'4310'};
}
export async function assertFreePort(port){
  await new Promise((resolve,reject)=>{
    const probe=createServer();probe.once('error',()=>reject(Error(`Port ${port} is in use. Close the other JARVIS window or use the manual start instructions. No existing process was stopped.`)));
    probe.listen(port,'127.0.0.1',()=>probe.close(resolve));
  });
}
export function npmInstallCommand(platform=process.platform){
  return platform==='win32'?{command:'cmd.exe',args:['/d','/s','/c','npm ci --ignore-scripts']}:{command:'npm',args:['ci','--ignore-scripts']};
}
