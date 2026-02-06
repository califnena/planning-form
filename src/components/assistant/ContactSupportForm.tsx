import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Phone, Mail } from "lucide-react";

interface ContactSupportFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  prefillMessage?: string;
}

export function ContactSupportForm({ onSuccess, onCancel, prefillMessage }: ContactSupportFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(prefillMessage || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in the required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("assisted_requests")
        .insert({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          help_for: "claire_support",
          help_types: ["general_inquiry"],
          sections: [],
          contact_method: phone ? "phone" : "email",
          status: "pending",
          admin_notes: message.trim(),
        });

      if (error) throw error;

      toast.success("Message sent! We'll get back to you soon.");
      onSuccess();
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">What do you need help with? *</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us how we can help..."
          rows={4}
          required
        />
      </div>

      {/* Business contact info */}
      <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <Phone className="h-3 w-3" />
          <span>(800) 555-0123</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3" />
          <span>support@everlastingfuneral.com</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
    </form>
  );
}
