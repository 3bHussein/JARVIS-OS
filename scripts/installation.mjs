import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {loadWebBundle} from '../apps/api/src/web-bundle.ts';
export function builtWebReady(root){try{loadWebBundle(join(root,'apps/web/dist'));return true;}catch{return false;}}
export function sourceAvailable(root){try{const p=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));return p.name==='jarvis-os'&&['package-lock.json','apps/web/vite.config.ts','apps/web/src/main.tsx'].every(p=>existsSync(join(root,p)));}catch{return false;}}
export function installation(root){if(builtWebReady(root))return 'built';if(sourceAvailable(root))return 'source';throw Error('This copy is incomplete: built web files are missing or invalid. Extract the complete JARVIS-OS-Personal-Preview download into a new folder, then run 01-Setup-JARVIS.bat. Keep existing private .env and .jarvis-data files.');}
export function requireBuiltWeb(root){if(!builtWebReady(root))throw Error('Built web files are missing or invalid. Run 01-Setup-JARVIS.bat first; it builds a complete source download. If this is a ready-built preview, extract the complete download into a new folder. No existing process or private data was changed.');}
