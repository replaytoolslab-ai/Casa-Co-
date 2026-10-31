# Cloudflare Workers AI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Gemini with Cloudflare Workers AI behind the existing Casa&Co. API routes, using only Workers Free models and never triggering paid billing.

**Architecture:** Keep the frontend unchanged and adapt `api/assistant.ts` and `api/vision.ts` to Cloudflare's account-scoped REST API. Normalize provider-specific responses to the current API contracts, preserve existing prompt/context/rate-limit behavior, and fail closed on missing configuration or free-quota exhaustion. Model IDs and payload schemas must be verified against the current official model pages before implementation.

**Tech Stack:** TypeScript, Vercel serverless functions, Cloudflare Workers AI REST API, existing Vite/React frontend, mocked-fetch tests.

**Spec:** `docs/superpowers/specs/2026-10-31-cloudflare-ai-migration-design.md`

## Global Constraints
- Work only on branch `fix/prompt-04-mobile-profile-vision`; do not modify `main` or merge PR #1.
- Preserve `POST /api/assistant` and `POST /api/vision` request/response contracts.
- Use only models explicitly available on Cloudflare Workers Free; never use paid-only models, paid Workers plan, or prepaid AI Gateway credits.
- Keep `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` server-side only.
- Do not remove UI features or silently ignore image attachments.
- No live paid inference calls in tests; provider requests must be mocked.
- Do not remove `@google/genai` until repository-wide search proves it is unused.

## Review Focus
- Missing/blank Cloudflare credentials must return HTTP 503 without leaking secrets.
- Daily free-neuron quota exhaustion and provider 429s must return a clear HTTP 429 and never fall back to paid services.
- Cloudflare 403 responses for paid-only models must be surfaced as configuration/model eligibility errors, not retried.
- Malformed JSON, unexpected provider payloads, and empty model outputs must produce controlled errors rather than uncaught exceptions.
- Invalid, oversized, or unsupported image MIME/data payloads must be rejected clearly and must not be silently discarded.

---

### Task 1: Verify Cloudflare models and payload contracts

**Files:**
- Create: `docs/superpowers/references/cloudflare-model-compatibility.md`

**Interfaces:**
- Produces verified model IDs, request schemas, response formats, free-plan eligibility, and image-input capabilities for Tasks 2–4.

- [x] **Step 1: Inspect official model pages**
  - Verify at least one text model for Mastro, one image-understanding model for assistant photo attachments, one text-to-image model for Vision Studio, and one image-to-image model for reference-photo editing if available.
  - For every candidate, record the exact model ID, Free-plan eligibility, accepted JSON input fields, output shape, limits, and whether a billing method is required.
- [x] **Step 2: Verify API invocation format**
  - Confirm the account-scoped REST URL, Bearer token header, JSON request body, and binary/base64 image response handling from Cloudflare's current documentation.
- [x] **Step 3: Record safe selections**
  - Select only candidates that are explicitly free-tier eligible.
  - If no free image-to-image model supports the current reference-photo workflow, document the limitation and design a clear unsupported response; do not simulate photo editing with text-to-image.
- [x] **Step 4: Review compatibility note**
  - Ensure the note contains official source URLs and enough detail to implement each request without guessing.

### Task 2: Add a shared Cloudflare Workers AI client

