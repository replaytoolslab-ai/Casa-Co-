export type Language = 'it' | 'en';

export interface Translations {
  nav: {
    home: string;
    categories: string;
    visionStudio: string;
    aiDesign: string;
    myProjects: string;
    profile: string;
  };
  common: {
    appName: string;
    tagline: string;
    createProject: string;
    explore: string;
    viewDetails: string;
    saveProject: string;
    saved: string;
    difficulty: string;
    timeRequired: string;
    estimatedCost: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    all: string;
    back: string;
    share: string;
    downloadGuide: string;
    searchPlaceholder: string;
    materials: string;
    tools: string;
    steps: string;
    expertTip: string;
    dimensions: string;
    budget: string;
    status: string;
    inProgress: string;
    completed: string;
    close: string;
    edit: string;
    delete: string;
  };
  home: {
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCta: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
    featuredTitle: string;
    featuredSubtitle: string;
    inspirationsTitle: string;
    inspirationsSubtitle: string;
    newsTitle: string;
    newsSubtitle: string;
    viewAllCategories: string;
    statProjects: string;
    statArtisans: string;
    statGuides: string;
  };
  categories: {
    title: string;
    subtitle: string;
    allCategories: string;
    filterByArea: string;
    guidesAvailable: string;
    viewProjects: string;
    items: {
      mobili: { name: string; desc: string; count: number };
      cucina: { name: string; desc: string; count: number };
      bagno: { name: string; desc: string; count: number };
      intonaci: { name: string; desc: string; count: number };
      pavimenti: { name: string; desc: string; count: number };
      giardino: { name: string; desc: string; count: number };
      pergole: { name: string; desc: string; count: number };
      falegnameria: { name: string; desc: string; count: number };
      muratura: { name: string; desc: string; count: number };
      idraulica: { name: string; desc: string; count: number };
      elettricita: { name: string; desc: string; count: number };
      verniciatura: { name: string; desc: string; count: number };
      cartongesso: { name: string; desc: string; count: number };
      isolamento: { name: string; desc: string; count: number };
      serramenti: { name: string; desc: string; count: number };
      illuminazione: { name: string; desc: string; count: number };
      restauro: { name: string; desc: string; count: number };
      impermeabilizzazione: { name: string; desc: string; count: number };
      terrazzi: { name: string; desc: string; count: number };
      attrezzi: { name: string; desc: string; count: number };
    };
  };
  aiDesign: {
    badge: string;
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    inputPlaceholder: string;
    samplePromptsLabel: string;
    samplePrompt1: string;
    samplePrompt2: string;
    samplePrompt3: string;
    dimensionsWidth: string;
    dimensionsDepth: string;
    dimensionsHeight: string;
    roomType: string;
    budgetLabel: string;
    experienceLevel: string;
    generateButton: string;
    generating: string;
    resultTitle: string;
    resultBlueprint: string;
    cutList: string;
    estimatedSavings: string;
    estimatedTime: string;
    saveToMyProjects: string;
    regenerate: string;
    woodType: string;
  };
  myProjects: {
    title: string;
    subtitle: string;
    tabAll: string;
    tabInProgress: string;
    tabSaved: string;
    tabCompleted: string;
    emptyTitle: string;
    emptyDesc: string;
    newProjectBtn: string;
    progressLabel: string;
    lastUpdated: string;
  };
  profile: {
    title: string;
    role: string;
    location: string;
    stats: {
      projectsCompleted: string;
      hoursDedicated: string;
      moneySaved: string;
      level: string;
    };
    toolboxTitle: string;
    toolboxSubtitle: string;
    settingsTitle: string;
    languageLabel: string;
    unitLabel: string;
    notifications: string;
    darkMode: string;
    aboutTitle: string;
    aboutText: string;
  };
}

