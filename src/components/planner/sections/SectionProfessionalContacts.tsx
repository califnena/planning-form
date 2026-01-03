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

interface ProfessionalContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  company: string;
  notes: string;
}

interface SectionProfessionalContactsProps {
  data: any;
  onChange: (data: any) => void;
}

const ROLE_OPTIONS = [
  "Attorney",
  "Accountant",
  "Financial Advisor",
  "Insurance Agent",
  "Doctor",
  "Clergy/Religious Leader",
  "Funeral Director",
  "Estate Planner",
  "Real Estate Agent",
  "Other",
];

/**
 * SectionProfessionalContacts
 * 
 * CANONICAL KEY: contacts_professional (array in plan_payload)
 */
export const SectionProfessionalContacts = ({ data, onChange }: SectionProfessionalContactsProps) => {
  const contacts: ProfessionalContact[] = data.contacts_professional || [];
  const { toast } = useToast();

  const updateContacts = (updated: ProfessionalContact[]) => {
    onChange({
      ...data,
      contacts_professional: updated,
    });
    
    if (import.meta.env.DEV) {
      console.log("[SectionProfessionalContacts] Updated contacts_professional:", updated.length);
    }
  };

  const addContact = () => {
    const newContact: ProfessionalContact = {
      id: crypto.randomUUID(),
      name: "",
      role: "",
      phone: "",
      email: "",
      company: "",
      notes: "",
    };
    updateContacts([...contacts, newContact]);
  };

  const updateContact = (index: number, field: keyof ProfessionalContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    updateContacts(updated);
  };

  const removeContact = (index: number) => {
    updateContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Professional contacts saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">👔 Professional Contacts</h2>
          <p className="text-muted-foreground">
            Attorneys, accountants, financial advisors, and other professionals.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact, index) => (
          <Card key={contact.id || index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Contact {index + 1}</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addContact}>
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeContact(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={contact.name || ""}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Role/Type</Label>
                <Select
                  value={contact.role || ""}
                  onValueChange={(value) => updateContact(index, "role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={contact.phone || ""}
                  onChange={(e) => updateContact(index, "phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email || ""}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Company/Firm</Label>
                <Input
                  value={contact.company || ""}
                  onChange={(e) => updateContact(index, "company", e.target.value)}
                  placeholder="Company or firm name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={contact.notes || ""}
                onChange={(e) => updateContact(index, "notes", e.target.value)}
                placeholder="Additional details..."
                rows={2}
              />
            </div>
          </Card>
        ))}

        {contacts.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No professional contacts added yet</p>
            <Button onClick={addContact} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        )}

        {contacts.length > 0 && (
          <Button onClick={addContact} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Contact
          </Button>
        )}
      </div>
    </div>
  );
};
