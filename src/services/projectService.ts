import { VisionStudioProject } from '../types';

export const INITIAL_VISION_PROJECT: VisionStudioProject = {
  id: 'vision-proj-01',
  name: 'Ristrutturazione Living & Cucina Open Space',
  roomType: 'Soggiorno con Angolo Cottura',
  status: 'in_progress',
  progress: 62,
  mainImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80',
  activeProposalId: 'prop-01',
  proposals: [
    {
      id: 'prop-01',
      title: 'Proposta 1 — Japandi Warm & Cannettato Noce',
      styleId: 'japandi',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      description: 'Armonia materica tra legno naturale di rovere fiammato, parete d’accento cannettata in noce, pavimento in microcemento beige caldo e illuminazione lineare a 2700K.',
      estimatedCost: '€4.200 - €5.800',
      highlights: ['Isola monolitica centrale', 'Pannellatura acustica in legno', 'Luce indiretta continua'],
      materialsList: ['Rovere massello 40mm', 'Microcemento idrorepellente', 'Listelli noce canaletto 20x20mm']
    },
    {
      id: 'prop-02',
      title: 'Proposta 2 — Minimalismo Minerale & Calce Bianca',
      styleId: 'minimal-mineral',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
      description: 'Focus sulle superfici organiche: rasatura a calce naturale con marmorino veneziano, mobili sospesi a scomparsa totale e accenti in ferro nero cerato.',
      estimatedCost: '€3.800 - €4.900',
      highlights: ['Pareti traspiranti a calce', 'Nessuna maniglia a vista', 'Ampie vetrate con frangisole'],
      materialsList: ['Grassello di calce stagionato', 'Ferro cerato', 'Top in graniglia levigata']
    },
    {
      id: 'prop-03',
      title: 'Proposta 3 — Moderno Mediterraneo con Rovere e Terracotta',
      styleId: 'mediterranean',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
      description: 'Atmosfera solare e calda: inserti in cotto fatto a mano, travi in legno a vista decapate a cera e arredi lineari su misura in frassino naturale.',
      estimatedCost: '€4.500 - €6.200',
      highlights: ['Dettagli in cotto artigianale', 'Mobili cucina in frassino', 'Nicchie illuminate ad arco'],
      materialsList: ['Cotto naturale sgrassato', 'Frassino sbiancato', 'Ottone satinato']
    }
  ],
  customizations: {
    accentWall: true,
    woodSlats: true,
    ledChannel: true,
    microcementFloor: true,
    suspendedFixtures: false
  },
  scanData: {
    width: 520, // 5.20 m
    length: 470, // 4.70 m
    height: 280, // 2.80 m
    squareMeters: 24.44,
    volumeCubicMeters: 68.43,
    walls: [
      { id: 'w-1', orientation: 'Nord', length: 520, height: 280, finish: 'Rasatura calce calda', hasAccentFeature: true },
      { id: 'w-2', orientation: 'Est', length: 470, height: 280, finish: 'Cannettato noce', hasAccentFeature: true },
      { id: 'w-3', orientation: 'Sud', length: 520, height: 280, finish: 'Intonaco neutro', hasAccentFeature: false },
      { id: 'w-4', orientation: 'Ovest', length: 470, height: 280, finish: 'Vetrata scorrevole', hasAccentFeature: false }
    ],
    openings: [
      { id: 'op-1', type: 'door', wallIndex: 2, width: 90, height: 215, offset: 120 },
      { id: 'op-2', type: 'window', wallIndex: 3, width: 220, height: 240, offset: 80 }
    ],
    scanStatus: 'demo_mode',
    isLiDARAvailable: false,
    arFramework: 'ARKit',
    lastScanTimestamp: 'Oggi alle 11:20',
    calibrationConfidence: 94
  },
  budget: {
    target: 5000,
    spent: 2850,
    estimatedTotal: 4750,
    currency: '€'
  },
  materials: [
    { id: 'm-1', name: 'Microcemento bicomponente per pavimenti (30 mq)', quantity: '3 kit completi', status: 'received', cost: 680 },
    { id: 'm-2', name: 'Listelli cannettati noce canaletto 20x20mm', quantity: '60 pezzi (240cm)', status: 'received', cost: 480 },
    { id: 'm-3', name: 'Profilo alluminio LED 45° a scomparsa 24V', quantity: '10 metri', status: 'received', cost: 160 },
    { id: 'm-4', name: 'Tavole rovere massello fiammato spessore 45mm', quantity: '4 tavole (220cm)', status: 'ordered', cost: 520 },
    { id: 'm-5', name: 'Kit sigillante e primer antimacchia poliuretanico', quantity: '5 litri', status: 'to_order', cost: 140 },
    { id: 'm-6', name: 'Boccole filettate e ferramenta a scomparsa', quantity: '1 set completo', status: 'received', cost: 95 }
  ],
  checklist: [
    { id: 'c-1', title: 'Rilievo laser e verifica quote perimetrali', phase: 'Fase 1: Preparazione', completed: true },
    { id: 'c-2', title: 'Rimozione battiscopa e scasso per canaline LED', phase: 'Fase 1: Preparazione', completed: true, safetyNote: 'Occhiali e mascherina antipolvere obbligatori' },
    { id: 'c-3', title: 'Applicazione primer barriera vapore su massetto', phase: 'Fase 2: Superfici', completed: true },
    { id: 'c-4', title: 'Posa prima mano microcemento con rete fibra', phase: 'Fase 2: Superfici', completed: true },
    { id: 'c-5', title: 'Seconda mano e spatolatura serica fine', phase: 'Fase 2: Superfici', completed: true },
    { id: 'c-6', title: 'Sigillatura idrorepellente satinata (2 mani incrociate)', phase: 'Fase 2: Superfici', completed: false },
    { id: 'c-7', title: 'Installazione parete cannettata in noce', phase: 'Fase 3: Ebanisteria', completed: false },
    { id: 'c-8', title: 'Allacciamento e calibrazione dimmer LED 24V', phase: 'Fase 4: Impianti', completed: false, safetyNote: 'Togliere tensione generale dal quadro elettrico' }
  ],
  photoDiary: [
    {
      id: 'pd-1',
      title: 'Stato iniziale cantiere e rimozione vecchi rivestimenti',
      timestamp: '3 giorni fa',
      photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      notes: 'Massetto asciutto con umidità all’1.4%. Pareti ripulite e tracciati i punti luce per le strisce LED.',
      phase: 'Preparazione'
    },
    {
      id: 'pd-2',
      title: 'Stesura microcemento primo strato e rete d’armatura',
      timestamp: 'Ieri',
      photoUrl: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80',
      notes: 'Planarità perfetta. La fibra di vetro impedisce micro-fessurazioni lungo i giunti del vecchio massetto.',
      phase: 'Superfici'
    }
  ],
  chatHistory: [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Ciao Matteo! Sono il tuo assistente cantiere Vision Studio. Il progetto "Living & Cucina Open Space" è al 62% di avanzamento. La prima mano di microcemento è completata: vuoi che verifichiamo i tempi di asciugatura prima del sigillante?',
      timestamp: '10:45'
    }
  ],
  createdAt: '28 Ottobre 2026',
  lastModified: 'Oggi alle 12:15'
};

