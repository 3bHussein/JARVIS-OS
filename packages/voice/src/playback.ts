export type PlaybackState={active:boolean;part:number;total:number};
export interface SpeechDriver {speak(text:string,events:{start():void;end():void;error(code:string):void}):void;cancel():void;}
/** Bounded sentence/word chunks. Never splits a Unicode code point. */
export function speechChunks(text:string,limit=1200):string[]{
 if(!Number.isInteger(limit)||limit<20||limit>1200)throw Error('Invalid speech chunk limit');
 let rest=Array.from(text.trim()).slice(0,12000);const chunks:string[]=[];
 while(rest.length){let end=Math.min(limit,rest.length);if(end<rest.length){const prefix=rest.slice(0,end).join('');const sentence=[...prefix.matchAll(/[.!?؟؛\n]\s/gu)].at(-1);const word=prefix.lastIndexOf(' ');const boundary=sentence?Array.from(prefix.slice(0,sentence.index!+1)).length:word>0?Array.from(prefix.slice(0,word)).length:0;if(boundary>=limit/3)end=boundary;}
  const chunk=rest.slice(0,end).join('').trim();rest=rest.slice(end);while(rest[0]&&/\s/u.test(rest[0]))rest.shift();if(chunk)chunks.push(chunk);
 }return chunks;
}
/** One active queue. Cancellation invalidates late browser events before calling cancel. */
export class SpeechPlayback {
 private epoch=0;private queue:string[]=[];private cursor=0;
 private driver:SpeechDriver;private state:(value:PlaybackState)=>void;private failure:(code:string)=>void;
 constructor(driver:SpeechDriver,state:(value:PlaybackState)=>void,failure:(code:string)=>void){this.driver=driver;this.state=state;this.failure=failure;}
 stop(){this.epoch++;this.queue=[];this.cursor=0;try{this.driver.cancel();}catch{}this.state({active:false,part:0,total:0});}
 play(text:string){this.stop();this.queue=speechChunks(text);if(!this.queue.length)return;const epoch=this.epoch;this.next(epoch);}
 private next(epoch:number){
  if(epoch!==this.epoch)return;
  if(this.cursor>=this.queue.length){this.queue=[];this.cursor=0;this.state({active:false,part:0,total:0});return;}
  const part=this.cursor,content=this.queue[part];let finished=false;
  this.state({active:true,part:part+1,total:this.queue.length});
  const current=()=>!finished&&epoch===this.epoch&&this.cursor===part;
  const error=(code:string)=>{if(!current())return;finished=true;this.stop();this.failure(code);};
  try{this.driver.speak(content,{start:()=>{if(current())this.state({active:true,part:part+1,total:this.queue.length});},end:()=>{if(!current())return;finished=true;this.cursor++;this.next(epoch);},error});}catch{error('synthesis-failed');}
 }
}
