import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionChecklistProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionChecklist = ({ data, onChange }: SectionChecklistProps) => {
  const checklistItems = data.checklist_items || [""];
  const { toast } = useToast();

  const addItem = () => {
    onChange({
      ...data,
      checklist_items: [...checklistItems, ""]
    });
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...checklistItems];
    updated[index] = value;
    onChange({ ...data, checklist_items: updated });
  };

  const removeItem = (index: number) => {
    if (checklistItems.length === 1) {
      // Keep at least one item
      onChange({ ...data, checklist_items: [""] });
    } else {
      onChange({ 
        ...data, 
        checklist_items: checklistItems.filter((_: string, i: number) => i !== index) 
      });
    }
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

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Checklist Items:</h3>
          <Button onClick={addItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {checklistItems.map((item: string, index: number) => (
            <div key={index} className="flex items-start gap-3">
              <Checkbox id={`check-${index}`} className="mt-3" />
              <div className="flex-1 flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder="Enter task or reminder"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  disabled={checklistItems.length === 1 && !item}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};