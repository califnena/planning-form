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
import { Loader2, Heart, Sparkles, ArrowRight, Mic, Volume2, VolumeX, Home, LogOut, CheckCircle, HelpCircle, MessageCircle, FileText, ClipboardCheck, Lock, Phone, Download, ArrowRightCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { setPendingCheckout } from "@/lib/pendingCheckout";
import { ClaireWelcomeModal } from "@/components/assistant/ClaireWelcomeModal";
import NotAdviceNote from "@/components/NotAdviceNote";
import { requireSessionOrRedirect } from "@/lib/sessionGuard";
import { isStoreIAP } from "@/lib/billingMode";
import { StoreIAPModal } from "@/components/StoreIAPModal";
import { AfterDeathResourcesResponse } from "@/components/assistant/AfterDeathResourcesResponse";
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
        setCheckingAccess(false);
        return;
      }
      setIsLoggedIn(true);

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

  // No access and not in guest mode - show full landing page
  if (!hasAccess && !guestMode) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
        <GlobalHeader />
        
        <main className="flex-1">
          <NotAdviceNote />
          
          {/* Hero Section */}
          <section className="container max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Heart className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-serif font-bold">CARE Support</h1>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Planning guidance, emotional support, and after-death help. Available 24/7.
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Claire helps with planning ahead and guides families after a death has occurred.
                She explains next steps, answers questions, and provides calm support.
                Claire is available 24/7, wherever you are.
              </p>
              
              <p className="text-base text-muted-foreground max-w-xl mx-auto pt-2">
                CARE Support is guided help for planning ahead, after a death, or emotional support.
                Choose a mode so Claire gives the right kind of help.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => setGuestMode(true)}
                  size="lg"
                  className="min-h-[56px] text-lg px-8"
                >
                  Start Claire
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/claire-faq")}
                  className="min-h-[56px] text-lg"
                >
                  Read CARE & Claire FAQs
                </Button>
              </div>
            </div>
          </section>

          {/* You don't have to do this alone */}
          <section className="bg-muted/30 py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
                You don't have to do this alone
              </h2>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                Planning ahead can feel confusing or heavy. CARE Support is here to help you think things through, one step at a time.
              </p>
              
              <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm space-y-4">
                <p className="font-medium text-lg">With CARE Support, you can:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Ask questions as they come up</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Get help understanding your options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Take breaks and come back anytime</span>
                  </li>
                </ul>
                <p className="text-muted-foreground text-center pt-4 font-medium">
                  There is no rush and no pressure.
                </p>
              </div>
            </div>
          </section>

          {/* Meet Claire */}
          <section className="py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold">Meet Claire</h2>
              
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 md:p-8 space-y-4">
                <p className="text-xl">
                  Hi, I'm Claire.
                </p>
                <p className="text-lg text-muted-foreground">
                  I'm here to help — whether you're planning ahead or have recently lost someone.
                </p>
                <p className="text-muted-foreground">
                  I provide planning support before a death, and emotional and practical guidance after.
                  I'm available 24/7, anywhere you are.
                </p>
                
                {/* Duplicate CTA removed - FAQ link is in hero section */}
                
                <p className="text-sm text-muted-foreground pt-2">
                  You're always in control of what you do next.
                </p>
              </div>
            </div>
          </section>

          {/* What Claire can help with */}
          <section className="bg-muted/30 py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
                What Claire can help with
              </h2>
              
              <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Understanding planning steps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Reviewing your choices</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Answering general questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>After-death guidance and next steps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Helping families stay oriented</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Emotional reassurance when things feel overwhelming</span>
                  </li>
                </ul>
                
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Claire does not replace a lawyer, doctor, or financial professional. She is here to support you as you plan.
                </p>
                
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg mt-4">
                  <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <strong>Privacy:</strong> Claire can save a short planning summary only if you ask. She does not store personal details or remember conversations unless you choose to save a summary.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Support After a Death */}
          <section className="py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
                Support After a Death
              </h2>
              
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 md:p-8 space-y-4">
                <p className="text-lg text-center">
                  When a death has already occurred, Claire can help guide you through what comes next.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Guidance on immediate next steps</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Help with notifications and common questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Calm, compassionate support at your pace</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground text-center pt-4">
                  Claire does not replace legal or funeral professionals. She provides guidance and emotional support.
                </p>
              </div>
              
              {/* 24/7 Callout */}
              <div className="bg-primary/10 rounded-xl p-6 text-center">
                <p className="text-lg font-medium text-primary">
                  Claire is available 24/7, anywhere you are.
                </p>
              </div>
            </div>
          </section>

          {/* How Claire Can Help Beyond Planning */}
          <section className="bg-muted/30 py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
                How Claire Can Help Beyond Planning
              </h2>
              
              <div className="bg-background rounded-xl p-6 md:p-8 shadow-sm space-y-6">
               {/* Memory & Privacy Disclosure */}
               <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                 <p className="text-sm text-primary">
                   Claire remembers planning information you choose to save. Conversations are private.
                 </p>
               </div>
               
                <p className="text-muted-foreground text-center">
                  When it naturally relates to your question or situation, Claire may mention 
                  Everlasting Funeral Advisors services that could be helpful. All services are 
                  completely optional — there is no pressure and nothing is ever required.
                </p>
                
                <div className="space-y-4">
                  <p className="font-medium text-center">Examples Claire may reference when appropriate:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Affordable funeral and memorial options</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Planning binders for organizing documents</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Custom remembrance songs</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Tribute or memory videos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Help writing a eulogy or personal message</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Restoring or cleaning up old photos</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Planning tools and educational resources</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm text-muted-foreground italic">
                    Claire only mentions services when they naturally relate to your question or situation.
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    You are never required to use these services.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6 text-center">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold">How it works</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <p className="font-medium">You add CARE Support</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <p className="font-medium">You can talk to Claire anytime</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <p className="font-medium">You go at your own pace</p>
                </div>
              </div>
              
              <p className="text-muted-foreground">
                That's it. There are no deadlines and no required steps.
              </p>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-muted/30 py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-8">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
                CARE Support Options
              </h2>
              
              <div className="space-y-4">
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">CARE Support (Monthly)</h3>
                        <p className="text-muted-foreground">Ongoing planning help and guidance</p>
                      </div>
                      <Badge variant="outline">Cancel anytime</Badge>
                    </div>
                    <Button 
                      onClick={() => handleGetCARESupport("EFAVIPMONTHLY")}
                      disabled={isCheckoutLoading}
                      className="w-full min-h-[48px]"
                    >
                      Add CARE Support
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-semibold">CARE Support (Yearly)</h3>
                        <p className="text-muted-foreground">Same support at a lower yearly cost</p>
                      </div>
                      <Badge variant="outline">Cancel anytime</Badge>
                    </div>
                    <Button 
                      onClick={() => handleGetCARESupport("EFAVIPYEAR")}
                      disabled={isCheckoutLoading}
                      variant="outline"
                      className="w-full min-h-[48px]"
                    >
                      Add CARE Support
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <p className="text-center text-muted-foreground text-sm">
                You can change or cancel at any time from your account.
              </p>
            </div>
          </section>

          {/* Reassurance */}
          <section className="py-12 md:py-16">
            <div className="container max-w-3xl mx-auto px-4 space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
                A few things to know
              </h2>
              
              <div className="bg-muted/30 rounded-xl p-6 md:p-8 space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>CARE Support is optional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You are never locked in</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You can stop and restart anytime</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>You stay in control of your planning</span>
                  </li>
                </ul>
                
                <p className="text-center text-muted-foreground pt-4">
                  This service exists to support you, not pressure you.
                </p>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="bg-primary/5 py-12 md:py-16">
            <div className="container max-w-2xl mx-auto px-4 text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-serif font-semibold">
                Ready to add extra support?
              </h2>
              
              <Button 
                onClick={() => handleGetCARESupport()}
                disabled={isCheckoutLoading}
                size="lg"
                className="min-h-[56px] text-lg px-8"
              >
                {isCheckoutLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Get CARE Support"
                )}
              </Button>
              
              <button 
                onClick={() => navigate("/claire-faq")}
                className="text-primary hover:underline text-sm block mx-auto"
              >
                Ask Claire a question first
              </button>
            </div>
          </section>
        </main>

        {/* Footer disclaimer */}
        <div className="bg-muted/20 py-4">
          <p className="text-center text-sm text-muted-foreground px-4">
            Claire provides planning guidance and educational support. She does not provide legal, medical, or financial advice.
          </p>
        </div>
        
        <AppFooter />
      </div>
    );
  }

  // Has access - show Claire chat interface
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      
      <ClaireWelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      
      <div className="flex-1 bg-gradient-to-b from-background to-muted/30 px-4 py-3 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
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
              <Heart className="h-5 w-5 text-primary" />
              <span className="text-lg font-serif font-semibold">Claire</span>
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

          {/* Mode Selection - FIRST and prominent */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-center text-base">Select Your Mode:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    if (mode !== "planning") {
                      setMode("planning");
                      toast({ title: "Switched to: Planning Ahead", duration: 2000 });
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    mode === "planning"
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">Planning Ahead</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (mode !== "afterdeath") {
                      setMode("afterdeath");
                      toast({ title: "Switched to: After a Death", duration: 2000 });
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    mode === "afterdeath"
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">After a Death</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (mode !== "emotional") {
                      setMode("emotional");
                      toast({ title: "Switched to: Emotional Support", duration: 2000 });
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    mode === "emotional"
                      ? "border-primary bg-primary/10 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">Emotional Support</span>
                  </div>
                </button>
              </div>

              {/* Helper text */}
              <p className="text-sm text-muted-foreground text-center">
                Tap an option above, or type a question below.
              </p>
            </CardContent>
          </Card>

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
                          handleTopicClick(action.prompt);
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
    </div>
  );
}
