import React, { useState } from 'react';
import { ArrowLeft, Filter, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { CategoryId, CategoryInfo, Project } from '../types';
import { CATEGORIES_DATA, MOCK_PROJECTS } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import { CategoryIcon } from '../components/CategoryIcon';
import { ProjectCard } from '../components/ProjectCard';

interface CategoriesScreenProps {
  language: Language;
  selectedCategory: CategoryId | null;
  onSelectCategory: (cat: CategoryId | null) => void;
  onSelectProject: (project: Project) => void;
  savedProjectIds: string[];
  onToggleSave: (projectId: string, e: React.MouseEvent) => void;
}

export const CategoriesScreen: React.FC<CategoriesScreenProps> = ({
  language,
  selectedCategory,
  onSelectCategory,
  onSelectProject,
  savedProjectIds,
  onToggleSave,
}) => {
  const t = translations[language];
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [activeAreaFilter, setActiveAreaFilter] = useState<string>('all');

  const allCategoryKeys: CategoryId[] = [
    'mobili',
    'cucina',
    'bagno',
    'pareti',
    'pavimenti',
    'giardino',
    'pergole',
    'falegnameria',
    'muratura',
    'idraulica',
    'elettricita',
    'verniciatura', 'cartongesso', 'isolamento', 'serramenti', 'illuminazione', 'restauro', 'impermeabilizzazione', 'terrazzi',
  ];

  // Grouped area categories for filtering all 19 items
  const areaGroups: Record<string, CategoryId[]> = {
    all: allCategoryKeys,
    arredo: ['mobili', 'falegnameria', 'cucina'],
    superfici: ['pareti', 'pavimenti', 'muratura'],
    impianti: ['bagno', 'idraulica', 'elettricita'],
    outdoor: ['giardino', 'pergole', 'terrazzi'],
    finiture: ['pareti', 'pavimenti', 'verniciatura', 'restauro'],
    involucro: ['cartongesso', 'isolamento', 'serramenti', 'impermeabilizzazione'],
    comfort: ['idraulica', 'elettricita', 'illuminazione'],
  };

  const currentCategoryInfo = selectedCategory ? CATEGORIES_DATA[selectedCategory] : null;

  // Projects in selected category
  const categoryProjects = selectedCategory
    ? MOCK_PROJECTS.filter((p) => {
        const matchesCategory = p.category === selectedCategory;
        const matchesDifficulty =
          filterDifficulty === 'all' || p.difficulty === filterDifficulty;
        return matchesCategory && matchesDifficulty;
      })
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* If a category is selected: Detailed category view with projects */}
      {selectedCategory && currentCategoryInfo ? (
        <div className="space-y-8">
          {/* Back button & Breadcrumb */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSelectCategory(null)}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8F7451] hover:text-[#26343B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.common.back} a tutte le 19 categorie</span>
            </button>
          </div>

          {/* Category Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden border border-[#E5DFD5] bg-[#26343B] text-white shadow-lg">
            <div className="relative aspect-16/9 sm:aspect-21/9 w-full">
              <img
                src={currentCategoryInfo.coverImage}
                alt={t.categories.items[selectedCategory]?.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#26343B] via-[#26343B]/60 to-transparent" />
              
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] text-[#26343B] flex items-center justify-center">
                    <CategoryIcon category={selectedCategory} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B79B76]">
                    Disciplina Specializzata
                  </span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-2">
                  {t.categories.items[selectedCategory]?.name}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
                  {currentCategoryInfo.tagline[language]}
                </p>

                {/* Subcategories list */}
                <div className="flex items-center flex-wrap gap-2 mt-4">
                  {currentCategoryInfo.subcategories[language].map((sub, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#E5DFD5]">
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E5DFD5]">
              <button
                onClick={() => setFilterDifficulty('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterDifficulty === 'all'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                {t.common.all}
              </button>
              <button
                onClick={() => setFilterDifficulty('beginner')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterDifficulty === 'beginner'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                {t.common.beginner}
              </button>
              <button
                onClick={() => setFilterDifficulty('intermediate')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterDifficulty === 'intermediate'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                {t.common.intermediate}
              </button>
              <button
                onClick={() => setFilterDifficulty('advanced')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  filterDifficulty === 'advanced'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                {t.common.advanced}
              </button>
            </div>

            <span className="text-xs text-[#26343B]/60 font-medium">
              {categoryProjects.length} guide disponibili in questa disciplina
            </span>
          </div>

          {/* Category Projects Grid */}
          {categoryProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryProjects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  language={language}
                  onSelect={onSelectProject}
                  isSaved={savedProjectIds.includes(proj.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-[#E5DFD5] text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#8F7451] flex items-center justify-center mx-auto mb-3">
                <Filter className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#26343B]">
                Nessuna guida per questo filtro
              </h3>
              <p className="text-xs text-[#26343B]/70 mt-1 mb-4">
                Prova a selezionare "Tutti" o esplora altre categorie del laboratorio.
              </p>
              <button
                onClick={() => setFilterDifficulty('all')}
                className="px-4 py-2 bg-[#26343B] text-[#F5F1E9] rounded-xl text-xs font-semibold"
              >
                Reimposta filtri
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Full Grid of All 11 Categories */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
                Indice Tematico
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#26343B]">
                {t.categories.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 max-w-2xl">
                {t.categories.subtitle}
              </p>
            </div>

            {/* Quick Segmented Area Filter */}
            <div className="grid grid-cols-2 sm:flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E5DFD5] w-full sm:w-auto">
              <button
                onClick={() => setActiveAreaFilter('all')}
                className={`w-full sm:w-auto px-3 py-2 text-xs font-semibold text-center rounded-lg whitespace-nowrap transition-all ${
                  activeAreaFilter === 'all'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                Tutte (11)
              </button>
              <button
                onClick={() => setActiveAreaFilter('arredo')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  activeAreaFilter === 'arredo'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                Arredo & Legno
              </button>
              <button
                onClick={() => setActiveAreaFilter('superfici')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  activeAreaFilter === 'superfici'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                Pareti & Finiture
              </button>
              <button
                onClick={() => setActiveAreaFilter('impianti')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  activeAreaFilter === 'impianti'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                Impianti & Bagno
              </button>
              <button
                onClick={() => setActiveAreaFilter('outdoor')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  activeAreaFilter === 'outdoor'
                    ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                    : 'text-[#26343B]/70 hover:text-[#26343B]'
                }`}
              >
                Outdoor & Pergole
              </button>
            </div>
          </div>

          {/* 11 Categories Editorial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {areaGroups[activeAreaFilter].map((catId) => {
              const cat = CATEGORIES_DATA[catId];
              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="group relative cursor-pointer bg-white rounded-2xl sm:rounded-3xl border border-[#E5DFD5] overflow-hidden hover:shadow-xl hover:border-[#B79B76]/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EAE4D8]">
                    <img
                      src={cat.coverImage}
                      alt={t.categories.items[cat.id]?.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                    {/* Top icon and count */}
                    <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-xs text-[#26343B] flex items-center justify-center shadow-xs">
                        <CategoryIcon category={cat.id} className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Text title over image */}
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold">
                        {t.categories.items[cat.id]?.name}
                      </h2>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs sm:text-sm text-[#26343B]/80 leading-relaxed mb-4">
                      {t.categories.items[cat.id]?.desc}
                    </p>

                    <div className="pt-3 border-t border-[#F0EBE1] flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#8F7451] font-semibold">
                          {t.categories.viewProjects}
                        </span>
                        <span className="text-xs text-[#26343B]/50 font-medium">
                          {cat.subcategories[language].length} sottosezioni
                        </span>
                      </div>
                      <span className="self-start inline-flex items-center rounded-full bg-[#F5F1E9] px-2.5 py-1 text-[10px] font-semibold text-[#8F7451]">
                        {language === 'it' ? 'Guide in preparazione' : 'Guides in preparation'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
