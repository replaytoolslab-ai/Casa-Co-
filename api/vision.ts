type VercelRequest = { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> };
type VercelResponse = {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
  setHeader(name: string, value: string): void;
};

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Metodo non consentito.');
  }

  if (rateLimited(req)) return sendError(res, 429, 'Troppe richieste. Attendi qualche minuto prima di riprovare.');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendError(res, 503, 'Vision AI non configurato: manca GEMINI_API_KEY sul server.');

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const style = typeof body?.style === 'string' ? body.style.slice(0, 100) : 'Japandi';
  const roomType = typeof body?.roomType === 'string' ? body.roomType.slice(0, 120) : 'Ambiente interno';
  const customizations = Array.isArray(body?.customizations) ? body.customizations.slice(0, 12).map((v: unknown) => String(v).slice(0, 100)) : [];
  const notes = typeof body?.notes === 'string' ? body.notes.slice(0, 1000) : '';
  const image = body?.image;

  const input: Array<Record<string, string>> = [{
    type: 'text',
    text: [
      'Genera un rendering architettonico fotorealistico di alta qualità per un progetto Casa&Co.',
      'Ambiente: ' + roomType + '.',
      'Stile: ' + style + '.',
      'Elementi richiesti: ' + (customizations.join(', ') || 'progettazione coerente con lo stile scelto') + '.',
      'Indicazioni aggiuntive: ' + (notes || 'nessuna') + '.',
      image?.data
        ? 'Usa la fotografia allegata come riferimento primario. Mantieni geometria, prospettiva, posizione di porte e finestre e caratteristiche strutturali dell’ambiente. Modifica solo arredi, materiali, finiture e illuminazione.'
        : 'Crea un interno credibile, ben proporzionato e fotografato con prospettiva architettonica naturale.',
      'Nessun testo, watermark aggiuntivo, etichetta o collage. Un’unica immagine completa, illuminazione realistica, materiali fisicamente plausibili.'
    ].join('\n')
  }];

  if (image?.data && typeof image.data === 'string') {
    if (image.data.length > 5_000_000) return sendError(res, 413, 'Fotografia troppo grande. Riduci la dimensione e riprova.');
    const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType) ? image.mimeType : 'image/jpeg';
    input.push({ type: 'image', mime_type: mimeType, data: image.data });
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        model: process.env.GEMINI_IMAGE_MODEL || 'gemini-nano-banana-2.1',
        input,
        response_format: { type: 'image', mime_type: 'image/jpeg', aspect_ratio: '16:9', image_size: '1K' }
      })
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini vision error', response.status, data?.error?.message);
      return sendError(res, response.status === 429 ? 429 : 502, response.status === 429
        ? 'Limite temporaneo di generazione immagini raggiunto. Riprova tra poco.'
        : 'Il servizio di generazione immagini non è riuscito a completare il rendering.');
    }

    const imageData = data?.output_image?.data
      || data?.steps?.flatMap((step: any) => step?.content || []).find((part: any) => part?.type === 'image')?.data;
    const mimeType = data?.output_image?.mime_type || 'image/jpeg';
    if (!imageData) return sendError(res, 502, 'Il modello non ha restituito un’immagine. Riprova.');
    return res.status(200).json({ image: `data:${mimeType};base64,${imageData}`, mimeType });
  } catch (error) {
    console.error('Vision endpoint error', error);
    return sendError(res, 500, 'Errore temporaneo durante la generazione del rendering.');
  }
}

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };
