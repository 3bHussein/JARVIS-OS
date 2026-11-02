import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {createInterface} from 'node:readline/promises';
import {requireNode,configuration} from './local-runtime.mjs';
import {readEngineConfig,saveEngineConfig,installedModels,validateSpeechPaths} from './engine-config.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
async function main(){
 if(process.argv.includes('--help')){console.log('JARVIS engine setup: node scripts/configure.mjs. Configure an already installed local Ollama model or existing offline speech paths; never installs models/dependencies or executes Python. --check prints configuration flags only. Restart JARVIS after saving.');return;}
 requireNode();configuration(root);const original=readEngineConfig(root),env=parseEnv(original);
 console.log('JARVIS engine setup — local configuration only. Password and unrelated settings are preserved.');
 console.log(`AI model configured: ${Boolean(env.JARVIS_OLLAMA_MODEL)}; offline speech paths configured: ${Boolean(env.JARVIS_STT_PYTHON&&env.JARVIS_STT_MODEL)}. Configuration does not prove inference readiness.`);
 if(process.argv.includes('--check'))return;
 if(!process.stdin.isTTY)throw Error('Use an interactive terminal, or --check for read-only status.');
 const rl=createInterface({input:process.stdin,output:process.stdout});try{
  const choice=(await rl.question('1 Select installed local AI model; 2 Disable AI; 3 Set offline speech paths; 4 Disable offline speech; 0 Cancel: ')).trim();let patch;
  if(choice==='0')return;
  if(choice==='1'){
   console.log('Disable cloud in the separately running Ollama service first (OLLAMA_NO_CLOUD=1 or disable_ollama_cloud in its server.json), restart it and confirm its logs. This wizard cannot attest that setting.');
   if((await rl.question('Type LOCAL ONLY to confirm you configured Ollama itself: ')).trim()!=='LOCAL ONLY')return;
   const names=await installedModels();if(!names.length)throw Error('No eligible installed local models found. Install one separately.');names.forEach((name,i)=>console.log(`${i+1}. ${name}`));const index=Number(await rl.question('Choose model number (0 cancels): '));if(index===0)return;if(!Number.isInteger(index)||index<1||index>names.length)throw Error('Invalid selection.');patch={JARVIS_OLLAMA_MODEL:names[index-1]};
  }else if(choice==='2')patch={JARVIS_OLLAMA_MODEL:''};
  else if(choice==='3')patch=validateSpeechPaths((await rl.question('Absolute path to your existing Python executable: ')).trim(),(await rl.question('Absolute path to your existing faster-whisper model folder: ')).trim());
  else if(choice==='4')patch={JARVIS_STT_PYTHON:'',JARVIS_STT_MODEL:''};else throw Error('Invalid selection.');
  console.log('Only these settings will be appended as overrides: '+Object.keys(patch).join(', '));console.log('No password change, model download, dependency installation or source-app change. Existing JARVIS processes keep old settings until you restart them.');
  if((await rl.question('Type SAVE to apply, or Enter to cancel: ')).trim()!=='SAVE')return;saveEngineConfig(root,original,patch);console.log('Saved. Close the JARVIS terminal, then run Start-JARVIS-Built.bat again. Unlock and enable the engine in the app.');
 }finally{rl.close();}
}
main().catch(()=>{console.error('Engine setup did not complete. Check local setup, your selection, existing engine/model files and whether .env changed. No secret values are printed.');process.exitCode=1;});
