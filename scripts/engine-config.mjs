import {parseEnv} from 'node:util';
import {isAbsolute,join} from 'node:path';
import {lstatSync,readFileSync,writeFileSync,renameSync,unlinkSync,existsSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
const keys=['JARVIS_OLLAMA_MODEL','JARVIS_STT_PYTHON','JARVIS_STT_MODEL'];
export function validLocalModel(v){return typeof v==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,99}$/.test(v)&&!/cloud/i.test(v);}
export async function installedModels(transport=fetch){
 const r=await transport('http://127.0.0.1:11434/api/tags',{redirect:'error',signal:AbortSignal.timeout(5000)});if(!r.ok||!r.body)throw Error('Ollama is unavailable. Start it separately; no model was installed.');
 const reader=r.body.getReader();let size=0,parts=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>262144)throw Error('Model list too large.');parts.push(value);}}finally{await reader.cancel().catch(()=>{});}
 const v=JSON.parse(Buffer.concat(parts).toString('utf8'));if(!Array.isArray(v.models)||v.models.length>1000)throw Error('Invalid model list.');
 return [...new Set(v.models.filter(m=>m&&validLocalModel(m.name)&&!m.remote_host&&!m.remote_model).map(m=>m.name))].sort();
}
export function validateSpeechPaths(python,model){
 for(const p of [python,model])if(typeof p!=='string'||p.length>2048||/[\x00-\x1f\x7f]/.test(p)||!isAbsolute(p))throw Error('Speech paths must be absolute local paths.');
 if(!lstatSync(python).isFile()||!lstatSync(model).isDirectory())throw Error('Python executable or model folder is missing.');
 for(const file of ['model.bin','config.json','tokenizer.json'])if(!lstatSync(join(model,file)).isFile())throw Error('Model requires model.bin, config.json and tokenizer.json.');
 return {JARVIS_STT_PYTHON:python,JARVIS_STT_MODEL:model};
}
export function readEngineConfig(root){const p=join(root,'.env'),s=lstatSync(p);if(!s.isFile()||s.isSymbolicLink()||s.size>262144)throw Error('Unsafe or oversized local configuration.');return readFileSync(p,'utf8');}
function quote(value){if(typeof value!=='string'||/[\x00-\x1f\x7f]/.test(value)||value.length>2048)throw Error('Invalid configuration value.');for(const q of ["'",'"'])if(!value.includes(q)&&parseEnv('X='+q+value+q).X===value)return q+value+q;throw Error('This value cannot be safely represented in the local env format.');}
export function patchEngineConfig(original,patch){
 const env=parseEnv(original),entries=Object.entries(patch);if(!entries.length||entries.some(([k])=>!keys.includes(k)))throw Error('Unsupported engine setting.');
 if(!/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(env.JARVIS_PASSWORD_HASH||''))throw Error('Run local setup first.');
 if(patch.JARVIS_OLLAMA_MODEL&&!validLocalModel(patch.JARVIS_OLLAMA_MODEL))throw Error('Invalid local model.');
 const next=original+'\n# JARVIS engine configuration: latest assignments take precedence\n'+entries.map(([k,v])=>k+'='+quote(v)).join('\n')+'\n';if(Buffer.byteLength(next)>262144)throw Error('Local configuration limit reached.');
 const parsed=parseEnv(next);for(const [k,v] of Object.entries(env))if(!(k in patch)&&parsed[k]!==v)throw Error('Unrelated configuration would change.');for(const [k,v] of entries)if(parsed[k]!==v)throw Error('Configuration roundtrip failed.');return next;
}
export function saveEngineConfig(root,original,patch){const next=patchEngineConfig(original,patch);if(readEngineConfig(root)!==original)throw Error('Configuration changed. Reopen the wizard; no overwrite made.');const path=join(root,'.env'),temp=join(root,'.env.pending-'+randomBytes(8).toString('hex'));try{writeFileSync(temp,next,{flag:'wx',mode:0o600});if(readEngineConfig(root)!==original)throw Error('Configuration changed. No overwrite made.');renameSync(temp,path);}finally{if(existsSync(temp))unlinkSync(temp);}}
