import React from 'react';
import { useApp } from './src/hooks/useApp';
import Toast from './src/components/ui/Toast';
import { Sidebar, MobileHeader } from './src/components/features/Layout';
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
    upcomingCommissions,
    dashboardStats,
    handleUpdateSettings,
    handleAddCandidate,
    handleAddVacancy,
    toggleVacancyStatus,
    handleAddPlacement,
    markCommissionPaid,
    saveCvData,
    generateCVContentWithAI,
    addEducation, removeEducation, updateEducation,
    addExperience, removeExperience, updateExperience,
    connectSupabase, disconnectSupabase
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
            upcomingCommissions={upcomingCommissions}
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
            markCommissionPaid={markCommissionPaid}
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
      />

      <main className="flex-1 flex flex-col relative h-full">
        {!showPreview && <MobileHeader setIsSidebarOpen={setIsSidebarOpen} settings={settings} />}

        <div className={`flex-1 p-4 lg:p-8 ${showPreview ? 'p-0' : ''}`}>
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : renderContent()}
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

export default App;