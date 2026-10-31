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

  // Subscribe to changes in the unified project service
  useEffect(() => {
    const unsubscribe = projectService.subscribe((updated) => {
      setProject({ ...updated });
    });
    return unsubscribe;
  }, []);

  const handleUpdateProject = (updates: Partial<VisionStudioProject>) => {
    projectService.updateProject(updates);
  };

  const handleUpdateCustomizations = (customs: Partial<VisionStudioProject['customizations']>) => {
    projectService.updateCustomizations(customs);
  };

  const handleUpdateDimensions = (width: number, length: number, height: number) => {
    projectService.updateScanDimensions(width, length, height);
  };

  const handleAddOpening = (opening: Parameters<typeof projectService.addOpening>[0]) => {
    projectService.addOpening(opening);
  };

  const handleRemoveOpening = (openingId: string) => {
    projectService.removeOpening(openingId);
  };

  const handleSendMessage = (msg: Parameters<typeof projectService.addChatMessage>[0]) => {
    projectService.addChatMessage(msg);
  };

  const handleToggleChecklist = (itemId: string) => {
    projectService.toggleChecklistItem(itemId);
  };

  const handleAddPhotoDiary = (entry: Parameters<typeof projectService.addPhotoDiaryEntry>[0]) => {
    projectService.addPhotoDiaryEntry(entry);
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation bar between Vision Studio modes */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E5DFD5] flex-wrap gap-3">
        {/* Breadcrumb indicator */}
        <div className="flex items-center gap-1.5 text-xs text-[#26343B]/60 font-medium">
          <button
            onClick={() => setActiveMode('dashboard')}
            className="hover:text-[#26343B] transition-colors font-semibold"
          >
            Vision Studio Hub
          </button>
          {activeMode !== 'dashboard' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#B79B76]" />
              <span className="text-[#26343B] font-bold capitalize">
                {activeMode === 'vision-ai'
                  ? 'Vision AI'
                  : activeMode === 'scan-3d'
                  ? 'Scan 3D'
                  : 'Assistant AI'}
              </span>
            </>
          )}
        </div>

        {/* Mode Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-[#E5DFD5] shadow-2xs overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveMode('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'dashboard'
                ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                : 'text-[#26343B]/70 hover:text-[#26343B]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveMode('vision-ai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'vision-ai'
                ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                : 'text-[#26343B]/70 hover:text-[#26343B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B79B76]" />
            <span>Vision AI</span>
          </button>

          <button
            onClick={() => setActiveMode('scan-3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'scan-3d'
                ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                : 'text-[#26343B]/70 hover:text-[#26343B]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Scan 3D</span>
          </button>

          <button
            onClick={() => setActiveMode('assistant-ai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'assistant-ai'
                ? 'bg-[#26343B] text-[#F5F1E9] shadow-xs'
                : 'text-[#26343B]/70 hover:text-[#26343B]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Assistant AI</span>
          </button>
        </div>
      </div>

      {/* Active Mode View */}
      {activeMode === 'dashboard' && (
        <VisionStudioDashboard
          project={project}
          language={language}
          onSelectMode={(mode) => setActiveMode(mode)}
        />
      )}

      {activeMode === 'vision-ai' && (
        <VisionAiMode
          project={project}
          language={language}
          onUpdateProject={handleUpdateProject}
          onUpdateCustomizations={handleUpdateCustomizations}
          onNavigateScan3D={() => setActiveMode('scan-3d')}
        />
      )}

      {activeMode === 'scan-3d' && (
        <Scan3dMode
          project={project}
          language={language}
          onUpdateDimensions={handleUpdateDimensions}
          onAddOpening={handleAddOpening}
          onRemoveOpening={handleRemoveOpening}
          onNavigateAssistant={() => setActiveMode('assistant-ai')}
        />
      )}

      {activeMode === 'assistant-ai' && (
        <AssistantAiMode
          project={project}
          language={language}
          onSendMessage={handleSendMessage}
          onToggleChecklist={handleToggleChecklist}
          onAddPhotoDiary={handleAddPhotoDiary}
          onNavigateVisionAi={() => setActiveMode('vision-ai')}
        />
      )}

    </div>
  );
};
