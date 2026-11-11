import {CreateWebWorkerMLCEngine,prebuiltAppConfig,deleteModelAllInfoInCache} from '@mlc-ai/web-llm';
import {deviceModelId,type DeviceEngine} from '../../../packages/ai/src/browser.ts';
const record=prebuiltAppConfig.model_list.find((m:{model_id:string})=>m.model_id===deviceModelId);
if(!record)throw Error('device_model_missing');
const appConfig={...prebuiltAppConfig,model_list:[record]};
export async function loadDeviceEngine(signal:AbortSignal,progress:(value:number)=>void):Promise<DeviceEngine>{
 const worker=new Worker(new URL('./device-worker.ts',import.meta.url),{type:'module'});
 const stop=()=>worker.terminate();signal.addEventListener('abort',stop,{once:true});
 try{
  const pending=CreateWebWorkerMLCEngine(worker,deviceModelId,{appConfig,initProgressCallback:(v:{progress:number})=>progress(v.progress),logLevel:'SILENT'});
  const cancelled=new Promise<never>((_,reject)=>{if(signal.aborted)reject(Error('device_cancelled'));else signal.addEventListener('abort',()=>reject(Error('device_cancelled')),{once:true});});
  const engine=await Promise.race([pending,cancelled]);
  return {stop,async generate(text,language){
   await engine.resetChat();
   const result=await engine.chat.completions.create({messages:[{role:'system',content:'You are JARVIS. Reply briefly in '+(language==='ar'?'Egyptian Arabic':'English')+'. You have no access to saved records, previous turns, tools or actions. Never invent personal data or claim to execute tasks. Do not request secrets. Your answer may be wrong; acknowledge uncertainty.'},{role:'user',content:text}],stream:false,max_tokens:384,temperature:0.2,extra_body:{enable_thinking:false,resumable:{enabled:false}}});
   if(result.choices[0]?.finish_reason!=='stop'||result.choices[0].message.tool_calls?.length)throw Error('device_invalid_answer');return result.choices[0].message.content??'';
  }};
 }catch(error){stop();throw error;}
}
export async function deleteDeviceModel(){await deleteModelAllInfoInCache(deviceModelId,appConfig);}
