import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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

interface EfaEvent {
  id: string;
  name: string;
}

interface EventLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EfaEvent | null;
  leadType: "Planning Help" | "Vendor Interest" | "Reminders";
}

export const EventLeadDialog = ({ open, onOpenChange, event, leadType }: EventLeadDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    business_name: "",
    service_type: "",
    state_interest: "FL"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setLoading(true);

    const { error } = await supabase.from("efa_event_leads").insert({
      event_id: event.id,
      lead_type: leadType,
      name: formData.name || null,
      email: formData.email,
      phone: formData.phone || null,
      message: formData.message || null,
      business_name: formData.business_name || null,
      service_type: formData.service_type || null,
      state_interest: formData.state_interest || null
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: leadType === "Reminders" 
          ? "We'll remind you about similar events!"
          : "Thank you! We'll be in touch soon."
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        business_name: "",
        service_type: "",
        state_interest: "FL"
      });
      onOpenChange(false);
    }
  };

  const getTitle = () => {
    switch (leadType) {
      case "Planning Help":
        return "Get Planning Help";
      case "Vendor Interest":
        return "Vendor / Sponsor Inquiry";
      case "Reminders":
        return "Get Event Reminders";
    }
  };

  const getDescription = () => {
    switch (leadType) {
      case "Planning Help":
        return "Tell us about your planning needs and we'll connect you with the right resources.";
      case "Vendor Interest":
        return "Interested in exhibiting or sponsoring this event? Let us know about your business.";
      case "Reminders":
        return "We'll notify you about similar upcoming events in your area.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
          {event && (
            <p className="text-sm text-primary font-medium mt-2">
              Event: {event.name}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          {leadType === "Vendor Interest" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service_type">Type of Service</Label>
                <Input
                  id="service_type"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="e.g., Insurance, Elder Care, Legal Services"
                />
              </div>
            </>
          )}

          {leadType !== "Reminders" && (
            <div className="space-y-2">
              <Label htmlFor="message">
                {leadType === "Planning Help" ? "How can we help?" : "Additional Information"}
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={
                  leadType === "Planning Help"
                    ? "Tell us about your planning needs..."
                    : "Any questions or special requests?"
                }
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
