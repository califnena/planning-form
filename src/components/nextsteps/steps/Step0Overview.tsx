import { FileText, CheckCircle } from "lucide-react";

export function Step0Overview() {
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
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          Your 8-Step Action Plan
        </h4>

        <div className="grid gap-3">
          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 1 – Immediate Needs (First 48 Hours)</div>
            <p className="text-sm text-muted-foreground">
              • Contact funeral home • Secure residence • Notify close family
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 2 – Official Notifications</div>
            <p className="text-sm text-muted-foreground">
              • Social Security • Employer • Insurance • Banks • Utilities
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 3 – Find Key Documents</div>
            <p className="text-sm text-muted-foreground">
              • Will • Trust • Property • Insurance • Taxes
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 4 – Death Certificates</div>
            <p className="text-sm text-muted-foreground">
              Track orders, quantities, and recipients
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 5 – Obituary & Announcements</div>
            <p className="text-sm text-muted-foreground">
              Draft obituary, select outlets, share memorial details
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 6 – Service & Memorial Details</div>
            <p className="text-sm text-muted-foreground">
              Venue, officiant, pallbearers, music, readings
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 7 – Finances & Estate</div>
            <p className="text-sm text-muted-foreground">
              Financial and property management tasks
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
            <div className="font-medium text-foreground mb-1">Step 8 – Digital Accounts & Subscriptions</div>
            <p className="text-sm text-muted-foreground">
              Digital account handling and online presence
            </p>
          </div>
        </div>
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
