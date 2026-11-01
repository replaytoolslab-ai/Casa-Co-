import React, { useState } from 'react';
import {
  Ruler,
  Box,
  Compass,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  Maximize2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { VisionStudioProject, RoomOpening, RoomWall } from '../../types';
import { Room3DCanvas } from './Room3DCanvas';
import { scan3dService } from '../../services/scan3dService';
import { Language, translations } from '../../i18n/translations';

interface Scan3dModeProps {
  project: VisionStudioProject;
  language: Language;
  onUpdateDimensions: (width: number, length: number, height: number) => void;
  onAddOpening: (opening: Omit<RoomOpening, 'id'>) => void;
  onRemoveOpening: (openingId: string) => void;
  onNavigateAssistant: () => void;
}

export const Scan3dMode: React.FC<Scan3dModeProps> = ({
  project,
  language,
  onUpdateDimensions,
  onAddOpening,
  onRemoveOpening,
  onNavigateAssistant,
}) => {
  const t = translations[language];
  const arStatus = scan3dService.checkArAvailability();
  const guideSteps = scan3dService.getGuideSteps();

  const [widthInput, setWidthInput] = useState<number>(project.scanData.width);
  const [lengthInput, setLengthInput] = useState<number>(project.scanData.length);
  const [heightInput, setHeightInput] = useState<number>(project.scanData.height);
  const [selectedWallIndex, setSelectedWallIndex] = useState<number>(0);
  const [activeStepTab, setActiveStepTab] = useState<number>(4);
  const [showAddOpeningModal, setShowAddOpeningModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // New Opening form state
  const [newOpeningType, setNewOpeningType] = useState<'door' | 'window'>('door');
  const [newOpeningWall, setNewOpeningWall] = useState<number>(0);
  const [newOpeningWidth, setNewOpeningWidth] = useState<number>(90);
  const [newOpeningHeight, setNewOpeningHeight] = useState<number>(215);
  const [newOpeningOffset, setNewOpeningOffset] = useState<number>(100);

  const geometryMetrics = scan3dService.calculateGeometry(widthInput, lengthInput, heightInput);

  const handleApplyDimensions = () => {
    onUpdateDimensions(widthInput, lengthInput, heightInput);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleCreateOpening = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOpening({
      type: newOpeningType,
      wallIndex: newOpeningWall,
      width: newOpeningWidth,
      height: newOpeningHeight,
      offset: newOpeningOffset,
    });
    setShowAddOpeningModal(false);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B79B76]/15 text-[#8F7451] text-xs font-bold uppercase tracking-wider mb-2">
            <Box className="w-3.5 h-3.5 text-[#B79B76]" />
            <span>Modalità 2 · Rilievo Tridimensionale & Misure</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
            Scan 3D — Rilievo Parametrico del Locale
          </h1>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl leading-relaxed">
            Esplora l'anteprima volumetrica in Three.js, visualizza quote millimetriche e correggi manualmente pareti, porte e finestre.
          </p>
        </div>

        <button
          onClick={onNavigateAssistant}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-[#26343B] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
        >
          <span>Passa all’Assistant AI</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8F7451]" />
        </button>
      </div>

      {/* Prominent Demo Notice Banner (Required by user prompt) */}
      <div className="bg-[#FAF8F5] border-l-4 border-[#B79B76] p-4 sm:p-5 rounded-r-2xl border-y border-r border-[#E5DFD5] shadow-xs flex items-start gap-3.5">
        <div className="p-2 bg-[#B79B76]/15 text-[#8F7451] rounded-xl flex-shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm leading-relaxed text-[#26343B]">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-[#26343B]">
              MODALITÀ DIMOSTRATIVA RILIEVO 3D
            </span>
            <span className="text-[10px] bg-[#26343B] text-white px-2 py-0.5 rounded-md font-mono">
              ARKit & ARCore Ready
            </span>
          </div>
          <p className="text-[#26343B]/80">
            {arStatus.notice}
          </p>
        </div>
      </div>

      {/* Step 1: Guided Scan Sequence Cards */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0EBE1]">
          <h2 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#B79B76]" />
            <span>Fasi della Scansione Spaziale Guidata</span>
          </h2>
          <span className="text-xs text-[#8F7451] font-semibold">
            Calibrazione completata: 94%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {guideSteps.map((step) => {
            const isCompleted = step.stepIndex <= activeStepTab;
            return (
              <div
                key={step.stepIndex}
                onClick={() => setActiveStepTab(step.stepIndex)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isCompleted
                    ? 'bg-[#FAF8F5] border-[#B79B76]/50'
                    : 'bg-white border-[#E5DFD5] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-[#8F7451]">
                    Passo {step.stepIndex}
                  </span>
                  <CheckCircle2
                    className={`w-4 h-4 ${isCompleted ? 'text-[#8F7451]' : 'text-[#26343B]/30'}`}
                  />
                </div>
                <h3 className="font-bold text-xs text-[#26343B] leading-tight mb-1">
                  {step.title}
                </h3>
                <p className="text-[11px] text-[#26343B]/70 leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Interactive Three.js 3D Viewport */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
          <div>
            <h2 className="min-w-0 font-serif text-xl font-bold text-[#26343B] flex items-center gap-2">
              <Box className="w-5 h-5 text-[#B79B76]" />
              <span>Anteprima Tridimensionale Interattiva</span>
            </h2>
            <p className="text-xs text-[#26343B]/70 mt-0.5">
              Visualizzazione parametrica con linee di quota, spessori pareti e forometrie.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#26343B]/60 font-medium hidden sm:inline">
              Parete attiva: Parete {selectedWallIndex + 1}
            </span>
          </div>
        </div>

        {/* 3D Canvas component */}
        <Room3DCanvas
          scanData={project.scanData}
          activeWallIndex={selectedWallIndex}
          onSelectWall={(idx) => setSelectedWallIndex(idx)}
        />
      </div>

      {/* Step 3: Manual Dimension Controls & Recalculation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Form (6 cols on lg) */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
            <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
              <Ruler className="w-5 h-5 text-[#B79B76]" />
              <span>Inserimento & Correzione Manuale Quote</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 min-[520px]:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#26343B]/70 uppercase tracking-wider mb-1">
                Larghezza (cm)
              </label>
              <input
                type="number"
                min="100"
                max="2000"
                step="5"
                value={widthInput}
                onChange={(e) => setWidthInput(Number(e.target.value))}
                className="w-full p-2.5 text-center text-sm font-bold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
              />
              <span className="block text-center text-[10px] text-[#26343B]/50 mt-1">
                {(widthInput / 100).toFixed(2)} metri
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#26343B]/70 uppercase tracking-wider mb-1">
                Lunghezza (cm)
              </label>
              <input
                type="number"
                min="100"
                max="2000"
                step="5"
                value={lengthInput}
                onChange={(e) => setLengthInput(Number(e.target.value))}
                className="w-full p-2.5 text-center text-sm font-bold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
              />
              <span className="block text-center text-[10px] text-[#26343B]/50 mt-1">
                {(lengthInput / 100).toFixed(2)} metri
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#26343B]/70 uppercase tracking-wider mb-1">
                Altezza (cm)
              </label>
              <input
                type="number"
                min="180"
                max="600"
                step="5"
                value={heightInput}
                onChange={(e) => setHeightInput(Number(e.target.value))}
                className="w-full p-2.5 text-center text-sm font-bold bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
              />
              <span className="block text-center text-[10px] text-[#26343B]/50 mt-1">
                {(heightInput / 100).toFixed(2)} metri
              </span>
            </div>
          </div>

          <button
            onClick={handleApplyDimensions}
            className="w-full py-3 px-4 rounded-xl bg-[#26343B] text-[#F5F1E9] text-xs sm:text-sm font-bold hover:bg-[#1A242A] transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-[#B79B76]" />
            <span>Applica & Ricalcola Geometria Progetto</span>
          </button>

          {/* Computed Metrics Cards */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F0EBE1]">
            <div className="p-3 bg-[#FAF8F5] rounded-xl text-center">
              <span className="text-[10px] text-[#26343B]/60 font-semibold uppercase block mb-0.5">
                Superficie Calpestabile
              </span>
              <span className="font-serif text-lg font-bold text-[#26343B]">
                {geometryMetrics.areaSqM} m²
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl text-center">
              <span className="text-[10px] text-[#26343B]/60 font-semibold uppercase block mb-0.5">
                Volume della Stanza
              </span>
              <span className="font-serif text-lg font-bold text-[#26343B]">
                {geometryMetrics.volumeCuM} m³
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl text-center">
              <span className="text-[10px] text-[#26343B]/60 font-semibold uppercase block mb-0.5">
                Sviluppo Perimetro
              </span>
              <span className="font-serif text-lg font-bold text-[#26343B]">
                {geometryMetrics.perimeterM} m lineari
              </span>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl text-center">
              <span className="text-[10px] text-[#26343B]/60 font-semibold uppercase block mb-0.5">
                Superficie Pareti
              </span>
              <span className="font-serif text-lg font-bold text-[#26343B]">
                {geometryMetrics.wallAreaSqM} m²
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Walls & Openings (Doors / Windows) (6 cols on lg) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Pareti (Walls list) */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2 pb-2 border-b border-[#F0EBE1]">
              <Layers className="w-5 h-5 text-[#B79B76]" />
              <span>Configurazione Pareti (4 Lati)</span>
            </h3>

            <div className="space-y-2">
              {project.scanData.walls.map((wall, idx) => (
                <div
                  key={wall.id}
                  onClick={() => setSelectedWallIndex(idx)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedWallIndex === idx
                      ? 'bg-[#FAF8F5] border-[#B79B76] shadow-2xs'
                      : 'bg-white border-[#E5DFD5] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-[#26343B] text-white text-xs font-bold flex items-center justify-center">
                      {wall.orientation[0]}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-[#26343B] block">
                        Parete {wall.orientation} (L: {(wall.length / 100).toFixed(2)}m)
                      </span>
                      <span className="text-[11px] text-[#26343B]/60">
                        Finitura: {wall.finish}
                      </span>
                    </div>
                  </div>

                  {wall.hasAccentFeature && (
                    <span className="text-[10px] bg-[#B79B76]/15 text-[#8F7451] font-bold px-2 py-0.5 rounded-full">
                      Accent Wall
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Aperture (Doors & Windows) */}
          <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0EBE1]">
              <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-[#B79B76]" />
                <span>Porte & Finestre Rilevate ({project.scanData.openings.length})</span>
              </h3>
              <button
                onClick={() => setShowAddOpeningModal(true)}
                className="text-xs font-semibold text-[#8F7451] hover:text-[#26343B] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi apertura</span>
              </button>
            </div>

            <div className="space-y-2">
              {project.scanData.openings.map((op) => {
                const wallNames = ['Nord', 'Est', 'Sud', 'Ovest'];
                return (
                  <div
                    key={op.id}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#26343B] block">
                        {op.type === 'door' ? 'Porta d’accesso' : 'Finestra / Vetratura'} — Parete {wallNames[op.wallIndex]}
                      </span>
                      <span className="text-[11px] text-[#26343B]/60">
                        Luce netta: {op.width} × {op.height} cm · Distanza da spigolo: {op.offset} cm
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveOpening(op.id)}
                      className="p-1.5 text-[#26343B]/40 hover:text-red-700 transition-colors"
                      title="Rimuovi apertura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Add Opening Modal */}
      {showAddOpeningModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl border border-[#E5DFD5] shadow-2xl p-6 text-[#26343B]">
            <h3 className="font-serif text-xl font-bold mb-3">
              Nuova Apertura Spaziale
            </h3>

            <form onSubmit={handleCreateOpening} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Tipologia</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewOpeningType('door')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      newOpeningType === 'door'
                        ? 'bg-[#26343B] text-white border-[#26343B]'
                        : 'bg-white border-[#E5DFD5] text-[#26343B]/70'
                    }`}
                  >
                    Porta
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewOpeningType('window')}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      newOpeningType === 'window'
                        ? 'bg-[#26343B] text-white border-[#26343B]'
                        : 'bg-white border-[#E5DFD5] text-[#26343B]/70'
                    }`}
                  >
                    Finestra
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Parete di Collocazione</label>
                <select
                  value={newOpeningWall}
                  onChange={(e) => setNewOpeningWall(Number(e.target.value))}
                  className="w-full p-2.5 text-xs bg-white border border-[#E5DFD5] rounded-xl outline-none"
                >
                  <option value={0}>Parete Nord</option>
                  <option value={1}>Parete Est</option>
                  <option value={2}>Parete Sud</option>
                  <option value={3}>Parete Ovest</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#26343B]/70 mb-1">Larghezza (cm)</label>
                  <input
                    type="number"
                    value={newOpeningWidth}
                    onChange={(e) => setNewOpeningWidth(Number(e.target.value))}
                    className="w-full p-2 text-xs font-bold bg-white border border-[#E5DFD5] rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#26343B]/70 mb-1">Altezza (cm)</label>
                  <input
                    type="number"
                    value={newOpeningHeight}
                    onChange={(e) => setNewOpeningHeight(Number(e.target.value))}
                    className="w-full p-2 text-xs font-bold bg-white border border-[#E5DFD5] rounded-xl text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#26343B]/70 mb-1">Offset (cm)</label>
                  <input
                    type="number"
                    value={newOpeningOffset}
                    onChange={(e) => setNewOpeningOffset(Number(e.target.value))}
                    className="w-full p-2 text-xs font-bold bg-white border border-[#E5DFD5] rounded-xl text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddOpeningModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#26343B]/70 hover:text-[#26343B]"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#26343B] text-white text-xs font-bold rounded-xl"
                >
                  Inserisci nel Modello
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {saveToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#26343B] text-[#F5F1E9] px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-[#B79B76]" />
          <span>Dimensioni e quote aggiornate in tutto il progetto!</span>
        </div>
      )}

    </div>
  );
};
