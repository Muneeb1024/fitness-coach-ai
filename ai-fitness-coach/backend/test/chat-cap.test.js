import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api, createUser } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('free tier chat cap: 5/day OK, 6th message → 403 RAG_DAILY_LIMIT', async () => {
  const u = await createUser(srv.base, 'chatcap');

  for (let i = 1; i <= 5; i++) {
    const res = await api(srv.base, 'POST', '/chat/message', { token: u.token, body: { message: `hello message ${i}` } });
    assert.equal(res.status, 200, `message ${i} should pass — got ${res.status}: ${JSON.stringify(res.body)}`);
  }

  const sixth = await api(srv.base, 'POST', '/chat/message', { token: u.token, body: { message: 'one more please' } });
  assert.equal(sixth.status, 403);
  assert.equal(sixth.body.code, 'RAG_DAILY_LIMIT');

  // Pro tier is not capped at 5/day.
  const pro = await createUser(srv.base, 'chatpro');
  await api(srv.base, 'POST', '/subscription/upgrade', { token: pro.token, body: { tier: 'pro' } });
  for (let i = 1; i <= 6; i++) {
    const res = await api(srv.base, 'POST', '/chat/message', { token: pro.token, body: { message: `pro msg ${i}` } });
    assert.equal(res.status, 200, `pro message ${i} got ${res.status}`);
  }
});
