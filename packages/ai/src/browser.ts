export const deviceModelId='Qwen3-0.6B-q4f16_1-MLC';
export interface DeviceEngine {generate(text:string,language:'ar'|'en'):Promise<string>;stop():void;}
export type DeviceLoader=(signal:AbortSignal,progress:(value:number)=>void)=>Promise<DeviceEngine>;
/** No imports, downloads or inference until explicit load(). Each request is stateless. */
export class DeviceModel {
 private engine:DeviceEngine|null=null;private epoch=0;private pending:AbortController|null=null;private busy=false;private replyAbort:AbortController|null=null;
 async load(loader:DeviceLoader,progress:(v:number)=>void){this.clear();const epoch=this.epoch,controller=new AbortController();this.pending=controller;
  try{const engine=await loader(controller.signal,v=>{if(this.epoch===epoch)progress(Math.max(0,Math.min(1,v)));});if(this.epoch!==epoch){engine.stop();throw Error('device_cancelled');}this.engine=engine;}finally{if(this.epoch===epoch)this.pending=null;}
 }
 async ask(text:string,language:'ar'|'en'){if(!this.engine||this.busy)throw Error('device_not_ready');if(!text.trim()||text.length>2000)throw Error('device_invalid_input');const epoch=this.epoch,controller=new AbortController();this.replyAbort=controller;this.busy=true;const timer=setTimeout(()=>this.clear(),90000);try{const result=await Promise.race([this.engine.generate(text.trim(),language),new Promise<never>((_,reject)=>controller.signal.addEventListener('abort',()=>reject(Error('device_cancelled')),{once:true}))]);if(this.epoch!==epoch)throw Error('device_cancelled');if(typeof result!=='string'||!result.trim()||result.length>12000)throw Error('device_invalid_answer');return result.trim();}finally{clearTimeout(timer);if(this.epoch===epoch){this.busy=false;this.replyAbort=null;}}}
 clear(){this.epoch++;this.replyAbort?.abort();this.replyAbort=null;this.pending?.abort();this.pending=null;this.engine?.stop();this.engine=null;this.busy=false;}
}
