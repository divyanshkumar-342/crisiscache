// Status badges for Urgency, Evidence Status, and Freshness - FEMA/GDACS Alert Level Styling
import React from 'react';
import { UrgencyLevel, EvidenceStatus, FreshnessStatus } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Clock, RefreshCw, Zap, Shield } from 'lucide-react';

interface BadgeProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel } & BadgeProps> = ({ urgency, className = '', size = 'sm' }) => {
  // GDACS / FEMA Alert color mapping: Red = Severe, Orange = High/Moderate, Amber/Yellow = Advisory, Blue/Green = Watch
  const styles: Record<UrgencyLevel, string> = {
    'Critical': 'bg-cc-red/20 text-cc-red border-cc-red/40',
    'High': 'bg-cc-orange/20 text-cc-orange border-cc-orange/40',
    'Medium': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    'Low': 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  };

  const textSizes = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-sans font-semibold rounded-md border uppercase tracking-wider ${styles[urgency]} ${textSizes} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
        urgency === 'Critical' ? 'bg-cc-red animate-pulse' : 
        urgency === 'High' ? 'bg-cc-orange' : 
        urgency === 'Medium' ? 'bg-amber-400' : 'bg-sky-400'
      }`} />
      {urgency} Alert
    </span>
  );
};

export const EvidenceBadge: React.FC<{ status: EvidenceStatus } & BadgeProps> = ({ status, className = '', size = 'sm' }) => {
  const textSizes = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (status === 'CORROBORATED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-sans font-semibold rounded-md border bg-cc-green/15 text-cc-green border-cc-green/40 ${textSizes} ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        Verified Multi-Source
      </span>
    );
  }

  if (status === 'CONTESTED') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-sans font-semibold rounded-md border bg-cc-orange/15 text-cc-orange border-cc-orange/40 ${textSizes} ${className}`}>
        <ShieldAlert className="w-3.5 h-3.5" />
        Contested / Conflicting
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-sans font-medium rounded-md border bg-slate-700/40 text-slate-300 border-slate-600/50 ${textSizes} ${className}`}>
      <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
      Single Witness
    </span>
  );
};

export const FreshnessBadge: React.FC<{ status: FreshnessStatus; remainingMs?: number } & BadgeProps> = ({ 
  status, 
  remainingMs, 
  className = '', 
  size = 'sm' 
}) => {
  const textSizes = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (status === 'CURRENT') {
    return (
      <span className={`inline-flex items-center gap-1 font-sans font-medium rounded-md border bg-sky-500/15 text-sky-400 border-sky-500/30 ${textSizes} ${className}`}>
        <Clock className="w-3 h-3 text-sky-400" />
        Current
      </span>
    );
  }

  if (status === 'AGING') {
    return (
      <span className={`inline-flex items-center gap-1 font-sans font-medium rounded-md border bg-amber-500/15 text-amber-300 border-amber-500/30 ${textSizes} ${className}`}>
        <Clock className="w-3 h-3 text-amber-400" />
        Aging TTL
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-sans font-medium rounded-md border bg-slate-700/30 text-slate-400 border-slate-700 ${textSizes} ${className}`}>
      <Clock className="w-3 h-3 text-slate-500" />
      Stale
    </span>
  );
};
