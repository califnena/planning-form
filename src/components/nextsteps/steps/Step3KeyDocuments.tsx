import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

export function Step3KeyDocuments({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    willLocation: formData?.step3?.willLocation || "",
    trustLocation: formData?.step3?.trustLocation || "",
    deedsLocation: formData?.step3?.deedsLocation || "",
    insuranceLocation: formData?.step3?.insuranceLocation || "",
    taxDocLocation: formData?.step3?.taxDocLocation || "",
    safeDepositBox: formData?.step3?.safeDepositBox || "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step3: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Record where important documents are located to help executors find them quickly.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="willLocation">Will / Trust</Label>
          <Input
            id="willLocation"
            placeholder="Location of will or trust documents"
            value={data.willLocation}
            onChange={(e) => updateField("willLocation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trustLocation">Living Trust</Label>
          <Input
            id="trustLocation"
            placeholder="Location of living trust documents"
            value={data.trustLocation}
            onChange={(e) => updateField("trustLocation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deedsLocation">Deeds or Titles</Label>
          <Input
            id="deedsLocation"
            placeholder="Location of property deeds, car titles, etc."
            value={data.deedsLocation}
            onChange={(e) => updateField("deedsLocation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceLocation">Insurance Policies</Label>
          <Input
            id="insuranceLocation"
            placeholder="Location of life insurance and other policy documents"
            value={data.insuranceLocation}
            onChange={(e) => updateField("insuranceLocation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxDocLocation">Tax Documents</Label>
          <Input
            id="taxDocLocation"
            placeholder="Location of tax returns and records"
            value={data.taxDocLocation}
            onChange={(e) => updateField("taxDocLocation", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="safeDepositBox">Safe Deposit Box Location</Label>
          <Input
            id="safeDepositBox"
            placeholder="Bank name, box number, key location"
            value={data.safeDepositBox}
            onChange={(e) => updateField("safeDepositBox", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
