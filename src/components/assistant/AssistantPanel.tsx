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
  CheckCircle2,
  Phone
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

// Helper to detect after-death related pages
const isAfterDeathPage = (pathname: string): boolean => {
  return pathname === '/next-steps' || 
         pathname === '/after-death' || 
         pathname === '/after-death-wizard' ||
         pathname.startsWith('/case/') ||
         pathname === '/preview-after-death';
};

// Helper to detect pre-planning related pages
const isPlanningPage = (pathname: string): boolean => {
  return pathname.startsWith('/planner') || 
         pathname.startsWith('/preplandashboard') ||
         pathname === '/preplan-summary' ||
         pathname === '/plan-ahead' ||
         pathname === '/orientation' ||
         pathname === '/guided-action' ||
         pathname === '/forms' ||
         pathname === '/printable-form';
};

// Helper to detect emotional/grief support pages
const isEmotionalPage = (pathname: string): boolean => {
  return pathname === '/care-support' ||
         pathname === '/safety-entry' ||
         pathname === '/relief-checkpoint';
};

// Get default Claire mode based on current page
const getDefaultMode = (pathname: string): ClaireMode => {
  if (isAfterDeathPage(pathname)) return 'after-death';
  if (isEmotionalPage(pathname)) return 'emotional';
  if (isPlanningPage(pathname)) return 'planning';
  return null;
};

// Get page context for Claire's behavior
const getPageContext = (pathname: string): string | undefined => {
  if (isAfterDeathPage(pathname)) return 'after-death';
  if (pathname === '/forms') return 'printable-download';
  if (pathname === '/printable-form') return 'printable-form';
  return undefined;
};

