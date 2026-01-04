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
import { Trash2, Plus, Save, Download, Users, Briefcase, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";
import type { UnifiedContact } from "@/lib/normalizePlanPayload";

interface SectionContactsProps {
  data: any;
  onChange: (data: any) => void;
}

const CONTACT_TYPES = [
  { value: "person", label: "Person (Family/Friend)", icon: Users },
  { value: "professional", label: "Professional (Attorney, etc.)", icon: Briefcase },
  { value: "service", label: "Service Provider (Funeral Home, etc.)", icon: Building2 },
] as const;

const ROLE_OPTIONS: Record<string, string[]> = {
  person: ["Spouse", "Child", "Parent", "Sibling", "Friend", "Neighbor", "Executor", "Other"],
  professional: ["Attorney", "Accountant", "Financial Advisor", "Insurance Agent", "Doctor", "Clergy", "Estate Planner", "Other"],
  service: ["Funeral Home", "Cemetery", "Crematory", "Florist", "Caterer", "Transportation", "Venue", "Other"],
};

/**
 * SectionContacts - Unified contacts section
 * 
 * CANONICAL KEY: contacts (array of UnifiedContact in plan_payload)
 */
export const SectionContacts = ({ data, onChange }: SectionContactsProps) => {
  const contacts: UnifiedContact[] = data.contacts || [];
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();

  const updateContacts = (updated: UnifiedContact[]) => {
    onChange({
      ...data,
      contacts: updated,
      // Clear legacy arrays on save
      contacts_professional: [],
      service_providers: [],
      importantPeople: [],
    });
    
    if (import.meta.env.DEV) {
      console.log("[SectionContacts] Updated unified contacts:", updated.length);
    }
  };

  const addContact = (type: "person" | "service" | "professional" = "person") => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "Editing is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    const newContact: UnifiedContact = {
      id: crypto.randomUUID(),
      name: "",
      contact_type: type,
      organization: "",
      role: "",
      phone: "",
      email: "",
      notes: "",
    };
    updateContacts([...contacts, newContact]);
  };

  const updateContact = (index: number, field: keyof UnifiedContact, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    updateContacts(updated);
  };

  const removeContact = (index: number) => {
    updateContacts(contacts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "Editing is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: t("common.saved"),
      description: "Contacts saved.",
    });
  };

  const handleDownloadContacts = async () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "PDF export is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = "Important Contacts";
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 20);

    let yPos = 40;

    // Group by contact type
    const grouped = {
      person: contacts.filter(c => c.contact_type === "person"),
      professional: contacts.filter(c => c.contact_type === "professional"),
      service: contacts.filter(c => c.contact_type === "service"),
    };

    for (const [type, list] of Object.entries(grouped)) {
      if (list.length === 0) continue;

      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = 20;
      }

      const typeLabel = type === "person" ? "People to Notify" : type === "professional" ? "Professional Contacts" : "Service Providers";
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(typeLabel, 15, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      for (const contact of list) {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFont("helvetica", "bold");
        pdf.text(contact.name || "Unnamed", 15, yPos);
        pdf.setFont("helvetica", "normal");
        
        if (contact.role) {
          pdf.text(` - ${contact.role}`, 15 + pdf.getTextWidth(contact.name || "Unnamed"), yPos);
        }
        yPos += 5;

        if (contact.organization) {
          pdf.text(`Organization: ${contact.organization}`, 20, yPos);
          yPos += 4;
        }
        if (contact.phone) {
          pdf.text(`Phone: ${contact.phone}`, 20, yPos);
          yPos += 4;
        }
        if (contact.email) {
          pdf.text(`Email: ${contact.email}`, 20, yPos);
          yPos += 4;
        }
        if (contact.notes) {
          const noteLines = pdf.splitTextToSize(`Notes: ${contact.notes}`, pageWidth - 40);
          pdf.text(noteLines, 20, yPos);
          yPos += noteLines.length * 4;
        }
        yPos += 4;
      }
      yPos += 6;
    }

    // Add logo at bottom
    const logoWidth = 40;
    const logoHeight = 10;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = pageHeight - 20;
    pdf.addImage(everlastingLogo, "PNG", logoX, logoY, logoWidth, logoHeight);

    pdf.save("contacts.pdf");
    
    toast({
      title: "Downloaded",
      description: "Contacts PDF has been generated.",
    });
  };

  const getContactIcon = (type: string) => {
    const config = CONTACT_TYPES.find(t => t.value === type);
    if (!config) return Users;
    return config.icon;
  };

  const getRoleOptions = (type: string) => {
    return ROLE_OPTIONS[type] || ROLE_OPTIONS.person;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold mb-2">Important Contacts</h2>
          <p className="text-muted-foreground">Family, friends, professionals, and service providers</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSave} size="sm" variant="default" disabled={isPreviewMode}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleDownloadContacts} size="sm" variant="outline" disabled={isPreviewMode}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => addContact("person")} size="sm" variant="outline" disabled={isPreviewMode}>
          <Users className="h-4 w-4 mr-2" />
          Add Person
        </Button>
        <Button onClick={() => addContact("professional")} size="sm" variant="outline" disabled={isPreviewMode}>
          <Briefcase className="h-4 w-4 mr-2" />
          Add Professional
        </Button>
        <Button onClick={() => addContact("service")} size="sm" variant="outline" disabled={isPreviewMode}>
          <Building2 className="h-4 w-4 mr-2" />
          Add Service Provider
        </Button>
      </div>

      <PreviewModeWrapper>
        <div className="space-y-4">
          {contacts.map((contact, index) => {
            const Icon = getContactIcon(contact.contact_type);
            const roleOptions = getRoleOptions(contact.contact_type);
            
            return (
              <Card key={contact.id || index} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">
                      {contact.name || `New ${CONTACT_TYPES.find(t => t.value === contact.contact_type)?.label || "Contact"}`}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={contact.name || ""}
                      onChange={(e) => updateContact(index, "name", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={contact.contact_type}
                      onValueChange={(value) => updateContact(index, "contact_type", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Role/Relationship</Label>
                    <Select
                      value={contact.role || ""}
                      onValueChange={(value) => updateContact(index, "role", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Organization/Company</Label>
                    <Input
                      value={contact.organization || ""}
                      onChange={(e) => updateContact(index, "organization", e.target.value)}
                      placeholder="Company or organization name"
                    />
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
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={contact.notes || ""}
                    onChange={(e) => updateContact(index, "notes", e.target.value)}
                    placeholder="Additional information..."
                    rows={2}
                  />
                </div>
              </Card>
            );
          })}

          {contacts.length === 0 && (
            <div className="text-center py-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">No contacts added yet</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => addContact("person")} variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Person
                </Button>
                <Button onClick={() => addContact("professional")} variant="outline">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Add Professional
                </Button>
                <Button onClick={() => addContact("service")} variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add Service Provider
                </Button>
              </div>
            </div>
          )}
        </div>
      </PreviewModeWrapper>
    </div>
  );
};