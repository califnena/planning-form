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

export function Step1ImmediateNeeds({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    funeralHomeContacted: formData?.step1?.funeralHomeContacted || false,
    funeralHomeName: formData?.step1?.funeralHomeName || "",
    funeralHomePhone: formData?.step1?.funeralHomePhone || "",
    residenceSecured: formData?.step1?.residenceSecured || false,
    residenceNotes: formData?.step1?.residenceNotes || "",
    familyNotified: formData?.step1?.familyNotified || false,
    familyContacts: formData?.step1?.familyContacts || "",
    otherUrgent: formData?.step1?.otherUrgent || "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step1: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="funeralHomeContacted"
            checked={data.funeralHomeContacted}
            onCheckedChange={(checked) => updateField("funeralHomeContacted", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="funeralHomeContacted" className="font-medium cursor-pointer">
              Contact funeral home
            </Label>
            <div className="grid gap-2 ml-6">
              <Input
                placeholder="Funeral home name"
                value={data.funeralHomeName}
                onChange={(e) => updateField("funeralHomeName", e.target.value)}
              />
              <Input
                placeholder="Phone number"
                value={data.funeralHomePhone}
                onChange={(e) => updateField("funeralHomePhone", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="residenceSecured"
            checked={data.residenceSecured}
            onCheckedChange={(checked) => updateField("residenceSecured", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="residenceSecured" className="font-medium cursor-pointer">
              Secure residence
            </Label>
            <Textarea
              placeholder="Notes about securing the residence..."
              value={data.residenceNotes}
              onChange={(e) => updateField("residenceNotes", e.target.value)}
              className="ml-6"
              rows={2}
            />
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="familyNotified"
            checked={data.familyNotified}
            onCheckedChange={(checked) => updateField("familyNotified", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="familyNotified" className="font-medium cursor-pointer">
              Notify immediate family
            </Label>
            <Textarea
              placeholder="List names and contact information..."
              value={data.familyContacts}
              onChange={(e) => updateField("familyContacts", e.target.value)}
              className="ml-6"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Label htmlFor="otherUrgent" className="font-medium">
          Other urgent items
        </Label>
        <Textarea
          id="otherUrgent"
          placeholder="Any other immediate needs or notes..."
          value={data.otherUrgent}
          onChange={(e) => updateField("otherUrgent", e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
