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

export function Step2OfficialNotifications({ formData, onSave }: StepProps) {
  const [data, setData] = useState({
    ssaDone: formData?.step2?.ssaDone || false,
    ssaContact: formData?.step2?.ssaContact || "",
    ssaConfirmation: formData?.step2?.ssaConfirmation || "",
    employerDone: formData?.step2?.employerDone || false,
    employerContact: formData?.step2?.employerContact || "",
    insuranceDone: formData?.step2?.insuranceDone || false,
    insuranceCompany: formData?.step2?.insuranceCompany || "",
    insurancePolicy: formData?.step2?.insurancePolicy || "",
    bankDone: formData?.step2?.bankDone || false,
    bankStatus: formData?.step2?.bankStatus || "",
    utilitiesDone: formData?.step2?.utilitiesDone || false,
    utilitiesList: formData?.step2?.utilitiesList || "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step2: data });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Social Security */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="ssaDone"
            checked={data.ssaDone}
            onCheckedChange={(checked) => updateField("ssaDone", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="ssaDone" className="font-medium cursor-pointer">
              Social Security Administration
            </Label>
            <div className="grid gap-2 ml-6">
              <Input
                placeholder="Contact name or reference"
                value={data.ssaContact}
                onChange={(e) => updateField("ssaContact", e.target.value)}
              />
              <Input
                placeholder="Confirmation number"
                value={data.ssaConfirmation}
                onChange={(e) => updateField("ssaConfirmation", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Employer */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="employerDone"
            checked={data.employerDone}
            onCheckedChange={(checked) => updateField("employerDone", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="employerDone" className="font-medium cursor-pointer">
              Employer / HR Contact
            </Label>
            <Input
              placeholder="HR contact name and phone"
              value={data.employerContact}
              onChange={(e) => updateField("employerContact", e.target.value)}
              className="ml-6"
            />
          </div>
        </div>

        {/* Insurance */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="insuranceDone"
            checked={data.insuranceDone}
            onCheckedChange={(checked) => updateField("insuranceDone", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="insuranceDone" className="font-medium cursor-pointer">
              Insurance Company
            </Label>
            <div className="grid gap-2 ml-6">
              <Input
                placeholder="Insurance company name"
                value={data.insuranceCompany}
                onChange={(e) => updateField("insuranceCompany", e.target.value)}
              />
              <Input
                placeholder="Policy number"
                value={data.insurancePolicy}
                onChange={(e) => updateField("insurancePolicy", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bank */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="bankDone"
            checked={data.bankDone}
            onCheckedChange={(checked) => updateField("bankDone", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="bankDone" className="font-medium cursor-pointer">
              Bank / Account Closing
            </Label>
            <Textarea
              placeholder="Account closure status and notes..."
              value={data.bankStatus}
              onChange={(e) => updateField("bankStatus", e.target.value)}
              className="ml-6"
              rows={2}
            />
          </div>
        </div>

        {/* Utilities */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="utilitiesDone"
            checked={data.utilitiesDone}
            onCheckedChange={(checked) => updateField("utilitiesDone", checked)}
          />
          <div className="flex-1 space-y-2">
            <Label htmlFor="utilitiesDone" className="font-medium cursor-pointer">
              Utilities / Subscriptions
            </Label>
            <Textarea
              placeholder="List utilities and subscription services to cancel or transfer..."
              value={data.utilitiesList}
              onChange={(e) => updateField("utilitiesList", e.target.value)}
              className="ml-6"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
