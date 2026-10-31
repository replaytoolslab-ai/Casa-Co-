import React, { useState } from 'react';
import {
  Sparkles,
  Ruler,
  Euro,
  Gauge,
  Sliders,
  CheckCircle2,
  FileText,
  Hammer,
  Layers,
  ArrowRight,
  RotateCcw,
  Printer,
  ChevronDown,
  Info,
  Calendar,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { DifficultyLevel, UserProject } from '../types';
import { Language, translations } from '../i18n/translations';

interface AIProjectScreenProps {
  language: Language;
  onSaveGeneratedProject: (project: UserProject) => void;
  onNavigateProjects: () => void;
}

export const AIProjectScreen: React.FC<AIProjectScreenProps> = ({
  language,
  onSaveGeneratedProject,
  onNavigateProjects,
}) => {
  const t = translations[language];

  // Form State
  const [description, setDescription] = useState(
    'Tavolo da pranzo monumentale in rovere massello a taglio vivo con basamento a trapezio in acciaio scuro'
  );
  const [width, setWidth] = useState(200);
  const [depth, setDepth] = useState(90);
  const [height, setHeight] = useState(76);
  const [roomType, setRoomType] = useState('Zona Pranzo / Open Space');
  const [budget, setBudget] = useState(320);
  const [experienceLevel, setExperienceLevel] = useState<DifficultyLevel>('intermediate');
  const [woodSpecies, setWoodSpecies] = useState('Rovere Slavonia Massello');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [hasResult, setHasResult] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Suggested Prompts
  const samplePrompts = [
    {
      title: 'Tavolo da pranzo massello (200x90)',
      w: 200,
      d: 90,
      h: 76,
      budget: 340,
      room: 'Living / Cucina',
      wood: 'Rovere Slavonia Massello',
      desc: 'Tavolo da pranzo minimalista in rovere massello a doghe larghe con gambe metalliche a trapezio nero opaco.',
      level: 'intermediate' as DifficultyLevel,
    },
    {
      title: 'Mobile bagno sospeso in teak (120x50)',
      w: 120,
      d: 50,
      h: 42,
      budget: 220,
      room: 'Bagno Padronale',
      wood: 'Teak Nautico Trattato',
      desc: 'Mobile sospeso a parete con giunzione folding continua a 45 gradi e alloggio per lavabo d’appoggio a ciotola.',
      level: 'intermediate' as DifficultyLevel,
    },
    {
      title: 'Libreria modulare a cubi sfalsati (180x110)',
      w: 180,
      d: 30,
      h: 110,
      budget: 160,
      room: 'Studio / Salotto',
      wood: 'Frassino Olivato & Metallo',
      desc: 'Libreria modulare asimmetrica a vani aperti e chiusi con ripiani svasati a lama.',
      level: 'beginner' as DifficultyLevel,
    },
  ];

  const handleApplySample = (sample: typeof samplePrompts[0]) => {
    setDescription(sample.desc);
    setWidth(sample.w);
    setDepth(sample.d);
    setHeight(sample.h);
    setBudget(sample.budget);
    setRoomType(sample.room);
    setWoodSpecies(sample.wood);
    setExperienceLevel(sample.level);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenerationStep(1);

    setTimeout(() => setGenerationStep(2), 600);
    setTimeout(() => setGenerationStep(3), 1200);
    setTimeout(() => {
      setIsGenerating(false);
      setHasResult(true);
      setSavedSuccess(false);
    }, 1800);
  };

  const handleSaveToMyProjects = () => {
    const newProject: UserProject = {
      id: `ai-gen-${Date.now()}`,
      title: `Progetto AI: ${description.slice(0, 36)}...`,
      category: 'mobili',
      coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      progress: 10,
      status: 'in_progress',
      lastUpdated: 'Adesso',
      notes: `Studio esecutivo generato: ${width}x${depth}x${height} cm in ${woodSpecies}. Budget fissato: €${budget}.`,
      completedSteps: [],
      totalSteps: 5,
      difficulty: experienceLevel,
      timeEstimate: '20 ore di banco',
      costEstimate: `€${budget} stimati (risparmio €${Math.round(budget * 2.2)})`,
      isAiGenerated: true,
    };

    onSaveGeneratedProject(newProject);
    setSavedSuccess(true);
    setTimeout(() => {
      onNavigateProjects();
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B79B76]/15 text-[#8F7451] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#B79B76]" />
          <span>{t.aiDesign.badge}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#26343B]">
          {t.aiDesign.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl leading-relaxed">
          {t.aiDesign.subtitle}
        </p>
      </div>

      {/* Main Designer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Configuration Form (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-6">
          
          {/* Quick preset buttons */}
          <div>
            <label className="block text-xs font-bold text-[#26343B]/70 uppercase tracking-wider mb-2">
              {t.aiDesign.samplePromptsLabel}
            </label>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(s)}
                  className="text-left px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] border border-[#EAE4D8] text-xs text-[#26343B] font-medium transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{s.title}</span>
                  <span className="text-[10px] text-[#8F7451] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Carica
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Description */}
          <div>
            <label className="block text-xs font-bold text-[#26343B] uppercase tracking-wider mb-1.5">
              {t.aiDesign.step1Title}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.aiDesign.inputPlaceholder}
              className="w-full p-3 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] focus:bg-white outline-none leading-relaxed resize-none transition-all"
            />
          </div>

          {/* Step 2: Dimensions & Room */}
          <div>
            <label className="block text-xs font-bold text-[#26343B] uppercase tracking-wider mb-2">
              {t.aiDesign.step2Title}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-[#26343B]/60 font-medium block mb-1">
                  Larghezza (cm)
                </span>
                <input
                  type="number"
                  min="20"
                  max="600"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full p-2.5 text-center text-xs sm:text-sm font-semibold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#26343B]/60 font-medium block mb-1">
                  Profondità (cm)
                </span>
                <input
                  type="number"
                  min="15"
                  max="400"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                  className="w-full p-2.5 text-center text-xs sm:text-sm font-semibold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
                />
              </div>
              <div>
                <span className="text-[10px] text-[#26343B]/60 font-medium block mb-1">
                  Altezza (cm)
                </span>
                <input
                  type="number"
                  min="10"
                  max="350"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full p-2.5 text-center text-xs sm:text-sm font-semibold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
                />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-[10px] text-[#26343B]/60 font-medium block mb-1">
                {t.aiDesign.roomType}
              </span>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
              >
                <option value="Zona Pranzo / Open Space">Zona Pranzo / Open Space</option>
                <option value="Cucina & Bancone">Cucina & Bancone</option>
                <option value="Soggiorno & Parete TV">Soggiorno & Parete TV</option>
                <option value="Bagno Padronale">Bagno Padronale</option>
                <option value="Terrazzo & Giardino">Terrazzo & Giardino</option>
                <option value="Studio & Laboratorio">Studio & Laboratorio</option>
              </select>
            </div>
          </div>

          {/* Step 3: Budget & Material */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#26343B] uppercase tracking-wider">
                {t.aiDesign.step3Title}
              </label>
              <span className="font-bold text-sm text-[#8F7451]">
                €{budget}
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="1200"
              step="20"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#B79B76] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#26343B]/50 font-medium mt-1">
              <span>€50 (Eco)</span>
              <span>€600 (Medio)</span>
              <span>€1200+ (High-End)</span>
            </div>

            <div className="mt-3">
              <span className="text-[10px] text-[#26343B]/60 font-medium block mb-1">
                {t.aiDesign.woodType}
              </span>
              <select
                value={woodSpecies}
                onChange={(e) => setWoodSpecies(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
              >
                <option value="Rovere Slavonia Massello">Rovere Slavonia Massello (Durevole e caldo)</option>
                <option value="Noce Canaletto Scuro">Noce Canaletto Scuro (Elegante e raffinato)</option>
                <option value="Teak Nautico Trattato">Teak Nautico Trattato (Impermeabile idro)</option>
                <option value="Larice Alpino Stagionato">Larice Alpino Stagionato (Resistente outdoor)</option>
                <option value="Frassino Naturale Sbiancato">Frassino Naturale Sbiancato (Nordico moderno)</option>
                <option value="Betulla Multistrato Fenolico">Betulla Multistrato Fenolico (Rigido e stabile)</option>
              </select>
            </div>
          </div>

          {/* Step 4: Experience Level */}
          <div>
            <label className="block text-xs font-bold text-[#26343B] uppercase tracking-wider mb-2">
              {t.aiDesign.step4Title}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((lvl) => {
                const isSelected = experienceLevel === lvl;
                const label = {
                  beginner: 'Base',
                  intermediate: 'Medio',
                  advanced: 'Esperto',
                }[lvl];

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#26343B] text-[#F5F1E9] border-[#26343B] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E5DFD5] text-[#26343B]/70 hover:bg-[#F2ECE1]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-4 rounded-xl bg-[#26343B] text-[#F5F1E9] font-bold text-xs sm:text-sm hover:bg-[#1A242A] transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4 text-[#B79B76]" />
            <span>
              {isGenerating ? t.aiDesign.generating : t.aiDesign.generateButton}
            </span>
          </button>

          {/* Animation Progress indicators */}
          {isGenerating && (
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B79B76] animate-ping" />
                <span className="text-[#26343B] font-medium">
                  {generationStep === 1 && 'Calcolo della resistenza strutturale e flessione campata...'}
                  {generationStep === 2 && 'Ottimizzazione geometrica della distinta di taglio...'}
                  {generationStep === 3 && 'Finalizzazione schemi di incastro e distinta ferramenta...'}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Generated Executive Blueprint (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {hasResult && (
            <div className="bg-white rounded-3xl border border-[#E5DFD5] shadow-xs overflow-hidden">
              
              {/* Blueprint Header */}
              <div className="bg-[#26343B] text-[#F5F1E9] p-5 sm:p-7 relative">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-xs uppercase tracking-widest text-[#B79B76] font-mono">
                    BluePrint ID: CC-{width}x{depth}-{Math.floor(budget)}
                  </span>
                  <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-[#DAC9B2]">
                    Scala 1:1 millimetrico
                  </span>
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                  {description.slice(0, 50)}...
                </h2>
                <p className="text-xs text-[#F5F1E9]/80 mt-1">
                  Specifiche: {width} × {depth} × {height} cm · Essenza: {woodSpecies}
                </p>
              </div>

              {/* Economic Advantage / Estimated Savings Metric */}
              <div className="grid grid-cols-3 divide-x divide-[#E5DFD5] bg-[#FAF8F5] border-b border-[#E5DFD5] text-center py-3">
                <div className="px-2">
                  <span className="text-[10px] uppercase text-[#26343B]/60 font-semibold block">
                    Costo Materiali DIY
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-[#26343B]">
                    €{budget}
                  </span>
                </div>
                <div className="px-2">
                  <span className="text-[10px] uppercase text-[#26343B]/60 font-semibold block">
                    Negozio Design Equiv.
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-[#26343B]/70 line-through">
                    €{Math.round(budget * 2.8)}
                  </span>
                </div>
                <div className="px-2">
                  <span className="text-[10px] uppercase text-[#8F7451] font-semibold block">
                    Risparmio Stimato
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-[#8F7451]">
                    + €{Math.round(budget * 1.8)}
                  </span>
                </div>
              </div>

              {/* Millimetric Schematic Wireframe Preview */}
              <div className="p-5 sm:p-7 border-b border-[#F0EBE1]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-[#26343B] flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-[#B79B76]" />
                    <span>Quote Strutturali & Vista 3D Schematica</span>
                  </h3>
                  <span className="text-xs text-[#26343B]/50 font-mono">
                    {roomType}
                  </span>
                </div>

                {/* SVG Blueprint Wireframe */}
                <div className="relative bg-[#F5F1E9] rounded-2xl p-6 border border-[#E0D7C9] flex flex-col items-center justify-center min-h-[180px]">
                  <svg
                    viewBox="0 0 400 160"
                    className="w-full max-w-sm h-36 stroke-[#26343B] fill-none"
                    strokeWidth="1.5"
                  >
                    {/* Perspective Table top slab */}
                    <polygon
                      points="60,40 340,40 370,65 30,65"
                      className="fill-[#DAC9B2]/30 stroke-[#26343B]"
                      strokeWidth="2"
                    />
                    <polygon
                      points="30,65 370,65 370,72 30,72"
                      className="fill-[#B79B76]/50 stroke-[#26343B]"
                    />

                    {/* Legs Trapezoid */}
                    {/* Left Leg */}
                    <line x1="80" y1="72" x2="60" y2="145" strokeWidth="2.5" />
                    <line x1="120" y1="72" x2="100" y2="145" strokeWidth="2.5" />
                    <line x1="55" y1="145" x2="105" y2="145" strokeWidth="3" />

                    {/* Right Leg */}
                    <line x1="280" y1="72" x2="300" y2="145" strokeWidth="2.5" />
                    <line x1="320" y1="72" x2="340" y2="145" strokeWidth="2.5" />
                    <line x1="295" y1="145" x2="345" y2="145" strokeWidth="3" />

                    {/* Longitudinal brace underneath */}
                    <line x1="100" y1="85" x2="300" y2="85" strokeDasharray="3 3" />

                    {/* Dimension Indicators */}
                    <text x="180" y="32" className="text-[10px] font-mono fill-[#8F7451]" textAnchor="middle">
                      L: {width} cm
                    </text>
                    <text x="380" y="55" className="text-[10px] font-mono fill-[#8F7451]">
                      P: {depth} cm
                    </text>
                    <text x="355" y="115" className="text-[10px] font-mono fill-[#8F7451]">
                      H: {height} cm
                    </text>
                  </svg>

                  <div className="mt-2 text-center">
                    <span className="text-[11px] text-[#26343B]/60 font-medium">
                      Calcolo tolleranza ritiro naturale legno: ± 3 mm su larghezza totale
                    </span>
                  </div>
                </div>
              </div>

              {/* Distinta di Taglio (Cut List Table) */}
              <div className="p-5 sm:p-7 border-b border-[#F0EBE1]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#26343B] mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B79B76]" />
                  <span>{t.aiDesign.cutList}</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-[#E5DFD5]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF8F5] text-[#26343B]/70 font-semibold border-b border-[#E5DFD5]">
                      <tr>
                        <th className="p-2.5">Componente</th>
                        <th className="p-2.5">Quote (mm)</th>
                        <th className="p-2.5 text-center">Q.tà</th>
                        <th className="p-2.5">Materiale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EBE1]">
                      <tr>
                        <td className="p-2.5 font-medium text-[#26343B]">Doghe piano principale</td>
                        <td className="p-2.5 font-mono">{width * 10} × {Math.round((depth * 10) / 3)} × 42</td>
                        <td className="p-2.5 text-center font-bold">3</td>
                        <td className="p-2.5 text-[#26343B]/70">{woodSpecies}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-[#26343B]">Basamento a trapezio</td>
                        <td className="p-2.5 font-mono">{(height - 4) * 10} × {(depth - 15) * 10}</td>
                        <td className="p-2.5 text-center font-bold">2</td>
                        <td className="p-2.5 text-[#26343B]/70">Acciaio profilato 80x40mm</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-[#26343B]">Traversa inferiore di trazione</td>
                        <td className="p-2.5 font-mono">{(width - 40) * 10} × 40 × 40</td>
                        <td className="p-2.5 text-center font-bold">1</td>
                        <td className="p-2.5 text-[#26343B]/70">Acciaio con tiranti M10</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-[#26343B]">Biscotti lamello di unione</td>
                        <td className="p-2.5 font-mono">N. 20 (56 × 23 × 4)</td>
                        <td className="p-2.5 text-center font-bold">16</td>
                        <td className="p-2.5 text-[#26343B]/70">Faggio compresso</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step Roadmap */}
              <div className="p-5 sm:p-7 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#26343B] mb-2 flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-[#B79B76]" />
                  <span>Sequenza Operativa di Banco</span>
                </h3>

                <div className="space-y-2">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#26343B] text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <span className="font-bold text-[#26343B] block">Rettifica spigoli e fresatura biscotti</span>
                      <span className="text-[#26343B]/70 text-[11px]">Fresare le sedi n.20 ogni 22 cm lungo i bordi da incollare.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#26343B] text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      <span className="font-bold text-[#26343B] block">Serraggio con colla D4 poliuretanica</span>
                      <span className="text-[#26343B]/70 text-[11px]">Morsetti alternati sopra e sotto per evitare imbarcamento del piano.</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#26343B] text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <span className="font-bold text-[#26343B] block">Tagli di distensione e finitura a olio cera</span>
                      <span className="text-[#26343B]/70 text-[11px]">3 mani sottili di olio opaco dopo carteggiatura fino a grana 240.</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div className="pt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveToMyProjects}
                      className="px-5 py-2.5 rounded-xl bg-[#26343B] text-[#F5F1E9] font-bold text-xs sm:text-sm hover:bg-[#1A242A] transition-colors shadow-xs flex items-center gap-2 active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#B79B76]" />
                      <span>{t.aiDesign.saveToMyProjects}</span>
                    </button>
                    {savedSuccess && (
                      <span className="text-xs text-emerald-700 font-bold animate-in fade-in">
                        Progetto salvato!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-[#26343B]/70 hover:text-[#26343B] flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Stampa scheda</span>
                  </button>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
