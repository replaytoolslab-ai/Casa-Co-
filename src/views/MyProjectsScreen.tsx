import React, { useState } from 'react';
import {
  FolderKanban,
  Hammer,
  Clock,
  Euro,
  CheckCircle2,
  Bookmark,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserProject, CategoryId } from '../types';
import { Language, translations } from '../i18n/translations';
import { CategoryIcon } from '../components/CategoryIcon';

interface MyProjectsScreenProps {
  language: Language;
  projects: UserProject[];
  isLoading: boolean;
  isSignedIn: boolean;
  onOpenCreateModal: () => void;
  onUpdateProjectProgress: (projectId: string, progress: number) => void;
  onRemoveProject: (projectId: string) => void;
  onUpdateNotes: (projectId: string, notes: string) => void;
  onOpenInVisionStudio?: (project: UserProject) => void;
}

export const MyProjectsScreen: React.FC<MyProjectsScreenProps> = ({
  language,
  projects,
  isLoading,
  isSignedIn,
  onOpenCreateModal,
  onUpdateProjectProgress,
  onRemoveProject,
  onUpdateNotes,
  onOpenInVisionStudio,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'saved' | 'completed'>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'all') return true;
    return p.status === activeTab;
  });

  const handleStartEditNotes = (project: UserProject) => {
    setEditingNotesId(project.id);
    setTempNotes(project.notes);
  };

  const handleSaveNotes = (projectId: string) => {
    onUpdateNotes(projectId, tempNotes);
    setEditingNotesId(null);
  };

  const advanceStep = (project: UserProject) => {
    const nextProgress = Math.min(100, project.progress + 25);
    onUpdateProjectProgress(project.id, nextProgress);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-1">
            Banco di Lavoro Personale
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#26343B]">
            {t.myProjects.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1">
            {t.myProjects.subtitle}
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#26343B] text-[#F5F1E9] text-xs sm:text-sm font-semibold hover:bg-[#1A242A] transition-colors shadow-xs active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#B79B76]" />
          <span>{t.myProjects.newProjectBtn}</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-[#E5DFD5] w-full sm:w-auto self-start overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'all'
              ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
              : 'text-[#26343B]/70 hover:text-[#26343B]'
          }`}
        >
          {t.myProjects.tabAll} ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('in_progress')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'in_progress'
              ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
              : 'text-[#26343B]/70 hover:text-[#26343B]'
          }`}
        >
          {t.myProjects.tabInProgress} ({projects.filter((p) => p.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'saved'
              ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
              : 'text-[#26343B]/70 hover:text-[#26343B]'
          }`}
        >
          {t.myProjects.tabSaved} ({projects.filter((p) => p.status === 'saved').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'completed'
              ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
              : 'text-[#26343B]/70 hover:text-[#26343B]'
          }`}
        >
          {t.myProjects.tabCompleted} ({projects.filter((p) => p.status === 'completed').length})
        </button>
      </div>

      {/* Projects List Grid */}
      {!isSignedIn ? (
        <div className="bg-white p-10 rounded-3xl border border-[#E5DFD5] text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-[#8F7451] flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#26343B]">Accedi per vedere i tuoi progetti</h3>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-2 leading-relaxed">
            I progetti vengono salvati nel tuo account e saranno disponibili anche dagli altri dispositivi.
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white p-10 rounded-3xl border border-[#E5DFD5] text-center text-sm text-[#26343B]/70">
          Caricamento dei tuoi progetti…
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isEditing = editingNotesId === project.id;

            return (
              <div
                key={project.id}
                className="bg-white rounded-3xl border border-[#E5DFD5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Thumbnail */}
                  <div className="relative aspect-16/9 w-full bg-[#EAE4D8] overflow-hidden">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category tag */}
                    <div className="absolute top-3 left-3 bg-[#26343B]/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                      <CategoryIcon category={project.category} className="w-3.5 h-3.5" />
                      <span>{t.categories.items[project.category]?.name || project.category}</span>
                    </div>

                    {/* AI Generated tag if applicable */}
                    {project.isAiGenerated && (
                      <div className="absolute top-3 right-3 bg-[#B79B76] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>AI Design</span>
                      </div>
                    )}

                    {/* Progress Bar Over Image Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
                      <div
                        className="h-full bg-[#B79B76] transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-[#26343B]/60 mb-1.5 font-medium">
                      <span>{project.timeEstimate}</span>
                      <span>{project.costEstimate}</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#26343B] leading-snug mb-3">
                      {project.title}
                    </h3>

                    {/* Progress details */}
                    <div className="mb-4 p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE4D8]">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#26343B] mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#B79B76]" />
                          <span>{t.myProjects.progressLabel}</span>
                        </span>
                        <span>{project.progress}%</span>
                      </div>

                      <div className="w-full bg-[#E5DFD5] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#26343B] h-full rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      {project.progress < 100 && (
                        <button
                          onClick={() => advanceStep(project)}
                          className="mt-2.5 w-full py-1.5 text-center text-[11px] font-semibold text-[#26343B] bg-white hover:bg-[#EAE4D8] border border-[#E5DFD5] rounded-lg transition-colors"
                        >
                          + Avanza passaggio cantiere (+25%)
                        </button>
                      )}
                    </div>

                    {/* Notes Box */}
                    <div className="text-xs">
                      <div className="flex items-center justify-between text-[#26343B]/60 mb-1">
                        <span className="font-bold uppercase tracking-wider text-[10px]">
                          Note di cantiere:
                        </span>
                        {!isEditing ? (
                          <button
                            onClick={() => handleStartEditNotes(project)}
                            className="text-[#8F7451] hover:underline flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Modifica</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSaveNotes(project.id)}
                            className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]"
                          >
                            <Check className="w-3 h-3" />
                            <span>Salva</span>
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="w-full p-2 bg-[#FAF8F5] border border-[#B79B76] rounded-lg text-xs outline-none resize-none"
                        />
                      ) : (
                        <p className="text-[#26343B]/80 italic bg-[#FAF8F5] p-2.5 rounded-lg border border-[#F0EBE1] leading-relaxed">
                          "{project.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#FAF8F5] border-t border-[#F0EBE1] flex flex-col gap-2.5">
                  {onOpenInVisionStudio && (
                    <button
                      onClick={() => onOpenInVisionStudio(project)}
                      className="w-full py-2 px-3 rounded-xl bg-[#26343B] text-[#F5F1E9] text-xs font-semibold hover:bg-[#1A242A] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer group"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B79B76] group-hover:rotate-12 transition-transform" />
                      <span>Apri in Vision Studio</span>
                    </button>
                  )}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-[#26343B]/50">
                      {project.lastUpdated}
                    </span>

                    <button
                      onClick={() => onRemoveProject(project.id)}
                      className="p-1.5 text-[#26343B]/40 hover:text-red-700 transition-colors rounded-lg cursor-pointer"
                      title="Rimuovi progetto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-[#E5DFD5] text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-[#8F7451] flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#26343B]">
            {t.myProjects.emptyTitle}
          </h3>
          <p className="text-xs sm:text-sm text-[#26343B]/70 mt-1 mb-6 leading-relaxed">
            {t.myProjects.emptyDesc}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-[#26343B] text-[#F5F1E9] text-xs sm:text-sm font-semibold hover:bg-[#1A242A] transition-colors"
          >
            {t.myProjects.newProjectBtn}
          </button>
        </div>
      )}

    </div>
  );
};
