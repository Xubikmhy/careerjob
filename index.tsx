import React from 'react';
import { createRoot } from 'react-dom/client';
console.log("Entry Point index.tsx running");
import { useApp } from './src/hooks/useApp';
import Toast from './src/components/ui/Toast';
import { Sidebar, MobileHeader, Header } from './src/components/features/Layout';
import SearchResults from './src/components/features/SearchResults';
import Dashboard from './src/components/features/Dashboard';
import CandidateList from './src/components/features/CandidateList';
import VacancyList from './src/components/features/VacancyList';
import PlacementList from './src/components/features/PlacementList';
import SettingsView from './src/components/features/SettingsView';
import CVStudio from './src/components/features/CVStudio';
import { CandidateModal, VacancyModal, PlacementModal, MatchingModal } from './src/components/features/Modals';

const App = () => {
  const {
    activeView, setActiveView,
    settings, setSettings,
    candidates,
    vacancies,
    placements,
    isLoading,
    supabase,
    generatingId,
    fetchErrorMessage,
    matchingVacancyId, setMatchingVacancyId,
    isCandidateModalOpen, setIsCandidateModalOpen,
    isVacancyModalOpen, setIsVacancyModalOpen,
    isPlacementModalOpen, setIsPlacementModalOpen,
    studioCandidateId, setStudioCandidateId,
    showPreview, setShowPreview,
    isAiGenerating,
    cvForm, setCvForm,
    isSidebarOpen, setIsSidebarOpen,
    isSubmitting,
    timeFilter, setTimeFilter,
    toast, setToast,
    fetchData,
    getCandidateName,
    dashboardStats,
    handleUpdateSettings,
    handleAddCandidate,
    handleAddVacancy,
    toggleVacancyStatus,
    handleAddPlacement,
    saveCvData,
    generateCVContentWithAI,
    addEducation, removeEducation, updateEducation,
    addExperience, removeExperience, updateExperience,
    connectSupabase, disconnectSupabase,
    searchQuery, setSearchQuery, searchResults
  } = useApp();

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            candidates={candidates}
            vacancies={vacancies}
            placements={placements}
            dashboardStats={dashboardStats}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            fetchData={fetchData}
            setIsCandidateModalOpen={setIsCandidateModalOpen}
            setActiveView={setActiveView}
            getCandidateName={getCandidateName}
          />
        );
      case 'candidates':
        return (
          <CandidateList
            candidates={candidates}
            setIsCandidateModalOpen={setIsCandidateModalOpen}
            setStudioCandidateId={setStudioCandidateId}
            setShowPreview={setShowPreview}
            setActiveView={setActiveView}
          />
        );
      case 'vacancies':
        return (
          <VacancyList
            vacancies={vacancies}
            setIsVacancyModalOpen={setIsVacancyModalOpen}
            setMatchingVacancyId={setMatchingVacancyId}
            toggleVacancyStatus={toggleVacancyStatus}
          />
        );
      case 'placements':
        return (
          <PlacementList
            placements={placements}
            setIsPlacementModalOpen={setIsPlacementModalOpen}
            getCandidateName={getCandidateName}
          />
        );
      case 'settings':
        return (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
            handleUpdateSettings={handleUpdateSettings}
            isSubmitting={isSubmitting}
          />
        );
      case 'cv_studio':
        return (
          <CVStudio
            cvForm={cvForm}
            setCvForm={setCvForm}
            candidates={candidates}
            studioCandidateId={studioCandidateId}
            setStudioCandidateId={setStudioCandidateId}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
            isAiGenerating={isAiGenerating}
            generateCVContentWithAI={generateCVContentWithAI}
            saveCvData={saveCvData}
            addEducation={addEducation}
            removeEducation={removeEducation}
            updateEducation={updateEducation}
            addExperience={addExperience}
            removeExperience={removeExperience}
            updateExperience={updateExperience}
            settings={settings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
        settings={settings}
        supabaseConnected={!!supabase}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        {!showPreview && <MobileHeader setIsSidebarOpen={setIsSidebarOpen} settings={settings} />}

        {/* Desktop Header (Hidden on Mobile) */}
        {!showPreview && <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} activeView={activeView} />}

        <div className={`flex-1 p-4 lg:p-8 overflow-y-auto ${showPreview ? 'p-0' : ''}`}>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            // If there is a search query, Overlay the search results OR switch view? 
            // Better to switch view or just render conditionally.
            searchQuery ? (
              <SearchResults
                query={searchQuery}
                results={searchResults}
                onNavigate={(view) => {
                  setActiveView(view);
                  setSearchQuery(""); // Clear search on navigation
                }}
              />
            ) : renderContent()
          )}
        </div>

        {/* Modals */}
        {isCandidateModalOpen && (
          <CandidateModal
            onClose={() => setIsCandidateModalOpen(false)}
            onSubmit={handleAddCandidate}
            isSubmitting={isSubmitting}
          />
        )}

        {isVacancyModalOpen && (
          <VacancyModal
            onClose={() => setIsVacancyModalOpen(false)}
            onSubmit={handleAddVacancy}
            isSubmitting={isSubmitting}
          />
        )}

        {isPlacementModalOpen && (
          <PlacementModal
            candidates={candidates}
            onClose={() => setIsPlacementModalOpen(false)}
            onSubmit={handleAddPlacement}
            isSubmitting={isSubmitting}
          />
        )}

        {matchingVacancyId && (
          <MatchingModal
            candidates={candidates}
            onClose={() => setMatchingVacancyId(null)}
            onSelect={(id) => {
              setStudioCandidateId(id);
              setMatchingVacancyId(null);
              setActiveView('cv_studio');
            }}
          />
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;
