import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api, createUser } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('register accepts snake_case goals and returns 201', async () => {
  const res = await api(srv.base, 'POST', '/auth/register', {
    body: { name: 'Jane Tester', email: 'jane@test.com', password: 'StrongPass123!', goals: { primaryGoal: 'maintenance' } },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.goals.primaryGoal, 'maintenance');
  assert.equal(res.body.user.role, 'user');
});

test('register normalizes bad enum casing instead of crashing (400-friendly)', async () => {
  const res = await api(srv.base, 'POST', '/auth/register', {
    body: { name: 'Goal Tester', email: 'goalcase@test.com', password: 'StrongPass123!', goals: { primaryGoal: 'Muscle Gain' } },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.goals.primaryGoal, 'muscle_gain');
});

test('register rejects invalid payloads with a clear 400', async () => {
  const badEmail = await api(srv.base, 'POST', '/auth/register', {
    body: { name: 'X', email: 'not-an-email', password: '123' },
  });
  assert.equal(badEmail.status, 400);
  assert.equal(badEmail.body.success, false);
  assert.ok(badEmail.body.message?.length > 0);

  const dup = await api(srv.base, 'POST', '/auth/register', {
    body: { name: 'Dup Tester', email: 'dup@test.com', password: 'StrongPass123!' },
  });
  assert.equal(dup.status, 201);
  const dup2 = await api(srv.base, 'POST', '/auth/register', {
    body: { name: 'Dup Tester', email: 'dup@test.com', password: 'StrongPass123!' },
  });
  assert.equal(dup2.status, 400);
});

test('login returns a token for valid credentials; rejects invalid ones', async () => {
  const u = await createUser(srv.base, 'loginok');
  assert.ok(u.token && u.token.split('.').length === 3);

  const badPw = await api(srv.base, 'POST', '/auth/login', { body: { email: u.email, password: 'wrong-password' } });
  assert.equal(badPw.status, 400);

  const unknown = await api(srv.base, 'POST', '/auth/login', { body: { email: 'ghost@test.com', password: 'whatever123' } });
  assert.equal(unknown.status, 400);
});

test('getMe works with a valid token, 401 without', async () => {
  const u = await createUser(srv.base, 'me');
  const me = await api(srv.base, 'GET', '/auth/me', { token: u.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, u.email);

  const noToken = await api(srv.base, 'GET', '/auth/me');
  assert.equal(noToken.status, 401);
});
