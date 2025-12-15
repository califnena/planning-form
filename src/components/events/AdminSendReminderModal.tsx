import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Mail, Calendar, Users, AlertCircle, Loader2 } from "lucide-react";
import { format, subHours } from "date-fns";

interface AdminSendReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    name: string;
    email_subject: string | null;
    email_preview: string | null;
    email_body: string | null;
    category: string;
    state: string | null;
    county: string | null;
  } | null;
}

const STATES = [
  { value: "FL", label: "Florida" },
  { value: "CA", label: "California" },
  { value: "ALL", label: "All States" },
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

export const AdminSendReminderModal = ({ open, onOpenChange, event }: AdminSendReminderModalProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);

  // Step 1: Audience filters
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);

  // Step 2: Email content
  const [subject, setSubject] = useState("");
  const [preview, setPreview] = useState("");
  const [body, setBody] = useState("");

  // Step 3: Send timing
  const [sendType, setSendType] = useState<"now" | "scheduled">("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    if (event && open) {
      setSubject(event.email_subject || `Reminder: ${event.name}`);
      setPreview(event.email_preview || "");
      setBody(event.email_body || "");
      setSelectedState(event.state || "ALL");
      if (event.county) {
        setSelectedCounties([event.county]);
      }
      if (event.category) {
        setSelectedCategories([event.category]);
      }
      setStep(1);
      checkDuplicateSend();
    }
  }, [event, open]);

  useEffect(() => {
    if (step === 4 && open) {
      estimateRecipients();
    }
  }, [step, open]);

  const checkDuplicateSend = async () => {
    if (!event) return;
    
    const fortyEightHoursAgo = subHours(new Date(), 48);
    
    const { data } = await supabase
      .from("efa_event_email_log")
      .select("id")
      .eq("event_id", event.id)
      .gte("created_at", fortyEightHoursAgo.toISOString())
      .limit(1);
    
    setDuplicateWarning(data && data.length > 0);
  };

  const estimateRecipients = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("efa_event_subscribers")
        .select("id", { count: "exact", head: true });
      
      if (activeOnly) {
        query = query.eq("is_active", true);
      }
      
      if (selectedState !== "ALL") {
        query = query.contains("state_interest", [selectedState]);
      }
      
      // Note: Array filtering for counties/categories would need more complex logic
      // For MVP, we'll show approximate count
      
      const { count, error } = await query;
      
      if (!error) {
        setEstimatedCount(count || 0);
      }
    } catch (err) {
      console.error("Error estimating recipients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!event) return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const audienceFilter = {
        state: selectedState,
        counties: selectedCounties,
        categories: selectedCategories,
        activeOnly,
      };

      // Log the send attempt
      const { data: logEntry, error: logError } = await supabase
        .from("efa_event_email_log")
        .insert({
          event_id: event.id,
          send_type: sendType === "now" ? "Now" : "Scheduled",
          audience_filter: audienceFilter,
          subject,
          preview,
          body,
          sent_to_count: estimatedCount || 0,
          status: sendType === "now" ? "queued" : "scheduled",
          created_by: user?.id,
        })
        .select()
        .single();

      if (logError) throw logError;

      if (sendType === "now") {
        // Call edge function to send emails
        const { error: sendError } = await supabase.functions.invoke("send-event-reminder", {
          body: {
            logId: logEntry.id,
            eventId: event.id,
            subject,
            preview,
            body,
            audienceFilter,
          },
        });

        if (sendError) {
          // Update log status to failed
          await supabase
            .from("efa_event_email_log")
            .update({ status: "failed" })
            .eq("id", logEntry.id);
          throw sendError;
        }

        toast.success(`Reminder sent to ${estimatedCount} subscribers!`);
      } else {
        toast.success(`Reminder scheduled for ${scheduledDate} at ${scheduledTime}`);
      }

      onOpenChange(false);
    } catch (err: any) {
      console.error("Send error:", err);
      toast.error("Failed to send reminder. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCounty = (county: string) => {
    setSelectedCounties(prev => 
      prev.includes(county) ? prev.filter(c => c !== county) : [...prev, county]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Send Reminder: {event.name}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4
          </DialogDescription>
        </DialogHeader>

        {duplicateWarning && step === 1 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              A reminder for this event was sent within the last 48 hours. Are you sure you want to send another?
            </p>
          </div>
        )}

        {/* Step 1: Audience */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Select Audience
            </h3>

            <div className="space-y-2">
              <Label>State</Label>
              <div className="flex flex-wrap gap-3">
                {STATES.map(state => (
                  <label key={state.value} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedState === state.value}
                      onCheckedChange={() => setSelectedState(state.value)}
                    />
                    <span className="text-sm">{state.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedState === "FL" && (
              <div className="space-y-2">
                <Label>Counties (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTIES.map(county => (
                    <label key={county} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedCounties.includes(county)}
                        onCheckedChange={() => toggleCounty(county)}
                      />
                      <span className="text-sm">{county}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Categories (optional)</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(category => (
                  <label key={category} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <Checkbox
                checked={activeOnly}
                onCheckedChange={(checked) => setActiveOnly(checked as boolean)}
              />
              <span className="text-sm">Only active subscribers</span>
            </label>

            <Button onClick={() => setStep(2)} className="w-full">
              Next: Email Content
            </Button>
          </div>
        )}

        {/* Step 2: Email Content */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Content
            </h3>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground">{subject.length}/60 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preview">Preview Text</Label>
              <Input
                id="preview"
                value={preview}
                onChange={(e) => setPreview(e.target.value)}
                placeholder="Brief preview shown in inbox"
                maxLength={90}
              />
              <p className="text-xs text-muted-foreground">{preview.length}/90 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter email content"
                rows={8}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Footer will automatically include: "We do not control third-party event details." and an unsubscribe link.
            </p>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1" disabled={!subject || !body}>
                Next: Send Timing
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Send Timing */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Send Timing
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                <Checkbox
                  checked={sendType === "now"}
                  onCheckedChange={() => setSendType("now")}
                />
                <div>
                  <p className="font-medium">Send Now</p>
                  <p className="text-sm text-muted-foreground">Emails will be sent immediately</p>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-muted/50">
                <Checkbox
                  checked={sendType === "scheduled"}
                  onCheckedChange={() => setSendType("scheduled")}
                />
                <div>
                  <p className="font-medium">Schedule for Later</p>
                  <p className="text-sm text-muted-foreground">Choose a specific date and time</p>
                </div>
              </label>
            </div>

            {sendType === "scheduled" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">Date</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">Time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="flex-1"
                disabled={sendType === "scheduled" && (!scheduledDate || !scheduledTime)}
              >
                Next: Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Confirm & Send</h3>

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audience:</span>
                <span className="font-medium">
                  {selectedState === "ALL" ? "All States" : selectedState}
                  {selectedCounties.length > 0 && ` (${selectedCounties.join(", ")})`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timing:</span>
                <span className="font-medium">
                  {sendType === "now" ? "Send Now" : `${scheduledDate} at ${scheduledTime}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Recipients:</span>
                <span className="font-medium">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : estimatedCount ?? "—"}
                </span>
              </div>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <p className="font-medium">{subject}</p>
              <p className="text-sm text-muted-foreground">{preview}</p>
              <p className="text-sm whitespace-pre-wrap">{body.substring(0, 200)}{body.length > 200 && "..."}</p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSend} 
                className="flex-1"
                disabled={loading || estimatedCount === 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {sendType === "now" ? "Send Now" : "Schedule Send"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
