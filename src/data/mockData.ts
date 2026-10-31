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
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1200&q=80',
    tagline: {
      it: 'Linee LED architetturali a 24V, dimmerazione discreta e canalizzazioni invisibili',
      en: 'Architectural 24V LED profiles, discrete dimming, and seamless recessed cabling'
    },
    subcategories: {
      it: ['Canaline LED a scomparsa', 'Deviatori & Punti luce di design', 'Controllo luci domotico', 'Quadro di derivazione sicuro'],
      en: ['Recessed drywall LED channels', 'Minimalist architectural switches', 'Smart automation hubs', 'Safe distribution boards']
    }
  }
};

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    title: {
      it: 'Tavolo da Pranzo in Rovere Massello a Taglio Vivo',
      en: 'Live Edge Solid Oak Dining Table'
    },
    category: 'mobili',
    description: {
      it: 'Costruzione completa di un tavolo da pranzo monumentale (220x95cm) con tavole di rovere massello a fiammatura aperta, giunzioni a farfalla in noce e base a trapezio in acciaio brunito a freddo.',
      en: 'Complete craftsmanship guide for a statement 220x95cm dining table using open-grain solid oak slabs, walnut butterfly keys, and cold-blackened steel trapezoid legs.'
    },
    difficulty: 'intermediate',
    timeEstimate: {
      it: '3 fine settimana (24 ore)',
      en: '3 weekends (24 hours)'
    },
    costEstimate: {
      min: 240,
      max: 380,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '220 cm × 95 cm × 76 cm',
    room: 'Zona Pranzo / Living',
    materials: [
      { name: 'Tavole in rovere massello stagionato (spessore 45mm)', quantity: '3 tavole (240x35cm)', approxCost: '€180' },
      { name: 'Legno di noce per farfalle di rinforzo', quantity: '1 listello (60x8cm)', approxCost: '€20' },
      { name: 'Base in tubolare d’acciaio a trapezio', quantity: '2 gambe preformate', approxCost: '€95' },
      { name: 'Olio cera dura naturale ad alta resistenza', quantity: '1 litro (finitura opaca)', approxCost: '€32' },
      { name: 'Boccole filettate M8 in ottone e bulloni bruniti', quantity: '16 set', approxCost: '€15' }
    ],
    tools: [
      'Sega ad affondamento con binario guida',
      'Fresatrice verticale con fresa diritta da 8mm',
      'Levigatrice rotorbitale (grane 80, 120, 180, 240)',
      'Scalpelli giapponesi da banco ben affilati',
      'Morsetti a barra lunghi (almeno 4 da 100cm)',
      'Spazzola per finitura ad olio e panni in microfibra'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Selezione tavole e allineamento fiammatura',
        duration: '3 ore',
        description: 'Accosta le tre tavole di rovere provando diverse combinazioni per bilanciare l’andamento delle venature naturali. Segna con un gesso i punti di contatto per garantire una giunzione perfettamente planare.',
        tip: 'Posiziona la tavola centrale con gli anelli di crescita opposti a quelli delle due tavole laterali per evitare imbarcature future.'
      },
      {
        stepNumber: 2,
        title: 'Giunzione a biscotto/lamello e incollaggio piano',
        duration: '4 ore + riposo 24h',
        description: 'Esegui le fresate per i lamelli ogni 25 cm lungo i bordi rettificati. Applica colla poliuretanica D4 resistente all’umidità e serra con morsetti alternando la pressione sopra e sotto.',
        tip: 'Usa listelli di legno di sacrificio sotto i morsetti per non ammaccare il nobile rovere.'
      },
      {
        stepNumber: 3,
        title: 'Intaglio e inserimento farfalle di contrasto in noce',
        duration: '4 ore',
        description: 'Nei nodi e nelle naturali fessure del legno, traccia la forma delle farfalle in noce scuro. Con scalpello a mano o rifilatore ricava la sede precisa con una tolleranza minima di decimi di millimetro.',
        tip: 'Le farfalle non sono solo decorative: bloccano l’eventuale dilatazione naturale delle fessure.'
      },
      {
        stepNumber: 4,
        title: 'Levigatura progressiva e applicazione olio cera dura',
        duration: '5 ore',
        description: 'Leviga l’intero piano partendo da grana 80 per spianare il giunto, salendo a 120, 180 e infine 240. Bagna leggermente la superficie per sollevare il pelo del legno, lascia asciugare e ripassa la 240. Applica 3 mani sottili di olio cera dura.',
        tip: 'Rimuovi sempre l’eccesso di olio dopo 15 minuti con un panno asciutto per evitare aloni lucidi.'
      },
      {
        stepNumber: 5,
        title: 'Montaggio boccole filettate e fissaggio telaio',
        duration: '2 ore',
        description: 'Inserisci le boccole filettate M8 sul lato inferiore del piano creando fori asolati sulle piastre metalliche per consentire la naturale micro-espansione stagionale del legno.',
        tip: 'Non avvitare mai direttamente il legno con viti da legno fisse: si spaccherebbe col cambio di umidità estivo/invernale.'
      }
    ],
    expertTip: {
      it: 'Il segreto di un piano in massello stabile negli anni risiede nei tagli di distensione inferiori (kerf cuts) profondi 8 mm ogni 15 cm: riducono del 70% le tensioni interne del tronco.',
      en: 'The secret to durable solid slabs is relief kerf cuts on the underside (8mm deep every 15cm): this releases up to 70% of natural internal tree tension.'
    },
    author: {
      name: 'Matteo Vianello',
      title: 'Mastro Ebanista & Designer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: true,
    isNew: false
  },
  {
    id: 'proj-02',
    title: {
      it: 'Isola Cucina con Listelli di Rovere e Top in Microcemento',
      en: 'Kitchen Island with Slatted Oak & Microcement Top'
    },
    category: 'cucina',
    description: {
      it: 'Progetto per realizzare un’isola centrale con fusto portante rinforzato, rivestimento frontale e laterale a bacchette verticali fresate e piano monolitico finito a microcemento idrorepellente.',
      en: 'Step-by-step masterclass on creating an architectural freestanding kitchen island wrapped in vertical oak battens and crowned with an ultra-durable waterproof microcement top.'
    },
    difficulty: 'advanced',
    timeEstimate: {
      it: '4 fine settimana (32 ore)',
      en: '4 weekends (32 hours)'
    },
    costEstimate: {
      min: 420,
      max: 650,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '180 cm × 90 cm × 92 cm',
    room: 'Cucina Open Space',
    materials: [
      { name: 'Struttura interna in multistrato di betulla fenolico 18mm', quantity: '4 pannelli (250x125cm)', approxCost: '€190' },
      { name: 'Listelli a sezione quadrata in rovere naturale (20x20mm)', quantity: '45 listelli da 2 metri', approxCost: '€135' },
      { name: 'Pannello idrofugo MDF alta densità per top (spessore 38mm)', quantity: '1 piano sagomato', approxCost: '€55' },
      { name: 'Kit microcemento bicomponente con primer e sigillante poliuretanico', quantity: '5 kg (copertura 2.5 mq)', approxCost: '€85' },
      { name: 'Guide cassetti ammortizzate a scomparsa a estrazione totale', quantity: '4 coppie Blum', approxCost: '€90' }
    ],
    tools: [
      'Troncatrice radiale per legno con lama 60 denti',
      'Spatola americana inox con angoli arrotondati',
      'Avvitatore a impulsi con punte torx',
      'Livella laser autolivellante a croce',
      'Maschera per foratura a tasca (Kreg Jig)',
      'Rullo a pelo raso per resina poliuretanica'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Costruzione telaio strutturale e piedini regolabili',
        duration: '6 ore',
        description: 'Assembla la scocca con viti a tasca e colla vinilica D3. Installa 6 piedini regolabili da zoccolo per compensare qualsiasi dislivello del pavimento della cucina.',
        tip: 'Verifica la perfetta planarità diagonale col laser prima di bloccare le schiene di rinforzo.'
      },
      {
        stepNumber: 2,
        title: 'Applicazione listelli in rovere con dima di spaziatura',
        duration: '5 ore',
        description: 'Crea una dima da 12 mm per mantenere una spaziatura chirurgica tra ciascun listello. Fissa i listelli dall’interno o con chiodini invisibili a spillo.',
        tip: 'Vernicia la base posteriore di nero opaco prima di posare i listelli: darà una profondità visiva straordinaria.'
      },
      {
        stepNumber: 3,
        title: 'Rasatura e posa del top continuo in microcemento',
        duration: '8 ore (3 giorni per asciugatura)',
        description: 'Applica primer aggrappante, rete in fibra di vetro, due mani di microcemento base e una mano di microcemento fine spatolato a mano con movimenti ad arco.',
        tip: 'La seconda mano va applicata fresco su fresco appena la prima perde lucentezza.'
      },
      {
        stepNumber: 4,
        title: 'Sigillatura anti-macchia idrorepellente e montaggio cassetti',
        duration: '4 ore',
        description: 'Stendi due strati incrociati di sigillante poliuretanico satinato per renderlo inattaccabile da caffè, vino e acidi. Inserisci i cassettoni con frontali coordinati.',
        tip: 'Non utilizzare il piano per 72 ore per permettere la reticolazione chimica completa della resina.'
      }
    ],
    expertTip: {
      it: 'Negli angoli del top in microcemento crea un raggio minimo di 2mm: gli spigoli vivi a 90° sono più fragili in caso di urti accidentali con pentole pesanti.',
      en: 'Slightly round the top edges with a 2mm radius: razor-sharp 90-degree microcement corners are susceptible to chipping if struck by heavy cookware.'
    },
    author: {
      name: 'Elena Conti',
      title: 'Architetto d’Interni',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: true,
    isNew: true
  },
  {
    id: 'proj-03',
    title: {
      it: 'Mobile Bagno Sospeso in Teak con Lavabo a Ciotola',
      en: 'Floating Teak Bathroom Vanity with Vessel Sink'
    },
    category: 'bagno',
    description: {
      it: 'Costruzione di un mobile lavabo sospeso minimale in legno massello di teak nautico con taglio a 45 gradi continuo (folding technique) e staffe strutturali a scomparsa.',
      en: 'Minimalist floating vanity unit hand-crafted from marine-grade solid teak utilizing continuous mitred 45-degree waterfall edges and heavy-duty concealed wall brackets.'
    },
    difficulty: 'intermediate',
    timeEstimate: {
      it: '2 fine settimana (16 ore)',
      en: '2 weekends (16 hours)'
    },
    costEstimate: {
      min: 190,
      max: 310,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '120 cm × 50 cm × 38 cm',
    room: 'Bagno Padronale',
    materials: [
      { name: 'Tavole di teak birmano o piantagione sostenibile 28mm', quantity: '2 tavole da 250cm', approxCost: '€140' },
      { name: 'Staffe d’acciaio strutturale a sbalzo da 6mm per carico 120kg', quantity: '2 pezzi', approxCost: '€48' },
      { name: 'Tasselli chimici bicomponente Fischer con barre filettate M10', quantity: '4 ancoraggi completi', approxCost: '€22' },
      { name: 'Olio idrorepellente per legni umidi e cera protettiva', quantity: '500 ml', approxCost: '€18' },
      { name: 'Sifone salva-spazio piatto per cassettone', quantity: '1 pezzo cromato', approxCost: '€25' }
    ],
    tools: [
      'Trapano tassellatore con punta widia da 14mm',
      'Banco sega per tagli a quartabuono (45° precisi)',
      'Nastro adesivo telato rinforzato per giunzione folding',
      'Pistola per resina chimica',
      'Fresa a tazza per scarico lavabo diametro 45mm'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Taglio a 45 gradi continuo (waterfall grain)',
        duration: '3 ore',
        description: 'Taglia le tre facce (spalla sinistra, piano superiore, spalla destra) da un’unica tavola consecutiva per dare continuità visiva alle venature che scendono a cascata.',
        tip: 'Tarare l’angolo della lama a 45.0° esatti con goniometro digitale prima di iniziare.'
      },
      {
        stepNumber: 2,
        title: 'Ancoraggio chimico delle staffe a muro',
        duration: '3 ore',
        description: 'Fora la muratura, soffia via la polvere con pompetta, inietta la resina chimica e inserisci le barre filettate lasciando indurire per 45 minuti.',
        tip: 'La pulizia del foro dalla polvere aumenta del 100% la tenuta del tassello chimico.'
      },
      {
        stepNumber: 3,
        title: 'Assemblaggio scocca e inserimento cassetto sagomato',
        duration: '4 ore',
        description: 'Incolla gli angoli a 45° unendo con biscotti n.10 e nastro telato teso a morsa. Sagoma il retro del cassetto con uno scanso centrale a U per il passaggio del sifone.',
        tip: 'Il nastro adesivo di carta tirato fortemente funge da morsetto perfetto per le giunzioni inclinate.'
      },
      {
        stepNumber: 4,
        title: 'Finitura waterproof e alloggiamento rubinetteria',
        duration: '3 ore',
        description: 'Applica 3 mani di olio idrorepellente speciale teak. Pratica i fori a tazza per la piletta click-clack e il miscelatore.',
        tip: 'Sigilla l’interno del foro di scarico con resina epossidica trasparente: se una goccia trafila, non gonfierà il legno.'
      }
    ],
    expertTip: {
      it: 'Il teak contiene naturalmente oli oleosi che respingono l’acqua: prima di incollarlo, sgrassa le superfici di giunzione con acetone puro.',
      en: 'Teak has natural resinous oils that repel glue: always wipe gluing faces with pure acetone before applying polyurethane adhesives.'
    },
    author: {
      name: 'Davide Morandi',
      title: 'Maestro Idraulico & Arredatore',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: true,
    isNew: false
  },
  {
    id: 'proj-04',
    title: {
      it: 'Pergola Bioclimatica in Larice con Frangisole Orientabili',
      en: 'Bioclimatic Larch Pergola with Adjustable Louvers'
    },
    category: 'pergole',
    description: {
      it: 'Struttura autoportante da esterno (4x3 metri) realizzata in travi lamellari di larice siberiano con lamelle frangisole in alluminio orientabili a manovella o motorizzate.',
      en: 'Freestanding 4x3m outdoor architectural pavilion featuring Siberian larch glulam posts with manually adjustable anodized shading louvers and concealed rainwater channels.'
    },
    difficulty: 'advanced',
    timeEstimate: {
      it: '3 weekend (28 ore)',
      en: '3 weekends (28 hours)'
    },
    costEstimate: {
      min: 680,
      max: 1100,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '400 cm × 300 cm × 260 cm',
    room: 'Giardino / Terrazzo Living',
    materials: [
      { name: 'Pilastri lamellari di larice 120x120mm', quantity: '4 montanti da 270cm', approxCost: '€280' },
      { name: 'Travi perimetrali lamellari 80x160mm', quantity: '4 travi da 420cm', approxCost: '€260' },
      { name: 'Kit staffe di rotazione e lamelle orientabili in alluminio estruso', quantity: '2 moduli da 2 metri', approxCost: '€320' },
      { name: 'Scarpe a scomparsa in acciaio zincato con zanca da cemento', quantity: '4 pezzi', approxCost: '€95' },
      { name: 'Impregnante ceroso antitarlo a tonalità miele naturale', quantity: '5 litri', approxCost: '€65' }
    ],
    tools: [
      'Livella laser rotante per esterni con ricevitore',
      'Avvitatore per viti strutturali da carpentiere (8x220mm)',
      'Scala doppia di sicurezza a norma EN131',
      'Trapano a colonna portatile o guida foratura 90°',
      'Morsetti pesanti a vite per carpenteria'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Tracciamento plinti e posa piastre a terra',
        duration: '5 ore',
        description: 'Traccia la perpendicolare perfetta con la regola 3-4-5. Fissa le scarpe d’acciaio ai plinti in cemento mantenendo 5 cm di stacco dal suolo per evitare il contatto con ristagni d’acqua.',
        tip: 'Il distanziale metallico dal suolo raddoppia la durata nel tempo dei montanti in legno.'
      },
      {
        stepNumber: 2,
        title: 'Lavorazione incastri a mezzo legno e calettature',
        duration: '7 ore',
        description: 'Lavora le teste delle travi superiori per creare incastri precisi a mezzo legno, rinforzati con perni in acciaio e viti strutturali autofilettanti.',
        tip: 'Prefora sempre con punta da 5mm per evitare che il larice si spacchi in prossimità delle estremità.'
      },
      {
        stepNumber: 3,
        title: 'Montaggio binari e lamelle orientabili a tetto',
        duration: '6 ore',
        description: 'Inserisci le lamelle in alluminio nei perni in nylon autolubrificante e collega la barra di traino sincronizzata.',
        tip: 'Controlla che le lamelle chiudano a battuta con una pendenza dell’1% verso il lato di scarico grondaia.'
      },
      {
        stepNumber: 4,
        title: 'Canalizzazione acque piovane integrata nel montante',
        duration: '4 ore',
        description: 'Installa la canalina a scomparsa nella trave perimetrale con tubo di calata nascosto all’interno di uno dei pilastri in legno fresato.',
        tip: 'Sigilla ogni giunto della grondaia con silicone neutro per lattoneria resistente ai raggi UV.'
      }
    ],
    expertTip: {
      it: 'Il larice siberiano o alpino possiede un’altissima concentrazione di resina naturale che lo rende imputrescibile anche senza vernici aggressive: una mano di impregnante a cera all’anno è sufficiente.',
      en: 'Larch contains natural protective resin making it rot-resistant outdoors. A light yearly coat of breathable natural wax preserves its warm golden hue.'
    },
    author: {
      name: 'Gianluca Rinaldi',
      title: 'Architetto del Paesaggio',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: true,
    isNew: false
  },
  {
    id: 'proj-05',
    title: {
      it: 'Parete d’Accento Cannettata in Noce con LED Scomparsi',
      en: 'Fluted Walnut Accent Wall with Integrated LED'
    },
    category: 'pareti',
    description: {
      it: 'Rivestimento murale acustico e decorativo a listelli verticali a sezione trapezoidale su fondo fonoassorbente in feltro nero, con gola luminosa superiore a luce calda 2700K diffusa.',
      en: 'Acoustic and aesthetic wall cladding with vertical precision-milled walnut slats mounted on recycled black acoustic felt, crowned with a continuous indirect warm LED ceiling cove.'
    },
    difficulty: 'beginner',
    timeEstimate: {
      it: '1 weekend (10 ore)',
      en: '1 weekend (10 hours)'
    },
    costEstimate: {
      min: 160,
      max: 270,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '260 cm altezza × 320 cm larghezza',
    room: 'Camera da Letto o Salotto',
    materials: [
      { name: 'Pannelli acustici a listelli in noce (260x60cm)', quantity: '5 pannelli modulari', approxCost: '€180' },
      { name: 'Profilo in alluminio per strip LED con diffusore opale 45°', quantity: '3.5 metri lineari', approxCost: '€30' },
      { name: 'Strip LED COB continua senza puntinatura (2700K CRI95, 24V)', quantity: '5 metri', approxCost: '€35' },
      { name: 'Alimentatore slim MeanWell 24V 60W dimmerabile', quantity: '1 pezzo', approxCost: '€28' },
      { name: 'Adesivo di montaggio ad alta presa iniziale e viti nere per feltro', quantity: '1 kit completo', approxCost: '€15' }
    ],
    tools: [
      'Segaccio a dorso per tagli puliti di precisione',
      'Taglierino professionale a lama trapezoidale per feltro',
      'Livella a bolla magnetica da 120cm',
      'Pistola per silicone/adesivo',
      'Spellafili e morsetti trasparenti Wago'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Preparazione parete e montaggio canalina LED superiore',
        duration: '2 ore',
        description: 'Dipingi la parete con fondo scuro nel perimetro. Fissa la canalina in alluminio a 45 gradi lungo il soffitto per orientare il fascio luminoso dall’alto verso il basso.',
        tip: 'Usa una strip COB: non produce i fastidiosi puntini visibili sulle pareti vicine.'
      },
      {
        stepNumber: 2,
        title: 'Taglio a misura dei pannelli acustici',
        duration: '2 ore',
        description: 'Misura l’altezza della stanza in 3 punti differenti per compensare eventuali soffitti non a bolla. Taglia i listelli col segaccio e rifinisci il feltro posteriore col taglierino.',
        tip: 'Applica nastro adesivo di carta lungo la linea di taglio per prevenire qualsiasi scheggiatura dell’impiallacciatura in noce.'
      },
      {
        stepNumber: 3,
        title: 'Posa ad incastro e fissaggio con viti invisibili tra i listelli',
        duration: '3 ore',
        description: 'Stendi cordoli di collante strutturale a zig-zag e applica i pannelli facendoli scorrere l’uno accanto all’altro. Blocca con viti nere a testa svasata affogate nel feltro nero tra le bacchette.',
        tip: 'La testa della vite nera nel feltro diventa totalmente invisibile a più di 30 cm di distanza.'
      },
      {
        stepNumber: 4,
        title: 'Collegamento dimmer e collaudo acustico',
        duration: '2 ore',
        description: 'Collega il driver 24V e calibra la luminosità con il comando a parete o telecomando wireless.',
        tip: 'Oltre all’impatto estetico, questa parete elimina il rimbombo e il riverbero nella stanza migliorando la qualità del suono.'
      }
    ],
    expertTip: {
      it: 'Per un effetto monolitico, non interrompere la parete con placche elettriche a vista: fai tagliare i listelli a misura attorno alle prese montando mascherine a filo in alluminio spazzolato scuro.',
      en: 'Avoid generic white switch plates over dark slats: cut matching inserts and choose flush dark anodized faceplates for an uninterrupted finish.'
    },
    author: {
      name: 'Chiara Bellini',
      title: 'Lighting & Acoustic Designer',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: true,
    isNew: true
  },
  {
    id: 'proj-06',
    title: {
      it: 'Pavimento a Spina di Pesce in Rovere Spazzolato',
      en: 'Brushed Oak Herringbone Parquet Installation'
    },
    category: 'pavimenti',
    description: {
      it: 'Guida alla posa millimetrica di parquet a spina italiana 90° con listoncini in rovere nobile spazzolato, incollaggio silanico su massetto e finitura invisibile all’acqua.',
      en: 'Complete craftsman guide on installing traditional 90-degree Italian herringbone parquet with silane adhesive on heated screed and matte raw-look invisible waterborne varnish.'
    },
    difficulty: 'advanced',
    timeEstimate: {
      it: '3 weekend (30 ore)',
      en: '3 weekends (30 hours)'
    },
    costEstimate: {
      min: 520,
      max: 890,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '25 mq superficie',
    room: 'Soggiorno & Living',
    materials: [
      { name: 'Listoncini prefiniti in rovere nobile spazzolato (70x500mm)', quantity: '28 mq (compreso 12% sfrido spina)', approxCost: '€620' },
      { name: 'Colla monocomponente silanica elastica per parquet', quantity: '3 fustini da 15kg', approxCost: '€115' },
      { name: 'Primer barriera vapore consolidante per massetto', quantity: '1 tanica 5kg', approxCost: '€45' },
      { name: 'Cunei distanziatori perimetrali da 10mm', quantity: '100 pezzi', approxCost: '€12' }
    ],
    tools: [
      'Spatola dentata specifica per colla da legno (dente TKB B11)',
      'Troncatrice radiale con goniometro di precisione',
      'Cordella metrica e filo a tracciare con gesso blu',
      'Mazzuolo antirimbalzo in gomma bianca e blocco battitore in legno tenero',
      'Termoigrometro a carburo per misurazione umidità massetto'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Verifica umidità residua massetto e tracciamento asse centrale',
        duration: '4 ore',
        description: 'L’umidità del massetto deve essere inferiore all’1.7%. Traccia l’asse di simmetria primario della stanza con il battifilo per impostare la spina perfettamente centrata rispetto alle finestre.',
        tip: 'Se la spina non parte esattamente perpendicolare all’asse di visuale principale della porta d’ingresso, sembrerà storta in tutta la stanza.'
      },
      {
        stepNumber: 2,
        title: 'Fissaggio dima di partenza (riga guida triangolare)',
        duration: '3 ore',
        description: 'Avvita temporaneamente a terra un listello rettilineo a 45° rispetto all’asse centrale per posare la prima fila senza slittamenti durante la battitura.',
        tip: 'Lascia asciugare la prima spina per 12 ore prima di continuare: farà da ancoraggio immobile per tutto il resto della stanza.'
      },
      {
        stepNumber: 3,
        title: 'Incollaggio a pettine ed incastro maschio/femmina',
        duration: '14 ore',
        description: 'Stendi la colla silanica con spatola a 60°. Incastra i listelli alternando destro e sinistro battendo solo sul blocco di legno di sacrificio.',
        tip: 'Pulisci immediatamente qualsiasi sbavatura di colla dal rovere con salviette detergenti specifiche prima che polimerizzi.'
      },
      {
        stepNumber: 4,
        title: 'Taglio perimetrale e posa battiscopa a filo',
        duration: '6 ore',
        description: 'Taglia i triangoli di chiusura a 10 mm dai muri perimetrali per garantire il giunto di dilatazione elastico. Installa il battiscopa coordinato.',
        tip: 'Non bloccare mai il parquet con il battiscopa: il battiscopa si fissa al muro e non al pavimento.'
      }
    ],
    expertTip: {
      it: 'Prima della posa, lascia riposare le scatole di legno sigillate nell’ambiente per almeno 5 giorni: si adatteranno alla temperatura e all’umidità della casa.',
      en: 'Acclimatize unopened parquet boxes in the target room for at least 5 days prior to laying to stabilize moisture content.'
    },
    author: {
      name: 'Marco Zanetti',
      title: 'Parquettista di Tradizione',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: false,
    isNew: false
  },
  {
    id: 'proj-07',
    title: {
      it: 'Panca da Giardino Monolitica in Cemento Architettonico',
      en: 'Monolithic Architectural Concrete Garden Bench'
    },
    category: 'giardino',
    description: {
      it: 'Getto in cassaforma di una seduta scultorea da esterni in microcemento alleggerito armato con fibra di vetro (GFRC) e inserti seduta in listoni di massello di castagno.',
      en: 'Sculptural outdoor cantilever bench hand-cast in glass-fiber reinforced architectural concrete (GFRC) with floating slatted local chestnut timber seat inserts.'
    },
    difficulty: 'intermediate',
    timeEstimate: {
      it: '2 fine settimana (14 ore)',
      en: '2 weekends (14 hours)'
    },
    costEstimate: {
      min: 130,
      max: 210,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '160 cm × 45 cm × 45 cm',
    room: 'Giardino & Dehor',
    materials: [
      { name: 'Pannelli di multistrato melaminico liscio per cassero 18mm', quantity: '2 pannelli (200x60cm)', approxCost: '€45' },
      { name: 'Sacco di cemento bianco 52.5R, sabbia silicea fine e fibre AR', quantity: '3 sacchi', approxCost: '€38' },
      { name: 'Disarmante siliconico professionale per casseforme', quantity: '1 spray', approxCost: '€14' },
      { name: 'Listoni in castagno stagionato per seduta', quantity: '4 pezzi (150x8cm)', approxCost: '€42' },
      { name: 'Trattamento idro-oleorepellente anti-muschio per cemento a vista', quantity: '1 litro', approxCost: '€20' }
    ],
    tools: [
      'Mescolatore a frusta su trapano a bassa velocità',
      'Levigatrice con platorello diamantato per lucidatura a umido',
      'Pistola per silicone sigillante bordi cassero',
      'Mazzuolo di gomma per vibrazione manuale cassero',
      'Livella di precisione'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Costruzione cassaforma a tenuta stagna rovesciata',
        duration: '4 ore',
        description: 'Costruisci il cassero capovolto in modo che la superficie superiore della panca corrisponda al fondo liscio del pannello melaminico.',
        tip: 'Sigilla ogni spigolo interno con un finissimo cordone di silicone nero sagomato col dito: creerà uno smusso tondo di 3mm automatico.'
      },
      {
        stepNumber: 2,
        title: 'Impasto cemento GFRC e getto con vibrazione continua',
        duration: '3 ore',
        description: 'Miscela il cemento bianco con le fibre di vetro e l’additivo fluidificante. Getta a strati battendo ripetutamente le pareti del cassero per far salire tutte le bolle d’aria.',
        tip: 'Meno acqua usi, più il cemento risulterà marmoreo e resistente al gelo invernale.'
      },
      {
        stepNumber: 3,
        title: 'Disarmo controllato e lucidatura a umido',
        duration: '4 ore (dopo 72h di maturazione)',
        description: 'Svita le pareti del cassero con delicatezza. Carteggia con dischi diamantati a grana 200 e 400 bagnando costantemente per rivelare la grana serica.',
        tip: 'Mantieni il pezzo coperto con teli di plastica umidi durante i primi 3 giorni per prevenire microfessure da ritiro termico.'
      },
      {
        stepNumber: 4,
        title: 'Incastro della seduta in legno e trattamento protettivo',
        duration: '3 ore',
        description: 'Fissa i listelli di castagno trattati con olio di lino cotto negli appositi alloggiamenti incavati nel blocco di cemento.',
        tip: 'Inserisci rondelle in gomma tra il legno e il cemento per evitare il ristagno di umidità a contatto.'
      }
    ],
    expertTip: {
      it: 'Usa sempre acqua demineralizzata per l’impasto con cemento bianco: eviterai le efflorescenze saline biancastre che macchiano il cemento architettonico col passare delle stagioni.',
      en: 'Always use low-mineral water for white cement mix to prevent unsightly white salt efflorescence from surfacing over the seasons.'
    },
    author: {
      name: 'Pietro Rinaldi',
      title: 'Scultore & Mastro Muratore',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: false,
    isNew: true
  },
  {
    id: 'proj-08',
    title: {
      it: 'Libreria Modulare Sospesa in Frassino e Ferro Cerato',
      en: 'Modular Wall Shelf in Ash & Black Waxed Steel'
    },
    category: 'falegnameria',
    description: {
      it: 'Sistema libreria ad elementi componibili con montanti verticali in profilato d’acciaio grezzo trattato a cera d’api calda e mensole in massello di frassino olivato svasate sul bordo.',
      en: 'Minimalist modular shelving system featuring raw flat-bar steel verticals finished in hot beeswax and bevelled solid olive ash timber floating shelves.'
    },
    difficulty: 'beginner',
    timeEstimate: {
      it: '1 weekend (12 ore)',
      en: '1 weekend (12 hours)'
    },
    costEstimate: {
      min: 110,
      max: 180,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '180 cm × 25 cm × 110 cm',
    room: 'Studio / Salotto',
    materials: [
      { name: 'Tavole in frassino naturale piallate 22mm', quantity: '4 ripiani (180x25cm)', approxCost: '€75' },
      { name: 'Bandelle piatte in ferro da 30x4mm per montanti', quantity: '4 barre da 120cm', approxCost: '€32' },
      { name: 'Cera naturale d’api con trementina per brunitura a caldo', quantity: '1 barattolo 250ml', approxCost: '€14' },
      { name: 'Viti a brugola brunite M6 con filettatura metrica', quantity: '24 pezzi', approxCost: '€12' }
    ],
    tools: [
      'Pistola termica per scaldare il metallo prima della ceratura',
      'Trapano a colonna o guida per fori precisi nel ferro',
      'Fresatrice per smusso bordo a 30 gradi',
      'Maschera protettiva e lana d’acciaio 0000'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Taglio e foratura delle bandelle d’acciaio',
        duration: '3 ore',
        description: 'Taglia le bandelle metalliche alla medesima lunghezza e segna i fori per i ripiani a interasse costante di 32 cm.',
        tip: 'Usa una goccia d’olio da taglio durante la foratura del ferro per preservare l’affilatura della punta.'
      },
      {
        stepNumber: 2,
        title: 'Trattamento a cera d’api a caldo (finitura ferro canna di fucile)',
        duration: '2 ore',
        description: 'Sgrassa il metallo, scalda la superficie con la pistola termica a 150°C e strofina un panetto di cera d’api pura: la cera penetra nei pori creando uno scudo nero e vellutato.',
        tip: 'Questa tecnica antica protegge dalla ruggine molto meglio di qualsiasi vernice a bomboletta.'
      },
      {
        stepNumber: 3,
        title: 'Sagomatura bordo a coltello del frassino e levigatura',
        duration: '4 ore',
        description: 'Smussa la parte inferiore delle mensole a 30 gradi lasciando solo 6 mm di spessore frontale a vista: darà una leggerezza ottica incredibile.',
        tip: 'Applica olio di lino cotto e passa lana d’acciaio 0000 per una setosità incomparabile al tatto.'
      },
      {
        stepNumber: 4,
        title: 'Montaggio a parete e serraggio finale',
        duration: '3 ore',
        description: 'Fissa a muro con tasselli universali e monta i ripiani serando le brugole con chiave dinamometrica manuale.',
        tip: 'Verifica sempre la bolla su ciascun piano prima di serrare definitivamente le viti a muro.'
      }
    ],
    expertTip: {
      it: 'Il frassino ha una venatura chiara con striature calde straordinarie: evita vernici poliuretaniche lucide che lo farebbero sembrare plastica ed esalta la matericità con olio duro naturale opaco.',
      en: 'Olive ash has breathtaking grain: bypass generic glossy varnishes that look plasticky, and opt for natural matte penetrating oil.'
    },
    author: {
      name: 'Matteo Vianello',
      title: 'Mastro Ebanista',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: false,
    isNew: false
  },
  {
    id: 'proj-09',
    title: {
      it: 'Pannello Boiserie con Stucco a Calce Naturale e Marmorino',
      en: 'Artisanal Lime Plaster & Marmorino Wall Panel'
    },
    category: 'muratura',
    description: {
      it: 'Tecnica di decorazione murale veneziana su pannelli prefabbricati leggeri da applicare sopra intonaci esistenti, con finitura cerata a sapone di Marsiglia e polvere di marmo di Carrara.',
      en: 'Venetian mineral plastering technique executed on lightweight prefabricated substrate panels with genuine Carrara marble dust and Marseille black soap wax finish.'
    },
    difficulty: 'intermediate',
    timeEstimate: {
      it: '2 fine settimana (15 ore)',
      en: '2 weekends (15 hours)'
    },
    costEstimate: {
      min: 140,
      max: 220,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '200 cm × 120 cm per pannello',
    room: 'Ingresso / Zona Living',
    materials: [
      { name: 'Grassello di calce stagionato 24 mesi con polvere di marmo fine', quantity: '1 secchio da 14kg', approxCost: '€55' },
      { name: 'Primer acrilico a granulometria al quarzo', quantity: '2 litri', approxCost: '€22' },
      { name: 'Pigmenti minerali in polvere terra d’ombra e ocra naturale', quantity: '1 set', approxCost: '€18' },
      { name: 'Sapone di Marsiglia liquido e cera protettiva idrorepellente', quantity: '500 ml', approxCost: '€16' }
    ],
    tools: [
      'Frattone veneziano con bordi bisellati a specchio in acciaio inox',
      'Spatolina a lingua di gatto da 6cm',
      'Panno morbido di lana per lucidatura finale',
      'Miscelatore manuale per pigmenti'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Preparazione del supporto con fondo al quarzo',
        duration: '2 ore',
        description: 'Stendi una mano di primer al quarzo a rullo: la grana microscopica garantisce l’aggrappo perfetto del grassello di calce.',
        tip: 'Lascia asciugare almeno 6 ore per evitare distacchi.'
      },
      {
        stepNumber: 2,
        title: 'Stesura della prima mano di rasatura a calce',
        duration: '4 ore',
        description: 'Applica la calce tenendo la spatola a 30 gradi per distribuire uno spessore omogeneo di circa 1 millimetro.',
        tip: 'Non cercare subito l’effetto lucido: questa prima mano fa da letto di fondo.'
      },
      {
        stepNumber: 3,
        title: 'Seconda mano a macchia e lamatura di lucidatura',
        duration: '5 ore',
        description: 'Applica la seconda mano con piccole spatolate sovrapposte a farfalla. Quando comincia ad asciugare, lucida premendo forte col piatto della spatola pulita.',
        tip: 'La pressione della lama d’acciaio compatta i cristalli di carbonato di calcio creando una lucentezza naturale senza solventi.'
      },
      {
        stepNumber: 4,
        title: 'Saponatura e protezione con cera d’api pura',
        duration: '3 ore',
        description: 'Stendi una passata di sapone di Marsiglia che chimicamente reagisce con la calce formando stearato di calcio impermeabile e setoso al tatto.',
        tip: 'Strofina col panno di lana caldo per ottenere una superficie morbida come velluto.'
      }
    ],
    expertTip: {
      it: 'I bordi del frattone veneziano devono essere levigati con carta abrasiva 1500 prima di iniziare: qualsiasi minuscola bava d’acciaio graffierà irrimediabilmente lo stucco fresco.',
      en: 'Polish your trowel blade with 1500-grit sandpaper first: even microscopic burrs will score and scratch fresh plaster.'
    },
    author: {
      name: 'Elena Conti',
      title: 'Restauratrice d’Interni',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: false,
    isNew: false
  },
  {
    id: 'proj-10',
    title: {
      it: 'Installazione Rubinetteria Termostatica da Incasso',
      en: 'Concealed Thermostatic Shower System Installation'
    },
    category: 'idraulica',
    description: {
      it: 'Schema idraulico per posare un corpo incasso universale per doccia a 2 vie, con tubazioni in multistrato a pressare, regolazione termostatica e dima per piastrellatura.',
      en: 'Plumbing guide to installing a 2-way concealed thermostatic shower body with press-fit multilayer piping, leak-test procedures, and flush waterproofing collars.'
    },
    difficulty: 'advanced',
    timeEstimate: {
      it: '1 weekend (10 ore)',
      en: '1 weekend (10 hours)'
    },
    costEstimate: {
      min: 220,
      max: 390,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: 'Corpo incasso 14 cm profondità',
    room: 'Bagno Doccia',
    materials: [
      { name: 'Corpo d’incasso universale in ottone stampato anticalcare', quantity: '1 pezzo', approxCost: '€110' },
      { name: 'Tubo multistrato coibentato 20x2mm', quantity: '10 metri', approxCost: '€35' },
      { name: 'Raccordi a stringere o pressare femmina 1/2 pollice', quantity: '6 pezzi', approxCost: '€28' },
      { name: 'Guarnizione a collare elastico idrorepellente per impermeabilizzazione', quantity: '1 set', approxCost: '€18' }
    ],
    tools: [
      'Calibratore/sbavatore per tubo multistrato',
      'Molla piegatubi o pinza curvatubi',
      'Pompa per prova pressione idrostatica a 6 bar',
      'Livella con fiale a 90° e 180°',
      'Chiavi inglesi fisse e chiave a rullino'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Scasso a parete e posizionamento alla quota ergonomica',
        duration: '3 ore',
        description: 'La manopola termostatica va collocata a 115-120 cm dal piatto doccia finito. Alloggia il corpo a bolla con un margine di profondità compreso tra 70 e 100 mm.',
        tip: 'Considera sempre lo spessore finale della colla e delle piastrelle nel calcolo della profondità.'
      },
      {
        stepNumber: 2,
        title: 'Collegamento adduzioni acqua calda e fredda con multistrato',
        duration: '3 ore',
        description: 'L’acqua calda entra sempre a sinistra, la fredda a destra. Sbava il tubo con il calibratore per non tranciare gli o-ring di tenuta nel raccordo.',
        tip: 'Un o-ring pizzicato durante l’inserimento perderà dopo 6 mesi dentro il muro: calibra sempre con cura.'
      },
      {
        stepNumber: 3,
        title: 'Collaudo idraulico a 6 bar con manometro',
        duration: '2 ore + 24h osservazione',
        description: 'Metti l’impianto sotto pressione a 6 bar per 24 ore prima di chiudere la traccia o posare le piastrelle per certificare la tenuta totale.',
        tip: 'Non fidarti mai di un impianto senza aver fatto la prova a pressione statica.'
      },
      {
        stepNumber: 4,
        title: 'Posa collare di tenuta e montaggio piastra esterna',
        duration: '2 ore',
        description: 'Incolla il collare in gomma butilica con la guaina liquida prima di posare il rivestimento ceramico. Applica la piastra esterna cromata.',
        tip: 'Il collare impedisce che l’acqua della doccia penetri lungo la fessura tra piastrella e corpo incasso.'
      }
    ],
    expertTip: {
      it: 'Installa due mini-valvole d’intercettazione a sfera sul collettore principale prima del corpo termostatico: potrai effettuare manutenzione sulla cartuccia senza chiudere l’acqua a tutta la casa.',
      en: 'Fit two isolation mini-valves on your main manifold line feeding the mixer: you will be able to service cartridges without shutting off water to the whole house.'
    },
    author: {
      name: 'Davide Morandi',
      title: 'Maestro Termoidraulico',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: false,
    isNew: false
  },
  {
    id: 'proj-11',
    title: {
      it: 'Illuminazione Architetturale Lineare ad Incasso 24V',
      en: 'Architectural Recessed 24V Linear Lighting'
    },
    category: 'elettricita',
    description: {
      it: 'Sistema di profili a scomparsa totale nel cartongesso (trimless) per lame di luce lineari continua ad alta resa cromatica e gestione scenari con dimmer DALI o Zigbee.',
      en: 'Trimless plaster-in architectural LED profile integration within drywall ceiling and wall reveals, powered by 24V constant voltage drivers and Zigbee smart dimmers.'
    },
    difficulty: 'intermediate',
    timeEstimate: {
      it: '1 weekend (9 ore)',
      en: '1 weekend (9 hours)'
    },
    costEstimate: {
      min: 150,
      max: 260,
      currency: '€'
    },
    coverImage: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&w=1200&q=80'
    ],
    dimensions: '6 metri lineari sviluppo',
    room: 'Corridoio / Zona Living',
    materials: [
      { name: 'Profili in alluminio trimless microforati da cartongesso', quantity: '3 barre da 2 metri', approxCost: '€65' },
      { name: 'Strip LED 24V ad alta densità (480 chip/m, 3000K, CRI>95)', quantity: '1 bobina da 6 metri', approxCost: '€55' },
      { name: 'Trasformatore professionale ultra slim 100W 24V IP20', quantity: '1 pezzo', approxCost: '€38' },
      { name: 'Rete in fibra di vetro e stucco specifico per giunti cartongesso', quantity: '1 kit', approxCost: '€16' }
    ],
    tools: [
      'Saldatore a stagno a punta fine per giunzioni LED sicure',
      'Seghetto per profilati d’alluminio con dente fitto',
      'Tester digitale multimetro',
      'Spatola flessibile da rasatura per cartongesso'
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Integrazione del profilo in alluminio nell’orditura cartongesso',
        duration: '3 ore',
        description: 'Avvita le alette forate del profilo direttamente ai montanti metallici con viti autofilettanti per cartongesso a testa piana.',
        tip: 'Applica la rete adesiva microforata sulle alette prima di stuccare per evitare cavillature col calore.'
      },
      {
        stepNumber: 2,
        title: 'Rasatura e carteggiatura a filo profilo',
        duration: '3 ore',
        description: 'Stendi due mani di stucco speciale a ritiro controllato pareggiando il dislivello con la lama del profilo in alluminio.',
        tip: 'Conserva il diffusore in plastica protettivo montato durante la tinteggiatura per non sporcare la sede del LED.'
      },
      {
        stepNumber: 3,
        title: 'Incollatura della strip LED e saldatura a stagno',
        duration: '2 ore',
        description: 'Sgrassa l’alluminio con alcool isopropilico. Incolla la strip termoconduttiva e salda i cavetti di alimentazione polarizzati.',
        tip: 'Non alimentare linee LED più lunghe di 5 metri da un solo lato: alimenta da entrambi i lati per evitare cadute di tensione.'
      },
      {
        stepNumber: 4,
        title: 'Inserimento schermo opalino e calibrazione dimmer',
        duration: '1 ora',
        description: 'Incastra lo schermo diffusore opale per ottenere un fascio di luce continua e omogenea priva di qualsiasi riflesso puntiforme.',
        tip: 'Testa l’accensione a piena potenza per 30 minuti prima di chiudere la botola di ispezione dell’alimentatore.'
      }
    ],
    expertTip: {
      it: 'Colloca l’alimentatore 24V in una scatola di derivazione ventilata e facilmente accessibile, mai annegato nel cartongesso inaccessibile: se si guasta tra 8 anni non dovrai spaccare il muro.',
      en: 'Locate your 24V driver inside an accessible ventilated enclosure or junction box, never permanently sealed in inaccessible ceiling cavities.'
    },
    author: {
      name: 'Chiara Bellini',
      title: 'Lighting Designer',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    isFeatured: false,
    isNew: true
  }
];

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

export const INITIAL_USER_PROJECTS: UserProject[] = [
  {
    id: 'my-01',
    projectId: 'proj-01',
    title: 'Tavolo da Pranzo in Rovere Massello',
    category: 'mobili',
    coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
    progress: 60,
    status: 'in_progress',
    lastUpdated: 'Oggi alle 10:30',
    notes: 'Tavole acquistate dal fornitore a Monza. Tagli di distensione completati. In attesa dell’asciugatura della seconda mano di olio.',
    completedSteps: [1, 2, 3],
    totalSteps: 5,
    difficulty: 'intermediate',
    timeEstimate: '24 ore',
    costEstimate: '€290 spesi su €350 budget'
  },
  {
    id: 'my-02',
    projectId: 'proj-05',
    title: 'Parete Cannettata con LED in Salotto',
    category: 'pareti',
    coverImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    progress: 100,
    status: 'completed',
    lastUpdated: '12 giorni fa',
    notes: 'Realizzata dietro il mobile TV. La luce calda a 2700K trasforma completamente l’atmosfera serale.',
    completedSteps: [1, 2, 3, 4],
    totalSteps: 4,
    difficulty: 'beginner',
    timeEstimate: '10 ore',
    costEstimate: '€195 totale'
  },
  {
    id: 'my-03',
    projectId: 'proj-03',
    title: 'Mobile Bagno Sospeso in Teak',
    category: 'bagno',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    progress: 0,
    status: 'saved',
    lastUpdated: 'Ieri',
    notes: 'Da avviare dopo la ristrutturazione dei sanitari. Verificare interasse delle tubazioni a muro.',
    completedSteps: [],
    totalSteps: 4,
    difficulty: 'intermediate',
    timeEstimate: '16 ore',
    costEstimate: '€250 stimati'
  }
];

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

