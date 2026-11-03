import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CloudVault} from '../apps/api/src/cloud-vault.ts';
import {emptyData} from '../packages/personal/src/model.ts';

test('cloud vault encrypts at rest, survives a new adapter and rejects racing writes', async () => {
  let stored: string | null = null;
  const transport: typeof fetch = async (_url, init) => {
    const args = JSON.parse(String(init?.body));
    if (args[0] === 'GET') return Response.json({result: stored});
    assert.equal(args[0], 'EVAL');
    assert.equal(args[3], 'jarvis:synthetic:vault');
    if ((stored ?? '') !== args[4]) return Response.json({result: 0});
    stored = args[5];
    return Response.json({result: 1});
  };
  const make = (key = 'a'.repeat(64)) => new CloudVault('https://redis.example.test', 'fixture', key, 'synthetic', transport);
  const data = emptyData();
  data.notes.push({id:'synthetic',text:'private fixture',kind:'note',at:null,minutes:30,done:false});
  assert.equal(await make().read(), null);
  assert.equal(await make().save(data, 0), 1);
  assert.ok(stored);
  assert.ok(!Buffer.from(stored, 'base64').includes('private fixture'));
  assert.deepEqual((await make().read())?.data, data);
  await assert.rejects(make('b'.repeat(64)).read());
  const writes = await Promise.allSettled([make().save(data, 1), make().save(data, 1)]);
  assert.equal(writes.filter(write => write.status === 'fulfilled').length, 1);
  assert.equal(writes.filter(write => write.status === 'rejected' && write.reason.message === 'personal_conflict').length, 1);
  assert.equal((await make().read())?.revision, 2);
});
