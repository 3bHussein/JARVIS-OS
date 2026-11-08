import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readBoundedText} from '../apps/api/src/bounded-body.ts';
import {CloudRedis} from '../apps/api/src/cloud-redis.ts';

const bytes = (text: string) => new TextEncoder().encode(text);

test('bounded reader preserves split Arabic UTF-8 and accepts the exact byte limit', async () => {
  const value = bytes('صباح الخير');
  const stream = new ReadableStream({start(controller) {
    for (const byte of value) controller.enqueue(new Uint8Array([byte]));
    controller.close();
  }});
  assert.equal(await readBoundedText(new Response(stream), value.length), 'صباح الخير');
});

test('bounded reader cancels a chunked oversized response without consuming the tail', async () => {
  let cancelled = false;
  let pulls = 0;
  const stream = new ReadableStream({pull(controller) {
    pulls++;
    controller.enqueue(new Uint8Array(8));
  }, cancel() { cancelled = true; }}, {highWaterMark: 0});
  await assert.rejects(readBoundedText(new Response(stream), 10), {message:'payload_too_large', status:413});
  assert.equal(pulls, 2);
  assert.equal(cancelled, true);
});

test('declared oversized bodies are cancelled before reading', async () => {
  let cancelled = false;
  const stream = new ReadableStream({cancel() {cancelled = true;}}, {highWaterMark:0});
  await assert.rejects(readBoundedText(new Response(stream, {headers:{'Content-Length':'100'}}), 10), {status:413});
  assert.equal(cancelled, true);
});

test('malformed UTF-8 is rejected instead of replacing corrupted record text', async () => {
  await assert.rejects(readBoundedText(new Response(new Uint8Array([0xc3, 0x28])), 10), {status:400});
});

test('oversized Redis responses remain generic upstream failures', async () => {
  const redis = new CloudRedis('https://redis.example.test', 'synthetic', async () =>
    new Response('', {headers:{'Content-Length':String(2 ** 21)}}));
  await assert.rejects(redis.command(['GET', 'fixture']), {message:'cloud_vault_unavailable'});
});
