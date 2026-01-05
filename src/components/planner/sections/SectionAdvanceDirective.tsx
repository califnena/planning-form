import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

/**
 * CANONICAL DATA MODEL: plan_payload.advance_directive
 * 
 * This is the ONLY acceptable structure - no deviations.
 */
export interface AdvanceDirectiveData {
  has_advance_directive: "yes" | "no" | null;
  document_location: string | null;
  healthcare_proxy_name: string | null;
  healthcare_proxy_phone: string | null;
  notes: string | null;
  last_updated?: string;
}

interface SectionAdvanceDirectiveProps {
  data?: Partial<AdvanceDirectiveData>;
  onChange?: (data: AdvanceDirectiveData) => void;
}

const STATUS_OPTIONS: { value: "yes" | "no"; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const SectionAdvanceDirective = ({ data = {}, onChange }: SectionAdvanceDirectiveProps) => {
  // Ensure we always work with the canonical shape
  const currentData: AdvanceDirectiveData = {
    has_advance_directive: data.has_advance_directive ?? null,
    document_location: data.document_location ?? null,
    healthcare_proxy_name: data.healthcare_proxy_name ?? null,
    healthcare_proxy_phone: data.healthcare_proxy_phone ?? null,
    notes: data.notes ?? null,
    last_updated: data.last_updated,
  };

  const updateData = (updates: Partial<AdvanceDirectiveData>) => {
    const updated: AdvanceDirectiveData = {
      ...currentData,
      ...updates,
      last_updated: new Date().toISOString(),
    };
    onChange?.(updated);
  };

  const renderStatusButtons = (currentValue: "yes" | "no" | null) => (
    <div className="flex flex-wrap gap-3">
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => updateData({ has_advance_directive: option.value })}
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
          Advance Directive
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Record whether you have an advance directive and where it can be found.
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

      {/* Do you have an Advance Directive? */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Do you have an Advance Directive?</h2>
          <Link 
            to="/resources?section=education&sub=legal-medical"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-4 w-4" />
            Learn more
          </Link>
        </div>
        <p className="text-muted-foreground mb-4">
          An advance directive (also called a living will) states your healthcare wishes if you cannot speak for yourself.
        </p>
        
        {renderStatusButtons(currentData.has_advance_directive)}
      </Card>

      {/* Document Location - only show if has_advance_directive is "yes" */}
      {currentData.has_advance_directive === "yes" && (
        <Card className="p-5 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Document Location</h2>
          <p className="text-muted-foreground mb-4">
            Where is your advance directive kept?
          </p>
          <Input
            value={currentData.document_location || ""}
            onChange={(e) => updateData({ document_location: e.target.value })}
            placeholder="e.g., Filing cabinet, attorney's office, safe deposit box"
            className="text-base h-12"
          />
        </Card>
      )}

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
              value={currentData.healthcare_proxy_name || ""}
              onChange={(e) => updateData({ healthcare_proxy_name: e.target.value })}
              placeholder="Full name"
              className="mt-1 text-base h-12"
            />
          </div>
          <div>
            <Label htmlFor="proxy-phone" className="text-base">Phone</Label>
            <Input
              id="proxy-phone"
              value={currentData.healthcare_proxy_phone || ""}
              onChange={(e) => updateData({ healthcare_proxy_phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="mt-1 text-base h-12"
            />
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
        <p className="text-muted-foreground mb-4">
          Any additional information about your advance directive or healthcare wishes.
        </p>
        <Textarea
          value={currentData.notes || ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          placeholder="Any additional notes..."
          className="text-base min-h-[100px]"
        />
      </Card>
    </div>
  );
};