**Files:**
- Create: `api/_lib/cloudflare-ai.ts`
- Create: `api/_lib/cloudflare-ai.test.ts` (or the repository's established test location if present)

**Interfaces:**
- Produces `runCloudflareModel(model: string, input: Record<string, unknown>): Promise<unknown>`.
- Produces normalized helpers for provider errors and quota exhaustion.
- Consumes server environment `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.

- [x] **Step 1: Write failing tests**
  - Test missing account ID and token.
  - Test exact URL and Bearer authorization header.
  - Test successful JSON response.
  - Test Cloudflare 429/quota error normalization.
  - Test paid-only-model 403 is not retried.
  - Test malformed provider JSON and network failure.
- [x] **Step 2: Run tests and confirm they fail**
- [x] **Step 3: Implement the shared client**
  - Use `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}`.
  - Set a bounded timeout and parse Cloudflare's `success`, `result`, and `errors` envelope according to the verified API contract.
  - Never log credentials or full user images.
- [x] **Step 4: Run focused tests and confirm they pass**

### Task 3: Migrate Mastro chat and photo understanding

**Files:**
- Modify: `api/assistant.ts`
- Create/modify: `api/assistant.test.ts` (or established test location)
- Modify: `.env.example`

**Interfaces:**
- Preserve current request fields: `message`, `project`, `history`, optional `image.data` and `image.mimeType`.
- Preserve success response `{ text, model }` and error response `{ error }`.

- [ ] **Step 1: Write failing tests**
  - Text-only chat maps the Italian Mastro system prompt, project context, and last 12 history messages to the verified Cloudflare chat schema.
  - Image chat sends the image in the verified format to a model that explicitly supports vision; if not supported on Free, return a clear 400/501 response.
  - Empty message and no image returns 400.
  - Missing secrets returns 503.
  - Quota exhaustion returns 429.
  - Empty or malformed model output returns 502.
- [ ] **Step 2: Run tests and confirm they fail**
- [x] **Step 3: Implement Cloudflare chat**
  - Preserve the existing safety wording for electrical, structural, gas, waterproofing, and work-at-height hazards.
  - Bound prompt/history lengths and output tokens.
  - Remove Gemini calls and Gemini env dependencies from this route.
- [x] **Step 4: Update `.env.example` with server-only Cloudflare variables and verified chat/vision model IDs**
- [x] **Step 5: Run focused tests and confirm they pass**

### Task 4: Migrate Vision Studio generation and reference-photo workflow

**Files:**
- Modify: `api/vision.ts`
- Create/modify: `api/vision.test.ts` (or established test location)

**Interfaces:**
- Preserve current request fields: `style`, `roomType`, `customizations`, `notes`, optional `image`.
- Preserve success response `{ image: dataUrl, mimeType }` and error response `{ error }`.

- [ ] **Step 1: Write failing tests**
  - Text-to-image prompt includes room type, style, customizations, and notes.
  - Verified free text-to-image model binary/base64 response is normalized to a valid data URL.
  - Supported reference photo is passed in the exact verified image-to-image schema.
  - Unsupported reference-photo editing returns a clear limitation error and never silently ignores the input photo.
  - Missing secrets, quota exhaustion, malformed output, and oversized image input return controlled errors.
- [ ] **Step 2: Run tests and confirm they fail**
- [x] **Step 3: Implement Vision Studio text-to-image; reference-photo edits return an explicit unsupported response until a free image-to-image model is verified**
  - Keep prompt constraints about perspective, room geometry, doors, windows, and realistic materials.
  - Use only verified Free model IDs and bounded output dimensions.
  - Remove Gemini interactions API calls.
- [x] **Step 4: Run focused tests and confirm they pass**

### Task 5: Repository cleanup and full verification

**Files:**
- Modify: `.env.example`
- Possibly modify: `package.json` and lockfile only if `@google/genai` is proven unused across the repository.

- [ ] **Step 1: Search all source files for Gemini references and Google SDK imports**
- [ ] **Step 2: Remove obsolete Gemini dependency/config only when safe**
- [x] **Step 3: Run `bun run lint`**
- [x] **Step 4: Run `bun run build`**
- [x] **Step 5: Run all focused API tests**
- [ ] **Step 6: Inspect the final diff for accidental frontend/API contract changes**
- [ ] **Step 7: Commit the completed migration to the feature branch and update PR #1 description; do not merge**

### Task 6: Deployment configuration and end-to-end verification

**Files:**
- Modify deployment settings only after the user has configured their own Cloudflare account and secrets in Vercel.

- [ ] **Step 1: Provide setup instructions**
  - Create a Cloudflare API token scoped to Workers AI inference access and identify the account ID.
  - Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to Vercel Preview environment variables for the feature branch.
  - Never request that the user paste the token into chat.
  - Do not enable Workers Paid, prepaid credits, or billing.
- [ ] **Step 2: Verify Vercel preview deployment reaches READY**
- [ ] **Step 3: Verify API method handling and missing-config behavior**
- [ ] **Step 4: After the user adds credentials, test one chat request and one image-generation request against the free models**
- [ ] **Step 5: Verify quota/paid-model errors do not trigger any paid fallback**
- [ ] **Step 6: Report remaining limitations, especially photo-to-photo editing if no eligible free model exists**
