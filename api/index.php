<?php
declare(strict_types=1);

/**
 * FaiDaTeCasa PHP 8.4 API gateway for Register.it Micro Hosting.
 * Routes: /api/{auth,projects,preferences,subscription,checkout,stripe-webhook,assistant,vision}
 * Secrets are loaded from api/config.php (never commit that file).
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

function respond(int $status, array $data): never {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function cfg(): array {
    static $config = null;
    if ($config !== null) return $config;
    $file = __DIR__ . '/config.php';
    if (!is_file($file)) respond(503, ['error' => 'Configurazione server non completata.']);
    $config = require $file;
    if (!is_array($config)) respond(500, ['error' => 'Configurazione server non valida.']);
    return $config;
}
function setting(string $key, bool $required = true): string {
    $v = trim((string)(cfg()[$key] ?? ''));
    if ($required && $v === '') respond(503, ['error' => 'Servizio non configurato: ' . $key]);
    return $v;
}
function body(int $limit = 262144): array {
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > $limit) respond(413, ['error' => 'Richiesta troppo grande.']);
    $data = json_decode($raw, true);
    if (!is_array($data)) respond(400, ['error' => 'Corpo JSON non valido.']);
    return $data;
}
function http_json(string $url, string $method = 'GET', array $headers = [], ?array $payload = null, int $timeout = 25): array {
    if (!function_exists('curl_init')) respond(503, ['error' => 'Estensione PHP cURL non disponibile sul server.']);
    $ch = curl_init($url);
    $baseHeaders = ['Accept: application/json'];
    foreach ($headers as $k => $v) $baseHeaders[] = $k . ': ' . $v;
    if ($payload !== null) $baseHeaders[] = 'Content-Type: application/json';
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $baseHeaders, CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => $timeout, CURLOPT_FOLLOWLOCATION => false,
    ]);
    if ($payload !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    $raw = curl_exec($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    if ($raw === false) throw new RuntimeException('Connessione al servizio esterno non riuscita: ' . $err);
    $decoded = json_decode((string)$raw, true);
    return [$status, is_array($decoded) ? $decoded : ['raw' => (string)$raw]];
}
function supa_auth(string $token): ?array {
    [$status, $user] = http_json(rtrim(setting('SUPABASE_URL'), '/') . '/auth/v1/user', 'GET', [
        'apikey' => setting('SUPABASE_ANON_KEY'), 'Authorization' => 'Bearer ' . $token
    ]);
    return ($status >= 200 && $status < 300 && !empty($user['id'])) ? $user : null;
}
function require_user(): array {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $h, $m)) respond(401, ['error' => 'Accesso non autorizzato.']);
    $token = trim($m[1]);
    if ($token === '' || strlen($token) > 8192) respond(401, ['error' => 'Sessione non valida.']);
    try { $user = supa_auth($token); } catch (Throwable $e) { respond(502, ['error' => 'Verifica della sessione temporaneamente non disponibile.']); }
    if (!$user) respond(401, ['error' => 'Sessione scaduta. Effettua nuovamente il login.']);
    return $user;
}
function supa_headers(bool $service = false): array {
    $key = setting($service ? 'SUPABASE_SERVICE_ROLE_KEY' : 'SUPABASE_ANON_KEY');
    $h = ['apikey' => $key];
    if ($service) $h['Authorization'] = 'Bearer ' . $key;
    return $h;
}
function supa_rest(string $path, string $method = 'GET', ?array $payload = null, array $extra = []): array {
    $headers = supa_headers(true);
    foreach ($extra as $k => $v) $headers[$k] = $v;
    return http_json(rtrim(setting('SUPABASE_URL'), '/') . '/rest/v1/' . $path, $method, $headers, $payload);
}
function safe_error(array $result, string $fallback): string {
    foreach (['msg','message','error_description','error'] as $k) if (isset($result[$k]) && is_string($result[$k])) return $result[$k];
    return $fallback;
}
function stripe_request(string $path, string $method = 'GET', array $form = []): array {
    $ch = curl_init('https://api.stripe.com/v1/' . ltrim($path, '/'));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . setting('STRIPE_SECRET_KEY'), 'Content-Type: application/x-www-form-urlencoded'],
        CURLOPT_POSTFIELDS => $method === 'GET' ? null : http_build_query($form),
        CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 30,
    ]);
    $raw = curl_exec($ch); $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); $err = curl_error($ch); curl_close($ch);
    if ($raw === false) throw new RuntimeException('Stripe non raggiungibile: ' . $err);
    return [$status, json_decode((string)$raw, true) ?: []];
}
function route_auth(): never {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Metodo non consentito.']);
    $b = body(16384); $action = (string)($b['action'] ?? '');
    $base = rtrim(setting('SUPABASE_URL'), '/'); $headers = ['apikey' => setting('SUPABASE_ANON_KEY')];
    $url = ''; $method = 'POST'; $payload = [];
    switch ($action) {
        case 'signup':
            if (empty($b['email']) || empty($b['password'])) respond(400, ['error' => 'Email e password obbligatorie.']);
            $url = $base . '/auth/v1/signup';
            if (!empty($b['redirectTo'])) $url .= '?redirect_to=' . rawurlencode((string)$b['redirectTo']);
            $payload = ['email'=>$b['email'],'password'=>$b['password'],'data'=>is_array($b['data'] ?? null) ? $b['data'] : []]; break;
        case 'login':
            if (empty($b['email']) || empty($b['password'])) respond(400, ['error' => 'Email e password obbligatorie.']);
            $url = $base . '/auth/v1/token?grant_type=password'; $payload = ['email'=>$b['email'],'password'=>$b['password']]; break;
        case 'refresh':
            if (empty($b['refresh_token'])) respond(400, ['error' => 'Sessione non valida.']);
            $url = $base . '/auth/v1/token?grant_type=refresh_token'; $payload = ['refresh_token'=>$b['refresh_token']]; break;
        case 'user':
            if (empty($b['access_token'])) respond(401, ['error' => 'Sessione scaduta.']);
            $url = $base . '/auth/v1/user'; $method = 'GET'; $headers['Authorization'] = 'Bearer ' . $b['access_token']; break;
        case 'update':
            if (empty($b['access_token'])) respond(401, ['error' => 'Sessione scaduta.']);
            $url = $base . '/auth/v1/user'; $method = 'PUT'; $headers['Authorization'] = 'Bearer ' . $b['access_token'];
            if (is_array($b['data'] ?? null)) $payload['data'] = $b['data'];
            if (isset($b['password']) && strlen((string)$b['password']) >= 8) $payload['password'] = $b['password'];
            if (!$payload) respond(400, ['error' => 'Nessun dato valido da aggiornare.']); break;
        case 'recover':
            if (empty($b['email'])) respond(400, ['error' => 'Email obbligatoria.']);
            $url = $base . '/auth/v1/recover';
            if (!empty($b['redirectTo'])) $url .= '?redirect_to=' . rawurlencode((string)$b['redirectTo']);
            $payload = ['email'=>$b['email']]; break;
        case 'logout':
            if (empty($b['access_token'])) respond(401, ['error' => 'Sessione non valida.']);
            $url = $base . '/auth/v1/logout'; $headers['Authorization'] = 'Bearer ' . $b['access_token']; break;
        default: respond(400, ['error' => 'Operazione non supportata.']);
    }
    [$status, $result] = http_json($url, $method, $headers, in_array($action, ['user','logout'], true) ? null : $payload);
    if ($status < 200 || $status >= 300) respond($status, ['error' => safe_error($result, 'Richiesta di autenticazione non riuscita.')]);
    respond(200, $result ?: ['success'=>true]);
}
function route_projects(): never {
    $user = require_user(); $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['GET','POST','PATCH','DELETE'], true)) respond(405, ['error'=>'Metodo non consentito.']);
    $q = 'select=id,title,data,created_at,updated_at';
    if ($method === 'GET') {
        [$s,$rows] = supa_rest('user_projects?' . http_build_query(['select'=>'id,title,data,created_at,updated_at','user_id'=>'eq.'.$user['id'],'order'=>'updated_at.desc']));
        if ($s < 200 || $s >= 300) respond(502, ['error'=>'Impossibile caricare i progetti.']);
        respond(200, ['projects'=>$rows]);
    }
    $b = body(); $id = (string)($b['id'] ?? '');
    if ($method === 'POST') {
        $title = trim((string)($b['title'] ?? '')); $data = $b['data'] ?? null;
        if ($title === '' || !is_array($data)) respond(400, ['error'=>'Sono richiesti titolo e dati del progetto.']);
        [$s,$rows] = supa_rest('user_projects', 'POST', [['user_id'=>$user['id'],'title'=>mb_substr($title,0,160),'data'=>$data]], ['Prefer'=>'return=representation']);
        if ($s < 200 || $s >= 300) respond(502, ['error'=>'Impossibile salvare il progetto.']);
        respond(201, ['project'=>$rows[0] ?? null]);
    }
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $id)) respond(400, ['error'=>'Identificativo progetto non valido.']);
    $query = http_build_query(['id'=>'eq.'.$id,'user_id'=>'eq.'.$user['id'],'select'=>'id,title,data,created_at,updated_at']);
    if ($method === 'DELETE') {
        [$s] = supa_rest('user_projects?' . $query, 'DELETE', null, ['Prefer'=>'return=minimal']);
        if ($s < 200 || $s >= 300) respond(502, ['error'=>'Impossibile eliminare il progetto.']);
        respond(200, ['success'=>true]);
    }
    $updates = [];
    if (isset($b['title'])) { $t=trim((string)$b['title']); if ($t==='') respond(400,['error'=>'Il titolo non può essere vuoto.']); $updates['title']=mb_substr($t,0,160); }
    if (is_array($b['data'] ?? null)) $updates['data']=$b['data'];
    if (!$updates) respond(400, ['error'=>'Nessun campo valido da aggiornare.']);
    [$s,$rows] = supa_rest('user_projects?' . $query, 'PATCH', $updates, ['Prefer'=>'return=representation']);
    if ($s < 200 || $s >= 300) respond(502, ['error'=>'Impossibile aggiornare il progetto.']);
    respond(200, ['project'=>$rows[0] ?? null]);
}
function route_preferences(): never {
    $user=require_user(); $method=$_SERVER['REQUEST_METHOD'];
    if ($method==='GET') {
        [$s,$rows]=supa_rest('user_preferences?'.http_build_query(['user_id'=>'eq.'.$user['id'],'select'=>'data','limit'=>'1']));
        if ($s<200 || $s>=300) respond(502,['error'=>'Impossibile caricare le preferenze.']);
        respond(200,['preferences'=>$rows[0]['data'] ?? (object)[]]);
    }
    if ($method!=='PUT') respond(405,['error'=>'Metodo non consentito.']);
    $b=body(32768); $ids=$b['savedProjectIds'] ?? null;
    if (!is_array($ids) || count($ids)>500) respond(400,['error'=>'Preferenze non valide.']);
    $ids=array_values(array_unique(array_filter($ids,fn($v)=>is_string($v)&&strlen($v)<=120)));
    [$s]=supa_rest('user_preferences?on_conflict=user_id','POST',[['user_id'=>$user['id'],'data'=>['savedProjectIds'=>$ids]]],['Prefer'=>'resolution=merge-duplicates,return=minimal']);
    if ($s<200 || $s>=300) respond(502,['error'=>'Impossibile salvare le preferenze.']);
    respond(200,['success'=>true]);
}
function route_subscription(): never {
    if ($_SERVER['REQUEST_METHOD']!=='GET') respond(405,['error'=>'Metodo non consentito.']);
    $user=require_user();
    [$s,$rows]=supa_rest('subscriptions?'.http_build_query(['user_id'=>'eq.'.$user['id'],'select'=>'plan,status,provider,current_period_end,cancel_at_period_end,price_amount,currency','order'=>'created_at.desc','limit'=>'1']));
    if ($s<200 || $s>=300) respond(502,['error'=>'Impossibile leggere lo stato dell’abbonamento.']);
    respond(200,['subscription'=>$rows[0] ?? null]);
}
function route_checkout(): never {
    if ($_SERVER['REQUEST_METHOD']!=='POST') respond(405,['error'=>'Metodo non consentito.']);
    $user=require_user(); $b=body(16384); $interval=$b['interval'] ?? '';
    if (!in_array($interval,['month','year'],true)) respond(400,['error'=>'Piano non valido.']);
    $price=setting($interval==='month'?'STRIPE_PRICE_MONTHLY':'STRIPE_PRICE_YEARLY');
    $app=setting('APP_URL'); $form=['mode'=>'subscription','line_items[0][price]'=>$price,'line_items[0][quantity]'=>'1','client_reference_id'=>$user['id'],'metadata[user_id]'=>$user['id'],'metadata[plan]'=>'premium','metadata[interval]'=>$interval,'subscription_data[metadata][user_id]'=>$user['id'],'subscription_data[metadata][plan]'=>'premium','success_url'=>rtrim($app,'/').'/?subscription=success','cancel_url'=>rtrim($app,'/').'/?subscription=cancel','allow_promotion_codes'=>'true'];
    if (!empty($user['email'])) $form['customer_email']=$user['email'];
    [$s,$r]=stripe_request('checkout/sessions','POST',$form);
    if ($s<200 || $s>=300 || empty($r['url'])) respond(502,['error'=>$r['error']['message'] ?? 'Impossibile avviare il pagamento.']);
    respond(200,['url'=>$r['url']]);
}
function route_webhook(): never {
    if ($_SERVER['REQUEST_METHOD']!=='POST') respond(405,['error'=>'Metodo non consentito.']);
    $raw=file_get_contents('php://input') ?: ''; $sig=$_SERVER['HTTP_STRIPE_SIGNATURE'] ?? ''; $secret=setting('STRIPE_WEBHOOK_SECRET');
    $timestamp=null; $v1=[];
    foreach (explode(',',$sig) as $part) { $p=explode('=',$part,2); if (($p[0]??'')==='t') $timestamp=$p[1]??null; if (($p[0]??'')==='v1') $v1[]=$p[1]??''; }
    if (!$timestamp || abs(time()-(int)$timestamp)>300) respond(400,['error'=>'Firma non valida.']);
    $expected=hash_hmac('sha256',$timestamp.'.'.$raw,$secret);
    $valid=false; foreach($v1 as $candidate) if(hash_equals($expected,$candidate)) $valid=true;
    if (!$valid) respond(400,['error'=>'Firma non valida.']);
    $event=json_decode($raw,true); $type=$event['type']??''; $obj=$event['data']['object']??[];
    $subId=is_string($obj['subscription']??null)?$obj['subscription']:($obj['subscription']['id']??null);
    if (in_array($type,['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'],true)) $subId=$obj['id']??null;
    if (in_array($type,['checkout.session.completed','checkout.session.async_payment_succeeded','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','invoice.payment_failed'],true) && $subId) {
        [$ss,$sub]=stripe_request('subscriptions/'.rawurlencode((string)$subId));
        if ($ss<200 || $ss>=300) respond(500,['error'=>'Impossibile verificare l’abbonamento su Stripe.']);
        $uid=$sub['metadata']['user_id']??$obj['client_reference_id']??$obj['metadata']['user_id']??'';
        if (!$uid) respond(400,['error'=>'Metadati utente mancanti.']);
        $status=$sub['status']??'incomplete'; $period=$sub['items']['data'][0]['current_period_end']??$sub['current_period_end']??null;
        $price=$sub['items']['data'][0]['price']??[];
        $entitled=in_array($status,['active','trialing','past_due'],true) || ($status==='canceled' && $period && $period>time());
        $row=['user_id'=>$uid,'provider'=>'stripe','provider_customer_id'=>is_string($sub['customer']??null)?$sub['customer']:($sub['customer']['id']??null),'provider_subscription_id'=>$sub['id'],'plan'=>$entitled?'premium':'base','status'=>$status==='unpaid'?'past_due':$status,'current_period_end'=>$period?gmdate('c', (int)$period):null,'cancel_at_period_end'=>(bool)($sub['cancel_at_period_end']??false),'price_amount'=>$price['unit_amount']??null,'currency'=>$price['currency']??null];
        [$ps]=supa_rest('subscriptions?on_conflict=provider_subscription_id','POST',[$row],['Prefer'=>'resolution=merge-duplicates,return=minimal']);
        if ($ps<200 || $ps>=300) respond(500,['error'=>'Impossibile salvare lo stato dell’abbonamento.']);
    }
    respond(200,['received'=>true]);
}
function route_ai(string $kind): never {
    if ($_SERVER['REQUEST_METHOD']!=='POST') respond(405,['error'=>'Metodo non consentito.']);
    $b=body(6*1024*1024);
    $account=setting('CLOUDFLARE_ACCOUNT_ID'); $token=setting('CLOUDFLARE_API_TOKEN');
    if ($kind==='assistant') {
        $message=mb_substr(trim((string)($b['message']??'')),0,4000); $image=$b['image']??null;
        if ($message==='' && empty($image['data'])) respond(400,['error'=>'Scrivi una domanda o allega una fotografia.']);
        if ($image && (!in_array($image['mimeType']??'', ['image/jpeg','image/png','image/webp'],true) || strlen((string)($image['data']??''))>5000000)) respond(400,['error'=>'Immagine non valida o troppo grande.']);
        $project=$b['project']??[]; $history=array_slice(is_array($b['history']??null)?$b['history']:[], -12);
        $system='Sei Mastro, assistente tecnico di FaiDaTeCasa. Rispondi in italiano, pratico e chiaro. Non inventare misure, rese, materiali o certificazioni. Per elettricità, gas, strutture, impermeabilizzazioni critiche e lavori in quota segnala quando serve un professionista abilitato. Distingui osservazioni da ipotesi. Per calcoli mostra formula, unità e dati mancanti; non inventare valori. Non usare LaTeX. Contesto progetto: '.json_encode($project,JSON_UNESCAPED_UNICODE).' Domanda: '.$message;
        $messages=[['role'=>'system','content'=>$system]];
        foreach($history as $item) if(in_array($item['role']??'', ['user','assistant','model'],true) && is_string($item['text']??null)) $messages[]=['role'=>($item['role']==='model'?'assistant':$item['role']),'content'=>mb_substr($item['text'],0,3000)];
        $userContent=$message ?: 'Analizza la fotografia allegata e descrivi ciò che è visibile.';
        if (!empty($image['data'])) $userContent=[['type'=>'text','text'=>$userContent],['type'=>'image_url','image_url'=>['url'=>'data:'.$image['mimeType'].';base64,'.$image['data']]]];
        $messages[]=['role'=>'user','content'=>$userContent]; $model='@cf/google/gemma-4-26b-a4b-it';
    } else {
        $style=mb_substr((string)($b['style']??'Japandi'),0,100); $room=mb_substr((string)($b['roomType']??'Ambiente interno'),0,120);
        if (!empty($b['image']['data'])) respond(501,['error'=>'La generazione da descrizione è disponibile; la modifica fedele di una fotografia caricata non è ancora supportata.']);
        $prompt='Genera un rendering architettonico fotorealistico per FaiDaTeCasa. Ambiente: '.$room.'. Stile: '.$style.'. Elementi: '.implode(', ',array_map('strval',array_slice($b['customizations']??[],0,12))).'. Indicazioni: '.mb_substr((string)($b['notes']??''),0,1000).'. Un’unica immagine completa, materiali plausibili, luce realistica, nessun testo o watermark.';
        $model='@cf/black-forest-labs/flux-1-schnell'; $messages=null;
    }
    $input=$kind==='assistant'?['messages'=>$messages,'max_tokens'=>1200]:['prompt'=>$prompt,'steps'=>4];
    [$s,$result]=http_json('https://api.cloudflare.com/client/v4/accounts/'.rawurlencode($account).'/ai/run/'.$model,'POST',['Authorization'=>'Bearer '.$token],$input,60);
    if ($s===429) respond(429,['error'=>'Limite AI temporaneamente raggiunto. Riprova più tardi.']);
    if ($s<200 || $s>=300 || ($result['success']??true)===false) respond(502,['error'=>'Il servizio AI non è riuscito a elaborare la richiesta.']);
    $r=$result['result']??[];
    if ($kind==='vision') {
        $img=is_string($r)?$r:($r['image']??'');
        if (!$img) respond(502,['error'=>'Il modello non ha restituito un’immagine.']);
        respond(200,['image'=>'data:image/png;base64,'.$img,'mimeType'=>'image/png']);
    }
    $text=$r['response']??$r['output']??$r['text']??null;
    if (is_array($text)) $text=json_encode($text,JSON_UNESCAPED_UNICODE);
    if (!is_string($text)) respond(502,['error'=>'Risposta AI non valida.']);
    respond(200,['text'=>$text]);
}

$path=trim((string)($_GET['route']??''),'/');
try {
    switch ($path) {
        case 'auth': route_auth();
        case 'projects': route_projects();
        case 'preferences': route_preferences();
        case 'subscription': route_subscription();
        case 'checkout': route_checkout();
        case 'stripe-webhook': route_webhook();
        case 'assistant': route_ai('assistant');
        case 'vision': route_ai('vision');
        default: respond(404,['error'=>'Endpoint non trovato.']);
    }
} catch (Throwable $e) {
    error_log('FaiDaTeCasa API: '.$e->getMessage());
    respond(500,['error'=>'Errore temporaneo del servizio.']);
}
