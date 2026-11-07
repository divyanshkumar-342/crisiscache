// CRISISCACHE Application State & Database Synchronization Hook
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  DeviceNode, 
  Incident, 
  IncidentReport, 
  EvidenceRelationship, 
  DeliveryReceipt, 
  NodeReplica, 
  ResourceRequest, 
  ResourceOffer, 
  SuggestedMatch, 
  NetworkLink, 
  SyncLogEntry,
  IncidentEvaluation
} from '../types';
import { db } from '../data/database/db';
import { getDemoScenarioData } from '../data/seed/demoScenario';
import { evaluateIncidentEvidence } from '../engine/evidence-evaluation/evaluator';
import { synchronizeActiveNetwork, buildAdjacencyList, getNetworkPartitions } from '../engine/synchronization/sync';
import { generateSuggestedMatches } from '../engine/resource-matching/matcher';

export type ActiveView = 'overview' | 'map' | 'evidence' | 'resources' | 'network';
export type UserRole = 'citizen' | 'coordinator';

interface CrisisCacheContextType {
  // Navigation & View
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isManualOpen: boolean;
  setIsManualOpen: (open: boolean) => void;
  currentView: ActiveView;
  setCurrentView: (view: ActiveView) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;

  // Active Simulated Device
  activeNodeId: string;
  setActiveNodeId: (nodeId: string) => void;
  activeDevice: DeviceNode | undefined;
  
  // Data
  devices: DeviceNode[];
  links: NetworkLink[];
  incidents: Incident[];
  allReports: IncidentReport[];
  relationships: EvidenceRelationship[];
  receipts: DeliveryReceipt[];
  replicas: NodeReplica[];
  requests: ResourceRequest[];
  offers: ResourceOffer[];
  matches: SuggestedMatch[];
  logs: SyncLogEntry[];

  // Local device perspective
  localReports: IncidentReport[];
  localEvaluations: IncidentEvaluation[];
  selectedEvaluation: IncidentEvaluation | null;
  networkPartitions: string[][];
  isBridgeActive: boolean;

  // Sync state
  isSyncing: boolean;
  lastSyncTime: number | null;

  // Actions
  createReport: (reportData: {
    incidentId?: string;
    newIncidentTitle?: string;
    category: any;
    description: string;
    neighborhood: any;
    latitude: number;
    longitude: number;
    urgency: any;
    evidenceType: 'ORIGINAL' | 'CONFIRMATION' | 'CONTRADICTION' | 'UPDATE';
    relationshipType?: any;
    targetReportId?: string;
  }) => Promise<string>;
  
  toggleLink: (linkId: string) => Promise<void>;
  bridgePartition: () => Promise<void>;
  runNetworkSync: () => Promise<void>;
  resetDemoScenario: () => Promise<void>;
  approveMatch: (matchId: string) => Promise<void>;
  rejectMatch: (matchId: string) => Promise<void>;
  createResourceRequest: (req: Omit<ResourceRequest, 'id' | 'createdAt' | 'fulfilledQuantity' | 'status'>) => Promise<void>;
  createResourceOffer: (off: Omit<ResourceOffer, 'id' | 'createdAt' | 'allocatedQuantity' | 'status'>) => Promise<void>;
}

const CrisisCacheContext = createContext<CrisisCacheContextType | null>(null);

