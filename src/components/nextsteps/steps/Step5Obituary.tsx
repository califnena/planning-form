import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

export function Step5Obituary({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    obituaryText: formData?.step5?.obituaryText || "",
    publications: formData?.step5?.publications || "",
    onlineLink: formData?.step5?.onlineLink || "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step5: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Draft the obituary and track where it will be published.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="obituaryText">Obituary Text</Label>
          <Textarea
            id="obituaryText"
            placeholder="Write or paste the obituary text here..."
            value={data.obituaryText}
            onChange={(e) => updateField("obituaryText", e.target.value)}
            rows={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="publications">Publication Names and Dates</Label>
          <Textarea
            id="publications"
            placeholder="List newspapers or publications and when obituary will run (e.g., Los Angeles Times - Jan 15, 2024)"
            value={data.publications}
            onChange={(e) => updateField("publications", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="onlineLink">Link to Online Posting (Optional)</Label>
          <Input
            id="onlineLink"
            type="url"
            placeholder="https://"
            value={data.onlineLink}
            onChange={(e) => updateField("onlineLink", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
