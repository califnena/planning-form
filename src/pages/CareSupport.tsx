import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Sparkles, ArrowRight, Mic, Volume2, VolumeX, Home, LogOut, CheckCircle, HelpCircle, MessageCircle, FileText, ClipboardCheck, Lock, Phone, Download, ArrowRightCircle, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { setPendingCheckout } from "@/lib/pendingCheckout";
import { ClaireWelcomeModal } from "@/components/assistant/ClaireWelcomeModal";
import NotAdviceNote from "@/components/NotAdviceNote";
import { requireSessionOrRedirect } from "@/lib/sessionGuard";
import { isStoreIAP } from "@/lib/billingMode";
import { StoreIAPModal } from "@/components/StoreIAPModal";
import { AfterDeathResourcesResponse } from "@/components/assistant/AfterDeathResourcesResponse";
import { useEmotionalSupportSessions } from "@/hooks/useEmotionalSupportSessions";
import claireAvatar from "@/assets/claire-avatar.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Message = { role: "user" | "assistant"; content: string; isError?: boolean };
type Mode = "planning" | "afterdeath" | "emotional" | null;

// Mode-specific fallback messages when AI fails
const ERROR_FALLBACK_MESSAGES: Record<Exclude<Mode, null>, string> = {
  planning: "I'm here. If you tell me what you're working on, I can guide you. You can also use the guides and checklists below.",
  afterdeath: "I'm here. If you tell me what happened and what you need help with first, I'll guide you. You can also download the After Death Guide below.",
  emotional: "I'm here with you. If you want, tell me what's on your mind. If you'd rather not type, you can use the quick options below."
};

// Generic fallback when mode is null
const GENERIC_ERROR_FALLBACK = "Sorry, I didn't catch that. Please try again, or tap one of the quick options below.";

// Safe error logging (no PII)
const logClaireError = (mode: Mode, errorCode: string | number, errorMessage: string, isRetry: boolean) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    mode: mode || "none",
    errorCode: String(errorCode),
    errorMessage: errorMessage.slice(0, 200), // Truncate to avoid PII leakage
    isRetry
  };
  console.log("[Claire Error Log]", JSON.stringify(logEntry));
  // Future: Could store in a claire_error_logs table if needed
};


type QuickAction = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt?: string;
  navigateTo?: string;
  showAfterDeathResources?: boolean;
  downloadUrl?: string;
};

const PLANNING_ACTIONS: QuickAction[] = [
  { label: "After-Death Planner & Checklist", showAfterDeathResources: true, icon: ClipboardCheck },
  { label: "Help me understand my options", prompt: "Can you help me understand my planning options?", icon: HelpCircle },
  { label: "Help me continue my plan", prompt: "I want to continue working on my plan.", icon: FileText },
  { label: "I have a question", prompt: "I have a question about planning.", icon: MessageCircle },
  { label: "I need more support", prompt: "I'm feeling overwhelmed and need support.", icon: Heart },
];

const AFTERDEATH_ACTIONS: QuickAction[] = [
  { label: "What needs to be done first?", prompt: "Someone has passed away. What needs to be done first?", icon: ArrowRightCircle },
  { label: "Who needs to be notified?", prompt: "Who needs to be notified after someone passes away?", icon: MessageCircle },
  { label: "What documents are needed?", prompt: "What documents will I need to gather after a death?", icon: FileText },
  { label: "Funeral and service decisions", prompt: "What decisions need to be made about the funeral or memorial service?", icon: ClipboardCheck },
  { label: "What can wait until later?", prompt: "What tasks can wait until later? I don't want to miss anything urgent.", icon: HelpCircle },
  { label: "Download After Death Guide", downloadUrl: "/guides/EFA-After-Death-Planner-and-Checklist.pdf", icon: Download },
  { label: "Talk to a real person", navigateTo: "/contact", icon: Phone },
];

