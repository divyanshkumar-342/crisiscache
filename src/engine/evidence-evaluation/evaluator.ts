// Evidence Evaluation Engine
import { 
  Incident, 
  IncidentReport, 
  EvidenceRelationship, 
  DeliveryReceipt, 
  NodeReplica,
  IncidentEvaluation,
  EvidenceStatus
} from '../../types';
import { calculateFreshness } from '../freshness/freshness';

export function evaluateIncidentEvidence(
  incident: Incident,
  allReports: IncidentReport[],
  allRelationships: EvidenceRelationship[],
  allReceipts: DeliveryReceipt[],
  allReplicas: NodeReplica[],
  currentTime: number = Date.now()
): IncidentEvaluation {
  // 1. Filter reports associated with this incident
  const incidentReports = allReports.filter(r => r.incidentId === incident.id);

  // 2. Classify reports based on explicit relationships and evidenceType
  const supportingReports: IncidentReport[] = [];
  const conflictingReports: IncidentReport[] = [];
  const updateReports: IncidentReport[] = [];

  // Track reports already seen by ID to prevent duplicate counts
  const processedReportIds = new Set<string>();

  for (const report of incidentReports) {
    if (processedReportIds.has(report.id)) continue;
    processedReportIds.add(report.id);

    // Look for relationships where this report is source
    const relsFromReport = allRelationships.filter(rel => rel.sourceReportId === report.id);
    const contradictsRel = relsFromReport.some(rel => rel.relationshipType === 'CONTRADICTS');
    const confirmsRel = relsFromReport.some(rel => rel.relationshipType === 'INDEPENDENTLY_CONFIRMS');
    const updatesRel = relsFromReport.some(rel => rel.relationshipType === 'UPDATES' || rel.relationshipType === 'SUPERSEDES');

    if (contradictsRel || report.evidenceType === 'CONTRADICTION') {
      conflictingReports.push(report);
    } else if (confirmsRel || report.evidenceType === 'CONFIRMATION' || report.evidenceType === 'ORIGINAL') {
      supportingReports.push(report);
    } else if (updatesRel || report.evidenceType === 'UPDATE') {
      updateReports.push(report);
      // Updates are considered supporting with newer operational data
      supportingReports.push(report);
    } else {
      supportingReports.push(report);
    }
  }

  // 3. Count independent observations
  // Each distinct IncidentReport in supportingReports represents an independent observation.
  // Note: Forwarding does NOT create a new IncidentReport ID; it creates DeliveryReceipts / NodeReplicas.
  const independentObservationsCount = supportingReports.length;
  const conflictingObservationsCount = conflictingReports.length;

  // 4. Calculate forwarded copies across devices
  // A forwarded copy is a replica of any of this incident's reports held on a device other than its originNodeId
  const incidentReportIds = new Set(incidentReports.map(r => r.id));
  const forwardedReceipts = allReceipts.filter(rcpt => incidentReportIds.has(rcpt.reportId));
  
  // Forwarded replicas = replicas where nodeId != report.originNodeId
  const forwardedReplicas = allReplicas.filter(rep => {
    const origReport = incidentReports.find(r => r.id === rep.reportId);
    return origReport && rep.nodeId !== origReport.originNodeId;
  });

  // Calculate unique forwarded copies (unique reportId + nodeId pairs excluding origin)
  const forwardedCopyKeys = new Set<string>();
  forwardedReplicas.forEach(r => forwardedCopyKeys.add(`${r.reportId}-${r.nodeId}`));
  forwardedReceipts.forEach(rcpt => forwardedCopyKeys.add(`${rcpt.reportId}-${rcpt.toNodeId}`));
  const forwardedCopiesCount = forwardedCopyKeys.size;

  // 5. Determine Evidence Status
  let evidenceStatus: EvidenceStatus = 'UNVERIFIED';

  if (conflictingObservationsCount > 0) {
    // Contradictions take precedence in alert status, but supporting evidence remains fully visible!
    evidenceStatus = 'CONTESTED';
  } else if (independentObservationsCount >= 2) {
    evidenceStatus = 'CORROBORATED';
  } else {
    evidenceStatus = 'UNVERIFIED';
  }

  // 6. Calculate Freshness based on latest observedAt timestamp
  const observationTimestamps = incidentReports.map(r => r.observedAt);
  const latestObservationTime = observationTimestamps.length > 0 
    ? Math.max(...observationTimestamps) 
    : incident.createdAt;

  const freshness = calculateFreshness(incident.category, latestObservationTime, incident.freshnessTTL, currentTime);

  // 7. Format forwarded reports with their delivery path
  const forwardedReportsList = incidentReports.map(report => {
    const rcpt = allReceipts.find(r => r.reportId === report.id);
    const path = rcpt ? rcpt.forwardingPath : [report.originNodeId];
    return { report, path };
  });

  return {
    incident,
    reports: incidentReports,
    relationships: allRelationships.filter(rel => 
      incidentReportIds.has(rel.sourceReportId) || incidentReportIds.has(rel.targetReportId)
    ),
    receipts: forwardedReceipts,
    independentObservationsCount,
    forwardedCopiesCount,
    conflictingObservationsCount,
    evidenceStatus,
    freshnessStatus: freshness.status,
    supportingReports,
    forwardedReports: forwardedReportsList,
    conflictingReports,
    latestObservationTime,
    timeSinceLastObservationMs: freshness.elapsedMs,
    expiresInMs: freshness.remainingMs,
  };
}
