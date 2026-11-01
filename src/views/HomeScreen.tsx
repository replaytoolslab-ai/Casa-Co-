import React from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  Hammer,
  Bookmark,
  BookOpen,
  ChevronRight,
  CheckCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { CategoryId, Project } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import { CategoryCard } from '../components/CategoryCard';

interface HomeScreenProps {
  language: Language;
  onSelectProject: (project: Project) => void;
  onSelectCategory: (category: CategoryId) => void;
  onOpenCreateModal: () => void;
  onNavigateAi: () => void;
  onNavigateVision: () => void;
  onNavigateCategories: () => void;
  savedProjectIds: string[];
  onToggleSave: (projectId: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  onSelectProject,
  onSelectCategory,
  onOpenCreateModal,
  onNavigateAi,
  onNavigateVision,
  onNavigateCategories,
  savedProjectIds,
  onToggleSave,
  searchQuery,
  onSearchChange,
}) => {
  const t = translations[language];

  const filteredProjects: Project[] = [];

  // Main high-interest categories for the home showcase
  const popularCategoryKeys: CategoryId[] = [
    'mobili',
    'cucina',
    'bagno',
    'pareti',
    'pavimenti',
    'verniciatura',
    'cartongesso',
    'illuminazione',
  ];

  return (
    <div className="w-full min-w-0 max-w-full space-y-8 overflow-x-clip pb-16 sm:space-y-12">
      
      {/* Search active results notification banner */}
      {searchQuery && (
        <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] flex items-center justify-between shadow-xs">
          <p className="text-sm text-[#26343B]">
            Risultati per: <span className="font-bold">"{searchQuery}"</span> ({filteredProjects.length} trovati)
          </p>
          <button
            onClick={() => onSearchChange('')}
            className="text-xs text-[#8F7451] hover:underline font-semibold"
          >
            Cancella ricerca
          </button>
        </div>
      )}

      {/* Hero Section with Emotional Renovation Image */}
      {!searchQuery && (
        <section className="relative rounded-3xl sm:rounded-4xl overflow-hidden border border-[#E5DFD5] bg-[#26343B] text-[#F5F1E9] shadow-xl">
          {/* Background Image: Emotional modern home in renovation */}
          <div className="relative min-h-[540px] w-full sm:min-h-0 sm:aspect-[21/9] lg:aspect-[24/9]">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
              alt="Casa moderna in ristrutturazione con architettura pulita e legno caldo"
              className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-102 transform hover:scale-100 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#26343B] via-[#26343B]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#26343B]/90 via-[#26343B]/40 to-transparent" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex min-w-0 max-w-2xl flex-col justify-end p-5 sm:p-10 lg:p-14">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#B79B76] animate-pulse" />
                <span className="text-xs uppercase tracking-widest text-[#B79B76] font-semibold">
                  {t.home.heroKicker}
                </span>
              </div>

              <h2 className="mb-3 break-words font-serif text-[clamp(1.55rem,6vw,2.25rem)] font-bold leading-[1.12] tracking-tight text-[#F5F1E9] sm:mb-4 sm:text-4xl lg:text-5xl">
                {t.home.heroTitle}
              </h2>

              <p className="mb-5 max-w-xl break-words text-sm font-normal leading-relaxed text-[#F5F1E9]/90 sm:mb-6 sm:text-base">
                {t.home.heroSubtitle}
              </p>
              <p className="-mt-3 mb-5 max-w-xl text-xs font-medium text-[#DAC9B2] sm:mb-6 sm:text-sm">
                {language === 'it' ? 'Crea mobili, rinnova gli ambienti e segui i lavori passo dopo passo.' : 'Build furniture, refresh your spaces and follow every project step by step.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={onOpenCreateModal}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B79B76] text-[#26343B] font-semibold text-xs sm:text-sm hover:bg-[#c9ad88] transition-all shadow-md active:scale-95"
                >
                  <Hammer className="w-4 h-4" />
                  <span>{t.common.createProject}</span>
                </button>

                <button
                  onClick={onNavigateAi}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#F5F1E9] font-medium text-xs sm:text-sm border border-white/20 transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-[#B79B76]" />
                  <span>{t.nav.aiDesign}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1A242A]/90 border-t border-[#37474F] px-4 py-3 text-center text-xs text-[#F5F1E9]/75">
            {language === 'it' ? 'Catalogo in aggiornamento: pubblicheremo solo guide complete e verificate.' : 'Catalog under review: only complete, reviewed guides will be published.'}
          </div>
        </section>
      )}

      {/* Main Categories Section */}
      <section>
        <div className="mb-5 flex min-w-0 flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
              Esplorazione
            </span>
            <h2 className="break-words font-serif text-2xl font-bold leading-tight text-[#26343B] sm:text-3xl">
              {t.home.categoriesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
              {t.home.categoriesSubtitle}
            </p>
          </div>
          <button
            onClick={onNavigateCategories}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#8F7451] hover:text-[#26343B] transition-colors"
          >
            <span>{t.home.viewAllCategories}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable / Responsive categories row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 min-w-0">
          {popularCategoryKeys.map((catKey) => {
            const cat = CATEGORIES_DATA[catKey];
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                language={language}
                onSelect={onSelectCategory}
              />
            );
          })}
        </div>
      </section>

      {/* CASA&CO. VISION STUDIO Feature Banner (Central highlight of the app) */}
      <section className="bg-gradient-to-br from-[#26343B] via-[#1E292E] to-[#172126] rounded-3xl sm:rounded-4xl p-6 sm:p-10 text-[#F5F1E9] border border-[#3A4B53] shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-radial from-[#B79B76]/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B79B76] text-[#26343B] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#26343B]" />
            <span>Nuovo Rilascio Centrale</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-4xl font-bold mb-3 text-[#F5F1E9] leading-tight">
            CASA&CO. VISION STUDIO<span className="text-[#B79B76]">.</span>
          </h3>
          <p className="text-xs sm:text-base text-[#F5F1E9]/85 mb-6 leading-relaxed">
            La piattaforma più spettacolare dell’atelier: trasforma foto grezze con <strong className="text-white">Vision AI</strong> (3 proposte e slider prima/dopo), modella volumi con <strong className="text-white">Scan 3D</strong> (Three.js parametrico) e governa il cantiere con <strong className="text-white">Assistant AI</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateVision}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#B79B76] text-[#26343B] font-bold text-xs sm:text-sm hover:bg-[#c4a985] transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#26343B]" />
              <span>Entra in Vision Studio</span>
              <ArrowRight className="w-4 h-4 text-[#26343B]" />
            </button>

            <button
              onClick={onNavigateAi}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white text-xs sm:text-sm font-medium border border-white/20 transition-all"
            >
              Configuratore {t.nav.aiDesign}
            </button>
          </div>
        </div>
      </section>


    </div>
  );
};
