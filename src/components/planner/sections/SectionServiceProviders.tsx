import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ServiceProvider {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
}

interface SectionServiceProvidersProps {
  data: any;
  onChange: (data: any) => void;
}

const PROVIDER_TYPES = [
  "Funeral Home",
  "Cemetery",
  "Crematory",
  "Florist",
  "Caterer",
  "Musician/DJ",
  "Photographer",
  "Videographer",
  "Monument Company",
  "Transportation",
  "Venue",
  "Other",
];

/**
 * SectionServiceProviders
 * 
 * CANONICAL KEY: service_providers (array in plan_payload)
 */
export const SectionServiceProviders = ({ data, onChange }: SectionServiceProvidersProps) => {
  const providers: ServiceProvider[] = data.service_providers || [];
  const { toast } = useToast();

  const updateProviders = (updated: ServiceProvider[]) => {
    onChange({
      ...data,
      service_providers: updated,
    });
    
    if (import.meta.env.DEV) {
      console.log("[SectionServiceProviders] Updated service_providers:", updated.length);
    }
  };

  const addProvider = () => {
    const newProvider: ServiceProvider = {
      id: crypto.randomUUID(),
      name: "",
      type: "",
      phone: "",
      email: "",
      company: "",
      notes: "",
    };
    updateProviders([...providers, newProvider]);
  };

  const updateProvider = (index: number, field: keyof ServiceProvider, value: string) => {
    const updated = [...providers];
    updated[index] = { ...updated[index], [field]: value };
    updateProviders(updated);
  };

  const removeProvider = (index: number) => {
    updateProviders(providers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Service providers saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">🏠 Service Providers</h2>
          <p className="text-muted-foreground">
            Funeral homes, cemeteries, and other service providers.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        {providers.map((provider, index) => (
          <Card key={provider.id || index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Provider {index + 1}</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addProvider}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeProvider(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider Name</Label>
                <Input
                  value={provider.name || ""}
                  onChange={(e) => updateProvider(index, "name", e.target.value)}
                  placeholder="Name or business"
                />
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={provider.type || ""}
                  onValueChange={(value) => updateProvider(index, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={provider.phone || ""}
                  onChange={(e) => updateProvider(index, "phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={provider.email || ""}
                  onChange={(e) => updateProvider(index, "email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Company/Address</Label>
                <Input
                  value={provider.company || ""}
                  onChange={(e) => updateProvider(index, "company", e.target.value)}
                  placeholder="Company name or address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={provider.notes || ""}
                onChange={(e) => updateProvider(index, "notes", e.target.value)}
                placeholder="Additional details, contract info..."
                rows={2}
              />
            </div>
          </Card>
        ))}

        {providers.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No service providers added yet</p>
            <Button onClick={addProvider} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Provider
            </Button>
          </div>
        )}

        {providers.length > 0 && (
          <Button onClick={addProvider} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Provider
          </Button>
        )}
      </div>
    </div>
  );
};
