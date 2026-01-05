import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * CANONICAL DATA MODEL: plan_payload.advance_directive
 * 
 * All fields use snake_case for consistency with the rest of the app.
 */
export interface AdvanceDirectiveData {
  healthcare_proxy_name?: string;
  healthcare_proxy_phone?: string;
  advance_directive_status?: "yes" | "no" | "unsure";
  advance_directive_location?: string;
  dnr_status?: "yes" | "no" | "unsure";
  polst_status?: "yes" | "no" | "unsure";
  document_location?: string;
}

interface SectionAdvanceDirectiveProps {
  data?: AdvanceDirectiveData;
  onChange?: (data: AdvanceDirectiveData) => void;
}

const STATUS_OPTIONS: { value: "yes" | "no" | "unsure"; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

export const SectionAdvanceDirective = ({ data = {}, onChange }: SectionAdvanceDirectiveProps) => {
  const updateData = (updates: Partial<AdvanceDirectiveData>) => {
    onChange?.({ ...data, ...updates });
  };

  const renderStatusButtons = (
    fieldName: keyof AdvanceDirectiveData,
    currentValue: "yes" | "no" | "unsure" | undefined
  ) => (
    <div className="flex flex-wrap gap-3">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => updateData({ [fieldName]: option.value })}
          className={cn(
            "h-12 px-6 rounded-lg border-2 text-base font-medium transition-all",
            currentValue === option.value
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border hover:border-primary text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Advance Directive & DNR Status
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Record the status and location of your legal healthcare documents.
        </p>
      </div>

      {/* Disclaimer */}
      <Card className="p-4 bg-accent/30 border-accent/50 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground text-base">
              We do not store legal documents here. This is a quick summary and location reference for your family.
            </p>
          </div>
        </div>
      </Card>

      {/* Healthcare Proxy */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Healthcare Proxy</h2>
        <p className="text-muted-foreground mb-4">
          Who should make medical decisions if you cannot?
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="proxy-name" className="text-base">Name</Label>
            <Input
              id="proxy-name"
              value={data.healthcare_proxy_name || ""}
              onChange={(e) => updateData({ healthcare_proxy_name: e.target.value })}
              placeholder="Full name"
              className="mt-1 text-base h-12"
            />
          </div>
          <div>
            <Label htmlFor="proxy-phone" className="text-base">Phone</Label>
            <Input
              id="proxy-phone"
              value={data.healthcare_proxy_phone || ""}
              onChange={(e) => updateData({ healthcare_proxy_phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="mt-1 text-base h-12"
            />
          </div>
        </div>
      </Card>

      {/* Advance Directive Status */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Advance Directive</h2>
          <Link 
            to="/resources?section=education&sub=legal-medical"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Learn more
          </Link>
        </div>
        <p className="text-muted-foreground mb-4">
          Do you have an advance directive (also called a living will)?
        </p>
        
        {renderStatusButtons("advance_directive_status", data.advance_directive_status)}
        
        {data.advance_directive_status === "yes" && (
          <div className="mt-4">
            <Label htmlFor="ad-location" className="text-base">Where is it kept?</Label>
            <Input
              id="ad-location"
              value={data.advance_directive_location || ""}
              onChange={(e) => updateData({ advance_directive_location: e.target.value })}
              placeholder="e.g., Filing cabinet, attorney's office"
              className="mt-1 text-base h-12"
            />
          </div>
        )}
      </Card>

      {/* DNR Status */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">DNR (Do Not Resuscitate)</h2>
          <Link 
            to="/resources?section=education&sub=legal-medical"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Learn more
          </Link>
        </div>
        <p className="text-muted-foreground mb-4">
          Do you have a DNR order?
        </p>
        
        {renderStatusButtons("dnr_status", data.dnr_status)}
      </Card>

      {/* POLST Status */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">POLST / MOLST</h2>
          <Link 
            to="/resources?section=education&sub=legal-medical"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Learn more
          </Link>
        </div>
        <p className="text-muted-foreground mb-4">
          Do you have a POLST or MOLST form? (Physician Orders for Life-Sustaining Treatment)
        </p>
        
        {renderStatusButtons("polst_status", data.polst_status)}
        
        {(data.dnr_status === "yes" || data.polst_status === "yes") && (
          <div className="mt-4">
            <Label htmlFor="doc-location" className="text-base">Where are these documents kept?</Label>
            <Input
              id="doc-location"
              value={data.document_location || ""}
              onChange={(e) => updateData({ document_location: e.target.value })}
              placeholder="e.g., Refrigerator, bedside table"
              className="mt-1 text-base h-12"
            />
          </div>
        )}
      </Card>
    </div>
  );
};
