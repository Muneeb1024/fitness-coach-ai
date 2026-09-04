import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api, createUser } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('regular user is denied admin routes (403)', async () => {
  const u = await createUser(srv.base, 'normaluser');
  const res = await api(srv.base, 'GET', '/admin/analytics', { token: u.token });
  assert.equal(res.status, 403);
  assert.match(res.body.message || '', /forbidden/i);
});

test('admin demo account can access admin analytics (200)', async () => {
  const login = await api(srv.base, 'POST', '/auth/login', {
    body: { email: 'admin@fitvision.ai', password: process.env.DEMO_ADMIN_PASSWORD },
  });
  assert.equal(login.status, 200, JSON.stringify(login.body));
  const res = await api(srv.base, 'GET', '/admin/analytics', { token: login.body.token });
  assert.equal(res.status, 200);
  assert.equal(typeof res.body.analytics.totalUsers, 'number');
  assert.equal(Array.isArray(res.body.analytics.weeklyTrend), true);
});

test('unauthenticated admin request is 401', async () => {
  const res = await api(srv.base, 'GET', '/admin/analytics');
  assert.equal(res.status, 401);
});
