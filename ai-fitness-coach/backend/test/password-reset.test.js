import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api, createUser } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('forgot-password requires email only and never resets without proof', async () => {
  const u = await createUser(srv.base, 'pwreset');

  // Old attack shape: email + newPassword in ONE call — must NOT change anything.
  const attack = await api(srv.base, 'POST', '/auth/forgot-password', {
    body: { email: u.email, newPassword: 'HackedPass123!' },
  });
  assert.ok(attack.status === 200 || attack.status === 503); // generic or unavailable
  const stillOld = await api(srv.base, 'POST', '/auth/login', { body: { email: u.email, password: 'StrongPass123!' } });
  assert.equal(stillOld.status, 200, 'old password must still work after the attack attempt');
  const attacker = await api(srv.base, 'POST', '/auth/login', { body: { email: u.email, password: 'HackedPass123!' } });
  assert.equal(attacker.status, 400, 'attacker password must NOT work');
});

test('full reset flow: token issued (dev mode) → reset ok → token single-use', async () => {
  const u = await createUser(srv.base, 'pwflow');

  const forgot = await api(srv.base, 'POST', '/auth/forgot-password', { body: { email: u.email } });
  assert.equal(forgot.status, 200);
  assert.ok(forgot.body.devToken && forgot.body.devToken.length >= 60, 'devToken should be present when RESET_TOKEN_DEBUG=true');

  const reset = await api(srv.base, 'POST', '/auth/reset-password', {
    body: { email: u.email, token: forgot.body.devToken, newPassword: 'NewStrongPass456!' },
  });
  assert.equal(reset.status, 200, JSON.stringify(reset.body));

  const newLogin = await api(srv.base, 'POST', '/auth/login', { body: { email: u.email, password: 'NewStrongPass456!' } });
  assert.equal(newLogin.status, 200);

  // Reuse of the same token must fail (single-use).
  const reuse = await api(srv.base, 'POST', '/auth/reset-password', {
    body: { email: u.email, token: forgot.body.devToken, newPassword: 'ThirdPass789!' },
  });
  assert.equal(reuse.status, 400);

  const bogus = await api(srv.base, 'POST', '/auth/reset-password', {
    body: { email: u.email, token: 'deadbeef'.repeat(8), newPassword: 'ThirdPass789!' },
  });
  assert.equal(bogus.status, 400);
});

test('forgot-password for unknown email returns a generic 200 (anti-enumeration)', async () => {
  const res = await api(srv.base, 'POST', '/auth/forgot-password', { body: { email: 'does-not-exist@test.com' } });
  assert.equal(res.status, 200);
  assert.match(res.body.message || '', /account exists/i);
});
