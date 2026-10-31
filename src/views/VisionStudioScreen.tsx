import React, { useState, useEffect } from 'react';
import { VisionStudioMode, VisionStudioProject } from '../types';
import { projectService } from '../services/projectService';
import { VisionStudioDashboard } from '../components/vision-studio/VisionStudioDashboard';
import { VisionAiMode } from '../components/vision-studio/VisionAiMode';
import { Scan3dMode } from '../components/vision-studio/Scan3dMode';
import { AssistantAiMode } from '../components/vision-studio/AssistantAiMode';
import { Language, translations } from '../i18n/translations';
import { Sparkles, Box, MessageSquare, LayoutDashboard, ChevronRight } from 'lucide-react';

interface VisionStudioScreenProps {
  language: Language;
  initialMode?: VisionStudioMode;
}

export const VisionStudioScreen: React.FC<VisionStudioScreenProps> = ({
  language,
  initialMode = 'dashboard',
}) => {
  const t = translations[language];
  const [activeMode, setActiveMode] = useState<VisionStudioMode>(initialMode);
  const [project, setProject] = useState<VisionStudioProject>(projectService.getProject());

  useEffect(() => {
    const unsubscribe = projectService.subscribe((updated) => setProject({ ...updated }));
    return unsubscribe;
  }, []);

  const handleUpdateProject = (updates: Partial<VisionStudioProject>) => projectService.updateProject(updates);
  const handleUpdateCustomizations = (customs: Partial<VisionStudioProject['customizations']>) => projectService.updateCustomizations(customs);
  const handleUpdateDimensions = (width: number, length: number, height: number) => projectService.updateScanDimensions(width, length, height);
  const handleAddOpening = (opening: Parameters<typeof projectService.addOpening>[0]) => projectService.addOpening(opening);
  const handleRemoveOpening = (openingId: string) => projectService.removeOpening(openingId);
  const handleSendMessage = (msg: Parameters<typeof projectService.addChatMessage>[0]) => projectService.addChatMessage(msg);
  const handleToggleChecklist = (itemId: string) => projectService.toggleChecklistItem(itemId);
  const handleAddPhotoDiary = (entry: Parameters<typeof projectService.addPhotoDiaryEntry>[0]) => projectService.addPhotoDiaryEntry(entry);
  const handleDeletePhotoDiary = (entryId: string) => projectService.deletePhotoDiaryEntry(entryId);

  const modes: { id: VisionStudioMode; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vision-ai', label: 'Vision AI', icon: Sparkles },
    { id: 'scan-3d', label: 'Scan 3D', icon: Box },
    { id: 'assistant-ai', label: 'Assistant', icon: MessageSquare },
  ];

  return (
    <div className="w-full min-w-0 max-w-full space-y-6 overflow-x-clip">
      <div className="w-full min-w-0 max-w-full border-b border-[#E5DFD5] pb-3">
        <div className="flex min-w-0 items-center gap-1.5 pb-3 text-xs font-medium text-[#26343B]/60">
          <button onClick={() => setActiveMode('dashboard')} className="shrink-0 font-semibold hover:text-[#26343B] transition-colors">
            Vision Studio Hub
          </button>
          {activeMode !== 'dashboard' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B79B76]" />
              <span className="min-w-0 truncate font-bold text-[#26343B]">
                {modes.find((mode) => mode.id === activeMode)?.label}
              </span>
            </>
          )}
        </div>
        <nav aria-label="Sezioni Vision Studio" className="grid w-full min-w-0 max-w-full grid-cols-4 gap-1 rounded-2xl border border-[#E5DFD5] bg-white p-1">
          {modes.map(({ id, label, icon: Icon }) => {
            const active = activeMode === id;
            return (
              <button
                key={id}
                type="button"
                aria-current={active ? 'page' : undefined}
                aria-label={label}
                onClick={() => setActiveMode(id)}
                className={`flex min-h-10 min-w-0 w-full items-center justify-center gap-1 whitespace-nowrap rounded-xl px-1 py-2 text-[11px] font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B79B76] ${
                  active ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs' : 'text-[#26343B]/70 hover:bg-[#FAF8F5] hover:text-[#26343B]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${id === 'vision-ai' ? 'text-[#B79B76]' : ''}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="w-full min-w-0 max-w-full">
        {activeMode === 'dashboard' && <VisionStudioDashboard project={project} language={language} onSelectMode={setActiveMode} />}
        {activeMode === 'vision-ai' && <VisionAiMode project={project} language={language} onUpdateProject={handleUpdateProject} onUpdateCustomizations={handleUpdateCustomizations} onNavigateScan3D={() => setActiveMode('scan-3d')} />}
        {activeMode === 'scan-3d' && <Scan3dMode project={project} language={language} onUpdateDimensions={handleUpdateDimensions} onAddOpening={handleAddOpening} onRemoveOpening={handleRemoveOpening} onNavigateAssistant={() => setActiveMode('assistant-ai')} />}
        {activeMode === 'assistant-ai' && <AssistantAiMode project={project} language={language} onSendMessage={handleSendMessage} onToggleChecklist={handleToggleChecklist} onAddPhotoDiary={handleAddPhotoDiary} onDeletePhotoDiary={handleDeletePhotoDiary} onNavigateVisionAi={() => setActiveMode('vision-ai')} />}
      </div>
    </div>
  );
};
