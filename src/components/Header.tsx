import React from 'react';
import { Search, Bell, Heart, UserRound, House, BookOpen, LayoutGrid, Layers3, Sparkles, UsersRound, Crown } from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { NavTab } from './BottomNav';

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
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateProjects: () => void;
  onNavigateProfile: () => void;
  currentTab: NavTab;
  currentSearchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language, onLanguageChange, savedCount, onOpenSaved, onOpenSearch, onNavigateAi, onNavigateVision,
  onNavigateHome, onNavigateCategories, onNavigateProjects, onNavigateProfile, currentTab,
  currentSearchQuery, onSearchChange,
}) => {
  const t = translations[language];
  const nav = [
    { label: 'Home', icon: House, action: onNavigateHome, active: currentTab === 'home' },
    { label: 'Guide e Tutorial', icon: BookOpen, action: onNavigateCategories, active: false },
    { label: 'Categorie', icon: LayoutGrid, action: onNavigateCategories, active: currentTab === 'categories' },
    { label: 'Progetti', icon: Layers3, action: onNavigateProjects, active: currentTab === 'projects' },
    { label: 'Assistente AI', icon: Sparkles, action: onNavigateAi, active: currentTab === 'ai' || currentTab === 'vision' },
    { label: 'Abbonamenti', icon: Crown, action: onNavigateProfile, active: currentTab === 'profile' },
  ];
  return <header className="sticky top-0 z-40 bg-[#101820] text-white shadow-lg">
    <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-3 px-4 py-3 sm:px-7 lg:flex-nowrap lg:gap-6 lg:px-10">
      <button onClick={onNavigateHome} className="flex shrink-0 items-center gap-2.5 text-left" aria-label="FaiDaTeCasa home">
        <svg viewBox="0 0 64 54" className="h-11 w-12 shrink-0" role="img" aria-label="Logo FaiDaTeCasa">
          <path d="M5 29 31 5l12 11V8h9v16l8 7" fill="none" stroke="#ff8500" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m15 31 16-15 17 15" fill="none" stroke="#ff8500" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m21 39 18-18m-9 21 18-18" stroke="white" strokeWidth="5" strokeLinecap="round"/>
          <path d="m17 35 8 8m14-19 8 8" stroke="white" strokeWidth="4" strokeLinecap="round"/>
        </svg>
        <span className="block"><span className="block whitespace-nowrap text-[21px] font-black leading-none tracking-tight sm:text-[25px]">FaiDaTe<span className="text-orange-500">Casa</span></span><span className="mt-1 hidden text-[10px] font-medium text-white/75 sm:block">Rinnova, Ripara, Crea: la tua casa, con le tue mani!</span></span>
      </button>
      <div className="order-3 w-full flex-1 lg:order-none lg:max-w-[420px]">
        <div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500"/><input value={currentSearchQuery} onChange={e=>onSearchChange(e.target.value)} placeholder="Cerca guide, progetti, prodotti..." className="w-full rounded-xl border border-white/35 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/65 focus:border-orange-500 focus:bg-white/15"/></div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button onClick={onOpenSearch} className="rounded-full p-2 text-white hover:bg-white/10 md:hidden" aria-label="Apri ricerca"><Search size={19}/></button>
        <button className="hidden rounded-full p-2 text-white hover:bg-white/10 sm:block" aria-label="Notifiche"><Bell size={19}/></button>
        <button onClick={onOpenSaved} className="relative rounded-full p-2 text-white hover:bg-white/10" aria-label="Preferiti"><Heart size={20}/>{savedCount>0&&<span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold">{savedCount}</span>}</button>
        <button onClick={onNavigateProfile} className="hidden items-center gap-2 rounded-xl border border-white/55 px-3 py-2 text-sm font-semibold hover:bg-white/10 sm:flex"><UserRound size={16}/> Accedi</button>
        <button onClick={onNavigateProfile} className="rounded-xl bg-orange-500 px-3 py-2 text-xs font-extrabold text-white hover:bg-orange-600 sm:px-4 sm:text-sm">Registrati</button>
      </div>
    </div>
    <nav className="border-t border-white/10 bg-[#0c1319]">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-1 overflow-x-auto px-3 sm:justify-center sm:gap-5 sm:px-6">
        {nav.map(({label,icon:Icon,action,active})=><button key={label} onClick={action} className={`relative flex shrink-0 items-center gap-2 px-3 py-3 text-xs font-bold transition sm:px-4 sm:text-sm ${active?'text-orange-400':'text-white/90 hover:text-orange-300'}`}><Icon size={17}/>{label}{active&&<span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-orange-500"/>}</button>)}
      </div>
    </nav>
  </header>;
};
