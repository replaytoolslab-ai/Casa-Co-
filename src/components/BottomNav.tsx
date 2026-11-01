import React from 'react';
import { Home, LayoutGrid, Sparkles, FolderKanban, User } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

export type NavTab = 'home' | 'categories' | 'vision' | 'ai' | 'projects' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  activeProjectsBadge?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  language,
  activeProjectsBadge = 0,
}) => {
  const t = translations[language];

  // Concise single-word labels for optimal mobile display without overlap
  const items = [
    {
      id: 'home' as NavTab,
      label: language === 'it' ? 'Home' : 'Home',
      icon: Home,
    },
    {
      id: 'categories' as NavTab,
      label: language === 'it' ? 'Categorie' : 'Categories',
      icon: LayoutGrid,
    },
    {
      id: 'vision' as NavTab,
      label: language === 'it' ? 'Studio' : 'Studio',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'projects' as NavTab,
      label: language === 'it' ? 'Progetti' : 'Projects',
      icon: FolderKanban,
      badge: activeProjectsBadge,
    },
    {
      id: 'profile' as NavTab,
      label: language === 'it' ? 'Profilo' : 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 w-full bg-[#F5F1E9]/95 backdrop-blur-md border-t border-[#E5DFD5] px-1 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] shadow-lg select-none">
      <div className="max-w-md mx-auto grid grid-cols-5 items-end justify-items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center justify-center relative -top-3 focus:outline-hidden group w-full min-w-0 cursor-pointer"
                aria-label="Vision Studio"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-lg relative ${
                    isActive
                      ? 'bg-orange-500 text-white ring-3 ring-orange-300/40 scale-105'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <Icon className="w-5 h-5 animate-pulse text-[#B79B76]" />
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#B79B76] rounded-full border-2 border-[#F5F1E9]" />
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold tracking-tight mt-1 transition-colors leading-none truncate max-w-full ${
                    isActive ? 'text-orange-300' : 'text-white/80'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all relative focus:outline-hidden active:scale-95 text-center w-full min-w-0 min-h-[44px] cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'text-orange-400 scale-105 stroke-[2.2]' : 'text-white/55 stroke-[1.7]'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-3.5 h-3.5 bg-[#B79B76] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 transition-colors leading-none truncate max-w-full px-0.5 ${
                  isActive ? 'text-orange-300 font-bold' : 'text-white/65 font-medium'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 bg-orange-500 rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