export const translations: Record<Language, Translations> = {
  it: {
    nav: {
      home: 'Home',
      categories: 'Categorie',
      visionStudio: 'Vision Studio',
      aiDesign: 'Progetta con AI',
      myProjects: 'I miei progetti',
      profile: 'Profilo',
    },
    common: {
      appName: 'Casa&Co.',
      tagline: 'Fai-da-te, Mobili & Ristrutturazione',
      createProject: 'Crea il tuo progetto',
      explore: 'Esplora',
      viewDetails: 'Dettagli progetto',
      saveProject: 'Salva progetto',
      saved: 'Salvato',
      difficulty: 'Difficoltà',
      timeRequired: 'Tempo stimato',
      estimatedCost: 'Costo stimato',
      beginner: 'Facile / Base',
      intermediate: 'Intermedio',
      advanced: 'Avanzato',
      all: 'Tutti',
      back: 'Indietro',
      share: 'Condividi',
      downloadGuide: 'Scarica scheda PDF',
      searchPlaceholder: 'Cerca mobili, cucine, pergole, tecniche...',
      materials: 'Distinta materiali',
      tools: 'Strumenti necessari',
      steps: 'Fasi di realizzazione',
      expertTip: 'Il consiglio del mastro artigiano',
      dimensions: 'Dimensioni indicative',
      budget: 'Budget',
      status: 'Stato',
      inProgress: 'In corso',
      completed: 'Completato',
      close: 'Chiudi',
      edit: 'Modifica',
      delete: 'Elimina',
    },
    home: {
      heroKicker: 'L’Atelier della Casa Contemporanea',
      heroTitle: 'L’arte di abitare ciò che crei con le tue mani.',
      heroSubtitle: 'Progetti esclusivi, schemi tecnici millimetrici e guide passo-passo per costruire mobili d’autore e ristrutturare con eleganza.',
      heroCta: 'Inizia un progetto',
      categoriesTitle: 'Le discipline della casa',
      categoriesSubtitle: 'Dalla falegnameria d’arredo agli impianti e finiture murarie',
      featuredTitle: 'Progetti selezionati',
      featuredSubtitle: 'Guide dettagliate con costi, schemi di taglio e consigli di posa',
      inspirationsTitle: 'Ispirazioni editoriali',
      inspirationsSubtitle: 'Approfondimenti di stile, materiali naturali e tecniche senza tempo',
      newsTitle: 'Novità & Tendenze',
      newsSubtitle: 'Gli ultimi progetti pubblicati dalla nostra redazione di artigiani',
      viewAllCategories: 'Tutte le 20 categorie',
      statProjects: 'Progetti guidati',
      statArtisans: 'Membri della community',
      statGuides: 'Schede tecniche',
    },
    categories: {
      title: 'Categorie & Discipline',
      subtitle: '20 aree pratiche per costruire, riparare e rinnovare casa.',
      allCategories: 'Tutte le categorie',
      filterByArea: 'Filtra per area di intervento',
      guidesAvailable: 'guide disponibili',
      viewProjects: 'Vedi progetti',
      items: {
        mobili: { name: 'Mobili', desc: 'Tavoli, librerie modulari, consolle e complementi d’arredo su misura.', count: 0 },
        cucina: { name: 'Cucina', desc: 'Isole con banconi a listelli, top in resina e ante artigianali.', count: 0 },
        bagno: { name: 'Bagno', desc: 'Mobili sospesi in teak, posa rubinetteria da incasso e nicchie.', count: 0 },
        intonaci: { name: 'Intonaci e Rasatura', desc: 'Intonaci, rasatura, finiture a calce e rivestimenti decorativi.', count: 0 },
        pavimenti: { name: 'Pavimenti', desc: 'Spina ungherese, posa microcemento e recupero parquet d’epoca.', count: 0 },
        giardino: { name: 'Giardino', desc: 'Fioriere monolitiche, arredi outdoor e camminamenti in pietra.', count: 0 },
        pergole: { name: 'Pergole', desc: 'Strutture bioclimatiche in larice, tettoie e frangisole orientabili.', count: 0 },
        falegnameria: { name: 'Falegnameria', desc: 'Incastri giapponesi, piallatura, calibratura e finiture ad olio cotto.', count: 0 },
        muratura: { name: 'Muratura', desc: 'Pareti divisorie in cartongesso strutturale, intonaci grezzi e archi.', count: 0 },
        idraulica: { name: 'Idraulica', desc: 'Collettori moderni, scarichi a parete e sifoneria a vista in ottone.', count: 0 },
        elettricita: { name: 'Elettricità', desc: 'Linee LED a scomparsa, domotica fai-da-te e punti luce d’accento.', count: 0 },
        verniciatura: { name: 'Verniciatura', desc: 'Preparazione, pitture, smalti e finiture per legno, metallo e pareti.', count: 0 },
        cartongesso: { name: 'Cartongesso', desc: 'Pareti divisorie, controsoffitti, velette, nicchie e botole.', count: 0 },
        isolamento: { name: 'Isolamento', desc: 'Soluzioni termiche e acustiche, materiali e posa corretta.', count: 0 },
        serramenti: { name: 'Serramenti', desc: 'Finestre, porte, oscuranti, guarnizioni e regolazioni.', count: 0 },
        illuminazione: { name: 'Illuminazione', desc: 'Faretti, binari, LED, dimmer e luce per esterni.', count: 0 },
        restauro: { name: 'Restauro', desc: 'Recupero di mobili, legno, superfici e dettagli d’epoca.', count: 0 },
        impermeabilizzazione: { name: 'Impermeabilizzazione', desc: 'Docce, bagni, balconi, terrazzi, membrane e sigillature.', count: 0 },
        terrazzi: { name: 'Terrazzi & Balconi', desc: 'Pavimenti esterni, privacy, arredi, drenaggio e schermature.', count: 0 },
        attrezzi: { name: 'Attrezzi e utensili', desc: 'Utensili manuali, elettroutensili, strumenti di misura e protezioni.', count: 0 },
      },
    },
    aiDesign: {
      badge: 'Studio di Progettazione Assistita',
      title: 'Configura il tuo progetto su misura',
      subtitle: 'Descrivi la tua idea, imposta dimensioni e budget: generiamo distinta di taglio, stima dei costi e percorso di realizzazione.',
      step1Title: '1. Visione & Descrizione',
      step1Desc: 'Cosa desideri costruire o trasformare?',
      step2Title: '2. Dimensioni & Spazio',
      step2Desc: 'Misure millimetriche e destinazione d’uso',
      step3Title: '3. Budget & Materiali',
      step3Desc: 'Fascia di spesa e finiture desiderate',
      step4Title: '4. Esperienza & Attrezzatura',
      step4Desc: 'Adatteremo la complessità degli incastri',
      inputPlaceholder: 'Es. Tavolo da pranzo moderno per 8 persone con piano in rovere massello a doghe larghe e gambe a trapezio nero opaco...',
      samplePromptsLabel: 'Oppure prova un modello consigliato:',
      samplePrompt1: 'Tavolo da pranzo minimalista in rovere massello (200x90cm)',
      samplePrompt2: 'Mobile bagno sospeso in legno impermeabile con lavabo a ciotola',
      samplePrompt3: 'Pergola frangisole in larice per terrazzo di 16mq',
      dimensionsWidth: 'Larghezza (cm)',
      dimensionsDepth: 'Profondità (cm)',
      dimensionsHeight: 'Altezza (cm)',
      roomType: 'Ambiente di destinazione',
      budgetLabel: 'Budget indicativo',
      experienceLevel: 'Il tuo livello di manualità',
      generateButton: 'Genera Scheda Tecnica & Distinta',
      generating: 'Generazione schema esecutivo in corso...',
      resultTitle: 'Studio Esecutivo Generato',
      resultBlueprint: 'Schema & Quote Progetto',
      cutList: 'Distinta di Taglio Ottimizzata',
      estimatedSavings: 'Risparmio vs arredo acquistato',
      estimatedTime: 'Tempo di lavorazione consigliato',
      saveToMyProjects: 'Salva nei miei progetti',
      regenerate: 'Ricalcola con nuovi parametri',
      woodType: 'Essenza consigliata',
    },
    myProjects: {
      title: 'I miei progetti',
      subtitle: 'Il tuo banco di lavoro personale: bozze, avanzamento dei cantieri e progetti salvati.',
      tabAll: 'Tutti',
      tabInProgress: 'In corso',
      tabSaved: 'Salvati',
      tabCompleted: 'Completati',
      emptyTitle: 'Nessun progetto in questa sezione',
      emptyDesc: 'Esplora le collezioni o usa il Progettista per creare il tuo prossimo cantiere su misura.',
      newProjectBtn: 'Nuovo progetto',
      progressLabel: 'Avanzamento',
      lastUpdated: 'Ultimo aggiornamento',
    },
    profile: {
      title: 'Profilo & Laboratorio',
      role: 'Mastro Maker & Restauratore',
      location: 'Milano, Italia',
      stats: {
        projectsCompleted: 'Progetti completati',
        hoursDedicated: 'Ore di banco',
        moneySaved: 'Risparmio stimato',
        level: 'Livello artigiano',
      },
      toolboxTitle: 'Il mio banco attrezzi',
      toolboxSubtitle: 'Strumenti registrati per il calcolo della fattibilità dei progetti',
      settingsTitle: 'Preferenze applicazione',
      languageLabel: 'Lingua dell’interfaccia',
      unitLabel: 'Unità di misura',
      notifications: 'Notifiche aggiornamento guide',
      darkMode: 'Tema cantiere ad alto contrasto',
      aboutTitle: 'Filosofia Casa&Co.',
      aboutText: 'Casa&Co. unisce il rigore del design editoriale contemporaneo alla passione autentica per il fare. Crediamo che ogni casa acquisisca un’anima ineguagliabile quando custodisce elementi plasmati dalle mani di chi la vive.',
    },
  },
  en: {
    nav: {
      home: 'Home',
      categories: 'Categories',
      visionStudio: 'Vision Studio',
      aiDesign: 'Design with AI',
      myProjects: 'My Projects',
      profile: 'Profile',
    },
    common: {
      appName: 'Casa&Co.',
      tagline: 'DIY, Furniture & Home Renovation',
      createProject: 'Create your project',
      explore: 'Explore',
      viewDetails: 'Project details',
      saveProject: 'Save project',
      saved: 'Saved',
      difficulty: 'Difficulty',
      timeRequired: 'Estimated time',
      estimatedCost: 'Estimated cost',
      beginner: 'Beginner / Basic',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      all: 'All',
      back: 'Back',
      share: 'Share',
      downloadGuide: 'Download PDF guide',
      searchPlaceholder: 'Search furniture, kitchens, pergolas, techniques...',
      materials: 'Bill of materials',
      tools: 'Required tools',
      steps: 'Crafting steps',
      expertTip: 'Master craftsman tip',
      dimensions: 'Indicative dimensions',
      budget: 'Budget',
      status: 'Status',
      inProgress: 'In progress',
      completed: 'Completed',
      close: 'Close',
      edit: 'Edit',
      delete: 'Delete',
    },
    home: {
      heroKicker: 'The Atelier of Contemporary Living',
      heroTitle: 'The fine art of living what you build with your own hands.',
      heroSubtitle: 'Exclusive custom projects, millimeter technical blueprints, and step-by-step guides for signature furniture and timeless renovations.',
      heroCta: 'Start a project',
      categoriesTitle: 'The disciplines of the home',
      categoriesSubtitle: 'From bespoke furniture joinery to systems and wall textures',
      featuredTitle: 'Curated projects',
      featuredSubtitle: 'Exhaustive guides with materials, cut lists, and master techniques',
      inspirationsTitle: 'Editorial stories',
      inspirationsSubtitle: 'Deep dives into style, sustainable natural timber, and architectural balance',
      newsTitle: 'Fresh from the Workshop',
      newsSubtitle: 'Latest artisan releases published by our architectural collective',
      viewAllCategories: 'View all 20 categories',
      statProjects: 'Guided projects',
      statArtisans: 'Makers registered',
      statGuides: 'Technical sheets',
    },
    categories: {
      title: 'Categories & Disciplines',
      subtitle: '20 practical areas for building, repairing and improving your home.',
      allCategories: 'All categories',
      filterByArea: 'Filter by trade area',
      guidesAvailable: 'guides available',
      viewProjects: 'View projects',
      items: {
        mobili: { name: 'Furniture', desc: 'Dining tables, modular shelving, consoles and bespoke home fixtures.', count: 0 },
        cucina: { name: 'Kitchen', desc: 'Slatted wood islands, microcement countertops, and crafted cabinet fronts.', count: 0 },
        bagno: { name: 'Bathroom', desc: 'Floating teak vanities, concealed thermostatic mixers, and lit niches.', count: 0 },
        intonaci: { name: 'Plastering & Skim Coating', desc: 'Fluted walnut panels, natural lime plaster, and contemporary wainscoting.', count: 0 },
        pavimenti: { name: 'Flooring', desc: 'Herringbone parquet, seamless microcement, and vintage wood restoration.', count: 0 },
        giardino: { name: 'Garden & Outdoor', desc: 'Monolithic planters, architectural timber seating, and dry stone pathways.', count: 0 },
        pergole: { name: 'Pergolas & Gazebos', desc: 'Larch bioclimatic pergolas, shading louvers, and weatherproof pavilions.', count: 0 },
        falegnameria: { name: 'Carpentry & Joinery', desc: 'Japanese timber joints, surface planning, and tung oil finishes.', count: 0 },
        muratura: { name: 'Masonry & Plaster', desc: 'Reinforced drywall partitions, raw mineral renders, and organic arches.', count: 0 },
        idraulica: { name: 'Plumbing', desc: 'PEX manifolds, concealed wall wastes, and exposed brushed brass fittings.', count: 0 },
        elettricita: { name: 'Electrical & Lighting', desc: 'Recessed architectural LED channels, subtle home automation, and accents.', count: 0 },
        verniciatura: { name: 'Painting & Finishes', desc: 'Surface prep, paints and finishes for wood, metal and walls.', count: 0 },
        cartongesso: { name: 'Drywall', desc: 'Partitions, suspended ceilings, coves, niches and access panels.', count: 0 },
        isolamento: { name: 'Insulation', desc: 'Thermal and acoustic solutions, materials and correct installation.', count: 0 },
        serramenti: { name: 'Windows & Doors', desc: 'Windows, doors, shutters, seals and adjustments.', count: 0 },
        illuminazione: { name: 'Lighting', desc: 'Spotlights, tracks, LED strips, dimmers and outdoor lighting.', count: 0 },
        restauro: { name: 'Restoration', desc: 'Furniture, timber, surfaces and period-detail restoration.', count: 0 },
        impermeabilizzazione: { name: 'Waterproofing', desc: 'Showers, bathrooms, balconies, terraces, membranes and seals.', count: 0 },
        terrazzi: { name: 'Terraces & Balconies', desc: 'Outdoor flooring, privacy, furniture, drainage and shading.', count: 0 },
        attrezzi: { name: 'Tools & Equipment', desc: 'Hand tools, power tools, measuring equipment and protective gear.', count: 0 },
      },
    },
    aiDesign: {
      badge: 'Assisted Project Studio',
      title: 'Custom-tailor your dream project',
      subtitle: 'Describe your vision, set exact dimensions and budget: we generate your cut list, cost breakdown, and step-by-step roadmap.',
      step1Title: '1. Vision & Concept',
      step1Desc: 'What do you wish to craft or renovate?',
      step2Title: '2. Dimensions & Space',
      step2Desc: 'Precise measurements and designated room',
      step3Title: '3. Budget & Materials',
      step3Desc: 'Target spend and desired wood/stone finishes',
      step4Title: '4. Skill Level & Machinery',
      step4Desc: 'We tailor the joinery technique to your tools',
      inputPlaceholder: 'E.g. Minimalist solid oak dining table for 8 with clean straight lines and matte black powder-coated trapezoid steel base...',
      samplePromptsLabel: 'Or load a recommended template:',
      samplePrompt1: 'Minimalist solid oak dining table (200x90cm)',
      samplePrompt2: 'Floating teak bathroom vanity with ceramic vessel basin',
      samplePrompt3: 'Larch louvered pergola for a 16sqm urban terrace',
      dimensionsWidth: 'Width (cm)',
      dimensionsDepth: 'Depth (cm)',
      dimensionsHeight: 'Height (cm)',
      roomType: 'Target room',
      budgetLabel: 'Target budget',
      experienceLevel: 'Your craftsmanship level',
      generateButton: 'Generate Technical Blueprint & Cut List',
      generating: 'Computing architectural cut list and joinery...',
      resultTitle: 'Generated Executive Blueprint',
      resultBlueprint: 'Schematic & Dimensions',
      cutList: 'Optimized Cut List',
      estimatedSavings: 'Estimated savings vs retail store',
      estimatedTime: 'Estimated bench build time',
      saveToMyProjects: 'Save to My Projects',
      regenerate: 'Regenerate with new parameters',
      woodType: 'Recommended wood species',
    },
    myProjects: {
      title: 'My Projects',
      subtitle: 'Your personal workshop bench: active worksites, drafts, and completed builds.',
      tabAll: 'All',
      tabInProgress: 'In progress',
      tabSaved: 'Saved',
      tabCompleted: 'Completed',
      emptyTitle: 'No projects in this section yet',
      emptyDesc: 'Browse curated collections or use the AI Studio to plan your next masterpiece.',
      newProjectBtn: 'New project',
      progressLabel: 'Progress',
      lastUpdated: 'Last modified',
    },
    profile: {
      title: 'Profile & Workshop',
      role: 'Master Maker & Craftsman',
      location: 'Milan, Italy',
      stats: {
        projectsCompleted: 'Projects built',
        hoursDedicated: 'Bench hours',
        moneySaved: 'Estimated saved',
        level: 'Maker status',
      },
      toolboxTitle: 'Workshop Tool Inventory',
      toolboxSubtitle: 'Configured tools used to automatically check project viability',
      settingsTitle: 'Application Preferences',
      languageLabel: 'Interface Language',
      unitLabel: 'Measurement Units',
      notifications: 'Project updates & new releases',
      darkMode: 'High-contrast workshop mode',
      aboutTitle: 'The Casa&Co. Philosophy',
      aboutText: 'Casa&Co. bridges contemporary architectural publishing with hands-on maker craft. We believe a home gains its true soul when it shelters pieces shaped with care by the people who live in it.',
    },
  },
};
