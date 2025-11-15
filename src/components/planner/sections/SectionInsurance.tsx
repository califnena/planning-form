import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTranslation } from "react-i18next";

interface SectionInsuranceProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionInsurance = ({ data, onChange }: SectionInsuranceProps) => {
  const insurance = data.insurance || {};
  const policies = insurance.policies || [];
  const { toast } = useToast();
  const { t } = useTranslation();

  const updateInsurance = (field: string, value: any) => {
    onChange({
      ...data,
      insurance: { ...insurance, [field]: value }
    });
    
    // Auto-create policy when checkbox is checked
    if (field.startsWith('has_') && value === true) {
      const insuranceType = field.replace('has_', '').replace(/_/g, ' ');
      const typeCapitalized = insuranceType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Check if policy already exists for this type
      const existingPolicy = policies.find((p: any) => 
        p.type?.toLowerCase() === insuranceType.toLowerCase()
      );
      
      if (!existingPolicy) {
        addPolicyWithType(typeCapitalized);
      }
    }
  };

  const addPolicy = () => {
    updateInsurance("policies", [...policies, { type: "", company: "", policy_number: "", details: "" }]);
  };

  const addPolicyWithType = (type: string) => {
    updateInsurance("policies", [...policies, { type, company: "", policy_number: "", details: "" }]);
  };

  const updatePolicy = (index: number, field: string, value: string) => {
    const updated = [...policies];
    updated[index] = { ...updated[index], [field]: value };
    updateInsurance("policies", updated);
  };

  const removePolicy = (index: number) => {
    updateInsurance("policies", policies.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Insurance information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">🛡️ Insurance</h2>
          <p className="text-muted-foreground">
            Document all insurance policies and coverage.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold text-sm">
          Privacy Protected: Insurance Details Not Saved
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs mt-1">
          For your security, <strong>we do NOT save</strong> sensitive insurance details like policy numbers or beneficiary information. 
          You'll re-enter this information only when generating your PDF. It's only used for printing and never stored.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Insurance Types I Have</Label>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="life"
              checked={insurance.has_life || false}
              onCheckedChange={(checked) => updateInsurance("has_life", checked)}
            />
            <Label htmlFor="life" className="font-normal">Life insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="health"
              checked={insurance.has_health || false}
              onCheckedChange={(checked) => updateInsurance("has_health", checked)}
            />
            <Label htmlFor="health" className="font-normal">Health insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dental"
              checked={insurance.has_dental || false}
              onCheckedChange={(checked) => updateInsurance("has_dental", checked)}
            />
            <Label htmlFor="dental" className="font-normal">Dental insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vision"
              checked={insurance.has_vision || false}
              onCheckedChange={(checked) => updateInsurance("has_vision", checked)}
            />
            <Label htmlFor="vision" className="font-normal">Vision insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="homeowners"
              checked={insurance.has_homeowners || false}
              onCheckedChange={(checked) => updateInsurance("has_homeowners", checked)}
            />
            <Label htmlFor="homeowners" className="font-normal">Homeowners/Renters insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto"
              checked={insurance.has_auto || false}
              onCheckedChange={(checked) => updateInsurance("has_auto", checked)}
            />
            <Label htmlFor="auto" className="font-normal">Auto insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="disability"
              checked={insurance.has_disability || false}
              onCheckedChange={(checked) => updateInsurance("has_disability", checked)}
            />
            <Label htmlFor="disability" className="font-normal">Disability insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="long_term_care"
              checked={insurance.has_long_term_care || false}
              onCheckedChange={(checked) => updateInsurance("has_long_term_care", checked)}
            />
            <Label htmlFor="long_term_care" className="font-normal">Long-term care insurance</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="umbrella"
              checked={insurance.has_umbrella || false}
              onCheckedChange={(checked) => updateInsurance("has_umbrella", checked)}
            />
            <Label htmlFor="umbrella" className="font-normal">Umbrella policy</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Policy Details</Label>
          <Button onClick={addPolicy} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>

        {policies.map((policy: any, index: number) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Policy {index + 1}</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPolicy}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePolicy(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Insurance Type</Label>
                <p className="text-xs text-muted-foreground">Category of insurance policy</p>
                <Input
                  value={policy.type || ""}
                  onChange={(e) => updatePolicy(index, "type", e.target.value)}
                  placeholder="e.g., Life, Auto, Homeowners"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <p className="text-xs text-muted-foreground">Name of insurance provider</p>
                <Input
                  value={policy.company || ""}
                  onChange={(e) => updatePolicy(index, "company", e.target.value)}
                  placeholder="Insurance company name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Policy Number</Label>
              <p className="text-xs text-muted-foreground">Unique identifier for this policy</p>
              <Input
                value={policy.policy_number || ""}
                onChange={(e) => updatePolicy(index, "policy_number", e.target.value)}
                placeholder="Policy number"
              />
            </div>
            <div className="space-y-2">
              <Label>Details</Label>
              <p className="text-xs text-muted-foreground">Coverage amount, beneficiaries, agent contact, document location</p>
              <Textarea
                value={policy.details || ""}
                onChange={(e) => updatePolicy(index, "details", e.target.value)}
                placeholder="Coverage amount, beneficiaries, agent contact, document location"
                rows={3}
              />
            </div>
          </Card>
        ))}

        {policies.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No insurance policies added yet</p>
            <Button onClick={addPolicy} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Policy
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Important:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Keep original policy documents in a secure location</li>
          <li>Review beneficiaries regularly (after major life events)</li>
          <li>Note the location of physical policy documents</li>
          <li>Include contact information for all insurance agents</li>
        </ul>
      </div>
    </div>
  );
};