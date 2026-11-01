import { CategoryId, CategoryInfo, Project, EditorialArticle, UserProject, ProjectCostComparison } from '../types';

export const CATEGORIES_DATA: Record<CategoryId, CategoryInfo> = {
  mobili: {
    id: 'mobili',
    iconName: 'Armchair',
    coverImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Forme pure, incastri nobili e arredi su misura per la casa contemporanea',
      en: 'Pure forms, noble joinery, and custom furniture for contemporary living'
    },
    subcategories: {
      it: ['Tavoli da pranzo', 'Librerie modulari', 'Sedute & Panche', 'Consolle & Madie'],
      en: ['Dining tables', 'Modular bookcases', 'Seating & Benches', 'Consoles & Sideboards']
    }
  },
  cucina: {
    id: 'cucina',
    iconName: 'UtensilsCrossed',
    coverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Isole centrali, top in microcemento e falegnameria d’autore per cucine aperte',
      en: 'Kitchen islands, microcement worktops, and crafted cabinetry for open kitchens'
    },
    subcategories: {
      it: ['Isole con bancone', 'Top e piani di lavoro', 'Dispense su misura', 'Boiserie paraschizzi'],
      en: ['Island bars', 'Countertops', 'Bespoke pantries', 'Backsplash panels']
    }
  },
  bagno: {
    id: 'bagno',
    iconName: 'Bath',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Spazi benessere in legno idrorepellente, finiture minerali e nicchie a filo muro',
      en: 'Spa-like sanctuaries with water-sealed timber, mineral coatings, and flush niches'
    },
    subcategories: {
      it: ['Mobili sospesi', 'Nicchie illuminate', 'Posa piatti doccia a filo', 'Specchi con retroilluminazione'],
      en: ['Floating vanities', 'Illuminated niches', 'Flush shower trays', 'Backlit mirrors']
    }
  },
  pareti: {
    id: 'pareti',
    iconName: 'Paintbrush',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Cannettati in noce canaletto, rasatura a calce naturale e finiture texturizzate',
      en: 'Fluted walnut panels, natural lime washes, and tactile architectural finishes'
    },
    subcategories: {
      it: ['Pareti cannettate', 'Finiture a calce & Marmorino', 'Boiserie contemporanea', 'Pannelli acustici'],
      en: ['Fluted slat walls', 'Lime plaster & Marmorino', 'Contemporary wainscot', 'Acoustic slatted wood']
    }
  },
  pavimenti: {
    id: 'pavimenti',
    iconName: 'Layers',
    coverImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Dalla spina ungherese al microcemento continuo: l’orizzonte materico del pavimento',
      en: 'From French herringbone to seamless microcement: the tactile foundation of floors'
    },
    subcategories: {
      it: ['Parquet a spina di pesce', 'Microcemento spatolato', 'Battiscopa a filo muro', 'Trattamenti a cera e olio'],
      en: ['Herringbone parquet', 'Seamless microcement', 'Flush skirting boards', 'Oil and wax treatments']
    }
  },
  giardino: {
    id: 'giardino',
    iconName: 'Trees',
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Fioriere monolitiche, percorsi in pietra e arredi outdoor resistenti alle intemperie',
      en: 'Monolithic planters, stone pathways, and weather-defying architectural outdoor furniture'
    },
    subcategories: {
      it: ['Fioriere in corten & legno', 'Camminamenti giapponesi', 'Cucine da esterno', 'Sedute integrate'],
      en: ['Corten & timber planters', 'Stepping stone paths', 'Outdoor kitchen counters', 'Integrated lounge benches']
    }
  },
  pergole: {
    id: 'pergole',
    iconName: 'Tent',
    coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Architetture leggere in larice e alluminio: schermature solari e pergole bioclimatiche',
      en: 'Lightweight timber & aluminum pavilions: sun screening louvers and bioclimatic pergolas'
    },
    subcategories: {
      it: ['Pergole bioclimatiche', 'Tettoie autoportanti', 'Frangisole a lamelle orientabili', 'Pergole addossate'],
      en: ['Bioclimatic pergolas', 'Freestanding pavilions', 'Adjustable louver screens', 'Wall-mounted canopies']
    }
  },
  falegnameria: {
    id: 'falegnameria',
    iconName: 'Axe',
    coverImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'La nobile arte del legno massello, piallatura manuale e incastri a coda di rondine',
      en: 'The noble art of solid hardwood, hand planing, and precision dovetail joinery'
    },
    subcategories: {
      it: ['Incastri tradizionali', 'Scelta e stagionatura essenze', 'Affilatura utensili', 'Finiture naturali a olio duro'],
      en: ['Traditional joinery', 'Lumber selection & moisture', 'Tool sharpening', 'Hardwax oil finishes']
    }
  },
  muratura: {
    id: 'muratura',
    iconName: 'BrickWall',
    coverImage: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Tramezzi strutturali in cartongesso, archi scultorei e intonaci materici',
      en: 'Reinforced drywall partitions, sculptural soft arches, and tactile mineral renders'
    },
    subcategories: {
      it: ['Contropareti fonoassorbenti', 'Realizzazione archi e velette', 'Rasature d’interni', 'Muretti a secco e pietre'],
      en: ['Acoustic drywall', 'Archway sculpting', 'Interior skim coating', 'Dry-stone accent walls']
    }
  },
  idraulica: {
    id: 'idraulica',
    iconName: 'Wrench',
    coverImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Collettori multistrato, rubinetteria da incasso e gestione professionale degli scarichi',
      en: 'Multilayer manifolds, concealed brassware, and engineered bathroom drainage'
    },
    subcategories: {
      it: ['Miscelatori da incasso', 'Collettori e raccordi a pressare', 'Canaline doccia a scomparsa', 'Trattamento e filtraggio acque'],
      en: ['Concealed thermostatic mixers', 'Press-fit manifolds', 'Linear floor drains', 'Water filtration systems']
    }
  },
  elettricita: {
    id: 'elettricita',
    iconName: 'Zap',
    coverImage: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Linee LED architetturali a 24V, dimmerazione discreta e canalizzazioni invisibili',
      en: 'Architectural 24V LED profiles, discrete dimming, and seamless recessed cabling'
    },
    subcategories: {
      it: ['Canaline LED a scomparsa', 'Deviatori & Punti luce di design', 'Controllo luci domotico', 'Quadro di derivazione sicuro'],
      en: ['Recessed drywall LED channels', 'Minimalist architectural switches', 'Smart automation hubs', 'Safe distribution boards']
    }
  }
  ,
  verniciatura: { id: 'verniciatura', iconName: 'Paintbrush', coverImage: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Preparazione dei supporti, smalti, vernici e finiture professionali', en: 'Surface preparation, enamels, paints and professional finishes' }, subcategories: { it: ['Pittura pareti e soffitti', 'Smalti per legno e metallo', 'Sverniciatura e carteggiatura', 'Effetti decorativi'], en: ['Wall and ceiling painting', 'Wood and metal enamels', 'Paint stripping and sanding', 'Decorative finishes'] } },
  cartongesso: { id: 'cartongesso', iconName: 'PanelsTopLeft', coverImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Contropareti, divisori, controsoffitti e strutture a secco', en: 'Drywall partitions, linings, suspended ceilings and framing' }, subcategories: { it: ['Pareti divisorie', 'Controsoffitti e velette', 'Botole e nicchie', 'Isolamento acustico interno'], en: ['Partition walls', 'Suspended ceilings and coves', 'Access panels and niches', 'Interior acoustic insulation'] } },
  isolamento: { id: 'isolamento', iconName: 'ThermometerSun', coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Comfort termico e acustico: materiali, stratigrafie e ponti termici', en: 'Thermal and acoustic comfort: materials, build-ups and thermal bridges' }, subcategories: { it: ['Isolamento interno', 'Cappotto esterno', 'Isolamento acustico', 'Nastri e tenuta all’aria'], en: ['Internal insulation', 'External wall insulation', 'Sound insulation', 'Air sealing tapes and membranes'] } },
  serramenti: { id: 'serramenti', iconName: 'PanelsTopLeft', coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Finestre, porte, oscuranti e miglioramento delle prestazioni', en: 'Windows, doors, shading and performance upgrades' }, subcategories: { it: ['Finestre e portefinestre', 'Porte interne', 'Persiane e tapparelle', 'Guarnizioni e regolazioni'], en: ['Windows and French doors', 'Interior doors', 'Shutters and blinds', 'Seals and adjustments'] } },
  illuminazione: { id: 'illuminazione', iconName: 'Lightbulb', coverImage: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Luce funzionale e d’atmosfera, corpi illuminanti e sistemi LED', en: 'Functional and ambient lighting, fixtures and LED systems' }, subcategories: { it: ['Faretti e binari', 'Strisce LED e profili', 'Illuminazione esterna', 'Comandi e dimmer'], en: ['Spotlights and tracks', 'LED strips and profiles', 'Outdoor lighting', 'Switches and dimmers'] } },
  restauro: { id: 'restauro', iconName: 'Brush', coverImage: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Recupero consapevole di mobili, legni, superfici e dettagli d’epoca', en: 'Careful restoration of furniture, timber, surfaces and period details' }, subcategories: { it: ['Restauro mobili', 'Ripristino legno', 'Ferramenta e finiture d’epoca', 'Riparazioni e consolidamento'], en: ['Furniture restoration', 'Timber repair', 'Period hardware and finishes', 'Repairs and consolidation'] } },
  impermeabilizzazione: { id: 'impermeabilizzazione', iconName: 'Droplets', coverImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Protezione dall’acqua per docce, balconi, terrazzi e locali umidi', en: 'Waterproofing for showers, balconies, terraces and wet rooms' }, subcategories: { it: ['Docce e bagni', 'Balconi e terrazzi', 'Membrane e guaine', 'Sigillature e giunti'], en: ['Showers and bathrooms', 'Balconies and terraces', 'Membranes and coatings', 'Seals and movement joints'] } },
  terrazzi: { id: 'terrazzi', iconName: 'Sun', coverImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', tagline: { it: 'Pavimentazioni, schermature, arredi e cura degli spazi esterni', en: 'Decking, shading, furniture and outdoor space improvements' }, subcategories: { it: ['Pavimenti da esterno', 'Schermature e privacy', 'Arredi e fioriere', 'Drenaggio e pendenze'], en: ['Outdoor flooring', 'Privacy screens and shading', 'Furniture and planters', 'Drainage and falls'] } }

};

// No demo projects are published. Only reviewed editorial guides belong here.
export const MOCK_PROJECTS: Project[] = [];

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    id: 'art-01',
    title: {
      it: 'La rinascita dell’Olio-Cera Naturale nella finitura del Rovere',
      en: 'The Revival of Natural Hardwax Oil in Oak Finishing'
    },
    category: {
      it: 'Tecniche & Finiture',
      en: 'Techniques & Finishes'
    },
    readTime: '4 min',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    summary: {
      it: 'Perché i migliori architetti stanno abbandonando le vernici sintetiche a favore della traspirabilità e del calore tattile delle cere vegetali.',
      en: 'Why forward-thinking architects are trading synthetic polyurethanes for the breathable tactile warmth of vegetable-based hardwaxes.'
    }
  },
  {
    id: 'art-02',
    title: {
      it: 'Guida definitiva ai 4 incastri giapponesi per tavoli moderni',
      en: 'The Definitive Guide to 4 Japanese Joinery Methods for Tables'
    },
    category: {
      it: 'Falegnameria Tradizionale',
      en: 'Traditional Joinery'
    },
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    summary: {
      it: 'Come unire masselli senza l’ausilio di una sola vite: precisione millimetrica, tenuta sismica ed eleganza senza tempo.',
      en: 'How to lock heavy timbers without a single metal screw: millimetric precision, seismic resistance, and timeless elegance.'
    }
  },
  {
    id: 'art-03',
    title: {
      it: '5 accorgimenti cruciali prima di applicare il microcemento',
      en: '5 Crucial Checks Before Laying Seamless Microcement'
    },
    category: {
      it: 'Cantiere & Superfici',
      en: 'Surfaces & Renovation'
    },
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    summary: {
      it: 'Dal test dell’umidità residua all’importanza della rete d’armatura: la differenza tra una superficie eterna e una che cavilla.',
      en: 'From residual moisture tests to reinforcing fiberglass meshes: avoiding micro-cracks for an eternal monolithic finish.'
    }
  }
];

export const INITIAL_USER_PROJECTS: UserProject[] = [];

export function getProjectCostComparison(project: Project): ProjectCostComparison {
  if (project.costComparison) return project.costComparison;

  const avgDiy = (project.costEstimate.min + project.costEstimate.max) / 2;
  const multiplier = project.difficulty === 'advanced' ? 3.4 : project.difficulty === 'intermediate' ? 2.8 : 2.4;
  const proEstimate = Math.round(avgDiy * multiplier);
  const laborHours = project.difficulty === 'advanced' ? 28 : project.difficulty === 'intermediate' ? 18 : 10;
  const proRate = 45;
  const equipmentOrRentalCost = project.difficulty === 'advanced' ? 65 : project.difficulty === 'intermediate' ? 35 : 20;
  const netSavings = Math.max(0, proEstimate - Math.round(avgDiy) - equipmentOrRentalCost);
  const savingsPercentage = Math.round((netSavings / proEstimate) * 100);

  return {
    proEstimate,
    proLaborHours: laborHours,
    proLaborRatePerHour: proRate,
    diyMaterialsCost: Math.round(avgDiy),
    equipmentOrRentalCost,
    netSavings,
    savingsPercentage,
    lastUpdated: '31 Ottobre 2026',
    itemsBreakdown: [
      {
        item: 'Fornitura materiali lavorati & ricarico d’officina',
        proCost: Math.round(avgDiy * 1.45),
        diyCost: Math.round(avgDiy),
        note: 'Acquisto diretto segheria/fornitore senza intermediari',
      },
      {
        item: `Manodopera specializzata (${laborHours}h @ €${proRate}/h)`,
        proCost: laborHours * proRate,
        diyCost: 0,
        note: 'Manodopera professionale esclusa (fatta con le tue mani)',
      },
      {
        item: 'Attrezzatura dedicata o eventuale noleggio attrezzo',
        proCost: 0,
        diyCost: equipmentOrRentalCost,
        note: 'Noleggio 1 giorno attrezzo speciale / kit frese',
      },
      {
        item: 'Rilievi, progettazione su misura e trasporto in loco',
        proCost: Math.max(80, Math.round(proEstimate * 0.15)),
        diyCost: 0,
        note: 'Rilievo e trasporto gestiti in autonomia',
      },
    ],
    hypotheses: [
      'Prezzi dei materiali calcolati su fornitura diretta al dettaglio o grossisti edili/legnami convenzionati.',
      'Tariffa oraria media artigiano specializzato calcolata su standard camerali italiani (€40-€50/ora).',
      'Manodopera personale fai-da-te non conteggiata economicamente.',
      'Dotazione standard di laboratorio (avvitatore, trapano, calibro) considerata già disponibile.',
    ],
    disclaimer: {
      it: 'Le stime di costo hanno carattere puramente informativo ed editoriale, basate su rilevazioni campionarie di mercato (aggiornamento Ottobre 2026). Non costituiscono preventivo contrattuale vincolante né garanzia sul costo effettivo finale.',
      en: 'Cost estimates are indicative and for editorial reference only, based on Italian artisanal market surveys (updated October 2026). They do not constitute formal binding quotes.',
    },
  };
}

