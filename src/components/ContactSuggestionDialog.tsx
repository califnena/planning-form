 import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lightbulb } from "lucide-react";

interface ContactSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactSuggestionDialog = ({
  open,
  onOpenChange,
}: ContactSuggestionDialogProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
   const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

   useEffect(() => {
     const getUser = async () => {
       if (open) {
         const { data: { user } } = await supabase.auth.getUser();
         setUserId(user?.id ?? null);
       }
     };
     getUser();
   }, [open]);
 
  const handleSubmit = async (type: "contact" | "suggestion") => {
    if (!name || !email || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
       // Save to support_requests table instead of sending email
       const { error } = await supabase
         .from('support_requests')
         .insert({
           user_id: userId,
           name: name,
           contact_method: 'email',
           contact_value: email,
           message: message,
           request_type: type,
         });

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: `Your ${type === "contact" ? "message" : "suggestion"} has been sent successfully.`,
      });

      setName("");
      setEmail("");
      setMessage("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Get in Touch</DialogTitle>
          <DialogDescription>
            Send us a message or share your suggestions to improve our platform.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contact" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </TabsTrigger>
            <TabsTrigger value="suggestion">
              <Lightbulb className="h-4 w-4 mr-2" />
              Suggestion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you?"
                rows={5}
              />
            </div>

            <Button
              onClick={() => handleSubmit("contact")}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </TabsContent>

          <TabsContent value="suggestion" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name-sug">Your Name</Label>
              <Input
                id="name-sug"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-sug">Your Email</Label>
              <Input
                id="email-sug"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message-sug">Your Suggestion</Label>
              <Textarea
                id="message-sug"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your ideas to improve our platform..."
                rows={5}
              />
            </div>

            <Button
              onClick={() => handleSubmit("suggestion")}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Submit Suggestion"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
