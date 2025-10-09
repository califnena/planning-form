import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionPetsProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionPets = ({ value, onChange }: SectionPetsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">🐾 My Pets</h2>
        <p className="text-muted-foreground mb-6">
          Ensure your beloved pets are cared for by documenting their needs and preferred caregivers.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pets">Pet Care Information</Label>
        <Textarea
          id="pets"
          placeholder="For each pet, include:
- Name, breed, age
- Veterinarian contact information
- Medical conditions or special needs
- Feeding schedule and dietary preferences
- Medications and dosage
- Behavioral notes (likes, dislikes, quirks)
- Preferred caregiver and backup caregivers
- Pet insurance information
- Microchip or registration numbers
- Location of medical records
- Funds set aside for their care
- End-of-life preferences if needed"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Pet Planning Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Discuss caregiving plans with your chosen pet guardian</li>
          <li>Consider setting aside funds for ongoing pet care</li>
          <li>Keep photos and important documents together</li>
          <li>Update microchip registration with caregiver info</li>
        </ul>
      </div>
    </div>
  );
};
