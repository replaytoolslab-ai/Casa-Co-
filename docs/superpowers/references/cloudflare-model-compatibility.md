# Cloudflare Workers AI model compatibility

Verified against Cloudflare's official model pages and API documentation on 2026-10-31.

## Shared REST invocation

- Endpoint: `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model_name}`
- Authentication: `Authorization: Bearer {CLOUDFLARE_API_TOKEN}`
- Permission: token needs Workers AI Read or Workers AI Write.
- Request body is model-specific; do not wrap it in a generic `model` / `input` envelope.
- Response is a Cloudflare envelope with `success`, `result`, and `errors`; model-specific output is inside `result`.

Sources:
- https://developers.cloudflare.com/api/resources/ai/methods/run/
- https://developers.cloudflare.com/api/resources/ai/subresources/models/subresources/schema/methods/get/

## Mastro chat and image understanding

Model: `@cf/google/gemma-4-26b-a4b-it`

- Cloudflare model page lists Text Generation and Vision capabilities.
- Cloudflare's July 2026 Workers AI changelog explicitly lists Gemma 4 26B A4B among models available on Workers Free.
- Text chat input uses `messages: [{ role, content }]`; output includes `result.response`.
- The model is multimodal. Cloudflare's REST model schema documents image-text-to-text requests with messages containing `image_url` content parts and inline `data:image/<mime>;base64,...` URLs.
- The model page documents a 256k context window. Casa&Co. deliberately sends only the latest 12 messages and caps generated output.

Sources:
- https://developers.cloudflare.com/ai/models/@cf/google/gemma-4-26b-a4b-it/
- https://developers.cloudflare.com/changelog/product/workers-ai/
- https://developers.cloudflare.com/api/resources/ai/methods/run/

## Vision Studio text-to-image

Model: `@cf/black-forest-labs/flux-1-schnell`

- Text-to-image model.
- Input: `{ prompt, steps }`; prompt max 2048 characters, steps max 8.
- Output image is base64 PNG.
- The model is referenced as a free-tier image-generation option in Cloudflare's Workers AI provider guidance. The global Workers Free quota remains 10,000 Neurons per day, shared across model calls.
- No model input for reference-photo editing is documented for FLUX.1 Schnell.

Sources:
- https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/
- https://github.com/cloudflare/ai/blob/main/packages/workers-ai-provider/README.md
- https://developers.cloudflare.com/workers-ai/platform/pricing/

## Reference-photo editing limitation

No image-to-image model was enabled in this migration because its Workers Free eligibility was not verified from the current official pricing/model documentation. Vision Studio therefore returns HTTP 501 when a user uploads a reference photo, with a clear Italian explanation. It does not silently ignore the photo or pretend a text-to-image result is an edit.

## Free-only billing behavior

- Workers Free includes 10,000 Neurons per day at no charge; the allowance resets at 00:00 UTC.
- When the Free allocation is exhausted, further operations fail. Exceeding it requires a deliberate upgrade to Workers Paid.
- Several named frontier models require paid billing; Casa&Co. hardcodes only the two model IDs above and has no paid-model fallback, AI Gateway credits, or automatic upgrade path.
- Cloudflare credentials are server-side only.

Source:
- https://developers.cloudflare.com/workers-ai/platform/pricing/
