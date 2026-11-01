import React from 'react';
import { ArrowRight, PlayCircle, Sparkles, Hammer, Clock3, Heart, BookOpen, Calculator, Image as ImageIcon, Wrench, Layers, ShieldCheck } from 'lucide-react';
import { CategoryId, Project } from '../types';
import { CATEGORIES_DATA } from '../data/mockData';
import { Language, translations } from '../i18n/translations';
import { CategoryIcon } from '../components/CategoryIcon';

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

const featured = [
  { id: 'kitchen', category: 'Cucina', title: 'Rinnovo cucina in stile moderno', difficulty: 'Media', time: '3 giorni', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85', key: 'cucina' as CategoryId },
  { id: 'bath', category: 'Bagno', title: 'Ristrutturazione bagno completo', difficulty: 'Alta', time: '7 giorni', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=85', key: 'bagno' as CategoryId },
  { id: 'garden', category: 'Giardino', title: 'Pergola fai da te in legno', difficulty: 'Media', time: '2 giorni', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85', key: 'terrazzi' as CategoryId },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language, onSelectProject, onSelectCategory, onOpenCreateModal, onNavigateAi, onNavigateVision,
  onNavigateCategories, savedProjectIds, onToggleSave, searchQuery, onSearchChange,
}) => {
  const t = translations[language];
  const categoryKeys: CategoryId[] = ['verniciatura','pavimenti','falegnameria','bagno','idraulica','cartongesso','elettricita','muratura','cucina','serramenti','giardino','attrezzi'];
  const categoryNames: Record<string,string> = {
    verniciatura:'Verniciatura', pavimenti:'Pavimenti', falegnameria:'Falegnameria', bagno:'Bagno',
    idraulica:'Idraulica', cartongesso:'Cartongesso', elettricita:'Elettricità', muratura:'Muratura',
    cucina:'Cucina', serramenti:'Serramenti', giardino:'Giardino', attrezzi:'Attrezzi e utensili'
  };
  return (
    <div className="w-full min-w-0 space-y-5 pb-10 sm:space-y-7">
      {searchQuery && <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm"><span>Ricerca: <b>{searchQuery}</b></span><button onClick={()=>onSearchChange('')} className="font-semibold text-orange-600">Cancella</button></div>}
      <section className="fdc-hero relative overflow-hidden rounded-2xl text-white shadow-xl">
        <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90" alt="Interno di casa moderna in fase di rinnovamento" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080d12]/95 via-[#101820]/75 to-[#101820]/15" />
        <div className="relative z-10 flex min-h-[390px] max-w-2xl flex-col justify-center px-6 py-10 sm:min-h-[410px] sm:px-10 lg:px-12">
          <span className="mb-4 inline-flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-orange-400"><span className="h-2 w-2 rounded-full bg-orange-500"/> La tua casa, il tuo progetto</span>
          <h1 className="mb-4 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">Il tuo punto di riferimento<br/>per il <span className="text-orange-500">Fai Da Te</span> in casa</h1>
          <p className="mb-7 max-w-xl text-sm leading-relaxed text-white/90 sm:text-lg">Guide passo passo, progetti, consigli esperti e l’Intelligenza Artificiale sempre al tuo fianco per ristrutturare, riparare e migliorare la tua casa.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onOpenCreateModal} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-orange-600"><PlayCircle size={18}/> Inizia un progetto</button>
            <button onClick={onNavigateAi} className="inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"><Sparkles size={18}/> Prova l’Assistente AI</button>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-5 right-7 hidden items-end gap-3 xl:flex"><div className="rounded-xl border border-white/20 bg-black/35 p-3 text-xs text-white backdrop-blur"><Hammer className="mb-1 text-orange-400"/> Progetta. Realizza. Migliora.</div></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="mb-3 flex items-center justify-between px-1"><h2 className="font-bold text-slate-900">Esplora per categoria</h2><button onClick={onNavigateCategories} className="inline-flex items-center gap-1 text-xs font-bold text-orange-600">Tutte <ArrowRight size={14}/></button></div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
          {categoryKeys.map(key => {
            const item = CATEGORIES_DATA[key];
            return <button key={key} onClick={()=>onSelectCategory(key)} className="group flex min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-1.5 py-3 text-center transition hover:border-orange-300 hover:bg-orange-50">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm transition group-hover:text-orange-600"><CategoryIcon category={key} className="h-6 w-6"/></span>
              <span className="line-clamp-2 text-[10px] font-bold leading-tight text-slate-800 sm:text-xs">{categoryNames[key]}</span>
            </button>
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[.9fr_1.8fr]">
        <section className="relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#101b2b] via-[#20234a] to-[#492d68] p-6 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl"/>
          <div className="relative z-10 flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/30 bg-cyan-400/10 text-5xl shadow-inner">🤖</div><div><span className="text-xs font-bold uppercase tracking-widest text-cyan-300">Sempre al tuo fianco</span><h2 className="mt-1 text-2xl font-extrabold leading-tight">Assistente AI<br/>per la tua casa</h2></div></div>
          <ul className="relative z-10 my-5 grid gap-2 text-sm text-white/90"><li>✓ Analizza le tue foto</li><li>✓ Ti propone soluzioni</li><li>✓ Stima materiali e costi</li><li>✓ Guide personalizzate</li></ul>
          <button onClick={onNavigateAi} className="relative z-10 inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Prova l’AI ora <ArrowRight size={17}/></button>
        </section>
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><Layers className="text-orange-500"/> Progetti in evidenza</h2><button onClick={onNavigateCategories} className="inline-flex items-center gap-1 text-xs font-bold text-orange-600">Vedi tutti <ArrowRight size={14}/></button></div>
          <div className="grid gap-3 md:grid-cols-3">
            {featured.map(p=><article key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button onClick={()=>onSelectCategory(p.key)} className="relative block h-36 w-full overflow-hidden text-left"><img src={p.image} alt={p.title} className="h-full w-full object-cover transition duration-500 hover:scale-105"/><span className="absolute bottom-2 left-2 rounded-md bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">{p.category}</span><span className="absolute right-2 top-2 rounded-full bg-black/45 p-1.5 text-white"><Heart size={15}/></span></button>
              <div className="p-3"><h3 className="min-h-10 text-sm font-extrabold leading-snug text-slate-900">{p.title}</h3><div className="mt-2 flex items-center justify-between text-[11px] text-slate-500"><span className="inline-flex items-center gap-1"><Wrench size={12}/> Difficoltà: {p.difficulty}</span><span className="inline-flex items-center gap-1"><Clock3 size={12}/> {p.time}</span></div></div>
            </article>)}
          </div>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {icon:BookOpen,title:'Guide passo passo',desc:'Tutorial dettagliati e facili da seguire'},
          {icon:Calculator,title:'Calcola materiali',desc:'Quantità, costi e lista acquisti'},
          {icon:ImageIcon,title:'Analizza una foto',desc:'Carica un’immagine e ricevi consigli immediati con l’AI'},
          {icon:Wrench,title:'Pianifica il tuo lavoro',desc:'Crea, salva e gestisci i tuoi progetti di casa'},
        ].map(({icon:Icon,title,desc})=><button key={title} onClick={title==='Analizza una foto'?onNavigateVision:title==='Pianifica il tuo lavoro'?onNavigateAi:onNavigateCategories} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Icon size={27}/></span><span><b className="block text-sm font-extrabold text-slate-900">{title}</b><span className="mt-1 block text-xs leading-relaxed text-slate-600">{desc}</span></span></button>)}
      </section>
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-extrabold text-slate-900">Hai un progetto in mente?</h2><p className="mt-1 text-sm text-slate-600">Inizia a organizzare il tuo prossimo lavoro in casa.</p></div><button onClick={onOpenCreateModal} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Crea il tuo progetto <ArrowRight size={16}/></button></section>
    </div>
  );
};
