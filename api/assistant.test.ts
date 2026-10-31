import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './assistant.ts';

function mockResponse() {
  let statusCode = 200;
  let payload: unknown;
  const headers: Record<string, string> = {};
  return {
    status(code: number) { statusCode = code; return this; },
    json(body: unknown) { payload = body; return this; },
    setHeader(name: string, value: string) { headers[name] = value; },
    get statusCode() { return statusCode; },
    get payload() { return payload; },
    headers
  };
}

test('Mastro preserves chat response contract and sends project context to Cloudflare', async () => {
  const oldFetch = globalThis.fetch;
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-test';
  process.env.CLOUDFLARE_API_TOKEN = 'token-test';
  let requestBody: any;
  globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ success: true, result: { response: 'Controlla prima il supporto.' } }), { status: 200 });
  }) as typeof fetch;

  const res = mockResponse();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.10' }, body: {
    message: 'Come verifico il muro?', project: { name: 'Bagno', progress: 20 },
    history: [{ role: 'user', text: 'Ciao' }]
  } }, res as any);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, { text: 'Controlla prima il supporto.', model: '@cf/google/gemma-4-26b-a4b-it' });
  assert.equal(requestBody.messages[0].role, 'system');
  assert.match(requestBody.messages[0].content, /Casa&Co/);
  assert.equal(requestBody.messages[1].role, 'user');
  if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID; else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
  if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN; else process.env.CLOUDFLARE_API_TOKEN = oldToken;
  globalThis.fetch = oldFetch;
});

test('Mastro sends an attached image as a data URI multimodal part', async () => {
  const oldFetch = globalThis.fetch;
  const oldAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
  const oldToken = process.env.CLOUDFLARE_API_TOKEN;
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-test';
  process.env.CLOUDFLARE_API_TOKEN = 'token-test';
  let requestBody: any;
  globalThis.fetch = (async (_url: RequestInfo | URL, init?: RequestInit) => {
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({ success: true, result: { response: 'Vedo una parete.' } }), { status: 200 });
  }) as typeof fetch;

  const res = mockResponse();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.11' }, body: {
    message: 'Descrivi questa foto', image: { mimeType: 'image/jpeg', data: 'YWJj' }
  } }, res as any);

  const parts = requestBody.messages.at(-1).content;
  assert.equal(parts[1].type, 'image_url');
  assert.equal(parts[1].image_url.url, 'data:image/jpeg;base64,YWJj');
  assert.equal(res.statusCode, 200);
  if (oldAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID; else process.env.CLOUDFLARE_ACCOUNT_ID = oldAccount;
  if (oldToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN; else process.env.CLOUDFLARE_API_TOKEN = oldToken;
  globalThis.fetch = oldFetch;
});
