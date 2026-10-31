import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encryptBackup,decryptBackup} from '../packages/personal/src/backup.ts';
import {emptyData} from '../packages/personal/src/model.ts';
const password='synthetic-only-backup-password';
test('BACKUP-01 authenticated portable encryption, random salt/IV, multilingual roundtrip and exclusion',async()=>{
 const data={...emptyData(),notes:[{id:'one',text:'نوت مصرية private marker',kind:'note' as const,at:null,minutes:30,done:false}]};
 const a=await encryptBackup({...data,token:'secret-not-allowed'} as typeof data,password),b=await encryptBackup(data,password);
 assert.notEqual(a,b);assert.ok(!a.includes('private marker'));assert.ok(!a.includes('secret-not-allowed'));
 const result=await decryptBackup(a,password);assert.deepEqual(result.data,data);assert.ok(Number.isFinite(Date.parse(result.createdAt)));
 await assert.rejects(decryptBackup(a,'wrong-long-password'),/backup_unlock_failed/);
 const tampered=JSON.parse(a);tampered.cipher=(tampered.cipher[0]==='a'?'b':'a')+tampered.cipher.slice(1);await assert.rejects(decryptBackup(JSON.stringify(tampered),password),/backup_unlock_failed/);
});
test('BACKUP-02 rejects oversized, unknown KDF/version and invalid passwords before expensive work',async()=>{
 await assert.rejects(encryptBackup(emptyData(),'short'),/backup_password/);
 await assert.rejects(decryptBackup('x'.repeat(1048577),password),/invalid_backup/);
 for(const patch of [{iterations:1},{version:2},{salt:'ff'},{iv:'00'},{cipher:'zz'}]){
 const raw={format:'jarvis-personal-backup',version:1,kdf:'PBKDF2-SHA256',iterations:600000,salt:'00'.repeat(16),iv:'00'.repeat(12),cipher:'00'.repeat(16),...patch};await assert.rejects(decryptBackup(JSON.stringify(raw),password),/invalid_backup/);
 }
});
test('BACKUP-03 maximum multilingual note capacity stays within the portable bound',async()=>{
 const data={...emptyData(),notes:Array.from({length:200},(_,i)=>({id:`n-${i}`,text:'字'.repeat(400),kind:'note' as const,at:null,minutes:1,done:false}))};const raw=await encryptBackup(data,password);assert.ok(raw.length<1048576);assert.deepEqual((await decryptBackup(raw,password)).data,data);
});
