export const sampleRate=16000,maxSeconds=30,maxWavBytes=44+sampleRate*2*maxSeconds;
export function validateWav(bytes:Uint8Array){
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),tag=(at:number)=>String.fromCharCode(...bytes.slice(at,at+4));
  if(bytes.length<46||bytes.length>maxWavBytes||tag(0)!=='RIFF'||tag(8)!=='WAVE'||tag(12)!=='fmt '||v.getUint32(16,true)!==16||v.getUint16(20,true)!==1||v.getUint16(22,true)!==1||v.getUint32(24,true)!==sampleRate||v.getUint32(28,true)!==32000||v.getUint16(32,true)!==2||v.getUint16(34,true)!==16||tag(36)!=='data'||v.getUint32(40,true)!==bytes.length-44||v.getUint32(4,true)!==bytes.length-8||(bytes.length-44)%2)throw Error('invalid_audio');
  return (bytes.length-44)/2/sampleRate;
}
/** Bounded mono PCM for the local worker. Linear resampling is not a studio DSP claim. */
export function encodeWav(chunks:Float32Array[],rate:number){
  if(!Number.isFinite(rate)||rate<8000||rate>192000)throw Error('invalid_sample_rate');
  const length=chunks.reduce((n,c)=>n+c.length,0);if(length<1||length>rate*maxSeconds)throw Error('invalid_audio_length');
  const samples=new Float32Array(length);let offset=0;for(const c of chunks){samples.set(c,offset);offset+=c.length;}
  const count=Math.floor(length*sampleRate/rate),out=new Uint8Array(44+count*2),v=new DataView(out.buffer),tag=(at:number,s:string)=>{for(let i=0;i<s.length;i++)out[at+i]=s.charCodeAt(i);};
  tag(0,'RIFF');v.setUint32(4,out.length-8,true);tag(8,'WAVE');tag(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sampleRate,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);tag(36,'data');v.setUint32(40,count*2,true);
  for(let i=0;i<count;i++){const pos=i*rate/sampleRate,a=Math.floor(pos),mix=pos-a,x=samples[a]*(1-mix)+(samples[Math.min(a+1,length-1)]||0)*mix;if(!Number.isFinite(x))throw Error('invalid_sample');v.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,x))*32767),true);}
  validateWav(out);return out;
}
