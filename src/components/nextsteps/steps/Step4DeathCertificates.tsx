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

export function Step4DeathCertificates({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    numberOrdered: formData?.step4?.numberOrdered || "",
    recipients: formData?.step4?.recipients || "",
    allReceived: formData?.step4?.allReceived || false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step4: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Track death certificate orders and distribution. Most families need 5-10 certified copies.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="numberOrdered">Number of Certificates Ordered</Label>
          <Input
            id="numberOrdered"
            type="number"
            placeholder="e.g., 10"
            value={data.numberOrdered}
            onChange={(e) => updateField("numberOrdered", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipients">Where to Send Each Copy</Label>
          <Textarea
            id="recipients"
            placeholder="List where each certificate will be sent (e.g., insurance company, bank, SSA, DMV, etc.)"
            value={data.recipients}
            onChange={(e) => updateField("recipients", e.target.value)}
            rows={6}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allReceived"
            checked={data.allReceived}
            onCheckedChange={(checked) => updateField("allReceived", checked)}
          />
          <Label htmlFor="allReceived" className="cursor-pointer font-medium">
            All certificates received
          </Label>
        </div>
      </div>
    </div>
  );
}
