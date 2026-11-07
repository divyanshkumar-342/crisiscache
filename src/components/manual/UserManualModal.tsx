// In-App Interactive User Manual & Disaster Field Guide
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import {
  X,
  BookOpen,
  Radio,
  AlertTriangle,
  Droplets,
  Smartphone,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  GitFork,
  SlidersHorizontal
} from 'lucide-react';

type Section = 'quickstart' | 'report' | 'supplies' | 'how_it_works' | 'coordinator' | 'faq';

const sections: { id: Section; emoji: string; title: string }[] = [
  { id: 'quickstart', emoji: '🚀', title: 'Getting Started (30 sec)' },
  { id: 'report',     emoji: '🚨', title: 'How to Report a Hazard' },
  { id: 'supplies',   emoji: '📦', title: 'Requesting & Sharing Supplies' },
  { id: 'how_it_works', emoji: '📡', title: 'How Offline Sync Works' },
  { id: 'coordinator', emoji: '🎛️', title: 'Coordinator Operations' },
  { id: 'faq',        emoji: '❓', title: 'FAQ & Troubleshooting' },
];

export const UserManualModal: React.FC = () => {
  const { isManualOpen, setIsManualOpen } = useCrisisCache();
  const [activeSection, setActiveSection] = useState<Section>('quickstart');

  if (!isManualOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-cc-surface border border-cc-border rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-cc-border bg-cc-bgSecondary flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cc-cyan" />
            <div>
              <h2 className="text-sm font-bold text-cc-text">CRISISCACHE User Manual</h2>
              <p className="text-[11px] text-cc-textMuted">Works 100% offline • No internet required</p>
            </div>
          </div>
          <button
            onClick={() => setIsManualOpen(false)}
            className="p-2 rounded-xl text-cc-textMuted hover:text-cc-text hover:bg-cc-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar nav — hidden on very small screens, shown alongside */}
          <div className="hidden sm:flex flex-col w-52 border-r border-cc-border bg-cc-bg shrink-0 py-2">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-all ${
                  activeSection === s.id
                    ? 'bg-cc-surface text-cc-cyan border-r-2 border-cc-cyan'
                    : 'text-cc-textMuted hover:text-cc-text hover:bg-cc-surface/40'
                }`}
              >
                <span className="text-base shrink-0">{s.emoji}</span>
                <span className="leading-tight">{s.title}</span>
              </button>
            ))}
          </div>

          {/* Mobile tab strip */}
          <div className="sm:hidden flex overflow-x-auto border-b border-cc-border bg-cc-bg shrink-0 absolute left-0 right-0" style={{top: '64px'}}>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1 px-3 py-2 border-b-2 shrink-0 text-[11px] font-medium whitespace-nowrap transition-all ${
                  activeSection === s.id ? 'border-cc-cyan text-cc-cyan' : 'border-transparent text-cc-textMuted'
                }`}
              >
                <span>{s.emoji}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm leading-relaxed text-cc-text">

            {/* ── GETTING STARTED ── */}
            {activeSection === 'quickstart' && (
              <div className="space-y-4">
                <div className="bg-cc-green/10 border border-cc-green/30 rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-cc-green text-base">You're safe. This app works without internet.</p>
                  <p className="text-cc-textMuted text-xs">No registration. No SIM card needed. All data is stored on your phone.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { n: '1', icon: '🚨', title: 'See a hazard?', desc: 'Tap the big orange "Report a Hazard" button. It takes less than 30 seconds.' },
                    { n: '2', icon: '🙏', title: 'Need water, food, or help?', desc: 'Tap one of the quick buttons under "I Need Help". Coordinators will match you.' },
                    { n: '3', icon: '🤝', title: 'Have spare supplies?', desc: 'Tap "I Can Help" and share what you have — even a few litres of water or a car matters.' },
                    { n: '4', icon: '📡', title: 'Stay nearby other people', desc: 'The more devices are near each other, the faster hazard reports spread across the community — no Wi-Fi needed.' },
                  ].map(step => (
                    <div key={step.n} className="flex items-start gap-3 p-3 bg-cc-bgSecondary border border-cc-border rounded-xl">
                      <div className="w-7 h-7 rounded-full bg-cc-cyan/20 border border-cc-cyan/40 text-cc-cyan flex items-center justify-center text-xs font-bold shrink-0">
                        {step.n}
                      </div>
                      <div>
                        <div className="font-semibold text-cc-text text-xs">{step.icon} {step.title}</div>
                        <div className="text-cc-textMuted text-xs mt-0.5">{step.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── REPORT A HAZARD ── */}
            {activeSection === 'report' && (
              <div className="space-y-4">
                <p className="text-cc-textMuted text-xs">You don't need to be certain — any observation helps. Even a quick message like "road underwater near old bridge" is useful.</p>

                <div className="space-y-2">
                  <div className="font-bold text-cc-text mb-1">Step-by-step:</div>
                  {[
                    { step: 'Tap the orange "Report Hazard" button', note: 'It\'s always visible at the top right of the screen.' },
                    { step: 'Choose what you saw', note: 'Flooding? Fire? Blocked road? Injury? Just tap the icon that matches.' },
                    { step: 'Choose your neighborhood', note: 'Pick the area where you saw the hazard. North Ward, Riverside, Old Town, East District, or Central Shelter.' },
                    { step: 'Write a short description', note: 'One or two sentences is enough. "Water knee-deep under railway bridge" is perfect.' },
                    { step: 'Tap "Save Locally"', note: 'Done! Your report is saved on your device and will spread to nearby phones automatically.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-cc-bgSecondary border border-cc-border rounded-xl">
                      <span className="w-5 h-5 rounded-full bg-cc-orange/20 text-cc-orange text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <div>
                        <div className="text-xs font-semibold text-cc-text">{item.step}</div>
                        <div className="text-[11px] text-cc-textMuted mt-0.5">{item.note}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-cc-bgSecondary border border-cc-border rounded-xl p-3 text-xs text-cc-textMuted space-y-1">
                  <div className="font-semibold text-cc-text">📌 What do the evidence indicators mean?</div>
                  <div>• <strong className="text-amber-300">⏳ Unconfirmed</strong> — Only one person has reported this. Treat carefully.</div>
                  <div>• <strong className="text-cc-green">✅ Confirmed</strong> — Two or more separate people independently witnessed this.</div>
                  <div>• <strong className="text-cc-orange">⚠️ Conflicting reports</strong> — One person says it's a hazard; another says it's cleared. Both reports are shown so you can judge.</div>
                </div>
              </div>
            )}

            {/* ── SUPPLIES ── */}
            {activeSection === 'supplies' && (
              <div className="space-y-4">
                <p className="text-cc-textMuted text-xs">The resource matching system connects people who need supplies with people who have them — even across neighborhoods that are currently disconnected.</p>

                <div className="space-y-3">
                  <div className="p-3 bg-cc-red/10 border border-cc-red/30 rounded-xl">
                    <div className="font-bold text-cc-text text-xs mb-1">🙏 Requesting Aid</div>
                    <p className="text-cc-textMuted text-xs">Tap one of the quick-request buttons (💧 Water, 🍞 Food, 🩹 First Aid, 🚌 Transport). A coordinator will see your request and try to match you with a nearby offer.</p>
                    <p className="text-cc-orange text-xs mt-1 font-semibold">You will only be matched after a coordinator manually reviews and approves — no automatic commitments are made.</p>
                  </div>

                  <div className="p-3 bg-cc-green/10 border border-cc-green/30 rounded-xl">
                    <div className="font-bold text-cc-text text-xs mb-1">🤝 Offering Supplies</div>
                    <p className="text-cc-textMuted text-xs">Tap the supply sharing buttons (💧 +6 Water, 🍞 +Food, 🚗 My Car, 🏠 Space). Your offer is added to the community pool. Coordinators will match you with nearby requests.</p>
                    <p className="text-cc-cyan text-xs mt-1 font-semibold">Offering doesn't commit you until a coordinator confirms the match with you.</p>
                  </div>
                </div>

                <div className="p-3 bg-cc-bgSecondary border border-cc-border rounded-xl text-xs space-y-1.5 text-cc-textMuted">
                  <div className="font-semibold text-cc-text">Example: Water Shortage at Central Shelter</div>
                  <div>🏠 Shelter needs 20 units of water</div>
                  <div>💧 Riverside (Device B) offers 12 units</div>
                  <div>💧 East District (Device D) offers 8 units</div>
                  <div className="text-cc-cyan font-semibold">→ CRISISCACHE combines both offers to exactly fulfill the need. Coordinator approves → supplies are coordinated.</div>
                </div>
              </div>
            )}

            {/* ── HOW IT WORKS ── */}
            {activeSection === 'how_it_works' && (
              <div className="space-y-4">
                <div className="bg-cc-cyan/10 border border-cc-cyan/30 rounded-2xl p-4 space-y-2">
                  <p className="font-bold text-cc-cyan">📡 Zero internet. Zero cell towers.</p>
                  <p className="text-cc-textMuted text-xs">CRISISCACHE uses a technique called <strong>store-and-forward mesh networking</strong>. Your phone stores all reports locally and automatically shares them when it detects another CRISISCACHE device nearby.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { q: 'Can a report reach Device F if I\'m on Device A?', a: 'Yes — as long as there\'s a chain of devices between you. Think of it like passing a note through a crowd: A → B → C → D → E → F.' },
                    { q: 'What if the neighborhood is completely cut off?', a: 'Reports still get created locally. When the connection returns (e.g. an emergency worker drives between neighborhoods), reports instantly exchange and the full picture comes together.' },
                    { q: 'Does forwarding count as a new witness?', a: 'No. CRISISCACHE is smart about this. If one person reports a flood and 5 phones pass it on, that\'s still 1 original witness — not 6. Only separate people who independently observe the same thing count as multiple witnesses.' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-cc-bgSecondary border border-cc-border rounded-xl space-y-1">
                      <div className="text-xs font-bold text-cc-text">Q: {item.q}</div>
                      <div className="text-xs text-cc-textMuted">A: {item.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── COORDINATOR ── */}
            {activeSection === 'coordinator' && (
              <div className="space-y-4">
                <p className="text-cc-textMuted text-xs">Switch to <strong className="text-cc-cyan">Operations Mode</strong> (toggle at the top of the screen) to access the full coordinator dashboard.</p>

                <div className="space-y-2">
                  {[
                    { icon: '🗺️', title: 'Command Center', desc: 'Live summary of all active incidents with evidence reliability scores. Instantly see what\'s urgent, confirmed, or contradicted.' },
                    { icon: '🔬', title: 'Evidence Explorer', desc: 'Drill into any incident to see the full forwarding chain, independent witnesses, and conflicts. Understand exactly why something is marked Confirmed or Contested.' },
                    { icon: '📦', title: 'Resource Hub', desc: 'Review pending supply matches. Approve or decline multi-source allocations. Only confirmed matches are committed.' },
                    { icon: '🌐', title: 'Network Simulator', desc: 'See the live topology of all 6 devices. Toggle links to simulate connectivity, bridge isolated groups, and run gossip synchronization.' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-3 p-3 bg-cc-bgSecondary border border-cc-border rounded-xl">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-cc-text">{item.title}</div>
                        <div className="text-[11px] text-cc-textMuted mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FAQ ── */}
            {activeSection === 'faq' && (
              <div className="space-y-3">
                {[
                  { q: 'Do I need an account or registration?', a: 'No. CRISISCACHE uses automatic anonymous device IDs. No username, password, or email needed.' },
                  { q: 'Will my data be lost if I close the browser?', a: 'No. Everything is saved in your browser\'s local storage (IndexedDB). It persists across reloads and device restarts.' },
                  { q: 'How do I reset the demo to its starting state?', a: 'Click the "Reset" button in the top header bar. This restores the Flooded City scenario instantly.' },
                  { q: 'Is this real Bluetooth or Wi-Fi Direct?', a: 'In this demo, the mesh networking is simulated using a graph model. Real hardware integration (BLE/Wi-Fi Direct) is planned for future versions. The synchronization logic, evidence engine, and data models are fully production-ready.' },
                  { q: 'Why does it say "Conflicting reports" for the flood?', a: 'Because two separate people reported different things: one said the underpass is flooded, another said water is receding. CRISISCACHE shows BOTH so coordinators can make informed decisions — it never silently removes contradictory evidence.' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-cc-bgSecondary border border-cc-border rounded-xl space-y-1">
                    <div className="text-xs font-bold text-cc-text flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-cc-cyan shrink-0" /> {item.q}
                    </div>
                    <div className="text-xs text-cc-textMuted pl-4">{item.a}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-cc-border bg-cc-bgSecondary flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-cc-textMuted">
            CRISISCACHE v1.0 • Fully Offline Emergency Platform
          </span>
          <button
            onClick={() => setIsManualOpen(false)}
            className="px-5 py-2 rounded-xl bg-cc-cyan hover:bg-cc-cyan/90 text-slate-950 font-bold text-xs transition-colors"
          >
            Got it, close
          </button>
        </div>

      </div>
    </div>
  );
};
