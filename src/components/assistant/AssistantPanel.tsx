import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Calendar, 
  HelpCircle, 
  BookOpen, 
  Send, 
  Trash2, 
  Loader2,
  ThumbsUp,
  ThumbsDown,
  MessageCircle
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

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadOrCreateConversation();
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

  const handleSend = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Save user message
      const { data: userMsg } = await supabase
        .from('assistant_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage
        })
        .select()
        .single();

      if (userMsg) {
        setMessages(prev => [...prev, userMsg as Message]);
      }

      // Check for intents
      if (/book|appointment|schedule|meet/i.test(userMessage)) {
        setShowBooking(true);
        const responseMsg = "I can help you book an appointment! I've opened the booking interface for you. Would you like a 15-minute consultation or something longer?";
        
        const { data: assistantMsg } = await supabase
          .from('assistant_messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: responseMsg
          })
          .select()
          .single();

        if (assistantMsg) {
          setMessages(prev => [...prev, assistantMsg as Message]);
        }
        setIsLoading(false);
        return;
      }

      // Search KB
      const searchResponse = await supabase.functions.invoke('kb-search', {
        body: { query: userMessage }
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

      // Stream AI response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage + context }
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
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
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

  if (!isOpen) return null;

  return (
    <>
      <Card ref={panelRef} className="fixed bottom-24 right-6 w-[380px] h-[600px] shadow-2xl z-40 flex flex-col md:bottom-8 md:right-24">
        <CardHeader className="pb-3 space-y-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Ask Everlasting
          </CardTitle>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setShowBooking(true)}
            >
              <Calendar className="h-3 w-3 mr-1" />
              Book Appointment
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <HelpCircle className="h-3 w-3 mr-1" />
              How do I...?
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Browse FAQs
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  <p>👋 Hello! I'm your Everlasting Assistant.</p>
                  <p className="mt-2">Ask me anything about end-of-life planning.</p>
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
                  <span className="text-sm">Thinking...</span>
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
                onClick={handleSend} 
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-start items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteHistory}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear history
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your conversation is private and secure.
          </p>
        </CardContent>
      </Card>

      <BookingModal 
        isOpen={showBooking} 
        onClose={() => setShowBooking(false)} 
      />
    </>
  );
}
