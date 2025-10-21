import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface Step11OtherPropertyProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

interface PropertyItem {
  category: string;
  description: string;
  location: string;
  estimatedValue: string;
  disposition: string;
  notes: string;
  completed: boolean;
}

export function Step11OtherProperty({ formData, onSave }: Step11OtherPropertyProps) {
  const [properties, setProperties] = useState<PropertyItem[]>(
    formData?.step11?.properties || [
      {
        category: "",
        description: "",
        location: "",
        estimatedValue: "",
        disposition: "",
        notes: "",
        completed: false,
      },
    ]
  );

  const [generalNotes, setGeneralNotes] = useState(formData?.step11?.generalNotes || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({
        step11: {
          properties,
          generalNotes,
        },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [properties, generalNotes]);

  const addProperty = () => {
    setProperties([
      ...properties,
      {
        category: "",
        description: "",
        location: "",
        estimatedValue: "",
        disposition: "",
        notes: "",
        completed: false,
      },
    ]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (index: number, field: keyof PropertyItem, value: any) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], [field]: value };
    setProperties(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Other Property & Possessions</h2>
        <p className="text-muted-foreground">
          Document vehicles, boats, jewelry, art, clothing, and other valuable possessions. Include details about location, value, and intended disposition.
        </p>
      </div>

      <div className="space-y-4">
        {properties.map((property, index) => (
          <Card key={index} className="p-6 space-y-4 border-primary/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Property Item {index + 1}
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`completed-${index}`}
                    checked={property.completed}
                    onCheckedChange={(checked) =>
                      updateProperty(index, "completed", checked)
                    }
                  />
                  <Label htmlFor={`completed-${index}`} className="text-sm cursor-pointer">
                    Completed
                  </Label>
                </div>
                {properties.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProperty(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`category-${index}`}>Category</Label>
                <Input
                  id={`category-${index}`}
                  placeholder="e.g., Vehicle, Jewelry, Art, Boat, Clothing"
                  value={property.category}
                  onChange={(e) => updateProperty(index, "category", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`location-${index}`}>Location/Storage</Label>
                <Input
                  id={`location-${index}`}
                  placeholder="Where is this item located?"
                  value={property.location}
                  onChange={(e) => updateProperty(index, "location", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${index}`}>Description</Label>
              <Textarea
                id={`description-${index}`}
                placeholder="Detailed description (make, model, year, identifying features, etc.)"
                value={property.description}
                onChange={(e) => updateProperty(index, "description", e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`value-${index}`}>Estimated Value</Label>
                <Input
                  id={`value-${index}`}
                  placeholder="Approximate value or appraisal"
                  value={property.estimatedValue}
                  onChange={(e) => updateProperty(index, "estimatedValue", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`disposition-${index}`}>Intended Disposition</Label>
                <Input
                  id={`disposition-${index}`}
                  placeholder="e.g., Sell, Keep, Donate, Specific Heir"
                  value={property.disposition}
                  onChange={(e) => updateProperty(index, "disposition", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${index}`}>Additional Notes</Label>
              <Textarea
                id={`notes-${index}`}
                placeholder="Title/registration info, insurance, special instructions, etc."
                value={property.notes}
                onChange={(e) => updateProperty(index, "notes", e.target.value)}
                rows={2}
              />
            </div>
          </Card>
        ))}

        <Button onClick={addProperty} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Property Item
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="generalNotes">General Notes</Label>
        <Textarea
          id="generalNotes"
          placeholder="Overall notes about property disposition, estate sale plans, storage units, etc."
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