export const BATHROOM_VISION_PROJECT: VisionStudioProject = {
  id: 'vision-proj-02',
  name: 'Bagno Padronale in Teak & Doccia a Filo',
  roomType: 'Bagno Padronale',
  status: 'in_progress',
  progress: 45,
  mainImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80',
  beforeImage: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80',
  activeProposalId: 'prop-bath-1',
  proposals: [
    {
      id: 'prop-bath-1',
      title: 'Proposta 1 — Teak Nautico & Calce Minerale Grigia',
      styleId: 'japandi',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80',
      description: 'Mobile sospeso artigianale in massello di teak trattato a cera, doccia walk-in con canalina a scomparsa e specchio tondo retroilluminato.',
      estimatedCost: '€2.400 - €3.600',
      highlights: ['Legno di teak idrorepellente', 'Canalina doccia filo pavimento', 'Miscelatori incasso nero opaco'],
      materialsList: ['Teak massello 28mm', 'Resina impermeabile bicomponente', 'Vetro extrachiaro 8mm']
    }
  ],
  customizations: {
    accentWall: true,
    woodSlats: false,
    ledChannel: true,
    microcementFloor: true,
    suspendedFixtures: true
  },
  scanData: {
    width: 320,
    length: 300,
    height: 270,
    squareMeters: 9.6,
    volumeCubicMeters: 25.92,
    walls: [
      { id: 'w-b1', orientation: 'Nord', length: 320, height: 270, finish: 'Mosaico pietra naturale', hasAccentFeature: true },
      { id: 'w-b2', orientation: 'Est', length: 300, height: 270, finish: 'Resina impermeabile', hasAccentFeature: false },
      { id: 'w-b3', orientation: 'Sud', length: 320, height: 270, finish: 'Intonaco traspirante', hasAccentFeature: false },
      { id: 'w-b4', orientation: 'Ovest', length: 300, height: 270, finish: 'Finestra satinata', hasAccentFeature: false }
    ],
    openings: [
      { id: 'op-b1', type: 'door', wallIndex: 2, width: 80, height: 210, offset: 50 },
      { id: 'op-b2', type: 'window', wallIndex: 3, width: 90, height: 140, offset: 100 }
    ],
    scanStatus: 'demo_mode',
    isLiDARAvailable: false,
    arFramework: 'ARKit',
    lastScanTimestamp: 'Ieri alle 16:40',
    calibrationConfidence: 96
  },
  budget: {
    target: 2800,
    spent: 1250,
    estimatedTotal: 2650,
    currency: '€'
  },
  materials: [
    { id: 'mb-1', name: 'Tavole teak nautico calibrato 28mm', quantity: '2 tavole da 250cm', status: 'received', cost: 280 },
    { id: 'mb-2', name: 'Kit guaina liquida e bandelle tenuta per doccia', quantity: '1 kit completo', status: 'received', cost: 135 },
    { id: 'mb-3', name: 'Corpo miscelatore termostatico incasso 2 vie', quantity: '1 set', status: 'received', cost: 195 },
    { id: 'mb-4', name: 'Lavabo da appoggio in ceramica matt', quantity: '1 pezzo (42cm)', status: 'ordered', cost: 140 }
  ],
  checklist: [
    { id: 'cb-1', title: 'Impermeabilizzazione piatto doccia a filo', phase: 'Fase 1', completed: true },
    { id: 'cb-2', title: 'Costruzione mobile lavabo in teak a 45°', phase: 'Fase 2', completed: true },
    { id: 'cb-3', title: 'Montaggio rubinetteria e collaudo pressione', phase: 'Fase 3', completed: false, safetyNote: 'Verifica tenuta a 6 bar con manometro' }
  ],
  photoDiary: [
    {
      id: 'pdb-1',
      title: 'Posa bandelle di tenuta e collaudo scarico',
      timestamp: '5 giorni fa',
      photoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      notes: 'Pendenza di scarico dell’1.5% verificata con livella digitale.',
      phase: 'Idraulica'
    }
  ],
  chatHistory: [
    {
      id: 'msg-b1',
      sender: 'assistant',
      text: 'Ciao! Sono pronto per guidarti nella sigillatura della zona doccia del Bagno Padronale. Ricorda di lasciare asciugare la prima mano di guaina elastica per 4 ore prima del secondo strato.',
      timestamp: '09:15'
    }
  ],
  createdAt: '22 Ottobre 2026',
  lastModified: 'Ieri alle 17:00'
};