export const CrisisCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ActiveView>('overview');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-01');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [activeNodeId, setActiveNodeId] = useState<string>('Device A');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Entities
  const [devices, setDevices] = useState<DeviceNode[]>([]);
  const [links, setLinks] = useState<NetworkLink[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [allReports, setAllReports] = useState<IncidentReport[]>([]);
  const [relationships, setRelationships] = useState<EvidenceRelationship[]>([]);
  const [receipts, setReceipts] = useState<DeliveryReceipt[]>([]);
  const [replicas, setReplicas] = useState<NodeReplica[]>([]);
  const [requests, setRequests] = useState<ResourceRequest[]>([]);
  const [offers, setOffers] = useState<ResourceOffer[]>([]);
  const [matches, setMatches] = useState<SuggestedMatch[]>([]);
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);

  // Load from Dexie or initialize seed
  const loadDatabase = async () => {
    try {
      const storedDevices = await db.devices.toArray();
      if (storedDevices.length === 0) {
        // Initialize with preloaded demo scenario
        await resetDemoScenario();
      } else {
        const [devs, lnks, incs, reps, rels, rcpts, repls, reqs, offs, mtchs, lgs] = await Promise.all([
          db.devices.toArray(),
          db.links.toArray(),
          db.incidents.toArray(),
          db.reports.toArray(),
          db.relationships.toArray(),
          db.receipts.toArray(),
          db.replicas.toArray(),
          db.requests.toArray(),
          db.offers.toArray(),
          db.matches.toArray(),
          db.logs.orderBy('timestamp').reverse().toArray(),
        ]);

        setDevices(devs);
        setLinks(lnks);
        setIncidents(incs);
        setAllReports(reps);
        setRelationships(rels);
        setReceipts(rcpts);
        setReplicas(repls);
        setRequests(reqs);
        setOffers(offs);
        setMatches(mtchs);
        setLogs(lgs);
      }
    } catch (err) {
      console.error('Failed to load database:', err);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  // Reset Demo Scenario to initial seeded state
  const resetDemoScenario = async () => {
    const seed = getDemoScenarioData();
    await db.clearAllData();

    await Promise.all([
      db.devices.bulkAdd(seed.devices),
      db.links.bulkAdd(seed.links),
      db.incidents.bulkAdd(seed.incidents),
      db.reports.bulkAdd(seed.reports),
      db.relationships.bulkAdd(seed.relationships),
      db.receipts.bulkAdd(seed.receipts),
      db.replicas.bulkAdd(seed.replicas),
      db.requests.bulkAdd(seed.requests),
      db.offers.bulkAdd(seed.offers),
      db.logs.bulkAdd(seed.logs),
    ]);

    // Recalculate matches
    const initialMatches = generateSuggestedMatches(seed.requests, seed.offers);
    if (initialMatches.length > 0) {
      await db.matches.bulkAdd(initialMatches);
    }

    setDevices(seed.devices);
    setLinks(seed.links);
    setIncidents(seed.incidents);
    setAllReports(seed.reports);
    setRelationships(seed.relationships);
    setReceipts(seed.receipts);
    setReplicas(seed.replicas);
    setRequests(seed.requests);
    setOffers(seed.offers);
    setMatches(initialMatches);
    setLogs(seed.logs.reverse());
    setSelectedIncidentId('INC-01');
    setLastSyncTime(null);
  };

  // Active Device Object
  const activeDevice = useMemo(() => {
    return devices.find(d => d.id === activeNodeId) || devices[0];
  }, [devices, activeNodeId]);

  // Network Partitions
  const networkPartitions = useMemo(() => {
    if (devices.length === 0) return [];
    return getNetworkPartitions(devices, links);
  }, [devices, links]);

  // Is Bridge Active (Link B-E enabled)
  const isBridgeActive = useMemo(() => {
    const bridgeLink = links.find(l => 
      (l.sourceNodeId === 'Device B' && l.targetNodeId === 'Device E') ||
      (l.sourceNodeId === 'Device E' && l.targetNodeId === 'Device B')
    );
    return !!bridgeLink?.isEnabled;
  }, [links]);

  // Local reports available on the active simulated device
  const localReports = useMemo(() => {
    const activeReplicas = replicas.filter(r => r.nodeId === activeNodeId);
    const activeReplicaReportIds = new Set(activeReplicas.map(r => r.reportId));
    // Include reports created directly on activeNodeId
    return allReports.filter(r => r.originNodeId === activeNodeId || activeReplicaReportIds.has(r.id));
  }, [allReports, replicas, activeNodeId]);

  // Evaluated incidents from the active device's local perspective
  const localEvaluations = useMemo(() => {
    const localReportIds = new Set(localReports.map(r => r.id));
    const localRelationships = relationships.filter(rel => 
      localReportIds.has(rel.sourceReportId) && localReportIds.has(rel.targetReportId)
    );
    const localReceipts = receipts.filter(rcpt => localReportIds.has(rcpt.reportId));
    const localNodeReplicas = replicas.filter(rep => localReportIds.has(rep.reportId));

    return incidents.map(inc => {
      return evaluateIncidentEvidence(
        inc,
        localReports,
        localRelationships,
        localReceipts,
        localNodeReplicas,
        Date.now()
      );
    });
  }, [incidents, localReports, relationships, receipts, replicas]);

  const selectedEvaluation = useMemo(() => {
    if (!selectedIncidentId) return localEvaluations[0] || null;
    return localEvaluations.find(e => e.incident.id === selectedIncidentId) || localEvaluations[0] || null;
  }, [localEvaluations, selectedIncidentId]);

  // Actions
  const toggleLink = async (linkId: string) => {
    const targetLink = links.find(l => l.id === linkId);
    if (!targetLink) return;

    const updated = { ...targetLink, isEnabled: !targetLink.isEnabled };
    await db.links.put(updated);
    
    setLinks(prev => prev.map(l => l.id === linkId ? updated : l));

    const statusMsg = updated.isEnabled ? 'LINK RESTORED' : 'LINK SEVERED';
    const logEntry: SyncLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `${statusMsg}: Topology connection between ${updated.sourceNodeId} and ${updated.targetNodeId} is now ${updated.isEnabled ? 'active' : 'disabled'}.`,
      type: 'info'
    };
    await db.logs.add(logEntry);
    setLogs(prev => [logEntry, ...prev]);
  };

  const bridgePartition = async () => {
    const bridgeLink = links.find(l => 
      (l.sourceNodeId === 'Device B' && l.targetNodeId === 'Device E') ||
      (l.sourceNodeId === 'Device E' && l.targetNodeId === 'Device B')
    );
    if (bridgeLink) {
      await toggleLink(bridgeLink.id);
    }
  };

  const runNetworkSync = async () => {
    setIsSyncing(true);
    const now = Date.now();

    try {
      const result = synchronizeActiveNetwork(
        devices,
        links,
        allReports,
        replicas,
        receipts,
        now
      );

      // Save new replicas & receipts to Dexie
      if (result.updatedReplicas.length > replicas.length) {
        await db.replicas.clear();
        await db.replicas.bulkAdd(result.updatedReplicas);
        setReplicas(result.updatedReplicas);
      }

      if (result.updatedReceipts.length > receipts.length) {
        await db.receipts.clear();
        await db.receipts.bulkAdd(result.updatedReceipts);
        setReceipts(result.updatedReceipts);
      }

      if (result.logs.length > 0) {
        await db.logs.bulkAdd(result.logs);
        setLogs(prev => [...result.logs.reverse(), ...prev]);
      }

      // Re-evaluate resource matching
      const newMatches = generateSuggestedMatches(requests, offers, matches);
      if (newMatches.length > 0) {
        await db.matches.bulkAdd(newMatches);
        setMatches(prev => [...newMatches, ...prev.filter(m => !newMatches.some(nm => nm.id === m.id))]);
      }

      setLastSyncTime(now);
    } catch (err) {
      console.error('Error running network sync:', err);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const createReport = async (reportData: {
    incidentId?: string;
    newIncidentTitle?: string;
    category: any;
    description: string;
    neighborhood: any;
    latitude: number;
    longitude: number;
    urgency: any;
    evidenceType: 'ORIGINAL' | 'CONFIRMATION' | 'CONTRADICTION' | 'UPDATE';
    relationshipType?: any;
    targetReportId?: string;
  }): Promise<string> => {
    const now = Date.now();
    let assignedIncidentId = reportData.incidentId;

    // If new incident
    if (!assignedIncidentId && reportData.newIncidentTitle) {
      const newIncident: Incident = {
        id: `INC-${Date.now().toString().slice(-4)}`,
        title: reportData.newIncidentTitle,
        category: reportData.category,
        description: reportData.description,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        neighborhood: reportData.neighborhood,
        urgency: reportData.urgency,
        createdAt: now,
        freshnessTTL: 60 * 60 * 1000,
        status: 'ACTIVE',
      };
      await db.incidents.add(newIncident);
      setIncidents(prev => [newIncident, ...prev]);
      assignedIncidentId = newIncident.id;
    }

    if (!assignedIncidentId) {
      assignedIncidentId = incidents[0]?.id || 'INC-01';
    }

    const reportId = `R-${Math.floor(100 + Math.random() * 900)}`;
    const newReport: IncidentReport = {
      id: reportId,
      incidentId: assignedIncidentId,
      originNodeId: activeNodeId,
      originAuthorId: `Citizen-${activeNodeId.replace(' ', '')}-${Math.floor(10 + Math.random() * 90)}`,
      category: reportData.category,
      description: reportData.description,
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      neighborhood: reportData.neighborhood,
      observedAt: now,
      createdAt: now,
      urgency: reportData.urgency,
      evidenceType: reportData.evidenceType,
    };

    // Store report
    await db.reports.add(newReport);
    setAllReports(prev => [newReport, ...prev]);

    // Store replica for origin device
    const originReplica: NodeReplica = {
      id: `rep-${activeNodeId}-${reportId}`,
      nodeId: activeNodeId,
      reportId: reportId,
      receivedAt: now,
      latestSyncAt: now,
      forwardingPath: [activeNodeId],
    };
    await db.replicas.add(originReplica);
    setReplicas(prev => [originReplica, ...prev]);

    // If relationship defined
    if (reportData.targetReportId && reportData.relationshipType) {
      const newRel: EvidenceRelationship = {
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        sourceReportId: reportId,
        targetReportId: reportData.targetReportId,
        relationshipType: reportData.relationshipType,
        createdAt: now,
        createdByNodeId: activeNodeId,
      };
      await db.relationships.add(newRel);
      setRelationships(prev => [newRel, ...prev]);
    }

    // Add log
    const log: SyncLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: now,
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `${activeNodeId} created ${reportId} (${reportData.evidenceType} for ${assignedIncidentId}). Stored in local cache.`,
      type: reportData.evidenceType === 'CONTRADICTION' ? 'conflict' : 'info',
      sourceNodeId: activeNodeId,
      reportId: reportId,
    };
    await db.logs.add(log);
    setLogs(prev => [log, ...prev]);

    setSelectedIncidentId(assignedIncidentId);
    return reportId;
  };

  const approveMatch = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const request = requests.find(r => r.id === match.requestId);
    if (!request) return;

    // Update match status
    const updatedMatch: SuggestedMatch = { ...match, status: 'APPROVED' };
    await db.matches.put(updatedMatch);
    setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));

    // Update request
    const newFulfilled = (request.fulfilledQuantity || 0) + match.totalSuggestedQuantity;
    const newStatus = newFulfilled >= request.quantity ? 'FULFILLED' : 'PARTIALLY_MATCHED';
    const updatedRequest: ResourceRequest = {
      ...request,
      fulfilledQuantity: newFulfilled,
      status: newStatus,
    };
    await db.requests.put(updatedRequest);
    setRequests(prev => prev.map(r => r.id === request.id ? updatedRequest : r));

    // Update offers
    for (const alloc of match.matches) {
      const offer = offers.find(o => o.id === alloc.offerId);
      if (offer) {
        const newAllocated = (offer.allocatedQuantity || 0) + alloc.quantity;
        const offerStatus = newAllocated >= offer.quantity ? 'ALLOCATED' : 'AVAILABLE';
        const updatedOffer: ResourceOffer = {
          ...offer,
          allocatedQuantity: newAllocated,
          status: offerStatus,
        };
        await db.offers.put(updatedOffer);
        setOffers(prev => prev.map(o => o.id === offer.id ? updatedOffer : o));
      }
    }

    const log: SyncLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      message: `Coordinator approved resource allocation for ${request.category} at ${request.neighborhood}. Total units: ${match.totalSuggestedQuantity} ${request.unit}.`,
      type: 'sync',
    };
    await db.logs.add(log);
    setLogs(prev => [log, ...prev]);
  };

  const rejectMatch = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const updatedMatch: SuggestedMatch = { ...match, status: 'REJECTED' };
    await db.matches.put(updatedMatch);
    setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
  };

  const createResourceRequest = async (reqData: Omit<ResourceRequest, 'id' | 'createdAt' | 'fulfilledQuantity' | 'status'>) => {
    const now = Date.now();
    const newReq: ResourceRequest = {
      ...reqData,
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: now,
      fulfilledQuantity: 0,
      status: 'OPEN',
    };
    await db.requests.add(newReq);
    setRequests(prev => [newReq, ...prev]);

    // Generate matches
    const newMatches = generateSuggestedMatches([newReq], offers, matches);
    if (newMatches.length > 0) {
      await db.matches.bulkAdd(newMatches);
      setMatches(prev => [...newMatches, ...prev]);
    }
  };

  const createResourceOffer = async (offData: Omit<ResourceOffer, 'id' | 'createdAt' | 'allocatedQuantity' | 'status'>) => {
    const now = Date.now();
    const newOff: ResourceOffer = {
      ...offData,
      id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: now,
      allocatedQuantity: 0,
      status: 'AVAILABLE',
    };
    await db.offers.add(newOff);
    setOffers(prev => [newOff, ...prev]);

    // Re-check pending requests
    const newMatches = generateSuggestedMatches(requests, [newOff, ...offers], matches);
    if (newMatches.length > 0) {
      await db.matches.bulkAdd(newMatches);
      setMatches(prev => [...newMatches, ...prev]);
    }
  };

  return (
    <CrisisCacheContext.Provider
      value={{
        userRole,
        setUserRole,
        isManualOpen,
        setIsManualOpen,
        currentView,
        setCurrentView,
        selectedIncidentId,
        setSelectedIncidentId,
        isReportModalOpen,
        setIsReportModalOpen,
        activeNodeId,
        setActiveNodeId,
        activeDevice,
        devices,
        links,
        incidents,
        allReports,
        relationships,
        receipts,
        replicas,
        requests,
        offers,
        matches,
        logs,
        localReports,
        localEvaluations,
        selectedEvaluation,
        networkPartitions,
        isBridgeActive,
        isSyncing,
        lastSyncTime,
        createReport,
        toggleLink,
        bridgePartition,
        runNetworkSync,
        resetDemoScenario,
        approveMatch,
        rejectMatch,
        createResourceRequest,
        createResourceOffer,
      }}
    >
      {children}
    </CrisisCacheContext.Provider>
  );
};

export const useCrisisCache = () => {
  const context = useContext(CrisisCacheContext);
  if (!context) {
    throw new Error('useCrisisCache must be used within a CrisisCacheProvider');
  }
  return context;
};
