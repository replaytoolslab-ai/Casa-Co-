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
import { CategoryId, Project, UserProject, EditorialArticle } from '../types';
import { CATEGORIES_DATA, MOCK_PROJECTS, EDITORIAL_ARTICLES } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import { ProjectCard } from '../components/ProjectCard';
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

  // Filter projects if there's a search query
  const filteredProjects = searchQuery.trim()
    ? MOCK_PROJECTS.filter((p) => {
        const title = p.title[language].toLowerCase();
        const desc = p.description[language].toLowerCase();
        const cat = p.category.toLowerCase();
        const q = searchQuery.toLowerCase();
        return title.includes(q) || desc.includes(q) || cat.includes(q);
      })
    : MOCK_PROJECTS;

  const featuredProjects = filteredProjects.filter((p) => p.isFeatured);
  const recentProjects = filteredProjects.filter((p) => p.isNew || !p.isFeatured).slice(0, 4);

  // Main high-interest categories for the home showcase
  const popularCategoryKeys: CategoryId[] = [
    'mobili',
    'cucina',
    'bagno',
    'pareti',
    'pergole',
    'falegnameria',
  ];

  return (
    <div className="w-full min-w-0 max-w-full space-y-10 overflow-x-clip pb-16 sm:space-y-16">
      
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

          {/* Quick stats banner underneath hero */}
          <div className="bg-[#1A242A]/90 border-t border-[#37474F]">
            <div className="grid grid-cols-3 divide-x divide-[#37474F] text-center py-2.5 sm:py-3.5">
              <div>
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#F5F1E9]">140+</span>
                <span className="block text-[10px] sm:text-xs text-[#F5F1E9]/60">{t.home.statProjects}</span>
              </div>
              <div>
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#F5F1E9]">11</span>
                <span className="block text-[10px] sm:text-xs text-[#F5F1E9]/60">{t.categories.allCategories}</span>
              </div>
              <div>
                <span className="font-serif text-lg sm:text-2xl font-bold text-[#F5F1E9]">12.4k</span>
                <span className="block text-[10px] sm:text-xs text-[#F5F1E9]/60">{t.home.statArtisans}</span>
              </div>
            </div>
            <div className="text-center pb-2 text-[9px] sm:text-[10px] text-[#DAC9B2]/60 uppercase tracking-wider font-medium">
              * Dati catalogo editoriale dimostrativo
            </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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

      {/* Featured / Recommended Projects (Progetti Consigliati) */}
      <section>
        <div className="mb-5 flex min-w-0 flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
              Selezione della Redazione
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
              {t.home.featuredTitle}
            </h2>
            <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
              {t.home.featuredSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              language={language}
              onSelect={onSelectProject}
              isSaved={savedProjectIds.includes(project.id)}
              onToggleSave={onToggleSave}
            />
          ))}
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

      {/* Editorial Stories & Inspirations (Ispirazioni) */}
      <section>
        <div className="mb-5 sm:mb-6">
          <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
            Approfondimenti
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
            {t.home.inspirationsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
            {t.home.inspirationsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {EDITORIAL_ARTICLES.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden hover:shadow-md hover:border-[#B79B76]/40 transition-all flex flex-col group cursor-pointer"
            >
              <div className="aspect-16/10 w-full overflow-hidden bg-[#EAE4D8]">
                <img
                  src={article.image}
                  alt={article.title[language]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#8F7451] font-semibold mb-2">
                    <span>{article.category[language]}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#26343B]/60 font-medium">{article.readTime}</span>
                  </div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#26343B] group-hover:text-[#8F7451] transition-colors leading-snug mb-2">
                    {article.title[language]}
                  </h3>
                  <p className="text-xs text-[#26343B]/75 line-clamp-2 leading-relaxed">
                    {article.summary[language]}
                  </p>
                </div>
                <div className="pt-3 mt-4 border-t border-[#F0EBE1] flex items-center justify-between text-xs font-semibold text-[#26343B] group-hover:text-[#8F7451]">
                  <span>Leggi articolo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Novità & Nuove Uscite (Latest projects) */}
      <section>
        <div className="mb-5 sm:mb-6">
          <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
            Ultimi Cantieri
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
            {t.home.newsTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
            {t.home.newsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {recentProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              language={language}
              onSelect={onSelectProject}
              isSaved={savedProjectIds.includes(project.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      </section>

    </div>
  );
};