// Mode labels for display
const MODE_LABELS: Record<Exclude<ClaireMode, null>, string> = {
  'planning': 'Planning Ahead',
  'after-death': 'After a Death',
  'emotional': 'Emotional Support'
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
  const [showCompletion, setShowCompletion] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Check if user has completed their planning
  const planningCompletion = usePlanningCompletion();

  useEffect(() => {
    if (isOpen) {
      checkAccessAndLoad();
      // Set default mode based on current page (only if no mode selected yet)
      if (!selectedMode) {
        const defaultMode = getDefaultMode(location.pathname);
        if (defaultMode) {
          setSelectedMode(defaultMode);
        }
      }
    }
  }, [isOpen, location.pathname]);

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

  const handleTalkToRealPerson = () => {
    onClose();
    navigate("/contact");
  };

  const handleModeSelect = (mode: ClaireMode) => {
    setSelectedMode(mode);
    setShowAfterDeathResources(false);
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

  // Render mode entry (SLOT 1: MODE_ENTRY)
  const renderModeEntry = () => (
    <div className="space-y-4">
      {/* Claire's intro message */}
      <div className="text-center space-y-2 py-2">
        <p className="text-base text-foreground leading-relaxed">
          Hi, I'm Claire. I can help in different ways.
        </p>
        <p className="text-base text-foreground leading-relaxed">
          Please choose what you'd like help with today.
        </p>
      </div>

      {/* Mode selection buttons */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 border-2 hover:border-primary/40 hover:bg-primary/5"
          onClick={() => handleModeSelect('planning')}
        >
          <FileText className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
          <span className="text-base font-medium">Planning Ahead</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 border-2 hover:border-primary/40 hover:bg-primary/5"
          onClick={() => handleModeSelect('after-death')}
        >
          <Heart className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
          <span className="text-base font-medium">After a Death</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 border-2 hover:border-primary/40 hover:bg-primary/5"
          onClick={() => handleModeSelect('emotional')}
        >
          <HelpCircle className="h-5 w-5 mr-3 flex-shrink-0 text-primary" />
          <span className="text-base font-medium">Emotional Support</span>
        </Button>
      </div>

      {/* Helper text */}
      <p className="text-sm text-muted-foreground text-center pt-1">
        Tap one of the options above, or type a question below.
      </p>
    </div>
  );

  // Render mode-specific actions (SLOT 2A: PLANNING_ACTIONS)
  const renderPlanningActions = () => (
    <div className="space-y-4">
      {/* Planning completion prompt */}
      {planningCompletion.isComplete && showCompletion && (
        <div className="bg-accent/50 border border-border rounded-xl p-4 text-center space-y-3">
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-base text-foreground leading-relaxed">
            It looks like you've reached the end.<br />
            Would you like to review and save what you've done?
          </p>
          <div className="flex flex-col gap-2 pt-1">
            <Button
              size="lg"
              className="w-full py-5 text-base"
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
              className="w-full py-5 text-base"
              onClick={() => setShowCompletion(false)}
            >
              No, I want to keep working
            </Button>
          </div>
        </div>
      )}

      {/* Claire's planning intro */}
      {!planningCompletion.isComplete || !showCompletion ? (
        <>
          <div className="text-center py-2">
            <p className="text-base text-foreground leading-relaxed">
              We'll take this one step at a time.<br />
              You can skip anything and come back later.
            </p>
          </div>

          {/* Planning action buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => handleSend("I'd like help thinking through my funeral wishes.")}
              disabled={isLoading}
            >
              <Heart className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
              <span className="text-sm">My Funeral Wishes</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => handleSend("I'd like help writing a legacy letter to my loved ones.")}
              disabled={isLoading}
            >
              <FileText className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
              <span className="text-sm">Writing My Legacy Letter</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-3 px-4"
              onClick={() => handleSend("I need help organizing my important documents for my family.")}
              disabled={isLoading}
            >
              <ClipboardCheck className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
              <span className="text-sm">Organizing My Documents</span>
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );

  // Render mode-specific actions (SLOT 2B: AFTER_DEATH_ACTIONS)
  const renderAfterDeathActions = () => (
    <div className="space-y-4">
      {/* Claire's after-death intro */}
      <div className="text-center py-2">
        <p className="text-base text-foreground leading-relaxed">
          I'm here to help you focus on what to do next.<br />
          You don't need to do everything at once.
        </p>
      </div>

      {/* After-death resources view */}
      {showAfterDeathResources ? (
        <div className="space-y-2">
          <button 
            onClick={() => setShowAfterDeathResources(false)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            ← Back to options
          </button>
          <AfterDeathResourcesResponse onClose={onClose} />
        </div>
      ) : (
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => handleSend("Someone has passed away. What should I do first?")}
            disabled={isLoading}
          >
            <ClipboardCheck className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
            <span className="text-sm">What to Do First</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => setShowAfterDeathResources(true)}
          >
            <FileText className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
            <span className="text-sm">After Death Checklist</span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-4"
            onClick={() => handleSend("I need help organizing documents for the executor of an estate.")}
            disabled={isLoading}
          >
            <MessageCircle className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
            <span className="text-sm">Organizing Documents for Executor</span>
          </Button>

          {/* Download buttons */}
          <a 
            href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" 
            download
            className="flex items-center gap-3 w-full py-3 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-left"
          >
            <FileText className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="text-sm">Download After Death Guide</span>
          </a>
          
          <a 
            href="/guides/After-Life-Action-Plan-BLANK.pdf" 
            download
            className="flex items-center gap-3 w-full py-3 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-left"
          >
            <ClipboardCheck className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="text-sm">Download After Death Planner</span>
          </a>
          
          {/* Talk to a real person */}
          <Button
            variant="outline"
            className="w-full justify-start text-left h-auto py-3 px-4 mt-2"
            onClick={handleTalkToRealPerson}
          >
            <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
            <span className="text-sm">Talk to a real person</span>
          </Button>
        </div>
      )}
    </div>
  );

  // Render mode-specific actions (SLOT 2C: EMOTIONAL_SUPPORT_ACTIONS)
  const renderEmotionalActions = () => (
    <div className="space-y-4">
      {/* Claire's emotional support intro */}
      <div className="text-center py-2">
        <p className="text-base text-foreground leading-relaxed">
          You don't have to go through this alone.<br />
          I'm here to listen.
        </p>
      </div>

      {/* Emotional support action buttons */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4"
          onClick={() => handleSend("I'm struggling with grief. Can you help me understand what I'm feeling?")}
          disabled={isLoading}
        >
          <Heart className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
          <span className="text-sm">Coping with Grief</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4"
          onClick={() => handleSend("I just need someone to talk to about what I'm going through.")}
          disabled={isLoading}
        >
          <MessageCircle className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
          <span className="text-sm">Talk Through What I'm Feeling</span>
        </Button>
        
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4"
          onClick={() => handleSend("I need more support than I'm getting right now. What are my options?")}
          disabled={isLoading}
        >
          <Users className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
          <span className="text-sm">I Need More Support</span>
        </Button>
        
        {/* Talk to a real person */}
        <Button
          variant="outline"
          className="w-full justify-start text-left h-auto py-3 px-4 mt-2"
          onClick={handleTalkToRealPerson}
        >
          <Phone className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
          <span className="text-sm">Talk to a real person</span>
        </Button>
      </div>
    </div>
  );

  // Render mode indicator and change option
  const renderModeIndicator = () => (
    <div className="flex items-center justify-between py-2 px-1 mb-2">
      <span className="text-xs text-muted-foreground">
        Current help type: <span className="font-medium text-foreground">{MODE_LABELS[selectedMode!]}</span>
      </span>
      <button 
        onClick={() => handleModeSelect(null)}
        className="text-xs text-primary hover:underline"
      >
        Change
      </button>
    </div>
  );

  return (
    <>
      <Card ref={panelRef} className="fixed bottom-24 right-6 w-[380px] max-h-[85vh] shadow-2xl z-40 flex flex-col md:bottom-8 md:right-24">
        <CardHeader className="pb-2 flex-shrink-0">
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

        <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden min-h-0">
          <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
            <div className="space-y-3">
              {/* Mode indicator when mode is selected */}
              {selectedMode && messages.length === 0 && !showAfterDeathResources && renderModeIndicator()}
              
              {/* SLOT 1: Mode Entry - show when no mode selected AND no messages */}
              {!selectedMode && messages.length === 0 && renderModeEntry()}
              
              {/* SLOT 2A/2B/2C: Mode-specific actions - show when mode selected AND no messages */}
              {selectedMode && messages.length === 0 && !showAfterDeathResources && (
                <>
                  {selectedMode === 'planning' && renderPlanningActions()}
                  {selectedMode === 'after-death' && renderAfterDeathActions()}
                  {selectedMode === 'emotional' && renderEmotionalActions()}
                </>
              )}
              
              {/* After-Death Resources when triggered from after-death mode */}
              {selectedMode === 'after-death' && showAfterDeathResources && messages.length === 0 && renderAfterDeathActions()}
              
              {/* Conversation messages */}
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

          {/* Input area - show when mode selected OR conversation started */}
          {(selectedMode || messages.length > 0) && (
            <div className="flex gap-2 flex-shrink-0">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question here..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none min-h-[52px]"
                rows={2}
              />
              <Button 
                onClick={() => handleSend()} 
                disabled={isLoading || !input.trim()}
                size="icon"
                className="flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Footer actions */}
          <div className="space-y-1 flex-shrink-0">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteHistory}
                className="text-xs h-8"
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
              Claire does not remember conversations unless you save a summary.
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
