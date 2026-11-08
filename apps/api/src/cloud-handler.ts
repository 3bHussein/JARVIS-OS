import {BodyReadError, readBoundedText} from './bounded-body.ts';
import {manifests} from '../../../packages/connectors/src/contracts.ts';
import {createHash, randomBytes} from 'node:crypto';
import {checkPassword} from './auth.ts';
import {CloudRedis} from './cloud-redis.ts';
import {CloudVault} from './cloud-vault.ts';
import {emptyData, validateData} from '../../../packages/personal/src/model.ts';

const cookieFlags = 'Secure; HttpOnly; SameSite=Strict; Path=/api';
const loginLimit = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n";

interface CloudConfig {
  origin: string;
  endpoint: string;
  token: string;
  key: string;
  namespace: string;
  passwordHash: string;
}

export function createCloudHandler(config: CloudConfig, transport: typeof fetch = fetch) {
  const origin = new URL(config.origin);
  if (origin.protocol !== 'https:' || origin.origin !== config.origin ||
      !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(config.passwordHash)) throw new Error('Invalid cloud origin or owner hash');
  const redis = new CloudRedis(config.endpoint, config.token, transport);
  const vault = new CloudVault(config.endpoint, config.token, config.key, config.namespace, transport);
  const prefix = `jarvis:${config.namespace}:`;
  const sessionKey = (token: string) => prefix + 'session:' + createHash('sha256').update(token).digest('hex');
  const owner = {id: 'local-owner', role: 'owner'};
  const reply = (status: number, body: unknown, cookie?: string) => Response.json(body, {
    status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      ...(cookie ? {'Set-Cookie': cookie} : {})},
  });

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;
    const sender = request.headers.get('origin');
    if (url.origin !== origin.origin || (sender && sender !== origin.origin) ||
        request.headers.get('sec-fetch-site') === 'cross-site') return reply(403, {error: 'invalid_origin'});
    const post = request.method === 'POST';
    if (!post && request.method !== 'GET') return reply(405, {error: 'method_not_allowed'});
    if (post && (sender !== origin.origin || !request.headers.get('content-type')?.startsWith('application/json'))) {
      return reply(403, {error: 'invalid_request'});
    }
    async function body() {
      const text = await readBoundedText(request, 1048576);
      try { return JSON.parse(text); } catch { throw new BodyReadError(400); }
    }

    try {
      if (!post && path === '/api/health') return reply(200, {ok: true, configured: true, mode: 'cloud'});
      if (post && path === '/api/session') {
        const attempts = await redis.command(['EVAL', loginLimit, 1, prefix + 'login-limit']);
        if (typeof attempts !== 'number' || attempts > 5) return reply(429, {error: 'rate_limited'});
        const input = await body();
        if (typeof input?.password !== 'string' || !checkPassword(input.password, config.passwordHash)) {
          return reply(401, {error: 'invalid_credentials'});
        }
        const token = randomBytes(32).toString('hex');
        const csrf = randomBytes(32).toString('hex');
        if (await redis.command(['SET', sessionKey(token), csrf, 'EX', 3600]) !== 'OK') {
          return reply(503, {error: 'cloud_unavailable'});
        }
        return reply(200, {user: owner, csrf}, `jarvis_session=${token}; ${cookieFlags}; Max-Age=3600`);
      }
      const token = request.headers.get('cookie')?.match(/(?:^|;\s*)jarvis_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      if (!token) return reply(401, {error: 'authentication_required'});
      const csrf = await redis.command(['GET', sessionKey(token)]);
      if (typeof csrf !== 'string' || !/^[a-f0-9]{64}$/.test(csrf)) return reply(401, {error: 'authentication_required'});
      if (post && request.headers.get('x-csrf-token') !== csrf) return reply(403, {error: 'csrf_required'});
      if (!post && path === '/api/session') return reply(200, {user: owner, csrf});
      if (post && path === '/api/logout') {
        await redis.command(['DEL', sessionKey(token)]);
        return reply(200, {ok: true}, `jarvis_session=; ${cookieFlags}; Max-Age=0`);
      }
      if (!post && path === '/api/connectors') {
        return reply(200, {connectors: manifests.map(manifest => ({
          ...manifest,
          status: manifest.domain === 'corporate' ? 'blocked' : 'disconnected',
          lastSuccessfulSync: null, freshness: 'unavailable', lastError: null,
        }))});
      }
      if (!post && path === '/api/whoop') {
        return reply(200, {status: 'unavailable', facts: null, error: 'cloud_feature_unavailable'});
      }
      if (!post && (path === '/api/ai' || path === '/api/speech')) {
        return reply(200, {configured: false, mode: 'cloud', available: false});
      }
      if (post && path === '/api/chat/clear') {
        return reply(200, {ok: true});
      }
      if (path === '/api/personal') {
        if (!post) {
          const record = await vault.read();
          return reply(200, {revision: record?.revision ?? 0, data: record?.data ?? emptyData(),
            persistent: Boolean(record), storageAvailable: true, locked: false, storage: 'cloud'});
        }
        const input = await body();
        if (input?.operation !== 'save') return reply(501, {error: 'cloud_operation_unavailable'});
        if (input.remember !== true) return reply(400, {error: 'cloud_encrypted_save_required'});
        const data = validateData(input.data);
        const revision = await vault.save(data, input.revision);
        return reply(200, {revision, data, persistent: true, storageAvailable: true, locked: false, storage: 'cloud'});
      }
      return reply(501, {error: 'cloud_feature_unavailable'});
    } catch (error) {
      if (error instanceof BodyReadError) return reply(error.status, {error: error.message});
      if (error instanceof Error && error.message === 'personal_conflict') return reply(409, {error: 'personal_conflict'});
      return reply(503, {error: 'cloud_unavailable'});
    }
  };
}
