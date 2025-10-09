import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionPetsProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionPets = ({ value, onChange }: SectionPetsProps) => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Pet information has been saved.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">🐾 My Pets</h2>
          <p className="text-muted-foreground">
            Ensure your beloved pets are cared for by documenting their needs and preferred caregivers.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pets">Pet Care Information</Label>
        <Textarea
          id="pets"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className="resize-none"
        />
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">📋 Include for each pet:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Name, breed, age</li>
          <li>Veterinarian contact information</li>
          <li>Medical conditions or special needs</li>
          <li>Feeding schedule and dietary preferences</li>
          <li>Medications and dosage</li>
          <li>Behavioral notes (likes, dislikes, quirks)</li>
          <li>Preferred caregiver and backup caregivers</li>
          <li>Pet insurance information</li>
          <li>Microchip or registration numbers</li>
          <li>Location of medical records</li>
          <li>Funds set aside for their care</li>
          <li>End-of-life preferences if needed</li>
        </ul>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
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