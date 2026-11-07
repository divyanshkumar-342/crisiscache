// Module F: Network Simulator - Intermittent Connectivity & Multi-Hop Relay
import React, { useState } from 'react';
import { useCrisisCache } from '../../state/store';
import { NetworkLink, DeviceNode } from '../../types';
import { 
  Network, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Activity, 
  Layers, 
  Share2, 
  Info, 
  Terminal,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const NetworkSimulator: React.FC = () => {
  const { 
    devices, 
    links, 
    toggleLink, 
    bridgePartition, 
    runNetworkSync, 
    isSyncing, 
    logs,
    activeNodeId, 
    setActiveNodeId,
    networkPartitions,
    isBridgeActive,
    allReports,
    replicas,
    resetDemoScenario
  } = useCrisisCache();

  const [filterLogType, setFilterLogType] = useState<string>('ALL');

  const filteredLogs = logs.filter(log => {
    if (filterLogType === 'ALL') return true;
    return log.type === filterLogType;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-cc-bg">
      
      {/* Left/Main Column: Topology Diagram & Controls */}
      <div className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
        
        {/* Simulation Honest Notice Banner */}
        <div className="bg-cc-surface border border-cc-border rounded-xl p-3.5 flex items-start gap-3">
          <Info className="w-5 h-5 text-cc-cyan shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-cc-cyan uppercase">
                Simulated Ad-Hoc Mesh Topology
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cc-bgSecondary border border-cc-border text-cc-textMuted">
                Graph-Constrained Relay
              </span>
            </div>
            <p className="text-cc-textMuted leading-relaxed">
              This visualizer simulates intermittent peer-to-peer / sneakernet connectivity across 6 disaster-zone devices. 
              <strong> Events propagate only along enabled communication links.</strong> Reports retain their original author/device identities regardless of the number of relay hops.
            </p>
          </div>
        </div>

        {/* Topology Canvas Card */}
        <div className="bg-cc-surface border border-cc-border rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-cc-cyan" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cc-text">
                Device Topology & Link Controls
              </h2>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={bridgePartition}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  isBridgeActive 
                    ? 'bg-cc-orange/15 border-cc-orange text-cc-orange hover:bg-cc-orange/25' 
                    : 'bg-cc-cyan/15 border-cc-cyan text-cc-cyan hover:bg-cc-cyan/25'
                }`}
              >
                {isBridgeActive ? 'Sever Bridge (B ⇹ E)' : 'Bridge Partition (B ↔ E)'}
              </button>

              <button
                onClick={runNetworkSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-lg bg-cc-cyan hover:bg-cc-cyan/90 text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-md shadow-cc-cyan/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Run Gossip Sync'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Topology Graph SVG */}
          <div className="bg-cc-bgSecondary border border-cc-border rounded-xl p-4 flex items-center justify-center relative overflow-hidden min-h-[360px] select-none">
            
            <svg viewBox="0 0 720 400" className="w-full max-w-2xl h-auto">
              
              {/* Partition Background Bubbles */}
              <rect
                x="80"
                y="60"
                width="260"
                height="300"
                rx="16"
                fill="rgba(34, 211, 238, 0.04)"
                stroke="#22D3EE"
                strokeWidth="1"
                strokeDasharray="6 4"
                strokeOpacity="0.3"
              />
              <text x="96" y="86" fill="#22D3EE" fontSize="11" fontFamily="monospace" fontWeight="bold">
                PARTITION 1 (WEST GROUP)
              </text>

              <rect
                x="380"
                y="60"
                width="280"
                height="300"
                rx="16"
                fill="rgba(244, 114, 182, 0.04)"
                stroke="#F472B6"
                strokeWidth="1"
                strokeDasharray="6 4"
                strokeOpacity="0.3"
              />
              <text x="396" y="86" fill="#F472B6" fontSize="11" fontFamily="monospace" fontWeight="bold">
                PARTITION 2 (EAST GROUP)
              </text>

              {/* Connecting Edges / Links */}
              {links.map(link => {
                const srcNode = devices.find(d => d.id === link.sourceNodeId);
                const dstNode = devices.find(d => d.id === link.targetNodeId);
                if (!srcNode || !dstNode) return null;

                const isBridge = link.id === 'link-B-E';
                const strokeColor = link.isEnabled 
                  ? (isBridge ? '#35C98A' : '#22D3EE') 
                  : '#EF4444';

                return (
                  <g key={link.id} className="cursor-pointer" onClick={() => toggleLink(link.id)}>
                    {/* Line */}
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={dstNode.x}
                      y2={dstNode.y}
                      stroke={strokeColor}
                      strokeWidth={link.isEnabled ? 2.5 : 1.5}
                      strokeDasharray={link.isEnabled ? (isBridge ? '4 2' : 'none') : '6 4'}
                      strokeOpacity={link.isEnabled ? 0.9 : 0.4}
                    />

                    {/* Midpoint toggle badge */}
                    <circle
                      cx={(srcNode.x! + dstNode.x!) / 2}
                      cy={(srcNode.y! + dstNode.y!) / 2}
                      r="10"
                      fill="#0A1019"
                      stroke={strokeColor}
                      strokeWidth="1.5"
                    />
                    <text
                      x={(srcNode.x! + dstNode.x!) / 2}
                      y={(srcNode.y! + dstNode.y!) / 2 + 3}
                      fill={strokeColor}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {link.isEnabled ? 'ON' : 'OFF'}
                    </text>
                  </g>
                );
              })}

              {/* Node Circles */}
              {devices.map(device => {
                const isActive = activeNodeId === device.id;
                const nodeReplicas = replicas.filter(r => r.nodeId === device.id);

                return (
                  <g
                    key={device.id}
                    className="cursor-pointer group"
                    onClick={() => setActiveNodeId(device.id)}
                  >
                    {/* Outer ring for active device */}
                    {isActive && (
                      <circle
                        cx={device.x}
                        cy={device.y}
                        r="28"
                        fill="none"
                        stroke="#22D3EE"
                        strokeWidth="2"
                        strokeDasharray="4 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${device.x}px ${device.y}px`, animationDuration: '8s' }}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={device.x}
                      cy={device.y}
                      r="20"
                      fill="#111B29"
                      stroke={isActive ? '#22D3EE' : (device.color || '#38BDF8')}
                      strokeWidth={isActive ? 3 : 2}
                    />

                    {/* Device Icon / Label inside node */}
                    <text
                      x={device.x}
                      y={device.y! - 2}
                      fill="#F4F7FB"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {device.id.replace('Device ', '')}
                    </text>
                    <text
                      x={device.x}
                      y={device.y! + 8}
                      fill="#94A3B8"
                      fontSize="7"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {nodeReplicas.length} reps
                    </text>

                    {/* Label below node */}
                    <rect
                      x={device.x! - 55}
                      y={device.y! + 26}
                      width="110"
                      height="18"
                      rx="4"
                      fill="#0A1019"
                      stroke="#28374A"
                      strokeWidth="1"
                    />
                    <text
                      x={device.x}
                      y={device.y! + 38}
                      fill={isActive ? '#22D3EE' : '#A5B2C2'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isActive ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {device.name}
                    </text>
                  </g>
                );
              })}

            </svg>

            {/* Quick helper tag */}
            <div className="absolute bottom-2 right-3 text-[10px] font-mono text-cc-textMuted bg-cc-surface/80 px-2 py-1 rounded border border-cc-border">
              Click any link to toggle connect / sever • Click node to switch view
            </div>

          </div>

          {/* Links State Table */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-cc-textMuted font-bold">
              Communication Links Status
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
              {links.map(link => (
                <div
                  key={link.id}
                  onClick={() => toggleLink(link.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                    link.isEnabled
                      ? 'bg-cc-surface border-cc-border hover:border-cc-cyan'
                      : 'bg-cc-bgSecondary border-cc-red/30 text-cc-textMuted hover:border-cc-red'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {link.isEnabled ? (
                      <Wifi className="w-3.5 h-3.5 text-cc-green" />
                    ) : (
                      <WifiOff className="w-3.5 h-3.5 text-cc-red" />
                    )}
                    <span>{link.sourceNodeId} ↔ {link.targetNodeId}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    link.isEnabled ? 'bg-cc-green/15 text-cc-green' : 'bg-cc-red/15 text-cc-red'
                  }`}>
                    {link.isEnabled ? 'CONNECTED' : 'SEVERED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Right Column: Live Synchronization Activity Log */}
      <div className="w-full lg:w-96 bg-cc-bgSecondary border-t lg:border-t-0 lg:border-l border-cc-border p-4 flex flex-col justify-between shrink-0 overflow-hidden">
        
        <div className="flex flex-col h-full space-y-3">
          
          <div className="flex items-center justify-between pb-2 border-b border-cc-border shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cc-cyan" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cc-text">
                Live Synchronization Logs
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={resetDemoScenario}
                className="p-1 rounded text-cc-textMuted hover:text-cc-text hover:bg-cc-surface"
                title="Reset simulation to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1 shrink-0 text-[10px] font-mono">
            {['ALL', 'sync', 'relay', 'duplicate', 'conflict'].map(type => (
              <button
                key={type}
                onClick={() => setFilterLogType(type)}
                className={`px-2 py-0.5 rounded capitalize ${
                  filterLogType === type
                    ? 'bg-cc-cyan text-slate-950 font-bold'
                    : 'bg-cc-surface text-cc-textMuted hover:text-cc-text'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Log List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono text-[11px]">
            {filteredLogs.length === 0 ? (
              <div className="p-4 text-center text-cc-textMuted">
                No logs matching filter.
              </div>
            ) : (
              filteredLogs.map(log => {
                const isDup = log.type === 'duplicate';
                const isConflict = log.type === 'conflict';
                const isRelay = log.type === 'relay';
                const isSync = log.type === 'sync';

                return (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded border leading-relaxed ${
                      isConflict ? 'bg-cc-orange/10 border-cc-orange/30 text-cc-orange' :
                      isDup ? 'bg-slate-800/40 border-slate-700/60 text-slate-300' :
                      isSync ? 'bg-cc-green/10 border-cc-green/30 text-cc-text' :
                      'bg-cc-surface border-cc-border text-cc-text'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-cc-textMuted mb-0.5">
                      <span className="font-bold text-cc-cyan uppercase">[{log.type}]</span>
                      <span>{log.formattedTime}</span>
                    </div>
                    <p className="text-[11px]">
                      {log.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom active view summary */}
          <div className="p-3 bg-cc-surface border border-cc-border rounded-lg text-xs font-mono text-cc-textMuted shrink-0">
            <div>Current Node: <span className="text-cc-cyan font-bold">{activeNodeId}</span></div>
            <div>Cached Replicas: <span className="text-cc-text">{replicas.filter(r => r.nodeId === activeNodeId).length} reports</span></div>
          </div>

        </div>

      </div>

    </div>
  );
};
