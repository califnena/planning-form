import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Sparkles, ArrowRight, Mic, Volume2, VolumeX, Home, LogOut, CheckCircle, HelpCircle, MessageCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { setPendingCheckout } from "@/lib/pendingCheckout";
import { ClaireWelcomeModal } from "@/components/assistant/ClaireWelcomeModal";

type Message = { role: "user" | "assistant"; content: string };
type Mode = "planning" | "emotional";

const TOPICS = [
  { label: "🌺 My Funeral Wishes", prompt: "Help me document my funeral wishes." },
  { label: "🕊 Writing My Legacy Letter", prompt: "Help me write a legacy letter to my family." },
  { label: "🪷 Coping with Grief", prompt: "I'm feeling overwhelmed and need gentle support." },
  { label: "💼 Organizing My Documents", prompt: "Help me organize important documents and passwords." },
];

const QUICK_ACTIONS = [
  { label: "Help me understand my options", prompt: "Can you help me understand my planning options?", icon: HelpCircle },
  { label: "Help me continue my plan", prompt: "I want to continue working on my plan.", icon: FileText },
  { label: "I have a question", prompt: "I have a question about planning.", icon: MessageCircle },
  { label: "I need more support", prompt: "I'm feeling overwhelmed and need support.", icon: Heart },
];

export default function CareSupport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("planning");
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

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

  const streamChat = async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/coach-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

  // No access - show full landing page
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
        <GlobalHeader />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="container max-w-4xl mx-auto px-4 py-12 md:py-16 text-center">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-3">
                <Heart className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-serif font-bold">CARE Support</h1>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Personal planning help, guidance, and coping support
              </p>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Extra help when planning feels overwhelming. Available when you need it.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => handleGetCARESupport()}
                  disabled={isCheckoutLoading}
                  size="lg"
                  className="min-h-[56px] text-lg px-8"
                >
                  {isCheckoutLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Get CARE Support
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/claire-faq")}
                  className="min-h-[56px] text-lg"
                >
                  Talk to Claire
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
                  I'm here to help you with planning, one step at a time.
                </p>
                <p className="text-muted-foreground">
                  Claire is your planning assistant. She helps explain things clearly and calmly, without rushing you.
                </p>
                
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/claire-faq")}
                  className="mt-4 min-h-[48px]"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Talk to Claire
                </Button>
                
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
                    <span>Helping you stay organized</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Guiding you when things feel overwhelming</span>
                  </li>
                </ul>
                
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Claire does not replace a lawyer, doctor, or financial professional. She is here to support you as you plan.
                </p>
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
      
      <div className="flex-1 bg-gradient-to-b from-background to-muted/30 p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Planning Menu
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                <CardTitle className="text-3xl font-serif">Talk to Claire</CardTitle>
              </div>
              <CardDescription className="text-base">
                Hi, it's Claire. What would you like help with today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick actions when no messages */}
              {messages.length === 0 && (
                <div className="space-y-3">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      onClick={() => handleTopicClick(action.prompt)}
                      disabled={isLoading}
                    >
                      <action.icon className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
                      <span>{action.label}</span>
                    </Button>
                  ))}
                </div>
              )}

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-center">Select Your Mode:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode("planning")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      mode === "planning"
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">🗂 Planning Mode</span>
                    </div>
                    <p className="text-xs text-left text-muted-foreground">
                      Get help organizing your funeral wishes, legal documents, and final instructions
                    </p>
                  </button>

                  <button
                    onClick={() => setMode("emotional")}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      mode === "emotional"
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">💛 Emotional Support</span>
                    </div>
                    <p className="text-xs text-left text-muted-foreground">
                      Receive compassionate guidance for managing grief, anxiety, and difficult emotions
                    </p>
                  </button>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-center">
                  <span className="font-medium">Current mode:</span>{" "}
                  <span className="text-primary font-semibold">
                    {mode === "planning" ? "🗂 Planning Mode" : "💛 Emotional Support Mode"}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 space-y-4">
              <ScrollArea className="h-[400px] pr-4">
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

              <div className="grid grid-cols-2 gap-2">
                {TOPICS.map((topic) => (
                  <Button
                    key={topic.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTopicClick(topic.prompt)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {topic.label}
                  </Button>
                ))}
              </div>

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
                <p className="text-xs text-muted-foreground/70">
                  Claire provides planning guidance and educational support. She does not provide legal, medical, or financial advice.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
