// Mandatory Algorithmic Acceptance Criteria Tests (PRD Section 9)
import { describe, it, expect } from 'vitest';
import { 
  Incident, 
  IncidentReport, 
  EvidenceRelationship, 
  DeliveryReceipt, 
  NodeReplica,
  NetworkLink,
  DeviceNode,
  ResourceRequest,
  ResourceOffer
} from '../types';
import { evaluateIncidentEvidence } from '../engine/evidence-evaluation/evaluator';
import { calculateFreshness } from '../engine/freshness/freshness';
import { 
  buildAdjacencyList, 
  findShortestPath, 
  synchronizeActiveNetwork 
} from '../engine/synchronization/sync';
import { generateSuggestedMatches } from '../engine/resource-matching/matcher';
import { buildReportProvenance } from '../engine/provenance/lineage';

describe('Algorithmic Acceptance Criteria', () => {

  // Test 1: Forwarded duplicate
  it('Test 1: Forwarded duplicate retains single independent count and preserves origin and path', () => {
    const incident: Incident = {
      id: 'INC-TEST-01',
      title: 'Flooded Road',
      category: 'Flooding',
      description: 'Road underwater',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'North Ward',
      urgency: 'Critical',
      createdAt: 1000,
      freshnessTTL: 3600000,
      status: 'ACTIVE',
    };

    const r1: IncidentReport = {
      id: 'R1',
      incidentId: 'INC-TEST-01',
      originNodeId: 'Device A',
      originAuthorId: 'Citizen-A',
      category: 'Flooding',
      description: 'Underpass flooded',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'North Ward',
      observedAt: 1000,
      createdAt: 1000,
      urgency: 'Critical',
      evidenceType: 'ORIGINAL',
    };

    // Forwarding: A -> B -> C
    const receipts: DeliveryReceipt[] = [
      {
        id: 'rcpt-1',
        reportId: 'R1',
        fromNodeId: 'Device A',
        toNodeId: 'Device B',
        receivedAt: 1050,
        forwardingPath: ['Device A', 'Device B'],
      },
      {
        id: 'rcpt-2',
        reportId: 'R1',
        fromNodeId: 'Device B',
        toNodeId: 'Device C',
        receivedAt: 1100,
        forwardingPath: ['Device A', 'Device B', 'Device C'],
      },
    ];

    const replicas: NodeReplica[] = [
      { id: 'rep-A', nodeId: 'Device A', reportId: 'R1', receivedAt: 1000, latestSyncAt: 1000, forwardingPath: ['Device A'] },
      { id: 'rep-B', nodeId: 'Device B', reportId: 'R1', receivedAt: 1050, latestSyncAt: 1050, forwardingPath: ['Device A', 'Device B'] },
      { id: 'rep-C', nodeId: 'Device C', reportId: 'R1', receivedAt: 1100, latestSyncAt: 1100, forwardingPath: ['Device A', 'Device B', 'Device C'] },
    ];

    const evaluation = evaluateIncidentEvidence(
      incident,
      [r1],
      [],
      receipts,
      replicas,
      1200
    );

    // Origin remains Device A
    expect(r1.originNodeId).toBe('Device A');
    // Independent count remains 1 despite 3 devices holding it!
    expect(evaluation.independentObservationsCount).toBe(1);
    // Forwarded copies count reflects relayed devices
    expect(evaluation.forwardedCopiesCount).toBe(2);
    expect(evaluation.evidenceStatus).toBe('UNVERIFIED');

    // Provenance chain shows A -> B -> C
    const provenance = buildReportProvenance(r1, receipts, replicas);
    expect(provenance.originNodeId).toBe('Device A');
    expect(provenance.currentHolders).toContain('Device A');
    expect(provenance.currentHolders).toContain('Device B');
    expect(provenance.currentHolders).toContain('Device C');
    expect(provenance.forwardingHops[1].path).toEqual(['Device A', 'Device B', 'Device C']);
  });

  // Test 2: Independent confirmation
  it('Test 2: Independent confirmation increases independent count to 2 and upgrades status to CORROBORATED', () => {
    const incident: Incident = {
      id: 'INC-TEST-02',
      title: 'Flooded Road',
      category: 'Flooding',
      description: 'Road underwater',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'North Ward',
      urgency: 'Critical',
      createdAt: 1000,
      freshnessTTL: 3600000,
      status: 'ACTIVE',
    };

    const r1: IncidentReport = {
      id: 'R1',
      incidentId: 'INC-TEST-02',
      originNodeId: 'Device A',
      originAuthorId: 'Citizen-A',
      category: 'Flooding',
      description: 'Underpass flooded',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'North Ward',
      observedAt: 1000,
      createdAt: 1000,
      urgency: 'Critical',
      evidenceType: 'ORIGINAL',
    };

    const r2: IncidentReport = {
      id: 'R2',
      incidentId: 'INC-TEST-02',
      originNodeId: 'Device D',
      originAuthorId: 'Volunteer-D',
      category: 'Flooding',
      description: 'Independently confirming underpass is impassable',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'North Ward',
      observedAt: 2000,
      createdAt: 2000,
      urgency: 'Critical',
      evidenceType: 'CONFIRMATION',
    };

    const relationships: EvidenceRelationship[] = [
      {
        id: 'rel-confirm',
        sourceReportId: 'R2',
        targetReportId: 'R1',
        relationshipType: 'INDEPENDENTLY_CONFIRMS',
        createdAt: 2000,
        createdByNodeId: 'Device D',
      }
    ];

    const evaluation = evaluateIncidentEvidence(
      incident,
      [r1, r2],
      relationships,
      [],
      [],
      2100
    );

    expect(evaluation.independentObservationsCount).toBe(2);
    expect(evaluation.conflictingObservationsCount).toBe(0);
    expect(evaluation.evidenceStatus).toBe('CORROBORATED');
  });

  // Test 3: Contradiction
  it('Test 3: Contradictory report marks incident CONTESTED while preserving both observations', () => {
    const incident: Incident = {
      id: 'INC-TEST-03',
      title: 'Road Status',
      category: 'Road blockage',
      description: 'Blocked or clear',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'Riverside',
      urgency: 'High',
      createdAt: 1000,
      freshnessTTL: 3600000,
      status: 'ACTIVE',
    };

    const r1: IncidentReport = {
      id: 'R1',
      incidentId: 'INC-TEST-03',
      originNodeId: 'Device A',
      originAuthorId: 'Citizen-A',
      category: 'Road blockage',
      description: 'Road is totally blocked by fallen tree',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'Riverside',
      observedAt: 1000,
      createdAt: 1000,
      urgency: 'High',
      evidenceType: 'ORIGINAL',
    };

    const r2: IncidentReport = {
      id: 'R2',
      incidentId: 'INC-TEST-03',
      originNodeId: 'Device F',
      originAuthorId: 'Responder-F',
      category: 'Road blockage',
      description: 'Tree has been cleared; lane is open and passable',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'Riverside',
      observedAt: 1500,
      createdAt: 1500,
      urgency: 'Low',
      evidenceType: 'CONTRADICTION',
    };

    const relationships: EvidenceRelationship[] = [
      {
        id: 'rel-conflict',
        sourceReportId: 'R2',
        targetReportId: 'R1',
        relationshipType: 'CONTRADICTS',
        createdAt: 1500,
        createdByNodeId: 'Device F',
      }
    ];

    const evaluation = evaluateIncidentEvidence(
      incident,
      [r1, r2],
      relationships,
      [],
      [],
      1600
    );

    expect(evaluation.evidenceStatus).toBe('CONTESTED');
    expect(evaluation.supportingReports.length).toBe(1);
    expect(evaluation.conflictingReports.length).toBe(1);
    // Crucial: neither report is deleted or hidden!
    expect(evaluation.reports.length).toBe(2);
  });

  // Test 4: Stale information
  it('Test 4: Report becomes STALE when exceeding TTL while preserving historical data', () => {
    const observedAt = 10000;
    const ttlMs = 45 * 60 * 1000; // 45 minutes = 2,700,000 ms

    // Case A: 10 minutes elapsed -> CURRENT
    const freshResult = calculateFreshness('Flooding', observedAt, ttlMs, observedAt + 10 * 60 * 1000);
    expect(freshResult.status).toBe('CURRENT');
    expect(freshResult.isStale).toBe(false);

    // Case B: 35 minutes elapsed (> 60% of 45m) -> AGING
    const agingResult = calculateFreshness('Flooding', observedAt, ttlMs, observedAt + 35 * 60 * 1000);
    expect(agingResult.status).toBe('AGING');
    expect(agingResult.isStale).toBe(false);

    // Case C: 50 minutes elapsed (> 45m) -> STALE
    const staleResult = calculateFreshness('Flooding', observedAt, ttlMs, observedAt + 50 * 60 * 1000);
    expect(staleResult.status).toBe('STALE');
    expect(staleResult.isStale).toBe(true);
    expect(staleResult.remainingMs).toBe(0);
  });

  // Test 5: Disconnected devices
  it('Test 5: Disconnected devices in separate partitions cannot exchange events', () => {
    const links: NetworkLink[] = [
      { id: 'l1', sourceNodeId: 'Device A', targetNodeId: 'Device B', isEnabled: true },
      { id: 'l2', sourceNodeId: 'Device B', targetNodeId: 'Device C', isEnabled: true },
      // Link between B and E is DISABLED
      { id: 'bridge', sourceNodeId: 'Device B', targetNodeId: 'Device E', isEnabled: false },
      { id: 'l3', sourceNodeId: 'Device D', targetNodeId: 'Device E', isEnabled: true },
      { id: 'l4', sourceNodeId: 'Device E', targetNodeId: 'Device F', isEnabled: true },
    ];

    const adj = buildAdjacencyList(links);
    const pathAtoF = findShortestPath('Device A', 'Device F', adj);
    expect(pathAtoF).toBeNull();
  });

  // Test 6: Intermittent connectivity & synchronization
  it('Test 6: Bridging partitions propagates missing events without modifying origin', () => {
    const nodes: DeviceNode[] = [
      { id: 'Device A', name: 'A', neighborhood: 'North Ward', status: 'ONLINE', latitude: 45, longitude: -75, createdAt: 0 },
      { id: 'Device B', name: 'B', neighborhood: 'Riverside', status: 'ONLINE', latitude: 45, longitude: -75, createdAt: 0 },
      { id: 'Device E', name: 'E', neighborhood: 'Central Shelter', status: 'ONLINE', latitude: 45, longitude: -75, createdAt: 0 },
      { id: 'Device F', name: 'F', neighborhood: 'East District', status: 'ONLINE', latitude: 45, longitude: -75, createdAt: 0 },
    ];

    const reportA: IncidentReport = {
      id: 'R-A1',
      incidentId: 'INC-1',
      originNodeId: 'Device A',
      originAuthorId: 'Citizen-A',
      category: 'Flooding',
      description: 'Water at A',
      latitude: 45,
      longitude: -75,
      neighborhood: 'North Ward',
      observedAt: 1000,
      createdAt: 1000,
      urgency: 'High',
      evidenceType: 'ORIGINAL',
    };

    // Bridge enabled: A - B - E - F
    const activeLinks: NetworkLink[] = [
      { id: 'l1', sourceNodeId: 'Device A', targetNodeId: 'Device B', isEnabled: true },
      { id: 'bridge', sourceNodeId: 'Device B', targetNodeId: 'Device E', isEnabled: true },
      { id: 'l2', sourceNodeId: 'Device E', targetNodeId: 'Device F', isEnabled: true },
    ];

    const result = synchronizeActiveNetwork(
      nodes,
      activeLinks,
      [reportA],
      [{ id: 'rep-A', nodeId: 'Device A', reportId: 'R-A1', receivedAt: 1000, latestSyncAt: 1000, forwardingPath: ['Device A'] }],
      [],
      2000
    );

    // Device F receives R-A1 through B and E
    const replicaF = result.updatedReplicas.find(r => r.nodeId === 'Device F' && r.reportId === 'R-A1');
    expect(replicaF).toBeDefined();
    // Origin is strictly preserved
    expect(reportA.originNodeId).toBe('Device A');
    // Multi-hop path verified
    expect(replicaF?.forwardingPath).toEqual(['Device A', 'Device B', 'Device E', 'Device F']);
  });

  // Test 7: Resource matching
  it('Test 7: Resource matching suggests combining partial offers to satisfy request, requiring coordinator approval', () => {
    const request: ResourceRequest = {
      id: 'REQ-WATER',
      nodeId: 'Device E',
      category: 'Drinking water',
      quantity: 20,
      fulfilledQuantity: 0,
      unit: 'units',
      urgency: 'Critical',
      latitude: 45.4,
      longitude: -75.7,
      neighborhood: 'Central Shelter',
      status: 'OPEN',
      createdAt: 1000,
      expiresAt: 50000,
    };

    const offers: ResourceOffer[] = [
      {
        id: 'OFF-12',
        nodeId: 'Device B',
        category: 'Drinking water',
        quantity: 12,
        unit: 'units',
        latitude: 45.4,
        longitude: -75.7,
        neighborhood: 'Riverside',
        status: 'AVAILABLE',
        createdAt: 1000,
        expiresAt: 50000,
      },
      {
        id: 'OFF-8',
        nodeId: 'Device D',
        category: 'Drinking water',
        quantity: 8,
        unit: 'units',
        latitude: 45.4,
        longitude: -75.7,
        neighborhood: 'East District',
        status: 'AVAILABLE',
        createdAt: 1000,
        expiresAt: 50000,
      },
    ];

    const suggested = generateSuggestedMatches([request], offers);

    expect(suggested.length).toBe(1);
    expect(suggested[0].totalSuggestedQuantity).toBe(20);
    expect(suggested[0].matches.length).toBe(2);
    expect(suggested[0].status).toBe('PENDING'); // Requires coordinator approval!
    // Verify request is not automatically marked fulfilled
    expect(request.status).toBe('OPEN');
  });

  // Test 8: Idempotent synchronization & local state consistency
  it('Test 8: Repeated synchronization is idempotent and does not create duplicate evidence or alter origin', () => {
    const nodes: DeviceNode[] = [
      { id: 'Device A', name: 'A', neighborhood: 'North Ward', status: 'ONLINE', latitude: 45, longitude: -75, createdAt: 0 },
      { id: 'Device B', name: 'B', neighborhood: 'Riverside', status: 'ONLINE', latitude: 45, longitude: -75, createdAt: 0 },
    ];

    const reportA: IncidentReport = {
      id: 'R-DUP-TEST',
      incidentId: 'INC-DUP',
      originNodeId: 'Device A',
      originAuthorId: 'Citizen-A',
      category: 'Flooding',
      description: 'Test flood',
      latitude: 45,
      longitude: -75,
      neighborhood: 'North Ward',
      observedAt: 1000,
      createdAt: 1000,
      urgency: 'High',
      evidenceType: 'ORIGINAL',
    };

    const link: NetworkLink = { id: 'l1', sourceNodeId: 'Device A', targetNodeId: 'Device B', isEnabled: true };

    // Initial sync: A -> B
    const sync1 = synchronizeActiveNetwork(
      nodes,
      [link],
      [reportA],
      [{ id: 'rep-A', nodeId: 'Device A', reportId: 'R-DUP-TEST', receivedAt: 1000, latestSyncAt: 1000, forwardingPath: ['Device A'] }],
      [],
      2000
    );

    expect(sync1.totalTransferred).toBe(1);
    expect(sync1.updatedReplicas.length).toBe(2);

    // Second sync: identical state run again
    const sync2 = synchronizeActiveNetwork(
      nodes,
      [link],
      [reportA],
      sync1.updatedReplicas,
      sync1.updatedReceipts,
      3000
    );

    // Idempotency: no new replicas created, duplicate logged
    expect(sync2.totalTransferred).toBe(0);
    expect(sync2.updatedReplicas.length).toBe(2);
    expect(sync2.totalDuplicates).toBeGreaterThan(0);
    expect(reportA.originNodeId).toBe('Device A');
  });

});
