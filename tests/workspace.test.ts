import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readPreferences,savePreferences,preferencesKey} from '../packages/core/src/preferences.ts';
import {GitHubReader} from '../packages/connectors/src/github-reader.ts';
const repo='3bHussein/JARVIS-OS';
const fixture=()=>({name:'Synthetic project',html_url:`https://github.com/${repo}`});
test('PREF-01 validate stored settings and exclude private data',()=>{
  let saved='';const storage={getItem:()=>saved,setItem:(key:string,value:string)=>{assert.equal(key,preferencesKey);saved=value;}};
  assert.equal(savePreferences(storage,{locale:'ar',zone:'Asia/Dubai',motion:'off',quiet:false,password:'SECRET',chat:'SECRET'}),true);
  assert.deepEqual(readPreferences(storage),{locale:'ar',zone:'Asia/Dubai',motion:'off',quiet:false});assert.ok(!saved.includes('SECRET'));
  saved='broken';assert.equal(readPreferences(storage).zone,'Africa/Cairo');
  saved=JSON.stringify({zone:'Not/Valid',motion:'unknown',locale:'xx'});assert.equal(readPreferences(storage).motion,'full');assert.equal(readPreferences(storage).zone,'Africa/Cairo');
  assert.equal(savePreferences({setItem:()=>{throw Error('denied')}},{}),false);
});
test('CACHE-01 configured is not ready; dedup, cache TTL and ETag revalidation',async()=>{
  let now=new Date('2026-01-01T00:00:00Z'),calls=0;
  const transport:typeof fetch=async(_url,init)=>{calls++;if(calls===1)return Response.json(fixture(),{headers:{etag:'"synthetic"'}});assert.equal(new Headers(init?.headers).get('if-none-match'),'"synthetic"');return new Response(null,{status:304});};
  const reader=new GitHubReader('synthetic',transport,()=>now);assert.equal(reader.status().status,'configured');assert.equal(reader.status().lastSuccessfulSync,null);
  const [a,b]=await Promise.all([reader.read(repo,'repository'),reader.read(repo,'repository')]);assert.equal(calls,1);assert.equal(a.status,'ready');assert.equal(b.status,'ready');
  assert.equal((await reader.read(repo,'repository')).cache,'hit');assert.equal(calls,1);
  now=new Date('2026-01-01T00:00:31Z');assert.equal((await reader.read(repo,'repository')).cache,'revalidated');assert.equal(calls,2);assert.equal(reader.status().lastSuccessfulSync,now.toISOString());
  now=new Date('2026-01-01T00:06:00Z');assert.equal(reader.status().status,'stale');
});
test('CACHE-02 sessions do not share results and failure preserves accurate history',async()=>{
  let fail=false,calls=0;const transport:typeof fetch=async()=>{calls++;return fail?new Response('',{status:503}):Response.json(fixture())};
  const a=new GitHubReader('synthetic',transport),b=new GitHubReader('synthetic',transport);
  await a.read(repo,'repository');assert.equal(b.status().lastSuccessfulSync,null);await b.read(repo,'repository');assert.equal(calls,2);
  const success=a.status().lastSuccessfulSync;fail=true;
  const result=await a.read(repo,'repository',true);assert.equal(result.data,null);assert.equal(a.status().status,'error');assert.equal(a.status().lastSuccessfulSync,success);
  await assert.rejects(a.read('product-engineerAutomax/Autel-Code-Manager','repository'));
});
test('CACHE-03 honor Retry-After across resources without hidden retries',async()=>{
  let calls=0;const reader=new GitHubReader('synthetic',async()=>{calls++;return new Response('',{status:429,headers:{'retry-after':'7200'}})},()=>new Date('2026-01-01T00:00:00Z'));
  const first=await reader.read(repo,'repository');assert.equal(first.retryAt,'2026-01-01T02:00:00.000Z');
  const second=await reader.read(repo,'issues');assert.equal(calls,1);assert.equal(second.error,'rate_limited');
});
test('CACHE-04 unauthorized discards cached metadata and configured token does not leak',async()=>{
  let revoked=false;const reader=new GitHubReader('NEVER_RETURN_THIS',async()=>revoked?new Response('',{status:401}):Response.json(fixture()));
  await reader.read(repo,'repository');revoked=true;await reader.read(repo,'repository',true);
  assert.equal(reader.status().lastSuccessfulSync,null);assert.ok(!JSON.stringify(reader.status()).includes('NEVER_RETURN_THIS'));
});
