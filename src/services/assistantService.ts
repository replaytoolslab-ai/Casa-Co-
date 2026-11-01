import { AssistantChatMessage, SafetyWarning, VisionStudioProject } from '../types';

export const SAFETY_PRESETS: Record<string, SafetyWarning> = {
  electric: {
    id: 'safe-elec',
    severity: 'critical',
    title: 'Attenzione: impianto elettrico',
    description: 'Non aprire quadri, scatole o driver e non intervenire su circuiti a 230 V. Anche un impianto apparentemente spento può essere pericoloso. Per collegamenti, modifiche o verifiche dell’impianto, rivolgiti a un elettricista abilitato.',
    requiredPPE: ['Non intervenire su parti elettriche in tensione', 'Affidare verifiche e collegamenti a un professionista abilitato']
  },
  dust: {
    id: 'safe-dust',
    severity: 'warning',
    title: 'Protezione da polveri e residui',
    description: 'Carteggiatura, taglio e lavorazione di materiali edili possono generare polveri nocive. Consulta la scheda di sicurezza del materiale e le istruzioni dell’attrezzatura; limita la dispersione della polvere e usa protezioni adeguate al rischio.',
    requiredPPE: ['Protezione respiratoria idonea al materiale e alla lavorazione', 'Occhiali di protezione', 'Protezione acustica quando richiesta']
  },
  blade: {
    id: 'safe-blade',
    severity: 'warning',
    title: 'Attenzione agli utensili da taglio',
    description: 'Usa l’utensile solo dopo aver letto il manuale, verificato protezioni e fissaggio del pezzo e liberato l’area di lavoro. Non avvicinare le mani alla lama e non rimuovere i dispositivi di sicurezza.',
    requiredPPE: ['Occhiali di protezione', 'Protezione acustica quando richiesta', 'Abbigliamento aderente e adatto alla macchina']
  }
};

/**
 * This service currently provides local rule-based demo replies.
 * It does not call an AI model and cannot inspect uploaded image contents.
 */
export class AssistantService {
  generateReply(
    userText: string,
    project: VisionStudioProject,
    attachedImageName?: string
  ): AssistantChatMessage {
    const textLower = userText.toLowerCase();

    let safetyAlert: SafetyWarning | undefined;
    if (
      textLower.includes('luce') ||
      textLower.includes('led') ||
      textLower.includes('corrente') ||
      textLower.includes('elettric')
    ) {
      safetyAlert = SAFETY_PRESETS.electric;
    } else if (
      textLower.includes('leviga') ||
      textLower.includes('calce') ||
      textLower.includes('polvere')
    ) {
      safetyAlert = SAFETY_PRESETS.dust;
    } else if (textLower.includes('taglio') || textLower.includes('sega') || textLower.includes('lama')) {
      safetyAlert = SAFETY_PRESETS.blade;
    }

    if (attachedImageName || textLower.includes('foto') || textLower.includes('vedi')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: attachedImageName
          ? `Ho ricevuto il riferimento all’immagine “${attachedImageName}”, ma questa versione dimostrativa non può ancora analizzarne il contenuto. Non posso quindi confermare lo stato della superficie o suggerire lavorazioni basandomi sulla foto. Descrivimi cosa vuoi verificare; per valutazioni tecniche decisive, fai controllare il lavoro da un professionista.`
          : 'Questa versione dimostrativa non può ancora visualizzare o analizzare le foto. Se mi descrivi ciò che si vede e il dubbio che hai, posso offrirti indicazioni generali, distinguendo sempre le stime dalle verifiche tecniche.',
        timestamp: 'Adesso',
        safetyAlert
      };
    }

    if (textLower.includes('material') || textLower.includes('costo') || textLower.includes('budget')) {
      const budgetLeft = project.budget.target - project.budget.spent;
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Dai dati attualmente presenti nel progetto dimostrativo risultano €${project.budget.spent} registrati su un budget di €${project.budget.target}, con €${budgetLeft} di differenza. I materiali contrassegnati come ricevuti sono ${project.materials.filter((m) => m.status === 'received').length}. Verifica questi dati con gli acquisti e le consegne reali prima di usarli per decidere.`,
        timestamp: 'Adesso',
        safetyAlert
      };
    }

    if (textLower.includes('misure') || textLower.includes('pareti') || textLower.includes('dimensio')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Nel progetto dimostrativo sono inserite queste quote: ${project.scanData.width} × ${project.scanData.length} cm, altezza ${project.scanData.height} cm (${project.scanData.squareMeters} mq indicati). Sono dati di esempio o inseriti manualmente, non una scansione verificata: controllali con un rilievo reale prima di acquistare materiali o eseguire tagli.`,
        timestamp: 'Adesso',
        safetyAlert
      };
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Posso aiutarti a ragionare su “${userText}” usando i dati attualmente presenti nel progetto “${project.name}”. Nota: questa è una risposta dimostrativa basata su regole locali, non una risposta generata da un modello AI. L’avanzamento indicato (${project.progress}%) deriva dalla checklist demo. Se mi dai più dettagli, posso aiutarti a organizzare i passaggi e individuare le verifiche da fare.`,
      timestamp: 'Adesso',
      safetyAlert
    };
  }
}

export const assistantService = new AssistantService();
