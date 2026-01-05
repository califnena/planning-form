import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SectionPersonalInfoProps {
  data?: any;
  onChange?: (data: any) => void;
}

/**
 * SectionPersonalInfo
 * 
 * CANONICAL KEY: personal_information (object in plan_payload)
 * 
 * SAVE: data.personal_information → plan_payload.personal_information
 * READ: data.personal_information from plan_payload
 * COMPLETION: hasMeaningfulData(plan_payload.personal_information)
 * 
 * Fields:
 * - full_legal_name, preferred_name, date_of_birth, place_of_birth, citizenship
 * - street_1, street_2, city, state, postal_code, country
 * - phone, email, marital_status, spouse_name
 * - military_service, military_branch
 * - last_updated (timestamp)
 */
export const SectionPersonalInfo = ({ data, onChange }: SectionPersonalInfoProps) => {
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();
  
  // CANONICAL: Read from 'personal_information' key
  const info = data?.personal_information || {};

  const updateField = (field: string, value: string | null) => {
    if (onChange) {
      const updated = {
        ...data,
        personal_information: { 
          ...info, 
          [field]: value,
          last_updated: new Date().toISOString()
        }
      };
      
      if (import.meta.env.DEV) {
        console.log("[SectionPersonalInfo] updateField:", field, "→ personal_information");
      }
      
      onChange(updated);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Personal Information
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Core personal details that identify you and your plan.
        </p>
        <p className="text-base text-primary mt-2">✓ Auto-saves as you type</p>
      </div>

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20 mb-6">
        <Shield className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold text-base">
          Privacy Protected
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 text-base mt-1 leading-relaxed">
          We do not collect Social Security numbers. You can add those by hand 
          on your printable copy if you choose.
        </AlertDescription>
      </Alert>

      <PreviewModeWrapper>
        <div className="space-y-6">
          {/* Basic Identity */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_legal_name" className="text-base font-medium">
                  Full Legal Name
                </Label>
                <p className="text-muted-foreground text-sm">
                  Your name as it appears on legal documents.
                </p>
                <Input
                  id="full_legal_name"
                  value={info.full_legal_name || ""}
                  onChange={(e) => updateField("full_legal_name", e.target.value)}
                  placeholder="e.g., John Robert Smith"
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_name" className="text-base font-medium">
                  Preferred Name or Nickname
                </Label>
                <p className="text-muted-foreground text-sm">
                  What do people call you?
                </p>
                <Input
                  id="preferred_name"
                  value={info.preferred_name || ""}
                  onChange={(e) => updateField("preferred_name", e.target.value)}
                  placeholder="e.g., Johnny, Dad, Grandpa"
                  className="text-base h-12"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth" className="text-base font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={info.date_of_birth || ""}
                  onChange={(e) => updateField("date_of_birth", e.target.value)}
                  className="text-base h-12"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="place_of_birth" className="text-base font-medium">
                  Place of Birth
                </Label>
                <Input
                  id="place_of_birth"
                  value={info.place_of_birth || ""}
                  onChange={(e) => updateField("place_of_birth", e.target.value)}
                  placeholder="City, State, Country"
                  className="text-base h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="citizenship" className="text-base font-medium">
                Citizenship
              </Label>
              <Input
                id="citizenship"
                value={info.citizenship || ""}
                onChange={(e) => updateField("citizenship", e.target.value)}
                placeholder="e.g., United States"
                className="text-base h-12"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Current Address</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street_1" className="text-base font-medium">
                  Street Address
                </Label>
                <Input
                  id="street_1"
                  value={info.street_1 || ""}
                  onChange={(e) => updateField("street_1", e.target.value)}
                  placeholder="123 Main Street"
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_2" className="text-base font-medium">
                  Apartment, Suite, etc. (optional)
                </Label>
                <Input
                  id="street_2"
                  value={info.street_2 || ""}
                  onChange={(e) => updateField("street_2", e.target.value)}
                  placeholder="Apt 4B"
                  className="text-base h-12"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base font-medium">City</Label>
                  <Input
                    id="city"
                    value={info.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="City"
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-base font-medium">State</Label>
                  <Input
                    id="state"
                    value={info.state || ""}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="State"
                    className="text-base h-12"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code" className="text-base font-medium">ZIP/Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={info.postal_code || ""}
                    onChange={(e) => updateField("postal_code", e.target.value)}
                    placeholder="12345"
                    className="text-base h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country" className="text-base font-medium">Country (optional)</Label>
                  <Input
                    id="country"
                    value={info.country || ""}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="United States"
                    className="text-base h-12"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Contact Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={info.phone || ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="text-base h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={info.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  className="text-base h-12"
                />
              </div>
            </div>
          </div>

          {/* Marital Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Marital Status</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marital_status" className="text-base font-medium">
                  Current Marital Status
                </Label>
                <Select
                  value={info.marital_status || ""}
                  onValueChange={(value) => updateField("marital_status", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    <SelectItem value="domestic_partner">Domestic Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="spouse_name" className="text-base font-medium">
                  Spouse/Partner Name
                </Label>
                <Input
                  id="spouse_name"
                  value={info.spouse_name || ""}
                  onChange={(e) => updateField("spouse_name", e.target.value)}
                  placeholder="Full name of spouse or partner"
                  className="text-base h-12"
                />
              </div>
            </div>
          </div>

          {/* Military Service */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Military Service</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="military_service" className="text-base font-medium">
                  Did you serve in the military?
                </Label>
                <Select
                  value={info.military_service || ""}
                  onValueChange={(value) => updateField("military_service", value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {info.military_service === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="military_branch" className="text-base font-medium">
                    Branch of Service
                  </Label>
                  <Input
                    id="military_branch"
                    value={info.military_branch || ""}
                    onChange={(e) => updateField("military_branch", e.target.value)}
                    placeholder="e.g., U.S. Army, U.S. Navy"
                    className="text-base h-12"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </PreviewModeWrapper>
    </div>
  );
};
