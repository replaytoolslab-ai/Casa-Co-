import React, { useState } from 'react';
import { X, Sparkles, Hammer, Plus, ArrowRight } from 'lucide-react';
import { CategoryId, UserProject } from '../types';
import { Language, translations } from '../i18n/translations';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onNavigateAi: () => void;
  onNavigateVision?: () => void;
  onAddCustomProject: (project: UserProject) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateAi,
  onNavigateVision,
  onAddCustomProject,
}) => {
  if (!isOpen) return null;

  const t = translations[language];
  const [activeMode, setActiveMode] = useState<'choose' | 'manual'>('choose');
  const [manualTitle, setManualTitle] = useState('');
  const [manualCategory, setManualCategory] = useState<CategoryId>('mobili');
  const [manualBudget, setManualBudget] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const newProj: UserProject = {
      id: `custom-${Date.now()}`,
      title: manualTitle.trim(),
      category: manualCategory,
      coverImage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
      progress: 0,
      status: 'in_progress',
      lastUpdated: 'Poco fa',
      notes: manualNotes.trim() || 'Cantiere aperto manualmente. Definire distinta materiali e passaggi.',
      completedSteps: [],
      totalSteps: 5,
      difficulty: 'intermediate',
      timeEstimate: 'Da stimare',
      costEstimate: manualBudget ? `€${manualBudget} budget fissato` : 'Budget non specificato'
    };

    onAddCustomProject(newProj);
    onClose();
    setActiveMode('choose');
    setManualTitle('');
    setManualNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#FAF8F5] w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl border border-[#E5DFD5] shadow-2xl p-5 sm:p-6 relative text-[#26343B]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#26343B]/60 hover:text-[#26343B] hover:bg-[#EAE4D8] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {activeMode === 'choose' ? (
          <div>
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider text-[#B79B76] font-bold">
                Atelier di Creazione
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#26343B] mt-1">
                {t.common.createProject}
              </h2>
              <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
                Scegli la modalità ideale per dare vita al tuo prossimo cantiere fai-da-te.
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Option 1: CASA&CO. VISION STUDIO */}
              {onNavigateVision && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateVision();
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-[#26343B] text-white border border-[#3A4B53] hover:shadow-lg transition-all group flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#B79B76] text-[#26343B] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#26343B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm sm:text-base text-[#F5F1E9] group-hover:text-[#DAC9B2] transition-colors">
                        CASA&CO. VISION STUDIO
                      </h3>
                      <span className="text-[10px] bg-[#B79B76] text-[#26343B] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Novità
                      </span>
                    </div>
                    <p className="text-xs text-[#F5F1E9]/80 mt-1 leading-relaxed">
                      Riprogettazione foto con Vision AI (slider prima/dopo), rilievo parametrico 3D Three.js e assistente di cantiere con avvisi di sicurezza.
                    </p>
                  </div>
                </button>
              )}

              {/* Option 2: AI Assistant Designer */}
              <button
                onClick={() => {
                  onClose();
                  onNavigateAi();
                }}
                className="w-full text-left p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#B79B76] hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-[#26343B] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Sparkles className="w-5 h-5 text-[#8F7451]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm sm:text-base text-[#26343B] group-hover:text-[#8F7451] transition-colors">
                      {t.nav.aiDesign}
                    </h3>
                  </div>
                  <p className="text-xs text-[#26343B]/70 mt-1 leading-relaxed">
                    Genera distinta di taglio esecutiva, stima costi e schemi di montaggio a partire da dimensioni e budget.
                  </p>
                </div>
              </button>

              {/* Option 2: Manual Custom Project */}
              <button
                onClick={() => setActiveMode('manual')}
                className="w-full text-left p-4 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#B79B76] hover:shadow-md transition-all group flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E5DFD5] text-[#26343B] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Hammer className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm sm:text-base text-[#26343B] group-hover:text-[#8F7451] transition-colors">
                    Cantiere Libero
                  </h3>
                  <p className="text-xs text-[#26343B]/70 mt-1 leading-relaxed">
                    Apri un foglio di cantiere personalizzato per prendere appunti, tracciare spese e appuntare passaggi liberamente.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateManual} className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#B79B76] font-bold">
                Cantiere Libero
              </span>
              <h2 className="font-serif text-xl font-bold text-[#26343B]">
                Nuovo progetto personalizzato
              </h2>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343B] mb-1">
                Nome del progetto *
              </label>
              <input
                type="text"
                required
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="Es. Mobile bar in noce e ferro battuto"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#26343B] mb-1">
                  Categoria
                </label>
                <select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value as CategoryId)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
                >
                  <option value="mobili">Mobili</option>
                  <option value="cucina">Cucina</option>
                  <option value="bagno">Bagno</option>
                  <option value="pareti">Pareti</option>
                  <option value="pavimenti">Pavimenti</option>
                  <option value="giardino">Giardino</option>
                  <option value="pergole">Pergole</option>
                  <option value="falegnameria">Falegnameria</option>
                  <option value="muratura">Muratura</option>
                  <option value="idraulica">Idraulica</option>
                  <option value="elettricita">Elettricità</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26343B] mb-1">
                  Budget stimato (€)
                </label>
                <input
                  type="number"
                  value={manualBudget}
                  onChange={(e) => setManualBudget(e.target.value)}
                  placeholder="Es. 350"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#26343B] mb-1">
                Note iniziali e materiali
              </label>
              <textarea
                rows={3}
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Appunti su legno da ordinare, misure preliminari..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#E5DFD5] rounded-xl focus:border-[#B79B76] outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveMode('choose')}
                className="px-3.5 py-2 text-xs text-[#26343B]/70 hover:text-[#26343B]"
              >
                ← {t.common.back}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#26343B] text-[#F5F1E9] text-xs font-semibold hover:bg-[#1A242A] transition-colors shadow-xs"
              >
                Crea Progetto
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
