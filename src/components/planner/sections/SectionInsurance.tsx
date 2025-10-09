import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionInsuranceProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionInsurance = ({ value, onChange }: SectionInsuranceProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">🛡️ Insurance</h2>
        <p className="text-muted-foreground mb-6">
          Document all insurance policies including life, health, property, and other coverage.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="insurance">Insurance Policies & Details</Label>
        <Textarea
          id="insurance"
          placeholder="List all insurance policies:
- Life insurance (term, whole life, universal)
- Health insurance (medical, dental, vision)
- Property insurance (homeowners, renters)
- Auto insurance
- Disability insurance
- Long-term care insurance
- Umbrella policies

For each policy include:
- Insurance company name
- Policy number
- Coverage amount
- Beneficiaries
- Agent contact information
- Premium payment details"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
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
