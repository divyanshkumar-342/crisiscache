// Header Bar: Navigation, Mode Switcher, Simulated Device Selector (Operations only), Connectivity Status, Action Buttons
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  PlusCircle, 
  RotateCcw, 
  Smartphone,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  Globe,
  AlertTriangle,
  Shield,
  Activity
} from 'lucide-react';
import { formatTimeAgo } from '../../engine/freshness/freshness';

export const Header: React.FC = () => {
  const { 
    activeNodeId, 
    setActiveNodeId, 
    devices, 
    networkPartitions, 
    isSyncing, 
    lastSyncTime,
    runNetworkSync,
    resetDemoScenario,
    setIsReportModalOpen,
    userRole,
    setUserRole,
    setIsManualOpen
  } = useCrisisCache();

  const [language, setLanguage] = useState<'EN' | 'ES' | 'FR'>('EN');

  // Find partition for active device
  const currentPartition = networkPartitions.find(p => p.includes(activeNodeId)) || [activeNodeId];
  const isPartitioned = networkPartitions.length > 1;

  const isCitizen = userRole === 'citizen';

  return (
    <header className={`h-16 border-b flex items-center justify-between px-3 sm:px-4 lg:px-6 select-none shrink-0 z-30 transition-colors shadow-sm ${
      isCitizen 
        ? 'bg-white border-slate-200 text-slate-800' 
        : 'bg-[#1C2541] border-[#3A506B]/50 text-slate-100 shadow-lg'
    }`}>
      
      {/* Brand & Left Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold ${
          isCitizen 
            ? 'bg-blue-600 text-white border-blue-700 shadow-sm' 
            : 'bg-[#0B132B] text-sky-400 border-sky-500/40 shadow-inner'
        }`}>
          {isCitizen ? (
            <Shield className="w-5 h-5 text-white" />
          ) : (
            <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`font-bold tracking-tight text-base sm:text-lg ${
              isCitizen ? 'text-slate-900 font-sans' : 'text-white font-mono tracking-wider'
            }`}>
              CRISIS<span className={isCitizen ? 'text-blue-600' : 'text-sky-400'}>CACHE</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider hidden xs:inline-block ${
              isCitizen 
                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                : 'bg-[#0B132B] text-sky-300 border border-[#3A506B] font-mono'
            }`}>
              {isCitizen ? 'Citizen Portal' : 'GDACS Ops'}
            </span>
          </div>
          <p className={`hidden md:block text-[11px] leading-none mt-0.5 ${
            isCitizen ? 'text-slate-500' : 'text-slate-400 font-mono text-[10px]'
          }`}>
            {isCitizen ? 'Community Emergency Response System' : 'Decentralized Provenance & Lineage Command'}
          </p>
        </div>

        {/* ROLE MODE SWITCHER: Citizen Mode vs Operations Coordinator */}
        <div className={`ml-1 sm:ml-3 flex items-center p-1 rounded-xl border ${
          isCitizen ? 'bg-slate-100 border-slate-200' : 'bg-[#0B132B] border-[#3A506B]'
        }`}>
          <button
            onClick={() => setUserRole('citizen')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              isCitizen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Citizen
          </button>
          <button
            onClick={() => setUserRole('coordinator')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              !isCitizen
                ? 'bg-sky-500 text-slate-950 shadow-md font-mono'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 hidden sm:inline" />
            <span>Operations</span>
          </button>
        </div>
      </div>

      {/* Center Controls: Only in Operations Mode */}
      {!isCitizen ? (
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Active Node Selector */}
          <div className="flex items-center bg-[#0B132B] border border-[#3A506B] rounded-lg px-2.5 py-1.5 gap-2">
            <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-mono text-slate-400 tracking-wider hidden sm:block">
                Simulated Node
              </span>
              <select
                value={activeNodeId}
                onChange={(e) => setActiveNodeId(e.target.value)}
                className="bg-transparent text-xs font-mono font-semibold text-white focus:outline-none cursor-pointer pr-1"
                aria-label="Active Simulated Node"
              >
                {devices.map(device => (
                  <option key={device.id} value={device.id} className="bg-[#1C2541] text-white">
                    {device.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Partition Warning */}
          <div className="hidden lg:flex items-center gap-2 bg-[#0B132B] border border-[#3A506B] rounded-lg px-3 py-1.5 font-mono">
            {isPartitioned ? (
              <div className="flex items-center gap-2 text-amber-400 text-[10px] font-bold">
                <WifiOff className="w-3.5 h-3.5 animate-pulse" />
                <span>PARTITIONED ({networkPartitions.length} GROUPS)</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold">
                <Wifi className="w-3.5 h-3.5" />
                <span>MESH BRIDGED (6 NODES)</span>
              </div>
            )}
          </div>

          {/* Sync Button */}
          <button
            onClick={runNetworkSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-mono font-semibold transition-all"
            title="Trigger Mesh Gossip Synchronization"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">{isSyncing ? 'Syncing...' : 'Sync Net'}</span>
          </button>
        </div>
      ) : (
        /* Citizen Header Status Indicator */
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold hidden xs:inline">Mesh Active (Offline Safe)</span>
          </div>

          <div className="relative flex items-center bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
              aria-label="Select Language"
            >
              <option value="EN">EN</option>
              <option value="ES">ES</option>
              <option value="FR">FR</option>
            </select>
          </div>
        </div>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setIsManualOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            isCitizen 
              ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700' 
              : 'border-[#3A506B] bg-[#0B132B] hover:bg-[#1C2541] text-sky-400 font-mono'
          }`}
          title="Open Emergency Guide"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Guide</span>
        </button>

        {!isCitizen && (
          <button
            onClick={() => resetDemoScenario()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#3A506B] bg-[#0B132B] hover:bg-[#1C2541] text-slate-300 text-xs font-mono transition-colors"
            title="Reset Scenario State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>
        )}

        {/* Primary Action Button */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md ${
            isCitizen 
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20' 
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono shadow-amber-500/20'
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Report Hazard</span>
        </button>
      </div>

    </header>
  );
};
