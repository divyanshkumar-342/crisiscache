// Sidebar Navigation Rail for Operations Mode (GDACS Deep Blue Navigation)
import React from 'react';
import { useCrisisCache, ActiveView } from '../../state/store';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  GitFork, 
  PackageSearch, 
  Network, 
  ShieldAlert,
  ChevronRight,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    localEvaluations, 
    matches, 
    activeDevice,
    networkPartitions
  } = useCrisisCache();

  const contestedCount = localEvaluations.filter(e => e.evidenceStatus === 'CONTESTED').length;
  const pendingMatchesCount = matches.filter(m => m.status === 'PENDING').length;

  const navItems: { id: ActiveView; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'map', label: 'Incident Map', icon: MapIcon },
    { 
      id: 'evidence', 
      label: 'Evidence Lineage', 
      icon: GitFork, 
      badge: contestedCount > 0 ? contestedCount : undefined, 
      badgeColor: 'bg-amber-500 text-slate-950' 
    },
    { 
      id: 'resources', 
      label: 'Resource Hub', 
      icon: PackageSearch,
      badge: pendingMatchesCount > 0 ? pendingMatchesCount : undefined,
      badgeColor: 'bg-sky-500 text-slate-950'
    },
    { id: 'network', label: 'Mesh Topology', icon: Network },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-16 lg:w-60 bg-[#1C2541] border-r border-[#3A506B]/50 flex-col justify-between shrink-0 select-none shadow-lg">
        {/* Navigation Links */}
        <div className="py-4 space-y-1">
          <div className="hidden lg:block px-4 pb-2 text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
            GDACS Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 lg:px-4 py-3 text-xs font-mono transition-all text-left relative group ${
                  isActive
                    ? 'bg-[#0B132B] text-sky-400 border-r-2 border-sky-400 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-[#0B132B]/60'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-white'
                }`} />
                <span className="hidden lg:inline truncate">{item.label}</span>

                {item.badge !== undefined && (
                  <span className={`hidden lg:flex ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Node Status Box */}
        <div className="p-3 border-t border-[#3A506B]/50 bg-[#0B132B]/80">
          <div className="hidden lg:block space-y-1 text-[11px] font-mono">
            <div className="text-slate-400 flex items-center justify-between">
              <span>Local Replica:</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
            <div className="text-slate-200 truncate">
              Node: <span className="text-sky-400 font-bold">{activeDevice?.id}</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {activeDevice?.neighborhood}
            </div>
          </div>
          <div className="lg:hidden flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
        </div>
      </aside>

      {/* MOBILE OPERATIONS BOTTOM NAV */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1C2541] border-t border-[#3A506B] flex items-center justify-around h-14 px-1 select-none shadow-2xl"
        aria-label="Operations Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs relative transition-colors ${
                isActive ? 'text-sky-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-mono truncate max-w-[60px] leading-tight">
                {item.id === 'overview' ? 'Ops' : item.id === 'evidence' ? 'Lineage' : item.id === 'resources' ? 'Hub' : item.id === 'network' ? 'Mesh' : 'Map'}
              </span>
              {item.badge !== undefined && (
                <span className="absolute top-1.5 right-1/4 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
