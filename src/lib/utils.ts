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
    // Only allow in dev/preview environments
    return import.meta.env.DEV ? enabled : enabled;
  } catch {
    return false;
  }
}

