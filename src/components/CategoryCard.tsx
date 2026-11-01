import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CategoryId, CategoryInfo } from '../types';
import { Language, translations } from '../i18n/translations';
import { CategoryIcon } from './CategoryIcon';

interface CategoryCardProps {
  category: CategoryInfo;
  language: Language;
  onSelect: (categoryId: CategoryId) => void;
  compact?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  language,
  onSelect,
  compact = false,
}) => {
  const t = translations[language];
  const itemData = t.categories.items[category.id];

  if (compact) {
    return (
      <button
        onClick={() => onSelect(category.id)}
        className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-[#E5DFD5] hover:border-[#B79B76] hover:shadow-md transition-all text-center flex-shrink-0 w-28 sm:w-32"
      >
        <div className="w-12 h-12 rounded-xl bg-[#FAF8F5] text-[#26343B] group-hover:bg-[#26343B] group-hover:text-[#F5F1E9] flex items-center justify-center mb-2 transition-colors">
          <CategoryIcon category={category.id} className="w-6 h-6" />
        </div>
        <span className="font-medium text-xs text-[#26343B] group-hover:text-[#8F7451] truncate w-full">
          {itemData?.name || category.id}
        </span>
        <span className="text-[10px] text-[#26343B]/50 mt-0.5">
          {language === 'it' ? 'Guide in preparazione' : 'Guides in preparation'}
        </span>
      </button>
    );
  }

  return (
    <div
      onClick={() => onSelect(category.id)}
      className="group relative cursor-pointer rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E5DFD5] bg-[#FAF8F5] hover:shadow-xl hover:border-[#B79B76]/50 transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-16/10 sm:aspect-4/3 w-full overflow-hidden bg-[#EAE4D8]">
        <img
          src={category.coverImage}
          alt={itemData?.name || category.id}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Icon Pill Top Left */}
        <div className="absolute top-3.5 left-3.5 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md text-[#26343B] flex items-center justify-center shadow-xs">
          <CategoryIcon category={category.id} className="w-4 h-4" />
        </div>

        {/* Text bottom overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
          <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
            {itemData?.name}
          </h3>
          <p className="text-[11px] sm:text-xs text-white/80 line-clamp-1 mt-0.5">
            {category.tagline[language]}
          </p>
        </div>
      </div>

      {/* Subcategories tags */}
      <div className="p-3.5 bg-white border-t border-[#F0EBE1] flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs text-[#26343B]/70">
          <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
            {category.subcategories[language].slice(0, 2).map((sub, idx) => (
              <span key={idx} className="truncate">
                {idx > 0 && <span className="text-[#B79B76] mr-1.5">/</span>}
                {sub}
              </span>
            ))}
          </div>
          <ArrowRight className="w-4 h-4 text-[#B79B76] group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
        </div>
        <span className="self-start inline-flex items-center rounded-full bg-[#F5F1E9] px-2.5 py-1 text-[10px] font-semibold text-[#8F7451]">
          {language === 'it' ? 'Guide in preparazione' : 'Guides in preparation'}
        </span>
      </div>
    </div>
  );
};
