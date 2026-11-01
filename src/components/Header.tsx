import React from 'react';
import { Search, Globe, Smartphone, Monitor, Bookmark, Sparkles } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenSearch: () => void;
  isMobileDeviceView: boolean;
  onToggleDeviceView: () => void;
  onNavigateAi: () => void;
  onNavigateVision: () => void;
  currentSearchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  savedCount,
  onOpenSaved,
  onOpenSearch,
  isMobileDeviceView,
  onToggleDeviceView,
  onNavigateAi,
  onNavigateVision,
  currentSearchQuery,
  onSearchChange,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 bg-[#F5F1E9]/95 backdrop-blur-md border-b border-[#E5DFD5] transition-all">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-8 lg:px-10 h-15 sm:h-20 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#26343B] text-[#F5F1E9] flex items-center justify-center shadow-xs flex-shrink-0">
            <span className="font-serif font-bold text-base sm:text-lg tracking-tight">F</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-serif text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-[#26343B] leading-none whitespace-nowrap">
                FaiDaTeCasa<span className="text-[#B79B76]">.</span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-xs text-[#26343B]/60 tracking-wider uppercase font-medium mt-0.5 hidden md:block">
              {t.common.tagline}
            </p>
          </div>
        </div>

        {/* Search Bar for wider mobile/desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#26343B]/40 pointer-events-none" />
            <input
              type="text"
              value={currentSearchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white/70 hover:bg-white focus:bg-white border border-[#E5DFD5] focus:border-[#B79B76] rounded-full text-[#26343B] placeholder-[#26343B]/40 outline-none transition-all shadow-xs"
            />
            {currentSearchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#26343B]/50 hover:text-[#26343B]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile search icon button */}
          <button
            onClick={onOpenSearch}
            aria-label="Cerca"
            className="md:hidden p-1.5 sm:p-2 text-[#26343B] hover:bg-[#EAE4D8] rounded-full transition-colors"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#26343B]" />
          </button>

          {/* Vision Studio CTA Button */}
          <button
            onClick={onNavigateVision}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#B79B76] text-[#26343B] text-[11px] sm:text-xs font-bold hover:bg-[#c4a985] transition-all shadow-xs active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#26343B] shrink-0" />
            <span className="hidden sm:inline">Vision Studio</span>
            <span className="sm:hidden">Vision</span>
          </button>

          {/* Quick AI Progetta Button */}
          <button
            onClick={onNavigateAi}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#26343B] text-[#F5F1E9] text-xs font-medium hover:bg-[#1A242A] transition-colors shadow-xs"
          >
            <span>{t.nav.aiDesign}</span>
          </button>

          {/* Device viewport frame toggle (desktop only) */}
          <button
            onClick={onToggleDeviceView}
            title={isMobileDeviceView ? "Passa a vista desktop fluida" : "Simula smartphone (mobile-first)"}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#26343B]/80 hover:text-[#26343B] hover:bg-[#EAE4D8] rounded-full transition-colors border border-[#E5DFD5]"
          >
            {isMobileDeviceView ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#B79B76]" />
                <span className="text-[11px] font-medium">Mobile 390px</span>
              </>
            )}
          </button>

          {/* Saved projects counter */}
          <button
            onClick={onOpenSaved}
            aria-label="Progetti salvati"
            className="relative p-1.5 sm:p-2 text-[#26343B] hover:bg-[#EAE4D8] rounded-full transition-colors"
          >
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
            {savedCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#B79B76] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-white/80 border border-[#E5DFD5] rounded-full p-0.5 shadow-2xs">
            <button
              onClick={() => onLanguageChange('it')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                language === 'it'
                  ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                  : 'text-[#26343B]/60 hover:text-[#26343B]'
              }`}
            >
              IT
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-bold rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                  : 'text-[#26343B]/60 hover:text-[#26343B]'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
