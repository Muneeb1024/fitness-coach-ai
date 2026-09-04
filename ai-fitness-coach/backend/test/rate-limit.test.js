// Runs with a small AUTH_RATE_MAX so the 429 path is exercised cheaply.
process.env.AUTH_RATE_MAX = '5';

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('auth rate limiter returns 429 after the configured number of attempts', async () => {
  const attempt = () =>
    api(srv.base, 'POST', '/auth/login', { body: { email: 'rate@test.com', password: 'wrong-pass' } });

  let last;
  for (let i = 0; i < 8; i++) {
    last = await attempt();
    if (last.status === 429) break;
  }
  assert.equal(last.status, 429, 'expected 429 after the cap');
  assert.match(last.body.message || '', /Too many/i);
  assert.equal(last.body.success, false);

  // The same limiter guards forgot/reset — blocked while over the cap.
  const resetTry = await api(srv.base, 'POST', '/auth/forgot-password', { body: { email: 'rate@test.com' } });
  assert.equal(resetTry.status, 429);
});
