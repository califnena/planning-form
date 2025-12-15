import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Bell } from "lucide-react";

interface EventSubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATES = [
  { value: "FL", label: "Florida" },
  { value: "CA", label: "California" },
];

const COUNTIES = [
  "Hillsborough",
  "Pinellas",
  "Pasco",
  "Manatee",
  "Polk",
  "Sarasota",
];

const CATEGORIES = [
  "Senior Expo",
  "Estate Planning",
  "Probate",
  "Grief Support",
  "Hospice",
  "Funeral Industry",
  "Caregiver",
];

export const EventSubscribeDialog = ({ open, onOpenChange }: EventSubscribeDialogProps) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>(["FL"]);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelection = (value: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter(v => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("efa_event_subscribers")
        .insert({
          email,
          first_name: firstName || null,
          state_interest: selectedStates.length > 0 ? selectedStates : null,
          county_interest: selectedCounties.length > 0 ? selectedCounties : null,
          category_interest: selectedCategories.length > 0 ? selectedCategories : null,
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed! We'll keep you updated.");
        } else {
          throw error;
        }
      } else {
        toast.success("You're subscribed! You can unsubscribe anytime.");
      }
      
      onOpenChange(false);
      setEmail("");
      setFirstName("");
    } catch (err: any) {
      console.error("Subscribe error:", err);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Get Event Reminders
          </DialogTitle>
          <DialogDescription>
            Subscribe to receive email reminders about upcoming events in your area.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name (optional)</Label>
            <Input
              id="firstName"
              placeholder="Your name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>States of Interest</Label>
            <div className="flex flex-wrap gap-3">
              {STATES.map(state => (
                <label key={state.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedStates.includes(state.value)}
                    onCheckedChange={() => toggleSelection(state.value, selectedStates, setSelectedStates)}
                  />
                  <span className="text-sm">{state.label}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedStates.includes("FL") && (
            <div className="space-y-2">
              <Label>Counties (FL)</Label>
              <div className="grid grid-cols-2 gap-2">
                {COUNTIES.map(county => (
                  <label key={county} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCounties.includes(county)}
                      onCheckedChange={() => toggleSelection(county, selectedCounties, setSelectedCounties)}
                    />
                    <span className="text-sm">{county}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Event Categories</Label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => (
                <label key={category} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                  />
                  <span className="text-sm">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <Mail className="h-4 w-4 mr-2" />
            {loading ? "Subscribing..." : "Subscribe to Reminders"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You can unsubscribe at any time via a link in every email.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
