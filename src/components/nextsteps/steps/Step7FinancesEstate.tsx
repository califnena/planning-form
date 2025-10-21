import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

export function Step7FinancesEstate({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    executorName: formData?.step7?.executorName || "",
    executorContact: formData?.step7?.executorContact || "",
    attorney: formData?.step7?.attorney || "",
    bankAccounts: formData?.step7?.bankAccounts || "",
    propertyTransfers: formData?.step7?.propertyTransfers || "",
    estateSettled: formData?.step7?.estateSettled || false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step7: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Track financial accounts, estate settlement, and property management.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="executorName">Executor Name</Label>
          <Input
            id="executorName"
            placeholder="Full name of estate executor"
            value={data.executorName}
            onChange={(e) => updateField("executorName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="executorContact">Executor Contact Information</Label>
          <Input
            id="executorContact"
            placeholder="Phone and email"
            value={data.executorContact}
            onChange={(e) => updateField("executorContact", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attorney">Attorney (if applicable)</Label>
          <Input
            id="attorney"
            placeholder="Attorney name and contact"
            value={data.attorney}
            onChange={(e) => updateField("attorney", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bankAccounts">Bank Accounts / Status</Label>
          <Textarea
            id="bankAccounts"
            placeholder="List bank accounts and their current status (open, closed, transferred, etc.)"
            value={data.bankAccounts}
            onChange={(e) => updateField("bankAccounts", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyTransfers">Property or Vehicle Transfers</Label>
          <Textarea
            id="propertyTransfers"
            placeholder="Notes on property, vehicle, or asset transfers"
            value={data.propertyTransfers}
            onChange={(e) => updateField("propertyTransfers", e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="estateSettled"
            checked={data.estateSettled}
            onCheckedChange={(checked) => updateField("estateSettled", checked)}
          />
          <Label htmlFor="estateSettled" className="cursor-pointer font-medium">
            Estate accounts settled
          </Label>
        </div>
      </div>
    </div>
  );
}
