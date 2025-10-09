import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionPropertyProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionProperty = ({ value, onChange }: SectionPropertyProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">🏠 My Property</h2>
        <p className="text-muted-foreground mb-6">
          Document all real estate, vehicles, and other significant property.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="property">Property & Assets</Label>
        <Textarea
          id="property"
          placeholder="List all property and assets:

REAL ESTATE:
- Primary residence address
- Investment properties
- Vacation homes
- Land or lots
- Mortgage information
- Property management contacts

VEHICLES:
- Make, model, year of each vehicle
- VIN numbers
- Title location
- Loan information
- Preferred disposition

BUSINESSES:
- Business names and addresses
- Partnership or ownership details
- Succession plans
- Key contacts

OTHER VALUABLE ITEMS:
- Jewelry, art, collectibles
- Location and estimated value"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="resize-none"
        />
      </div>
    </div>
  );
};
