import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface SectionAboutYouProps {
  data?: any;
  onChange?: (data: any) => void;
}

/**
 * SectionAboutYou
 * 
 * SAVE: data.about_you object → goes to plan_payload.about_you via updatePlan
 * READ: data.about_you from plan_payload
 * COMPLETION: checks about_you in payload
 */
export const SectionAboutYou = ({ data, onChange }: SectionAboutYouProps) => {
  const aboutYou = data?.about_you || {};

  const updateField = (field: string, value: string) => {
    if (onChange) {
      onChange({
        ...data,
        about_you: { ...aboutYou, [field]: value }
      });
    }
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

      <Card variant="soft" className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-base font-medium">
            Full Legal Name
          </Label>
          <p className="text-muted-foreground text-base">
            Your name as it appears on legal documents.
          </p>
          <Input
            id="full_name"
            value={aboutYou.full_name || ""}
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
            value={aboutYou.preferred_name || ""}
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
            value={aboutYou.phone || ""}
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
            value={aboutYou.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            className="text-base h-12"
          />
        </div>
      </Card>
    </div>
  );
};