import { AssistantChatMessage, SafetyWarning, VisionStudioProject } from '../types';

export const SAFETY_PRESETS: Record<string, SafetyWarning> = {
  electric: {
    id: 'safe-elec',
    severity: 'critical',
    title: 'Disattivazione Tensione 220V',
    description: 'Prima di toccare qualsiasi linea o canalina LED a 24V con driver primario a 220V, stacca l’interruttore generale del quadro di casa e verifica l’assenza di tensione con cercafase.',
    requiredPPE: ['Guanti isolanti 1000V', 'Cacciavite isolato VDE', 'Tester cercafase']
  },
  dust: {
    id: 'safe-dust',
    severity: 'warning',
    title: 'Polveri di Legno Nobile & Calce',
    description: 'La carteggiatura del rovere e la rasatura a secco della calce rilasciano micro-polveri irritanti per le vie respiratorie e la vista.',
    requiredPPE: ['Mascherina protettiva FFP2 / FFP3', 'Occhiali ermetici EN166', 'Cuffie antirumore']
  },
  blade: {
    id: 'safe-blade',
    severity: 'warning',
    title: 'Taglio con Sega ad Affondamento',
    description: 'Verifica sempre che il binario guida sia bloccato con morsetti a morsa prima di avviare il motore. Non forzare l’avanzamento della lama.',
    requiredPPE: ['Guanti antiscivolo', 'Visiera di protezione', 'Nessun indumento con maniche svolazzanti']
  }
};

export class AssistantService {
  generateReply(
    userText: string,
    project: VisionStudioProject,
    attachedImageName?: string
  ): AssistantChatMessage {
    const textLower = userText.toLowerCase();

    // Check for safety keywords
    let safetyAlert: SafetyWarning | undefined = undefined;
    if (textLower.includes('luce') || textLower.includes('led') || textLower.includes('corrente') || textLower.includes('elettric')) {
      safetyAlert = SAFETY_PRESETS.electric;
    } else if (textLower.includes('leviga') || textLower.includes('calce') || textLower.includes('polvere') || textLower.includes('taglio')) {
      safetyAlert = SAFETY_PRESETS.dust;
    }

    // Contextual intelligent responses based on current project data
    if (attachedImageName || textLower.includes('foto') || textLower.includes('vedi')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Ho esaminato l’immagine caricata nel contesto del cantiere "${project.name}". La superficie evidenzia un buon grado di planarità. Ti consiglio di procedere con la mano di primer isolante per uniformare l’assorbimento prima di posare il rivestimento finale.`,
        timestamp: 'Adesso',
        safetyAlert,
        illustratedStep: {
          stepNumber: 3,
          title: 'Verifica Planarità con Staggia di 2 Metri',
          instructions: [
            'Appoggia la staggia sul pavimento in tre diagonali differenti.',
            'Verifica che la luce sotto la staggia sia inferiore a 2 mm.',
            'Rasa con livellina rapida se riscontri avvallamenti.'
          ]
        }
      };
    }

    if (textLower.includes('material') || textLower.includes('costo') || textLower.includes('budget')) {
      const budgetLeft = project.budget.target - project.budget.spent;
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Nel cantiere attuale hai registrato €${project.budget.spent} spesi su un budget di €${project.budget.target} (€${budgetLeft} residui). Tutti i materiali per la fase 2 (${project.materials.filter((m) => m.status === 'received').length} articoli) risultano già arrivati in cantiere.`,
        timestamp: 'Adesso'
      };
    }

    if (textLower.includes('misure') || textLower.includes('pareti') || textLower.includes('dimensio')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `La stanza misura attualmente ${project.scanData.width} × ${project.scanData.length} cm con altezza di ${project.scanData.height} cm (${project.scanData.squareMeters} mq calpestabili). Le quote sono sincronizzate sia nello Scan 3D che nella distinta di taglio del Vision Studio.`,
        timestamp: 'Adesso'
      };
    }

    // Default craftsman expert response
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `Riguardo a "${userText}": nel tuo progetto "${project.name}", ti suggerisco di seguire la sequenza della checklist di cantiere. La fase attuale è al ${project.progress}% di avanzamento. Se desideri dettagli esecutivi o schemi illustrati di montaggio, chiedimi pure!`,
      timestamp: 'Adesso',
      safetyAlert
    };
  }
}

export const assistantService = new AssistantService();
