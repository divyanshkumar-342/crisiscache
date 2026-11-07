// Network Graph & Synchronization Engine
import { 
  IncidentReport, 
  EvidenceRelationship, 
  DeliveryReceipt, 
  NodeReplica, 
  NetworkLink, 
  SyncLogEntry,
  ResourceRequest,
  ResourceOffer,
  DeviceNode
} from '../../types';

export interface SyncStepResult {
  transferredCount: number;
  duplicateCount: number;
  newReceipts: DeliveryReceipt[];
  newReplicas: NodeReplica[];
  logs: SyncLogEntry[];
}

/**
 * Returns an adjacency list of enabled links between nodes
 */
export function buildAdjacencyList(links: NetworkLink[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const link of links) {
    if (!link.isEnabled) continue;
    if (!adj.has(link.sourceNodeId)) adj.set(link.sourceNodeId, []);
    if (!adj.has(link.targetNodeId)) adj.set(link.targetNodeId, []);
    adj.get(link.sourceNodeId)!.push(link.targetNodeId);
    adj.get(link.targetNodeId)!.push(link.sourceNodeId);
  }
  return adj;
}

/**
 * Finds shortest path between source and target using BFS along enabled links
 */
export function findShortestPath(
  sourceId: string, 
  targetId: string, 
  adj: Map<string, string[]>
): string[] | null {
  if (sourceId === targetId) return [sourceId];
  
  const queue: { node: string; path: string[] }[] = [{ node: sourceId, path: [sourceId] }];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    const neighbors = adj.get(node) || [];

    for (const neighbor of neighbors) {
      if (neighbor === targetId) {
        return [...path, neighbor];
      }
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({ node: neighbor, path: [...path, neighbor] });
      }
    }
  }

  return null; // Disconnected / partitioned
}

/**
 * Finds all nodes reachable from a start node via enabled links
 */
export function getReachableNodes(startNodeId: string, adj: Map<string, string[]>): Set<string> {
  const visited = new Set<string>([startNodeId]);
  const queue = [startNodeId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current) || [];
    for (const n of neighbors) {
      if (!visited.has(n)) {
        visited.add(n);
        queue.push(n);
      }
    }
  }

  return visited;
}

/**
 * Determines connected components (network partitions)
 */
export function getNetworkPartitions(allNodes: DeviceNode[], links: NetworkLink[]): string[][] {
  const adj = buildAdjacencyList(links);
  const visited = new Set<string>();
  const partitions: string[][] = [];

  for (const node of allNodes) {
    if (!visited.has(node.id)) {
      const component = Array.from(getReachableNodes(node.id, adj));
      component.forEach(n => visited.add(n));
      partitions.push(component);
    }
  }

  return partitions;
}

/**
 * Executes a pairwise synchronization between two reachable nodes along a path
 */
