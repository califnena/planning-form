import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AboutYouData {
  full_name: string;
  preferred_name: string;
  phone: string;
  email: string;
}

interface SectionAboutYouProps {
  data?: AboutYouData;
  onChange?: (data: AboutYouData) => void;
}

export const SectionAboutYou = ({ data, onChange }: SectionAboutYouProps) => {
  const [formData, setFormData] = useState<AboutYouData>({
    full_name: "",
    preferred_name: "",
    phone: "",
    email: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      const saved = localStorage.getItem("aboutyou_data");
      if (saved) {
        setFormData(JSON.parse(saved));
      }
    }
  }, [data]);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("aboutyou_data", JSON.stringify(formData));
    onChange?.(formData);
  }, [formData, onChange]);

  const updateField = (field: keyof AboutYouData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          About You
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Basic information about you. This helps identify your plan.
        </p>
        <p className="text-base text-primary mt-2">✓ Auto-saves as you type</p>
      </div>

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20 mb-6">
        <Shield className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold text-base">
          Privacy Protected
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 text-base mt-1 leading-relaxed">
          We do not collect Social Security numbers, date of birth, or your full address. 
          You can add those by hand on your printable copy if you choose.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-base font-medium">
            Full Legal Name
          </Label>
          <p className="text-muted-foreground text-base">
            Your name as it appears on legal documents.
          </p>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            placeholder="e.g., John Robert Smith"
            className="text-base h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferred_name" className="text-base font-medium">
            Preferred Name or Nickname
          </Label>
          <p className="text-muted-foreground text-base">
            What do people call you?
          </p>
          <Input
            id="preferred_name"
            value={formData.preferred_name}
            onChange={(e) => updateField("preferred_name", e.target.value)}
            placeholder="e.g., Johnny, Dad, Grandpa"
            className="text-base h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium">
            Phone Number
          </Label>
          <p className="text-muted-foreground text-base">
            A number where family can reach you.
          </p>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="(555) 123-4567"
            className="text-base h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">
            Email Address
          </Label>
          <p className="text-muted-foreground text-base">
            Your email for any follow-up.
          </p>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            className="text-base h-12"
          />
        </div>
      </div>
    </div>
  );
};
