import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Pet {
  id: string;
  type: string;
  name: string;
  instructions: string;
}

interface SectionPetsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionPets = ({ data, onChange }: SectionPetsProps) => {
  const { toast } = useToast();

  const pets: Pet[] = data.pets || [];

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Pet information has been saved.",
    });
  };

  const addPet = () => {
    const newPet: Pet = {
      id: Date.now().toString(),
      type: "",
      name: "",
      instructions: "",
    };
    onChange({ ...data, pets: [...pets, newPet] });
  };

  const removePet = (id: string) => {
    onChange({ ...data, pets: pets.filter((p) => p.id !== id) });
  };

  const updatePet = (id: string, field: keyof Pet, value: string) => {
    onChange({
      ...data,
      pets: pets.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
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
          <p className="text-xs text-primary mt-1">✓ Auto-saves as you type</p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        {pets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No pets added yet. Click "Add Pet" below to get started.</p>
          </div>
        )}
        
        {pets.map((pet, index) => (
          <div key={pet.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pet {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePet(pet.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pet Type</Label>
                <Select
                  value={pet.type}
                  onValueChange={(value) => updatePet(pet.id, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pet type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="bird">Bird</SelectItem>
                    <SelectItem value="fish">Fish</SelectItem>
                    <SelectItem value="reptile">Reptile (Snake, Lizard, etc.)</SelectItem>
                    <SelectItem value="small_mammal">Small Mammal (Rabbit, Hamster, etc.)</SelectItem>
                    <SelectItem value="horse">Horse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Pet Name</Label>
                <Input
                  value={pet.name}
                  onChange={(e) => updatePet(pet.id, "name", e.target.value)}
                  placeholder="Enter pet's name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Care Instructions</Label>
              <p className="text-xs text-muted-foreground">
                Include feeding schedule, medications, vet info, caregiver preferences
              </p>
              <Textarea
                value={pet.instructions}
                onChange={(e) => updatePet(pet.id, "instructions", e.target.value)}
                placeholder="Enter detailed care instructions for this pet..."
                rows={6}
                className="resize-none"
              />
            </div>
          </div>
        ))}

        <Button onClick={addPet} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Pet
        </Button>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Pet Planning Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Feeding schedule and dietary restrictions</li>
          <li>Medications and veterinary contact</li>
          <li>Behavioral notes and preferences</li>
          <li>Preferred caregiver contact information</li>
          <li>Emergency veterinary contacts</li>
          <li>Microchip or registration numbers</li>
          <li>Pet insurance information</li>
          <li>Location of medical records</li>
        </ul>
      </div>
    </div>
  );
};
