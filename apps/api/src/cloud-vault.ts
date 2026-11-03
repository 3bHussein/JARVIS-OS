import {CloudRedis} from './cloud-redis.ts';
import {createCipheriv, createDecipheriv, randomBytes} from 'node:crypto';
import {validateData, type PersonalData} from '../../../packages/personal/src/model.ts';

const limit = 1024 * 1024;
const compareAndSet = `
local current = redis.call('GET', KEYS[1])
if (current or '') ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
return 1
`;

export class CloudVault {
  private readonly key: Buffer;
  private readonly namespace: string;
  private readonly redis: CloudRedis;

  constructor(endpoint: string, token: string, keyHex: string,
    namespace: string, transport: typeof fetch = fetch) {
    if (!/^[0-9a-f]{64}$/.test(keyHex) || !/^[a-z0-9-]{1,64}$/.test(namespace)) {
      throw new Error('Invalid cloud vault configuration');
    }
    this.key = Buffer.from(keyHex, 'hex');
    this.namespace = namespace;
    this.redis = new CloudRedis(endpoint, token, transport);
  }

  async read() {
    const envelope = await this.redis.command(['GET', `jarvis:${this.namespace}:vault`]);
    if (envelope === null) return null;
    if (typeof envelope !== 'string' || envelope.length > limit) throw new Error('cloud_vault_invalid');
    const encoded = Buffer.from(envelope, 'base64');
    if (encoded.length < 29) throw new Error('cloud_vault_invalid');
    const decipher = createDecipheriv('aes-256-gcm', this.key, encoded.subarray(0, 12));
    decipher.setAAD(Buffer.from(`jarvis-cloud-v1:${this.namespace}`));
    decipher.setAuthTag(encoded.subarray(12, 28));
    const record = JSON.parse(Buffer.concat([decipher.update(encoded.subarray(28)), decipher.final()]).toString('utf8'));
    if (!Number.isSafeInteger(record.revision) || record.revision < 1) throw new Error('cloud_vault_invalid');
    return {revision: record.revision as number, data: validateData(record.data), envelope};
  }

  async save(data: PersonalData, expectedRevision: number) {
    const current = await this.read();
    if ((current?.revision ?? 0) !== expectedRevision) throw new Error('personal_conflict');
    const revision = expectedRevision + 1;
    if (!Number.isSafeInteger(revision)) throw new Error('cloud_vault_invalid');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(`jarvis-cloud-v1:${this.namespace}`));
    const encrypted = Buffer.concat([cipher.update(JSON.stringify({revision, data: validateData(data)})), cipher.final()]);
    const envelope = Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64');
    if (envelope.length > limit) throw new Error('storage_unavailable');
    const result = await this.redis.command(['EVAL', compareAndSet, 1, `jarvis:${this.namespace}:vault`, current?.envelope ?? '', envelope]);
    if (result === 0) throw new Error('personal_conflict');
    if (result !== 1) throw new Error('cloud_vault_unavailable');
    return revision;
  }
}
