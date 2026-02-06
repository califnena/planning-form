import { useState, useEffect, useRef } from "react";
import { isAuthExpiredError } from "@/lib/sessionGuard";
import { useNavigate, useLocation } from "react-router-dom";
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
  Sparkles,
  ClipboardCheck,
  Users,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingModal } from "./BookingModal";
import { AfterDeathResourcesResponse } from "./AfterDeathResourcesResponse";
import { Link } from "react-router-dom";
import { usePlanningCompletion } from "@/hooks/usePlanningCompletion";

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

// Mode types for Claire
type ClaireMode = 'planning' | 'after-death' | 'emotional' | null;

// Quick action buttons for seniors
type QuickAction = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt?: string;
  navigateTo?: string;
  showAfterDeathResources?: boolean;
};

// Mode-specific actions
const PLANNING_ACTIONS: QuickAction[] = [
  { 
    label: "My Funeral Wishes", 
    prompt: "I'd like help thinking through my funeral wishes.",
    icon: Heart 
  },
  { 
    label: "Writing My Legacy Letter", 
    prompt: "I'd like help writing a legacy letter to my loved ones.",
    icon: FileText 
  },
  { 
    label: "Organizing My Documents", 
    prompt: "I need help organizing my important documents for my family.",
    icon: ClipboardCheck 
  },
];

const AFTER_DEATH_ACTIONS: QuickAction[] = [
  { 
    label: "What to Do First", 
    prompt: "Someone has passed away. What should I do first?",
    icon: ClipboardCheck 
  },
  { 
    label: "After Death Checklist", 
    showAfterDeathResources: true,
    icon: FileText 
  },
  { 
    label: "Organizing Documents for Executor", 
    prompt: "I need help organizing documents for the executor of an estate.",
    icon: MessageCircle 
  },
];

const EMOTIONAL_ACTIONS: QuickAction[] = [
  { 
    label: "Coping with Grief", 
    prompt: "I'm struggling with grief. Can you help me understand what I'm feeling?",
    icon: Heart 
  },
  { 
    label: "Talk Through What I'm Feeling", 
    prompt: "I just need someone to talk to about what I'm going through.",
    icon: MessageCircle 
  },
  { 
    label: "I Need More Support", 
    prompt: "I need more support than I'm getting right now. What are my options?",
    icon: Users 
  },
];

// Helper to detect printable-related pages
const isPrintablePage = (pathname: string): boolean => {
  return pathname === '/forms' || pathname === '/printable-form';
};

// Helper to detect after-death related pages
const isAfterDeathPage = (pathname: string): boolean => {
  return pathname === '/next-steps' || 
         pathname === '/after-death' || 
         pathname === '/after-death-wizard' ||
         pathname.startsWith('/case/') ||
         pathname === '/preview-after-death';
};

