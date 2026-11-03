import {request} from 'node:http';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeServer} from '../apps/api/src/server.ts';
import {hashPassword} from '../apps/api/src/auth.ts';

test('hosted workspace validates the configured authority and sets secure session cookies', async () => {
  const origin = 'https://jarvis.example.test';
  const password = 'synthetic-hosted-password';
  const server = makeServer({
    hosted: true, origin, passwordHash: hashPassword(password),
    vaultDirectory: '/unused-synthetic-vault', webBundle: new Map(),
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const {port} = address;
    function call(path: string, headers: Record<string, string> = {}, body?: string) {
      return new Promise<{status: number; cookie: string; body: string}>((resolve, reject) => {
        const req = request({hostname: '127.0.0.1', port, path, headers,
          method: body === undefined ? 'GET' : 'POST'}, res => {
          let body = '';
          res.setEncoding('utf8').on('data', chunk => { body += chunk; });
          res.on('end', () => resolve({status: res.statusCode!, cookie: res.headers['set-cookie']?.[0] ?? '', body}));
          res.on('error', reject);
        });
        req.on('error', reject);
        req.end(body);
      });
    }
    assert.equal((await call('/api/health')).status, 403);
    const headers = {Host: 'jarvis.example.test', Origin: origin, 'Content-Type': 'application/json'};
    const body = JSON.stringify({password});
    assert.equal((await call('/api/session', {...headers, Origin: 'https://wrong.example.test'}, body)).status, 403);
    const response = await call('/api/session', headers, body);
    assert.equal(response.status, 200, response.body);
    assert.match(response.cookie, /; Secure\b/);
    assert.match(response.cookie, /; HttpOnly\b/);
    const {csrf} = JSON.parse(response.body);
    const logout = await call('/api/logout', {...headers,
      Cookie: response.cookie.split(';')[0], 'X-CSRF-Token': csrf}, '{}');
    assert.equal(logout.status, 200);
    assert.match(logout.cookie, /; Secure; Max-Age=0/);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
