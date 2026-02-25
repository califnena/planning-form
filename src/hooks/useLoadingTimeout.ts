import { useState, useEffect, useRef } from "react";

/**
 * Safety hook that triggers a timeout flag if loading doesn't resolve
 * within the given duration. Prevents infinite spinners.
 *
 * @param isLoading  - Current loading state
 * @param timeoutMs  - Max time to wait (default 12s)
 * @returns { timedOut } - true if loading exceeded timeout
 */
export function useLoadingTimeout(isLoading: boolean, timeoutMs = 12000) {
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading) {
      setTimedOut(false);
      timerRef.current = setTimeout(() => {
        setTimedOut(true);
      }, timeoutMs);
    } else {
      // Loading finished — clear timer and reset
      if (timerRef.current) clearTimeout(timerRef.current);
      setTimedOut(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, timeoutMs]);

  return { timedOut };
}
