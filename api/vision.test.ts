import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './vision.ts';

function mockResponse() {
  let statusCode = 200;
  let payload: unknown;
  return {
    status(code: number) { statusCode = code; return this; },
    json(body: unknown) { payload = body; return this; },
    setHeader() {},
    get statusCode() { return statusCode; },
    get payload() { return payload; }
  };
}

test('Vision Studio returns a PNG data URL from the free text-to-image model', async () => {
  const oldFetch = globalThis.fetch;
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-test';
  process.env.CLOUDFLARE_API_TOKEN = 'token-test';
  let requestBody: any;
  globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ success: true, result: { image: 'cG5n' } }), { status: 200 });
  }) as typeof fetch;

  const res = mockResponse();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.21' }, body: {
    style: 'Japandi', roomType: 'Soggiorno', customizations: ['rovere', 'luci'], notes: 'parete chiara'
  } }, res as any);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, { image: 'data:image/png;base64,cG5n', mimeType: 'image/png' });
  assert.match(requestBody.prompt, /Soggiorno/);
  assert.match(requestBody.prompt, /Japandi/);
  assert.match(requestBody.prompt, /rovere/);
  if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID; else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
  if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN; else process.env.CLOUDFLARE_API_TOKEN = oldToken;
  globalThis.fetch = oldFetch;
});

test('Vision Studio never silently drops an uploaded reference photo', async () => {
  const oldFetch = globalThis.fetch;
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-test';
  process.env.CLOUDFLARE_API_TOKEN = 'token-test';
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response('{}', { status: 200 });
  }) as typeof fetch;

  const res = mockResponse();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.22' }, body: {
    style: 'Japandi', roomType: 'Soggiorno', image: { mimeType: 'image/jpeg', data: 'YWJj' }
  } }, res as any);

  assert.equal(res.statusCode, 501);
  assert.equal(calls, 0);
  assert.match((res.payload as any).error, /foto|fotografia/i);
  if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID; else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
  if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN; else process.env.CLOUDFLARE_API_TOKEN = oldToken;
  globalThis.fetch = oldFetch;
});
