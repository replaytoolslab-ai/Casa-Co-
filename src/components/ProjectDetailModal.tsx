import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Clock,
  Euro,
  Gauge,
  Hammer,
  Check,
  ChevronRight,
  Share2,
  Printer,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Layers,
  MapPin,
} from 'lucide-react';
import { Project } from '../types';
import { Language, translations } from '../i18n/translations';
import { CategoryIcon } from './CategoryIcon';
import { getProjectCostComparison } from '../data/mockData';
import { ProjectCostCalculator } from './ProjectCostCalculator';
import { ProjectDocumentArchive } from './ProjectDocumentArchive';
import { TrendingDown, HelpCircle, ShieldCheck as ShieldIcon, ExternalLink } from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  language: Language;
  isSaved: boolean;
  onToggleSave: (projectId: string) => void;
  onAddToMyProjects: (project: Project) => void;
  onOpenInVisionStudio?: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  language,
  isSaved,
  onToggleSave,
  onAddToMyProjects,
  onOpenInVisionStudio,
}) => {
  if (!project) return null;

  const t = translations[language];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [checkedMaterials, setCheckedMaterials] = useState<Record<number, boolean>>({});
  const [activeStepTab, setActiveStepTab] = useState<number>(1);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const images = project.gallery && project.gallery.length > 0 ? project.gallery : [project.coverImage];

  const toggleMaterial = (index: number) => {
    setCheckedMaterials((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleAdd = () => {
    onAddToMyProjects(project);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const difficultyText = {
    beginner: t.common.beginner,
    intermediate: t.common.intermediate,
    advanced: t.common.advanced,
  }[project.difficulty];

  const categoryName = t.categories.items[project.category]?.name || project.category;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-4xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-3xl border border-[#E5DFD5] shadow-2xl flex flex-col overflow-hidden text-[#26343B]">
        
        {/* Sticky Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-[#FAF8F5]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#EAE4D8] rounded-lg text-[#26343B]">
              <CategoryIcon category={project.category} className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#26343B]/80">
              {categoryName}
            </span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Share */}
            <button
              onClick={handleShare}
              title={t.common.share}
              className="p-2 text-[#26343B]/70 hover:text-[#26343B] hover:bg-[#EAE4D8] rounded-full transition-colors relative"
            >
              <Share2 className="w-4 h-4" />
              {copiedNotification && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-[#26343B] text-white px-2 py-0.5 rounded-sm whitespace-nowrap shadow-md">
                  Link copiato!
                </span>
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleSave(project.id)}
              className={`p-2 rounded-full transition-colors ${
                isSaved
                  ? 'bg-[#B79B76] text-white'
                  : 'text-[#26343B]/70 hover:text-[#26343B] hover:bg-[#EAE4D8]'
              }`}
              title={isSaved ? t.common.saved : t.common.saveProject}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-[#26343B]/70 hover:text-[#26343B] hover:bg-[#EAE4D8] rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8">
          
          {/* Header Title Section */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#26343B]/60 font-medium mb-2">
              <span>{project.room}</span>
              <span aria-hidden="true">·</span>
              <span>{project.dimensions}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#26343B] leading-tight">
              {project.title[language]}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#26343B]/80 leading-relaxed max-w-3xl">
              {project.description[language]}
            </p>
          </div>

          {/* Gallery Carousel */}
          <div className="space-y-3">
            <div className="relative aspect-16/10 sm:aspect-16/9 rounded-2xl overflow-hidden bg-[#EAE4D8] shadow-sm">
              <img
                src={images[selectedImageIndex] || project.coverImage}
                alt={project.title[language]}
                className="w-full h-full object-cover transition-all duration-500"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImageIndex === idx ? 'border-[#B79B76] scale-102' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs / Essential Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-[#E5DFD5]">
            <div className="p-3 bg-[#FAF8F5] rounded-xl">
              <span className="text-[11px] text-[#26343B]/60 font-medium block uppercase tracking-wider mb-1">
                {t.common.difficulty}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-[#26343B]">
                <Gauge className="w-4 h-4 text-[#B79B76]" />
                <span className="capitalize">{difficultyText}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl">
              <span className="text-[11px] text-[#26343B]/60 font-medium block uppercase tracking-wider mb-1">
                {t.common.timeRequired}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-[#26343B]">
                <Clock className="w-4 h-4 text-[#B79B76]" />
                <span>{project.timeEstimate[language]}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl">
              <span className="text-[11px] text-[#26343B]/60 font-medium block uppercase tracking-wider mb-1">
                {t.common.estimatedCost}
              </span>
              <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-[#26343B]">
                <Euro className="w-4 h-4 text-[#B79B76]" />
                <span>{project.costEstimate.currency}{project.costEstimate.min} - {project.costEstimate.max}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-xl">
              <span className="text-[11px] text-[#26343B]/60 font-medium block uppercase tracking-wider mb-1">
                Autore
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={project.author.avatar}
                  alt={project.author.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs font-bold text-[#26343B] truncate">
                  {project.author.name}
                </span>
              </div>
            </div>
          </div>

          {/* Master Craftsman Tip Highlight Box */}
          <div className="bg-[#26343B] text-[#F5F1E9] p-5 sm:p-6 rounded-2xl shadow-md border border-[#37474F] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B79B76]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#B79B76] text-[#26343B] flex-shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#B79B76] font-bold block mb-1">
                  {t.common.expertTip}
                </span>
                <p className="text-xs sm:text-sm text-[#F5F1E9]/90 leading-relaxed italic">
                  "{project.expertTip[language]}"
                </p>
                <span className="text-[11px] text-[#F5F1E9]/50 block mt-2">
                  — {project.author.name}, {project.author.title}
                </span>
              </div>
            </div>
          </div>

          {/* Editable quantity and cost estimate */}
          <ProjectCostCalculator
            projectId={project.id}
            initialArea={Number(project.dimensions.match(/[0-9]+(?:[.,][0-9]+)?/)?.[0]?.replace(',', '.') || 0)}
          />

          <ProjectDocumentArchive projectId={project.id} />

          {/* Quanto risparmi con il fai-da-te? (Cost Comparison & Ethical Disclaimer) */}
          {(() => {
            const comparison = getProjectCostComparison(project);
            return (
              <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E5DFD5] shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B79B76]/15 text-[#8F7451] text-[10px] font-bold uppercase tracking-wider mb-1">
                      <TrendingDown className="w-3.5 h-3.5 text-[#8F7451]" />
                      <span>Analisi Economica & Risparmio</span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26343B]">
                      Quanto risparmi con il fai-da-te?
                    </h3>
                  </div>
                  <span className="text-xs text-[#26343B]/60 font-medium self-start sm:self-auto">
                    Aggiornato al: <strong className="text-[#26343B]">{comparison.lastUpdated}</strong>
                  </span>
                </div>

                {/* Main 4 Numbers Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D8]">
                    <span className="text-[10px] uppercase font-bold text-[#26343B]/60 block mb-1">
                      Costo Professionista
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-bold text-[#26343B]/70 line-through block">
                      €{comparison.proEstimate}
                    </span>
                    <span className="text-[10px] text-[#26343B]/50 block">
                      Tariffa media fornitura + posa
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D8]">
                    <span className="text-[10px] uppercase font-bold text-[#26343B]/60 block mb-1">
                      Materiali Fai-da-te
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-bold text-[#26343B] block">
                      €{comparison.diyMaterialsCost}
                    </span>
                    <span className="text-[10px] text-[#26343B]/50 block">
                      Acquisto diretto senza ricarico
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D8]">
                    <span className="text-[10px] uppercase font-bold text-[#26343B]/60 block mb-1">
                      Attrezzatura / Noleggio
                    </span>
                    <span className="font-serif text-lg sm:text-xl font-bold text-[#26343B] block">
                      €{comparison.equipmentOrRentalCost}
                    </span>
                    <span className="text-[10px] text-[#26343B]/50 block">
                      Noleggio 1 gg o frese speciali
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#26343B] text-[#F5F1E9] rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-[#B79B76] block mb-1">
                      Risparmio Netto Stimato
                    </span>
                    <span className="font-serif text-xl sm:text-2xl font-bold text-[#F5F1E9] block">
                      + €{comparison.netSavings}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">
                      -{comparison.savingsPercentage}% rispetto a preventivo
                    </span>
                  </div>
                </div>

                {/* Analytical Breakdown Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#26343B]/80 mb-2.5">
                    Dettaglio analitico delle voci di costo
                  </h4>
                  <div className="overflow-x-auto rounded-xl border border-[#E5DFD5] max-w-full">
                    <table className="w-full min-w-[440px] text-xs text-left">
                      <thead className="bg-[#FAF8F5] text-[#26343B]/70 font-semibold border-b border-[#E5DFD5]">
                        <tr>
                          <th className="p-2.5">Voce di Capitolato</th>
                          <th className="p-2.5 text-right">Preventivo Pro</th>
                          <th className="p-2.5 text-right">Costo Fai-da-te</th>
                          <th className="p-2.5">Dettaglio e Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE1]">
                        {comparison.itemsBreakdown.map((item, idx) => (
                          <tr key={idx} className="hover:bg-[#FAF8F5]/60 transition-colors">
                            <td className="p-2.5 font-medium text-[#26343B]">{item.item}</td>
                            <td className="p-2.5 text-right font-mono text-[#26343B]/70">€{item.proCost}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-[#26343B]">
                              {item.diyCost > 0 ? `€${item.diyCost}` : '€0 (Escluso)'}
                            </td>
                            <td className="p-2.5 text-[#26343B]/65 text-[11px]">{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hypotheses & Ethical Disclaimer */}
                <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EAE4D8] space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#26343B]">
                    <HelpCircle className="w-4 h-4 text-[#B79B76]" />
                    <span>Ipotesi di calcolo adottate</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#26343B]/75 text-[11px] pl-1">
                    {comparison.hypotheses.map((hyp, i) => (
                      <li key={i}>{hyp}</li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-[#E5DFD5] text-[10px] text-[#26343B]/60 leading-relaxed italic">
                    {comparison.disclaimer[language]}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Two-Column Specs: Materials Checklist & Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Distinta Materiali (Materials Checklist) */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0EBE1]">
                <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#B79B76]" />
                  <span>{t.common.materials}</span>
                </h3>
                <span className="text-xs text-[#26343B]/60 font-medium">
                  {Object.values(checkedMaterials).filter(Boolean).length} / {project.materials.length} spuntati
                </span>
              </div>
              <ul className="space-y-2.5">
                {project.materials.map((mat, i) => {
                  const isChecked = !!checkedMaterials[i];
                  return (
                    <li
                      key={i}
                      onClick={() => toggleMaterial(i)}
                      className={`flex items-start justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                        isChecked ? 'bg-[#FAF8F5] opacity-60 line-through' : 'bg-[#F9F7F2] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center flex-shrink-0 border transition-colors ${
                            isChecked
                              ? 'bg-[#26343B] border-[#26343B] text-white'
                              : 'border-[#B79B76]/50 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-[#26343B] leading-tight">
                            {mat.name}
                          </p>
                          <span className="text-[11px] text-[#26343B]/60">
                            Quantità: {mat.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-[#8F7451] flex-shrink-0">
                        {mat.approxCost}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Strumenti Necessari (Required Tools) */}
            <div className="bg-white p-5 rounded-2xl border border-[#E5DFD5]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#F0EBE1]">
                <h3 className="font-serif text-lg font-bold text-[#26343B] flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-[#B79B76]" />
                  <span>{t.common.tools}</span>
                </h3>
                <span className="text-xs text-[#26343B]/60 font-medium">
                  {project.tools.length} utensili
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {project.tools.map((tool, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAF8F5] text-xs sm:text-sm font-medium text-[#26343B]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#B79B76] flex-shrink-0" />
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Fasi di Realizzazione (Step-by-step roadmap) */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E5DFD5]">
            <div className="mb-5 pb-3 border-b border-[#F0EBE1]">
              <h3 className="font-serif text-xl font-bold text-[#26343B]">
                {t.common.steps}
              </h3>
              <p className="text-xs text-[#26343B]/60 mt-0.5">
                Segui scrupolosamente la sequenza per garantire planarità, sicurezza e tenuta strutturale.
              </p>
            </div>

            <div className="space-y-4">
              {project.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4D8] hover:border-[#B79B76]/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-full bg-[#26343B] text-[#F5F1E9] text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {step.stepNumber}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-[#26343B]">
                        {step.title}
                      </h4>
                    </div>
                    <span className="text-xs text-[#8F7451] font-medium bg-[#EAE4D8]/60 px-2.5 py-0.5 rounded-full">
                      {step.duration}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#26343B]/80 leading-relaxed pl-9">
                    {step.description}
                  </p>

                  {step.tip && (
                    <div className="mt-3 ml-9 p-2.5 rounded-lg bg-[#F5F1E9] border border-[#E0D7C9] text-xs text-[#26343B]/80 flex items-start gap-2">
                      <span className="text-[#B79B76] font-bold">Consiglio:</span>
                      <span>{step.tip}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="sticky bottom-0 z-20 bg-[#FAF8F5] px-3 sm:px-8 py-3 border-t border-[#E5DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 safe-area-bottom">
          <div className="hidden sm:block">
            <span className="text-xs text-[#26343B]/60 block leading-tight">
              {t.common.estimatedCost}
            </span>
            <span className="font-serif font-bold text-lg text-[#26343B]">
              {project.costEstimate.currency}{project.costEstimate.min} – {project.costEstimate.max}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
            {onOpenInVisionStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInVisionStudio(project);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#B79B76] text-[#26343B] text-[11px] sm:text-xs font-bold hover:bg-[#c4a985] transition-colors shadow-xs active:scale-98 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#26343B] shrink-0" />
                <span className="sm:hidden">Vision Studio</span>
                <span className="hidden sm:inline">Apri in Vision Studio</span>
              </button>
            )}

            <button
              onClick={handleAdd}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#26343B] text-[#F5F1E9] text-[11px] sm:text-xs font-semibold hover:bg-[#1A242A] transition-colors shadow-sm active:scale-98 cursor-pointer whitespace-nowrap"
            >
              <Hammer className="w-3.5 h-3.5 text-[#B79B76] shrink-0" />
              <span>{t.home.heroCta}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#E5DFD5] text-[#26343B] text-[11px] sm:text-xs font-medium hover:bg-[#EAE4D8] transition-colors cursor-pointer shrink-0"
            >
              {t.common.close}
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {addedToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#26343B] text-[#F5F1E9] px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#B79B76]" />
            <span>Progetto aggiunto alla tua scrivania cantieri!</span>
          </div>
        )}

      </div>
    </div>
  );
};
