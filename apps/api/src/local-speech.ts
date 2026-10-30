import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {isAbsolute} from 'node:path';
import {validateWav,maxWavBytes} from '../../../packages/voice/src/audio.ts';
export interface SpeechInput {audio:string;language:'ar'|'en'|'auto';}
export interface SpeechResult {text:string;final:true;language:string;durationSeconds:number;engine:'faster-whisper-local';reviewRequired:true;}
export interface SpeechProvider {transcribe(input:SpeechInput,signal:AbortSignal):Promise<SpeechResult>;}
export function speechInput(value:unknown):SpeechInput {
  const v=value as Record<string,unknown>;
  if(!v||typeof v.audio!=='string'||v.audio.length>Math.ceil(maxWavBytes/3)*4||!v.audio.length||v.audio.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(v.audio)||!['ar','en','auto'].includes(String(v.language)))throw Error('invalid_audio');
  const bytes=Buffer.from(v.audio,'base64');if(bytes.toString('base64')!==v.audio)throw Error('invalid_audio');validateWav(bytes);return {audio:v.audio,language:v.language as SpeechInput['language']};
}
export class LocalSpeech implements SpeechProvider {
  private python:string;private model:string;
  constructor(python:string,model:string){if(!isAbsolute(python)||!isAbsolute(model))throw Error('Absolute speech executable/model paths required');this.python=python;this.model=model;}
  async transcribe(input:SpeechInput,signal:AbortSignal):Promise<SpeechResult>{
    speechInput(input);if(signal.aborted)throw Error('speech_cancelled');
    return new Promise((resolve,reject)=>{
      const env:NodeJS.ProcessEnv={HF_HUB_OFFLINE:'1',TRANSFORMERS_OFFLINE:'1',PYTHONIOENCODING:'utf-8'};for(const key of ['PATH','Path','SystemRoot','WINDIR','TEMP','TMP'])if(process.env[key])env[key]=process.env[key];
      const child=spawn(this.python,['-I','-B',fileURLToPath(new URL('../../voice-worker/worker.py',import.meta.url)),this.model],{shell:false,windowsHide:true,env,stdio:['pipe','pipe','pipe']});
      let output='',size=0,settled=false;const finish=(error?:Error,result?:SpeechResult)=>{if(settled)return;settled=true;clearTimeout(timer);signal.removeEventListener('abort',cancel);error?reject(error):resolve(result!);};
      const cancel=()=>{child.kill();finish(Error('speech_cancelled'));},timer=setTimeout(()=>{child.kill();finish(Error('speech_timeout'));},120000);signal.addEventListener('abort',cancel,{once:true});
      child.stdout.on('data',chunk=>{size+=chunk.length;if(size>32768){child.kill();finish(Error('invalid_speech_result'));}else output+=chunk.toString();});child.stderr.on('data',()=>{});child.stdin.on('error',()=>{});child.on('error',()=>finish(Error('speech_worker_unavailable')));
      child.on('close',code=>{if(settled)return;try{const r=JSON.parse(output);if(code!==0||typeof r.text!=='string'||r.text.length>4000||r.final!==true||r.reviewRequired!==true||r.engine!=='faster-whisper-local'||typeof r.language!=='string'||typeof r.durationSeconds!=='number'||!Number.isFinite(r.durationSeconds)||r.durationSeconds<=0||r.durationSeconds>30)throw Error();finish(undefined,{text:r.text,final:true,language:r.language.slice(0,12),durationSeconds:r.durationSeconds,engine:'faster-whisper-local',reviewRequired:true});}catch{finish(Error('local_transcription_failed'));}});
      child.stdin.end(JSON.stringify(input));
    });
  }
}
