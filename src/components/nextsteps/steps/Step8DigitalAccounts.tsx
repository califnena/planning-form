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

export function Step8DigitalAccounts({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    primaryEmail: formData?.step8?.primaryEmail || "",
    socialMediaAccounts: formData?.step8?.socialMediaAccounts || "",
    streamingServices: formData?.step8?.streamingServices || "",
    allClosed: formData?.step8?.allClosed || false,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step8: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Manage digital accounts, social media profiles, and online subscriptions.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primaryEmail">Primary Email Provider & Status</Label>
          <Input
            id="primaryEmail"
            placeholder="e.g., Gmail - account closed on 01/15/2024"
            value={data.primaryEmail}
            onChange={(e) => updateField("primaryEmail", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="socialMediaAccounts">Social Media Accounts Handled</Label>
          <Textarea
            id="socialMediaAccounts"
            placeholder="List platforms and actions taken (e.g., Facebook - memorialized, Twitter - deleted, LinkedIn - closed)"
            value={data.socialMediaAccounts}
            onChange={(e) => updateField("socialMediaAccounts", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="streamingServices">Streaming / Subscriptions Cancelled</Label>
          <Textarea
            id="streamingServices"
            placeholder="List services cancelled (e.g., Netflix, Spotify, Amazon Prime, etc.)"
            value={data.streamingServices}
            onChange={(e) => updateField("streamingServices", e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allClosed"
            checked={data.allClosed}
            onCheckedChange={(checked) => updateField("allClosed", checked)}
          />
          <Label htmlFor="allClosed" className="cursor-pointer font-medium">
            All digital accounts closed
          </Label>
        </div>
      </div>
    </div>
  );
}
