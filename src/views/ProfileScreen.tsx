import React, { useState } from 'react';
import {
  User,
  Award,
  Clock,
  Euro,
  Hammer,
  Wrench,
  Settings,
  Globe,
  Ruler,
  Check,
  ShieldCheck,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ProfileScreenProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  completedCount: number;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  language,
  onLanguageChange,
  completedCount,
}) => {
  const t = translations[language];
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Workshop Tools Inventory State
  const [toolsInventory, setToolsInventory] = useState([
    { name: 'Sega ad affondamento con binario guida', owned: true },
    { name: 'Fresatrice verticale da 1400W', owned: true },
    { name: 'Levigatrice rotorbitale 150mm', owned: true },
    { name: 'Banco sega di precisione', owned: true },
    { name: 'Trapano a percussione / Avvitatore a impulsi', owned: true },
    { name: 'Livella laser rotante a 360°', owned: true },
    { name: 'Maschera foratura Kreg Jig', owned: true },
    { name: 'Pialletto a filo e spessore da banco', owned: false },
    { name: 'Saldatrice TIG per telai ferro', owned: false },
    { name: 'Frattone veneziano in acciaio inox', owned: true },
  ]);

  const toggleTool = (index: number) => {
    setToolsInventory((prev) =>
      prev.map((item, i) => (i === index ? { ...item, owned: !item.owned } : item))
    );
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          {/* Avatar with Craftsman badge */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
              alt="Profilo Utente"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#FAF8F5] shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 p-2 bg-[#26343B] text-[#B79B76] rounded-full shadow-md">
              <Award className="w-4 h-4" />
            </div>
          </div>

          {/* User Bio */}
          <div className="flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#26343B]">
                Matteo Vianello
              </h1>
              <span className="text-xs bg-[#B79B76]/15 text-[#8F7451] font-bold px-2.5 py-0.5 rounded-full">
                PRO MAKER
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#26343B]/70 font-medium">
              {t.profile.role} · {t.profile.location}
            </p>
            <p className="text-xs text-[#26343B]/80 mt-2 max-w-xl leading-relaxed">
              Appassionato di falegnameria giapponese, ristrutturazione d’interni in bioedilizia e complementi d’arredo in massello e metallo.
            </p>
          </div>

        </div>

        {/* 4 Key Statistics Metrics */}
        <div className="mt-6 pt-6 border-t border-[#F0EBE1]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8F7451]">
              Statistiche Maker
            </span>
            <span className="text-[10px] text-[#26343B]/50 italic">
              * Dati di simulazione profilo dimostrativo
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#26343B]/60 block mb-1">
                {t.profile.stats.projectsCompleted}
              </span>
              <span className="font-serif text-2xl font-bold text-[#26343B]">
                {completedCount + 2}
              </span>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#26343B]/60 block mb-1">
                {t.profile.stats.hoursDedicated}
              </span>
              <span className="font-serif text-2xl font-bold text-[#26343B]">
                54h
              </span>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#8F7451] block mb-1">
                {t.profile.stats.moneySaved}
              </span>
              <span className="font-serif text-2xl font-bold text-[#8F7451]">
                €840
              </span>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] rounded-2xl text-center">
              <span className="text-[10px] uppercase font-bold text-[#26343B]/60 block mb-1">
                {t.profile.stats.level}
              </span>
              <span className="font-serif text-2xl font-bold text-[#26343B]">
                Mastro II
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Workshop Tools Inventory */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE1]">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#26343B] flex items-center gap-2">
              <Hammer className="w-5 h-5 text-[#B79B76]" />
              <span>{t.profile.toolboxTitle}</span>
            </h2>
            <p className="text-xs text-[#26343B]/70 mt-0.5">
              {t.profile.toolboxSubtitle}
            </p>
          </div>
          <span className="text-xs font-semibold text-[#8F7451] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EAE4D8]">
            {toolsInventory.filter((t) => t.owned).length} / {toolsInventory.length} disponibili
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {toolsInventory.map((item, idx) => (
            <button
              key={idx}
              onClick={() => toggleTool(idx)}
              className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                item.owned
                  ? 'bg-[#FAF8F5] border-[#B79B76]/40 text-[#26343B]'
                  : 'bg-white border-[#E5DFD5] text-[#26343B]/40 hover:bg-[#FAF8F5]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs ${
                    item.owned ? 'bg-[#26343B] text-white' : 'border border-[#E5DFD5]'
                  }`}
                >
                  {item.owned && <Check className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium truncate">{item.name}</span>
              </div>
              <span className="text-[10px] font-semibold text-[#8F7451] flex-shrink-0 ml-2">
                {item.owned ? 'In laboratorio' : '+ Aggiungi'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Application Preferences & Settings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5DFD5] shadow-xs space-y-5">
        <h2 className="font-serif text-xl font-bold text-[#26343B] flex items-center gap-2 pb-3 border-b border-[#F0EBE1]">
          <Settings className="w-5 h-5 text-[#B79B76]" />
          <span>{t.profile.settingsTitle}</span>
        </h2>

        {/* Language setting readout (single source of truth in Header) */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#26343B]/70" />
            <div>
              <span className="text-sm font-semibold text-[#26343B] block">
                {t.profile.languageLabel}
              </span>
              <span className="text-xs text-[#26343B]/60">
                {language === 'it' ? 'Italiano (selettore attivo nella barra in alto)' : 'English (active in top header)'}
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[#26343B] bg-[#FAF8F5] px-3.5 py-1.5 rounded-xl border border-[#E5DFD5]">
            {language === 'it' ? '🇮🇹 Italiano' : '🇬🇧 English'}
          </span>
        </div>

        {/* Units of Measure */}
        <div className="flex items-center justify-between py-2 border-t border-[#F0EBE1]">
          <div className="flex items-center gap-3">
            <Ruler className="w-5 h-5 text-[#26343B]/70" />
            <div>
              <span className="text-sm font-semibold text-[#26343B] block">
                {t.profile.unitLabel}
              </span>
              <span className="text-xs text-[#26343B]/60">
                Sistema metrico decimale (cm, mm, m) o pollici
              </span>
            </div>
          </div>

          <div className="flex items-center bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-1">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                unitSystem === 'metric'
                  ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                  : 'text-[#26343B]/60'
              }`}
            >
              Metrico (cm)
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                unitSystem === 'imperial'
                  ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                  : 'text-[#26343B]/60'
              }`}
            >
              Pollici (in)
            </button>
          </div>
        </div>

        {/* Notifications toggle */}
        <div className="flex items-center justify-between py-2 border-t border-[#F0EBE1]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#26343B]/70" />
            <div>
              <span className="text-sm font-semibold text-[#26343B] block">
                {t.profile.notifications}
              </span>
              <span className="text-xs text-[#26343B]/60">
                Ricevi avvisi per nuove schede e aggiornamenti di cantiere
              </span>
            </div>
          </div>

          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              notificationsEnabled ? 'bg-[#26343B]' : 'bg-[#E5DFD5]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </div>

      {/* Casa&Co. Manifesto Box */}
      <div className="bg-[#26343B] text-[#F5F1E9] rounded-3xl p-6 sm:p-8 border border-[#37474F] relative overflow-hidden shadow-lg">
        <div className="max-w-xl">
          <span className="text-xs uppercase tracking-widest text-[#B79B76] font-bold block mb-2">
            {t.profile.aboutTitle}
          </span>
          <h3 className="font-serif text-2xl font-bold mb-3 text-[#F5F1E9]">
            "L’anima di una casa è custodita in ciò che costruisci per viverla."
          </h3>
          <p className="text-xs sm:text-sm text-[#F5F1E9]/80 leading-relaxed font-normal">
            {t.profile.aboutText}
          </p>
          <div className="mt-5 text-[11px] text-[#F5F1E9]/50 font-mono">
            Casa&Co. v1.0 · Design & Craft Edition · Milano
          </div>
        </div>
      </div>

    </div>
  );
};
