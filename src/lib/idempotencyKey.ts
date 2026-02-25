/**
 * Generate an idempotency key for Stripe create calls.
 *
 * Key = userId + actionType + lookupKey + 5-minute time bucket
 * This prevents double-charging if the client retries within the same bucket.
 */

export function generateIdempotencyKey(params: {
  userId: string;
  actionType: string;
  lookupKey: string;
}): string {
  const bucketMs = 5 * 60 * 1000; // 5 minutes
  const bucket = Math.floor(Date.now() / bucketMs);
  const raw = `${params.userId}:${params.actionType}:${params.lookupKey}:${bucket}`;

  // Simple hash — no crypto needed; Stripe accepts any string ≤ 255 chars
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `idem_${Math.abs(hash).toString(36)}_${bucket.toString(36)}`;
}
