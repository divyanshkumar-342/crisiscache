// Freshness Evaluation Engine with Category-Specific TTL
import { IncidentCategory, FreshnessStatus } from '../../types';

export const CATEGORY_TTL_MS: Record<IncidentCategory, number> = {
  'Flooding': 45 * 60 * 1000,           // 45 minutes
  'Fire': 30 * 60 * 1000,               // 30 minutes
  'Road blockage': 120 * 60 * 1000,     // 2 hours
  'Medical emergency': 30 * 60 * 1000,  // 30 minutes
  'Building damage': 180 * 60 * 1000,   // 3 hours
  'Missing person': 360 * 60 * 1000,    // 6 hours
  'Shelter shortage': 240 * 60 * 1000,  // 4 hours
  'Utility failure': 120 * 60 * 1000,   // 2 hours
  'Other': 60 * 60 * 1000,              // 1 hour
};

export interface FreshnessResult {
  status: FreshnessStatus;
  elapsedMs: number;
  remainingMs: number;
  ttlMs: number;
  percentageRemaining: number;
  isStale: boolean;
}

export function calculateFreshness(
  category: IncidentCategory,
  observedAt: number,
  overrideTtlMs?: number,
  currentTime: number = Date.now()
): FreshnessResult {
  const ttlMs = overrideTtlMs && overrideTtlMs > 0 
    ? overrideTtlMs 
    : (CATEGORY_TTL_MS[category] || 60 * 60 * 1000);

  const elapsedMs = Math.max(0, currentTime - observedAt);
  const remainingMs = Math.max(0, ttlMs - elapsedMs);
  const percentageRemaining = Math.max(0, Math.min(100, Math.round((remainingMs / ttlMs) * 100)));

  let status: FreshnessStatus;

  if (elapsedMs > ttlMs) {
    status = 'STALE';
  } else if (elapsedMs > ttlMs * 0.6) {
    status = 'AGING';
  } else {
    status = 'CURRENT';
  }

  return {
    status,
    elapsedMs,
    remainingMs,
    ttlMs,
    percentageRemaining,
    isStale: status === 'STALE',
  };
}

export function formatTimeAgo(timestampMs: number, now: number = Date.now()): string {
  const diffSec = Math.floor((now - timestampMs) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1 min ago';
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  
  const diffHr = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;
  if (diffHr < 24) {
    return remainingMin > 0 ? `${diffHr}h ${remainingMin}m ago` : `${diffHr}h ago`;
  }
  
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

export function formatDuration(durationMs: number): string {
  const sec = Math.floor(durationMs / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}
