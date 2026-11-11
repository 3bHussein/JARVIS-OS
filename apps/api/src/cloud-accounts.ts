import {createCipheriv,createDecipheriv,randomBytes,createHash} from 'node:crypto';
import {clock} from '../../../packages/core/src/index.ts';
import {CloudRedis} from './cloud-redis.ts';
import {authorizeAccount,readAccount,AccountError,type AccountGrant,type AccountProvider} from '../../../packages/connectors/src/account-reader.ts';
export const accountCompareAndSetScript="local v=redis.call('GET',KEYS[1]); if (v or '')~=ARGV[1] then return 0 end; redis.call('SET',KEYS[1],ARGV[2],'EX',ARGV[3]); return 1";
interface RecordValue {grant:AccountGrant|null;cache?:{version?:number;zone:string;at:number;result:Awaited<ReturnType<typeof readAccount>>};}
/** Short-lived, session-bound grants. No password, refresh token or raw health payload is persisted. */
export class CloudAccounts {
 private redis:CloudRedis;private keyHex:string;private namespace:string;private session:string;private transport:typeof fetch;
 constructor(redis:CloudRedis,keyHex:string,namespace:string,session:string,transport:typeof fetch=fetch){this.redis=redis;this.keyHex=keyHex;this.namespace=namespace;this.session=session;this.transport=transport;}
 private key(provider:AccountProvider){return `jarvis:${this.namespace}:account:${createHash('sha256').update(this.session).digest('hex')}:${provider}`;}
 private encrypt(provider:AccountProvider,value:RecordValue){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',Buffer.from(this.keyHex,'hex'),iv);cipher.setAAD(Buffer.from(this.key(provider)));const bytes=Buffer.concat([cipher.update(JSON.stringify(value)),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),bytes]).toString('base64');}
 private async load(provider:AccountProvider){const raw=await this.redis.command(['GET',this.key(provider)]);if(raw===null)return {raw:'',value:{grant:null} as RecordValue};if(typeof raw!=='string'||raw.length>100000)throw new AccountError('source_storage_unavailable',503);try{const b=Buffer.from(raw,'base64'),d=createDecipheriv('aes-256-gcm',Buffer.from(this.keyHex,'hex'),b.subarray(0,12));d.setAAD(Buffer.from(this.key(provider)));d.setAuthTag(b.subarray(12,28));const value:RecordValue=JSON.parse(Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8'));return {raw,value};}catch{throw new AccountError('source_storage_unavailable',503);}}
 async status(provider:AccountProvider){const {value}=await this.load(provider);return {connected:Boolean(value.grant&&value.grant.expiresAt>Date.now()),expiresAt:value.grant?.expiresAt??null,lastRead:value.cache?.at?new Date(value.cache.at).toISOString():null};}
 async connect(provider:AccountProvider,input:Parameters<typeof authorizeAccount>[1],consent:unknown){
  if(consent!==true)throw new AccountError('source_consent_required');const old=await this.load(provider);const grant=await authorizeAccount(provider,input,this.transport);
  if(await this.redis.command(['EVAL',accountCompareAndSetScript,1,this.key(provider),old.raw,this.encrypt(provider,{grant}),Math.max(1,Math.floor((grant.expiresAt-Date.now())/1000))])!==1)throw new AccountError('source_connection_changed',409);
  return {connected:true,expiresAt:grant.expiresAt};
 }
 async disconnect(provider:AccountProvider){
  // A tombstone prevents an already-started connect/read CAS from resurrecting a disconnected grant.
  if(await this.redis.command(['SET',this.key(provider),this.encrypt(provider,{grant:null}),'EX',3600])!=='OK')throw new AccountError('source_storage_unavailable',503);
 }
 async read(provider:AccountProvider,zone:string,force=false){
  try{new Intl.DateTimeFormat('en',{timeZone:zone});}catch{throw new AccountError('invalid_timezone');}
  const old=await this.load(provider),{grant,cache}=old.value,now=Date.now();
  if(!grant)return {status:'disconnected',facts:null,summary:null};
  if(grant.expiresAt<=now)return {status:'expired',facts:null,summary:null,error:'source_session_expired'};
  const age=cache?now-cache.at:Infinity;
  // A recent projection belongs to its local day, not just its five-minute TTL.
  const sameDay=cache&&Number.isFinite(cache.at)&&clock(new Date(cache.at),zone).date===clock(new Date(now),zone).date;
  if(cache&&cache.version===2&&cache.zone===zone&&sameDay&&age>=0&&age<(force?30000:300000))return cache.result;
  // Distributed request coalescing bounds upstream reads across serverless instances.
  const attempts=await this.redis.command(['EVAL',"local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n",1,this.key(provider)+':read-rate']);
  if(typeof attempts!=='number'||attempts>10)throw new AccountError('source_rate_limited',429);
  const lock=this.key(provider)+':read-lock',owner=randomBytes(16).toString('hex');
  if(await this.redis.command(['SET',lock,owner,'NX','EX',25])!=='OK')return {status:'busy',facts:null,summary:null,error:'source_read_in_progress'};
  try{
   const result=await readAccount(provider,grant,zone,this.transport,new Date(now));
   if('summary'in result&&result.summary?.issues?.length)console.warn('jarvis_source_sections',{provider,issues:result.summary?.issues});
   if(await this.redis.command(['EVAL',accountCompareAndSetScript,1,this.key(provider),old.raw,this.encrypt(provider,{grant,cache:{version:2,zone,at:now,result}}),Math.max(1,Math.floor((grant.expiresAt-Date.now())/1000))])!==1)return {status:'disconnected',facts:null,summary:null};
   return result;
  }catch(error){
   if(error instanceof AccountError&&error.status===401){await this.redis.command(['EVAL',accountCompareAndSetScript,1,this.key(provider),old.raw,this.encrypt(provider,{grant:null}),3600]);return {status:'expired',facts:null,summary:null,error:'source_session_expired'};}
   if(error instanceof AccountError)throw error;
   throw new AccountError('source_unavailable',502);
  }finally{
   await this.redis.command(['EVAL',"if redis.call('GET',KEYS[1])==ARGV[1] then return redis.call('DEL',KEYS[1]) end; return 0",1,lock,owner]);
  }
 }
}