const EMOTIONAL_ACTIONS: QuickAction[] = [
  { label: "How do I cope with grief?", prompt: "How do I cope with grief? I'm struggling and don't know what to do.", icon: Heart },
  { label: "Is what I'm feeling normal?", prompt: "Is what I'm feeling normal? I'm not sure if my reactions are okay.", icon: HelpCircle },
  { label: "How do I talk to others about my loss?", prompt: "How do I talk to family and friends about my loss? It feels so hard.", icon: MessageCircle },
  { label: "When does grief get easier?", prompt: "When does grief get easier? Will I always feel this way?", icon: HelpCircle },
  { label: "I'm struggling right now", prompt: "I'm really struggling right now. What can I do to feel a little better?", icon: Heart },
  { label: "Talk to a real person", navigateTo: "/contact", icon: Phone },
];

// Suggestion chips shown after Claire's first message (subset of actions - prompts only)
const PLANNING_SUGGESTIONS = [
  { label: "Funeral or memorial wishes", prompt: "I'd like help thinking through my funeral or memorial wishes." },
  { label: "Important documents to gather", prompt: "What important documents should I gather and organize?" },
  { label: "Who should be in charge later", prompt: "How do I decide who should be in charge of things after I'm gone?" },
  { label: "Personal messages or legacy letters", prompt: "Help me write personal messages or a legacy letter to my family." },
  { label: "Saving what I've already entered", prompt: "I want to save and organize what I've already entered." },
];

// Intro text shown above suggestion chips
const PLANNING_INTRO_TEXT = "You can start anywhere. For example:";
const EMOTIONAL_INTRO_TEXT = "If it helps, we can talk about:";

const AFTERDEATH_SUGGESTIONS = [
  { label: "What needs to be done first?", prompt: "Someone has passed away. What needs to be done first?" },
  { label: "Who needs to be notified?", prompt: "Who needs to be notified after someone passes away?" },
  { label: "What documents are needed?", prompt: "What documents will I need to gather after a death?" },
  { label: "Talk to a real person", navigateTo: "/contact" },
];

const EMOTIONAL_SUGGESTIONS = [
  { label: "Feeling overwhelmed or numb", prompt: "I'm feeling overwhelmed or numb. Is that normal?" },
  { label: "Grief and emotions", prompt: "I'd like to talk about grief and the emotions I'm experiencing." },
  { label: "Family conversations", prompt: "How do I have difficult conversations with family about loss?" },
  { label: "What comes next", prompt: "I'm not sure what comes next. Can you help me understand?" },
  { label: "Or anything else on your mind", prompt: "I just need someone to talk to right now." },
];

