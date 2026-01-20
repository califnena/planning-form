import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Lightweight "test mode" toggle to bypass auth in development previews
// Activate by adding ?test=1 to the URL once; it will persist in localStorage
export function isTestModeEnabled(): boolean {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test") === "1") {
      localStorage.setItem("test-mode", "1");
    }
    if (params.get("test") === "0") {
      localStorage.removeItem("test-mode");
    }
    const enabled = localStorage.getItem("test-mode") === "1";
    // Only allow in dev/preview environments - NEVER in production
    return import.meta.env.DEV && enabled;
  } catch {
    return false;
  }
}

/**
 * Emotional stage routes where pricing, progress indicators,
 * and intrusive UI elements should be suppressed to protect emotional flow.
 */
const EMOTIONAL_STAGE_ROUTES = [
  "/safety-entry",
  "/orientation",
] as const;

/**
 * Check if the current route is an emotional stage route.
 * On these routes, pricing banners, upgrade CTAs, progress bars,
 * and auto-opening assistant chat should be suppressed.
 */
export function isEmotionalStageRoute(route: string): boolean {
  const normalizedRoute = route.toLowerCase().split("?")[0]; // Remove query params
  return EMOTIONAL_STAGE_ROUTES.some(
    (emotionalRoute) => normalizedRoute === emotionalRoute || normalizedRoute.startsWith(emotionalRoute + "/")
  );
}

/**
 * Check if progress indicators (bars, percentages) should be hidden.
 * Always returns true since progress indicators are globally suppressed.
 */
export function shouldHideProgressIndicators(): boolean {
  return true;
}

