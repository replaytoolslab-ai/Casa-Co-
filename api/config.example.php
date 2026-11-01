<?php
/**
 * Copy to config.php on the server and fill in real values.
 * NEVER commit config.php or expose these secrets in frontend JavaScript.
 */
return [
  'SUPABASE_URL' => 'https://YOUR-PROJECT.supabase.co',
  'SUPABASE_ANON_KEY' => 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY' => 'YOUR_SUPABASE_SERVICE_ROLE_SECRET',
  'STRIPE_SECRET_KEY' => 'sk_live_or_test_REPLACE',
  'STRIPE_PRICE_MONTHLY' => 'price_REPLACE_MONTHLY',
  'STRIPE_PRICE_YEARLY' => 'price_REPLACE_YEARLY',
  'STRIPE_WEBHOOK_SECRET' => 'whsec_REPLACE',
  'APP_URL' => 'https://faidatecasa.it',
  'CLOUDFLARE_ACCOUNT_ID' => 'YOUR_CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN' => 'YOUR_CLOUDFLARE_API_TOKEN',
];
