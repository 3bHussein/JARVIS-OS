import {CloudAccounts} from './cloud-accounts.ts';
import {AccountError,type AccountProvider} from '../../../packages/connectors/src/account-reader.ts';
import {BodyReadError, readBoundedText} from './bounded-body.ts';
import {manifests} from '../../../packages/connectors/src/contracts.ts';
import {createHash, randomBytes} from 'node:crypto';
import {checkPassword} from './auth.ts';
import {CloudRedis} from './cloud-redis.ts';
import {CloudRecovery, RecoveryError, type RecoveryConfig} from './cloud-recovery.ts';
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
  recovery?: RecoveryConfig;
}

export function createCloudHandler(config: CloudConfig, transport: typeof fetch = fetch) {
  const origin = new URL(config.origin);
  if (origin.protocol !== 'https:' || origin.origin !== config.origin ||
      !/^[a-f0-9]{32}:[a-f0-9]{128}$/.test(config.passwordHash)) throw new Error('Invalid cloud origin or owner hash');
  const redis = new CloudRedis(config.endpoint, config.token, transport);
  const vault = new CloudVault(config.endpoint, config.token, config.key, config.namespace, transport);
  const prefix = `jarvis:${config.namespace}:`;
  const recovery = new CloudRecovery(redis, prefix, config.passwordHash, config.key, config.recovery, transport);
  const sessionKey = (token: string, hash: string) => prefix + 'session:' + createHash('sha256').update(hash).digest('hex') + ':' + createHash('sha256').update(token).digest('hex');
  const owner = {id: 'local-owner', role: 'owner'};
  const reply = (status: number, body: unknown, cookie?: string) => Response.json(body, {
    status, headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      ...(cookie ? {'Set-Cookie': cookie} : {})},
  });

  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    const path = url.pathname;
    const sender = request.headers.get('origin');
    if(path.includes('/recovery/'))console.info('jarvis_recovery_dispatch',{
      knownRoute:['/api/recovery/request','/api/recovery/complete'].includes(path),
      method:request.method==='POST'?'POST':'other',originMatches:url.origin===origin.origin,senderMatches:sender===origin.origin});
    if (url.origin !== origin.origin || (sender && sender !== origin.origin) ||
        request.headers.get('sec-fetch-site') === 'cross-site') return reply(403, {error: 'invalid_origin'});
    const post = request.method === 'POST';
    if (!post && request.method !== 'GET') return reply(405, {error: 'method_not_allowed'});
    if (post && (sender !== origin.origin || !request.headers.get('content-type')?.startsWith('application/json'))) {
      return reply(403, {error: 'invalid_request'});
    }
    let stage='dispatch';
    async function body() {
      stage='body';
      const text = await readBoundedText(request, 1048576);
      try { return JSON.parse(text); } catch { throw new BodyReadError(400); }
    }

    try {
      if (!post && path === '/api/health') return reply(200, {ok: true, configured: true, mode: 'cloud'});
      if (!post && path === '/api/recovery') return reply(200, {available:recovery.available});
      if (post && path === '/api/recovery/request') {
        await body();
        stage='recovery';
        return reply(200, await recovery.request());
      }
      if (post && path === '/api/recovery/complete') {
        await recovery.complete(await body());
        return reply(200, {ok:true}, `jarvis_session=; ${cookieFlags}; Max-Age=0`);
      }
      if (post && path === '/api/session') {
        const attempts = await redis.command(['EVAL', loginLimit, 1, prefix + 'login-limit']);
        if (typeof attempts !== 'number' || attempts > 5) return reply(429, {error: 'rate_limited'});
        const input = await body();
        const active = await recovery.activeHash();
        if (typeof input?.password !== 'string' || !checkPassword(input.password, active.hash)) {
          return reply(401, {error: 'invalid_credentials'});
        }
        const token = randomBytes(32).toString('hex');
        const csrf = randomBytes(32).toString('hex');
        if (await redis.command(['SET', sessionKey(token, active.hash), csrf, 'EX', 3600]) !== 'OK') {
          return reply(503, {error: 'cloud_unavailable'});
        }
        return reply(200, {user: owner, csrf}, `jarvis_session=${token}; ${cookieFlags}; Max-Age=3600`);
      }
      const token = request.headers.get('cookie')?.match(/(?:^|;\s*)jarvis_session=([a-f0-9]{64})(?:;|$)/)?.[1];
      if (!token) return reply(401, {error: 'authentication_required'});
      const active = await recovery.activeHash();
      const csrf = await redis.command(['GET', sessionKey(token, active.hash)]);
      if (typeof csrf !== 'string' || !/^[a-f0-9]{64}$/.test(csrf)) return reply(401, {error: 'authentication_required'});
      if (post && request.headers.get('x-csrf-token') !== csrf) return reply(403, {error: 'csrf_required'});
      if (!post && path === '/api/session') return reply(200, {user: owner, csrf});
      const accounts=new CloudAccounts(redis,config.key,config.namespace,token,transport);
      if (post && path === '/api/logout') {
        await accounts.disconnect('whoop');await accounts.disconnect('progress');
        await redis.command(['DEL', sessionKey(token, active.hash)]);
        return reply(200, {ok: true}, `jarvis_session=; ${cookieFlags}; Max-Age=0`);
      }
      if (!post && path === '/api/connectors') {
        const grants={whoop:await accounts.status('whoop'),progressxx:await accounts.status('progress')};
        return reply(200, {connectors: manifests.map(manifest => ({
          ...manifest,
          status: manifest.domain === 'corporate' ? 'blocked' : (manifest.id==='whoop'?grants.whoop.connected:manifest.id==='progressxx'?grants.progressxx.connected:false)?((manifest.id==='whoop'?grants.whoop.lastRead:grants.progressxx.lastRead)?'ready':'configured'):'disconnected',
          lastSuccessfulSync: null, freshness: 'unavailable', lastError: null,
        }))});
      }
      if (path === '/api/integrations') {
        if(!post)return reply(200,{whoop:await accounts.status('whoop'),progress:await accounts.status('progress')});
        const input=await body();
        if(!['whoop','progress'].includes(input?.provider))return reply(400,{error:'invalid_provider'});
        const provider=input.provider as AccountProvider;
        const count=await redis.command(['EVAL',loginLimit,1,prefix+'account-limit:'+provider]);
        if(typeof count!=='number'||count>10)return reply(429,{error:'source_rate_limited'});
        if(input.operation==='connect'){const value=await accounts.connect(provider,input,input.consent);console.info('jarvis_account_action',{provider,operation:'connect',outcome:'success'});return reply(200,value);}
        if(input.operation==='disconnect'){await accounts.disconnect(provider);console.info('jarvis_account_action',{provider,operation:'disconnect',outcome:'success'});return reply(200,{ok:true});}
        if(input.operation==='refresh'){const value=await accounts.read(provider,input.zone||'Africa/Cairo',true);console.info('jarvis_account_action',{provider,operation:'read',status:value.status});return reply(200,value);}
        return reply(400,{error:'invalid_operation'});
      }
      if (!post && (path === '/api/whoop'||path === '/api/progress')) {
        const provider=path==='/api/whoop'?'whoop':'progress',value=await accounts.read(provider,url.searchParams.get('zone')||'Africa/Cairo');
        console.info('jarvis_account_action',{provider,operation:'read',status:value.status});return reply(200,value);
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
      if (error instanceof AccountError){console.warn('jarvis_account_failure',{code:error.message,dataset:error.dataset??'account'});return reply(error.status,{error:error.message,dataset:error.dataset,facts:null,summary:null});}
      if (error instanceof RecoveryError) return reply(error.status, {error:error.message});
      if (error instanceof BodyReadError) {
        console.warn('jarvis_cloud_body_failure',{stage,status:error.status});
        return reply(error.status, {error: error.message});
      }
      if (error instanceof Error && error.message === 'personal_conflict') return reply(409, {error: 'personal_conflict'});
      console.warn('jarvis_cloud_failure',{stage,kind:error instanceof TypeError?'type_error':'unavailable'});
      return reply(503, {error: 'cloud_unavailable'});
    }
  };
}
