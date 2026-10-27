import { readFileSync, writeFileSync } from 'node:fs';
import { hashPassword } from '../apps/api/src/auth.ts';
// Password is read from stdin, never a command-line argument or environment log.
const password=readFileSync(0,'utf8').replace(/\r?\n$/,'');
const hash=hashPassword(password);
if(process.argv.includes('--write-env')){
  writeFileSync('.env',`JARVIS_PASSWORD_HASH=${hash}\nJARVIS_ORIGIN=http://127.0.0.1:5173\n`,{flag:'wx',mode:0o600});
  console.log('Created .env. Keep it private.');
}else console.log(`JARVIS_PASSWORD_HASH=${hash}`);
