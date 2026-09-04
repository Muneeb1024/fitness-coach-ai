import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api, createUser } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('free tier: initial plan OK, 10 regenerations/month allowed, 11th → 403; pro unaffected', async () => {
  const u = await createUser(srv.base, 'tierfree');

  const first = await api(srv.base, 'GET', '/plan/my-plan', { token: u.token });
  assert.equal(first.status, 200, JSON.stringify(first.body));

  // Free tier now allows TEN AI plan regenerations per calendar month.
  let lastVersion = 1;
  for (let i = 1; i <= 10; i++) {
    const res = await api(srv.base, 'POST', '/plan/regenerate', { token: u.token });
    assert.equal(res.status, 200, `regen ${i} should pass — got ${res.status}: ${JSON.stringify(res.body)}`);
    lastVersion = res.body.plan.version;
  }
  assert.ok(lastVersion >= 11, '10 successful regenerations should bump version to 11');

  // 11th regenerate in the same month → 403 with the updated message.
  const blocked = await api(srv.base, 'POST', '/plan/regenerate', { token: u.token });
  assert.equal(blocked.status, 403, 'the 11th monthly regenerate must be blocked');
  assert.match(blocked.body.message || '', /10 AI plan regenerations/i);
  assert.equal(blocked.body.code, 'PLAN_REGENERATE_LIMIT');

  // Simulated upgrade (no payments in product yet) unlocks regeneration.
  const up = await api(srv.base, 'POST', '/subscription/upgrade', { token: u.token, body: { tier: 'pro' } });
  assert.equal(up.status, 200, JSON.stringify(up.body));

  const regen = await api(srv.base, 'POST', '/plan/regenerate', { token: u.token });
  assert.equal(regen.status, 200, JSON.stringify(regen.body));
  assert.ok(regen.body.plan && regen.body.plan.version > lastVersion);
});
