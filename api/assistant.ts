import type { VercelRequest, VercelResponse } from '@vercel/node';

const MODEL = process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash';

function sendError(res: VercelResponse, status: number, message: string) {
  return res.status(status).json({ error: message });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendError(res, 405, 'Metodo non consentito.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sendError(res, 503, 'Assistant AI non configurato: manca GEMINI_API_KEY sul server.');

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 4000) : '';
  if (!message && !body?.image?.data) return sendError(res, 400, 'Scrivi una domanda o allega una fotografia.');

  const project = body?.project ?? {};
  const history = Array.isArray(body?.history) ? body.history.slice(-12) : [];
  const parts: Array<Record<string, unknown>> = [{
    text: [
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
    ].join('\n\n')
  }];

  if (body?.image?.data && typeof body.image.data === 'string') {
    const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(body.image.mimeType) ? body.image.mimeType : 'image/jpeg';
    if (body.image.data.length > 5_000_000) return sendError(res, 413, 'Immagine troppo grande. Riduci la foto e riprova.');
    parts.push({ inline_data: { mime_type: mimeType, data: body.image.data } });
  }

  const contents = [
    ...history.filter((item: any) => ['user', 'model'].includes(item?.role) && typeof item?.text === 'string')
      .map((item: any) => ({ role: item.role, parts: [{ text: item.text.slice(0, 3000) }] })),
    { role: 'user', parts }
  ];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.55, maxOutputTokens: 1200 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini assistant error', response.status, data?.error?.message);
      return sendError(res, response.status === 429 ? 429 : 502, response.status === 429
        ? 'Limite temporaneo del servizio AI raggiunto. Riprova tra poco.'
        : 'Il servizio AI non è riuscito a elaborare la richiesta.');
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: any) => part.text || '')
      .join('\n').trim();
    if (!text) return sendError(res, 502, 'La risposta AI è vuota. Riprova con una domanda più specifica.');
    return res.status(200).json({ text, model: MODEL });
  } catch (error) {
    console.error('Assistant endpoint error', error);
    return sendError(res, 500, 'Errore temporaneo durante la richiesta AI.');
  }
}

export const config = { api: { bodyParser: { sizeLimit: '6mb' } } };
