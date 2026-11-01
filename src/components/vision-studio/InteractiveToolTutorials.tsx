import React, { useState } from 'react';
import {
  Wrench,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Target,
  Compass,
} from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

export interface TutorialHotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  title: string;
  description: string;
  type: 'safety' | 'grip' | 'precision' | 'danger';
}

export interface TutorialStep {
  stepNumber: number;
  title: string;
  action: string;
  angleGuide?: string;
  masterAdvice: string;
  safetyWarning: string;
  hotspots: TutorialHotspot[];
  overlayVector: {
    type: 'angle_arc' | 'cut_line' | 'danger_cone' | 'depth_guide';
    label: string;
    description: string;
  };
}

export interface ToolTutorial {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  toolName: string;
  difficulty: 'Base' | 'Intermedio' | 'Avanzato';
  recommendedPpe: string[];
  image: string;
  steps: TutorialStep[];
}

export const TUTORIALS_DATA: ToolTutorial[] = [
  {
    id: 'tut-grinder',
    title: 'Smerigliatrice Angolare (Flex)',
    subtitle: 'Presa sicura, orientamento del carter e taglio senza contraccolpi',
    category: 'Elettroutensili & Metallo',
    toolName: 'Smerigliatrice 125mm con disco da taglio 1.2mm',
    difficulty: 'Intermedio',
    recommendedPpe: ['Occhiali balistici EN 166', 'Guanti antitaglio EN 388', 'Cuffie fonoassorbenti', 'Mascherina FFP2'],
    image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        stepNumber: 1,
        title: 'Presa a Due Mani & Posizione del Carter',
        action: 'Afferra saldamente l’impugnatura laterale con la mano non dominante e il corpo macchina con la mano dominante. Posiziona il carter metallico a 45° in modo che le scintille vengano deflesse lontano dal tuo corpo e dal viso.',
        angleGuide: 'Angolo carter: 45° verso il retro',
        masterAdvice: 'Non rimuovere MAI il carter per alloggiare dischi più grandi. L’impugnatura laterale deve essere serrata a fondo nel filetto M10/M14.',
        safetyWarning: 'La traiettoria delle scorie incandescenti raggiunge i 1000°C: allontana cavi elettrici e solventi nel raggio di 4 metri.',
        hotspots: [
          {
            id: 'h1',
            x: 28,
            y: 48,
            title: 'Impugnatura Ausiliaria Antivibrazione',
            description: 'Mano secondaria per contrastare la coppia torcente della smerigliatrice in caso di inceppamento del disco.',
            type: 'grip',
          },
          {
            id: 'h2',
            x: 44,
            y: 28,
            title: 'Carter di Protezione Regolabile',
            description: 'Schermo di sicurezza in acciaio balistico. Deve intercettare qualsiasi eventuale frammento in caso di rottura del disco.',
            type: 'safety',
          },
          {
            id: 'h3',
            x: 78,
            y: 72,
            title: 'Interruttore a Uomo Presente',
            description: 'Tasto a rilascio istantaneo. Non bloccare l’interruttore in posizione continua durante tagli critici.',
            type: 'precision',
          },
        ],
        overlayVector: {
          type: 'danger_cone',
          label: 'Cono di Scarico Scintille (45° Posteriore)',
          description: 'Zona rossa di proiezione scorie: orientare lontano dagli arti e da materiali infiammabili.',
        },
      },
      {
        stepNumber: 2,
        title: 'Angolo di Taglio Perpendicolare a 90°',
        action: 'Appoggia il disco sul pezzo solo a regime di giri massimo raggiunto. Mantieni la lama a 90° esatti rispetto alla superficie. Non inclinare o torcere la smerigliatrice all’interno della fessura.',
        angleGuide: 'Inclinazione asse: 90.0° perpendicolare',
        masterAdvice: 'Lascia che sia il peso dell’utensile a fare pressione. Se premi troppo, il disco scalda, perde planarità e rischia di esplodere.',
        safetyWarning: 'La torsione laterale della lama nel solco di taglio è la causa numero uno del pericoloso contraccolpo (kickback).',
        hotspots: [
          {
            id: 'h4',
            x: 52,
            y: 50,
            title: 'Asse di Taglio Ortogonale',
            description: 'Verifica visiva: la linea del disco deve coincidere perfettamente con la traccia a matita/gesso.',
            type: 'precision',
          },
          {
            id: 'h5',
            x: 36,
            y: 38,
            title: 'Disco Sottile 1.2mm in Corindone',
            description: 'Spessore ridotto per minor attrito e taglio freddo. Verifica sempre la data di scadenza stampata sull’anello d’ottone.',
            type: 'safety',
          },
        ],
        overlayVector: {
          type: 'cut_line',
          label: 'Asse di Taglio a 90° Ortogonale',
          description: 'Mantenere la lama a filo senza correggere la traiettoria durante la corsa.',
        },
      },
      {
        stepNumber: 3,
        title: 'Verso di Avanzamento per Trazione',
        action: 'Procedi sempre "tirando" la macchina verso di te (taglio per trazione), mai spingendo all’avanti nel solco cieco. Questo garantisce che la rotazione spinga l’utensile verso il pezzo e non verso il tuo corpo.',
        angleGuide: 'Avanzamento a trazione continua',
        masterAdvice: 'Se il pezzo è tubolare, ruota il tubo dopo aver tagliato ogni quarto, senza affondare al centro.',
        safetyWarning: 'Assicura sempre il pezzo con morsetti da banco in ghisa: non reggere mai il pezzo con i piedi o con la mano libera.',
        hotspots: [
          {
            id: 'h6',
            x: 58,
            y: 42,
            title: 'Direzione di Rotazione Disco',
            description: 'Senso antiorario guardando la flangia: l’attrito deve stabilizzare il corpo macchina.',
            type: 'precision',
          },
        ],
        overlayVector: {
          type: 'angle_arc',
          label: 'Vettore Trazione Guidata',
          description: 'Avanzamento progressivo uniforme a velocità costante.',
        },
      },
    ],
  },
  {
    id: 'tut-trowel',
    title: 'Frattone Inox per Microcemento & Rasature',
    subtitle: 'Angolo della lama a 30°, pressione modulare e chiusura dei pori',
    category: 'Superfici & Resine',
    toolName: 'Frattone trapezoidale inox con bordi bisellati 240x100mm',
    difficulty: 'Intermedio',
    recommendedPpe: ['Guanti in nitrile resistenti agli alcali', 'Ginocchiere ergonomiche in gel', 'Maschera FFP2 per polveri secche'],
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        stepNumber: 1,
        title: 'Caricamento Malta & Prima Stesura a 15°',
        action: 'Deposita un cordolo uniforme di microcemento sul terzo inferiore della lama usando la spatola ausiliaria. Inclina il frattone a soli 15° rispetto al supporto per stendere uno strato sottile e compatto.',
        angleGuide: 'Inclinazione rasatura: 15° - 20°',
        masterAdvice: 'Usa solo lame con angoli arrotondati e bordi lucidi a specchio: eviterai le rigature nere metalliche tipiche degli acciai grezzi.',
        safetyWarning: 'Il microcemento a legante cementizio è corrosivo per la pelle: sciacqua immediatamente eventuali schizzi.',
        hotspots: [
          {
            id: 't1',
            x: 35,
            y: 65,
            title: 'Impugnatura Bi-materia Centrata',
            description: 'Presa a palmo con l’indice esteso lungo il dorso della lama per dosare la pressione millimetrica.',
            type: 'grip',
          },
          {
            id: 't2',
            x: 65,
            y: 40,
            title: 'Lama Inox Specchio a Spigolo Smussato',
            description: 'Bordi bisellati a 45° per evitare che gli spigoli incidano lo strato bagnato precedente.',
            type: 'precision',
          },
        ],
        overlayVector: {
          type: 'angle_arc',
          label: 'Inclinazione Lama a 15° (Stesura Coprente)',
          description: 'Spessore velo consigliato: 1.0mm - 1.5mm continuo.',
        },
      },
      {
        stepNumber: 2,
        title: 'Passata a Mezzaluna & Chiusura Porosità a 35°',
        action: 'Alza l’inclinazione del frattone a circa 35° e compi passate incrociate ad arco (movimento a ventaglio). La lama più inclinata rasa il materiale in eccesso e compatta i minerali fini in superficie.',
        angleGuide: 'Inclinazione compattazione: 35°',
        masterAdvice: 'Non ripassare ossessivamente sullo stesso punto già asciugato: lasceresti una chiazza opaca. Lavora sempre bagnato su bagnato.',
        safetyWarning: 'Non aggiungere acqua al prodotto durante la stesura: altereresti la resistenza meccanica del polimero.',
        hotspots: [
          {
            id: 't3',
            x: 50,
            y: 35,
            title: 'Filo di Pressione Radente',
            description: 'Contatto della lama con pressione uniforme da 1.5 kg distribuita su tutta la lunghezza.',
            type: 'precision',
          },
        ],
        overlayVector: {
          type: 'cut_line',
          label: 'Vettore Movimento ad Arco a Ventaglio',
          description: 'Eliminazione giunti tra passate con sovrapposizione di 5cm.',
        },
      },
    ],
  },
  {
    id: 'tut-miter',
    title: 'Troncatrice Radiale: Taglio Bisello a 45°',
    subtitle: 'Allineamento laser, bloccaggio pezzo e discesa senza strappo',
    category: 'Falegnameria & Taglio',
    toolName: 'Troncatrice radiale 254mm con lama 60 denti widia alternati',
    difficulty: 'Avanzato',
    recommendedPpe: ['Occhiali protettivi con ripari laterali', 'Cuffie antirumore', 'Nessun guanto (rischio presa organi rotanti)'],
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        stepNumber: 1,
        title: 'Allineamento Battuta di Fondo & Asse 45°',
        action: 'Ruota la tavola goniometrica sul fermo di scatto a 45°. Spingi la modanatura o il listello con decisione contro la battuta posteriore, verificando con la squadra combinata che non ci sia luce né trucioli incastrati.',
        angleGuide: 'Goniometro: 45.0° calibrato',
        masterAdvice: 'Prima del taglio definitivo sul pezzo nobile, esegui sempre un taglio di prova su uno scarto per verificare l’accoppiamento reale.',
        safetyWarning: 'MAI tagliare pezzi inferiori a 15cm senza un blocco sacrificale ausiliario. Rischio proiezione schegge.',
        hotspots: [
          {
            id: 'm1',
            x: 25,
            y: 70,
            title: 'Morsetto Verticale Rapido',
            description: 'Serra obbligatoriamente il pezzo con il morsetto in dotazione. Le mani devono stare a distanza minima di 15cm dalla lama.',
            type: 'safety',
          },
          {
            id: 'm2',
            x: 52,
            y: 38,
            title: 'Lama 60T a Dente Negativo',
            description: 'Geometria dente trapezoidale/piano negativo per tagliare impiallacciature e cornici senza sbeccare la fibra.',
            type: 'precision',
          },
        ],
        overlayVector: {
          type: 'angle_arc',
          label: 'Goniometro 45° con Arresto Meccanico',
          description: 'Squadratura certificata con battuta d’arresto perpendicolare.',
        },
      },
      {
        stepNumber: 2,
        title: 'Avvio a Vuoto e Discesa Controllata',
        action: 'Premi il pulsante di sblocco e avvia il motore. Attendi 2 secondi che la lama raggiunga la massima velocità di rotazione prima di toccare il legno. Scendi con velocità uniforme senza forzare.',
        angleGuide: 'Discesa: 10-15 mm/sec costante',
        masterAdvice: 'A taglio completato in basso, rilascia il grilletto e attendi l’arresto completo della lama PRIMA di rialzarla.',
        safetyWarning: 'Non incrociare mai le braccia davanti alla traiettoria di taglio.',
        hotspots: [
          {
            id: 'm3',
            x: 62,
            y: 20,
            title: 'Impugnatura a D con Leva di Sicurezza',
            description: 'Doppio azionamento per prevenire discese accidentali della testa motore.',
            type: 'grip',
          },
        ],
        overlayVector: {
          type: 'cut_line',
          label: 'Traiettoria di Discesa Lama a 45°',
          description: 'Corsa lineare continua con evacuazione trucioli posteriore.',
        },
      },
    ],
  },
  {
    id: 'tut-kreg',
    title: 'Dima di Foratura a Tasca (Pocket Hole)',
    subtitle: 'Calibrazione spessore, arresto su punta e avvitamento invisibile',
    category: 'Ebanisteria & Giunzioni',
    toolName: 'Dima per fori a tasca con punta a gradino e collare di profondità',
    difficulty: 'Base',
    recommendedPpe: ['Occhiali protettivi', 'Aspiratore trucioli collegato'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    steps: [
      {
        stepNumber: 1,
        title: 'Regolazione Guida & Collare di Arresto',
        action: 'Misura lo spessore esatto del listello (es. 19mm). Regola la slitta della dima sul valore 19mm. Inserisci la punta a gradino nella guida e blocca il collare di profondità con la chiave a brugola sul contrassegno corrispondente.',
        angleGuide: 'Inclinazione guida: 15° conica',
        masterAdvice: 'Usa sempre un morsetto a ganascia larga per bloccare il legno contro la dima, altrimenti la punta tenderà a spostare il pezzo durante l’innesco.',
        safetyWarning: 'Rimuovi sempre la chiave a brugola dal mandrino prima di collegare la batteria al trapano.',
        hotspots: [
          {
            id: 'k1',
            x: 42,
            y: 35,
            title: 'Canotti di Guida in Acciaio Temprato',
            description: 'Guidano la punta a 15° precisi garantendo che la tasca non sfondi mai il lato a vista del mobile.',
            type: 'precision',
          },
          {
            id: 'k2',
            x: 68,
            y: 55,
            title: 'Collare di Arresto Regolabile',
            description: 'Fissa la profondità del foro pilota in modo che la vite si fermi esattamente al centro del pezzo adiacente.',
            type: 'safety',
          },
        ],
        overlayVector: {
          type: 'depth_guide',
          label: 'Guida Inclinata 15° con Arresto di Profondità',
          description: 'Tasca a gradino per alloggiare la testa della vite autofilettante.',
        },
      },
    ],
  },
];

