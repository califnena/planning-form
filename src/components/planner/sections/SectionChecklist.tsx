import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionChecklistProps {
  data: any;
  onChange: (data: any) => void;
}

const standardItems = [
  "Obtain death certificates (typically need 10-15 copies)",
  "Notify Social Security Administration",
  "Contact life insurance companies",
  "Notify employer and/or pension plan",
  "Contact banks and financial institutions",
  "Notify credit card companies",
  "Cancel subscriptions and memberships",
  "Forward mail through USPS",
  "Update property titles and deeds",
  "File final tax return",
];

export const SectionChecklist = ({ data, onChange }: SectionChecklistProps) => {
  const customChecklists = data.custom_checklists || [];
  const { toast } = useToast();

  const addChecklist = () => {
    onChange({
      ...data,
      custom_checklists: [...customChecklists, { title: "", items: [""] }]
    });
  };

  const updateChecklistTitle = (index: number, title: string) => {
    const updated = [...customChecklists];
    updated[index] = { ...updated[index], title };
    onChange({ ...data, custom_checklists: updated });
  };

  const addItemToChecklist = (checklistIndex: number) => {
    const updated = [...customChecklists];
    updated[checklistIndex].items = [...updated[checklistIndex].items, ""];
    onChange({ ...data, custom_checklists: updated });
  };

  const updateChecklistItem = (checklistIndex: number, itemIndex: number, value: string) => {
    const updated = [...customChecklists];
    updated[checklistIndex].items[itemIndex] = value;
    onChange({ ...data, custom_checklists: updated });
  };

  const removeChecklistItem = (checklistIndex: number, itemIndex: number) => {
    const updated = [...customChecklists];
    updated[checklistIndex].items = updated[checklistIndex].items.filter((_: string, i: number) => i !== itemIndex);
    onChange({ ...data, custom_checklists: updated });
  };

  const removeChecklist = (index: number) => {
    onChange({ 
      ...data, 
      custom_checklists: customChecklists.filter((_: any, i: number) => i !== index) 
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Standard Tasks:</h3>
          <Button onClick={() => {
            const currentChecklist = customChecklists[0] || { title: "Custom Tasks", items: [] };
            const newItems = [...currentChecklist.items, ...standardItems];
            const updatedChecklists = customChecklists.length > 0 
              ? [{ ...currentChecklist, items: newItems }, ...customChecklists.slice(1)]
              : [{ title: "Custom Tasks", items: newItems }];
            
            onChange({
              ...data,
              custom_checklists: updatedChecklists
            });
            toast({
              title: "Standard tasks integrated",
              description: "All standard tasks have been added to your custom checklist.",
            });
          }} size="sm" variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Integrate Standard Tasks
          </Button>
        </div>
        {standardItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <Checkbox id={`check-${index}`} className="mt-1" />
            <label
              htmlFor={`check-${index}`}
              className="text-sm leading-relaxed cursor-pointer"
            >
              {item}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Custom Checklists:</h3>
          <Button onClick={addChecklist} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Checklist
          </Button>
        </div>

        {customChecklists.map((checklist: any, checklistIndex: number) => (
          <Card key={checklistIndex} className="p-4 space-y-4">
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Label>Checklist Title</Label>
                <p className="text-xs text-muted-foreground">Name for this custom checklist category</p>
                <Input
                  value={checklist.title || ""}
                  onChange={(e) => updateChecklistTitle(checklistIndex, e.target.value)}
                  placeholder="e.g., Financial Tasks, Social Media"
                  className="mt-2"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeChecklist(checklistIndex)}
                className="mt-7"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addItemToChecklist(checklistIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
              {checklist.items.map((item: string, itemIndex: number) => (
                <div key={itemIndex} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateChecklistItem(checklistIndex, itemIndex, e.target.value)}
                    placeholder="Enter task or item"
                  />
                  {checklist.items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(checklistIndex, itemIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {customChecklists.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No custom checklists yet</p>
            <Button onClick={addChecklist} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Checklist
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};