// CRISISCACHE Core Data Models & Types

export type IncidentCategory = 
  | 'Flooding'
  | 'Fire'
  | 'Road blockage'
  | 'Building damage'
  | 'Medical emergency'
  | 'Missing person'
  | 'Shelter shortage'
  | 'Utility failure'
  | 'Other';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type EvidenceStatus = 'UNVERIFIED' | 'CORROBORATED' | 'CONTESTED';

export type FreshnessStatus = 'CURRENT' | 'AGING' | 'STALE';

export type RelationshipType = 
  | 'FORWARDED_FROM'
  | 'INDEPENDENTLY_CONFIRMS'
  | 'CONTRADICTS'
  | 'UPDATES'
  | 'SUPERSEDES';

export type ResourceCategory = 
  | 'Food'
  | 'Drinking water'
  | 'Medicine'
  | 'Medical supplies'
  | 'Shelter'
  | 'Transport'
  | 'Volunteers'
  | 'Other essential supplies';

export type ResourceStatus = 'OPEN' | 'PARTIALLY_MATCHED' | 'MATCHED' | 'FULFILLED';
export type OfferStatus = 'AVAILABLE' | 'ALLOCATED';

export type Neighborhood = 
  | 'North Ward'
  | 'Riverside'
  | 'Old Town'
  | 'East District'
  | 'Central Shelter';

export interface DeviceNode {
  id: string; // e.g. "Device A"
  name: string; // e.g. "Device A — North Ward"
  neighborhood: Neighborhood;
  status: 'ONLINE' | 'ISOLATED' | 'SYNCING';
  latitude: number;
  longitude: number;
  color?: string;
  x?: number; // for topology diagram
  y?: number;
  createdAt: number;
}

export interface Incident {
  id: string; // e.g. "INC-01"
  title: string;
  category: IncidentCategory;
  description: string;
  latitude: number;
  longitude: number;
  neighborhood: Neighborhood;
  urgency: UrgencyLevel;
  createdAt: number;
  freshnessTTL: number; // in milliseconds
  status: 'ACTIVE' | 'RESOLVED';
}

export interface IncidentReport {
  id: string; // e.g. "R-101"
  incidentId: string;
  originNodeId: string; // Device ID that originally created it
  originAuthorId: string; // Pseudonymous author
  category: IncidentCategory;
  description: string;
  latitude: number;
  longitude: number;
  neighborhood: Neighborhood;
  observedAt: number; // Epoch ms when observed
  createdAt: number; // Epoch ms when report created
  urgency: UrgencyLevel;
  evidenceType: 'ORIGINAL' | 'CONFIRMATION' | 'CONTRADICTION' | 'UPDATE';
  originReportId?: string; // If forwarded or referencing another report
}

export interface EvidenceRelationship {
  id: string;
  sourceReportId: string;
  targetReportId: string;
  relationshipType: RelationshipType;
  createdAt: number;
  createdByNodeId: string;
}

export interface DeliveryReceipt {
  id: string;
  reportId: string;
  fromNodeId: string;
  toNodeId: string;
  receivedAt: number;
  forwardingPath: string[]; // e.g. ["Device A", "Device B", "Device C"]
}

export interface NodeReplica {
  id?: string;
  nodeId: string; // which device holds this replica
  reportId: string;
  receivedAt: number;
  latestSyncAt: number;
  forwardingPath: string[];
}

export interface ResourceRequest {
  id: string;
  nodeId: string;
  category: ResourceCategory;
  quantity: number;
  fulfilledQuantity?: number;
  unit: string; // e.g. "units", "liters", "boxes", "persons"
  urgency: UrgencyLevel;
  latitude: number;
  longitude: number;
  neighborhood: Neighborhood;
  description?: string;
  status: ResourceStatus;
  createdAt: number;
  expiresAt: number;
}

export interface ResourceOffer {
  id: string;
  nodeId: string;
  category: ResourceCategory;
  quantity: number;
  allocatedQuantity?: number;
  unit: string;
  latitude: number;
  longitude: number;
  neighborhood: Neighborhood;
  status: OfferStatus;
  createdAt: number;
  expiresAt: number;
}

export interface SuggestedMatch {
  id: string;
  requestId: string;
  matches: {
    offerId: string;
    offerNodeId: string;
    quantity: number;
    unit: string;
  }[];
  totalSuggestedQuantity: number;
  targetQuantity: number;
  unit: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}

export interface NetworkLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  isEnabled: boolean;
  latencyMs?: number;
}

export interface SyncSession {
  id: string;
  sourceNodeId: string;
  destinationNodeId: string;
  startedAt: number;
  completedAt?: number;
  eventsTransferred: number;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
}

export interface SyncLogEntry {
  id: string;
  timestamp: number;
  formattedTime: string;
  message: string;
  type: 'info' | 'sync' | 'duplicate' | 'conflict' | 'relay';
  sourceNodeId?: string;
  targetNodeId?: string;
  reportId?: string;
}

export interface IncidentEvaluation {
  incident: Incident;
  reports: IncidentReport[];
  relationships: EvidenceRelationship[];
  receipts: DeliveryReceipt[];
  
  // Computed metrics
  independentObservationsCount: number;
  forwardedCopiesCount: number;
  conflictingObservationsCount: number;
  
  // Statuses
  evidenceStatus: EvidenceStatus;
  freshnessStatus: FreshnessStatus;
  
  // Breakdown
  supportingReports: IncidentReport[];
  forwardedReports: { report: IncidentReport; path: string[] }[];
  conflictingReports: IncidentReport[];
  
  // Timing
  latestObservationTime: number;
  timeSinceLastObservationMs: number;
  expiresInMs: number;
}
