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

type Message = { role: "user" | "assistant"; content: string };
type Mode = "planning" | "afterdeath" | "emotional" | null;


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
  { label: "Download After Death Guide", downloadUrl: "/guides/EFA-After-Death-Planner-and-Checklist.pdf", icon: Download },
  { label: "Download After Death Planner", downloadUrl: "/guides/After-Life-Action-Plan-BLANK.pdf", icon: Download },
  { label: "Walk me through what to do next", prompt: "Someone has passed away. Can you walk me through what I need to do next, step by step?", icon: ArrowRightCircle },
  { label: "Talk to a real person", navigateTo: "/contact", icon: Phone },
];

const EMOTIONAL_ACTIONS: QuickAction[] = [
  { label: "I'm feeling overwhelmed", prompt: "I'm feeling overwhelmed and could use some support.", icon: Heart },
  { label: "Help me cope with grief", prompt: "I'm grieving and need some gentle guidance.", icon: Heart },
  { label: "I just need someone to listen", prompt: "I just need someone to listen right now.", icon: MessageCircle },
  { label: "Talk to a real person", navigateTo: "/contact", icon: Phone },
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
      setMode("emotional");
      toast({ title: "Switched to: Emotional Support", duration: 2000 });
    } else if (emotionalSessions.hasAccess && emotionalSessions.sessionsRemaining <= 0) {
      // Show exhausted modal
      setShowSessionsExhausted(true);
    } else {
      // No access - just switch mode (guest experience)
      setMode("emotional");
      toast({ title: "Switched to: Emotional Support", duration: 2000 });
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

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // For guest mode, use anon key; for logged-in users, use session token
      let authHeader: string;
      
      if (isLoggedIn) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          toast({ title: "Session expired", description: "Please sign in again.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        authHeader = `Bearer ${session.access_token}`;
      } else {
        // Guest mode - use anon key for basic chat (no save functionality)
        authHeader = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({ messages: newMessages, mode }),
      });

      if (!response.ok || !response.body) throw new Error("Failed to start stream");

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
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
                  onClick={() => {
                    if (mode !== "planning") {
                      setMode("planning");
                      toast({ title: "Switched to: Planning Ahead", duration: 2000 });
                    }
                  }}
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
                  onClick={() => {
                    if (mode !== "afterdeath") {
                      setMode("afterdeath");
                      toast({ title: "Switched to: After a Death", duration: 2000 });
                    }
                  }}
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

          {/* GUARDRAIL: Mode-specific actions - ONLY shown when mode is explicitly selected */}
          {mode !== null && messages.length === 0 && !showAfterDeathResources && (
            <Card className="border-none shadow-lg">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm text-center text-muted-foreground mb-2">
                  Current mode: <span className="font-medium text-foreground">
                    {mode === "planning" ? "Planning Ahead" : mode === "afterdeath" ? "After a Death" : "Emotional Support"}
                  </span>
                </p>
                <div className="space-y-2">
                  {(mode === "afterdeath" ? AFTERDEATH_ACTIONS : mode === "emotional" ? EMOTIONAL_ACTIONS : PLANNING_ACTIONS).map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => {
                        if (action.downloadUrl) {
                          const link = document.createElement('a');
                          link.href = action.downloadUrl;
                          link.download = '';
                          link.click();
                        } else if (action.showAfterDeathResources) {
                          setShowAfterDeathResources(true);
                        } else if (action.navigateTo) {
                          navigate(action.navigateTo);
                        } else if (action.prompt) {
                          // Use session-aware handler for emotional mode
                          if (mode === "emotional") {
                            startEmotionalSession(action.prompt);
                          } else {
                            handleTopicClick(action.prompt);
                          }
                        }
                      }}
                      disabled={isLoading && !action.navigateTo && !action.showAfterDeathResources && !action.downloadUrl}
                    >
                      <action.icon className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
                      <span>{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
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
                <ScrollArea className="max-h-[400px] pr-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-primary/10 ml-8"
                            : "bg-muted mr-8"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Claire is thinking...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
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
