// CRISISCACHE Root Application
import React from 'react';
import { CrisisCacheProvider, useCrisisCache } from './state/store';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CitizenView } from './components/citizen/CitizenView';
import { CommandCenter } from './components/dashboard/CommandCenter';
import { IncidentMap } from './components/map/IncidentMap';
import { EvidenceExplorer } from './components/evidence/EvidenceExplorer';
import { ResourceCoordination } from './components/resources/ResourceCoordination';
import { NetworkSimulator } from './components/network/NetworkSimulator';
import { ReportModal } from './components/reporting/ReportModal';
import { UserManualModal } from './components/manual/UserManualModal';

const AppContent: React.FC = () => {
  const { currentView, userRole } = useCrisisCache();

  return (
    <div 
      className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${
        userRole === 'citizen' 
          ? 'bg-slate-50 text-slate-900 citizen-theme' 
          : 'bg-[#0B132B] text-slate-100 operations-theme'
      }`}
    >
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Only show technical operations sidebar in Coordinator Mode */}
        {userRole === 'coordinator' && <Sidebar />}
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {userRole === 'citizen' ? (
            <CitizenView />
          ) : (
            <>
              {currentView === 'overview' && <CommandCenter />}
              {currentView === 'map' && <IncidentMap />}
              {currentView === 'evidence' && <EvidenceExplorer />}
              {currentView === 'resources' && <ResourceCoordination />}
              {currentView === 'network' && <NetworkSimulator />}
            </>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <ReportModal />
      <UserManualModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CrisisCacheProvider>
      <AppContent />
    </CrisisCacheProvider>
  );
};

export default App;