// Get page context for Claire's behavior
const getPageContext = (pathname: string): string | undefined => {
  if (isAfterDeathPage(pathname)) return 'after-death';
  if (pathname === '/forms') return 'printable-download';
  if (pathname === '/printable-form') return 'printable-form';
  return undefined;
};

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [hasCAREAccess, setHasCAREAccess] = useState<boolean | null>(null);
  const [showAfterDeathResources, setShowAfterDeathResources] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ClaireMode>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Check if user has completed their planning
  const planningCompletion = usePlanningCompletion();

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

      // Determine page context for context-aware Claire behavior
      const pageContext = getPageContext(location.pathname);

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
          conversationId,
          pageContext
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
              {messages.length === 0 && !showAfterDeathResources && (
                <div className="space-y-3">
                  {/* Mode selection header */}
                  <div className="text-center py-1">
                    <p className="text-base font-medium text-foreground">How can I help you today?</p>
                  </div>
                  
                  {/* Mode selection buttons - show when no mode selected */}
                  {!selectedMode && (
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setSelectedMode('planning')}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Planning Ahead</p>
                          <p className="text-xs text-muted-foreground">Pre-plan for yourself or a loved one</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedMode('after-death')}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <Heart className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">After a Death</p>
                          <p className="text-xs text-muted-foreground">Guidance for immediate next steps</p>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => setSelectedMode('emotional')}
                        className="flex items-center gap-3 p-3 rounded-xl border-2 border-amber-200 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 transition-all text-left"
                      >
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Emotional Support</p>
                          <p className="text-xs text-muted-foreground">Someone to listen and help</p>
                        </div>
                      </button>
                    </div>
                  )}
                  
                  {/* Mode-specific actions - show after mode selected */}
                  {selectedMode && (
                    <div className="space-y-2">
                      {/* Current help type label */}
                      <p className="text-xs text-muted-foreground text-center mb-1">
                        Current help type: {selectedMode === 'after-death' ? 'After a Death' : 
                         selectedMode === 'planning' ? 'Planning Ahead' : 'Emotional Support'}
                      </p>
                      
                      {/* Back button to switch modes */}
                      <div className="flex justify-center mb-2">
                        <button 
                          onClick={() => setSelectedMode(null)}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          ← Change help type
                        </button>
                      </div>
                      
                      {/* Subtle note for After a Death mode */}
                      {selectedMode === 'after-death' && (
                        <p className="text-xs text-muted-foreground text-center italic pb-1">
                          You don't need to do everything at once.
                        </p>
                      )}
                      
                      {/* End-of-planning prompt for Planning Mode */}
                      {selectedMode === 'planning' && planningCompletion.isComplete && (
                        <div className="bg-accent/50 border border-border rounded-xl p-5 text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <CheckCircle2 className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <p className="text-base text-foreground leading-relaxed">
                            It looks like you've reached the end of this planner.<br />
                            Would you like to review and save what you've done?
                          </p>
                          <div className="flex flex-col gap-3 pt-2">
                            <Button
                              size="lg"
                              className="w-full py-6 text-base"
                              onClick={() => {
                                onClose();
                                navigate('/preplan-summary');
                              }}
                            >
                              Yes, review my plan
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full py-6 text-base"
                              onClick={() => {
                                onClose();
                                navigate('/planner/overview');
                              }}
                            >
                              No, I want to keep working
                            </Button>
                          </div>
                          {/* Gentle exit - no pressure dismissal */}
                          <button
                            onClick={onClose}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
                          >
                            Maybe later — just close for now
                          </button>
                        </div>
                      )}
                      
                      {/* Quick actions for after-death and emotional modes */}
                      {(selectedMode === 'after-death' || selectedMode === 'emotional') && (
                        (selectedMode === 'after-death' ? AFTER_DEATH_ACTIONS : EMOTIONAL_ACTIONS).map((action) => (
                          <Button
                            key={action.label}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-2.5 px-4"
                            onClick={() => {
                              if (action.showAfterDeathResources) {
                                setShowAfterDeathResources(true);
                              } else if (action.navigateTo) {
                                onClose();
                                navigate(action.navigateTo);
                              } else if (action.prompt) {
                                handleSend(action.prompt);
                              }
                            }}
                            disabled={isLoading && !action.navigateTo && !action.showAfterDeathResources}
                          >
                            <action.icon className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
                            <span className="text-sm">{action.label}</span>
                          </Button>
                        ))
                      )}
                    </div>
                  )}
                  
                  {/* Voice tip - compact, only show after mode selected */}
                  {selectedMode && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 text-center">
                      <p className="text-xs text-foreground">
                        Click the mic to speak, or type below.
                      </p>
                    </div>
                  )}
                  
                  {/* Memory disclosure - always visible but compact */}
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                   <p className="text-[11px] text-muted-foreground">
                     Claire remembers planning info you save. Conversations are private.
                   </p>
                 </div>
                </div>
              )}
              
              {/* After-Death Resources Response */}
              {showAfterDeathResources && messages.length === 0 && (
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowAfterDeathResources(false)}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    ← Back to options
                  </button>
                  <AfterDeathResourcesResponse onClose={onClose} />
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

          {/* Only show input area after a mode is selected or conversation has started */}
          {(selectedMode || messages.length > 0) && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center font-light">
                You can tap one of the options above, or type a question below.
              </p>
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question here, or choose an option above."
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
            </div>
          )}

          {/* Footer actions - always visible */}
          <div className="space-y-2">
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
              <Link 
                to="/saved-summaries" 
                className="text-xs text-primary hover:underline"
              >
                View saved summaries
              </Link>
            </div>
            <p className="text-[10px] text-muted-foreground/60 text-center">
              Claire does not remember conversations unless you choose to save a summary.
            </p>
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