export default function CareSupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // GUARDRAIL: Mode starts as null - no topic buttons shown until user explicitly selects a mode
  const [mode, setMode] = useState<Mode>(() => {
    const savedMode = localStorage.getItem("claire_mode");
    return (savedMode === "planning" || savedMode === "afterdeath" || savedMode === "emotional") 
      ? savedMode 
      : null; // No default mode - forces explicit selection
  });

  // Track which modes user has seen before (for first-message logic)
  const [seenModes, setSeenModes] = useState<Set<Mode>>(() => {
    const saved = localStorage.getItem("claire_seen_modes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Set(parsed as Mode[]);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Mode-specific first messages
  const MODE_FIRST_MESSAGES: Record<Exclude<Mode, null>, string> = {
    planning: `I'm glad you're here.

We can take this one step at a time. I can help you understand what to think about, or we can start filling things out together if you'd like.

What would you like help with today?`,
    afterdeath: `I'm really sorry you're going through this.

I can help you focus on what matters most right now, and we'll take the rest one step at a time.

Would you like help understanding what to do first, or would you rather ask a specific question?`,
    emotional: `I'm here with you.

You don't have to have the right words. You can share what's on your mind, or we can just talk through what feels heavy right now.

What would help most in this moment?`
  };

  // Shorter returning user messages per mode
  const MODE_RETURNING_MESSAGES: Record<Exclude<Mode, null>, string> = {
    planning: "Welcome back. What would you like to work on today?",
    afterdeath: "I'm here. What can I help with next?",
    emotional: "I'm here with you. What's on your mind?"
  };

  // Handle mode selection with first-message logic
  const handleModeSelect = (newMode: Exclude<Mode, null>) => {
    if (mode === newMode) return;
    
    const isFirstTime = !seenModes.has(newMode);
    setMode(newMode);
    
    // Clear any error state when switching modes
    setShowErrorOptions(false);
    
    // Add Claire's welcome message - full intro for first time, short for returning
    const welcomeMessage = isFirstTime ? MODE_FIRST_MESSAGES[newMode] : MODE_RETURNING_MESSAGES[newMode];
    setMessages([{ role: "assistant", content: welcomeMessage }]);
    
    // Mark this mode as seen
    if (isFirstTime) {
      const updatedSeen = new Set(seenModes);
      updatedSeen.add(newMode);
      setSeenModes(updatedSeen);
      localStorage.setItem("claire_seen_modes", JSON.stringify([...updatedSeen]));
    }
    
    toast({ title: `Switched to: ${newMode === "planning" ? "Planning Ahead" : newMode === "afterdeath" ? "After a Death" : "Emotional Support"}`, duration: 2000 });
  };

  // Persist mode to localStorage when it changes (only when not null)
  useEffect(() => {
    if (mode) {
      localStorage.setItem("claire_mode", mode);
    }
  }, [mode]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showIAPModal, setShowIAPModal] = useState(false);
  const [showAfterDeathResources, setShowAfterDeathResources] = useState(false);
  // Guest mode allows users to access Claire without subscription - paywall shows when saving
  const [guestMode, setGuestMode] = useState(false);
  // Login required modal for save-related actions
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  // User ID for session tracking
  const [userId, setUserId] = useState<string | null>(null);
  // Emotional support session modals
  const [showSessionDisclosure, setShowSessionDisclosure] = useState(false);
  const [showSessionsExhausted, setShowSessionsExhausted] = useState(false);
  // Pending emotional action after disclosure
  const [pendingEmotionalPrompt, setPendingEmotionalPrompt] = useState<string | null>(null);
  // Track if the last message was an error (to show quick options)
  const [showErrorOptions, setShowErrorOptions] = useState(false);
  // Store the last user message for retry functionality
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  
  // Emotional support session tracking
  const emotionalSessions = useEmotionalSupportSessions(userId);

  useEffect(() => {
    checkCAREAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      const hasSeenWelcome = localStorage.getItem("claire_welcome_seen");
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [hasAccess]);

  const handleWelcomeClose = () => {
    localStorage.setItem("claire_welcome_seen", "true");
    setShowWelcome(false);
  };

  const checkCAREAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoggedIn(false);
        setUserId(null);
        setCheckingAccess(false);
        return;
      }
      setIsLoggedIn(true);
      setUserId(user.id);

      const { data: hasVIPAccess } = await supabase
        .rpc('has_vip_access', { _user_id: user.id });
      
      if (hasVIPAccess) {
        setHasAccess(true);
        setCheckingAccess(false);
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_type")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription?.plan_type === "vip_annual" || subscription?.plan_type === "vip_monthly") {
        setHasAccess(true);
      }
    } catch (error) {
      console.error("Error checking access:", error);
    } finally {
      setCheckingAccess(false);
    }
  };

  // Helper to check if user is logged in and show modal if not
  const requireLoginForSave = (): boolean => {
    if (!isLoggedIn) {
      setShowLoginRequiredModal(true);
      return false;
    }
    return true;
  };

  // Handle emotional support session logic
  const handleEmotionalModeSelect = () => {
    if (mode === "emotional") return; // Already in mode
    
    // If user has access and has sessions remaining, check for first-use disclosure
    if (emotionalSessions.hasAccess && emotionalSessions.sessionsRemaining > 0) {
      if (!emotionalSessions.firstSessionShown) {
        setShowSessionDisclosure(true);
      }
      // Use handleModeSelect for consistent first-message behavior
      handleModeSelect("emotional");
    } else if (emotionalSessions.hasAccess && emotionalSessions.sessionsRemaining <= 0) {
      // Show exhausted modal
      setShowSessionsExhausted(true);
    } else {
      // No access - use handleModeSelect (guest experience with first-message)
      handleModeSelect("emotional");
    }
  };

  // Handle starting an emotional support session (consumes a session)
  const startEmotionalSession = async (prompt: string) => {
    // Check if user has access and sessions
    if (!emotionalSessions.hasAccess || !isLoggedIn) {
      // Guest or no access - just proceed without tracking
      streamChat(prompt);
      return;
    }

    // Check for first-use disclosure
    if (!emotionalSessions.firstSessionShown) {
      setPendingEmotionalPrompt(prompt);
      setShowSessionDisclosure(true);
      return;
    }

    // Check remaining sessions
    if (emotionalSessions.sessionsRemaining <= 0) {
      setShowSessionsExhausted(true);
      return;
    }

    // Consume a session and proceed
    const consumed = await emotionalSessions.consumeSession();
    if (consumed) {
      streamChat(prompt);
    } else {
      toast({ title: "Unable to start session", description: "Please try again.", variant: "destructive" });
    }
  };

  // Handle disclosure continue
  const handleDisclosureContinue = async () => {
    await emotionalSessions.markFirstSessionShown();
    setShowSessionDisclosure(false);
    
    if (pendingEmotionalPrompt) {
      // Consume session and start chat
      const consumed = await emotionalSessions.consumeSession();
      if (consumed) {
        streamChat(pendingEmotionalPrompt);
      }
      setPendingEmotionalPrompt(null);
    }
  };

  const streamChat = async (userMessage: string, isRetry: boolean = false) => {
    // Store last message for retry functionality
    setLastUserMessage(userMessage);
    setShowErrorOptions(false);
    
    const newMessages: Message[] = [...messages.filter(m => !m.isError), { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Helper to add error message to chat inline
    const addErrorMessage = (errorMsg: string) => {
      const fallbackMessage = mode ? ERROR_FALLBACK_MESSAGES[mode] : GENERIC_ERROR_FALLBACK;
      setMessages(prev => [
        ...prev.filter(m => !m.isError),
        { role: "assistant", content: fallbackMessage, isError: true }
      ]);
      setShowErrorOptions(true);
    };

    // Helper to attempt the API call with timeout
    const attemptFetch = async (): Promise<Response> => {
      // For guest mode, use anon key; for logged-in users, use session token
      let authHeader: string;
      
      if (isLoggedIn) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("Session expired");
        }
        authHeader = `Bearer ${session.access_token}`;
      } else {
        // Guest mode - use anon key for basic chat (no save functionality)
        authHeader = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ messages: newMessages, mode }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };

    try {
      let response: Response;
      
      try {
        response = await attemptFetch();
      } catch (firstError) {
        // First attempt failed - log and retry after 1 second
        const errorMessage = firstError instanceof Error ? firstError.message : "Unknown error";
        logClaireError(mode, "FIRST_ATTEMPT", errorMessage, false);
        
        if (!isRetry) {
          // Wait 1 second and retry once
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            response = await attemptFetch();
          } catch (retryError) {
            const retryErrorMessage = retryError instanceof Error ? retryError.message : "Unknown error";
            logClaireError(mode, "RETRY_FAILED", retryErrorMessage, true);
            addErrorMessage(retryErrorMessage);
            setIsLoading(false);
            return;
          }
        } else {
          addErrorMessage(errorMessage);
          setIsLoading(false);
          return;
        }
      }

      // Check for HTTP errors
      if (!response.ok) {
        const errorCode = response.status;
        let errorMessage = "Request failed";
        
        if (errorCode === 429) {
          errorMessage = "Too many requests. Please wait a moment.";
        } else if (errorCode === 402) {
          errorMessage = "Service temporarily unavailable.";
        } else if (errorCode === 500 || errorCode === 502 || errorCode === 503) {
          errorMessage = "Service is temporarily busy.";
        }
        
        logClaireError(mode, errorCode, errorMessage, isRetry);
        
        // Retry once for server errors if this wasn't already a retry
        if (!isRetry && (errorCode >= 500 || errorCode === 429)) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return streamChat(userMessage, true);
        }
        
        addErrorMessage(errorMessage);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        logClaireError(mode, "NO_BODY", "No response body", isRetry);
        addErrorMessage("No response received");
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const filtered = prev.filter(m => !m.isError);
                const last = filtered[filtered.length - 1];
                if (last?.role === "assistant" && !last.isError) {
                  return filtered.map((m, i) => (i === filtered.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...filtered, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
      
      // Successful response - clear error state
      setShowErrorOptions(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logClaireError(mode, "CATCH_ALL", errorMessage, isRetry);
      
      // Retry once if this wasn't already a retry
      if (!isRetry) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return streamChat(userMessage, true);
      }
      
      addErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle retry from error options
  const handleRetry = () => {
    if (lastUserMessage) {
      setShowErrorOptions(false);
      // Remove the error message before retrying
      setMessages(prev => prev.filter(m => !m.isError));
      streamChat(lastUserMessage);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    streamChat(input);
    setInput("");
  };

  const handleTopicClick = (prompt: string) => {
    streamChat(prompt);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleGetCARESupport = async (lookupKey: string = "EFAVIPMONTHLY") => {
    if (isStoreIAP) {
      setShowIAPModal(true);
      return;
    }
    const successUrl = `${window.location.origin}/purchase-success?type=vip`;
    const cancelUrl = window.location.href;

    if (!isLoggedIn) {
      setPendingCheckout({
        lookupKey,
        successUrl,
        cancelUrl,
        postSuccessRedirect: "/care-support",
      });
      localStorage.setItem("efa_last_visited_route", location.pathname);
      navigate("/login");
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-create-checkout", {
        body: { lookupKey, successUrl, cancelUrl }
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast({
        title: "Error",
        description: "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Landing page removed - users go directly to Claire assistant
  // The guestMode state is no longer needed as entry gate, but kept for compatibility
  // Login is only required for save-related actions (handled by requireLoginForSave)
  
  // Show main assistant interface directly
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      
      <ClaireWelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      
      <div className="flex-1 bg-gradient-to-b from-background to-muted/30 px-4 py-2 md:py-4 md:px-8">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Compact header for mobile */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-1 text-xs px-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Planning Menu</span>
            </Button>
            <div className="flex items-center gap-1">
              <Heart className="h-5 w-5" style={{ color: 'hsl(175, 35%, 40%)' }} />
              <span className="text-lg font-serif font-semibold" style={{ color: 'hsl(215, 20%, 22%)' }}>Claire</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1 text-xs px-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

          {/* Claire Mode Selection Card - Soft sage identity */}
          <div 
            className="rounded-xl shadow-md border"
            style={{ 
              backgroundColor: 'hsl(140, 20%, 95%)',
              borderColor: 'hsl(140, 18%, 88%)'
            }}
          >
            <div className="p-4 md:p-6 space-y-4">
              {/* Claire Avatar and Introduction */}
              <div className="flex flex-col items-center text-center space-y-3">
                <img 
                  src={claireAvatar} 
                  alt="Claire - Your Support Assistant" 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-sm border-2"
                  style={{ borderColor: 'hsl(140, 18%, 85%)' }}
                />
                
                {/* Claire's First-Person Introduction */}
                <p 
                  className="text-xs uppercase tracking-wide font-medium"
                  style={{ color: 'hsl(175, 25%, 45%)' }}
                >
                  A note from Claire
                </p>
                <div 
                  className="space-y-2 text-base leading-relaxed max-w-md"
                  style={{ color: 'hsl(215, 20%, 25%)' }}
                >
                  <p className="font-medium" style={{ color: 'hsl(215, 20%, 20%)' }}>
                    Hi, I'm Claire.
                  </p>
                  <p>
                    I'm here to help you find your way through planning ahead, handling things after a death, or simply taking a moment to breathe.
                  </p>
                  <p>
                    You can explore guides and checklists on your own, or I can stay with you and help step by step when you'd like more support.
                  </p>
                  <p>
                    There's no rush. You're in control of what we do and when.
                  </p>
                </div>
              </div>
              
              <h3 
                className="font-semibold text-center text-lg pt-2"
                style={{ color: 'hsl(215, 20%, 22%)' }}
              >
                Select Your Mode
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Planning Ahead Button */}
                <button
                  onClick={() => handleModeSelect("planning")}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[56px] ${
                    mode === "planning"
                      ? "shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  style={{ 
                    backgroundColor: mode === "planning" ? 'hsl(175, 35%, 40%)' : 'hsl(0, 0%, 100%)',
                    borderColor: mode === "planning" ? 'hsl(175, 35%, 35%)' : 'hsl(30, 8%, 75%)',
                    color: mode === "planning" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 22%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: mode === "planning" ? 'hsl(0, 0%, 100%)' : 'hsl(175, 35%, 40%)' }} />
                    <span className="font-medium">Planning Ahead</span>
                  </div>
                </button>

                {/* After a Death Button */}
                <button
                  onClick={() => handleModeSelect("afterdeath")}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[56px] ${
                    mode === "afterdeath"
                      ? "shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  style={{ 
                    backgroundColor: mode === "afterdeath" ? 'hsl(175, 35%, 40%)' : 'hsl(0, 0%, 100%)',
                    borderColor: mode === "afterdeath" ? 'hsl(175, 35%, 35%)' : 'hsl(30, 8%, 75%)',
                    color: mode === "afterdeath" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 22%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 flex-shrink-0" style={{ color: mode === "afterdeath" ? 'hsl(0, 0%, 100%)' : 'hsl(175, 35%, 40%)' }} />
                    <span className="font-medium">After a Death</span>
                  </div>
                </button>

                {/* Emotional Support Button */}
                <button
                  onClick={handleEmotionalModeSelect}
                  className={`p-3 rounded-lg border-2 transition-all text-left min-h-[56px] ${
                    mode === "emotional"
                      ? "shadow-md"
                      : "hover:shadow-sm"
                  }`}
                  style={{ 
                    backgroundColor: mode === "emotional" ? 'hsl(175, 35%, 40%)' : 'hsl(0, 0%, 100%)',
                    borderColor: mode === "emotional" ? 'hsl(175, 35%, 35%)' : 'hsl(30, 8%, 75%)',
                    color: mode === "emotional" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 22%)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 flex-shrink-0" style={{ color: mode === "emotional" ? 'hsl(0, 0%, 100%)' : 'hsl(175, 35%, 40%)' }} />
                    <span className="font-medium">Emotional Support</span>
                    {emotionalSessions.hasAccess && emotionalSessions.sessionsRemaining > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs ml-auto"
                        style={{ 
                          backgroundColor: mode === "emotional" ? 'hsl(175, 35%, 50%)' : 'hsl(30, 8%, 85%)',
                          color: mode === "emotional" ? 'hsl(0, 0%, 100%)' : 'hsl(215, 20%, 25%)'
                        }}
                      >
                        {emotionalSessions.sessionsRemaining} sessions
                      </Badge>
                    )}
                  </div>
                </button>
              </div>

              {/* Helper text - access info */}
              <p 
                className="text-sm text-center pt-3 border-t"
                style={{ 
                  color: 'hsl(215, 15%, 40%)',
                  borderColor: 'hsl(140, 15%, 85%)'
                }}
              >
                Access guides and checklists for free.<br />
                If you'd like help filling things out, saving your work, or being guided step by step, personal support is available.
              </p>
            </div>
          </div>
          {/* Note: Mode-specific quick action buttons moved to suggestion chips after Claire's first message */}
          
          {/* After-Death Resources Response */}
          {showAfterDeathResources && messages.length === 0 && (
            <Card className="border-none shadow-lg">
              <CardContent className="p-4">
                <AfterDeathResourcesResponse />
              </CardContent>
            </Card>
          )}

          <Card className="border-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              {/* Only show chat area when there are messages or loading */}
              {(messages.length > 0 || isLoading) && (
                <div 
                  className="space-y-3 pr-2"
                  style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                    {messages.map((msg, i) => {
                      const isAssistant = msg.role === "assistant";
                      const prevMsg = messages[i - 1];
                      const showAvatar = isAssistant && (!prevMsg || prevMsg.role !== "assistant");
                      
                      // Show suggestion chips after Claire's first welcome message
                      const isFirstWelcomeMessage = i === 0 && isAssistant && messages.length === 1;
                      const suggestions = mode === "planning" ? PLANNING_SUGGESTIONS 
                        : mode === "afterdeath" ? AFTERDEATH_SUGGESTIONS 
                        : mode === "emotional" ? EMOTIONAL_SUGGESTIONS 
                        : [];
                      
                      return (
                        <div key={i}>
                          <div
                            className={`flex items-start gap-3 ${
                              isAssistant ? "mr-4" : "ml-8 justify-end"
                            }`}
                          >
                            {/* Claire avatar - only on first message in sequence */}
                            {isAssistant && (
                              <div className="flex-shrink-0 w-8">
                                {showAvatar && (
                                  <img 
                                    src={claireAvatar} 
                                    alt="Claire" 
                                    className="w-8 h-8 rounded-full object-cover shadow-sm border"
                                    style={{ borderColor: 'hsl(140, 18%, 85%)' }}
                                  />
                                )}
                              </div>
                            )}
                            
                            {/* Message bubble */}
                            <div
                              className={`p-4 rounded-xl max-w-[85%] ${
                                isAssistant 
                                  ? msg.isError ? "" : "shadow-sm"
                                  : "bg-primary/10"
                              }`}
                              style={isAssistant ? { 
                                backgroundColor: msg.isError ? 'hsl(45, 80%, 96%)' : '#EEF4F1',
                                boxShadow: msg.isError ? '0 1px 3px rgba(180, 140, 50, 0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                                borderLeft: msg.isError ? '3px solid hsl(45, 70%, 55%)' : undefined
                              } : undefined}
                            >
                              <p 
                                className="text-base leading-relaxed whitespace-pre-wrap"
                                style={{ color: msg.isError ? 'hsl(30, 30%, 30%)' : 'hsl(215, 20%, 22%)' }}
                              >
                                {msg.content}
                              </p>
                            </div>
                          </div>
                          
                          {/* Suggestion chips after first welcome message */}
                          {isFirstWelcomeMessage && suggestions.length > 0 && (
                            <div className="mt-4 ml-11 space-y-3">
                              {/* Intro text for Planning and Emotional modes only */}
                              {(mode === "planning" || mode === "emotional") && (
                                <p 
                                  className="text-sm font-medium"
                                  style={{ color: 'hsl(215, 20%, 35%)' }}
                                >
                                  {mode === "planning" ? PLANNING_INTRO_TEXT : EMOTIONAL_INTRO_TEXT}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion) => (
                                  <button
                                    key={suggestion.label}
                                    onClick={() => {
                                      if (suggestion.navigateTo) {
                                        navigate(suggestion.navigateTo);
                                      } else if (suggestion.prompt) {
                                        if (mode === "emotional") {
                                          startEmotionalSession(suggestion.prompt);
                                        } else {
                                          handleTopicClick(suggestion.prompt);
                                        }
                                      }
                                    }}
                                    disabled={isLoading}
                                    className="px-3 py-2 text-sm rounded-full border transition-colors hover:bg-muted/50 disabled:opacity-50"
                                    style={{
                                      borderColor: 'hsl(175, 25%, 75%)',
                                      color: 'hsl(175, 35%, 35%)',
                                      backgroundColor: 'hsl(0, 0%, 100%)'
                                    }}
                                  >
                                    {suggestion.label}
                                  </button>
                                ))}
                              </div>
                              <p 
                                className="text-sm"
                                style={{ color: 'hsl(215, 15%, 50%)' }}
                              >
                                Or type anything you'd like to ask.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {isLoading && (
                      <div className="flex items-center gap-3 mr-4">
                        <div className="w-8 flex-shrink-0">
                          <img 
                            src={claireAvatar} 
                            alt="Claire" 
                            className="w-8 h-8 rounded-full object-cover shadow-sm border"
                            style={{ borderColor: 'hsl(140, 18%, 85%)' }}
                          />
                        </div>
                        <div 
                          className="p-4 rounded-xl shadow-sm"
                          style={{ backgroundColor: '#EEF4F1' }}
                        >
                          <div className="flex items-center gap-2" style={{ color: 'hsl(215, 15%, 45%)' }}>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Claire is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Quick Options - shown when there's an error */}
                    {showErrorOptions && !isLoading && (
                      <div 
                        className="mt-4 ml-11 space-y-3"
                        style={{
                          height: 'auto',
                          overflow: 'visible',
                        }}
                      >
                        <div className="flex flex-wrap gap-2" style={{ overflow: 'visible' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            Try again
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowErrorOptions(false);
                              const defaultPrompt = mode === "planning" 
                                ? "What are common planning questions?" 
                                : mode === "afterdeath" 
                                  ? "What are the most common questions after a death?"
                                  : "What do people commonly ask about grief?";
                              streamChat(defaultPrompt);
                            }}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            Show common questions
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = '/guides/EFA-After-Death-Planner-and-Checklist.pdf';
                              link.download = 'After-Death-Guide.pdf';
                              link.click();
                            }}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download After Death Guide
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/contact")}
                            className="rounded-full"
                            style={{
                              borderColor: 'hsl(175, 25%, 65%)',
                              color: 'hsl(175, 35%, 30%)'
                            }}
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Talk to a real person
                          </Button>
                        </div>
                      </div>
                    )}
                </div>
              )}


              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={() => {
                      setIsRecording(!isRecording);
                      toast({
                        title: isRecording ? "Recording stopped" : "Recording started",
                        description: isRecording ? "Processing your voice..." : "Speak now",
                      });
                    }}
                    disabled={isLoading}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsTTSEnabled(!isTTSEnabled)}
                  >
                    {isTTSEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Claire a question..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="resize-none h-10 py-2"
                    rows={1}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    Send
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-2 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  You can close this anytime.
                </p>
                <button 
                  onClick={() => {
                    if (requireLoginForSave()) {
                      navigate("/saved-summaries");
                    }
                  }}
                  className="text-xs text-primary hover:underline block mx-auto"
                >
                  View your saved summaries
                </button>
                <p className="text-xs text-muted-foreground/70">
                  Claire provides planning guidance and educational support. She does not provide legal, medical, or financial advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AppFooter />
      <ClaireWelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      <StoreIAPModal open={showIAPModal} onOpenChange={setShowIAPModal} />
      
      {/* Login Required Modal for save-related actions */}
      <Dialog open={showLoginRequiredModal} onOpenChange={setShowLoginRequiredModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Sign in to save</DialogTitle>
            <DialogDescription className="text-center pt-2">
              To save or edit your plan later, please sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                setShowLoginRequiredModal(false);
                navigate("/login");
              }}
              className="min-h-[48px]"
            >
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowLoginRequiredModal(false)}
              className="min-h-[48px]"
            >
              Continue without saving
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emotional Support Session Disclosure Modal (first use) */}
      <Dialog open={showSessionDisclosure} onOpenChange={setShowSessionDisclosure}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Guided Emotional Support
            </DialogTitle>
            <DialogDescription className="text-center pt-4 space-y-3">
              <p>
                Emotional support is provided in guided sessions.
              </p>
              <p className="font-medium text-foreground">
                You have {emotionalSessions.sessionsRemaining} sessions available for this period.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={handleDisclosureContinue}
              className="min-h-[48px]"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emotional Support Sessions Exhausted Modal */}
      <Dialog open={showSessionsExhausted} onOpenChange={setShowSessionsExhausted}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Sessions Used</DialogTitle>
            <DialogDescription className="text-center pt-4 space-y-3">
              <p>
                You've used your emotional support sessions for this period.
              </p>
              <p>
                I can still help with guides and practical next steps.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              onClick={() => {
                setShowSessionsExhausted(false);
                navigate("/resources");
              }}
              className="min-h-[48px] gap-2"
            >
              <BookOpen className="h-4 w-4" />
              View Guides
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowSessionsExhausted(false);
                navigate("/contact");
              }}
              className="min-h-[48px] gap-2"
            >
              <Phone className="h-4 w-4" />
              Contact Us for More Support
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            We'll review your request and follow up personally.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