interface InteractiveToolTutorialsProps {
  language: Language;
}

export const InteractiveToolTutorials: React.FC<InteractiveToolTutorialsProps> = ({
  language,
}) => {
  const [selectedTutorialId, setSelectedTutorialId] = useState<string>('tut-grinder');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  const [activeHotspot, setActiveHotspot] = useState<TutorialHotspot | null>(null);

  const tutorial = TUTORIALS_DATA.find((t) => t.id === selectedTutorialId) || TUTORIALS_DATA[0];
  const step = tutorial.steps[currentStepIndex] || tutorial.steps[0];

  const handleSelectTutorial = (id: string) => {
    setSelectedTutorialId(id);
    setCurrentStepIndex(0);
    setActiveHotspot(null);
  };

  const handleNextStep = () => {
    if (currentStepIndex < tutorial.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setActiveHotspot(null);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setActiveHotspot(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl sm:rounded-4xl border border-[#E5DFD5] shadow-xs overflow-hidden">
      
      {/* Header section with brand accent */}
      <div className="p-5 sm:p-7 border-b border-[#F0EBE1] bg-[#FAF8F5]">
        <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26343B] text-[#B79B76] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#B79B76]" />
              <span>Nuovo Modulo Interattivo</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-[#26343B]">
              Tutorial Tecnici & Overlay Grafici
            </h2>
            <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl leading-relaxed">
              Guide visive dinamiche con vettori di allineamento, zone di sicurezza e schemi di presa corretta per attrezzi e montaggi critici.
            </p>
          </div>

          {/* Toggle Overlays Visibility */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border shadow-xs cursor-pointer ${
              showOverlays
                ? 'bg-[#26343B] text-[#F5F1E9] border-[#26343B]'
                : 'bg-white text-[#26343B] border-[#E5DFD5] hover:bg-[#FAF8F5]'
            }`}
          >
            {showOverlays ? (
              <>
                <Eye className="w-4 h-4 text-[#B79B76]" />
                <span>Guide Grafiche ON</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-[#26343B]/50" />
                <span>Guide Grafiche OFF</span>
              </>
            )}
          </button>
        </div>

        {/* Horizontal Tool Selector Carousel */}
        <div className="flex w-full flex-wrap items-center gap-2 pt-4">
          {TUTORIALS_DATA.map((t) => {
            const isSelected = t.id === selectedTutorialId;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTutorial(t.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#26343B] text-[#F5F1E9] border-[#26343B] shadow-xs'
                    : 'bg-white text-[#26343B]/80 border-[#E5DFD5] hover:bg-[#FAF8F5]'
                }`}
              >
                <Wrench className={`w-3.5 h-3.5 ${isSelected ? 'text-[#B79B76]' : 'text-[#8F7451]'}`} />
                <span className="whitespace-nowrap">{t.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage with Graphic Overlays */}
      <div className="p-4 sm:p-7 space-y-6">
        
        {/* Step Indicator & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5] p-3 sm:p-4 rounded-2xl border border-[#EAE4D8]">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-[#26343B] text-[#B79B76] text-xs font-bold flex items-center justify-center shrink-0">
              {step.stepNumber}
            </span>
            <div>
              <span className="text-[10px] text-[#8F7451] uppercase font-bold tracking-wider block">
                Fase {step.stepNumber} di {tutorial.steps.length} · {tutorial.difficulty}
              </span>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#26343B] leading-tight">
                {step.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-white border border-[#E5DFD5] text-[#26343B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAF8F5] transition-colors"
              title="Passaggio precedente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium text-[#26343B]/70 px-1">
              {currentStepIndex + 1} / {tutorial.steps.length}
            </span>
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === tutorial.steps.length - 1}
              className="p-2 rounded-xl bg-[#26343B] text-[#F5F1E9] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1A242A] transition-colors shadow-xs"
              title="Passaggio successivo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Interactive Viewport with SVG Graphic Overlay Layer */}
        <div className="relative rounded-3xl overflow-hidden border border-[#E5DFD5] bg-[#1A242A] shadow-md select-none">
          {/* Base Background Visual */}
          <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden">
            <img
              src={tutorial.image}
              alt={tutorial.title}
              onError={(event) => { event.currentTarget.style.display = 'none'; }}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A242A] via-transparent to-black/30 pointer-events-none" />

            {/* SVG Graphical Overlays Layer */}
            {showOverlays && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Specific overlay illustrations based on step vector type */}
                {step.overlayVector.type === 'danger_cone' && (
                  <>
                    {/* Triangular danger cone for spark spray */}
                    <polygon
                      points="45,45 15,80 35,95"
                      fill="rgba(239, 68, 68, 0.25)"
                      stroke="#EF4444"
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                    <line x1="45" y1="45" x2="25" y2="88" stroke="#EF4444" strokeWidth="1.2" />
                  </>
                )}

                {step.overlayVector.type === 'cut_line' && (
                  <>
                    {/* 90 degree cutting perpendicular vector */}
                    <line
                      x1="50"
                      y1="15"
                      x2="50"
                      y2="85"
                      stroke="#B79B76"
                      strokeWidth="1.2"
                      strokeDasharray="3,2"
                    />
                    <circle cx="50" cy="50" r="4" fill="none" stroke="#B79B76" strokeWidth="1" />
                    {/* Normal vector guide */}
                    <line x1="25" y1="50" x2="75" y2="50" stroke="#F5F1E9" strokeWidth="0.6" strokeDasharray="1,2" />
                  </>
                )}

                {step.overlayVector.type === 'angle_arc' && (
                  <>
                    {/* Angle arc indicator */}
                    <path
                      d="M 40,60 A 25,25 0 0,1 60,35"
                      fill="none"
                      stroke="#B79B76"
                      strokeWidth="1.5"
                    />
                    <line x1="40" y1="60" x2="70" y2="60" stroke="#F5F1E9" strokeWidth="0.8" strokeDasharray="2,2" />
                    <line x1="40" y1="60" x2="65" y2="35" stroke="#B79B76" strokeWidth="1" />
                  </>
                )}

                {step.overlayVector.type === 'depth_guide' && (
                  <>
                    {/* Slanted pocket hole guide vector */}
                    <line x1="30" y1="75" x2="70" y2="25" stroke="#B79B76" strokeWidth="1.5" strokeDasharray="2,2" />
                    <circle cx="50" cy="50" r="3" fill="#B79B76" />
                  </>
                )}
              </svg>
            )}

            {/* Interactive Hotspot Pins */}
            {showOverlays &&
              step.hotspots.map((hotspot) => {
                const isSelected = activeHotspot?.id === hotspot.id;
                const typeColors = {
                  safety: 'bg-emerald-500 ring-emerald-300',
                  danger: 'bg-red-500 ring-red-300',
                  grip: 'bg-[#B79B76] ring-[#DAC9B2]',
                  precision: 'bg-blue-500 ring-blue-300',
                }[hotspot.type];

                return (
                  <button
                    key={hotspot.id}
                    onClick={() => setActiveHotspot(isSelected ? null : hotspot)}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-hidden z-20"
                    title={hotspot.title}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${typeColors} text-white text-[11px] font-bold flex items-center justify-center shadow-lg ring-4 transition-transform group-hover:scale-115 ${isSelected ? 'scale-120' : ''}`}>
                        <Target className="w-3.5 h-3.5 text-white" />
                      </span>
                      <span className={`absolute w-full h-full rounded-full ${typeColors} opacity-50 animate-ping pointer-events-none`} />
                    </div>
                  </button>
                );
              })}

            {/* Bottom Overlay Label */}
            {showOverlays && (
              <div className="absolute bottom-3 left-3 right-3 z-30 flex flex-col items-start gap-2 pointer-events-none sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full max-w-full min-w-0 items-start gap-1.5 whitespace-normal break-words rounded-xl border border-white/10 bg-black/85 px-3 py-2 text-left text-[11px] font-medium leading-snug text-white shadow-md backdrop-blur-md sm:w-fit">
                  <Compass className="w-3.5 h-3.5 text-[#B79B76]" />
                  <span className="min-w-0 flex-1 whitespace-normal break-words">{step.overlayVector.label}</span>
                </div>
                {step.angleGuide && (
                  <div className="w-full max-w-full whitespace-normal break-words rounded-lg border border-[#B79B76]/30 bg-[#26343B]/95 px-2.5 py-1.5 text-[11px] font-mono font-bold leading-snug text-[#B79B76] backdrop-blur-md sm:w-fit">
                    {step.angleGuide}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Hotspot Inspector Card (Appears when hotspot clicked) */}
          {activeHotspot && (
            <div className="p-3 sm:p-4 bg-[#26343B] text-[#F5F1E9] border-t border-[#37474F] flex items-start justify-between gap-3 animate-in fade-in">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B79B76]" />
                  <h4 className="font-bold text-xs sm:text-sm text-[#F5F1E9]">
                    {activeHotspot.title}
                  </h4>
                </div>
                <p className="text-xs text-[#F5F1E9]/80 leading-relaxed">
                  {activeHotspot.description}
                </p>
              </div>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-xs text-[#F5F1E9]/60 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Step Detailed Practical Guidance */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Main Action Description (8 cols) */}
          <div className="md:col-span-8 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F7451] block">
                Manovra Operativa Corretta:
              </span>
              <p className="text-xs sm:text-sm text-[#26343B] leading-relaxed font-normal">
                {step.action}
              </p>
            </div>

            {/* Master Craftsman Advice Note */}
            <div className="p-4 rounded-2xl bg-[#26343B] text-[#F5F1E9] border border-[#37474F] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#B79B76]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>La Regola del Mastro Artigiano</span>
              </div>
              <p className="text-xs text-[#F5F1E9]/90 italic leading-relaxed">
                "{step.masterAdvice}"
              </p>
            </div>
          </div>

          {/* Safety & PPE Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            {/* Safety Warning */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-600/30 text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Rischio Specifico di Fase</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-950/80">
                {step.safetyWarning}
              </p>
            </div>

            {/* PPE Required for this tool */}
            <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#26343B]/70 block">
                DPI Obbligatori per {tutorial.title}:
              </span>
              <ul className="space-y-1.5">
                {tutorial.recommendedPpe.map((ppe, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-[#26343B]/80 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{ppe}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
