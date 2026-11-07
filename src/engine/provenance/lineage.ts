// Evidence Lineage Engine - Tracks report provenance, forwarding chains, and identity preservation
import { IncidentReport, DeliveryReceipt, NodeReplica } from '../../types';

export interface ProvenanceChain {
  reportId: string;
  originNodeId: string;
  originAuthorId: string;
  observedAt: number;
  createdAt: number;
  currentHolders: string[];
  forwardingHops: {
    fromNode: string;
    toNode: string;
    timestamp: number;
    path: string[];
  }[];
}

/**
 * Builds the provenance and forwarding lineage for a given report
 */
export function buildReportProvenance(
  report: IncidentReport,
  receipts: DeliveryReceipt[],
  replicas: NodeReplica[]
): ProvenanceChain {
  const matchingReceipts = receipts.filter(r => r.reportId === report.id);
  const holdingReplicas = replicas.filter(r => r.reportId === report.id);

  const currentHolders = Array.from(new Set([
    report.originNodeId,
    ...holdingReplicas.map(r => r.nodeId),
    ...matchingReceipts.map(r => r.toNodeId)
  ]));

  const forwardingHops = matchingReceipts.map(r => ({
    fromNode: r.fromNodeId,
    toNode: r.toNodeId,
    timestamp: r.receivedAt,
    path: r.forwardingPath.length > 0 ? r.forwardingPath : [r.fromNodeId, r.toNodeId]
  })).sort((a, b) => a.timestamp - b.timestamp);

  return {
    reportId: report.id,
    originNodeId: report.originNodeId,
    originAuthorId: report.originAuthorId,
    observedAt: report.observedAt,
    createdAt: report.createdAt,
    currentHolders,
    forwardingHops,
  };
}

/**
 * Validates that an incoming report maintains its original provenance
 */
export function preserveReportIdentity(
  existingReport: IncidentReport | undefined,
  incomingReport: IncidentReport
): IncidentReport {
  if (!existingReport) {
    return incomingReport;
  }

  // Ensure origin attributes never mutate on relay/duplicate
  return {
    ...incomingReport,
    id: existingReport.id,
    originNodeId: existingReport.originNodeId,
    originAuthorId: existingReport.originAuthorId,
    createdAt: existingReport.createdAt,
    observedAt: existingReport.observedAt,
    evidenceType: existingReport.evidenceType,
  };
}
