import React, { useState } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  Check,
  Sliders,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { VisionStudioProject, VisionProposal } from '../../types';
import { aiVisionService, DEMO_ROOM_IMAGES } from '../../services/aiVisionService';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { Language, translations } from '../../i18n/translations';

interface VisionAiModeProps {
  project: VisionStudioProject;
  language: Language;
  onUpdateProject: (updates: Partial<VisionStudioProject>) => void;
  onUpdateCustomizations: (customs: Partial<VisionStudioProject['customizations']>) => void;
  onNavigateScan3D: () => void;
}

export const VisionAiMode: React.FC<VisionAiModeProps> = ({
  project,
  language,
  onUpdateProject,
  onUpdateCustomizations,
  onNavigateScan3D,
}) => {
  const t = translations[language];
  const styles = aiVisionService.getStyles();

  const [selectedStyleId, setSelectedStyleId] = useState<string>('japandi');
  const [selectedRoomType, setSelectedRoomType] = useState<string>(project.roomType);
  const [activeBeforeImage, setActiveBeforeImage] = useState<string>(project.beforeImage);
  const [activeProposal, setActiveProposal] = useState<VisionProposal>(
    project.proposals.find((p) => p.id === project.activeProposalId) || project.proposals[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccessToast, setSavedSuccessToast] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [sourceImageData, setSourceImageData] = useState<string | null>(null);

  const readImage = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Impossibile leggere la fotografia.'));
    reader.readAsDataURL(file);
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setServiceError('Formato non supportato. Usa JPG, PNG o WebP.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setServiceError('La fotografia supera 3 MB. Riduci la dimensione e riprova.');
      return;
    }
    try {
      const dataUrl = await readImage(file);
      setSourceImageData(dataUrl);
      setActiveBeforeImage(dataUrl);
      setServiceError('');
      onUpdateProject({ beforeImage: dataUrl });
    } catch {
      setServiceError('Non è stato possibile caricare la fotografia.');
    }
    e.target.value = '';
  };

  const handleSelectDemoImage = (imgUrl: string, room: string) => {
    setActiveBeforeImage(imgUrl);
    setSelectedRoomType(room);
    onUpdateProject({ beforeImage: imgUrl, roomType: room });
  };

  const handleSelectProposal = (proposal: VisionProposal) => {
    setActiveProposal(proposal);
    onUpdateProject({
      activeProposalId: proposal.id,
      mainImage: proposal.image,
    });
    setSavedSuccessToast(true);
    setTimeout(() => setSavedSuccessToast(false), 2500);
  };

  const handleGenerateNew = async (styleId = selectedStyleId) => {
    setIsGenerating(true);
    setServiceError('');
    try {
      const selectedStyle = styles.find((style) => style.id === styleId) || styles[0];
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: selectedStyle.name[language],
          roomType: selectedRoomType,
          customizations: Object.entries(project.customizations).filter(([, enabled]) => enabled).map(([key]) => key),
          image: sourceImageData ? {
            mimeType: sourceImageData.slice(5, sourceImageData.indexOf(';')),
            data: sourceImageData.split(',')[1]
          } : undefined
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Generazione non riuscita.');
      const generated = aiVisionService.generateProposalsForStyle(styleId, selectedRoomType);
      const realProposal = { ...generated[0], id: `ai-${Date.now()}`, image: result.image, title: `Rendering AI — ${selectedStyle.name[language]}` };
      const newProposals = [realProposal, ...project.proposals.slice(1, 3)];
      onUpdateProject({
        proposals: newProposals,
        activeProposalId: realProposal.id,
        mainImage: realProposal.image,
        beforeImage: activeBeforeImage,
      });
      setActiveProposal(realProposal);
      setSavedSuccessToast(true);
      window.setTimeout(() => setSavedSuccessToast(false), 2500);
    } catch (error) {
      setServiceError(error instanceof Error ? error.message : 'Errore durante la generazione AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B79B76]/15 text-[#8F7451] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B79B76]" />
            <span>Modalità 1 · Rendering Architettonico & Visione</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
            Vision AI — Riprogettazione dello Spazio
          </h1>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl leading-relaxed">
            Carica la fotografia del tuo locale allo stato grezzo, scegli stile e finiture: confronta il rendering fotorealistico con lo slider interattivo prima/dopo.
          </p>
        </div>

        <button
          onClick={onNavigateScan3D}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5DFD5] text-[#26343B] text-xs font-semibold hover:bg-[#FAF8F5] transition-colors"
        >
          <span>Passa a Rilievo Scan 3D</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#8F7451]" />
        </button>
      </div>

      {/* Step 1: Photo Acquisition & Ambient Selection */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-5">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0EBE1]">
          <h2 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#B79B76]" />
            <span>1. Fotografia della Stanza & Ambiente</span>
          </h2>
          <span className="text-xs text-[#26343B]/60 font-medium">
            Progetto collegato: <strong className="text-[#26343B]">{project.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* Upload Area */}
          <div className="md:col-span-6">
            <label className="relative flex min-h-[220px] min-w-0 flex-col items-center justify-center p-5 sm:p-6 border-2 border-dashed border-[#B79B76]/40 hover:border-[#B79B76] rounded-2xl bg-[#FAF8F5] cursor-pointer transition-colors group text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E5DFD5] text-[#8F7451] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-xs">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[#26343B] mb-0.5">
                Carica o scatta foto della stanza
              </span>
              <span className="text-[11px] text-[#26343B]/60">
                Supporta JPG, PNG, HEIC da fotocamera o rullino
              </span>
            </label>
          </div>

          {/* Quick Demo Samples */}
          <div className="md:col-span-6 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#26343B]/70 block">
              Oppure prova una stanza dimostrativa pronta:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ROOM_IMAGES.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectDemoImage(demo.url, demo.roomType)}
                  className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 text-left transition-all ${
                    activeBeforeImage === demo.url
                      ? 'border-[#B79B76] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={demo.url} alt={demo.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                    <span className="text-[10px] text-white font-medium line-clamp-1 leading-tight">
                      {demo.roomType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {serviceError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">{serviceError}</div>}

      {/* Step 2: Style Preset Selector */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
          <h2 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#B79B76]" />
            <span>2. Selezione dell’Identità di Stile</span>
          </h2>
          <button
            onClick={handleGenerateNew}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#26343B] text-[#F5F1E9] rounded-xl text-xs font-semibold hover:bg-[#1A242A] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Rendering in corso...' : 'Ricalcola Proposte'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {styles.map((style) => {
            const isSelected = selectedStyleId === style.id;
            return (
              <div
                key={style.id}
                onClick={() => {
                  setSelectedStyleId(style.id);
                  handleGenerateNew(style.id);
                }}
                className={`cursor-pointer rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#B79B76] ring-2 ring-[#B79B76]/30 shadow-md bg-[#FAF8F5]'
                    : 'border-[#E5DFD5] bg-white hover:border-[#B79B76]/50'
                }`}
              >
                <div className="aspect-16/10 w-full overflow-hidden bg-[#EAE4D8] relative">
                  <img
                    src={style.thumbnail}
                    alt={style.name.it}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-[#26343B] text-white p-1 rounded-full shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#26343B] mb-1">
                      {style.name.it}
                    </h3>
                    <p className="text-xs text-[#26343B]/70 line-clamp-2 leading-relaxed mb-2.5">
                      {style.description.it}
                    </p>
                  </div>

                  {/* Palette Swatches */}
                  <div className="flex items-center gap-1 pt-2 border-t border-[#F0EBE1]">
                    {style.palette.map((color, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <span className="text-[10px] text-[#26343B]/50 ml-1 truncate">
                      {style.keyMaterials[0]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Interactive Before / After Comparison */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#26343B] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#B79B76]" />
              <span>3. Confronto Interattivo Prima / Dopo</span>
            </h2>
            <p className="text-xs text-[#26343B]/70 mt-0.5">
              Trascina il cursore per osservare la metamorfosi tra il locale grezzo e la proposta selezionata.
            </p>
          </div>

          <span className="text-xs font-bold text-[#8F7451] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EAE4D8]">
            {activeProposal.title.split('—')[0]}
          </span>
        </div>

        {/* The Drag Slider */}
        <BeforeAfterSlider
          beforeImage={activeBeforeImage}
          afterImage={activeProposal.image}
          beforeLabel="Stato Grezzo / Rilievo"
          afterLabel={activeProposal.title}
        />
      </div>

      {/* Step 4: 3 Visual Proposals & Selection */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#26343B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B79B76]" />
              <span>4. Tre Proposte Visive della Redazione</span>
            </h2>
            <p className="text-xs text-[#26343B]/70 mt-0.5">
              Seleziona la variante che desideri impostare come render ufficiale del progetto.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {project.proposals.map((prop) => {
            const isSelected = activeProposal.id === prop.id;
            return (
              <div
                key={prop.id}
                className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#B79B76] ring-2 ring-[#B79B76]/30 shadow-lg bg-[#FAF8F5]'
                    : 'border-[#E5DFD5] bg-white hover:border-[#B79B76]/50'
                }`}
              >
                <div className="aspect-16/10 w-full overflow-hidden bg-[#EAE4D8] relative">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-bold text-[#26343B]">
                    {prop.estimatedCost}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#26343B] mb-1.5">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[#26343B]/80 leading-relaxed mb-3">
                      {prop.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {prop.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-[#26343B]/70">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B79B76] flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectProposal(prop)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#26343B] text-white shadow-xs'
                        : 'bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#26343B] border border-[#E5DFD5]'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <Check className="w-4 h-4 text-[#B79B76]" />
                        <span>Render Ufficiale Selezionato</span>
                      </>
                    ) : (
                      <span>Imposta come Render del Progetto</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 5: Real-time Customizations */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
          <h2 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#B79B76]" />
            <span>5. Personalizzazione Elementi Architettonici</span>
          </h2>
          <span className="text-xs text-[#8F7451] font-semibold">
            Modifiche sincronizzate col cantiere
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: 'woodSlats' as const,
              label: 'Parete Cannettata in Noce Canaletto',
              desc: 'Listelli verticali fonoassorbenti con feltro nero',
            },
            {
              id: 'ledChannel' as const,
              label: 'Canalina LED 24V a Gola Continua (2700K)',
              desc: 'Illuminazione architetturale indiretta a soffitto',
            },
            {
              id: 'microcementFloor' as const,
              label: 'Pavimentazione Continua in Microcemento',
              desc: 'Superficie monolitica idrorepellente senza fughe',
            },
            {
              id: 'accentWall' as const,
              label: 'Trattamento a Calce Minerale & Marmorino',
              desc: 'Superficie traspirante naturale spatolata a mano',
            },
            {
              id: 'suspendedFixtures' as const,
              label: 'Mobili Sospesi con Taglio a 45°',
              desc: 'Scocca a filo muro senza piedini a vista',
            },
          ].map((item) => {
            const isChecked = project.customizations[item.id];
            return (
              <button
                key={item.id}
                onClick={() => onUpdateCustomizations({ [item.id]: !isChecked })}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  isChecked
                    ? 'bg-[#FAF8F5] border-[#B79B76] shadow-2xs'
                    : 'bg-white border-[#E5DFD5] opacity-75 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isChecked
                      ? 'bg-[#26343B] border-[#26343B] text-white'
                      : 'bg-white border-[#E5DFD5]'
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#26343B] leading-tight mb-0.5">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-[#26343B]/60 leading-tight">
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Feedback */}
      {savedSuccessToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#26343B] text-[#F5F1E9] px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-[#B79B76]" />
          <span>Proposta impostata come render principale del progetto!</span>
        </div>
      )}

    </div>
  );
};
