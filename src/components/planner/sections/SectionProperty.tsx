import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionPropertyProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionProperty = ({ data, onChange }: SectionPropertyProps) => {
  const property = data.property || {};
  const items = property.items || [];
  const { toast } = useToast();

  const updateProperty = (field: string, value: any) => {
    onChange({
      ...data,
      property: { ...property, [field]: value }
    });
    
    // Auto-create item when checkbox is checked
    if (field.startsWith('has_') && value === true) {
      const propertyType = field.replace('has_', '').replace(/_/g, ' ');
      const typeCapitalized = propertyType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Check if item already exists for this type
      const existingItem = items.find((item: any) => 
        item.type?.toLowerCase() === propertyType.toLowerCase()
      );
      
      if (!existingItem) {
        addItemWithType(typeCapitalized);
      }
    }
  };

  const addItem = () => {
    updateProperty("items", [...items, { type: "", description: "", location: "", document: "" }]);
  };

  const addItemWithType = (type: string) => {
    updateProperty("items", [...items, { type, description: "", location: "", document: "" }]);
  };

  const handleFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateItem(index, "document", reader.result as string);
        toast({
          title: "Document attached",
          description: `${file.name} has been attached to this property.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    updateProperty("items", updated);
  };

  const removeItem = (index: number) => {
    updateProperty("items", items.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Property information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">🏠 My Property</h2>
          <p className="text-muted-foreground">
            Document all real estate, vehicles, and other significant property.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Property I Own</Label>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="primary_home"
              checked={property.has_primary_home || false}
              onCheckedChange={(checked) => updateProperty("has_primary_home", checked)}
            />
            <Label htmlFor="primary_home" className="font-normal">Primary residence</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vacation_home"
              checked={property.has_vacation_home || false}
              onCheckedChange={(checked) => updateProperty("has_vacation_home", checked)}
            />
            <Label htmlFor="vacation_home" className="font-normal">Vacation home</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="investment"
              checked={property.has_investment || false}
              onCheckedChange={(checked) => updateProperty("has_investment", checked)}
            />
            <Label htmlFor="investment" className="font-normal">Investment property</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="land"
              checked={property.has_land || false}
              onCheckedChange={(checked) => updateProperty("has_land", checked)}
            />
            <Label htmlFor="land" className="font-normal">Land or lots</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vehicles"
              checked={property.has_vehicles || false}
              onCheckedChange={(checked) => updateProperty("has_vehicles", checked)}
            />
            <Label htmlFor="vehicles" className="font-normal">Vehicles</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="boats_rvs"
              checked={property.has_boats_rvs || false}
              onCheckedChange={(checked) => updateProperty("has_boats_rvs", checked)}
            />
            <Label htmlFor="boats_rvs" className="font-normal">Boats or RVs</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="business"
              checked={property.has_business || false}
              onCheckedChange={(checked) => updateProperty("has_business", checked)}
            />
            <Label htmlFor="business" className="font-normal">Business ownership</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="valuables"
              checked={property.has_valuables || false}
              onCheckedChange={(checked) => updateProperty("has_valuables", checked)}
            />
            <Label htmlFor="valuables" className="font-normal">Jewelry, art, collectibles</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Property Details</Label>
          <Button onClick={addItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.map((item: any, index: number) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Property {index + 1}</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <p className="text-xs text-muted-foreground">e.g., House, Car, Business, Artwork, Jewelry</p>
              <Input
                value={item.type || ""}
                onChange={(e) => updateItem(index, "type", e.target.value)}
                placeholder="e.g., House, Car, Business, Artwork"
              />
            </div>
            <div className="space-y-2">
              <Label>Description & Details</Label>
              <p className="text-xs text-muted-foreground">Include address, value, mortgage info, or identifying details</p>
              <Textarea
                value={item.description || ""}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                placeholder="Address, make/model, value, mortgage info, title location, etc."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Document Location</Label>
              <p className="text-xs text-muted-foreground">Where deeds, titles, or purchase documents are stored</p>
              <Input
                value={item.location || ""}
                onChange={(e) => updateItem(index, "location", e.target.value)}
                placeholder="Where are the deeds, titles, or important documents?"
              />
            </div>
            <div className="space-y-2">
              <Label>Attach Document</Label>
              <p className="text-xs text-muted-foreground">Upload deed, title, or related document (will be included in PDF)</p>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(index, e)}
                  className="cursor-pointer"
                />
                {item.document && (
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <span className="text-sm text-muted-foreground">Document attached</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addItem}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateItem(index, "document", "")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No property items added yet</p>
            <Button onClick={addItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Item
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};