export const PRESET_VISION_PROJECTS: VisionStudioProject[] = [
  INITIAL_VISION_PROJECT,
  BATHROOM_VISION_PROJECT
];

class ProjectService {
  private currentProject: VisionStudioProject = INITIAL_VISION_PROJECT;
  private listeners: ((p: VisionStudioProject) => void)[] = [];

  getProject(): VisionStudioProject {
    return this.currentProject;
  }

  updateProject(updates: Partial<VisionStudioProject>): VisionStudioProject {
    this.currentProject = {
      ...this.currentProject,
      ...updates,
      lastModified: 'Adesso'
    };
    this.notify();
    return this.currentProject;
  }

  updateCustomizations(customs: Partial<VisionStudioProject['customizations']>): void {
    this.currentProject = {
      ...this.currentProject,
      customizations: {
        ...this.currentProject.customizations,
        ...customs
      },
      lastModified: 'Adesso'
    };
    this.notify();
  }

  updateScanDimensions(width: number, length: number, height: number): void {
    const squareMeters = Number(((width * length) / 10000).toFixed(2));
    const volumeCubicMeters = Number(((width * length * height) / 1000000).toFixed(2));
    
    const updatedWalls = this.currentProject.scanData.walls.map((wall) => {
      if (wall.orientation === 'Nord' || wall.orientation === 'Sud') {
        return { ...wall, length: width, height };
      }
      return { ...wall, length, height };
    });

    this.currentProject = {
      ...this.currentProject,
      scanData: {
        ...this.currentProject.scanData,
        width,
        length,
        height,
        squareMeters,
        volumeCubicMeters,
        walls: updatedWalls,
        lastScanTimestamp: 'Modificato manualmente'
      },
      lastModified: 'Adesso'
    };
    this.notify();
  }

