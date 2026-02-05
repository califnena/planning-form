import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AssistedHelpConfig {
  enabled: boolean;
  timeoutMinutes: number;
}

interface UseAssistedHelpTriggerOptions {
  /** Called when trigger conditions are met */
  onTrigger?: () => void;
  /** Whether this is a read-only/printable page (disables trigger) */
  isReadOnly?: boolean;
}

/**
 * Hook to manage assisted help trigger logic
 * 
 * Trigger conditions:
 * 1. Time-based: User idle on page for N minutes (configurable by admin)
 * 2. Incomplete section: User attempts to leave with empty required fields
 * 3. Manual: User explicitly requests help
 * 
 * Rules:
 * - Only shows once per page per session
 * - Resets if user is actively typing
 * - Does not show on read-only pages
 */
export function useAssistedHelpTrigger({
  onTrigger,
  isReadOnly = false,
}: UseAssistedHelpTriggerOptions = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [config, setConfig] = useState<AssistedHelpConfig>({
    enabled: true,
    timeoutMinutes: 4,
  });
  const [configLoaded, setConfigLoaded] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const pageKeyRef = useRef<string>("");

  // Generate a unique key for this page in this session
  useEffect(() => {
    pageKeyRef.current = `assisted_help_dismissed_${window.location.pathname}`;
    
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem(pageKeyRef.current);
    if (dismissed === "true") {
      setHasDismissed(true);
    }
  }, []);

  // Fetch admin config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("app_config")
          .select("key, value")
          .in("key", ["assisted_help_trigger_enabled", "assisted_help_trigger_minutes"]);

        if (error) {
          console.error("Error fetching app config:", error);
          setConfigLoaded(true);
          return;
        }

        const newConfig: AssistedHelpConfig = {
          enabled: true,
          timeoutMinutes: 4,
        };

        data?.forEach((row) => {
          if (row.key === "assisted_help_trigger_enabled") {
            newConfig.enabled = row.value === true || row.value === "true";
          }
          if (row.key === "assisted_help_trigger_minutes") {
            const minutes = typeof row.value === "number" 
              ? row.value 
              : parseInt(String(row.value), 10);
            if (!isNaN(minutes) && minutes >= 1 && minutes <= 10) {
              newConfig.timeoutMinutes = minutes;
            }
          }
        });

        setConfig(newConfig);
        setConfigLoaded(true);
      } catch (err) {
        console.error("Error loading assisted help config:", err);
        setConfigLoaded(true);
      }
    };

    fetchConfig();
  }, []);

  // Reset activity timer on user interaction
  const resetActivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout and restart
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't start timer if disabled, dismissed, already visible, or read-only
    if (!config.enabled || hasDismissed || isVisible || isReadOnly || !configLoaded) {
      return;
    }

    const timeoutMs = config.timeoutMinutes * 60 * 1000;
    
    timeoutRef.current = setTimeout(() => {
      // Double-check no activity occurred
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= timeoutMs - 1000) {
        showTrigger();
      }
    }, timeoutMs);
  }, [config, hasDismissed, isVisible, isReadOnly, configLoaded]);

  // Show the trigger
  const showTrigger = useCallback(() => {
    if (hasDismissed || isVisible || isReadOnly || !config.enabled) {
      return;
    }
    
    setIsVisible(true);
    onTrigger?.();
  }, [hasDismissed, isVisible, isReadOnly, config.enabled, onTrigger]);

  // Dismiss the trigger (won't show again this session on this page)
  const dismiss = useCallback(() => {
    setIsVisible(false);
    setHasDismissed(true);
    sessionStorage.setItem(pageKeyRef.current, "true");
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Manual trigger (user clicks "Need help?")
  const triggerManually = useCallback(() => {
    if (hasDismissed || isReadOnly || !config.enabled) {
      return;
    }
    showTrigger();
  }, [hasDismissed, isReadOnly, config.enabled, showTrigger]);

  // Incomplete section trigger
  const triggerOnIncomplete = useCallback(() => {
    if (hasDismissed || isReadOnly || !config.enabled) {
      return;
    }
    showTrigger();
  }, [hasDismissed, isReadOnly, config.enabled, showTrigger]);

  // Set up activity listeners
  useEffect(() => {
    if (!configLoaded || !config.enabled || hasDismissed || isReadOnly) {
      return;
    }

    const handleActivity = () => {
      resetActivityTimer();
    };

    // Track typing specifically to know when user is active
    const handleKeyDown = () => {
      lastActivityRef.current = Date.now();
      // Hide if showing and user starts typing
      if (isVisible) {
        // Don't auto-dismiss on typing, let user choose
      }
      resetActivityTimer();
    };

    // Start initial timer
    resetActivityTimer();

    // Listen for activity events
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleActivity);
    document.addEventListener("touchstart", handleActivity);
    document.addEventListener("scroll", handleActivity, { passive: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleActivity);
      document.removeEventListener("touchstart", handleActivity);
      document.removeEventListener("scroll", handleActivity);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [configLoaded, config.enabled, hasDismissed, isReadOnly, isVisible, resetActivityTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    hasDismissed,
    config,
    configLoaded,
    dismiss,
    triggerManually,
    triggerOnIncomplete,
    showTrigger,
  };
}
