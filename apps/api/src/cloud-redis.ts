export class CloudRedis {
  private readonly endpoint: URL;
  private readonly token: string;
  private readonly transport: typeof fetch;

  constructor(endpoint: string, token: string, transport: typeof fetch = fetch) {
    this.endpoint = new URL(endpoint);
    if (this.endpoint.protocol !== 'https:' || this.endpoint.href !== this.endpoint.origin + '/' ||
        this.endpoint.username || this.endpoint.password || !token) throw new Error('Invalid Redis configuration');
    this.token = token;
    this.transport = transport;
  }

  async command(args: Array<string | number>): Promise<unknown> {
    const response = await this.transport(this.endpoint, {
      method: 'POST', redirect: 'error', cache: 'no-store',
      signal: AbortSignal.timeout(5000),
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${this.token}`},
      body: JSON.stringify(args),
    });
    if (!response.ok) throw new Error('cloud_vault_unavailable');
    const raw = await response.text();
    if (raw.length > 1024 * 1024 + 256) throw new Error('cloud_vault_unavailable');
    const payload = JSON.parse(raw);
    if (!payload || !Object.hasOwn(payload, 'result') || payload.error) throw new Error('cloud_vault_unavailable');
    return payload.result;
  }

}
