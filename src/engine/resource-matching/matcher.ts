// Resource Matching Engine
import { ResourceRequest, ResourceOffer, SuggestedMatch } from '../../types';

export interface MatcherOptions {
  prioritizeProximity?: boolean;
}

export function generateSuggestedMatches(
  requests: ResourceRequest[],
  offers: ResourceOffer[],
  existingMatches: SuggestedMatch[] = []
): SuggestedMatch[] {
  const suggestions: SuggestedMatch[] = [];

  // Sort requests by urgency (Critical > High > Medium > Low) and then by creation date
  const urgencyWeight: Record<string, number> = {
    'Critical': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
  };

  const openRequests = requests
    .filter(req => req.status === 'OPEN' || req.status === 'PARTIALLY_MATCHED')
    .sort((a, b) => (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0) || a.createdAt - b.createdAt);

  // Available offers
  const availableOffers = offers.filter(o => o.status === 'AVAILABLE');

  for (const request of openRequests) {
    // If request already has an approved match, skip
    const hasApprovedMatch = existingMatches.some(m => m.requestId === request.id && m.status === 'APPROVED');
    if (hasApprovedMatch) continue;

    const neededQuantity = request.quantity - (request.fulfilledQuantity || 0);
    if (neededQuantity <= 0) continue;

    // Filter offers matching category and unit
    const compatibleOffers = availableOffers.filter(offer => 
      offer.category === request.category && 
      offer.unit.toLowerCase() === request.unit.toLowerCase() &&
      (offer.quantity - (offer.allocatedQuantity || 0)) > 0
    );

    if (compatibleOffers.length === 0) continue;

    // Proximity sorting: same neighborhood first
    const sortedOffers = [...compatibleOffers].sort((a, b) => {
      const aSameLoc = a.neighborhood === request.neighborhood ? 1 : 0;
      const bSameLoc = b.neighborhood === request.neighborhood ? 1 : 0;
      return bSameLoc - aSameLoc;
    });

    // Greedy aggregation to fulfill needed quantity
    let accumulated = 0;
    const matchAllocations: {
      offerId: string;
      offerNodeId: string;
      quantity: number;
      unit: string;
    }[] = [];

    for (const offer of sortedOffers) {
      const offerAvailable = offer.quantity - (offer.allocatedQuantity || 0);
      if (offerAvailable <= 0) continue;

      const take = Math.min(neededQuantity - accumulated, offerAvailable);
      accumulated += take;
      matchAllocations.push({
        offerId: offer.id,
        offerNodeId: offer.nodeId,
        quantity: take,
        unit: offer.unit,
      });

      if (accumulated >= neededQuantity) {
        break;
      }
    }

    if (matchAllocations.length > 0) {
      suggestions.push({
        id: `match-${request.id}-${Date.now()}`,
        requestId: request.id,
        matches: matchAllocations,
        totalSuggestedQuantity: accumulated,
        targetQuantity: request.quantity,
        unit: request.unit,
        status: 'PENDING',
        createdAt: Date.now(),
      });
    }
  }

  return suggestions;
}
