import React from 'react';
import { Bookmark, Clock, Euro, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';
import { Language, translations } from '../i18n/translations';

interface ProjectCardProps {
  project: Project;
  language: Language;
  onSelect: (project: Project) => void;
  isSaved?: boolean;
  onToggleSave?: (projectId: string, e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  language,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  const t = translations[language];

  const difficultyLabel = {
    beginner: t.common.beginner,
    intermediate: t.common.intermediate,
    advanced: t.common.advanced,
  }[project.difficulty];

  const categoryName = t.categories.items[project.category]?.name || project.category;

  return (
    <article
      onClick={() => onSelect(project)}
      className="group cursor-pointer bg-white rounded-2xl border border-[#E5DFD5] overflow-hidden hover:shadow-xl hover:border-[#B79B76]/50 transition-all duration-300 flex flex-col"
    >
      {/* Visual Photography Container */}
      <div className="relative aspect-16/10 sm:aspect-16/9 w-full overflow-hidden bg-[#EFEAE1]">
        <img
          src={project.coverImage}
          alt={project.title[language]}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Subtle Category Watermark & Save Button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

        {/* Category quiet kicker over image */}
        <div className="absolute top-3.5 left-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white drop-shadow-sm bg-[#26343B]/80 backdrop-blur-xs px-2.5 py-1 rounded-md">
            {categoryName}
          </span>
        </div>

        {/* Quick bookmark action */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(project.id, e);
            }}
            aria-label={isSaved ? "Rimuovi dai salvati" : "Salva progetto"}
            title={isSaved ? "Rimuovi dai salvati" : "Salva progetto"}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              isSaved
                ? 'bg-[#B79B76] text-white'
                : 'bg-white/80 text-[#26343B] hover:bg-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Cost Badge overlay bottom-right */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md shadow-xs text-xs font-semibold text-[#26343B]">
          {project.costEstimate.currency}
          {project.costEstimate.min} - {project.costEstimate.max}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata (Zero-pill discipline per Constitution) */}
          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-[#26343B]/70 font-medium mb-2">
            <span className="capitalize">{difficultyLabel}</span>
            <span aria-hidden="true" className="text-[#B79B76]">·</span>
            <span>{project.timeEstimate[language]}</span>
            <span aria-hidden="true" className="text-[#B79B76]">·</span>
            <span className="text-[#26343B]/60">{project.room}</span>
          </div>

          {/* Project Title */}
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26343B] group-hover:text-[#8F7451] transition-colors leading-snug mb-2 break-words">
            {project.title[language]}
          </h3>

          {/* Project Description */}
          <p className="text-xs sm:text-sm text-[#26343B]/75 line-clamp-2 leading-relaxed mb-4">
            {project.description[language]}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-[#F0EBE1] flex items-center justify-between gap-2 mt-auto">
          {/* Author avatar & name */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={project.author.avatar}
              alt={project.author.name}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
            <span className="text-xs text-[#26343B]/70 truncate font-medium">
              {project.author.name}
            </span>
          </div>

          {/* Details trigger button */}
          <button
            onClick={() => onSelect(project)}
            className="flex items-center gap-1 text-xs font-semibold text-[#26343B] hover:text-[#B79B76] transition-colors py-1 pl-2"
          >
            <span>{t.common.viewDetails}</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
