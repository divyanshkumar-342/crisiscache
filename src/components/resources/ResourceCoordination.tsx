// Module E: Resource Coordination - Requests, Offers & Deterministic Matching
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { 
  ResourceCategory, 
  UrgencyLevel, 
  Neighborhood 
} from '../../types';
import { UrgencyBadge } from '../common/Badge';
import { 
  PackageSearch, 
  Check, 
  X, 
  Plus, 
  HandHeart, 
  Layers, 
  MapPin, 
  Clock, 
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const ResourceCoordination: React.FC = () => {
  const { 
    requests, 
    offers, 
    matches, 
    approveMatch, 
    rejectMatch, 
    createResourceRequest, 
    createResourceOffer,
    activeNodeId 
  } = useCrisisCache();

  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'offers'>('matches');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Form states for new Request
  const [reqCategory, setReqCategory] = useState<ResourceCategory>('Drinking water');
  const [reqQuantity, setReqQuantity] = useState<number>(10);
  const [reqUnit, setReqUnit] = useState<string>('units');
  const [reqUrgency, setReqUrgency] = useState<UrgencyLevel>('High');
  const [reqNeighborhood, setReqNeighborhood] = useState<Neighborhood>('North Ward');
  const [reqDescription, setReqDescription] = useState<string>('');

  // Form states for new Offer
  const [offCategory, setOffCategory] = useState<ResourceCategory>('Drinking water');
  const [offQuantity, setOffQuantity] = useState<number>(10);
  const [offUnit, setOffUnit] = useState<string>('units');
  const [offNeighborhood, setOffNeighborhood] = useState<Neighborhood>('Riverside');

  const pendingMatches = matches.filter(m => m.status === 'PENDING');
  const approvedMatches = matches.filter(m => m.status === 'APPROVED');

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await createResourceRequest({
      nodeId: activeNodeId,
      category: reqCategory,
      quantity: Number(reqQuantity),
      unit: reqUnit,
      urgency: reqUrgency,
      neighborhood: reqNeighborhood,
      description: reqDescription,
      latitude: 45.42,
      longitude: -75.69,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    setIsRequestModalOpen(false);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    await createResourceOffer({
      nodeId: activeNodeId,
      category: offCategory,
      quantity: Number(offQuantity),
      unit: offUnit,
      neighborhood: offNeighborhood,
      latitude: 45.42,
      longitude: -75.69,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    setIsOfferModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-cc-bg">
      
      {/* Top Header & Tabs */}
      <div className="p-3 sm:p-4 bg-cc-bgSecondary border-b border-cc-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-cc-cyan" />
            <h1 className="text-sm font-mono font-bold uppercase tracking-wider text-cc-text">
              Decentralized Resource Hub
            </h1>
          </div>
          <p className="text-xs text-cc-textMuted mt-0.5">
            Deterministic multi-offer matching engine connecting community resources without centralized dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-cc-orange/15 hover:bg-cc-orange/25 border border-cc-orange/30 text-cc-orange text-xs font-mono font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Aid</span>
          </button>

          <button
            onClick={() => setIsOfferModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-cc-green/15 hover:bg-cc-green/25 border border-cc-green/30 text-cc-green text-xs font-mono font-semibold flex items-center gap-1.5"
          >
            <HandHeart className="w-3.5 h-3.5" />
            <span>Offer Supply</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-3 sm:px-4 bg-cc-surface border-b border-cc-border flex items-center gap-3 sm:gap-6 text-xs font-mono shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('matches')}
          className={`py-3 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'matches'
              ? 'border-cc-cyan text-cc-cyan'
              : 'border-transparent text-cc-textMuted hover:text-cc-text'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Suggested Allocations</span>
          {pendingMatches.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cc-cyan text-slate-950 font-bold">
              {pendingMatches.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`py-3 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'requests'
              ? 'border-cc-cyan text-cc-cyan'
              : 'border-transparent text-cc-textMuted hover:text-cc-text'
          }`}
        >
          <span>Resource Requests</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cc-bgSecondary border border-cc-border text-cc-textMuted">
            {requests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`py-3 border-b-2 font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'offers'
              ? 'border-cc-cyan text-cc-cyan'
              : 'border-transparent text-cc-textMuted hover:text-cc-text'
          }`}
        >
          <span>Available Offers</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cc-bgSecondary border border-cc-border text-cc-textMuted">
            {offers.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
        
        {/* TAB 1: SUGGESTED MATCHES */}
        {activeTab === 'matches' && (
          <div className="space-y-4 max-w-5xl mx-auto">
            {matches.length === 0 ? (
              <div className="p-8 text-center text-xs text-cc-textMuted bg-cc-surface border border-cc-border rounded-xl">
                No active match recommendations computed. Add matching requests and offers to run allocation.
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map(match => {
                  const isApproved = match.status === 'APPROVED';
                  const isPending = match.status === 'PENDING';
                  const targetReq = requests.find(r => r.id === match.requestId);

                  return (
                    <div
                      key={match.id}
                      className={`bg-cc-surface border rounded-xl p-4 transition-all ${
                        isApproved ? 'border-cc-green/40' : 'border-cc-cyan/40 shadow-lg'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-cc-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cc-cyan">{match.id}</span>
                          <span className="text-xs font-semibold text-cc-text">
                            Allocation: {match.targetQuantity} {match.unit} of {targetReq?.category || 'supplies'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isApproved ? 'bg-cc-green/20 text-cc-green' : 'bg-cc-cyan/20 text-cc-cyan'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                      </div>

                      {/* Request Destination & Contributing Offers */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 text-xs">
                        {/* Request target */}
                        <div className="p-3 bg-cc-bgSecondary border border-cc-border rounded-lg space-y-1">
                          <span className="text-[10px] font-mono uppercase text-cc-textMuted font-bold">Fulfills Request Target</span>
                          <div className="font-semibold text-cc-text">
                            {match.targetQuantity} {match.unit} to {targetReq?.neighborhood || 'Target Zone'}
                          </div>
                          <div className="text-[11px] text-cc-textMuted font-mono">
                            Target Request ID: {match.requestId}
                          </div>
                        </div>

                        {/* Combined Offers */}
                        <div className="p-3 bg-cc-bgSecondary border border-cc-border rounded-lg space-y-1">
                          <span className="text-[10px] font-mono uppercase text-cc-textMuted font-bold">
                            Combined Community Offers ({match.matches.length})
                          </span>
                          <div className="space-y-1 pt-0.5">
                            {match.matches.map(m => {
                              const found = offers.find(o => o.id === m.offerId);
                              return (
                                <div key={m.offerId} className="flex justify-between text-[11px] font-mono text-cc-text">
                                  <span>{m.offerId} ({found?.neighborhood || m.offerNodeId}):</span>
                                  <span className="text-cc-green font-bold">+{m.quantity} {m.unit}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Explicit Coordinator Approval Required Notice */}
                      {isPending && (
                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-cc-border/60">
                          <p className="text-[11px] text-cc-textMuted leading-relaxed">
                            ⚠️ <strong>Explicit coordinator approval required.</strong> Matching logic computes candidate allocations; supplies are only marked allocated upon human confirmation.
                          </p>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => rejectMatch(match.id)}
                              className="px-3 py-1.5 rounded-lg border border-cc-border hover:bg-cc-bgSecondary text-xs font-mono text-cc-textMuted transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => approveMatch(match.id)}
                              className="px-3 py-1.5 rounded-lg bg-cc-green hover:bg-cc-green/90 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-cc-green/20"
                            >
                              Approve Allocation
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: REQUESTS */}
        {activeTab === 'requests' && (
          <div className="space-y-3 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requests.map(req => (
                <div key={req.id} className="p-3.5 bg-cc-surface border border-cc-border rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cc-cyan">{req.id}</span>
                    <UrgencyBadge urgency={req.urgency} size="sm" />
                  </div>
                  <div>
                    <div className="font-semibold text-cc-text text-sm">
                      {req.quantity} {req.unit} of {req.category}
                    </div>
                    <div className="text-cc-textMuted text-[11px] mt-0.5">{req.description}</div>
                  </div>
                  <div className="pt-2 border-t border-cc-border/60 flex items-center justify-between font-mono text-[10px] text-cc-textMuted">
                    <span>Location: {req.neighborhood}</span>
                    <span className="px-1.5 py-0.5 rounded bg-cc-bgSecondary border border-cc-border text-cc-text">
                      Status: {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OFFERS */}
        {activeTab === 'offers' && (
          <div className="space-y-3 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {offers.map(off => (
                <div key={off.id} className="p-3.5 bg-cc-surface border border-cc-border rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cc-green">{off.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cc-green/15 text-cc-green font-bold">
                      {off.status}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-cc-text text-sm">
                      {off.quantity} {off.unit} of {off.category}
                    </div>
                    <div className="text-cc-textMuted text-[11px] mt-0.5">Offered by {off.nodeId}</div>
                  </div>
                  <div className="pt-2 border-t border-cc-border/60 flex items-center justify-between font-mono text-[10px] text-cc-textMuted">
                    <span>Location: {off.neighborhood}</span>
                    <span>Allocated: {off.allocatedQuantity} / {off.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal: New Request */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cc-surface border border-cc-border rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-cc-border">
              <h2 className="text-sm font-bold text-cc-text">Register Resource Request</h2>
              <button onClick={() => setIsRequestModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-cc-textMuted mb-1">Resource Category</label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as any)}
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                >
                  <option value="Drinking water">Drinking water</option>
                  <option value="Food">Food</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Transport">Transport</option>
                  <option value="Fuel">Fuel</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-cc-textMuted mb-1">Quantity</label>
                  <input
                    type="number"
                    value={reqQuantity}
                    onChange={(e) => setReqQuantity(Number(e.target.value))}
                    className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                  />
                </div>
                <div>
                  <label className="block text-cc-textMuted mb-1">Unit</label>
                  <input
                    type="text"
                    value={reqUnit}
                    onChange={(e) => setReqUnit(e.target.value)}
                    className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-cc-textMuted mb-1">Target Neighborhood</label>
                <select
                  value={reqNeighborhood}
                  onChange={(e) => setReqNeighborhood(e.target.value as any)}
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                >
                  <option value="North Ward">North Ward</option>
                  <option value="Riverside">Riverside</option>
                  <option value="Old Town">Old Town</option>
                  <option value="East District">East District</option>
                  <option value="Central Shelter">Central Shelter</option>
                </select>
              </div>
              <div>
                <label className="block text-cc-textMuted mb-1">Urgency</label>
                <select
                  value={reqUrgency}
                  onChange={(e) => setReqUrgency(e.target.value as any)}
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-cc-textMuted mb-1">Description / Location Details</label>
                <textarea
                  rows={2}
                  value={reqDescription}
                  onChange={(e) => setReqDescription(e.target.value)}
                  placeholder="E.g. Clean drinking water for 15 evacuees at school gym."
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-cc-orange hover:bg-cc-orange/90 text-slate-950 font-bold rounded-lg mt-2"
              >
                Save Request Locally
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Offer */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cc-surface border border-cc-border rounded-xl p-5 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-cc-border">
              <h2 className="text-sm font-bold text-cc-text">Register Resource Offer</h2>
              <button onClick={() => setIsOfferModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-cc-textMuted mb-1">Resource Category</label>
                <select
                  value={offCategory}
                  onChange={(e) => setOffCategory(e.target.value as any)}
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                >
                  <option value="Drinking water">Drinking water</option>
                  <option value="Food">Food</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Transport">Transport</option>
                  <option value="Fuel">Fuel</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-cc-textMuted mb-1">Quantity Available</label>
                  <input
                    type="number"
                    value={offQuantity}
                    onChange={(e) => setOffQuantity(Number(e.target.value))}
                    className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                  />
                </div>
                <div>
                  <label className="block text-cc-textMuted mb-1">Unit</label>
                  <input
                    type="text"
                    value={offUnit}
                    onChange={(e) => setOffUnit(e.target.value)}
                    className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-cc-textMuted mb-1">Location / Staging Area</label>
                <select
                  value={offNeighborhood}
                  onChange={(e) => setOffNeighborhood(e.target.value as any)}
                  className="w-full bg-cc-bgSecondary border border-cc-border rounded-lg p-2 text-cc-text"
                >
                  <option value="Riverside">Riverside</option>
                  <option value="East District">East District</option>
                  <option value="North Ward">North Ward</option>
                  <option value="Old Town">Old Town</option>
                  <option value="Central Shelter">Central Shelter</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-cc-green hover:bg-cc-green/90 text-slate-950 font-bold rounded-lg mt-2"
              >
                Publish Community Offer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
