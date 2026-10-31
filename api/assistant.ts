import { CloudflareAIError, runCloudflareModel } from './_lib/cloudflare-ai.ts';

type VercelRequest = { method?: string; body?: any; headers?: Record<string, string | string[] | undefined> };
type VercelResponse = {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
  setHeader(name: string, value: string): void;
};

const MODEL = '@cf/google/gemma-4-26b-a4b-it';
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
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 4000) : '';
  const image = body.image;
  if (!message && !image?.data) return sendError(res, 400, 'Scrivi una domanda o allega una fotografia.');

  if (image?.data !== undefined) {
    if (typeof image.data !== 'string' || image.data.length > 5_000_000) {
      return sendError(res, image.data?.length > 5_000_000 ? 413 : 400, 'Immagine non valida o troppo grande.');
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType)) {
      return sendError(res, 400, 'Formato immagine non supportato. Usa JPG, PNG o WebP.');
    }
  }

  const project = body.project ?? {};
  const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
  const systemPrompt = [
    'Sei Mastro, l’assistente tecnico di Casa&Co. Rispondi in italiano, in modo pratico, chiaro e contestuale al progetto.',
    'Usa i dati del progetto forniti sotto. Non inventare misure, materiali o certificazioni.',
    'Per lavori elettrici, strutturali, gas, impermeabilizzazioni critiche e lavori in quota, evidenzia quando serve un professionista abilitato e non dare istruzioni che possano mettere a rischio persone.',
    'Se è allegata una foto, descrivi solo ciò che è realmente visibile e distingui osservazioni da ipotesi.',
    'Progetto: ' + JSON.stringify({
      name: project.name, roomType: project.roomType, progress: project.progress,
      scanData: project.scanData, budget: project.budget, materials: project.materials,
      checklist: project.checklist, customizations: project.customizations
    }),
    'Domanda dell’utente: ' + message
  ].join('\n\n');

  const messages: Array<{ role: string; content: string | Array<Record<string, unknown>> }> = [
    { role: 'system', content: systemPrompt },
    ...history
      .filter((item: any) => ['user', 'assistant', 'model'].includes(item?.role) && typeof item?.text === 'string')
      .map((item: any) => ({
        role: item.role === 'model' ? 'assistant' : item.role,
        content: item.text.slice(0, 3000)
      }))
  ];

  if (image?.data) {
    const mimeType = image.mimeType as string;
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message || 'Analizza la fotografia allegata e descrivi ciò che è visibile.' },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${image.data}` } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: message });
  }

  try {
    const result = await runCloudflareModel(MODEL, {
      messages,
      max_tokens: 1200,
      temperature: 0.55,
      chat_template_kwargs: { enable_thinking: false }
    }) as {
      response?: unknown;
      choices?: Array<{ message?: { content?: unknown } }>;
    };

    // Workers AI can return either the legacy { response } shape or the
    // chat-completions { choices[0].message.content } shape for message input.
    const choiceContent = result?.choices?.[0]?.message?.content;
    const rawAnswer = typeof result?.response === 'string' ? result.response : choiceContent;
    const answer = typeof rawAnswer === 'string' ? rawAnswer.trim() : '';
    if (!answer) return sendError(res, 502, 'La risposta AI è vuota. Riprova con una domanda più specifica.');
    return res.status(200).json({ text: answer, model: MODEL });
  } catch (error) {
    if (error instanceof CloudflareAIError) return sendError(res, error.statusCode, error.message);
    console.error('Assistant endpoint error', error);
    return sendError(res, 500, 'Errore temporaneo durante la richiesta AI.');
  }
}

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };
