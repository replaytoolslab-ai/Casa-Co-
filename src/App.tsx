/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { NavTab, BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { HomeScreen } from './views/HomeScreen';
import { CategoriesScreen } from './views/CategoriesScreen';
import { AIProjectScreen } from './views/AIProjectScreen';
import { MyProjectsScreen } from './views/MyProjectsScreen';
import { ProfileScreen } from './views/ProfileScreen';
import { VisionStudioScreen } from './views/VisionStudioScreen';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { CategoryId, Project, UserProject } from './types';
import { INITIAL_USER_PROJECTS, MOCK_PROJECTS } from './data/mockData';
import { Language } from './i18n/translations';
import { projectService } from './services/projectService';
import { AuthSession, authService } from './services/authService';
import { Search, X, Sparkles, Smartphone, Monitor } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let active = true;
    authService.restoreSession().then((session) => {
      if (!active) return;
      setAuthSession(session);
      const preferredLanguage = session?.user.user_metadata?.preferred_language;
      if (preferredLanguage === 'it' || preferredLanguage === 'en') setLanguage(preferredLanguage);
    });
    return () => { active = false; };
  }, []);
  const [language, setLanguage] = useState<Language>('it');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileDeviceView, setIsMobileDeviceView] = useState(false);

  // User State
  const [userProjects, setUserProjects] = useState<UserProject[]>(INITIAL_USER_PROJECTS);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(['proj-01', 'proj-03', 'proj-05']);

  // Handle Bookmarks Toggle
  const handleToggleSave = (projectId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  // Add project to workbench
  const handleAddToMyProjects = (proj: Project) => {
    const existing = userProjects.find((p) => p.projectId === proj.id);
    if (!existing) {
      const newUserProj: UserProject = {
        id: `user-${Date.now()}`,
        projectId: proj.id,
        title: proj.title[language],
        category: proj.category,
        coverImage: proj.coverImage,
        progress: 10,
        status: 'in_progress',
        lastUpdated: 'Oggi',
        notes: `Cantiere avviato da scheda tecnica Casa&Co. Budget: ${proj.costEstimate.currency}${proj.costEstimate.min}-${proj.costEstimate.max}.`,
        completedSteps: [],
        totalSteps: proj.steps.length,
        difficulty: proj.difficulty,
        timeEstimate: proj.timeEstimate[language],
        costEstimate: `${proj.costEstimate.currency}${proj.costEstimate.min} - ${proj.costEstimate.max}`,
      };
      setUserProjects((prev) => [newUserProj, ...prev]);
    }
  };

  // Add generated AI or custom project
  const handleAddCustomProject = (proj: UserProject) => {
    setUserProjects((prev) => [proj, ...prev]);
  };

  const handleUpdateProgress = (projectId: string, progress: number) => {
    setUserProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              progress,
              status: progress >= 100 ? 'completed' : 'in_progress',
              lastUpdated: 'Adesso',
            }
          : p
      )
    );
  };

  const handleRemoveProject = (projectId: string) => {
    setUserProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const handleUpdateNotes = (projectId: string, notes: string) => {
    setUserProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, notes, lastUpdated: 'Adesso' } : p))
    );
  };

  // Category select handler from Home or Categories
  const handleSelectCategory = (catId: CategoryId | null) => {
    setSelectedCategory(catId);
    setCurrentTab('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate directly to Vision Studio
  const handleNavigateVision = () => {
    setCurrentTab('vision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open any catalog project in Vision Studio
  const handleOpenInVisionStudio = (proj: Project) => {
    projectService.updateProject({
      name: proj.title[language],
      roomType: proj.room,
      mainImage: proj.coverImage,
      beforeImage: proj.gallery?.[0] || proj.coverImage,
      budget: {
        target: proj.costEstimate.max,
        spent: proj.costEstimate.min,
        estimatedTotal: proj.costEstimate.max,
        currency: proj.costEstimate.currency,
      },
    });
    setSelectedProject(null);
    setCurrentTab('vision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open user saved project in Vision Studio
  const handleOpenUserProjectInVision = (userProj: UserProject) => {
    projectService.updateProject({
      name: userProj.title,
      roomType: userProj.category,
      mainImage: userProj.coverImage,
      progress: userProj.progress,
    });
    setCurrentTab('vision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate directly to AI Studio
  const handleNavigateAi = () => {
    setCurrentTab('ai');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to My Projects
  const handleNavigateProjects = () => {
    setCurrentTab('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeProjectsCount = userProjects.filter((p) => p.status === 'in_progress').length;
  const completedProjectsCount = userProjects.filter((p) => p.status === 'completed').length;

  // Active view router
  const renderScreen = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            language={language}
            onSelectProject={(p) => setSelectedProject(p)}
            onSelectCategory={handleSelectCategory}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onNavigateAi={handleNavigateAi}
            onNavigateVision={handleNavigateVision}
            onNavigateCategories={() => {
              setSelectedCategory(null);
              setCurrentTab('categories');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            savedProjectIds={savedProjectIds}
            onToggleSave={handleToggleSave}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        );
      case 'vision':
        return <VisionStudioScreen language={language} />;
      case 'categories':
        return (
          <CategoriesScreen
            language={language}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectProject={(p) => setSelectedProject(p)}
            savedProjectIds={savedProjectIds}
            onToggleSave={handleToggleSave}
          />
        );
      case 'ai':
        return (
          <AIProjectScreen
            language={language}
            onSaveGeneratedProject={handleAddCustomProject}
            onNavigateProjects={handleNavigateProjects}
          />
        );
      case 'projects':
        return (
          <MyProjectsScreen
            language={language}
            projects={userProjects}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onUpdateProjectProgress={handleUpdateProgress}
            onRemoveProject={handleRemoveProject}
            onUpdateNotes={handleUpdateNotes}
            onOpenInVisionStudio={handleOpenUserProjectInVision}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            language={language}
            onLanguageChange={setLanguage}
            completedCount={completedProjectsCount}
            session={authSession}
            onSessionChange={(session) => {
              setAuthSession(session);
              const preferredLanguage = session?.user.user_metadata?.preferred_language;
              if (preferredLanguage === 'it' || preferredLanguage === 'en') setLanguage(preferredLanguage);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E9] text-[#26343B] flex flex-col font-sans selection:bg-[#B79B76]/20 selection:text-[#26343B]">
      
      {/* Device frame container logic for testing */}
      <div
        className={
          isMobileDeviceView
            ? 'py-8 px-4 flex flex-col items-center justify-center min-h-screen bg-[#E5DFD5]'
            : 'w-full'
        }
      >
        <div
          className={
            isMobileDeviceView
              ? 'w-full max-w-[400px] h-[860px] bg-[#F5F1E9] rounded-[48px] border-[10px] border-[#26343B] shadow-2xl overflow-hidden flex flex-col relative'
              : 'w-full flex flex-col flex-1'
          }
        >
          {/* Simulated smartphone status notch in device mode */}
          {isMobileDeviceView && (
            <div className="bg-[#26343B] text-white px-6 py-2 flex items-center justify-between text-[11px] font-mono z-50">
              <span>9:41</span>
              <div className="w-20 h-4 bg-black rounded-full" />
              <span>5G 100%</span>
            </div>
          )}

          {/* Sticky Header */}
          <Header
            language={language}
            onLanguageChange={setLanguage}
            savedCount={savedProjectIds.length}
            onOpenSaved={handleNavigateProjects}
            onOpenSearch={() => setIsMobileSearchOpen(true)}
            isMobileDeviceView={isMobileDeviceView}
            onToggleDeviceView={() => setIsMobileDeviceView(!isMobileDeviceView)}
            onNavigateAi={handleNavigateAi}
            onNavigateVision={handleNavigateVision}
            currentSearchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Mobile Search Overlay Modal */}
          {isMobileSearchOpen && (
            <div className="fixed inset-0 z-50 bg-[#F5F1E9] p-4 flex flex-col animate-in fade-in">
              <div className="flex items-center gap-2 pb-4 border-b border-[#E5DFD5]">
                <Search className="w-5 h-5 text-[#26343B]/60" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca progetti, tecniche, essenze..."
                  className="flex-1 bg-transparent text-base outline-none text-[#26343B]"
                />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 text-[#26343B]/70 hover:text-[#26343B]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-4">
                <span className="text-xs uppercase tracking-wider text-[#8F7451] font-bold block mb-2">
                  Ricerche Frequenti
                </span>
                <div className="flex flex-wrap gap-2">
                  {['Tavolo massello', 'Microcemento', 'Pergola', 'Cannettato', 'Teak'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setIsMobileSearchOpen(false);
                        setCurrentTab('home');
                      }}
                      className="px-3 py-1.5 rounded-full bg-white border border-[#E5DFD5] text-xs font-medium text-[#26343B]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main App Content Area */}
          <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-8 lg:px-10 pt-5 sm:pt-8 pb-28 sm:pb-32 overflow-y-auto overflow-x-hidden safe-area-bottom">
            {renderScreen()}
          </main>

          {/* Sticky Bottom Navigation Bar */}
          <BottomNav
            currentTab={currentTab}
            onTabChange={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            language={language}
            activeProjectsBadge={activeProjectsCount}
          />
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        language={language}
        isSaved={selectedProject ? savedProjectIds.includes(selectedProject.id) : false}
        onToggleSave={handleToggleSave}
        onAddToMyProjects={handleAddToMyProjects}
        onOpenInVisionStudio={handleOpenInVisionStudio}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        language={language}
        onNavigateAi={handleNavigateAi}
        onNavigateVision={handleNavigateVision}
        onAddCustomProject={handleAddCustomProject}
      />

    </div>
  );
}
