import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

interface DictationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  label?: string;
}

/**
 * Senior-friendly text input with dictation support.
 * Shows "Speak instead of type" button when voiceFriendlyMode is enabled.
 */
export const DictationInput = ({
  value,
  onChange,
  placeholder = "Type here or use the microphone to speak...",
  className = "",
  rows = 4,
  label,
}: DictationInputProps) => {
  const { voiceFriendlyMode } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      // Append to existing value
      onChange(value ? `${value} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [value, onChange]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-base font-medium text-foreground">{label}</label>
      )}
      
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "text-base leading-relaxed resize-none",
            isListening && "border-primary ring-2 ring-primary/20"
          )}
        />
        
        {/* Listening indicator */}
        {isListening && (
          <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium animate-pulse">
            <Mic className="h-4 w-4" />
            Listening...
          </div>
        )}
      </div>

      {/* Dictation button - only show when voice-friendly mode is on */}
      {voiceFriendlyMode && isSupported && (
        <Button
          type="button"
          variant={isListening ? "default" : "outline"}
          onClick={isListening ? stopListening : startListening}
          className="gap-2 h-12 text-base"
        >
          {isListening ? (
            <>
              <MicOff className="h-5 w-5" />
              Stop listening
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Speak instead of type
            </>
          )}
        </Button>
      )}

      {/* Fallback message if not supported */}
      {voiceFriendlyMode && !isSupported && (
        <p className="text-sm text-muted-foreground">
          Voice input is not available in your browser. Try using Chrome or Edge.
        </p>
      )}
    </div>
  );
};
