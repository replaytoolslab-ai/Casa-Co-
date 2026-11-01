# FaiDaTeCasa — Product and Engineering Roadmap

## Product vision

FaiDaTeCasa is a responsive web platform for people who want to plan, build, furnish, repair, and renovate their homes. The existing Casa&Co. experience is the starting point: preserve its useful screens and workflows while turning demo interactions into reliable, secure product features.

## Product principles

- Preserve existing user-facing capabilities unless a deliberate product decision replaces them.
- Clearly distinguish live AI output, measured data, estimates, and demonstrations.
- Never present simulated measurements or generated estimates as verified facts.
- Keep the experience excellent on mobile, tablet, and desktop.
- Protect user projects, uploaded photos, credentials, and payment data.
- Make paid features valuable without making basic project ownership or data export hostile to free users.

## Existing product areas to preserve and evolve

1. Home, discovery, search, and project catalog.
2. Categories and practical project guides.
3. AI Project Studio for custom build plans.
4. Vision Studio for room redesign and before/after concepts.
5. Scan 3D for room dimensions and openings.
6. Assistant AI for contextual help, safety guidance, checklists, and photo diary.
7. My Projects and profile, including language preferences.

The current repository contains demo and locally managed flows. These must be audited and replaced incrementally; a visible AI or 3D control is not proof that a production service is connected.

## Target platform architecture

### Web client
- Retain React, TypeScript, and Vite as the current frontend foundation.
- Build responsive layouts for desktop, tablet, and mobile browsers.
- Keep reusable UI components and typed domain models.
- Add accessible loading, empty, error, and success states.

### Application backend
- Introduce a server-side API boundary for all privileged operations.
- Keep Gemini and other provider credentials on the server; never expose secrets in browser bundles.
- Validate requests, enforce per-user authorization, apply rate limits, and record operational errors.
- Use background jobs for slow image or document generation where appropriate.

### Persistence and files
- Use a relational database such as PostgreSQL for accounts, projects, project steps, budgets, materials, subscriptions, and usage records.
- Store uploaded images and generated assets in private object storage with controlled access.
- Add migrations, backups, retention rules, and export/delete workflows.

### Authentication and authorization
- Support secure registration, login, logout, password recovery, and verified email.
- Enforce ownership checks on every private project and asset.
- Add administrator roles separately from ordinary user accounts.

### AI and media services
- Replace mock responses with server-mediated model calls in controlled stages.
- Treat uploaded photos as user content and obtain consent before processing them with external providers.
- Persist generation inputs and outputs only under a documented retention policy.
- Add moderation, quotas, timeout handling, retries, and cost monitoring.
- For room scanning, use supported browser/native capabilities where available and clearly label manual or estimated measurements.

### Billing
- Add subscription plans only after account identity and entitlements are implemented.
- Use Stripe and PayPal through server-side checkout and verified webhooks.
- Never trust client-side payment success or client-provided subscription status.
- Implement cancellation, renewal, failed-payment handling, invoices/receipts, and entitlement synchronization.
- Confirm Italian/EU VAT, consumer disclosures, privacy, and terms with qualified professional advice before launch.

## Delivery phases

### Phase 0 — Safe foundation
- Work on the dedicated feature branch, not directly on the default branch.
- Rebrand public metadata to FaiDaTeCasa.
- Audit repository structure, scripts, dependencies, current mock data, and build health.
- Document demo-only features and production gaps.
- Establish environment-variable and secret-handling rules.

### Phase 1 — Responsive web product
- Audit navigation and remove the need for a simulated phone frame in normal desktop use.
- Establish shared responsive page layouts and accessible components.
- Implement real routes and stable URL handling.
- Verify Italian and English content across the product.

### Phase 2 — Accounts and durable projects
- Add authentication and PostgreSQL persistence.
- Move project, checklist, notes, photo diary, and preferences from transient client state into authenticated APIs.
- Add project ownership, validation, backups, and export.

### Phase 3 — Real AI workflows
- Connect AI Project Studio and Assistant AI to server-side services.
- Add image generation/editing for Vision Studio with explicit provider and cost controls.
- Return structured project plans, material lists, steps, and safety caveats.
- Add usage metering and abuse protection.

### Phase 4 — Measurement and 3D
- Separate manual measurements, device-assisted measurements, and estimates.
- Add real scan integrations only where platform APIs and device support allow them.
- Improve the 3D room editor and persist geometry and openings.
- Validate units, geometry, and calculation edge cases.

### Phase 5 — Subscription and administration
- Define Free and paid entitlements from actual operating costs.
- Implement Stripe and PayPal checkout, webhooks, customer portal, and billing records.
- Add administration, support tooling, audit logs, and service monitoring.

### Phase 6 — Production readiness
- Add automated tests, CI checks, dependency/security review, and performance budgets.
- Configure production hosting, domain, database, storage, backups, and monitoring.
- Complete privacy, cookie, terms, refund, and consumer-information review.
- Run closed beta before public launch.

## Definition of done for production

A feature is production-ready only when its happy path, validation, authorization, failure states, persistence, observability, and relevant tests are in place. A static mock or timeout animation does not count as a completed integration.

## Immediate next engineering tasks

1. Inspect the complete source tree and reconcile the actual Vite entry point with the repository structure.
2. Run the existing type-check and production build; record and fix baseline errors.
3. Map each screen to its current data source and identify mock/demo behavior.
4. Agree the first backend deployment target and database/storage providers before implementing infrastructure.
