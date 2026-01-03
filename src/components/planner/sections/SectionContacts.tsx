import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";

interface Contact {
  name: string;
  relationship: string;
  email: string;
  phone: string;
  note: string;
}

interface SectionContactsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionContacts = ({ data, onChange }: SectionContactsProps) => {
  // Merge both arrays into one unified "People to Notify" list
  const existingContacts = data.contacts || [];
  const existingImportantPeople = data.importantPeople || [];
  
  // Dedupe and merge on first render
  const contacts: Contact[] = (() => {
    const merged: Contact[] = [...existingContacts];
    const seen = new Set(existingContacts.map((c: Contact) => 
      `${c.name || ""}|${c.phone || ""}|${c.email || ""}`.toLowerCase()
    ));
    
    for (const person of existingImportantPeople) {
      const key = `${person.name || ""}|${person.phone || ""}|${person.email || ""}`.toLowerCase();
      if (!seen.has(key) || key === "||") {
        merged.push(person);
        seen.add(key);
      }
    }
    return merged;
  })();

  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();

  const addContact = () => {
    if (isPreviewMode) {
      toast({
        title: "Preview Mode",
        description: "Editing is locked. Start a trial to unlock.",
        variant: "destructive",
      });
      return;
    }
    onChange({
      ...data,
      contacts: [...contacts, { name: "", relationship: "", email: "", phone: "", note: "" }],
      importantPeople: [], // Clear legacy array
    });
  };

  const updateContact = (index: number, field: string, value: any) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ 
      ...data, 
      contacts: updated,
      importantPeople: [], // Clear legacy array
    });
  };

  const removeContact = (index: number) => {
    onChange({ 
      ...data, 
      contacts: contacts.filter((_: any, i: number) => i !== index),
      importantPeople: [], // Clear legacy array
    });
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
      description: t("contacts.saved"),
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

    // Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = "People to Notify";
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 20);

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const subtitle = `Contacts for ${data.personalInfo?.legalName || ""}`;
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 30);

    // Table headers
    let yPos = 45;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Name", 15, yPos);
    pdf.text("Relationship", 60, yPos);
    pdf.text("Email", 100, yPos);
    pdf.text("Phone", 140, yPos);

    // Draw header line
    pdf.setLineWidth(0.5);
    pdf.line(15, yPos + 2, pageWidth - 15, yPos + 2);

    // Table content
    yPos += 10;
    pdf.setFont("helvetica", "normal");

    contacts.forEach((contact: Contact) => {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.text(contact.name || "", 15, yPos);
      pdf.text(contact.relationship || "", 60, yPos);
      
      // Split email and phone to fit in smaller columns
      const email = contact.email || "";
      const phone = contact.phone || "";
      pdf.setFontSize(9);
      pdf.text(email.length > 20 ? email.substring(0, 18) + "..." : email, 100, yPos);
      pdf.text(phone, 140, yPos);
      pdf.setFontSize(10);

      if (contact.note) {
        yPos += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        const noteLines = pdf.splitTextToSize(`Note: ${contact.note}`, pageWidth - 30);
        pdf.text(noteLines, 15, yPos);
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        yPos += noteLines.length * 3;
      }

      yPos += 8;
    });

    // Add logo at bottom
    const logoWidth = 40;
    const logoHeight = 10;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = pageHeight - 20;
    
    pdf.addImage(everlastingLogo, "PNG", logoX, logoY, logoWidth, logoHeight);

    pdf.save("people-to-notify.pdf");
    
    toast({
      title: "Downloaded",
      description: "Contacts PDF has been generated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">People to Notify</h2>
          <p className="text-muted-foreground">People who should be contacted when needed</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" variant="default" disabled={isPreviewMode}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleDownloadContacts} size="sm" variant="outline" disabled={isPreviewMode}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={addContact} size="sm" variant="outline" disabled={isPreviewMode}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <PreviewModeWrapper>
        <div className="space-y-4">
        {contacts.map((contact: Contact, index: number) => (
          <div key={index} className="p-4 border border-border rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Contact {index + 1}</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContact(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <p className="text-xs text-muted-foreground">Full name of the person to notify</p>
                <Input
                  value={contact.name || ""}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                  placeholder="Full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Relationship (optional)</Label>
                <p className="text-xs text-muted-foreground">How they're related to you</p>
                <Input
                  value={contact.relationship || ""}
                  onChange={(e) => updateContact(index, "relationship", e.target.value)}
                  placeholder="e.g., Spouse, Child, Friend"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <p className="text-xs text-muted-foreground">Best phone number to reach them</p>
                <Input
                  type="tel"
                  value={contact.phone || ""}
                  onChange={(e) => updateContact(index, "phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-xs text-muted-foreground">Email address</p>
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
              <p className="text-xs text-muted-foreground">Any additional information about this contact</p>
              <Textarea
                value={contact.note || ""}
                onChange={(e) => updateContact(index, "note", e.target.value)}
                placeholder="Add special instructions or context..."
                rows={2}
              />
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
    </PreviewModeWrapper>
    </div>
  );
};