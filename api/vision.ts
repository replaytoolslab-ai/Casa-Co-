import { CloudflareAIError, runCloudflareModel } from './_lib/cloudflare-ai.ts';

type VercelRequest = { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> };
type VercelResponse = {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
  setHeader(name: string, value: string): void;
};

const MODEL = '@cf/black-forest-labs/flux-1-schnell';
const requestBuckets = new Map<string, number[]>();

function rateLimited(req: VercelRequest): boolean {
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = (requestBuckets.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  if (recent.length >= 10) return true;
  recent.push(now);
  requestBuckets.set(ip, recent);
  return false;
}

function sendError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}

function parseBody(req: VercelRequest): any {
  if (typeof req.body !== 'string') return req.body ?? {};
  try {
    return JSON.parse(req.body);
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Metodo non consentito.');
  }

  if (rateLimited(req)) return sendError(res, 429, 'Troppe richieste. Attendi qualche minuto prima di riprovare.');

  const body = parseBody(req);
  if (!body || typeof body !== 'object') return sendError(res, 400, 'Richiesta non valida.');

  const style = typeof body.style === 'string' ? body.style.slice(0, 100) : 'Japandi';
  const roomType = typeof body.roomType === 'string' ? body.roomType.slice(0, 120) : 'Ambiente interno';
  const customizations = Array.isArray(body.customizations)
    ? body.customizations.slice(0, 12).map((value: unknown) => String(value).slice(0, 100))
    : [];
  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 1000) : '';

  // The verified Free model is text-to-image only. Never pretend it edited an uploaded room photo.
  if (body.image?.data) {
    return sendError(
      res,
      501,
      'La generazione da descrizione è disponibile. La modifica fedele di una fotografia caricata richiede un modello image-to-image gratuito che al momento non è verificato: la foto non è stata ignorata.'
    );
  }

  const prompt = [
    'Genera un rendering architettonico fotorealistico di alta qualità per un progetto Casa&Co.',
    'Ambiente: ' + roomType + '.',
    'Stile: ' + style + '.',
    'Elementi richiesti: ' + (customizations.join(', ') || 'progettazione coerente con lo stile scelto') + '.',
    'Indicazioni aggiuntive: ' + (notes || 'nessuna') + '.',
    'Crea un interno credibile, ben proporzionato e fotografato con prospettiva architettonica naturale.',
    'Nessun testo, watermark aggiuntivo, etichetta o collage. Un’unica immagine completa, illuminazione realistica, materiali fisicamente plausibili.'
  ].join('\n');

  try {
    const result = await runCloudflareModel(MODEL, {
      prompt,
      steps: 4
    }) as { image?: unknown } | string;

    const imageData = typeof result === 'string'
      ? result
      : typeof result?.image === 'string' ? result.image : '';
    if (!imageData) return sendError(res, 502, 'Il modello non ha restituito un’immagine. Riprova.');
    return res.status(200).json({
      image: `data:image/png;base64,${imageData}`,
      mimeType: 'image/png'
    });
  } catch (error) {
    if (error instanceof CloudflareAIError) return sendError(res, error.statusCode, error.message);
    console.error('Vision endpoint error', error);
    return sendError(res, 500, 'Errore temporaneo durante la generazione del rendering.');
  }
}

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };
