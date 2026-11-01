# Supabase project persistence setup

This repository now contains the first server-side persistence boundary for FaiDaTeCasa.

## What is included

- `api/projects.ts`: Vercel serverless endpoint for listing, creating, updating and deleting a user's projects.
- `supabase/schema.sql`: PostgreSQL table, index, timestamp trigger and access grants.

Every request must carry a Supabase access token. The API validates it against Supabase Auth, obtains the authenticated user ID, and applies that ID to every database operation. The service-role secret is used only in the serverless function and must never be prefixed with `VITE_` or exposed to browser code.

## Setup required before the API can work

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase/schema.sql`.
3. In Vercel, add these server-side environment variables for the Preview and Production environments:
   - `SUPABASE_URL`: project URL.
   - `SUPABASE_ANON_KEY`: publishable/anon key used to validate the user's access token.
   - `SUPABASE_SERVICE_ROLE_KEY`: service-role secret. Keep it server-only.
4. Redeploy the Vercel project after adding the variables.
5. Connect the frontend authentication flow and call `/api/projects` with `Authorization: Bearer <access_token>`.

## API contract

- `GET /api/projects`: returns `{ projects: [...] }` for the authenticated user.
- `POST /api/projects`: body `{ "title": "...", "data": { ... } }`; returns the created project.
- `PATCH /api/projects`: body `{ "id": "<uuid>", "title"?: "...", "data"?: { ... } }`.
- `DELETE /api/projects`: body `{ "id": "<uuid>" }`.

The API rejects unauthenticated requests, limits JSON payloads to 256 KiB, avoids public caching, and scopes mutations to the authenticated owner. The browser must not send the service-role key.

## Important limitations

This is the persistence API foundation, not a complete account system. Signup, login, password recovery, email verification, frontend token lifecycle, and end-to-end tests still need to be implemented. The API will return 401 until a valid Supabase access token is supplied. No production database has been provisioned by this repository change.
