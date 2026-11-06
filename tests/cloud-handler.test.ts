import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCloudHandler} from '../apps/api/src/cloud-handler.ts';
import {hashPassword} from '../apps/api/src/auth.ts';
import {emptyData} from '../packages/personal/src/model.ts';

test('cloud session and encrypted records survive separate handler instances', async () => {
  const values = new Map<string, string>();
  const transport: typeof fetch = async (_url, init) => {
    const [op, a, b, c, d, e] = JSON.parse(String(init?.body));
    if (op === 'GET') return Response.json({result: values.get(a) ?? null});
    if (op === 'SET') {
      assert.equal(c, 'EX');
      assert.equal(d, 3600);
      values.set(a, b);
      return Response.json({result: 'OK'});
    }
    if (op === 'DEL') return Response.json({result: Number(values.delete(a))});
    assert.equal(op, 'EVAL');
    if (c.endsWith(':login-limit')) return Response.json({result: 1});
    if ((values.get(c) ?? '') !== d) return Response.json({result: 0});
    values.set(c, e);
    return Response.json({result: 1});
  };
  const origin = 'https://jarvis.example.test';
  const password = 'synthetic-cloud-password';
  const config = {origin, endpoint:'https://redis.example.test', token:'fixture',
    key:'a'.repeat(64), namespace:'fixture', passwordHash:hashPassword(password)};
  const call = (path: string, headers: Record<string,string> = {}, data?: unknown) =>
    createCloudHandler(config, transport)(new Request(origin + path, {
      method:data === undefined ? 'GET' : 'POST',
      headers:{Origin:origin, 'Content-Type':'application/json', ...headers},
      body:data === undefined ? undefined : JSON.stringify(data),
    }));
  assert.equal((await call('/api/personal')).status, 401);
  const login = await call('/api/session', {}, {password});
  assert.equal(login.status, 200);
  const cookie = login.headers.get('set-cookie')!;
  assert.match(cookie, /Secure; HttpOnly; SameSite=Strict/);
  const headers = {Cookie:cookie.split(';')[0], 'X-CSRF-Token':(await login.json()).csrf};
  const connectors = await (await call('/api/connectors', headers)).json();
  assert.ok(connectors.connectors.every((connector: {lastSuccessfulSync: string | null}) => connector.lastSuccessfulSync === null));
  assert.equal(connectors.connectors.find((connector: {id: string}) => connector.id === 'autel').status, 'blocked');
  for (const path of ['/api/ai', '/api/speech']) {
    const status = await (await call(path, headers)).json();
    assert.equal(status.configured, false);
    assert.equal(status.available, false);
  }
  assert.equal((await call('/api/chat/clear', headers, {})).status, 200);
  assert.equal((await (await call('/api/whoop', headers)).json()).facts, null);
  const data = emptyData();
  data.notes.push({id:'fixture',text:'synthetic cloud record',kind:'note',at:null,minutes:30,done:false});
  const save = {operation:'save', remember:true, revision:0, data};
  assert.equal((await call('/api/personal', {...headers, Origin:'https://elsewhere.test'}, save)).status, 403);
  assert.equal((await call('/api/personal', {...headers, 'X-CSRF-Token':''}, save)).status, 403);
  assert.equal((await call('/api/personal', headers, {...save, remember:false})).status, 400);
  assert.equal((await call('/api/personal', headers, save)).status, 200);
  assert.equal((await call('/api/personal', headers, save)).status, 409);
  assert.deepEqual((await (await call('/api/personal', headers)).json()).data, data);
  assert.equal((await call('/api/logout', headers, {})).status, 200);
  assert.equal((await call('/api/personal', headers)).status, 401);
});
