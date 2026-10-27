import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readGitHub} from '../packages/connectors/src/github.ts';
const repo='3bHussein/ProgressXX-Web';
test('GH-01 disconnected never calls upstream',async()=>{
 const result=await readGitHub(repo,'repository',undefined,async()=>{throw Error('Must not call')});assert.equal(result.status,'disconnected');assert.equal(result.source.observedAt,null);
});
test('GH-02 arbitrary repository or prototype resource denied',async()=>{
 await assert.rejects(readGitHub('evil/repo','repository','synthetic'));await assert.rejects(readGitHub(repo,'toString' as any,'synthetic'));
});
test('GH-03 safe projection and bounded source provenance',async()=>{
 let called='';const transport:typeof fetch=async(url,init)=>{called=String(url);assert.equal(init?.method,undefined);assert.equal(init?.redirect,'error');return Response.json([{title:'Synthetic issue',state:'open',html_url:`https://github.com/${repo}/issues/1`,body:'PRIVATE BODY OMITTED'},{title:'PR',pull_request:{},html_url:`https://github.com/${repo}/pull/1`}])};
 const result=await readGitHub(repo,'issues','test-only',transport,new Date('2026-01-01T00:00:00Z'));assert.ok(called.startsWith('https://api.github.com/repos/'));assert.equal(result.data?.items.length,1);assert.ok(!JSON.stringify(result).includes('PRIVATE BODY'));assert.equal(result.source.observedAt,'2026-01-01T00:00:00.000Z');
});
test('GH-04 unauthorized, rate-limited, outage and malformed response',async()=>{
 for(const [status,error] of [[401,'unauthorized'],[429,'rate_limited'],[503,'upstream_unavailable']] as const){const r=await readGitHub(repo,'repository','test',async()=>new Response('',{status}));assert.equal(r.error,error);assert.equal(r.source.observedAt,null);}
 const invalid=await readGitHub(repo,'pulls','test',async()=>Response.json([{title:'bad',html_url:'javascript:alert(1)'}]));assert.equal(invalid.error,'invalid_response');
 const network=await readGitHub(repo,'actions','test',async()=>{throw Error('Network')});assert.equal(network.status,'error');
});
test('GH-05 upstream response byte limit fails closed',async()=>{
 const result=await readGitHub(repo,'repository','test',async()=>new Response('x'.repeat(2000001)));
 assert.equal(result.error,'invalid_response');assert.equal(result.source.observedAt,null);
 const header=await readGitHub(repo,'repository','test',async()=>new Response('{}',{headers:{'content-length':'3000000'}}));
 assert.equal(header.error,'invalid_response');
});
