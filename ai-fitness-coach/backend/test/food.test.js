import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, api, createUser } from './helpers.js';

let srv;
before(async () => { srv = await startTestServer(); });
after(async () => { await srv.close(); });

test('food log: add → totals → delete → totals drop', async () => {
  const u = await createUser(srv.base, 'food');

  const add1 = await api(srv.base, 'POST', '/food/log', {
    token: u.token,
    body: { foodName: 'Chicken Salad', image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' },
  });
  assert.equal(add1.status, 201, JSON.stringify(add1.body));
  const entryId = add1.body.entry?._id || add1.body.entry?.id;
  assert.ok(entryId);

  const day = await api(srv.base, 'GET', '/food/today', { token: u.token });
  assert.equal(day.status, 200);
  assert.ok(day.body.totals.calories >= 0);
  assert.equal(day.body.entries.length, 1);

  const del = await api(srv.base, 'DELETE', `/food/log/${entryId}`, { token: u.token });
  assert.equal(del.status, 200, JSON.stringify(del.body));

  const after = await api(srv.base, 'GET', '/food/today', { token: u.token });
  assert.equal(after.body.entries.length, 0);
});
