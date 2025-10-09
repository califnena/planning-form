import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";

interface SectionContactsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionContacts = ({ data, onChange }: SectionContactsProps) => {
  const contacts = data.contacts || [];

  const addContact = () => {
    onChange({
      ...data,
      contacts: [...contacts, { name: "", relationship: "", contact: "", auto_notify: false }]
    });
  };

  const updateContact = (index: number, field: string, value: any) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, contacts: updated });
  };

  const removeContact = (index: number) => {
    onChange({ ...data, contacts: contacts.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Key Contacts to Notify</h2>
          <p className="text-muted-foreground">People who should be contacted immediately</p>
        </div>
        <Button onClick={addContact} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact: any, index: number) => (
          <div key={index} className="p-4 border border-border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Contact {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeContact(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={contact.name || ""}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Input
                  value={contact.relationship || ""}
                  onChange={(e) => updateContact(index, "relationship", e.target.value)}
                  placeholder="e.g., Spouse, Child, Friend"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Info</Label>
                <Input
                  value={contact.contact || ""}
                  onChange={(e) => updateContact(index, "contact", e.target.value)}
                  placeholder="Phone or email"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`auto-${index}`}
                checked={contact.auto_notify || false}
                onCheckedChange={(checked) => updateContact(index, "auto_notify", checked)}
              />
              <Label htmlFor={`auto-${index}`} className="text-sm font-normal">
                Auto-notify this contact when plan is activated
              </Label>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No contacts added yet</p>
            <Button onClick={addContact} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
