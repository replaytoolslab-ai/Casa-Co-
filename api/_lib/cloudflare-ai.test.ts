import test from 'node:test';
import assert from 'node:assert/strict';
import { runCloudflareModel, CloudflareAIError } from './cloudflare-ai.ts';

const originalFetch = globalThis.fetch;
const originalAccount = process.env.CLOUDFLARE_ACCOUNT_ID;
const originalToken = process.env.CLOUDFLARE_API_TOKEN;

function restoreEnv() {
  if (originalAccount === undefined) delete process.env.CLOUDFLARE_ACCOUNT_ID;
  else process.env.CLOUDFLARE_ACCOUNT_ID = originalAccount;
  if (originalToken === undefined) delete process.env.CLOUDFLARE_API_TOKEN;
  else process.env.CLOUDFLARE_API_TOKEN = originalToken;
  globalThis.fetch = originalFetch;
}

test('fails closed when Cloudflare credentials are missing', async () => {
  delete process.env.CLOUDFLARE_ACCOUNT_ID;
  delete process.env.CLOUDFLARE_API_TOKEN;
  await assert.rejects(() => runCloudflareModel('@cf/zai-org/glm-4.7-flash', { prompt: 'test' }),
    (error: unknown) => error instanceof CloudflareAIError && error.statusCode === 503);
  restoreEnv();
});

test('calls the account-scoped REST endpoint with a server-side Bearer token', async () => {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.CLOUDFLARE_API_TOKEN = 'secret-token';
  let requestUrl = '';
  let requestInit: RequestInit | undefined;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requestUrl = String(input);
    requestInit = init;
    return new Response(JSON.stringify({ success: true, result: { response: 'Ciao' }, errors: [] }), { status: 200 });
  }) as typeof fetch;

  const result = await runCloudflareModel('@cf/zai-org/glm-4.7-flash', { prompt: 'ciao' });
  assert.equal(requestUrl, 'https://api.cloudflare.com/client/v4/accounts/account-123/ai/run/@cf/zai-org/glm-4.7-flash');
  assert.equal(new Headers(requestInit?.headers).get('Authorization'), 'Bearer secret-token');
  assert.deepEqual(result, { response: 'Ciao' });
  restoreEnv();
});

test('normalizes daily quota and provider rate limits to HTTP 429', async () => {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.CLOUDFLARE_API_TOKEN = 'secret-token';
  globalThis.fetch = (async () => new Response(JSON.stringify({
    success: false, errors: [{ code: 4290, message: 'Daily neuron quota exceeded' }]
  }), { status: 429 })) as typeof fetch;

  await assert.rejects(() => runCloudflareModel('@cf/zai-org/glm-4.7-flash', { prompt: 'test' }),
    (error: unknown) => error instanceof CloudflareAIError && error.statusCode === 429);
  restoreEnv();
});

test('does not retry or fall back when Cloudflare rejects a paid-only model', async () => {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.CLOUDFLARE_API_TOKEN = 'secret-token';
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(JSON.stringify({ success: false, errors: [{ code: 10000, message: 'Paid plan required' }] }), { status: 403 });
  }) as typeof fetch;

  await assert.rejects(() => runCloudflareModel('@cf/paid/model', { prompt: 'test' }),
    (error: unknown) => error instanceof CloudflareAIError && error.statusCode === 503);
  assert.equal(calls, 1);
  restoreEnv();
});

test('rejects malformed provider responses with a controlled error', async () => {
  process.env.CLOUDFLARE_ACCOUNT_ID = 'account-123';
  process.env.CLOUDFLARE_API_TOKEN = 'secret-token';
  globalThis.fetch = (async () => new Response('not-json', { status: 200 })) as typeof fetch;

  await assert.rejects(() => runCloudflareModel('@cf/zai-org/glm-4.7-flash', { prompt: 'test' }),
    (error: unknown) => error instanceof CloudflareAIError && error.statusCode === 502);
  restoreEnv();
});
