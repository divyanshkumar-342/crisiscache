// Emergency Reporting Flow - 4-Step Provenance-Aware Mobile & Desktop Wizard
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { 
  IncidentCategory, 
  UrgencyLevel, 
  Neighborhood, 
  RelationshipType 
} from '../../types';
import { 
  X, 
  Waves, 
  Flame, 
  ShieldX, 
  Building2, 
  HeartPulse, 
  UserX, 
  Tent, 
  PowerOff, 
  HelpCircle,
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HardDriveDownload,
  ArrowRight,
  ArrowLeft,
  Radio,
  WifiOff
} from 'lucide-react';

const CATEGORIES: { id: IncidentCategory; label: string; icon: React.ElementType }[] = [
  { id: 'Flooding', label: 'Flooding', icon: Waves },
  { id: 'Fire', label: 'Fire', icon: Flame },
  { id: 'Road blockage', label: 'Road Blockage', icon: ShieldX },
  { id: 'Building damage', label: 'Building Damage', icon: Building2 },
  { id: 'Medical emergency', label: 'Medical Emergency', icon: HeartPulse },
  { id: 'Missing person', label: 'Missing Person', icon: UserX },
  { id: 'Shelter shortage', label: 'Shelter Shortage', icon: Tent },
  { id: 'Utility failure', label: 'Utility Failure', icon: PowerOff },
  { id: 'Other', label: 'Other Hazard', icon: HelpCircle },
];

const NEIGHBORHOOD_COORDS: Record<Neighborhood, { lat: number; lng: number }> = {
  'North Ward': { lat: 45.424, lng: -75.698 },
  'Riverside': { lat: 45.418, lng: -75.692 },
  'Old Town': { lat: 45.411, lng: -75.688 },
  'East District': { lat: 45.415, lng: -75.674 },
  'Central Shelter': { lat: 45.422, lng: -75.681 },
};

