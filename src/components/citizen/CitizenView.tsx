// Citizen Mode — FEMA App / Red Cross Mobile Disaster Response Design (High-Contrast, Clean Light Emergency Theme)
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import {
  AlertTriangle,
  Radio,
  BookOpen,
  MapPin,
  ShieldAlert,
  Check,
  ChevronDown,
  ChevronRight,
  Wifi,
  WifiOff,
  Home,
  Map as MapIcon,
  Bell,
  Package,
  HeartHandshake,
  AlertOctagon,
  Droplets,
  Utensils,
  Truck,
  HeartPulse,
  Home as HomeIcon,
  Info,
  Clock,
  CheckCircle2,
  X,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { IncidentMap } from '../map/IncidentMap';

type CitizenNavTab = 'home' | 'map' | 'alerts' | 'need_help' | 'can_help' | 'profile';

export const CitizenView: React.FC = () => {
  const {
    localEvaluations,
    requests,
    offers,
    activeDevice,
    networkPartitions,
    setIsReportModalOpen,
    setIsManualOpen,
    setUserRole,
    createResourceRequest,
    createResourceOffer,
    activeNodeId
  } = useCrisisCache();

  const [activeTab, setActiveTab] = useState<CitizenNavTab>('home');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for "I Need Help"
  const [customReqCategory, setCustomReqCategory] = useState<any>('Drinking water');
  const [customReqQty, setCustomReqQty] = useState<number>(5);
  const [customReqUnit, setCustomReqUnit] = useState<string>('gallons');
  const [customReqUrgency, setCustomReqUrgency] = useState<any>('High');
  const [customReqDesc, setCustomReqDesc] = useState<string>('');

  // Form states for "I Can Help"
  const [customOffCategory, setCustomOffCategory] = useState<any>('Drinking water');
  const [customOffQty, setCustomOffQty] = useState<number>(10);
  const [customOffUnit, setCustomOffUnit] = useState<string>('gallons');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleQuickRequest = async (cat: any, qty: number, unit: string, desc?: string, urg: any = 'High') => {
    await createResourceRequest({
      nodeId: activeNodeId,
      category: cat,
      quantity: qty,
      unit,
      urgency: urg,
      neighborhood: activeDevice?.neighborhood || 'North Ward',
      description: desc || `Citizen request for ${qty} ${unit} of ${cat}`,
      latitude: activeDevice?.latitude || 45.42,
      longitude: activeDevice?.longitude || -75.69,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    showToast(`Help request for ${qty} ${unit} of ${cat} recorded locally. It will sync automatically when nearby phones connect.`);
  };

  const handleQuickOffer = async (cat: any, qty: number, unit: string) => {
    await createResourceOffer({
      nodeId: activeNodeId,
      category: cat,
      quantity: qty,
      unit,
      neighborhood: activeDevice?.neighborhood || 'Riverside',
      latitude: activeDevice?.latitude || 45.42,
      longitude: activeDevice?.longitude || -75.69,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });
    showToast(`Thank you! Your offer of ${qty} ${unit} of ${cat} is published in the local neighborhood registry.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden relative font-sans">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-3 right-3 z-50 max-w-md mx-auto bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl flex items-start gap-3 border border-emerald-500 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed flex-1">{toastMessage}</p>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Scroll Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* ========================================================= */}
        {/* TAB 1: HOME (FEMA Clean Citizen Emergency Home Screen)    */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 space-y-4">
            
            {/* FEMA-style Offline Status Alert Banner */}
            <div className="bg-amber-50 border-l-4 border-amber-500 border-y border-r border-amber-200 rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Local Mesh Mode Active • No Internet Required
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  You are currently offline. Reports, requests, and offers are stored on this device and securely exchanged when your phone comes within range of other community members.
                </p>
              </div>
            </div>

            {/* Title & Location Header */}
            <div className="pt-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">How can we help?</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Community Zone: <strong className="text-blue-700">{activeDevice?.neighborhood || 'North Ward'}</strong>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200">
                ACTIVE CRISIS
              </span>
            </div>

            {/* THREE PRIMARY ACTION TILES (Clear, Bold, Accessible Touch Targets) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              
              {/* ACTION 1: REPORT AN EMERGENCY */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-white border-2 border-red-200 hover:border-red-500 rounded-2xl p-4 text-left flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-red-500/10 group active:scale-[0.98] shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-3 group-hover:scale-105 transition-transform">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    Report Hazard
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Submit flood, fire, or road blockage observations.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-red-600">
                  <span>Start Report</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* ACTION 2: I NEED HELP */}
              <button
                onClick={() => setActiveTab('need_help')}
                className="bg-white border-2 border-blue-200 hover:border-blue-500 rounded-2xl p-4 text-left flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-blue-500/10 group active:scale-[0.98] shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-105 transition-transform">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    I Need Help
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Request drinking water, rations, medical aid, or transport.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
                  <span>Request Aid</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* ACTION 3: I CAN HELP */}
              <button
                onClick={() => setActiveTab('can_help')}
                className="bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-4 text-left flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-emerald-500/10 group active:scale-[0.98] shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    I Can Help
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Volunteer vehicle, share supplies, or offer shelter.
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <span>Offer Help</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

            </div>

            {/* NEARBY EMERGENCY HAZARDS (Clear White Card Layout) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                  <h3 className="text-sm font-bold text-slate-900">Nearby Emergency Alerts</h3>
                </div>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View All ({localEvaluations.length})
                </button>
              </div>

              {localEvaluations.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No active emergency alerts recorded locally.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {localEvaluations.slice(0, 3).map(ev => {
                    const isContested = ev.evidenceStatus === 'CONTESTED';
                    const isCorroborated = ev.evidenceStatus === 'CORROBORATED';
                    return (
                      <div
                        key={ev.incident.id}
                        onClick={() => {
                          setActiveTab('alerts');
                          setExpandedId(ev.incident.id);
                        }}
                        className="p-3.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer transition-colors space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-slate-900 truncate">
                            {ev.incident.title}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isContested ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            isCorroborated ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {isContested ? '⚠️ Contested' : isCorroborated ? '✓ Corroborated' : 'Single Witness'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            {ev.incident.neighborhood}
                          </span>
                          <span>•</span>
                          <span>{ev.independentObservationsCount} Independent Witness{ev.independentObservationsCount !== 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NEARBY RELIEF SHELTERS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <HomeIcon className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Designated Relief Shelters</h3>
                </div>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Central High School Shelter</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Central Shelter District • Capacity: 250 evacuees</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    OPEN
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Riverside Memorial Hospital</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Riverside • Emergency triage active on backup power</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: I NEED HELP (Clean Light Emergency Aid Workflow)   */}
        {/* ========================================================= */}
        {activeTab === 'need_help' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 space-y-4">
            
            <div className="bg-red-50 border-l-4 border-red-600 border-y border-r border-red-200 rounded-2xl p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-red-700 font-bold text-base">
                <HeartPulse className="w-5 h-5 text-red-600" />
                <span>Emergency Aid & Supply Request</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requests are stored locally on your device. As neighboring phones connect via mesh, your request will be delivered to coordinators to arrange distribution.
              </p>
            </div>

            {/* Quick 1-Tap Request Tiles */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Quick 1-Tap Urgent Request
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleQuickRequest('Drinking water', 5, 'gallons', 'Family needs fresh drinking water', 'Critical')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-red-500 hover:bg-red-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span>Water (5 gal)</span>
                  <span className="text-[10px] text-red-600 font-semibold">Request Now</span>
                </button>

                <button
                  onClick={() => handleQuickRequest('Food', 5, 'rations', 'Emergency meal supplies needed', 'High')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-red-500 hover:bg-red-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span>Food Rations</span>
                  <span className="text-[10px] text-red-600 font-semibold">Request Now</span>
                </button>

                <button
                  onClick={() => handleQuickRequest('Medicine', 1, 'kit', 'Bandages and first aid treatment', 'Critical')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-red-500 hover:bg-red-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <span>First Aid Kit</span>
                  <span className="text-[10px] text-red-600 font-semibold">Request Now</span>
                </button>

                <button
                  onClick={() => handleQuickRequest('Transport', 1, 'evacuation', 'Assistance needed to reach high ground', 'Critical')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-red-500 hover:bg-red-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span>Evacuation Aid</span>
                  <span className="text-[10px] text-red-600 font-semibold">Request Now</span>
                </button>
              </div>
            </div>

            {/* Custom Request Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Specify Custom Request
              </h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Resource Category</label>
                    <select
                      value={customReqCategory}
                      onChange={(e) => setCustomReqCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                    >
                      <option value="Drinking water">Drinking water</option>
                      <option value="Food">Food / Meals</option>
                      <option value="Medicine">Medicine / First Aid</option>
                      <option value="Transport">Transport / Evacuation</option>
                      <option value="Shelter">Shelter Space</option>
                      <option value="Fuel">Fuel / Generator</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={customReqQty}
                        onChange={(e) => setCustomReqQty(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Unit</label>
                      <input
                        type="text"
                        value={customReqUnit}
                        onChange={(e) => setCustomReqUnit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Priority Level</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Low', 'Medium', 'High', 'Critical'] as const).map(lvl => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCustomReqUrgency(lvl)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                          customReqUrgency === lvl
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Location Details / Note</label>
                  <input
                    type="text"
                    value={customReqDesc}
                    onChange={(e) => setCustomReqDesc(e.target.value)}
                    placeholder="E.g. Trapped on second floor, 3 people with me"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-red-500 font-medium"
                  />
                </div>

                <button
                  onClick={() => handleQuickRequest(customReqCategory, customReqQty, customReqUnit, customReqDesc, customReqUrgency)}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-red-600/20"
                >
                  Save Emergency Request Locally
                </button>
              </div>
            </div>

            {/* Existing Active Requests */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Current Registered Community Needs
              </h3>
              <div className="space-y-2">
                {requests.map(req => (
                  <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {req.quantity} {req.unit} of {req.category}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {req.neighborhood} • {req.description || 'Assistance requested'}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200">
                      {req.urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: I CAN HELP (Volunteer Supply Portal)                */}
        {/* ========================================================= */}
        {activeTab === 'can_help' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 space-y-4">
            
            <div className="bg-emerald-50 border-l-4 border-emerald-600 border-y border-r border-emerald-200 rounded-2xl p-4 space-y-1 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <span>Volunteer & Community Support Portal</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thank you for helping your community. Registered offers are matched deterministically with verified emergency needs.
              </p>
            </div>

            {/* Quick 1-Tap Offer Tiles */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Quick 1-Tap Donation Offer
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleQuickOffer('Drinking water', 10, 'gallons')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span>Offer 10L Water</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Publish</span>
                </button>

                <button
                  onClick={() => handleQuickOffer('Food', 12, 'meals')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <span>Offer 12 Meals</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Publish</span>
                </button>

                <button
                  onClick={() => handleQuickOffer('Transport', 1, 'SUV vehicle')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span>Volunteer 4x4</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Publish</span>
                </button>

                <button
                  onClick={() => handleQuickOffer('Shelter', 4, 'beds')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50/50 text-xs font-bold text-slate-800 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <HomeIcon className="w-5 h-5" />
                  </div>
                  <span>Offer 4 Beds</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Publish</span>
                </button>
              </div>
            </div>

            {/* Custom Offer Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Specify Custom Offer
              </h3>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Resource Category</label>
                    <select
                      value={customOffCategory}
                      onChange={(e) => setCustomOffCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="Drinking water">Drinking water</option>
                      <option value="Food">Food / Meals</option>
                      <option value="Medicine">Medicine / First Aid</option>
                      <option value="Transport">Vehicle / Transport</option>
                      <option value="Shelter">Shelter Space / Room</option>
                      <option value="Fuel">Generator / Fuel</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Quantity Available</label>
                      <input
                        type="number"
                        min="1"
                        value={customOffQty}
                        onChange={(e) => setCustomOffQty(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Unit</label>
                      <input
                        type="text"
                        value={customOffUnit}
                        onChange={(e) => setCustomOffUnit(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleQuickOffer(customOffCategory, customOffQty, customOffUnit)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20"
                >
                  Publish Donation Offer
                </button>
              </div>
            </div>

            {/* List of Available Community Offers */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Current Registered Volunteer Offers
              </h3>
              <div className="space-y-2">
                {offers.map(off => (
                  <div key={off.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {off.quantity} {off.unit} of {off.category}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Offered by {off.nodeId} in {off.neighborhood}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      AVAILABLE
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: MAP (Community Geographic Overview)                */}
        {/* ========================================================= */}
        {activeTab === 'map' && (
          <div className="h-full flex flex-col p-3 sm:p-5 max-w-4xl mx-auto w-full space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-lg font-black text-slate-900">Community Emergency Map</h2>
                <p className="text-xs text-slate-500">Shelters, blocked roads, and reports</p>
              </div>
            </div>
            <div className="flex-1 min-h-[460px] bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm">
              <IncidentMap />
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ALERTS (Incident Alerts & Corroboration Feed)      */}
        {/* ========================================================= */}
        {activeTab === 'alerts' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg font-black text-slate-900">Emergency Alert Feed</h2>
                <p className="text-xs text-slate-500">Live community observations</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm"
              >
                + New Report
              </button>
            </div>

            {localEvaluations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
                No active hazard reports available on this device.
              </div>
            ) : (
              <div className="space-y-3">
                {localEvaluations.map(ev => {
                  const { incident } = ev;
                  const isExpanded = expandedId === incident.id;
                  const isContested = ev.evidenceStatus === 'CONTESTED';
                  const isCorroborated = ev.evidenceStatus === 'CORROBORATED';

                  return (
                    <div
                      key={incident.id}
                      className={`bg-white border rounded-2xl overflow-hidden transition-all shadow-sm ${
                        isContested ? 'border-amber-300' : 'border-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : incident.id)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-slate-900">
                              {incident.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-blue-700">
                              <MapPin className="w-3.5 h-3.5" />
                              {incident.neighborhood}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-600">{incident.category}</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {ev.independentObservationsCount} Independent Witness{ev.independentObservationsCount !== 1 ? 'es' : ''}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isContested ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            isCorroborated ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {isContested ? '⚠️ Contested' : isCorroborated ? '✓ Corroborated' : 'Single Witness'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50 space-y-3">
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {incident.description}
                          </p>

                          <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs space-y-1.5 shadow-sm">
                            <div className="font-bold text-blue-700 text-xs uppercase tracking-wider">Lineage Provenance</div>
                            <div className="flex justify-between text-slate-600">
                              <span>Origin Witnesses:</span>
                              <strong className="text-slate-900">{ev.independentObservationsCount}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Forwarded Copies:</span>
                              <strong className="text-slate-900">{ev.forwardedCopiesCount}</strong>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => setIsReportModalOpen(true)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                            >
                              Confirm Hazard
                            </button>
                            <button
                              onClick={() => setIsReportModalOpen(true)}
                              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-sm"
                            >
                              Report Changed
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

        {/* ========================================================= */}
        {/* TAB 6: PROFILE (Node Settings)                            */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-5 space-y-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Device Node Profile</h2>
              <p className="text-xs text-slate-500">Local node configuration and emergency guidance</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-blue-700 tracking-wider">Local Device Node</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Device ID</span>
                  <span className="font-mono font-bold text-slate-900">{activeDevice?.id || 'Device A'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-slate-500 block text-[10px]">Neighborhood</span>
                  <span className="font-bold text-slate-900">{activeDevice?.neighborhood || 'North Ward'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-900">Emergency Manual</h3>
              <p className="text-xs text-slate-500">
                Offline instructions and field survival guidance.
              </p>
              <button
                onClick={() => setIsManualOpen(true)}
                className="mt-2 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Open User Manual</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold uppercase text-slate-900">Operations Command Center</h3>
              <p className="text-xs text-slate-500">
                Switch to the tactical coordinator command center.
              </p>
              <button
                onClick={() => setUserRole('coordinator')}
                className="mt-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Switch to Operations Mode</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 6-ITEM BOTTOM NAVIGATION BAR (FEMA App Clean White Navigation) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around h-16 px-1 select-none shadow-lg"
        aria-label="Citizen Navigation"
      >
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('need_help')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            activeTab === 'need_help' ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <LifeBuoy className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Need Aid</span>
        </button>

        {/* Center Primary Action: Emergency Report */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 -mt-5"
          aria-label="Report Emergency"
        >
          <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/30 border-4 border-slate-50">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-bold text-red-600 mt-0.5">Report</span>
        </button>

        <button
          onClick={() => setActiveTab('can_help')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            activeTab === 'can_help' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartHandshake className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Can Help</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors ${
            activeTab === 'map' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Map</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-xs transition-colors relative ${
            activeTab === 'alerts' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Alerts</span>
          {localEvaluations.length > 0 && (
            <span className="absolute top-2 right-1/4 w-2 h-2 rounded-full bg-red-600" />
          )}
        </button>
      </nav>

    </div>
  );
};
