import {existsSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {hashPassword} from '../apps/api/src/auth.ts';
import {requireNode,configuration,npmInstallCommand} from './local-runtime.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
async function hiddenPassword(prompt){
  if(!process.stdin.isTTY)throw Error('An interactive terminal is required to choose a password. Use the documented stdin password helper for scripted setup.');
  const sink=new Writable({write(_chunk,_encoding,done){done();}});
  sink.isTTY=true;sink.columns=80;
  const rl=createInterface({input:process.stdin,output:sink,terminal:true});
  const abort=new AbortController();rl.on('SIGINT',()=>abort.abort());
  process.stdout.write(prompt);
  try{return await rl.question('',{signal:abort.signal});}finally{rl.close();sink.end();process.stdout.write('\n');}
}
async function setup(){
  if(process.argv.includes('--help')){console.log('JARVIS setup: verifies Node 24+, creates a password-protected .env without overwriting it, then installs locked dependencies. Optional --skip-install if dependencies already exist.');return;}
  requireNode();
  if(!existsSync(join(root,'.env'))){
    console.log('Choose your local workspace password (12-256 characters). Input is hidden.');
    let first=await hiddenPassword('Password: '),second=await hiddenPassword('Confirm password: ');
    if(first!==second)throw Error('Passwords do not match. No configuration was written.');
    const hash=hashPassword(first);first='';second='';
    writeFileSync(join(root,'.env'),`JARVIS_PASSWORD_HASH=${hash}\nJARVIS_ORIGIN=http://127.0.0.1:5173\nJARVIS_PORT=4310\n`,{flag:'wx',mode:0o600});
    console.log('Local configuration created. Your password was not written as plain text.');
  }else console.log('Existing .env preserved.');
  configuration(root);
  if(!process.argv.includes('--skip-install')){
    const {command,args}=npmInstallCommand();
    const code=await new Promise((resolve,reject)=>{const child=spawn(command,args,{cwd:root,stdio:'inherit',shell:false});child.once('error',()=>reject(Error('npm could not start. Reinstall Node.js with npm and reopen the terminal.')));child.once('exit',resolve);});
    if(code!==0)throw Error('Dependency installation failed. Check your connection, then run setup again. Your .env was preserved.');
  }
  if(!existsSync(join(root,'node_modules/vite/bin/vite.js')))throw Error('Dependencies are missing. Run setup without --skip-install.');
  console.log('Setup complete. Open Start-JARVIS.bat, or run npm start.');
}
setup().catch(error=>{console.error(error.message==='The operation was aborted'?'Setup cancelled.':error.message);process.exitCode=1;});
