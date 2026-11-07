// Module A: Emergency Operations Command Center Dashboard (GDACS Dark Tactical Command Center)
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { UrgencyBadge, EvidenceBadge, FreshnessBadge } from '../common/Badge';
import { formatTimeAgo } from '../../engine/freshness/freshness';
import { 
  AlertOctagon, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Package, 
  Radio, 
  ArrowRight, 
  GitFork, 
  MapPin, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  WifiOff,
  Wifi,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Activity,
  Layers,
  BarChart3
} from 'lucide-react';
import { IncidentMap } from '../map/IncidentMap';

export const CommandCenter: React.FC = () => {
  const { 
    localEvaluations, 
    requests, 
    offers, 
    matches,
    activeNodeId, 
    activeDevice,
    networkPartitions,
    isBridgeActive,
    bridgePartition,
    runNetworkSync,
    setCurrentView,
    setSelectedIncidentId,
    setIsReportModalOpen
  } = useCrisisCache();

  const [isPartitionBannerExpanded, setIsPartitionBannerExpanded] = useState<boolean>(false);

  // Filtered operational metrics
  const activeIncidents = localEvaluations;
  const criticalIncidents = localEvaluations.filter(e => e.incident.urgency === 'Critical' || e.incident.urgency === 'High');
  const contestedIncidents = localEvaluations.filter(e => e.evidenceStatus === 'CONTESTED');
  const staleIncidents = localEvaluations.filter(e => e.freshnessStatus === 'STALE');
  const openRequests = requests.filter(r => r.status === 'OPEN' || r.status === 'PARTIALLY_MATCHED');

  const handleInspectEvidence = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setCurrentView('evidence');
  };

  const handleViewOnMap = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setCurrentView('map');
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-4 bg-[#0B132B] text-slate-100 font-sans">
      
      {/* 1. GDACS COLLAPSIBLE NETWORK STATUS & SYNC BANNER */}
      <div className={`border rounded-xl transition-all shadow-md ${
        networkPartitions.length > 1 ? 'border-amber-500/60 bg-[#1C2541]' : 'border-[#3A506B] bg-[#1C2541]'
      }`}>
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              networkPartitions.length > 1 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' 
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
            }`}>
              {networkPartitions.length > 1 ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Operational Node: {activeNodeId} ({activeDevice?.neighborhood})
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                  networkPartitions.length > 1 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {networkPartitions.length > 1 ? `PARTITIONED (${networkPartitions.length} GROUPS)` : 'FULL MESH ONLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {networkPartitions.length > 1 
                  ? 'Gossip sync restricted to current partition. Connect bridge link to propagate reports.' 
                  : 'All 6 nodes actively exchanging gossip reports.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {!isBridgeActive ? (
              <button
                onClick={bridgePartition}
                className="px-3.5 py-1.5 rounded-lg border border-sky-500/50 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 text-xs font-mono font-bold transition-all shadow-sm"
              >
                Bridge Partition (B ↔ E)
              </button>
            ) : (
              <button
                onClick={runNetworkSync}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Network</span>
              </button>
            )}

            <button
              onClick={() => setIsPartitionBannerExpanded(!isPartitionBannerExpanded)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg border border-[#3A506B] bg-[#0B132B]"
              title="Toggle Partition Details"
            >
              {isPartitionBannerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded partition details */}
        {isPartitionBannerExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-[#3A506B] bg-[#0B132B]/60 text-xs font-mono space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {networkPartitions.map((part, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-[#3A506B] bg-[#1C2541]">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Partition Group {idx + 1}</span>
                  <span className="text-sky-400 font-bold text-sm">{part.join(' • ')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. GDACS TACTICAL METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Critical Incidents */}
        <div className="bg-[#1C2541] border border-rose-500/40 rounded-xl p-4 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">Critical / Red Alert</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-mono font-black text-rose-400">
            {criticalIncidents.length}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Immediate field dispatch</div>
        </div>

        {/* Contested Incidents */}
        <div className="bg-[#1C2541] border border-amber-500/40 rounded-xl p-4 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">Contested / Orange</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-mono font-black text-amber-400">
            {contestedIncidents.length}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Conflicting observations</div>
        </div>

        {/* Stale Information */}
        <div className="bg-[#1C2541] border border-[#3A506B] rounded-xl p-4 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider">Aging TTL Reports</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-mono font-black text-slate-200">
            {staleIncidents.length}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Require re-verification</div>
        </div>

        {/* Unfulfilled Resource Requests */}
        <div className="bg-[#1C2541] border border-sky-500/40 rounded-xl p-4 space-y-1 shadow-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">Open Aid Requests</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-mono font-black text-sky-400">
            {openRequests.length}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">{matches.filter(m => m.status === 'PENDING').length} matches ready</div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: Prioritized Incidents & Map Integration */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Left Column: Incidents with Clear Evidence Metrics */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Active Emergency Incidents
              </h2>
              <span className="text-xs font-mono text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded">
                {activeIncidents.length} locally cached
              </span>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="text-xs font-mono font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Incident</span>
            </button>
          </div>

          <div className="space-y-3">
            {activeIncidents.map(evaluation => {
              const { incident } = evaluation;
              const isContested = evaluation.evidenceStatus === 'CONTESTED';

              return (
                <div
                  key={incident.id}
                  className={`bg-[#1C2541] border rounded-xl p-4 transition-all hover:border-slate-500 shadow-md ${
                    isContested 
                      ? 'border-amber-500/60' 
                      : incident.urgency === 'Critical'
                      ? 'border-rose-500/50'
                      : 'border-[#3A506B]'
                  }`}
                >
                  {/* Top line: Title, Badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-sky-400">
                          {incident.id}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {incident.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" />
                          {incident.neighborhood}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{incident.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <UrgencyBadge urgency={incident.urgency} />
                      <EvidenceBadge status={evaluation.evidenceStatus} />
                      <FreshnessBadge status={evaluation.freshnessStatus} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {incident.description}
                  </p>

                  {/* Evidence Lineage Metrics Bar */}
                  <div className="bg-[#0B132B] border border-[#3A506B] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5" title="Independent Origin Witnesses">
                        <span className="text-slate-400">Independent:</span>
                        <span className="font-bold text-emerald-400">{evaluation.independentObservationsCount}</span>
                      </div>

                      <div className="flex items-center gap-1.5" title="Forwarded Relayed Copies">
                        <span className="text-slate-400">Forwarded:</span>
                        <span className="font-bold text-sky-400">{evaluation.forwardedCopiesCount}</span>
                      </div>

                      {evaluation.conflictingObservationsCount > 0 && (
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>{evaluation.conflictingObservationsCount} Contradicting</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(evaluation.latestObservationTime)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#3A506B]/60">
                    <button
                      onClick={() => handleViewOnMap(incident.id)}
                      className="px-2.5 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white hover:bg-[#0B132B] transition-colors flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5 text-sky-400" />
                      <span>Geographic Pin</span>
                    </button>

                    <button
                      onClick={() => handleInspectEvidence(incident.id)}
                      className="px-4 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-400 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Investigate Evidence Lineage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Mini Map & Resource Matching Overview */}
        <div className="space-y-4">
          
          {/* Fictional Community Map Widget */}
          <div className="bg-[#1C2541] border border-[#3A506B] rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Geographic Incident Map
              </h3>
              <button
                onClick={() => setCurrentView('map')}
                className="text-xs font-mono text-sky-400 hover:underline"
              >
                Full Screen →
              </button>
            </div>
            <div className="h-60 rounded-lg overflow-hidden border border-[#3A506B] bg-[#0B132B]">
              <IncidentMap />
            </div>
          </div>

          {/* Resource Match Recommendations */}
          <div className="bg-[#1C2541] border border-[#3A506B] rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Deterministic Resource Matching
                </h3>
              </div>
              <button
                onClick={() => setCurrentView('resources')}
                className="text-xs font-mono text-sky-400 hover:underline"
              >
                Manage Hub →
              </button>
            </div>

            {matches.filter(m => m.status === 'PENDING').length > 0 ? (
              <div className="space-y-2">
                {matches.filter(m => m.status === 'PENDING').slice(0, 2).map(match => {
                  const targetReq = requests.find(r => r.id === match.requestId);
                  return (
                    <div key={match.id} className="p-3 bg-[#0B132B] border border-sky-500/40 rounded-lg space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-sky-400">Multi-Source Allocation</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">PENDING APPROVAL</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-snug">
                        Fulfills {match.targetQuantity} {match.unit} of {targetReq?.category || 'supplies'} for {targetReq?.neighborhood || 'affected area'}.
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Contributing: {match.matches.length} community offer(s)
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-[#0B132B] rounded-lg border border-[#3A506B]">
                No pending resource allocations. Open requests are monitored automatically.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
