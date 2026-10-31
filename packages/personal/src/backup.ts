import {validateData,type PersonalData} from './model.ts';
const limit=1048576,aad=new TextEncoder().encode('jarvis-portable-backup-v1');
const hex=(v:Uint8Array)=>Array.from(v,b=>b.toString(16).padStart(2,'0')).join('');
function bytes(v:unknown,length?:number){if(typeof v!=='string'||!v.length||v.length%2||!/^[a-f0-9]+$/.test(v)||v.length>limit||length&&v.length!==length*2)throw Error('invalid_backup');return new Uint8Array(v.match(/../g)!.map(x=>parseInt(x,16)));}
async function key(password:string,salt:Uint8Array<ArrayBuffer>){
 if(password.length<12||password.length>256)throw Error('backup_password');
 const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
/** Portable format is separate from the server vault. Only owner-entered data is included. */
export async function encryptBackup(input:PersonalData,password:string):Promise<string>{
 const data=validateData(input),salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const plain=new TextEncoder().encode(JSON.stringify({createdAt:new Date().toISOString(),data}));
 try{const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},await key(password,salt),plain);
 const result=JSON.stringify({format:'jarvis-personal-backup',version:1,kdf:'PBKDF2-SHA256',iterations:600000,salt:hex(salt),iv:hex(iv),cipher:hex(new Uint8Array(cipher))});if(result.length>limit)throw Error('invalid_backup');return result;
 }finally{plain.fill(0);}
}
export async function decryptBackup(raw:string,password:string):Promise<{createdAt:string;data:PersonalData}>{
 if(raw.length>limit)throw Error('invalid_backup');let v;try{v=JSON.parse(raw);}catch{throw Error('invalid_backup');}
 if(v?.format!=='jarvis-personal-backup'||v.version!==1||v.kdf!=='PBKDF2-SHA256'||v.iterations!==600000)throw Error('invalid_backup');
 const salt=bytes(v.salt,16),iv=bytes(v.iv,12),cipher=bytes(v.cipher);if(cipher.length<16)throw Error('invalid_backup');
 const derived=await key(password,salt);let plain:ArrayBuffer;try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad},derived,cipher);}catch{throw Error('backup_unlock_failed');}
 try{const payload=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plain));if(typeof payload.createdAt!=='string'||!Number.isFinite(Date.parse(payload.createdAt)))throw Error('invalid_backup');return {createdAt:payload.createdAt,data:validateData(payload.data)};}finally{new Uint8Array(plain).fill(0);}
}
