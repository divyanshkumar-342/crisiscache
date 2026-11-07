// Preloaded Demo Scenario: "The Flooded City"
import { 
  DeviceNode, 
  Incident, 
  IncidentReport, 
  EvidenceRelationship, 
  DeliveryReceipt, 
  NodeReplica, 
  ResourceRequest, 
  ResourceOffer, 
  NetworkLink,
  SyncLogEntry
} from '../../types';

export function getDemoScenarioData() {
  const baseTime = Date.now() - 35 * 60 * 1000; // ~35 minutes ago

  const devices: DeviceNode[] = [
    {
      id: 'Device A',
      name: 'Device A — North Ward',
      neighborhood: 'North Ward',
      status: 'ONLINE',
      latitude: 45.424,
      longitude: -75.698,
      color: '#22D3EE',
      x: 140,
      y: 120,
      createdAt: baseTime - 60000,
    },
    {
      id: 'Device B',
      name: 'Device B — Riverside',
      neighborhood: 'Riverside',
      status: 'ONLINE',
      latitude: 45.418,
      longitude: -75.692,
      color: '#38BDF8',
      x: 280,
      y: 190,
      createdAt: baseTime - 60000,
    },
    {
      id: 'Device C',
      name: 'Device C — Old Town',
      neighborhood: 'Old Town',
      status: 'ONLINE',
      latitude: 45.411,
      longitude: -75.688,
      color: '#60A5FA',
      x: 180,
      y: 310,
      createdAt: baseTime - 60000,
    },
    {
      id: 'Device D',
      name: 'Device D — East District',
      neighborhood: 'East District',
      status: 'ONLINE',
      latitude: 45.415,
      longitude: -75.674,
      color: '#F472B6',
      x: 520,
      y: 300,
      createdAt: baseTime - 60000,
    },
    {
      id: 'Device E',
      name: 'Device E — Central Shelter',
      neighborhood: 'Central Shelter',
      status: 'ONLINE',
      latitude: 45.422,
      longitude: -75.681,
      color: '#35C98A',
      x: 440,
      y: 170,
      createdAt: baseTime - 60000,
    },
    {
      id: 'Device F',
      name: 'Device F — Relief Team',
      neighborhood: 'East District',
      status: 'ONLINE',
      latitude: 45.428,
      longitude: -75.669,
      color: '#FF8738',
      x: 600,
      y: 110,
      createdAt: baseTime - 60000,
    },
  ];

  // Initial network topology: Two partitions!
  // Group 1: A <-> B <-> C
  // Group 2: D <-> E <-> F
  // Bridge Link: B <-> E (initially FALSE/DISABLED)
  const links: NetworkLink[] = [
    { id: 'link-A-B', sourceNodeId: 'Device A', targetNodeId: 'Device B', isEnabled: true },
    { id: 'link-B-C', sourceNodeId: 'Device B', targetNodeId: 'Device C', isEnabled: true },
    { id: 'link-A-C', sourceNodeId: 'Device A', targetNodeId: 'Device C', isEnabled: false },
    // Inter-partition bridge: Initially disabled to simulate disaster partition
    { id: 'link-B-E', sourceNodeId: 'Device B', targetNodeId: 'Device E', isEnabled: false },
    // Group 2 links
    { id: 'link-D-E', sourceNodeId: 'Device D', targetNodeId: 'Device E', isEnabled: true },
    { id: 'link-E-F', sourceNodeId: 'Device E', targetNodeId: 'Device F', isEnabled: true },
    { id: 'link-D-F', sourceNodeId: 'Device D', targetNodeId: 'Device F', isEnabled: false },
  ];

  const incidents: Incident[] = [
    {
      id: 'INC-01',
      title: 'Flooded Underpass & Route 9 Access Inundation',
      category: 'Flooding',
      description: 'Severe water buildup under the railway underpass and connecting arterial roads. Impassable to standard vehicles.',
      latitude: 45.4225,
      longitude: -75.695,
      neighborhood: 'North Ward',
      urgency: 'Critical',
      createdAt: baseTime,
      freshnessTTL: 45 * 60 * 1000, // 45 minutes
      status: 'ACTIVE',
    },
    {
      id: 'INC-02',
      title: 'Structural Wall Collapse & Debris on Elm Avenue',
      category: 'Building damage',
      description: 'Partial brick facade collapse blocking sidewalk and half of Elm Avenue.',
      latitude: 45.412,
      longitude: -75.686,
      neighborhood: 'Old Town',
      urgency: 'Medium',
      createdAt: baseTime + 10 * 60 * 1000,
      freshnessTTL: 180 * 60 * 1000,
      status: 'ACTIVE',
    }
  ];

  // Reports
  // R-101: Originated by Device A in Group 1 at 14:02 (~32m ago)
  // Forwarded to Device B and then to Device C
  const timeR101 = baseTime + 2 * 60 * 1000;
  // R-102: Originated by Device D in Group 2 at 14:19 (~15m ago) - Independent confirmation!
  const timeR102 = baseTime + 19 * 60 * 1000;
  // R-103: Originated by Device F in Group 2 at 14:31 (~3m ago) - Contradiction!
  const timeR103 = baseTime + 31 * 60 * 1000;
  // R-201: Originated by Device C for INC-02
  const timeR201 = baseTime + 12 * 60 * 1000;

  const reports: IncidentReport[] = [
    {
      id: 'R-101',
      incidentId: 'INC-01',
      originNodeId: 'Device A',
      originAuthorId: 'Citizen-NorthWard-77',
      category: 'Flooding',
      description: 'Water level rising rapidly. North Ward underpass is flooded and currently impassable for all vehicles.',
      latitude: 45.4225,
      longitude: -75.695,
      neighborhood: 'North Ward',
      observedAt: timeR101,
      createdAt: timeR101,
      urgency: 'Critical',
      evidenceType: 'ORIGINAL',
    },
    {
      id: 'R-102',
      incidentId: 'INC-01',
      originNodeId: 'Device D',
      originAuthorId: 'Volunteer-East-12',
      category: 'Flooding',
      description: 'Independent visual confirmation: North Ward underpass submerged under 1.2m of standing water. 2 sedans stalled.',
      latitude: 45.4225,
      longitude: -75.695,
      neighborhood: 'North Ward',
      observedAt: timeR102,
      createdAt: timeR102,
      urgency: 'Critical',
      evidenceType: 'CONFIRMATION',
    },
    {
      id: 'R-103',
      incidentId: 'INC-01',
      originNodeId: 'Device F',
      originAuthorId: 'Relief-Scout-04',
      category: 'Flooding',
      description: 'Water level appears to be receding near East drainage exit. Clearance pumps deployed by local depot.',
      latitude: 45.4225,
      longitude: -75.695,
      neighborhood: 'North Ward',
      observedAt: timeR103,
      createdAt: timeR103,
      urgency: 'Medium',
      evidenceType: 'CONTRADICTION',
    },
    {
      id: 'R-201',
      incidentId: 'INC-02',
      originNodeId: 'Device C',
      originAuthorId: 'OldTown-Resident-09',
      category: 'Building damage',
      description: 'Old Town masonry facade collapsed across sidewalk. Pedestrians diverted.',
      latitude: 45.412,
      longitude: -75.686,
      neighborhood: 'Old Town',
      observedAt: timeR201,
      createdAt: timeR201,
      urgency: 'Medium',
      evidenceType: 'ORIGINAL',
    }
  ];

  // Evidence Relationships
  const relationships: EvidenceRelationship[] = [
    {
      id: 'rel-1',
      sourceReportId: 'R-102',
      targetReportId: 'R-101',
      relationshipType: 'INDEPENDENTLY_CONFIRMS',
      createdAt: timeR102,
      createdByNodeId: 'Device D',
    },
    {
      id: 'rel-2',
      sourceReportId: 'R-103',
      targetReportId: 'R-101',
      relationshipType: 'CONTRADICTS',
      createdAt: timeR103,
      createdByNodeId: 'Device F',
    }
  ];

  // Delivery Receipts for forwarding chains
  // In Group 1: Device A relayed R-101 to Device B, Device B relayed to Device C
  const receipts: DeliveryReceipt[] = [
    {
      id: 'rcpt-A-B-R-101',
      reportId: 'R-101',
      fromNodeId: 'Device A',
      toNodeId: 'Device B',
      receivedAt: timeR101 + 45000,
      forwardingPath: ['Device A', 'Device B'],
    },
    {
      id: 'rcpt-B-C-R-101',
      reportId: 'R-101',
      fromNodeId: 'Device B',
      toNodeId: 'Device C',
      receivedAt: timeR101 + 90000,
      forwardingPath: ['Device A', 'Device B', 'Device C'],
    },
    // In Group 2: Device D relayed R-102 to E and F
    {
      id: 'rcpt-D-E-R-102',
      reportId: 'R-102',
      fromNodeId: 'Device D',
      toNodeId: 'Device E',
      receivedAt: timeR102 + 30000,
      forwardingPath: ['Device D', 'Device E'],
    },
    {
      id: 'rcpt-E-F-R-102',
      reportId: 'R-102',
      fromNodeId: 'Device E',
      toNodeId: 'Device F',
      receivedAt: timeR102 + 60000,
      forwardingPath: ['Device D', 'Device E', 'Device F'],
    },
    // In Group 2: Device F relayed R-103 to E and D
    {
      id: 'rcpt-F-E-R-103',
      reportId: 'R-103',
      fromNodeId: 'Device F',
      toNodeId: 'Device E',
      receivedAt: timeR103 + 25000,
      forwardingPath: ['Device F', 'Device E'],
    },
    {
      id: 'rcpt-E-D-R-103',
      reportId: 'R-103',
      fromNodeId: 'Device E',
      toNodeId: 'Device D',
      receivedAt: timeR103 + 55000,
      forwardingPath: ['Device F', 'Device E', 'Device D'],
    },
  ];

  // Node Replicas: indicates what each device holds locally in initial state
  // Group 1 nodes hold R-101 and R-201 (since C is connected to B and A)
  // Group 2 nodes hold R-102 and R-103
  const replicas: NodeReplica[] = [
    // Group 1
    { id: 'rep-A-R101', nodeId: 'Device A', reportId: 'R-101', receivedAt: timeR101, latestSyncAt: timeR101, forwardingPath: ['Device A'] },
    { id: 'rep-B-R101', nodeId: 'Device B', reportId: 'R-101', receivedAt: timeR101 + 45000, latestSyncAt: timeR101 + 45000, forwardingPath: ['Device A', 'Device B'] },
    { id: 'rep-C-R101', nodeId: 'Device C', reportId: 'R-101', receivedAt: timeR101 + 90000, latestSyncAt: timeR101 + 90000, forwardingPath: ['Device A', 'Device B', 'Device C'] },
    
    { id: 'rep-C-R201', nodeId: 'Device C', reportId: 'R-201', receivedAt: timeR201, latestSyncAt: timeR201, forwardingPath: ['Device C'] },
    { id: 'rep-B-R201', nodeId: 'Device B', reportId: 'R-201', receivedAt: timeR201 + 30000, latestSyncAt: timeR201 + 30000, forwardingPath: ['Device C', 'Device B'] },
    { id: 'rep-A-R201', nodeId: 'Device A', reportId: 'R-201', receivedAt: timeR201 + 60000, latestSyncAt: timeR201 + 60000, forwardingPath: ['Device C', 'Device B', 'Device A'] },

    // Group 2
    { id: 'rep-D-R102', nodeId: 'Device D', reportId: 'R-102', receivedAt: timeR102, latestSyncAt: timeR102, forwardingPath: ['Device D'] },
    { id: 'rep-E-R102', nodeId: 'Device E', reportId: 'R-102', receivedAt: timeR102 + 30000, latestSyncAt: timeR102 + 30000, forwardingPath: ['Device D', 'Device E'] },
    { id: 'rep-F-R102', nodeId: 'Device F', reportId: 'R-102', receivedAt: timeR102 + 60000, latestSyncAt: timeR102 + 60000, forwardingPath: ['Device D', 'Device E', 'Device F'] },

    { id: 'rep-F-R103', nodeId: 'Device F', reportId: 'R-103', receivedAt: timeR103, latestSyncAt: timeR103, forwardingPath: ['Device F'] },
    { id: 'rep-E-R103', nodeId: 'Device E', reportId: 'R-103', receivedAt: timeR103 + 25000, latestSyncAt: timeR103 + 25000, forwardingPath: ['Device F', 'Device E'] },
    { id: 'rep-D-R103', nodeId: 'Device D', reportId: 'R-103', receivedAt: timeR103 + 55000, latestSyncAt: timeR103 + 55000, forwardingPath: ['Device F', 'Device E', 'Device D'] },
  ];

  // Resource Requests:
  // Central Shelter (Device E) requests 20 units of drinking water
  const requests: ResourceRequest[] = [
    {
      id: 'REQ-01',
      nodeId: 'Device E',
      category: 'Drinking water',
      quantity: 20,
      fulfilledQuantity: 0,
      unit: 'units',
      urgency: 'Critical',
      latitude: 45.422,
      longitude: -75.681,
      neighborhood: 'Central Shelter',
      description: 'Urgent drinking water required for 80 sheltered evacuees after municipal main break.',
      status: 'OPEN',
      createdAt: baseTime + 15 * 60 * 1000,
      expiresAt: baseTime + 24 * 60 * 60 * 1000,
    },
    {
      id: 'REQ-02',
      nodeId: 'Device A',
      category: 'Transport',
      quantity: 2,
      fulfilledQuantity: 0,
      unit: 'vehicles',
      urgency: 'High',
      latitude: 45.424,
      longitude: -75.698,
      neighborhood: 'North Ward',
      description: 'High-clearance 4WD vehicles required to evacuate elderly residents.',
      status: 'OPEN',
      createdAt: baseTime + 18 * 60 * 1000,
      expiresAt: baseTime + 12 * 60 * 60 * 1000,
    }
  ];

  // Resource Offers:
  // Device B in Riverside offers 12 units of water
  // Device D in East District offers 8 units of water
  // Device C in Old Town offers 1 vehicle
  const offers: ResourceOffer[] = [
    {
      id: 'OFF-01',
      nodeId: 'Device B',
      category: 'Drinking water',
      quantity: 12,
      allocatedQuantity: 0,
      unit: 'units',
      latitude: 45.418,
      longitude: -75.692,
      neighborhood: 'Riverside',
      status: 'AVAILABLE',
      createdAt: baseTime + 16 * 60 * 1000,
      expiresAt: baseTime + 24 * 60 * 60 * 1000,
    },
    {
      id: 'OFF-02',
      nodeId: 'Device D',
      category: 'Drinking water',
      quantity: 8,
      allocatedQuantity: 0,
      unit: 'units',
      latitude: 45.415,
      longitude: -75.674,
      neighborhood: 'East District',
      status: 'AVAILABLE',
      createdAt: baseTime + 20 * 60 * 1000,
      expiresAt: baseTime + 24 * 60 * 60 * 1000,
    },
    {
      id: 'OFF-03',
      nodeId: 'Device C',
      category: 'Transport',
      quantity: 1,
      allocatedQuantity: 0,
      unit: 'vehicles',
      latitude: 45.411,
      longitude: -75.688,
      neighborhood: 'Old Town',
      status: 'AVAILABLE',
      createdAt: baseTime + 22 * 60 * 1000,
      expiresAt: baseTime + 12 * 60 * 60 * 1000,
    }
  ];

  const logs: SyncLogEntry[] = [
    {
      id: 'log-seed-1',
      timestamp: timeR101,
      formattedTime: '14:02:10',
      message: 'Device A created initial incident report R-101 (Flooding at North Ward underpass).',
      type: 'info',
      sourceNodeId: 'Device A',
      reportId: 'R-101'
    },
    {
      id: 'log-seed-2',
      timestamp: timeR101 + 45000,
      formattedTime: '14:02:55',
      message: 'Device A synchronized with Device B: relayed R-101. Origin (Device A) preserved.',
      type: 'relay',
      sourceNodeId: 'Device A',
      targetNodeId: 'Device B',
      reportId: 'R-101'
    },
    {
      id: 'log-seed-3',
      timestamp: timeR101 + 90000,
      formattedTime: '14:03:40',
      message: 'Device B relayed R-101 to Device C. Origin (Device A) preserved. Forwarding chain: [Device A → Device B → Device C].',
      type: 'relay',
      sourceNodeId: 'Device B',
      targetNodeId: 'Device C',
      reportId: 'R-101'
    },
    {
      id: 'log-seed-4',
      timestamp: timeR102,
      formattedTime: '14:19:00',
      message: 'Device D submitted independent observation R-102 (Confirms flooded underpass).',
      type: 'info',
      sourceNodeId: 'Device D',
      reportId: 'R-102'
    },
    {
      id: 'log-seed-5',
      timestamp: timeR103,
      formattedTime: '14:31:00',
      message: 'Device F submitted conflicting report R-103: Water level receding at East exit.',
      type: 'conflict',
      sourceNodeId: 'Device F',
      reportId: 'R-103'
    },
    {
      id: 'log-seed-6',
      timestamp: timeR103 + 60000,
      formattedTime: '14:32:00',
      message: 'Network partitioned: Group 1 {A, B, C} and Group 2 {D, E, F} isolated. Bridge B-E is disconnected.',
      type: 'info'
    }
  ];

  return {
    devices,
    links,
    incidents,
    reports,
    relationships,
    receipts,
    replicas,
    requests,
    offers,
    logs,
  };
}
