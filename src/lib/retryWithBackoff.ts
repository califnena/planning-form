/**
 * Safe retry utility with exponential backoff.
 *
 * Only retries on TRANSIENT errors (network, 502/503/504, 429, CORS).
 * Never retries on PERMANENT errors (card declined, validation, duplicates).
 */

const TRANSIENT_PATTERNS = [
  /network/i,
  /timeout/i,
  /timed out/i,
  /failed to fetch/i,
  /fetch failed/i,
  /cors/i,
  /econnreset/i,
  /econnrefused/i,
  /socket hang up/i,
  /aborted/i,
  /rate limit/i,
  /too many requests/i,
];

const TRANSIENT_STATUS_CODES = [429, 502, 503, 504, 408, 0];

const PERMANENT_PATTERNS = [
  /card.*(declined|rejected)/i,
  /invalid.*(request|param|argument)/i,
  /validation/i,
  /already.*(processed|exists|completed)/i,
  /duplicate/i,
  /idempotent/i,
  /webhook.*signature/i,
  /constraint/i,
  /unique.*violation/i,
  /not.*(found|configured)/i,
  /missing.*key/i,
  /unauthorized/i,
  /forbidden/i,
  /not allowed/i,
];

export function isTransientError(error: any): boolean {
  const message = String(error?.message || error || "").toLowerCase();
  const status = error?.status || error?.statusCode || error?.code;

  // Check permanent patterns first — these should never be retried
  if (PERMANENT_PATTERNS.some((p) => p.test(message))) return false;

  // Check status codes
  if (typeof status === "number" && TRANSIENT_STATUS_CODES.includes(status)) return true;

  // Check transient patterns
  if (TRANSIENT_PATTERNS.some((p) => p.test(message))) return true;

  // Stripe-specific transient codes
  if (error?.type === "StripeConnectionError" || error?.type === "StripeAPIError") return true;

  return false;
}

export type RetryOptions = {
  maxRetries?: number;
  /** Backoff delays in ms for each retry (default: [1000, 3000]) */
  delays?: number[];
  /** Called before each retry with attempt number (1-indexed) */
  onRetry?: (attempt: number, error: any) => void;
};

/**
 * Execute an async fn with automatic retry for transient errors.
 * Retries up to `maxRetries` times with the specified backoff delays.
 * Non-transient errors are thrown immediately without retry.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 2, delays = [1000, 3000], onRetry } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry permanent errors
      if (!isTransientError(error)) {
        throw error;
      }

      // Don't retry if we've exhausted attempts
      if (attempt >= maxRetries) {
        throw error;
      }

      const delay = delays[attempt] ?? delays[delays.length - 1] ?? 3000;
      onRetry?.(attempt + 1, error);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
