import {randomBytes,scryptSync,createCipheriv,createDecipheriv} from 'node:crypto';
import {existsSync,statSync,readFileSync,writeFileSync,mkdirSync,renameSync,unlinkSync} from 'node:fs';
import {join} from 'node:path';
import {emptyData,validateData,type PersonalState} from '../../../packages/personal/src/model.ts';
export interface PersonalContext {key:Buffer|null;state:PersonalState;locked:boolean;epoch:number;diskRevision:number;}
export class PersonalStore {
  private salt=randomBytes(16);private epoch=0;private directory:string|undefined;
  constructor(directory?:string){this.directory=directory;if(directory&&existsSync(join(directory,'personal.enc.json'))){try{this.salt=Buffer.from(this.envelope().salt,'hex');}catch{}}}
  private envelope(){const path=join(this.directory!,'personal.enc.json');if(statSync(path).size>1048576)throw Error('personal_locked');const raw=readFileSync(path,'utf8');if(raw.length>1048576)throw Error('personal_locked');const v=JSON.parse(raw);if(v.version!==1||!/^[a-f0-9]{32}$/.test(v.salt)||!/^[a-f0-9]{24}$/.test(v.iv)||!/^[a-f0-9]{32}$/.test(v.tag)||typeof v.cipher!=='string')throw Error('personal_locked');return v;}
  unlock(password:string):PersonalContext {
    const ctx:PersonalContext={key:this.directory?scryptSync(password,this.salt,32):null,state:{revision:0,data:emptyData(),persistent:false},locked:false,epoch:this.epoch,diskRevision:0};
    if(this.directory&&existsSync(join(this.directory,'personal.enc.json'))){try{ctx.state=this.decode(ctx);ctx.diskRevision=ctx.state.revision;}catch{ctx.key?.fill(0);ctx.key=null;ctx.locked=true;}}
    return ctx;
  }
  private decode(ctx:PersonalContext):PersonalState {
    if(!ctx.key)throw Error('personal_locked');const e=this.envelope();if(e.salt!==this.salt.toString('hex'))throw Error('personal_locked');
    const decipher=createDecipheriv('aes-256-gcm',ctx.key,Buffer.from(e.iv,'hex'));decipher.setAAD(Buffer.from('jarvis-personal-v1'));decipher.setAuthTag(Buffer.from(e.tag,'hex'));
    const v=JSON.parse(Buffer.concat([decipher.update(Buffer.from(e.cipher,'base64')),decipher.final()]).toString('utf8'));
    if(!Number.isSafeInteger(v.revision)||v.revision<0)throw Error('personal_locked');return {revision:v.revision,data:validateData(v.data),persistent:true};
  }
  read(ctx:PersonalContext,reload=false){
    if(ctx.epoch!==this.epoch)throw Error('reauthenticate');
    if(ctx.locked)return {...ctx.state,locked:true,storageAvailable:Boolean(this.directory)};
    if(ctx.state.persistent||reload&&this.directory&&existsSync(join(this.directory,'personal.enc.json'))){ctx.state=this.decode(ctx);ctx.diskRevision=ctx.state.revision;}
    return {...ctx.state,locked:false,storageAvailable:Boolean(this.directory)};
  }
  save(ctx:PersonalContext,input:unknown,revision:unknown,remember:boolean){
    if(ctx.locked||ctx.epoch!==this.epoch)throw Error('personal_locked');
    const data=validateData(input);
    let current=this.read(ctx);
    if(remember&&this.directory&&existsSync(join(this.directory,'personal.enc.json'))&&this.decode(ctx).revision!==ctx.diskRevision)throw Error('personal_conflict');
    if(!Number.isSafeInteger(revision)||revision!==current.revision)throw Error('personal_conflict');
    const next={revision:current.revision+1,data,persistent:remember};
    if(remember){
      if(!this.directory||!ctx.key)throw Error('storage_unavailable');
      const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',ctx.key,iv);cipher.setAAD(Buffer.from('jarvis-personal-v1'));
      const encrypted=Buffer.concat([cipher.update(JSON.stringify({revision:next.revision,data})),cipher.final()]);
      const payload=JSON.stringify({version:1,salt:this.salt.toString('hex'),iv:iv.toString('hex'),tag:cipher.getAuthTag().toString('hex'),cipher:encrypted.toString('base64')});
      if(Buffer.byteLength(payload)>1048576)throw Error('storage_unavailable');
      mkdirSync(this.directory,{recursive:true,mode:0o700});const path=join(this.directory,'personal.enc.json'),temp=join(this.directory,`pending-${randomBytes(8).toString('hex')}`);
      try{writeFileSync(temp,payload,{flag:'wx',mode:0o600});renameSync(temp,path);ctx.diskRevision=next.revision;}finally{if(existsSync(temp))unlinkSync(temp);}
    }
    ctx.state=next;return this.read(ctx);
  }
  erase(ctx:PersonalContext){if(ctx.epoch!==this.epoch)throw Error('reauthenticate');if(this.directory&&existsSync(join(this.directory,'personal.enc.json')))unlinkSync(join(this.directory,'personal.enc.json'));this.epoch++;this.salt=randomBytes(16);ctx.key?.fill(0);ctx.key=null;ctx.state={revision:0,data:emptyData(),persistent:false};}
  forget(ctx:PersonalContext){ctx.key?.fill(0);ctx.key=null;ctx.state={revision:0,data:emptyData(),persistent:false};}
}
