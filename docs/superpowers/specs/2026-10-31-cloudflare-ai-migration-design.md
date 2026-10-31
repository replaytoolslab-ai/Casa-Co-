# Casa&Co. — Cloudflare Workers AI migration design

## Intent
Replace the current Gemini-backed server AI calls with Cloudflare Workers AI so Casa&Co. can offer Mastro chat and Vision Studio without requiring a paid Google AI account. The user has chosen Cloudflare and wants to avoid charges.

## Goals
- Preserve the existing `POST /api/assistant` and `POST /api/vision` contracts so the frontend and existing UI remain unchanged.
- Keep provider credentials exclusively in Vercel server environment variables.
- Use only models confirmed available on Cloudflare Workers Free.
- Fail closed when the free daily allowance or model limits are reached; never silently upgrade, enable paid billing, or fall back to a paid provider.
- Preserve Italian prompts, project context, chat history, photo inputs, existing request validation, and rate limiting wherever supported by the selected models.
- Return actionable, non-sensitive error messages for missing configuration, quota exhaustion, unsupported inputs, and provider failures.

## Non-goals
- No redesign of Casa&Co. screens or removal of existing features.
- No ChatGPT/OpenAI API integration; it is a separate paid API product.
- No Cloudflare Workers Paid plan, prepaid AI Gateway credits, or automatic billing.
- No frontend migration or new account system.
- No claim that photo-guided image editing is equivalent to a dedicated commercial interior-design model unless tests prove it.

## Current project constraints
- Repository: `replaytoolslab-ai/Casa-Co-`.
- Work only on branch `fix/prompt-04-mobile-profile-vision`; do not modify `main` or merge PR #1.
- Existing Vercel serverless routes are `api/assistant.ts` and `api/vision.ts`.
- The frontend already calls those routes; their request/response shapes must remain backward compatible.
- Current implementation calls Gemini directly and expects `GEMINI_API_KEY`; Vercel project previously had no environment variables configured.
- Keep secrets out of browser bundles, source control, logs, and chat messages.

## Approaches considered
1. **Keep Gemini and ask the user to configure billing:** rejected because the user explicitly wants to avoid paying.
2. **Add Cloudflare as a fallback while keeping Gemini primary:** rejected because it still leaves the app dependent on a potentially billable Google key and creates confusing provider behavior.
3. **Replace Gemini behind the existing API routes with Cloudflare Workers AI:** selected because it preserves the frontend and makes the free-only policy enforceable in one server-side place.

## Selected design
- Use the Cloudflare REST API at `POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}` with a Bearer API token.
- Configure server-only `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, and explicit model IDs for chat, vision/image understanding, image generation, and image-to-image only where each selected model is verified to be usable on Workers Free.
- Chat uses a free-tier text-generation model with a bounded output token count and the existing Italian Mastro system prompt.
- If the chat photo attachment is retained, use a model that explicitly supports image+text input on the free tier; otherwise return a clear unsupported-photo response rather than silently ignoring the image.
- Vision Studio keeps its existing endpoint and response shape. Use a verified free-tier text-to-image model. Use a verified free-tier image-to-image model for reference-photo transformations only if supported and tested; if no suitable free-tier model is available, report this limitation clearly rather than pretending the original photo was edited.
- Normalize Cloudflare's model-specific responses into the existing API response objects.
- Treat Cloudflare quota/rate-limit responses (including daily-neuron exhaustion) as temporary capacity exhaustion; return HTTP 429 with a user-friendly Italian message. Do not retry through a paid service.
- Keep current per-IP rate limiting and request-size limits. Add model-specific input/output bounds to limit neuron consumption.
- Update `.env.example` and deployment instructions. The user must create a Cloudflare account/token and add secrets in Vercel; credentials must never be pasted into chat.
- Remove Gemini environment-variable requirements from the two routes. Remove the `@google/genai` dependency only if a repository-wide search confirms it is unused elsewhere.

## Acceptance criteria
- Existing frontend calls still work with no frontend API-contract changes.
- Missing Cloudflare configuration returns a clear HTTP 503 without exposing secrets.
- Valid chat requests return Italian text from a Workers Free model.
- Vision generation returns a valid image data URL from a Workers Free model.
- Reference-photo transformation is enabled only if an eligible free model accepts the current image input and passes an integration test; otherwise the UI receives a clear limitation response.
- Exhausted free quota returns a clear 429 and never invokes a paid provider.
- Build and lint pass; tests cover provider success, missing secrets, malformed provider output, quota exhaustion, and image response normalization.
- No paid Cloudflare plan, paid model, prepaid credit, or automatic billing is configured.

## Decisions left to implementation
- Select exact model IDs only after checking each model's current model page, free-plan availability, accepted input shape, and output format.
- Preserve existing endpoint response keys exactly after inspecting current frontend consumers.
- Add focused tests using mocked fetch responses; do not call paid or live inference APIs in automated tests.
