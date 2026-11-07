// Module C: Evidence Intelligence Engine & Evidence Explorer
// Responsive: Interactive Graph on Desktop & Vertical Timeline on Mobile
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { IncidentReport, EvidenceRelationship, DeliveryReceipt } from '../../types';
import { UrgencyBadge, EvidenceBadge, FreshnessBadge } from '../common/Badge';
import { formatTimeAgo, formatDuration } from '../../engine/freshness/freshness';
import { buildReportProvenance } from '../../engine/provenance/lineage';
import { 
  GitFork, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Radio, 
  Info, 
  Share2, 
  MapPin, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  User,
  Smartphone,
  Calendar,
  Layers
} from 'lucide-react';

export const EvidenceExplorer: React.FC = () => {
  const { 
    selectedIncidentId, 
    setSelectedIncidentId, 
    localEvaluations, 
    activeNodeId 
  } = useCrisisCache();

  const currentEval = localEvaluations.find(e => e.incident.id === selectedIncidentId) || localEvaluations[0];
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  if (!currentEval) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-cc-textMuted bg-cc-bg">
        No incident data available in local cache. Submit an emergency report or run network synchronization.
      </div>
    );
  }

  const { incident, reports, relationships, receipts } = currentEval;
  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];
  const activeProvenance = activeReport ? buildReportProvenance(activeReport, receipts, []) : null;

  // Chronologically sorted reports for mobile vertical timeline
  const sortedReports = [...reports].sort((a, b) => a.observedAt - b.observedAt);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-cc-bg">
      
      {/* Top Bar: Incident Switcher & Evidence Metrics Header */}
      <div className="p-3 sm:p-4 bg-cc-bgSecondary border-b border-cc-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        
        {/* Incident Selector */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-cc-cyan/15 border border-cc-cyan/30 flex items-center justify-center text-cc-cyan shrink-0">
            <GitFork className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-cc-textMuted">
                Investigating Lineage For
              </span>
              <select
                value={incident.id}
                onChange={(e) => {
                  setSelectedIncidentId(e.target.value);
                  setSelectedReportId(null);
                }}
                className="bg-cc-surface border border-cc-border text-xs font-mono font-bold text-cc-text rounded px-2 py-0.5 focus:outline-none focus:border-cc-cyan cursor-pointer"
              >
                {localEvaluations.map(e => (
                  <option key={e.incident.id} value={e.incident.id}>
                    {e.incident.id}: {e.incident.title}
                  </option>
                ))}
              </select>
            </div>
            <h1 className="text-sm font-semibold text-cc-text mt-0.5 truncate max-w-sm">
              {incident.title}
            </h1>
          </div>
        </div>

        {/* Live Evaluation Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <UrgencyBadge urgency={incident.urgency} size="sm" />
          <EvidenceBadge status={currentEval.evidenceStatus} size="sm" />
          <FreshnessBadge status={currentEval.freshnessStatus} size="sm" />
        </div>
      </div>

      {/* Metric Counters Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-3 sm:p-4 bg-cc-surface/50 border-b border-cc-border text-xs font-mono shrink-0">
        <div className="bg-cc-surface border border-cc-border rounded-lg p-2.5">
          <span className="text-cc-textMuted block text-[10px] uppercase font-bold">Independent Origin Sources</span>
          <div className="text-lg sm:text-xl font-bold text-cc-text flex items-center gap-1.5 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-cc-green" />
            <span>{currentEval.independentObservationsCount}</span>
          </div>
          <span className="text-[10px] text-cc-textMuted">Distinct witness devices</span>
        </div>

        <div className="bg-cc-surface border border-cc-border rounded-lg p-2.5">
          <span className="text-cc-textMuted block text-[10px] uppercase font-bold">Relayed / Forwarded</span>
          <div className="text-lg sm:text-xl font-bold text-cc-cyan flex items-center gap-1.5 mt-0.5">
            <Share2 className="w-4 h-4 text-cc-cyan" />
            <span>{currentEval.forwardedCopiesCount}</span>
          </div>
          <span className="text-[10px] text-cc-textMuted">Not treated as new witnesses</span>
        </div>

        <div className="bg-cc-surface border border-cc-border rounded-lg p-2.5">
          <span className="text-cc-textMuted block text-[10px] uppercase font-bold">Contradicting Reports</span>
          <div className={`text-lg sm:text-xl font-bold flex items-center gap-1.5 mt-0.5 ${
            currentEval.conflictingObservationsCount > 0 ? 'text-cc-orange' : 'text-cc-textMuted'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <span>{currentEval.conflictingObservationsCount}</span>
          </div>
          <span className="text-[10px] text-cc-textMuted">
            {currentEval.conflictingObservationsCount > 0 ? 'Preserved for comparison' : 'No conflicts logged'}
          </span>
        </div>

        <div className="bg-cc-surface border border-cc-border rounded-lg p-2.5">
          <span className="text-cc-textMuted block text-[10px] uppercase font-bold">Freshness TTL</span>
          <div className="text-lg sm:text-xl font-bold text-cc-text flex items-center gap-1.5 mt-0.5">
            <Clock className="w-4 h-4 text-cc-cyan" />
            <span>{formatDuration(currentEval.expiresInMs)}</span>
          </div>
          <span className="text-[10px] text-cc-textMuted">
            Observed {formatTimeAgo(currentEval.latestObservationTime)}
          </span>
        </div>
      </div>

      {/* Main Evidence Area: Desktop Graph vs Mobile Vertical Timeline */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left / Top: Visual Graph or Timeline */}
        <div className="flex-1 flex flex-col overflow-y-auto p-3 sm:p-4 space-y-4">
          
          {/* DESKTOP VIEW: VISUAL GRAPH */}
          <div className="hidden md:block bg-cc-surface border border-cc-border rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-cc-cyan" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cc-text">
                  Provenance & Lineage Graph
                </h3>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cc-cyan" /> Original</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cc-green" /> Confirmation</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cc-orange" /> Contradiction</span>
              </div>
            </div>

            {/* Dynamic Graph Container */}
            <div className="bg-cc-bgSecondary border border-cc-border rounded-xl p-4 space-y-5">
              
              {/* 1. Original Source & Relays */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-cc-cyan font-bold block">
                  Original Source & Relay Chain:
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  {reports.filter(r => r.evidenceType === 'ORIGINAL').map(rep => {
                    const isSelected = activeReport?.id === rep.id;
                    return (
                      <div
                        key={rep.id}
                        onClick={() => setSelectedReportId(rep.id)}
                        className={`cursor-pointer p-3 rounded-lg border text-xs font-mono transition-all ${
                          isSelected
                            ? 'bg-cc-cyan/20 border-cc-cyan ring-2 ring-cc-cyan/40 text-cc-text'
                            : 'bg-cc-surface border-cc-cyan/40 hover:border-cc-cyan text-cc-text'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className="font-bold text-cc-cyan">{rep.id} (Original)</span>
                          <span className="text-[10px] bg-cc-cyan/15 px-1.5 py-0.5 rounded text-cc-cyan">
                            Node {rep.originNodeId}
                          </span>
                        </div>
                        <div className="text-[11px] text-cc-textMuted truncate max-w-[220px]">
                          {rep.description}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex items-center text-cc-cyan gap-1">
                    <span className="text-[11px] font-mono">mesh relay</span>
                    <ArrowRight className="w-4 h-4 animate-pulse" />
                  </div>

                  {receipts.filter(rcpt => reports.some(r => r.id === rcpt.reportId && r.evidenceType === 'ORIGINAL')).map(rcpt => (
                    <div
                      key={rcpt.id}
                      className="p-2.5 rounded-lg border border-cc-border bg-cc-surface/70 text-xs font-mono"
                    >
                      <div className="text-[10px] text-cc-textMuted">Relayed Replica</div>
                      <div className="font-semibold text-cc-text flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-cc-cyan" />
                        <span>{rcpt.toNodeId}</span>
                      </div>
                      <div className="text-[9px] text-cc-textMuted mt-0.5">
                        Path: [{rcpt.forwardingPath.join(' → ')}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Independent Confirmations */}
              {reports.filter(r => r.evidenceType === 'CONFIRMATION').length > 0 && (
                <div className="space-y-2 pt-3 border-t border-cc-border/60">
                  <span className="text-[10px] font-mono uppercase text-cc-green font-bold block">
                    Independent Confirmations (Separate Witnesses):
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    {reports.filter(r => r.evidenceType === 'CONFIRMATION').map(rep => {
                      const isSelected = activeReport?.id === rep.id;
                      return (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedReportId(rep.id)}
                          className={`cursor-pointer p-3 rounded-lg border text-xs font-mono transition-all ${
                            isSelected
                              ? 'bg-cc-green/20 border-cc-green ring-2 ring-cc-green/40 text-cc-text'
                              : 'bg-cc-surface border-cc-green/40 hover:border-cc-green text-cc-text'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="font-bold text-cc-green">{rep.id} (Confirming)</span>
                            <span className="text-[10px] bg-cc-green/15 px-1.5 py-0.5 rounded text-cc-green">
                              Node {rep.originNodeId}
                            </span>
                          </div>
                          <div className="text-[11px] text-cc-textMuted truncate max-w-[220px]">
                            {rep.description}
                          </div>
                          <div className="text-[10px] text-cc-green mt-1">
                            Rel: INDEPENDENTLY_CONFIRMS
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Contradictory Evidence */}
              {reports.filter(r => r.evidenceType === 'CONTRADICTION').length > 0 && (
                <div className="space-y-2 pt-3 border-t border-cc-border/60">
                  <span className="text-[10px] font-mono uppercase text-cc-orange font-bold block">
                    Contradictory Observations (Preserved Conflicting Evidence):
                  </span>
                  <div className="flex items-center gap-3 flex-wrap">
                    {reports.filter(r => r.evidenceType === 'CONTRADICTION').map(rep => {
                      const isSelected = activeReport?.id === rep.id;
                      return (
                        <div
                          key={rep.id}
                          onClick={() => setSelectedReportId(rep.id)}
                          className={`cursor-pointer p-3 rounded-lg border text-xs font-mono transition-all ${
                            isSelected
                              ? 'bg-cc-orange/20 border-cc-orange ring-2 ring-cc-orange/40 text-cc-text'
                              : 'bg-cc-surface border-cc-orange/40 hover:border-cc-orange text-cc-text'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className="font-bold text-cc-orange">{rep.id} (Contradiction)</span>
                            <span className="text-[10px] bg-cc-orange/15 px-1.5 py-0.5 rounded text-cc-orange">
                              Node {rep.originNodeId}
                            </span>
                          </div>
                          <div className="text-[11px] text-cc-textMuted truncate max-w-[220px]">
                            {rep.description}
                          </div>
                          <div className="text-[10px] text-cc-orange mt-1">
                            Rel: CONTRADICTS
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* MOBILE VIEW: VERTICAL CHRONOLOGICAL TIMELINE */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cc-text">
                Evidence Timeline ({sortedReports.length} Reports)
              </h3>
              <span className="text-[10px] font-mono text-cc-cyan">Chronological</span>
            </div>

            <div className="relative border-l-2 border-cc-border ml-3 space-y-4 py-1">
              {sortedReports.map((rep) => {
                const isExpanded = expandedTimelineId === rep.id || activeReport?.id === rep.id;
                const isContradiction = rep.evidenceType === 'CONTRADICTION';
                const isConfirmation = rep.evidenceType === 'CONFIRMATION';
                const isOriginal = rep.evidenceType === 'ORIGINAL';

                const dotColor = isContradiction ? 'bg-cc-orange border-cc-orange' :
                                 isConfirmation ? 'bg-cc-green border-cc-green' :
                                 'bg-cc-cyan border-cc-cyan';

                return (
                  <div key={rep.id} className="relative pl-6">
                    {/* Timeline Node Bullet */}
                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${dotColor} bg-cc-bg flex items-center justify-center`} />

                    <div 
                      onClick={() => {
                        setSelectedReportId(rep.id);
                        setExpandedTimelineId(isExpanded ? null : rep.id);
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeReport?.id === rep.id 
                          ? 'bg-cc-surface border-cc-cyan' 
                          : 'bg-cc-surface/70 border-cc-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-mono font-bold ${
                          isContradiction ? 'text-cc-orange' : isConfirmation ? 'text-cc-green' : 'text-cc-cyan'
                        }`}>
                          {rep.id} • {rep.evidenceType}
                        </span>
                        <span className="text-[10px] font-mono text-cc-textMuted">
                          {formatTimeAgo(rep.observedAt)}
                        </span>
                      </div>

                      <p className="text-xs text-cc-text mt-1 leading-snug">
                        {rep.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-cc-textMuted">
                        <span>Witness: Node {rep.originNodeId}</span>
                        <span>{rep.neighborhood}</span>
                      </div>

                      {/* Expandable provenance receipt */}
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-cc-border text-[11px] font-mono space-y-1 text-cc-textMuted">
                          <div>Author: <span className="text-cc-text">{rep.originAuthorId}</span></div>
                          <div>Status: <span className="text-cc-cyan">Stored Locally on {activeNodeId}</span></div>
                          {receipts.filter(rcpt => rcpt.reportId === rep.id).length > 0 && (
                            <div>
                              Relayed to: {receipts.filter(rcpt => rcpt.reportId === rep.id).map(r => r.toNodeId).join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right / Bottom: Detailed Report Inspector */}
        <div className="w-full lg:w-80 bg-cc-bgSecondary border-t lg:border-t-0 lg:border-l border-cc-border p-4 overflow-y-auto shrink-0 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase text-cc-cyan tracking-wider">
              Report Provenance Inspector
            </h3>
            <span className="text-[10px] font-mono text-cc-textMuted">
              {activeReport?.id}
            </span>
          </div>

          {activeReport ? (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-cc-surface border border-cc-border rounded-xl space-y-2">
                <span className="text-[10px] uppercase text-cc-textMuted block font-bold">Observation Details</span>
                <div>
                  <span className="text-cc-textMuted block text-[10px]">Report ID:</span>
                  <span className="text-cc-cyan font-bold">{activeReport.id}</span>
                </div>
                <div>
                  <span className="text-cc-textMuted block text-[10px]">Origin Node:</span>
                  <span className="text-cc-text">{activeReport.originNodeId}</span>
                </div>
                <div>
                  <span className="text-cc-textMuted block text-[10px]">Observed Timestamp:</span>
                  <span className="text-cc-text">{new Date(activeReport.observedAt).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-cc-textMuted block text-[10px]">Reported Neighborhood:</span>
                  <span className="text-cc-text">{activeReport.neighborhood}</span>
                </div>
                <div>
                  <span className="text-cc-textMuted block text-[10px]">Reported Urgency:</span>
                  <span className="text-cc-orange font-bold">{activeReport.urgency}</span>
                </div>
              </div>

              {/* Relationship Semantics */}
              <div className="p-3 bg-cc-surface border border-cc-border rounded-xl space-y-2">
                <span className="text-[10px] uppercase text-cc-textMuted block font-bold">Evidence Relationship</span>
                <div>
                  <span className="text-cc-textMuted block text-[10px]">Role in Incident:</span>
                  <span className={`font-bold ${
                    activeReport.evidenceType === 'CONTRADICTION' ? 'text-cc-orange' :
                    activeReport.evidenceType === 'CONFIRMATION' ? 'text-cc-green' :
                    'text-cc-cyan'
                  }`}>
                    {activeReport.evidenceType}
                  </span>
                </div>
                <p className="text-[11px] text-cc-textMuted font-sans leading-relaxed">
                  {activeReport.evidenceType === 'ORIGINAL' && 'Anchor observation that initiated this incident record.'}
                  {activeReport.evidenceType === 'CONFIRMATION' && 'Independently corroborates the hazard from a separate device.'}
                  {activeReport.evidenceType === 'CONTRADICTION' && 'Conflicts with the active status (e.g. water receding). Both reports are preserved for coordinators.'}
                </p>
              </div>

              {/* Relay Trail */}
              <div className="p-3 bg-cc-surface border border-cc-border rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase text-cc-textMuted block font-bold">Forwarding Path</span>
                <p className="text-[11px] text-cc-text font-sans">
                  Originates on <strong className="text-cc-cyan">{activeReport.originNodeId}</strong>.
                </p>
                <div className="text-[10px] text-cc-textMuted">
                  Forwarding never fabricates a new independent witness; copies are stored with immutable origin provenance.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-cc-textMuted">
              Select any node from the graph or timeline to inspect provenance metadata.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
