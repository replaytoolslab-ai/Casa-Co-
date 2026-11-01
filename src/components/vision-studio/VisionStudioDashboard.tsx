import React from 'react';
import {
  Sparkles,
  Box,
  MessageSquare,
  ArrowRight,
  Ruler,
  Euro,
  CheckCircle2,
  Layers,
  Camera,
  Calendar,
  CheckSquare,
  ShieldCheck,
  Compass,
  SlidersHorizontal,
} from 'lucide-react';
import { VisionStudioProject, VisionStudioMode } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { PRESET_VISION_PROJECTS, projectService } from '../../services/projectService';
import { ChevronDown } from 'lucide-react';

interface VisionStudioDashboardProps {
  project: VisionStudioProject;
  language: Language;
  onSelectMode: (mode: VisionStudioMode) => void;
}

export const VisionStudioDashboard: React.FC<VisionStudioDashboardProps> = ({
  project,
  language,
  onSelectMode,
}) => {
  const t = translations[language];
  const [isSwitcherOpen, setIsSwitcherOpen] = React.useState(false);

  const completedChecklistCount = project.checklist.filter((i) => i.completed).length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Brand Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#26343B] text-[#B79B76] text-xs font-bold uppercase tracking-wider mb-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B79B76]" />
            <span>Nuovo Cuore Tecnologico</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#26343B] tracking-tight">
            CASA&CO. VISION STUDIO<span className="text-[#B79B76]">.</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl font-normal leading-relaxed">
            La piattaforma integrata per concepire, misurare in 3D e governare cantieri di ristrutturazione ed ebanisteria in un unico progetto unificato.
          </p>
        </div>

        {/* Project switcher dropdown */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            className="flex items-center gap-2.5 bg-white hover:bg-[#FAF8F5] px-3.5 py-2 rounded-2xl border border-[#E5DFD5] shadow-xs transition-colors cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-left">
              <span className="text-[10px] text-[#26343B]/60 uppercase font-bold block leading-none">
                Progetto Attivo
              </span>
              <span className="block max-w-[min(62vw,260px)] whitespace-normal break-words text-xs font-bold leading-snug text-[#26343B] sm:max-w-[220px]">
                {project.name}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#26343B]/50 ml-1" />
          </button>

          {isSwitcherOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E5DFD5] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#26343B]/50 border-b border-[#F0EBE1]">
                Cambia Progetto Vision
              </div>
              <div className="mt-1 space-y-1">
                {PRESET_VISION_PROJECTS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      projectService.loadProject(preset);
                      setIsSwitcherOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      preset.id === project.id
                        ? 'bg-[#26343B] text-[#F5F1E9] font-semibold'
                        : 'text-[#26343B] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div>
                      <div className="truncate font-medium">{preset.name}</div>
                      <div className="text-[10px] opacity-70">{preset.roomType} · {preset.progress}%</div>
                    </div>
                    {preset.id === project.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Unified Project Hero Showcase */}
      <section className="relative rounded-3xl sm:rounded-4xl overflow-hidden border border-[#E5DFD5] bg-[#26343B] text-[#F5F1E9] shadow-xl">
        <div className="relative aspect-16/9 sm:aspect-21/9 lg:aspect-24/9 w-full">
          <img
            src={project.mainImage}
            alt={project.name}
            className="w-full h-full object-cover opacity-75 transition-transform duration-1000 hover:scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#26343B] via-[#26343B]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#26343B]/90 via-[#26343B]/40 to-transparent" />

          {/* Overlay Info */}
          <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#B79B76]">
                Progetto Unificato · ID {project.id}
              </span>
              <span className="text-[#DAC9B2]">·</span>
              <span className="text-xs text-white/80">{project.lastModified}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 text-[#F5F1E9] leading-tight">
              {project.name}
            </h2>

            {/* Progress Bar inside Hero */}
            <div className="w-full max-w-md bg-white/20 backdrop-blur-xs h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#B79B76] h-full rounded-full transition-all duration-700"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between max-w-md text-xs text-white/80 font-medium">
              <span>Avanzamento Cantiere</span>
              <span className="font-bold text-[#DAC9B2]">{project.progress}%</span>
            </div>
          </div>
        </div>

        {/* Unified Project Metrics Bar (Crucial requirement from prompt) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#37474F] bg-[#1A242A] border-t border-[#37474F] text-center p-3 sm:p-4">
          
          <div className="p-2 sm:p-3">
            <span className="text-[10px] uppercase font-bold text-[#F5F1E9]/60 block mb-0.5">
              Misure & Superficie
            </span>
            <span className="font-serif text-base sm:text-lg font-bold text-[#F5F1E9]">
              {project.scanData.squareMeters} m²
            </span>
            <span className="text-[10px] text-[#DAC9B2] block">
              {(project.scanData.width / 100).toFixed(2)}m × {(project.scanData.length / 100).toFixed(2)}m
            </span>
          </div>

          <div className="p-2 sm:p-3">
            <span className="text-[10px] uppercase font-bold text-[#F5F1E9]/60 block mb-0.5">
              Budget & Costo Previsto
            </span>
            <span className="font-serif text-base sm:text-lg font-bold text-[#F5F1E9]">
              €{project.budget.spent} / €{project.budget.target}
            </span>
            <span className="text-[10px] text-[#DAC9B2] block">
              Stima finita: €{project.budget.estimatedTotal}
            </span>
          </div>

          <div className="p-2 sm:p-3">
            <span className="text-[10px] uppercase font-bold text-[#F5F1E9]/60 block mb-0.5">
              Materiali Censiti
            </span>
            <span className="font-serif text-base sm:text-lg font-bold text-[#F5F1E9]">
              {project.materials.length} articoli
            </span>
            <span className="text-[10px] text-emerald-400 block">
              {project.materials.filter((m) => m.status === 'received').length} già in cantiere
            </span>
          </div>

          <div className="p-2 sm:p-3">
            <span className="text-[10px] uppercase font-bold text-[#F5F1E9]/60 block mb-0.5">
              Attività Completate
            </span>
            <span className="font-serif text-base sm:text-lg font-bold text-[#F5F1E9]">
              {completedChecklistCount} su {project.checklist.length}
            </span>
            <span className="text-[10px] text-[#DAC9B2] block">
              Fase 2 attiva
            </span>
          </div>

        </div>
      </section>

      {/* The 3 Central Integrated Modes Cards */}
      <section className="space-y-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
            Accesso Rapido agli Strumenti
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
            Le Tre Modalità Esecutive di Vision Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
            Scegli da dove iniziare: ogni strumento ha una funzione precisa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: VISION AI */}
          <div
            onClick={() => onSelectMode('vision-ai')}
            className="group cursor-pointer rounded-3xl bg-white border border-[#E5DFD5] overflow-hidden hover:shadow-xl hover:border-[#B79B76] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-16/10 w-full overflow-hidden bg-[#EAE4D8] relative">
                <img
                  src={project.proposals[0].image}
                  alt="Vision AI"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-xs text-[#26343B] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#8F7451]" />
                </div>
                <div className="absolute top-3.5 right-3.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-semibold">
                  3 Proposte Visive
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B79B76]">
                    MODALITÀ 1
                  </span>
                  <h3 className="font-serif text-xl font-bold">
                    VISION AI
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs sm:text-sm text-[#26343B]/80 leading-relaxed mb-4">
                  Carica una foto, prova uno stile e confronta il prima e il dopo.
                </p>

                <div className="space-y-1.5 text-xs text-[#26343B]/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76]" />
                    <span>Confronto continuo prima/dopo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76]" />
                    <span>Stili Japandi, Minimal e Mediterraneo</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectMode('vision-ai')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] group-hover:bg-[#26343B] text-[#26343B] group-hover:text-[#F5F1E9] text-xs font-bold transition-all flex items-center justify-between border border-[#E5DFD5] group-hover:border-[#26343B]"
              >
                <span>Avvia Vision AI</span>
                <ArrowRight className="w-4 h-4 text-[#8F7451]" />
              </button>
            </div>
          </div>

          {/* Card 2: SCAN 3D */}
          <div
            onClick={() => onSelectMode('scan-3d')}
            className="group cursor-pointer rounded-3xl bg-white border border-[#E5DFD5] overflow-hidden hover:shadow-xl hover:border-[#B79B76] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-16/10 w-full overflow-hidden bg-[#26343B] relative flex items-center justify-center p-4">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
                  alt="Scan 3D"
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-xs text-[#26343B] flex items-center justify-center shadow-xs">
                  <Box className="w-5 h-5 text-[#8F7451]" />
                </div>
                <div className="absolute top-3.5 right-3.5 bg-[#B79B76] px-2.5 py-1 rounded-full text-white text-[11px] font-semibold">
                  Three.js 3D Viewport
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B79B76]">
                    MODALITÀ 2
                  </span>
                  <h3 className="font-serif text-xl font-bold">
                    SCAN 3D
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs sm:text-sm text-[#26343B]/80 leading-relaxed mb-4">
                  Visualizza il locale in 3D e modifica manualmente misure, pareti, porte e finestre. La scansione AR automatica non è disponibile nella versione web.
                </p>

                <div className="space-y-1.5 text-xs text-[#26343B]/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76]" />
                    <span>Vista 3D Isometrica & Pianta 2D</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76]" />
                    <span>Misure inserite e modificabili manualmente</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectMode('scan-3d')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] group-hover:bg-[#26343B] text-[#26343B] group-hover:text-[#F5F1E9] text-xs font-bold transition-all flex items-center justify-between border border-[#E5DFD5] group-hover:border-[#26343B]"
              >
                <span>Apri Rilievo 3D</span>
                <ArrowRight className="w-4 h-4 text-[#8F7451]" />
              </button>
            </div>
          </div>

          {/* Card 3: ASSISTANT AI */}
          <div
            onClick={() => onSelectMode('assistant-ai')}
            className="group cursor-pointer rounded-3xl bg-white border border-[#E5DFD5] overflow-hidden hover:shadow-xl hover:border-[#B79B76] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="aspect-16/10 w-full overflow-hidden bg-[#EAE4D8] relative">
                <img
                  src="https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=800&q=80"
                  alt="Assistant AI"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl bg-white/95 backdrop-blur-xs text-[#26343B] flex items-center justify-center shadow-xs">
                  <MessageSquare className="w-5 h-5 text-[#8F7451]" />
                </div>
                <div className="absolute top-3.5 right-3.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-semibold">
                  Guida Cantiere H24
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B79B76]">
                    MODALITÀ 3
                  </span>
                  <h3 className="font-serif text-xl font-bold">
                    ASSISTANT AI
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <p className="text-xs sm:text-sm text-[#26343B]/80 leading-relaxed mb-4">
                  Chiedi aiuto sui lavori, consulta le istruzioni, aggiorna la checklist e verifica gli avvisi di sicurezza.
                </p>

                <div className="space-y-1.5 text-xs text-[#26343B]/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76]" />
                    <span>Protocolli di sicurezza DPI integrati</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76]" />
                    <span>Diario fotografico e cronistoria</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => onSelectMode('assistant-ai')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] group-hover:bg-[#26343B] text-[#26343B] group-hover:text-[#F5F1E9] text-xs font-bold transition-all flex items-center justify-between border border-[#E5DFD5] group-hover:border-[#26343B]"
              >
                <span>Avvia Assistente Cantiere</span>
                <ArrowRight className="w-4 h-4 text-[#8F7451]" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Materials & Diary Quick Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distinta Materiali */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#B79B76]" />
              <span>Distinta Materiali del Cantiere</span>
            </h3>
            <span className="text-xs text-[#8F7451] font-semibold">
              Totale stimato: €{project.budget.estimatedTotal}
            </span>
          </div>

          <div className="space-y-2">
            {project.materials.map((mat) => (
              <div
                key={mat.id}
                className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#26343B] block">
                    {mat.name}
                  </span>
                  <span className="text-[11px] text-[#26343B]/60">
                    Quantità: {mat.quantity}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#26343B] block">
                    €{mat.cost}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      mat.status === 'received'
                        ? 'bg-emerald-100 text-emerald-800'
                        : mat.status === 'ordered'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {mat.status === 'received' ? 'In cantiere' : mat.status === 'ordered' ? 'Ordinato' : 'Da ordinare'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Diary Snapshot */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#B79B76]" />
              <span>Diario Fotografico Recente</span>
            </h3>
            <button
              onClick={() => onSelectMode('assistant-ai')}
              className="text-xs font-semibold text-[#8F7451] hover:text-[#26343B]"
            >
              Apri diario completo →
            </button>
          </div>

          <div className="space-y-3">
            {project.photoDiary.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EAE4D8] flex gap-3.5 items-center"
              >
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover border border-[#E5DFD5] flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[10px] text-[#26343B]/60 mb-0.5">
                    <span className="font-bold text-[#8F7451]">{item.phase}</span>
                    <span>{item.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#26343B] leading-snug line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#26343B]/70 line-clamp-2 mt-0.5">
                    {item.notes}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};
