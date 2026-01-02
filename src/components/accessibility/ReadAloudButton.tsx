import { useState, useCallback, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface ReadAloudButtonProps {
  text: string;
  className?: string;
  autoPlay?: boolean;
  size?: "sm" | "default" | "lg";
}

/**
 * Senior-friendly Read Aloud button using browser text-to-speech.
 * Only visible when voiceFriendlyMode is enabled.
 */
export const ReadAloudButton = ({ 
  text, 
  className = "",
  autoPlay = false,
  size = "default",
}: ReadAloudButtonProps) => {
  const { voiceFriendlyMode } = useAccessibility();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for seniors
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a clear English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      v => v.lang.startsWith('en') && v.name.includes('Female')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsLoading(false);
    };

    setIsLoading(true);
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Auto-play on mount if enabled
  useEffect(() => {
    if (autoPlay && voiceFriendlyMode && text) {
      // Small delay to allow voices to load
      const timer = setTimeout(speak, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, voiceFriendlyMode, text, speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Don't render if voice-friendly mode is off
  if (!voiceFriendlyMode) {
    return null;
  }

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    default: "h-11 px-4",
    lg: "h-14 px-6 text-base",
  };

  return (
    <Button
      variant="outline"
      onClick={isSpeaking ? stop : speak}
      className={`gap-2 ${sizeClasses[size]} ${className}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isSpeaking ? (
        <VolumeX className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
      {isSpeaking ? "Stop reading" : "Read aloud"}
    </Button>
  );
};