export function syncBetweenReachableNodes(
  sourceNodeId: string,
  targetNodeId: string,
  path: string[],
  allReports: IncidentReport[],
  existingReplicas: NodeReplica[],
  existingReceipts: DeliveryReceipt[],
  timestamp: number = Date.now()
): SyncStepResult {
  const logs: SyncLogEntry[] = [];
  const newReceipts: DeliveryReceipt[] = [];
  const newReplicas: NodeReplica[] = [];
  let transferredCount = 0;
  let duplicateCount = 0;

  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Get reports currently held by sourceNode
  const sourceReplicaReportIds = new Set(
    existingReplicas.filter(r => r.nodeId === sourceNodeId).map(r => r.reportId)
  );
  // Also include reports originally created by sourceNode
  allReports.filter(r => r.originNodeId === sourceNodeId).forEach(r => sourceReplicaReportIds.add(r.id));

  // Get reports currently held by targetNode
  const targetReplicaReportIds = new Set(
    existingReplicas.filter(r => r.nodeId === targetNodeId).map(r => r.reportId)
  );
  allReports.filter(r => r.originNodeId === targetNodeId).forEach(r => targetReplicaReportIds.add(r.id));

  // Exchange missing items from source to target
  for (const reportId of sourceReplicaReportIds) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) continue;

    if (targetReplicaReportIds.has(reportId)) {
      duplicateCount++;
      logs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp,
        formattedTime: timeStr,
        message: `${targetNodeId} already contains ${report.id}. Duplicate delivery ignored; origin (${report.originNodeId}) preserved.`,
        type: 'duplicate',
        sourceNodeId,
        targetNodeId,
        reportId: report.id,
      });
    } else {
      transferredCount++;
      // Create new replica on target node
      newReplicas.push({
        id: `rep-${targetNodeId}-${reportId}`,
        nodeId: targetNodeId,
        reportId: report.id,
        receivedAt: timestamp,
        latestSyncAt: timestamp,
        forwardingPath: path,
      });

      // Create delivery receipt with full forwarding path
      const receiptId = `rcpt-${sourceNodeId}-${targetNodeId}-${reportId}-${timestamp}`;
      newReceipts.push({
        id: receiptId,
        reportId: report.id,
        fromNodeId: sourceNodeId,
        toNodeId: targetNodeId,
        receivedAt: timestamp,
        forwardingPath: path,
      });

      const hopDetails = path.length > 2 ? ` relayed via [${path.join(' → ')}]` : '';
      logs.push({
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        timestamp,
        formattedTime: timeStr,
        message: `${sourceNodeId} synchronized with ${targetNodeId}${hopDetails}: received ${report.id} (Category: ${report.category}, Origin: ${report.originNodeId}).`,
        type: 'sync',
        sourceNodeId,
        targetNodeId,
        reportId: report.id,
      });
    }
  }

  return {
    transferredCount,
    duplicateCount,
    newReceipts,
    newReplicas,
    logs,
  };
}

/**
 * Runs full network propagation across all currently enabled links
 */
export function synchronizeActiveNetwork(
  nodes: DeviceNode[],
  links: NetworkLink[],
  allReports: IncidentReport[],
  currentReplicas: NodeReplica[],
  currentReceipts: DeliveryReceipt[],
  timestamp: number = Date.now()
): {
  totalTransferred: number;
  totalDuplicates: number;
  updatedReplicas: NodeReplica[];
  updatedReceipts: DeliveryReceipt[];
  logs: SyncLogEntry[];
} {
  const adj = buildAdjacencyList(links);
  const updatedReplicas = [...currentReplicas];
  const updatedReceipts = [...currentReceipts];
  const logs: SyncLogEntry[] = [];
  let totalTransferred = 0;
  let totalDuplicates = 0;

  const timeStr = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // For every pair of nodes, check if a path exists
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const src = nodes[i].id;
      const dst = nodes[j].id;

      const path = findShortestPath(src, dst, adj);
      if (!path) {
        // Disconnected - cannot sync
        continue;
      }

      const step = syncBetweenReachableNodes(
        src,
        dst,
        path,
        allReports,
        updatedReplicas,
        updatedReceipts,
        timestamp
      );

      totalTransferred += step.transferredCount;
      totalDuplicates += step.duplicateCount;
      logs.push(...step.logs);

      // Add new replicas and receipts to ongoing state
      for (const rep of step.newReplicas) {
        if (!updatedReplicas.some(r => r.nodeId === rep.nodeId && r.reportId === rep.reportId)) {
          updatedReplicas.push(rep);
        }
      }
      for (const rcpt of step.newReceipts) {
        if (!updatedReceipts.some(r => r.id === rcpt.id)) {
          updatedReceipts.push(rcpt);
        }
      }
    }
  }

  if (totalTransferred === 0 && totalDuplicates === 0) {
    logs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp,
      formattedTime: timeStr,
      message: 'Network synchronization finished. All reachable devices are already up to date.',
      type: 'info',
    });
  }

  return {
    totalTransferred,
    totalDuplicates,
    updatedReplicas,
    updatedReceipts,
    logs,
  };
}
