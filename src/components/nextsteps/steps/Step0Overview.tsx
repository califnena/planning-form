import { useState, useEffect } from "react";
import { FileText, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Step0OverviewProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

export function Step0Overview({ formData, onSave }: Step0OverviewProps) {
  const [preparedFor, setPreparedFor] = useState(formData?.preparedFor || "");
  const [overviewNotes, setOverviewNotes] = useState(formData?.overviewNotes || "");
  
  // Step completion tracking
  const [step1Complete, setStep1Complete] = useState(formData?.step1Complete || false);
  const [step2Complete, setStep2Complete] = useState(formData?.step2Complete || false);
  const [step3Complete, setStep3Complete] = useState(formData?.step3Complete || false);
  const [step4Complete, setStep4Complete] = useState(formData?.step4Complete || false);
  const [step5Complete, setStep5Complete] = useState(formData?.step5Complete || false);
  const [step6Complete, setStep6Complete] = useState(formData?.step6Complete || false);
  const [step7Complete, setStep7Complete] = useState(formData?.step7Complete || false);
  const [step8Complete, setStep8Complete] = useState(formData?.step8Complete || false);
  const [step9Complete, setStep9Complete] = useState(formData?.step9Complete || false);
  const [step10Complete, setStep10Complete] = useState(formData?.step10Complete || false);
  const [step11Complete, setStep11Complete] = useState(formData?.step11Complete || false);
  const [step12Complete, setStep12Complete] = useState(formData?.step12Complete || false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ 
        preparedFor,
        overviewNotes,
        step1Complete,
        step2Complete,
        step3Complete,
        step4Complete,
        step5Complete,
        step6Complete,
        step7Complete,
        step8Complete,
        step9Complete,
        step10Complete,
        step11Complete,
        step12Complete,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [preparedFor, overviewNotes, step1Complete, step2Complete, step3Complete, step4Complete, step5Complete, step6Complete, step7Complete, step8Complete, step9Complete, step10Complete, step11Complete, step12Complete]);

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          What This Plan Helps You Do
        </h3>
        <p className="text-muted-foreground mb-4">
          The Everlasting Next Steps Plan guides family members and executors through what to do 
          in the hours and days after a loss. It provides organized checklists, document tracking, 
          and guidance so nothing important is missed.
        </p>
        
        <div className="mt-4">
          <Label htmlFor="preparedFor" className="text-sm font-medium">
            This plan is prepared for:
          </Label>
          <Input
            id="preparedFor"
            placeholder="Enter name (e.g., Smith Family, John Doe, etc.)"
            value={preparedFor}
            onChange={(e) => setPreparedFor(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This name will appear on the PDF cover page and throughout the document
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Your 12-Step Action Plan
        </h4>

        <div className="grid gap-3">
          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step1Complete"
                checked={step1Complete}
                onCheckedChange={(checked) => setStep1Complete(checked as boolean)}
              />
              <Label htmlFor="step1Complete" className="font-medium text-foreground cursor-pointer">
                Step 1 – Immediate Needs (First 48 Hours)
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              • Contact funeral home • Secure residence • Notify close family
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step2Complete"
                checked={step2Complete}
                onCheckedChange={(checked) => setStep2Complete(checked as boolean)}
              />
              <Label htmlFor="step2Complete" className="font-medium text-foreground cursor-pointer">
                Step 2 – Official Notifications
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              • Social Security • Employer • Insurance • Banks
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step3Complete"
                checked={step3Complete}
                onCheckedChange={(checked) => setStep3Complete(checked as boolean)}
              />
              <Label htmlFor="step3Complete" className="font-medium text-foreground cursor-pointer">
                Step 3 – Find Key Documents
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              • Will • Trust • Property • Insurance • Taxes
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step4Complete"
                checked={step4Complete}
                onCheckedChange={(checked) => setStep4Complete(checked as boolean)}
              />
              <Label htmlFor="step4Complete" className="font-medium text-foreground cursor-pointer">
                Step 4 – Death Certificates
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Track orders, quantities, and recipients
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step5Complete"
                checked={step5Complete}
                onCheckedChange={(checked) => setStep5Complete(checked as boolean)}
              />
              <Label htmlFor="step5Complete" className="font-medium text-foreground cursor-pointer">
                Step 5 – Obituary & Announcements
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Draft obituary, select outlets, share memorial details
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step6Complete"
                checked={step6Complete}
                onCheckedChange={(checked) => setStep6Complete(checked as boolean)}
              />
              <Label htmlFor="step6Complete" className="font-medium text-foreground cursor-pointer">
                Step 6 – Service & Memorial Details
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Venue, officiant, pallbearers, music, readings
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step7Complete"
                checked={step7Complete}
                onCheckedChange={(checked) => setStep7Complete(checked as boolean)}
              />
              <Label htmlFor="step7Complete" className="font-medium text-foreground cursor-pointer">
                Step 7 – Finances & Estate
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Financial and property management tasks
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step8Complete"
                checked={step8Complete}
                onCheckedChange={(checked) => setStep8Complete(checked as boolean)}
              />
              <Label htmlFor="step8Complete" className="font-medium text-foreground cursor-pointer">
                Step 8 – Digital Accounts
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Digital account handling and online presence
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step9Complete"
                checked={step9Complete}
                onCheckedChange={(checked) => setStep9Complete(checked as boolean)}
              />
              <Label htmlFor="step9Complete" className="font-medium text-foreground cursor-pointer">
                Step 9 – Real Estate & Utilities
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Property management and utility transfers
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step10Complete"
                checked={step10Complete}
                onCheckedChange={(checked) => setStep10Complete(checked as boolean)}
              />
              <Label htmlFor="step10Complete" className="font-medium text-foreground cursor-pointer">
                Step 10 – Non-Digital Subscriptions
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Magazines, newspapers, memberships
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step11Complete"
                checked={step11Complete}
                onCheckedChange={(checked) => setStep11Complete(checked as boolean)}
              />
              <Label htmlFor="step11Complete" className="font-medium text-foreground cursor-pointer">
                Step 11 – Other Property & Possessions
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Vehicles, boats, jewelry, art, clothing
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-1">
              <Checkbox
                id="step12Complete"
                checked={step12Complete}
                onCheckedChange={(checked) => setStep12Complete(checked as boolean)}
              />
              <Label htmlFor="step12Complete" className="font-medium text-foreground cursor-pointer">
                Step 12 – Business Ownership
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-8">
              Business management and succession planning
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="overviewNotes">Overview Notes</Label>
        <Textarea
          id="overviewNotes"
          placeholder="Add any general notes or important reminders about this plan..."
          value={overviewNotes}
          onChange={(e) => setOverviewNotes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mt-6">
        <p className="text-sm text-muted-foreground italic">
          💡 <strong>Tip:</strong> Use the sidebar navigation to jump to any step. 
          All your entries are automatically saved as you type.
        </p>
      </div>
    </div>
  );
}
