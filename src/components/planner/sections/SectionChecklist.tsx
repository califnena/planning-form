import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionChecklistProps {
  data: any;
  onChange: (data: any) => void;
}

const DEFAULT_CHECKLIST_ITEMS = [
  "Contact funeral home and arrange services",
  "Notify close family members and friends",
  "Locate will, trust documents, and insurance policies",
  "Contact attorney or executor of estate",
  "Notify employer (if applicable) and request benefits information",
  "Contact life insurance companies",
  "Notify banks and financial institutions",
  "Cancel subscriptions and recurring services",
  "Handle social media and digital accounts",
  "File for death certificate copies",
  "Contact Social Security Administration",
  "Notify mortgage company and property insurance",
  "Review and settle outstanding debts",
  "Transfer vehicle titles and registrations"
];

export const SectionChecklist = ({ data, onChange }: SectionChecklistProps) => {
  const customItems = data.checklist_items || [];
  const { toast } = useToast();

  const addCustomItem = () => {
    onChange({
      ...data,
      checklist_items: [...customItems, ""]
    });
  };

  const updateCustomItem = (index: number, value: string) => {
    const updated = [...customItems];
    updated[index] = value;
    onChange({ ...data, checklist_items: updated });
  };

  const removeCustomItem = (index: number) => {
    onChange({ 
      ...data, 
      checklist_items: customItems.filter((_: string, i: number) => i !== index) 
    });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Checklist has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">✅ Checklist</h2>
          <p className="text-muted-foreground">
            Important tasks and reminders for your loved ones to complete.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Standard Checklist Items:</h3>
          <div className="space-y-3">
            {DEFAULT_CHECKLIST_ITEMS.map((item: string, index: number) => (
              <div key={`default-${index}`} className="flex items-start gap-3">
                <Checkbox id={`default-check-${index}`} className="mt-1" />
                <label htmlFor={`default-check-${index}`} className="text-sm flex-1 cursor-pointer">
                  {item}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Custom Checklist Items:</h3>
            <Button onClick={addCustomItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Item
            </Button>
          </div>

          <div className="space-y-3">
            {customItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom items added yet.</p>
            ) : (
              customItems.map((item: string, index: number) => (
                <div key={`custom-${index}`} className="flex items-start gap-3">
                  <Checkbox id={`custom-check-${index}`} className="mt-3" />
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateCustomItem(index, e.target.value)}
                      placeholder="Enter custom task or reminder"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCustomItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};