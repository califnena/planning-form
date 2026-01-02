import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdvanceDirectiveData {
  healthcareProxyName?: string;
  healthcareProxyPhone?: string;
  advanceDirectiveStatus?: "yes" | "no" | "unsure";
  advanceDirectiveLocation?: string;
  dnrStatus?: "yes" | "no" | "unsure";
  polstStatus?: "yes" | "no" | "unsure";
  documentLocation?: string;
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
              value={data.healthcareProxyName || ""}
              onChange={(e) => updateData({ healthcareProxyName: e.target.value })}
              placeholder="Full name"
              className="mt-1 text-base h-12"
            />
          </div>
          <div>
            <Label htmlFor="proxy-phone" className="text-base">Phone</Label>
            <Input
              id="proxy-phone"
              value={data.healthcareProxyPhone || ""}
              onChange={(e) => updateData({ healthcareProxyPhone: e.target.value })}
              placeholder="(555) 123-4567"
              className="mt-1 text-base h-12"
            />
          </div>
        </div>
      </Card>

      {/* Advance Directive Status */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Advance Directive</h2>
        <p className="text-muted-foreground mb-4">
          Do you have an advance directive (also called a living will)?
        </p>
        
        {renderStatusButtons("advanceDirectiveStatus", data.advanceDirectiveStatus)}
        
        {data.advanceDirectiveStatus === "yes" && (
          <div className="mt-4">
            <Label htmlFor="ad-location" className="text-base">Where is it kept?</Label>
            <Input
              id="ad-location"
              value={data.advanceDirectiveLocation || ""}
              onChange={(e) => updateData({ advanceDirectiveLocation: e.target.value })}
              placeholder="e.g., Filing cabinet, attorney's office"
              className="mt-1 text-base h-12"
            />
          </div>
        )}
      </Card>

      {/* DNR Status */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">DNR (Do Not Resuscitate)</h2>
        <p className="text-muted-foreground mb-4">
          Do you have a DNR order?
        </p>
        
        {renderStatusButtons("dnrStatus", data.dnrStatus)}
      </Card>

      {/* POLST Status */}
      <Card className="p-5 mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">POLST / MOLST</h2>
        <p className="text-muted-foreground mb-4">
          Do you have a POLST or MOLST form? (Physician Orders for Life-Sustaining Treatment)
        </p>
        
        {renderStatusButtons("polstStatus", data.polstStatus)}
        
        {(data.dnrStatus === "yes" || data.polstStatus === "yes") && (
          <div className="mt-4">
            <Label htmlFor="doc-location" className="text-base">Where are these documents kept?</Label>
            <Input
              id="doc-location"
              value={data.documentLocation || ""}
              onChange={(e) => updateData({ documentLocation: e.target.value })}
              placeholder="e.g., Refrigerator, bedside table"
              className="mt-1 text-base h-12"
            />
          </div>
        )}
      </Card>
    </div>
  );
};
