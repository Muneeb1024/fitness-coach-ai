import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('security headers present on responses', async () => {
  const res = await fetch(`${srv.base.replace('/api', '')}/api/health`);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.ok(res.headers.get('permissions-policy'));
  assert.ok(res.headers.get('referrer-policy'));
  assert.ok(res.headers.get('x-dns-prefetch-control') !== null);
});

test('unknown API route returns JSON 404 (not HTML)', async () => {
  const res = await api(srv.base, 'GET', '/definitely-not-a-route');
  assert.equal(res.status, 404);
  assert.equal(typeof res.body.message, 'string');
  assert.match(res.body.message, /not found/i);
});

test('oversized JSON body returns 413 with a clean message', async () => {
  const big = { name: 'x'.repeat(1024 * 1024 + 500), email: 'big@test.com', password: 'StrongPass123!' };
  const res = await api(srv.base, 'POST', '/auth/register', { body: big });
  assert.equal(res.status, 413);
  assert.match(res.body.message, /too large/i);
  assert.equal(res.body.success, false);
});
