import {createHash, createHmac, randomBytes, randomInt} from 'node:crypto';
import {hashPassword} from './auth.ts';
import {CloudRedis} from './cloud-redis.ts';
import {readBoundedText} from './bounded-body.ts';

export interface RecoveryConfig {email?: string; from?: string; apiKey?: string}
export class RecoveryError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {super(message); this.status = status;}
}
const hashPattern = /^[a-f0-9]{32}:[a-f0-9]{128}$/;
const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
export const recoveryRateScript = `-- jarvis-recovery-rate-v1
local n=redis.call('INCR',KEYS[1])
if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end
return n`;
export const recoveryCompleteScript = `-- jarvis-recovery-complete-v1
local raw=redis.call('GET',KEYS[1])
if not raw then return 0 end
local item=cjson.decode(raw)
if item.tries>=5 then redis.call('DEL',KEYS[1]); return 0 end
if item.proof~=ARGV[1] then
  item.tries=item.tries+1
  redis.call('SET',KEYS[1],cjson.encode(item),'KEEPTTL')
  return 0
end
if (redis.call('GET',KEYS[2]) or '')~=ARGV[2] then
  redis.call('DEL',KEYS[1]); return 0
end
redis.call('DEL',KEYS[1])
redis.call('SET',KEYS[2],ARGV[3])
return 1`;

/** Single-owner recovery: destination is set by hosting owner, never by request data. */
export class CloudRecovery {
  readonly available: boolean;
  private readonly redis: CloudRedis;
  private readonly bootstrapHash: string;
  private readonly prefix: string;
  private readonly authKey: string;
  private readonly secret: string;
  private readonly config: RecoveryConfig;
  private readonly transport: typeof fetch;

  constructor(redis: CloudRedis, prefix: string, bootstrapHash: string, secret: string,
    config: RecoveryConfig = {}, transport: typeof fetch = fetch) {
    this.redis = redis; this.prefix = prefix; this.bootstrapHash = bootstrapHash;
    this.secret = secret; this.config = config; this.transport = transport;
    this.authKey = prefix + 'password:' + createHash('sha256').update(bootstrapHash).digest('hex');
    this.available = Boolean(config.email && config.email.length <= 254 && emailPattern.test(config.email) &&
      config.from && config.from.length <= 254 && emailPattern.test(config.from) && config.apiKey && !/[\r\n]/.test(config.apiKey));
  }
  async activeHash() {
    const override = await this.redis.command(['GET', this.authKey]);
    if (override === null) return {hash:this.bootstrapHash, override:''};
    if (typeof override !== 'string' || !hashPattern.test(override)) throw Error('cloud_unavailable');
    return {hash:override, override};
  }
  private scope(hash: string) {
    return createHash('sha256').update(hash + '\n' + (this.config.email ?? '')).digest('hex');
  }
  private proof(challenge: string, code: string) {
    return createHmac('sha256', this.secret).update(this.prefix + 'recovery-v1:' + challenge + ':' + code).digest('hex');
  }
  private async rate(key: string, seconds: number, max: number) {
    const count = await this.redis.command(['EVAL', recoveryRateScript, 1, this.prefix + key, seconds]);
    if (typeof count !== 'number') throw Error('cloud_unavailable');
    if (count > max) throw new RecoveryError(429, 'recovery_rate_limited');
  }
  async request() {
    if (!this.available) throw new RecoveryError(503, 'recovery_not_configured');
    await this.rate('recovery-send-hour', 3600, 3);
    await this.rate('recovery-send-minute', 60, 1);
    const active = await this.activeHash();
    const challenge = randomBytes(16).toString('hex');
    const code = String(randomInt(0, 100000000)).padStart(8, '0');
    const key = this.prefix + 'recovery:' + this.scope(active.hash) + ':' + challenge;
    const saved = await this.redis.command(['SET', key, JSON.stringify({proof:this.proof(challenge, code), tries:0}), 'EX', 600]);
    if (saved !== 'OK') throw Error('cloud_unavailable');
    try {
      const response = await this.transport('https://api.resend.com/emails', {
        method:'POST', redirect:'error', cache:'no-store', signal:AbortSignal.timeout(8000),
        headers:{'Content-Type':'application/json', Authorization:'Bearer ' + this.config.apiKey},
        body:JSON.stringify({from:this.config.from, to:[this.config.email], subject:'JARVIS OS — Password reset code',
          text:`Your JARVIS OS reset code is: ${code}\nValid for 10 minutes, once only. Never share it.\nIf you did not request this, ignore this email.\n\nكود تغيير باسورد جارفس: ${code}\nصالح لمدة ١٠ دقائق ولمرة واحدة. ما تشاركوش مع أي حد.`}),
      });
      if (!response.ok) {await response.body?.cancel(); throw Error('mail_failed');}
      const receipt = JSON.parse(await readBoundedText(response, 4096));
      if (typeof receipt?.id !== 'string' || !receipt.id) throw Error('mail_failed');
    } catch {
      await this.redis.command(['DEL', key]);
      throw new RecoveryError(503, 'recovery_send_failed');
    }
    return {challenge, expiresIn:600};
  }
  async complete(input: {challenge?: unknown; code?: unknown; password?: unknown}) {
    if (!this.available) throw new RecoveryError(503, 'recovery_not_configured');
    await this.rate('recovery-verify-hour', 3600, 30);
    if (!input || typeof input !== 'object' || typeof input.challenge !== 'string' || !/^[a-f0-9]{32}$/.test(input.challenge) ||
        typeof input.code !== 'string' || !/^\d{8}$/.test(input.code) ||
        typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 256) {
      throw new RecoveryError(400, 'invalid_recovery_input');
    }
    const active = await this.activeHash();
    const key = this.prefix + 'recovery:' + this.scope(active.hash) + ':' + input.challenge;
    const next = hashPassword(input.password);
    const updated = await this.redis.command(['EVAL', recoveryCompleteScript, 2, key, this.authKey,
      this.proof(input.challenge, input.code), active.override, next]);
    if (updated !== 1) throw new RecoveryError(400, 'invalid_or_expired_code');
  }
}