  addOpening(opening: Omit<VisionStudioProject['scanData']['openings'][0], 'id'>): void {
    const newOpening = {
      ...opening,
      id: `op-${Date.now()}`
    };
    this.currentProject = {
      ...this.currentProject,
      scanData: {
        ...this.currentProject.scanData,
        openings: [...this.currentProject.scanData.openings, newOpening]
      },
      lastModified: 'Adesso'
    };
    this.notify();
  }

  removeOpening(openingId: string): void {
    this.currentProject = {
      ...this.currentProject,
      scanData: {
        ...this.currentProject.scanData,
        openings: this.currentProject.scanData.openings.filter((o) => o.id !== openingId)
      },
      lastModified: 'Adesso'
    };
    this.notify();
  }

  toggleChecklistItem(itemId: string): void {
    const updatedChecklist = this.currentProject.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    const completedCount = updatedChecklist.filter((i) => i.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);

    this.currentProject = {
      ...this.currentProject,
      checklist: updatedChecklist,
      progress,
      lastModified: 'Adesso'
    };
    this.notify();
  }

  addPhotoDiaryEntry(entry: Omit<VisionStudioProject['photoDiary'][0], 'id'>): void {
    const newEntry = {
      ...entry,
      id: `pd-${Date.now()}`
    };
    this.currentProject = {
      ...this.currentProject,
      photoDiary: [newEntry, ...this.currentProject.photoDiary],
      lastModified: 'Adesso'
    };
    this.notify();
  }

  addChatMessage(message: Omit<VisionStudioProject['chatHistory'][0], 'id'>): void {
    const newMsg = {
      ...message,
      id: `msg-${Date.now()}`
    };
    this.currentProject = {
      ...this.currentProject,
      chatHistory: [...this.currentProject.chatHistory, newMsg],
      lastModified: 'Adesso'
    };
    this.notify();
  }

  loadProject(project: VisionStudioProject): void {
    this.currentProject = { ...project, lastModified: 'Adesso' };
    this.notify();
  }

  subscribe(listener: (p: VisionStudioProject) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentProject);
    }
  }
}

export const projectService = new ProjectService();