export const ReportModal: React.FC = () => {
  const { 
    isReportModalOpen, 
    setIsReportModalOpen, 
    activeNodeId, 
    incidents, 
    createReport,
    userRole
  } = useCrisisCache();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [category, setCategory] = useState<IncidentCategory>('Flooding');
  const [neighborhood, setNeighborhood] = useState<Neighborhood>('North Ward');
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('High');
  
  // Association
  const [associationMode, setAssociationMode] = useState<'NEW' | 'EXISTING'>('EXISTING');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'INC-01');
  const [newIncidentTitle, setNewIncidentTitle] = useState<string>('');
  const [evidenceRelation, setEvidenceRelation] = useState<'INDEPENDENTLY_CONFIRMS' | 'CONTRADICTS' | 'UPDATES'>('INDEPENDENTLY_CONFIRMS');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  if (!isReportModalOpen) return null;

  const handleClose = () => {
    setIsReportModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setSubmittedReportId(null);
      setDescription('');
    }, 200);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const coords = NEIGHBORHOOD_COORDS[neighborhood];

    let evidenceType: 'ORIGINAL' | 'CONFIRMATION' | 'CONTRADICTION' | 'UPDATE' = 'ORIGINAL';
    let relType: RelationshipType | undefined = undefined;

    if (associationMode === 'EXISTING') {
      if (evidenceRelation === 'CONTRADICTS') {
        evidenceType = 'CONTRADICTION';
        relType = 'CONTRADICTS';
      } else if (evidenceRelation === 'INDEPENDENTLY_CONFIRMS') {
        evidenceType = 'CONFIRMATION';
        relType = 'INDEPENDENTLY_CONFIRMS';
      } else {
        evidenceType = 'UPDATE';
        relType = 'UPDATES';
      }
    }

    try {
      const targetInc = incidents.find(i => i.id === selectedIncidentId);
      const generatedId = await createReport({
        incidentId: associationMode === 'EXISTING' ? selectedIncidentId : undefined,
        newIncidentTitle: associationMode === 'NEW' ? newIncidentTitle : undefined,
        category,
        description,
        neighborhood,
        latitude: coords.lat,
        longitude: coords.lng,
        urgency,
        evidenceType,
        relationshipType: relType,
        targetReportId: associationMode === 'EXISTING' ? targetInc?.id : undefined,
      });

      setSubmittedReportId(generatedId);
      setStep(4);
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-cc-surface border-t sm:border border-cc-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] h-full sm:h-auto animate-fade-in">
        
        {/* Modal Header */}
        <div className="px-4 py-3.5 border-b border-cc-border flex items-center justify-between bg-cc-bgSecondary shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cc-orange" />
            <h2 className="text-sm font-bold text-cc-text">
              Report an Emergency
            </h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-cc-textMuted hover:text-cc-text p-1.5 rounded-lg hover:bg-cc-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="px-4 py-2 bg-cc-bg/80 border-b border-cc-border flex items-center justify-between text-xs font-mono shrink-0">
          <span className={step === 1 ? 'text-cc-cyan font-bold' : 'text-cc-textMuted'}>1. Category</span>
          <span className="text-cc-border">→</span>
          <span className={step === 2 ? 'text-cc-cyan font-bold' : 'text-cc-textMuted'}>2. Location</span>
          <span className="text-cc-border">→</span>
          <span className={step === 3 ? 'text-cc-cyan font-bold' : 'text-cc-textMuted'}>3. Details</span>
          <span className="text-cc-border">→</span>
          <span className={step === 4 ? 'text-cc-cyan font-bold' : 'text-cc-textMuted'}>4. Submit</span>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* STEP 1: Incident Category */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-cc-text">What kind of emergency is it?</h3>
                <p className="text-xs text-cc-textMuted mt-0.5">
                  Select the category that best matches your direct observation.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all ${
                        isSelected 
                          ? 'bg-cc-cyan/15 border-cc-cyan text-cc-cyan ring-1 ring-cc-cyan' 
                          : 'bg-cc-bgSecondary border-cc-border text-cc-textMuted hover:border-cc-borderLight hover:text-cc-text'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cc-text">Where did it happen?</h3>
                <p className="text-xs text-cc-textMuted mt-0.5">
                  Choose the nearest affected neighborhood or community zone.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(['North Ward', 'Riverside', 'Old Town', 'East District', 'Central Shelter'] as Neighborhood[]).map(nb => (
                  <button
                    key={nb}
                    type="button"
                    onClick={() => setNeighborhood(nb)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                      neighborhood === nb
                        ? 'bg-cc-cyan/15 border-cc-cyan text-cc-cyan font-bold'
                        : 'bg-cc-bgSecondary border-cc-border text-cc-textMuted hover:border-cc-borderLight'
                    }`}
                  >
                    <span>{nb}</span>
                    <MapPin className="w-4 h-4 shrink-0" />
                  </button>
                ))}
              </div>

              <div className="bg-cc-bgSecondary p-3 rounded-xl border border-cc-border text-xs flex items-center justify-between">
                <span className="text-cc-textMuted">Estimated Coordinates:</span>
                <span className="font-mono text-cc-cyan">
                  {NEIGHBORHOOD_COORDS[neighborhood].lat.toFixed(3)}° N, {Math.abs(NEIGHBORHOOD_COORDS[neighborhood].lng).toFixed(3)}° W
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: Description & Urgency */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cc-text">What did you observe?</h3>
                <p className="text-xs text-cc-textMuted mt-0.5">
                  Provide factual details. CRISISCACHE will preserve your report without relying on a central server.
                </p>
              </div>

              {/* Urgency */}
              <div>
                <label className="text-xs font-semibold text-cc-text block mb-1.5">
                  Urgency Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as UrgencyLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setUrgency(lvl)}
                      className={`py-2 px-1 rounded-lg border text-xs font-semibold text-center transition-all ${
                        urgency === lvl
                          ? lvl === 'Critical' ? 'bg-cc-red/20 border-cc-red text-cc-red font-bold' :
                            lvl === 'High' ? 'bg-cc-orange/20 border-cc-orange text-cc-orange font-bold' :
                            lvl === 'Medium' ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold' :
                            'bg-blue-500/20 border-blue-400 text-blue-300 font-bold'
                          : 'bg-cc-bgSecondary border-cc-border text-cc-textMuted'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident association */}
              <div className="bg-cc-bgSecondary p-3 rounded-xl border border-cc-border space-y-2.5">
                <label className="text-xs font-semibold text-cc-text block">
                  Does this relate to an existing incident?
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAssociationMode('EXISTING')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      associationMode === 'EXISTING'
                        ? 'bg-cc-surface border-cc-cyan text-cc-cyan'
                        : 'border-cc-border text-cc-textMuted hover:bg-cc-surface/50'
                    }`}
                  >
                    Add to Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssociationMode('NEW')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      associationMode === 'NEW'
                        ? 'bg-cc-surface border-cc-cyan text-cc-cyan'
                        : 'border-cc-border text-cc-textMuted hover:bg-cc-surface/50'
                    }`}
                  >
                    New Incident
                  </button>
                </div>

                {associationMode === 'EXISTING' ? (
                  <div className="space-y-2 pt-1">
                    <select
                      value={selectedIncidentId}
                      onChange={(e) => setSelectedIncidentId(e.target.value)}
                      className="w-full bg-cc-surface border border-cc-border rounded-lg p-2 text-xs text-cc-text focus:outline-none focus:border-cc-cyan"
                    >
                      {incidents.map(inc => (
                        <option key={inc.id} value={inc.id}>
                          {inc.title} ({inc.neighborhood})
                        </option>
                      ))}
                    </select>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEvidenceRelation('INDEPENDENTLY_CONFIRMS')}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                          evidenceRelation === 'INDEPENDENTLY_CONFIRMS'
                            ? 'bg-cc-green/20 border-cc-green text-cc-green'
                            : 'border-cc-border text-cc-textMuted'
                        }`}
                      >
                        Confirms
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvidenceRelation('CONTRADICTS')}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                          evidenceRelation === 'CONTRADICTS'
                            ? 'bg-cc-orange/20 border-cc-orange text-cc-orange'
                            : 'border-cc-border text-cc-textMuted'
                        }`}
                      >
                        Contradicts
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvidenceRelation('UPDATES')}
                        className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                          evidenceRelation === 'UPDATES'
                            ? 'bg-cc-cyan/20 border-cc-cyan text-cc-cyan'
                            : 'border-cc-border text-cc-textMuted'
                        }`}
                      >
                        Updates
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Short incident title (e.g. Broken water pipe)"
                    value={newIncidentTitle}
                    onChange={(e) => setNewIncidentTitle(e.target.value)}
                    className="w-full bg-cc-surface border border-cc-border rounded-lg p-2 text-xs text-cc-text focus:outline-none focus:border-cc-cyan"
                  />
                )}
              </div>

              {/* Short description */}
              <div>
                <label className="text-xs font-semibold text-cc-text block mb-1">
                  Description of Hazard *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g. &quot;Water is knee-deep under the underpass. Vehicles cannot pass.&quot;"
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-xl p-3 text-xs text-cc-text focus:outline-none focus:border-cc-cyan resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Submission Confirmation & Provenance Receipt */}
          {step === 4 && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-cc-green/20 border border-cc-green/40 flex items-center justify-center mx-auto text-cc-green">
                <CheckCircle2 className="w-6 h-6 text-cc-green" />
              </div>

              <div>
                <h3 className="text-base font-bold text-cc-text">
                  Report Saved Locally
                </h3>
                <span className="font-mono text-xs text-cc-cyan mt-0.5 inline-block">
                  Report ID: {submittedReportId}
                </span>
              </div>

              {/* Clear, honest synchronization notice */}
              <div className="bg-cc-bgSecondary border border-cc-border rounded-xl p-4 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cc-cyan">
                  <HardDriveDownload className="w-4 h-4 shrink-0" />
                  <span>LOCAL STORAGE RECEIPT</span>
                </div>
                <p className="text-xs text-cc-text leading-relaxed">
                  "Report saved to <strong className="text-cc-cyan">{activeNodeId}</strong>. It will become available to other devices when synchronization is possible."
                </p>
                <div className="pt-2 border-t border-cc-border text-[11px] font-mono text-cc-textMuted space-y-1">
                  <div>Origin Node: <span className="text-cc-text font-bold">{activeNodeId}</span></div>
                  <div>Sync Status: <span className="text-amber-400 font-semibold">Pending Mesh Transfer</span></div>
                  <div>Engine: <span className="text-cc-green font-semibold">IndexedDB Local Cache</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 py-3 border-t border-cc-border bg-cc-bgSecondary flex items-center justify-between shrink-0">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-3 py-1.5 rounded-lg border border-cc-border text-xs font-mono text-cc-textMuted hover:text-cc-text flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={() => setStep((step + 1) as any)}
              className="px-4 py-2 rounded-lg bg-cc-cyan hover:bg-cc-cyan/90 text-slate-950 text-xs font-bold flex items-center gap-1.5"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 3 && (
            <button
              type="button"
              disabled={isSubmitting || !description.trim()}
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-cc-orange hover:bg-cc-orange/90 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cc-orange/20"
            >
              {isSubmitting ? 'Saving...' : 'Save Report Locally'}
            </button>
          )}

          {step === 4 && (
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2 rounded-lg bg-cc-cyan hover:bg-cc-cyan/90 text-slate-950 text-xs font-bold"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
