import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionLegalProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionLegal = ({ data, onChange }: SectionLegalProps) => {
  const legal = data.legal || {};
  const { toast } = useToast();

  const updateLegal = (field: string, value: any) => {
    onChange({
      ...data,
      legal: { ...legal, [field]: value }
    });
    
    // Auto-populate executor/trustee fields when will/trust is checked
    if (field === 'has_will' && value === true && !legal.executor) {
      // Show executor fields by ensuring user fills them in
      setTimeout(() => {
        const executorInput = document.getElementById('executor');
        if (executorInput) executorInput.focus();
      }, 100);
    }
    
    if (field === 'has_trust' && value === true && !legal.trustee) {
      // Show trustee fields by ensuring user fills them in
      setTimeout(() => {
        const trusteeInput = document.getElementById('trustee');
        if (trusteeInput) trusteeInput.focus();
      }, 100);
    }
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Legal information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">⚖️ Legal (Will/Trust)</h2>
          <p className="text-muted-foreground">
            Document location of legal documents and estate planning details.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Documents I Have</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="none"
              checked={legal.has_none || false}
              onCheckedChange={(checked) => {
                if (checked) {
                  // When NONE is checked, uncheck will and trust
                  onChange({
                    ...data,
                    legal: { ...legal, has_none: true, has_will: false, has_trust: false }
                  });
                } else {
                  updateLegal("has_none", false);
                }
              }}
            />
            <Label htmlFor="none" className="font-normal">None</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="will"
              checked={legal.has_will || false}
              onCheckedChange={(checked) => {
                if (checked && legal.has_none) {
                  // If NONE was checked, uncheck it when checking will
                  onChange({
                    ...data,
                    legal: { ...legal, has_will: true, has_none: false }
                  });
                } else {
                  updateLegal("has_will", checked);
                }
              }}
            />
            <Label htmlFor="will" className="font-normal">Last Will and Testament</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="trust"
              checked={legal.has_trust || false}
              onCheckedChange={(checked) => {
                if (checked && legal.has_none) {
                  // If NONE was checked, uncheck it when checking trust
                  onChange({
                    ...data,
                    legal: { ...legal, has_trust: true, has_none: false }
                  });
                } else {
                  updateLegal("has_trust", checked);
                }
              }}
            />
            <Label htmlFor="trust" className="font-normal">Living Trust</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="financial_poa"
              checked={legal.has_financial_poa || false}
              onCheckedChange={(checked) => updateLegal("has_financial_poa", checked)}
            />
            <Label htmlFor="financial_poa" className="font-normal">Financial Power of Attorney</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="healthcare_poa"
              checked={legal.has_healthcare_poa || false}
              onCheckedChange={(checked) => updateLegal("has_healthcare_poa", checked)}
            />
            <Label htmlFor="healthcare_poa" className="font-normal">Healthcare Power of Attorney</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="living_will"
              checked={legal.has_living_will || false}
              onCheckedChange={(checked) => updateLegal("has_living_will", checked)}
            />
            <Label htmlFor="living_will" className="font-normal">Living Will / Advance Directive</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dnr"
              checked={legal.has_dnr || false}
              onCheckedChange={(checked) => updateLegal("has_dnr", checked)}
            />
            <Label htmlFor="dnr" className="font-normal">Do Not Resuscitate (DNR)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="polst"
              checked={legal.has_polst || false}
              onCheckedChange={(checked) => updateLegal("has_polst", checked)}
            />
            <Label htmlFor="polst" className="font-normal">POLST (Physician Orders)</Label>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="executor">Executor Name</Label>
          <p className="text-xs text-muted-foreground">Person responsible for carrying out your will</p>
          <Input
            id="executor"
            value={legal.executor || ""}
            onChange={(e) => updateLegal("executor", e.target.value)}
            placeholder="Person named in will"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="executor_contact">Executor Contact</Label>
          <p className="text-xs text-muted-foreground">Best way to reach your executor</p>
          <Input
            id="executor_contact"
            value={legal.executor_contact || ""}
            onChange={(e) => updateLegal("executor_contact", e.target.value)}
            placeholder="Phone or email"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="trustee">Trustee Name (if applicable)</Label>
          <Input
            id="trustee"
            value={legal.trustee || ""}
            onChange={(e) => updateLegal("trustee", e.target.value)}
            placeholder="Person managing trust"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trustee_contact">Trustee Contact</Label>
          <Input
            id="trustee_contact"
            value={legal.trustee_contact || ""}
            onChange={(e) => updateLegal("trustee_contact", e.target.value)}
            placeholder="Phone or email"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="attorney_name">Attorney Name</Label>
          <Input
            id="attorney_name"
            value={legal.attorney_name || ""}
            onChange={(e) => updateLegal("attorney_name", e.target.value)}
            placeholder="Estate planning attorney"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attorney_contact">Attorney Contact</Label>
          <Input
            id="attorney_contact"
            value={legal.attorney_contact || ""}
            onChange={(e) => updateLegal("attorney_contact", e.target.value)}
            placeholder="Phone or email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="document_location">Location of Original Documents</Label>
        <p className="text-xs text-muted-foreground">Where originals are stored (safe, safe deposit box, attorney's office)</p>
        <Textarea
          id="document_location"
          value={legal.document_location || ""}
          onChange={(e) => updateLegal("document_location", e.target.value)}
          placeholder="Where are the original legal documents stored? (safe, safe deposit box, attorney's office, etc.)"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardians">Guardians for Minor Children (if applicable)</Label>
        <Textarea
          id="guardians"
          value={legal.guardians || ""}
          onChange={(e) => updateLegal("guardians", e.target.value)}
          placeholder="Primary and backup guardians named in will"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="legal_notes">Additional Legal Details</Label>
        <Textarea
          id="legal_notes"
          value={legal.notes || ""}
          onChange={(e) => updateLegal("notes", e.target.value)}
          placeholder="Any other important legal information, prenuptial agreements, divorce decrees, military discharge papers, etc."
          rows={4}
        />
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
        <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
          ⚠️ Important:
        </h3>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Keep original legal documents in a secure location. Inform your executor and trusted family members where these documents can be found.
        </p>
      </div>
    </div>
  );
};