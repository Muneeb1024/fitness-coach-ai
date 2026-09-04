/**
 * Shared test bootstrap.
 *
 * IMPORTANT: every test file runs against the IN-MEMORY fallback store
 * (store.js). MongoDB is never connected under tests — the shared production
 * database must not be touched by automated tests.
 */

process.env.NODE_ENV = 'test';
process.env.RESET_TOKEN_DEBUG = 'true';
process.env.GEMINI_API_KEY = ''; // force local fallback answers, no network calls
process.env.DEMO_USER_PASSWORD = 'DemoUserPass123!';
process.env.DEMO_ADMIN_PASSWORD = 'DemoAdminPass123!';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-jwt-secret-that-is-long-enough-32+';

import { once } from 'node:events';

let cached = null;

export async function startTestServer() {
  if (cached) return cached;

  const { app } = await import('../src/server.js');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const port = server.address().port;
  cached = {
    base: `http://127.0.0.1:${port}/api`,
    server,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
  return cached;
}

export async function api(base, method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON body
  }
  return { status: res.status, body: json };
}

/** Register + login one user; returns { token, userId, email } or throws. */
export async function createUser(base, prefix = 'user', extra = {}) {
  const email = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.com`;
  const password = 'StrongPass123!';
  const reg = await api(base, 'POST', '/auth/register', {
    body: { name: `${prefix} Tester`, email, password, goals: { primaryGoal: 'maintenance' }, ...extra },
  });
  if (reg.status !== 201 && reg.status !== 200) {
    throw new Error(`register failed (${reg.status}): ${JSON.stringify(reg.body)}`);
  }
  const login = await api(base, 'POST', '/auth/login', { body: { email, password } });
  if (login.status !== 200) {
    throw new Error(`login failed (${login.status}): ${JSON.stringify(login.body)}`);
  }
  return { token: login.body.token, email, password };
}
