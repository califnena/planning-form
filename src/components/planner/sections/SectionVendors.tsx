import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionVendorsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionVendors = ({ data, onChange }: SectionVendorsProps) => {
  const vendors = data.vendors || [];
  const { toast } = useToast();

  const addVendor = () => {
    onChange({
      ...data,
      vendors: [...vendors, { vendor_type: "", company_name: "", contact: "", notes: "" }]
    });
  };

  const updateVendor = (index: number, field: string, value: any) => {
    const updated = [...vendors];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, vendors: updated });
  };

  const removeVendor = (index: number) => {
    onChange({ ...data, vendors: vendors.filter((_: any, i: number) => i !== index) });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Vendor information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Preferred Vendors</h2>
          <p className="text-muted-foreground">Service providers you recommend</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" variant="default">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={addVendor} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {vendors.map((vendor: any, index: number) => (
          <div key={index} className="p-4 border border-border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Vendor {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeVendor(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vendor Type</Label>
                <Input
                  value={vendor.vendor_type || ""}
                  onChange={(e) => updateVendor(index, "vendor_type", e.target.value)}
                  placeholder="e.g., Funeral Home, Attorney, Florist"
                />
              </div>

              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={vendor.company_name || ""}
                  onChange={(e) => updateVendor(index, "company_name", e.target.value)}
                  placeholder="Company or business name"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Information</Label>
                <Input
                  value={vendor.contact || ""}
                  onChange={(e) => updateVendor(index, "contact", e.target.value)}
                  placeholder="Phone, email, or address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={vendor.notes || ""}
                onChange={(e) => updateVendor(index, "notes", e.target.value)}
                placeholder="Any special instructions or preferences"
                rows={2}
              />
            </div>
          </div>
        ))}

        {vendors.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No vendors added yet</p>
            <Button onClick={addVendor} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vendor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
