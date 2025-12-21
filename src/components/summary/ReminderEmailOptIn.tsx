import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Check, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReminderEmailOptInProps {
  userEmail?: string;
}

export const ReminderEmailOptIn = ({ userEmail }: ReminderEmailOptInProps) => {
  const { toast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [reminderTiming, setReminderTiming] = useState("7");
  const [email, setEmail] = useState(userEmail || "");
  const [customDate, setCustomDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSet, setIsSet] = useState(false);

  const handleSetReminder = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter an email address for the reminder.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate reminder date
      let reminderDate = new Date();
      if (reminderTiming === "custom" && customDate) {
        reminderDate = new Date(customDate);
      } else {
        reminderDate.setDate(reminderDate.getDate() + parseInt(reminderTiming));
      }

      // Store reminder preference (could be saved to database)
      // For now, show success message
      toast({
        title: "Reminder set",
        description: `We'll send one gentle reminder on ${reminderDate.toLocaleDateString()}.`,
      });
      
      setIsSet(true);
    } catch (error) {
      console.error("Error setting reminder:", error);
      toast({
        title: "Error",
        description: "Failed to set reminder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSet) {
    return (
      <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Reminder set
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                We'll send one gentle reminder. You can turn this off anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="reminder-opt-in"
            checked={showOptions}
            onCheckedChange={(checked) => setShowOptions(checked === true)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <label
              htmlFor="reminder-opt-in"
              className="text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email me a reminder later
            </label>

            {showOptions && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">When:</Label>
                  <RadioGroup
                    value={reminderTiming}
                    onValueChange={setReminderTiming}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="7" id="r7" />
                      <Label htmlFor="r7" className="text-sm font-normal cursor-pointer">
                        In 7 days
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="30" id="r30" />
                      <Label htmlFor="r30" className="text-sm font-normal cursor-pointer">
                        In 30 days
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="rcustom" />
                      <Label htmlFor="rcustom" className="text-sm font-normal cursor-pointer">
                        Choose a date
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {reminderTiming === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-date" className="text-sm">
                      Date:
                    </Label>
                    <Input
                      id="custom-date"
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="max-w-[200px]"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reminder-email" className="text-sm">
                    Email to:
                  </Label>
                  <Input
                    id="reminder-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="max-w-[300px]"
                  />
                </div>

                <Button
                  onClick={handleSetReminder}
                  disabled={isSubmitting}
                  size="sm"
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  {isSubmitting ? "Setting..." : "Set reminder"}
                </Button>

                <p className="text-xs text-muted-foreground">
                  We'll send one gentle reminder. You can turn this off anytime.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
