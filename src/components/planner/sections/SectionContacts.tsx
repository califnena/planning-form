import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";

interface SectionContactsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionContacts = ({ data, onChange }: SectionContactsProps) => {
  const contacts = data.contacts || [];
  const { toast } = useToast();

  const addContact = () => {
    onChange({
      ...data,
      contacts: [...contacts, { name: "", relationship: "", email: "", phone: "", note: "" }]
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

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Contact information has been saved.",
    });
  };

  const handleDownloadContacts = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = "Key Contacts";
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

    contacts.forEach((contact: any, index: number) => {
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

    pdf.save("key-contacts.pdf");
    
    toast({
      title: "Downloaded",
      description: "Key contacts PDF has been generated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Key Contacts to Notify</h2>
          <p className="text-muted-foreground">People who should be contacted immediately</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm" variant="default">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleDownloadContacts} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={addContact} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {contacts.map((contact: any, index: number) => (
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
                <Label>Relationship</Label>
                <p className="text-xs text-muted-foreground">How they're related to you</p>
                <Input
                  value={contact.relationship || ""}
                  onChange={(e) => updateContact(index, "relationship", e.target.value)}
                  placeholder="e.g., Spouse, Child, Friend"
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
    </div>
  );
};
