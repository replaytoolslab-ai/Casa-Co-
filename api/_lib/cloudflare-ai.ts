export class CloudflareAIError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly providerStatus?: number
  ) {
    super(message);
    this.name = 'CloudflareAIError';
  }
}

const API_BASE = 'https://api.cloudflare.com/client/v4/accounts';

type CloudflareEnvelope<T> = {
  success?: boolean;
  result?: T;
  errors?: Array<{ code?: number; message?: string }>;
};

export async function runCloudflareModel(
  model: string,
  input: Record<string, unknown>
): Promise<unknown> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

  if (!accountId || !apiToken) {
    throw new CloudflareAIError(
      'Servizio AI non configurato: mancano le credenziali Cloudflare sul server.',
      503
    );
  }

  if (!/^@[a-z0-9-]+\/[a-z0-9._-]+$/i.test(model)) {
    throw new CloudflareAIError('Modello AI non valido.', 500);
  }

  const url = `${API_BASE}/${encodeURIComponent(accountId)}/ai/run/${model}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(25_000)
    });
  } catch {
    throw new CloudflareAIError('Il servizio AI non è al momento raggiungibile. Riprova tra poco.', 502);
  }

  let payload: CloudflareEnvelope<unknown>;
  try {
    payload = await response.json() as CloudflareEnvelope<unknown>;
  } catch {
    throw new CloudflareAIError('Il servizio AI ha restituito una risposta non valida.', 502, response.status);
  }

  if (!response.ok || payload.success === false || payload.result === undefined) {
    const providerMessage = payload.errors?.map((item) => item.message || '').filter(Boolean).join(' ');
    if (response.status === 429) {
      throw new CloudflareAIError(
        'Limite gratuito AI raggiunto o servizio temporaneamente occupato. Riprova più tardi.',
        429,
        response.status
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new CloudflareAIError(
        'Cloudflare ha rifiutato l’accesso al modello. Verifica permessi del token e disponibilità del modello nel piano Free.',
        503,
        response.status
      );
    }
    throw new CloudflareAIError(
      providerMessage
        ? 'Cloudflare non è riuscito a elaborare la richiesta AI.'
        : 'Errore temporaneo del servizio AI.',
      502,
      response.status
    );
  }

  return payload.result;
}
