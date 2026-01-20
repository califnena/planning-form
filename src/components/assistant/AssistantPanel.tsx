import { useState, useEffect, useRef } from "react";
import { isAuthExpiredError } from "@/lib/sessionGuard";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  HelpCircle, 
  Send, 
  Trash2, 
  Loader2,
  MessageCircle,
  X,
  Heart,
  FileText,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingModal } from "./BookingModal";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Quick action buttons for seniors
const QUICK_ACTIONS = [
  { 
    label: "I'm planning ahead", 
    prompt: "I'm planning ahead for myself or a loved one.",
    icon: FileText 
  },
  { 
    label: "Someone has passed away", 
    prompt: "Someone has passed away and I need guidance.",
    icon: Heart 
  },
  { 
    label: "I have a question", 
    prompt: "I have a question about planning or next steps.",
    icon: MessageCircle 
  },
  { 
    label: "I need more support", 
    prompt: "I'm feeling a bit overwhelmed and could use some extra support.",
    icon: HelpCircle 
  },
];

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [hasCAREAccess, setHasCAREAccess] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      checkAccessAndLoad();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const checkAccessAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHasCAREAccess(false);
        return;
      }

      // Check for CARE Support access
      const { data: hasVIPAccess } = await supabase
        .rpc('has_vip_access', { _user_id: user.id });
      
      if (hasVIPAccess) {
        setHasCAREAccess(true);
        loadOrCreateConversation();
        return;
      }

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("plan_type")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (subscription?.plan_type === "vip_annual" || subscription?.plan_type === "vip_monthly") {
        setHasCAREAccess(true);
        loadOrCreateConversation();
      } else {
        setHasCAREAccess(false);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setHasCAREAccess(false);
    }
  };

  const loadOrCreateConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Try to get existing open conversation
      let { data: conversations } = await supabase
        .from('assistant_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1);

      let convId = conversations?.[0]?.id;

      // Create new conversation if none exists
      if (!convId) {
        const { data: newConv } = await supabase
          .from('assistant_conversations')
          .insert({ user_id: user.id, status: 'open' })
          .select('id')
          .single();
        
        convId = newConv?.id;
      }

      setConversationId(convId || null);

      // Load messages
      if (convId) {
        const { data: msgs } = await supabase
          .from('assistant_messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true });

        if (msgs) {
          setMessages(msgs as Message[]);
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend || !conversationId) return;

    if (!customMessage) setInput("");
    setIsLoading(true);

    try {
      // Save user message
      const { data: userMsg } = await supabase
        .from('assistant_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: messageToSend
        })
        .select()
        .single();

      if (userMsg) {
        setMessages(prev => [...prev, userMsg as Message]);
      }

      // Search KB
      const searchResponse = await supabase.functions.invoke('kb-search', {
        body: { query: messageToSend }
      });

      let context = "";
      if (searchResponse.data?.faqs?.length > 0) {
        context += "\n\nRelevant FAQs:\n";
        searchResponse.data.faqs.forEach((faq: any) => {
          context += `Q: ${faq.title}\nA: ${faq.snippet}\n\n`;
        });
      }
      if (searchResponse.data?.kb?.length > 0) {
        context += "\n\nKnowledge Base Articles:\n";
        searchResponse.data.kb.forEach((kb: any) => {
          context += `${kb.title}: ${kb.snippet}\n\n`;
        });
      }

      // Get session for auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      
      if (!accessToken) {
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // Stream AI response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: messageToSend + context }
          ],
          conversationId
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to get response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let textBuffer = "";

      // Create placeholder message
      const placeholderId = crypto.randomUUID();
      setMessages(prev => [...prev, {
        id: placeholderId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString()
      }]);

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
              setMessages(prev => prev.map(m => 
                m.id === placeholderId 
                  ? { ...m, content: assistantContent }
                  : m
              ));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save final assistant message
      const { data: savedMsg } = await supabase
        .from('assistant_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent
        })
        .select()
        .single();

      if (savedMsg) {
        setMessages(prev => prev.map(m => 
          m.id === placeholderId ? savedMsg as Message : m
        ));
      }

    } catch (error) {
      console.error('Chat error:', error);
      if (isAuthExpiredError(error)) {
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Message failed",
          description: "Please try again. If it keeps happening, contact support.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('assistant_conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      setMessages([]);
      setConversationId(null);
      loadOrCreateConversation();
      
      toast({
        title: "Chat history deleted",
        description: "Your conversation has been cleared.",
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat history.",
        variant: "destructive",
      });
    }
  };

  const handleGetCARESupport = () => {
    onClose();
    navigate("/care-support");
  };

  if (!isOpen) return null;

  // No CARE access - show upsell
  if (hasCAREAccess === false) {
    return (
      <Card ref={panelRef} className="fixed bottom-24 right-6 w-[380px] shadow-2xl z-40 flex flex-col md:bottom-8 md:right-24">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Talk to Claire
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pb-6">
          <div className="text-center space-y-3">
            <p className="text-lg font-medium">
              Hi, I'm Claire.
            </p>
            <p className="text-muted-foreground text-sm">
              I help with planning ahead — or after a loss.
            </p>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Claire is available with CARE Support.
            </p>
          </div>

          <Button 
            onClick={handleGetCARESupport}
            size="lg"
            className="w-full min-h-[48px]"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Get CARE Support
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You can close this anytime.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (hasCAREAccess === null) {
    return (
      <Card ref={panelRef} className="fixed bottom-24 right-6 w-[380px] h-[400px] shadow-2xl z-40 flex items-center justify-center md:bottom-8 md:right-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <>
      <Card ref={panelRef} className="fixed bottom-24 right-6 w-[380px] h-[600px] shadow-2xl z-40 flex flex-col md:bottom-8 md:right-24">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Talk to Claire
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground text-sm py-4">
                    <p className="text-base font-medium text-foreground">Hi, I'm Claire.</p>
                    <p className="mt-2">I'm here for planning ahead — or after a loss.</p>
                    <p className="mt-1">How can I help today?</p>
                  </div>
                  
                  {/* Quick action buttons for seniors */}
                  <div className="space-y-2">
                    {QUICK_ACTIONS.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4"
                        onClick={() => handleSend(action.prompt)}
                        disabled={isLoading}
                      >
                        <action.icon className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
                        <span className="text-sm">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "p-3 rounded-lg text-sm",
                    msg.role === "user"
                      ? "bg-primary/10 ml-8"
                      : "bg-muted mr-8"
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
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

          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none min-h-[60px]"
                rows={2}
              />
              <Button 
                onClick={() => handleSend()} 
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteHistory}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear history
              </Button>
              <span className="text-xs text-muted-foreground">
                You can close this anytime.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <BookingModal 
        isOpen={showBooking} 
        onClose={() => setShowBooking(false)} 
      />
    </>
  );
}
