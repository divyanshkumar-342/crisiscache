// Dexie IndexedDB Database for CRISISCACHE persistence across page refreshes
import Dexie, { Table } from 'dexie';
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
  SyncLogEntry
} from '../../types';

export class CrisisCacheDatabase extends Dexie {
  devices!: Table<DeviceNode, string>;
  incidents!: Table<Incident, string>;
  reports!: Table<IncidentReport, string>;
  relationships!: Table<EvidenceRelationship, string>;
  receipts!: Table<DeliveryReceipt, string>;
  replicas!: Table<NodeReplica, string>;
  requests!: Table<ResourceRequest, string>;
  offers!: Table<ResourceOffer, string>;
  matches!: Table<SuggestedMatch, string>;
  links!: Table<NetworkLink, string>;
  logs!: Table<SyncLogEntry, string>;

  constructor() {
    super('CrisisCacheDB');
    this.version(1).stores({
      devices: 'id, neighborhood, status',
      incidents: 'id, category, neighborhood, urgency, status, createdAt',
      reports: 'id, incidentId, originNodeId, category, urgency, observedAt, createdAt',
      relationships: 'id, sourceReportId, targetReportId, relationshipType',
      receipts: 'id, reportId, fromNodeId, toNodeId, receivedAt',
      replicas: 'id, nodeId, reportId, receivedAt',
      requests: 'id, nodeId, category, status, urgency, createdAt',
      offers: 'id, nodeId, category, status, createdAt',
      matches: 'id, requestId, status, createdAt',
      links: 'id, sourceNodeId, targetNodeId, isEnabled',
      logs: 'id, timestamp, type',
    });
  }

  async clearAllData(): Promise<void> {
    await Promise.all([
      this.devices.clear(),
      this.incidents.clear(),
      this.reports.clear(),
      this.relationships.clear(),
      this.receipts.clear(),
      this.replicas.clear(),
      this.requests.clear(),
      this.offers.clear(),
      this.matches.clear(),
      this.links.clear(),
      this.logs.clear(),
    ]);
  }
}

export const db = new CrisisCacheDatabase();
