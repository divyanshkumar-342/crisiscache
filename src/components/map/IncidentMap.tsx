// Module D: Incident Map - Fictional Community Geospatial Intelligence
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { IncidentCategory, UrgencyLevel, EvidenceStatus, Neighborhood } from '../../types';
import { UrgencyBadge, EvidenceBadge, FreshnessBadge } from '../common/Badge';
import { 
  MapPin, 
  Filter, 
  ShieldAlert, 
  Building, 
  Hospital, 
  Tent, 
  Waves, 
  X, 
  GitFork, 
  Package, 
  Layers, 
  Compass,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface CommunityZone {
  name: Neighborhood;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const ZONES: CommunityZone[] = [
  { name: 'North Ward', x: 60, y: 50, width: 280, height: 160, color: 'rgba(34, 211, 238, 0.08)' },
  { name: 'Riverside', x: 60, y: 220, width: 280, height: 150, color: 'rgba(56, 189, 248, 0.08)' },
  { name: 'Old Town', x: 60, y: 380, width: 280, height: 180, color: 'rgba(96, 165, 250, 0.08)' },
  { name: 'Central Shelter', x: 380, y: 50, width: 290, height: 230, color: 'rgba(53, 201, 138, 0.08)' },
  { name: 'East District', x: 380, y: 290, width: 290, height: 270, color: 'rgba(244, 114, 182, 0.08)' },
];

export const IncidentMap: React.FC = () => {
  const { 
    localEvaluations, 
    requests, 
    offers, 
    devices,
    setCurrentView,
    setSelectedIncidentId 
  } = useCrisisCache();

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterUrgency, setFilterUrgency] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<{
    type: 'incident' | 'shelter' | 'hospital' | 'request' | 'offer';
    data: any;
  } | null>(null);

  // Filtered incidents
  const filteredEvaluations = localEvaluations.filter(evaluation => {
    const inc = evaluation.incident;
    if (filterCategory !== 'ALL' && inc.category !== filterCategory) return false;
    if (filterUrgency !== 'ALL' && inc.urgency !== filterUrgency) return false;
    if (filterStatus !== 'ALL' && evaluation.evidenceStatus !== filterStatus) return false;
    return true;
  });

  // Map coordinates mapping: convert fictional lat/lng to SVG viewBox (0 0 740 600)
  // Lat: 45.410 (y=540) to 45.430 (y=60)
  // Lng: -75.700 (x=80) to -75.660 (x=660)
  const toSvgCoords = (lat: number, lng: number) => {
    const minLat = 45.410, maxLat = 45.430;
    const minLng = -75.702, maxLng = -75.665;
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 580 + 70;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 480 + 50;
    return { x: Math.max(70, Math.min(680, x)), y: Math.max(50, Math.min(550, y)) };
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-cc-bg">
      
      {/* Left/Main Area: Map Canvas & Filter Toolbar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Filter Controls Bar */}
        <div className="p-3 bg-cc-bgSecondary border-b border-cc-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cc-cyan" />
            <span className="text-xs font-mono font-bold uppercase text-cc-text">
              Community Map Layer Filters
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-cc-surface border border-cc-border text-xs font-mono text-cc-text rounded px-2 py-1 focus:outline-none focus:border-cc-cyan"
            >
              <option value="ALL">All Categories</option>
              <option value="Flooding">Flooding</option>
              <option value="Building damage">Building Damage</option>
              <option value="Road blockage">Road Blockage</option>
              <option value="Medical emergency">Medical</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="bg-cc-surface border border-cc-border text-xs font-mono text-cc-text rounded px-2 py-1 focus:outline-none focus:border-cc-cyan"
            >
              <option value="ALL">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Evidence Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-cc-surface border border-cc-border text-xs font-mono text-cc-text rounded px-2 py-1 focus:outline-none focus:border-cc-cyan"
            >
              <option value="ALL">All Evidence Statuses</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="CORROBORATED">Corroborated</option>
              <option value="CONTESTED">Contested</option>
            </select>
          </div>
        </div>

        {/* Fictional Community Vector Map Canvas */}
        <div className="flex-1 relative overflow-auto p-4 flex items-center justify-center bg-cc-bg bg-grid-pattern">
          
          <div className="relative w-full max-w-4xl aspect-[740/600] bg-cc-surface/70 border border-cc-border rounded-2xl shadow-2xl overflow-hidden select-none">
            
            <svg 
              viewBox="0 0 740 600" 
              className="w-full h-full"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(40, 55, 74, 0.4)" strokeWidth="0.5" />
                </pattern>
                
                {/* Water linear gradient */}
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0E7490" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Background Grid */}
              <rect width="740" height="600" fill="url(#grid)" />

              {/* Fictional Community Neighborhood Zones */}
              {ZONES.map(zone => (
                <g key={zone.name}>
                  <rect
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    fill={zone.color}
                    stroke="#28374A"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    rx="12"
                  />
                  <text
                    x={zone.x + 14}
                    y={zone.y + 24}
                    fill="#A5B2C2"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="1"
                  >
                    {zone.name.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* The Central River & Canal System */}
              <path
                d="M 330 30 C 345 140, 360 260, 350 370 C 340 480, 370 540, 380 580"
                fill="none"
                stroke="url(#riverGrad)"
                strokeWidth="28"
                strokeLinecap="round"
              />
              <path
                d="M 330 30 C 345 140, 360 260, 350 370 C 340 480, 370 540, 380 580"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2"
                strokeDasharray="6 4"
                strokeOpacity="0.8"
              />

              {/* Bridges across the river */}
              {/* North Crossing Bridge (near flooded underpass) */}
              <rect x="330" y="130" width="36" height="10" fill="#475569" stroke="#64748B" strokeWidth="1" rx="2" />
              <text x="375" y="138" fill="#94A3B8" fontSize="9" fontFamily="monospace">North Bridge</text>

              {/* Central Avenue Bridge */}
              <rect x="335" y="270" width="36" height="10" fill="#475569" stroke="#64748B" strokeWidth="1" rx="2" />
              <text x="380" y="278" fill="#94A3B8" fontSize="9" fontFamily="monospace">Central Crossing</text>

              {/* Road Grid lines */}
              <line x1="80" y1="135" x2="650" y2="135" stroke="#1E293B" strokeWidth="2" />
              <line x1="80" y1="275" x2="650" y2="275" stroke="#1E293B" strokeWidth="2" />
              <line x1="80" y1="440" x2="650" y2="440" stroke="#1E293B" strokeWidth="2" />
              
              <line x1="200" y1="60" x2="200" y2="540" stroke="#1E293B" strokeWidth="2" />
              <line x1="500" y1="60" x2="500" y2="540" stroke="#1E293B" strokeWidth="2" />

              {/* Inundated Flooded Underpass Zone (INC-01 location) */}
              <circle cx="210" cy="140" r="32" fill="rgba(239, 68, 68, 0.15)" stroke="#F05252" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="220" y="125" fill="#F05252" fontSize="9" fontFamily="monospace" fontWeight="bold">
                FLOOD BARRIER
              </text>

              {/* Fixed Infrastructure Markers */}
              {/* Central Shelter */}
              <g 
                className="cursor-pointer" 
                onClick={() => setSelectedItem({
                  type: 'shelter',
                  data: { name: 'Central High Community Shelter', neighborhood: 'Central Shelter', capacity: '120 persons', waterNeed: '20 units' }
                })}
              >
                <circle cx="480" cy="150" r="14" fill="#172436" stroke="#35C98A" strokeWidth="2" />
                <rect x="474" y="144" width="12" height="12" fill="#35C98A" rx="2" />
                <text x="502" y="154" fill="#35C98A" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Central Shelter
                </text>
              </g>

              {/* Riverside Hospital */}
              <g 
                className="cursor-pointer"
                onClick={() => setSelectedItem({
                  type: 'hospital',
                  data: { name: 'Riverside Memorial Emergency Hospital', neighborhood: 'Riverside', status: 'Emergency generator operating' }
                })}
              >
                <circle cx="160" cy="270" r="14" fill="#172436" stroke="#F43F5E" strokeWidth="2" />
                <path d="M 160 264 L 160 276 M 154 270 L 166 270" stroke="#F43F5E" strokeWidth="2.5" />
                <text x="180" y="274" fill="#F43F5E" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  Hospital
                </text>
              </g>

              {/* Interactive Incident Markers */}
              {filteredEvaluations.map(evaluation => {
                const inc = evaluation.incident;
                const coords = toSvgCoords(inc.latitude, inc.longitude);
                const isContested = evaluation.evidenceStatus === 'CONTESTED';
                const isCorroborated = evaluation.evidenceStatus === 'CORROBORATED';

                const markerColor = isContested ? '#FF8738' : isCorroborated ? '#35C98A' : '#22D3EE';

                return (
                  <g
                    key={inc.id}
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setSelectedItem({ type: 'incident', data: evaluation });
                    }}
                  >
                    {/* Pulsing halo */}
                    <circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r="18" 
                      fill={markerColor} 
                      fillOpacity="0.2" 
                      className="animate-pulse" 
                    />
                    
                    {/* Core pin */}
                    <circle 
                      cx={coords.x} 
                      cy={coords.y} 
                      r="10" 
                      fill="#0A1019" 
                      stroke={markerColor} 
                      strokeWidth="2.5" 
                    />

                    {/* Marker Center Symbol */}
                    <circle cx={coords.x} cy={coords.y} r="4" fill={markerColor} />

                    {/* Label Badge */}
                    <rect
                      x={coords.x - 30}
                      y={coords.y - 28}
                      width="60"
                      height="16"
                      rx="4"
                      fill="#111B29"
                      stroke={markerColor}
                      strokeWidth="1"
                    />
                    <text
                      x={coords.x}
                      y={coords.y - 17}
                      fill="#F4F7FB"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {inc.id}
                    </text>
                  </g>
                );
              })}

            </svg>

            {/* Map Legend */}
            <div className="absolute bottom-3 left-3 bg-cc-surface/90 border border-cc-border rounded-lg p-2.5 text-[10px] font-mono space-y-1.5 backdrop-blur-sm pointer-events-none">
              <span className="font-bold text-cc-text block uppercase">Map Legend</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cc-green" />
                <span className="text-cc-textMuted">Corroborated Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cc-orange" />
                <span className="text-cc-textMuted">Contested Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cc-cyan" />
                <span className="text-cc-textMuted">Unverified Incident</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-cc-green rounded-sm" />
                <span className="text-cc-textMuted">Shelter / Medical Station</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Right Drawer: Selected Marker Inspector */}
      {selectedItem && (
        <div className="w-full lg:w-80 bg-cc-bgSecondary border-t lg:border-t-0 lg:border-l border-cc-border p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-cc-border">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cc-cyan" />
                <span className="text-xs font-mono font-bold uppercase text-cc-text">
                  Location Detail
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-cc-textMuted hover:text-cc-text p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedItem.type === 'incident' ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-cc-cyan">
                      {selectedItem.data.incident.id}
                    </span>
                    <UrgencyBadge urgency={selectedItem.data.incident.urgency} />
                  </div>
                  <h3 className="text-sm font-semibold text-cc-text">
                    {selectedItem.data.incident.title}
                  </h3>
                  <div className="text-xs text-cc-textMuted mt-1">
                    {selectedItem.data.incident.neighborhood} • {selectedItem.data.incident.category}
                  </div>
                </div>

                <div className="flex gap-2">
                  <EvidenceBadge status={selectedItem.data.evidenceStatus} />
                  <FreshnessBadge status={selectedItem.data.freshnessStatus} />
                </div>

                <p className="text-xs text-cc-textMuted leading-relaxed bg-cc-surface p-2.5 rounded-lg border border-cc-border">
                  {selectedItem.data.incident.description}
                </p>

                {/* Evidence Stats */}
                <div className="bg-cc-surface border border-cc-border rounded-lg p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-cc-textMuted">Independent Sources:</span>
                    <span className="text-cc-text font-bold">{selectedItem.data.independentObservationsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cc-textMuted">Forwarded Replicas:</span>
                    <span className="text-cc-cyan font-bold">{selectedItem.data.forwardedCopiesCount}</span>
                  </div>
                  {selectedItem.data.conflictingObservationsCount > 0 && (
                    <div className="flex justify-between text-cc-orange font-bold">
                      <span>Conflicting Reports:</span>
                      <span>{selectedItem.data.conflictingObservationsCount}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedIncidentId(selectedItem.data.incident.id);
                    setCurrentView('evidence');
                  }}
                  className="w-full py-2 rounded-lg bg-cc-cyan/15 hover:bg-cc-cyan/25 border border-cc-cyan/30 text-cc-cyan font-mono text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <GitFork className="w-3.5 h-3.5" />
                  <span>Investigate Evidence Graph</span>
                </button>
              </div>
            ) : selectedItem.type === 'shelter' ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-cc-text">
                  {selectedItem.data.name}
                </h3>
                <div className="bg-cc-surface border border-cc-border rounded-lg p-3 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-cc-textMuted">Capacity:</span>
                    <span className="text-cc-text font-bold">{selectedItem.data.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cc-textMuted">Resource Request:</span>
                    <span className="text-cc-orange font-bold">20 units Drinking Water</span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentView('resources')}
                  className="w-full py-2 rounded-lg bg-cc-cyan hover:bg-cc-cyan/90 text-slate-950 font-mono text-xs font-bold"
                >
                  View Resource Matching
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                <h3 className="text-sm font-semibold text-cc-text">{selectedItem.data.name}</h3>
                <p className="text-cc-textMuted">{selectedItem.data.status}</p>
              </div>
            )}
          </div>

          <div className="pt-4 text-[10px] text-cc-textMuted font-mono text-center">
            CRISISCACHE Community Map • Fully Offline Ready
          </div>
        </div>
      )}

    </div>
  );
};
