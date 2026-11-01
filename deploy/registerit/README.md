# Register.it Micro Hosting deployment

Target: PHP 8.4, MySQL allocation available, static Vite frontend, no Node runtime/SSH assumed.

## Safe rollout
1. Build the Vite frontend with base path `/preview/` (the workflow artifact is a ZIP containing the contents of `dist/`).
2. Upload/extract that ZIP into `/www/preview/`. Keep the existing WordPress files in `/www/` untouched.
3. Upload `api/index.php`, `api/.htaccess`, and a server-only `api/config.php` to `/www/api/`. Create `config.php` by copying `config.example.php` and entering the actual credentials in the hosting File Manager. Never upload the example file as live config.
4. In the connected Supabase SQL editor, apply `supabase/schema.sql`, then `supabase/migrations/20261101_user_preferences.sql` and `supabase/migrations/20261101_subscriptions.sql` before enabling account persistence.
5. Test `https://faidatecasa.it/preview/`, then test API endpoints and Stripe test mode. Only after all checks pass should the main WordPress routing be changed.

## API routes
- POST /api/auth
- GET/POST/PATCH/DELETE /api/projects
- GET/PUT /api/preferences
- GET /api/subscription
- POST /api/checkout
- POST /api/stripe-webhook
- POST /api/assistant
- POST /api/vision

## Important
The backend uses Supabase Auth/PostgREST for identity and private user data, Stripe Checkout/webhooks for subscriptions, and Cloudflare Workers AI for assistant/image generation. These services still require valid credentials and database schema. Image-to-image editing is explicitly not claimed as implemented; Vision supports prompt-to-image only. The API does not create database tables automatically.

PHP extensions required: cURL, JSON, mbstring. Apache mod_rewrite/.htaccess must be enabled for clean /api/* routes.
