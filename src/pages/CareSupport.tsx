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
import { Loader2, Heart, Sparkles, ArrowRight, Mic, Volume2, VolumeX, Home, LogOut } from "lucide-react";
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

  // Check if first time and show welcome modal
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

      // Check for CARE Support access via role-based system (uses same vip role)
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

  const handleGetCARESupport = async () => {
    const successUrl = `${window.location.origin}/purchase-success?type=vip`;
    const cancelUrl = window.location.href;

    if (!isLoggedIn) {
      setPendingCheckout({
        lookupKey: "EFAVIPMONTHLY",
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
        body: { lookupKey: "EFAVIPMONTHLY", successUrl, cancelUrl }
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

  // No access - show upsell page
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <GlobalHeader />
        <div className="flex-1 bg-gradient-to-b from-[#f7f5f2] to-[#e8e2dd] p-4 md:p-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
              {isLoggedIn && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
                  Dashboard
                </Button>
              )}
            </div>
            <Card className="border-none shadow-xl">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="h-8 w-8 text-primary" />
                  <CardTitle className="text-4xl font-serif">CARE Support</CardTitle>
                </div>
                <Badge className="mx-auto bg-gradient-to-r from-primary to-primary/80 text-white">
                  Personal Planning Assistance
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-lg font-medium">
                    Meet Claire — your personal planning assistant
                  </p>
                  <p className="text-muted-foreground">
                    Available whenever you need guidance through your planning journey.
                  </p>
                </div>

                {/* Clarity copy - first exposure */}
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    <strong>CARE Support</strong> is our planning support service.<br />
                    <strong>Claire</strong> is the name we use for your planning assistant.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    What You Get:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Planning Mode:</strong> Get guided through organizing your funeral wishes, legal documents, and final instructions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Emotional Support Mode:</strong> Receive compassionate guidance when dealing with grief, anxiety, or difficult emotions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Available Anytime:</strong> Claire is ready to help whenever you need it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span><strong>Private & Secure:</strong> All conversations are confidential</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleGetCARESupport}
                    disabled={isCheckoutLoading}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base min-h-[56px]"
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
                  <p className="text-center text-sm text-muted-foreground">
                    Personal planning help, coping support, and guidance when you need it.
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

  // Has access - show Claire chat interface
  return (
    <div className="min-h-screen flex flex-col">
      <GlobalHeader />
      
      {/* Claire Welcome Modal */}
      <ClaireWelcomeModal isOpen={showWelcome} onClose={handleWelcomeClose} />
      
      <div className="flex-1 bg-gradient-to-b from-[#f7f5f2] to-[#e8e2dd] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-none shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/preplansteps")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
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
            <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
              <p>
                I'm here to help you with planning, one step at a time. You can ask questions, think through decisions, or just take things slowly.
              </p>
              <p className="italic mt-2">Choose your mode below to get started.</p>
            </div>

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
                    Get help organizing your funeral wishes, legal documents, financial accounts, and final instructions
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

            {/* Disclaimers */}
            <div className="text-center space-y-2 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Your conversation is private and secure.
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
