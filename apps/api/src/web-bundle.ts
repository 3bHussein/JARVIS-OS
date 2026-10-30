import {lstatSync,realpathSync,readFileSync} from 'node:fs';
import {join,dirname,sep} from 'node:path';
export interface WebAsset {body:Buffer;type:string;immutable:boolean;}
export type WebBundle=ReadonlyMap<string,WebAsset>;
/** Load only index.html and its named hashed entry assets, never a directory web root. */
export function loadWebBundle(directory:string):WebBundle {
  const root=realpathSync(directory);if(lstatSync(directory).isSymbolicLink()||!lstatSync(root).isDirectory())throw Error('Invalid web bundle');
  let total=0;const read=(relative:string,max:number)=>{const path=join(root,relative),parent=dirname(path);if(lstatSync(path).isSymbolicLink()||lstatSync(parent).isSymbolicLink()||!realpathSync(path).startsWith(root+sep))throw Error('Invalid web bundle file');const stat=lstatSync(path);if(!stat.isFile()||stat.size>max)throw Error('Web bundle file too large');const bytes=readFileSync(path);total+=bytes.length;if(total>8*1024*1024)throw Error('Web bundle too large');return bytes;};
  const index=read('index.html',131072),html=index.toString('utf8');
  const names=[...html.matchAll(/(?:src|href)="(\/assets\/[^"<>]+)"/g)].map(m=>m[1]);
  if(!names.length||names.length>8||names.some(n=>!/^\/assets\/[A-Za-z0-9_-]+-[A-Za-z0-9_-]{6,}\.(?:js|css)$/.test(n)))throw Error('Unsupported web bundle entries');
  const bundle=new Map<string,WebAsset>();bundle.set('/',{body:index,type:'text/html; charset=utf-8',immutable:false});bundle.set('/index.html',bundle.get('/')!);
  for(const name of new Set(names)){const css=name.endsWith('.css');bundle.set(name,{body:read(name.slice(1),4*1024*1024),type:css?'text/css; charset=utf-8':'text/javascript; charset=utf-8',immutable:true});}
  if(!names.some(n=>n.endsWith('.js')))throw Error('Web bundle script missing');return bundle;
}
export const webCsp="default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; media-src 'self' blob:; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'";
