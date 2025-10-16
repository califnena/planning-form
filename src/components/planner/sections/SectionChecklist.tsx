import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";

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
  const { t } = useTranslation();

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
      title: t("common.saved"),
      description: t("checklist.saved"),
    });
  };

  const handleDownloadChecklist = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Title
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    const title = "Important Tasks Checklist";
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 20);

    // Subtitle
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const subtitle = "Tasks and reminders for loved ones to complete";
    const subtitleWidth = pdf.getTextWidth(subtitle);
    pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, 30);

    let yPos = 45;
    
    // Standard checklist items
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Standard Checklist Items:", 15, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    DEFAULT_CHECKLIST_ITEMS.forEach((item) => {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Checkbox
      pdf.rect(15, yPos - 3, 4, 4);
      pdf.text(item, 22, yPos);
      yPos += 7;
    });

    // Custom items
    if (customItems.length > 0) {
      yPos += 5;
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Custom Checklist Items:", 15, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      customItems.forEach((item: string) => {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Checkbox
        pdf.rect(15, yPos - 3, 4, 4);
        pdf.text(item || "(Empty item)", 22, yPos);
        yPos += 7;
      });
    }

    // Add logo at bottom
    const logoWidth = 40;
    const logoHeight = 10;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = pageHeight - 20;
    
    pdf.addImage(everlastingLogo, "PNG", logoX, logoY, logoWidth, logoHeight);

    pdf.save("checklist.pdf");
    
    toast({
      title: "Downloaded",
      description: "Checklist PDF has been generated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">✅ Checklist</h2>
          <p className="text-muted-foreground mb-2">
            Important tasks and reminders for your loved ones to complete.
          </p>
          <p className="text-sm text-muted-foreground italic">
            Check the boxes of the items you want your loved ones/caretaker to do.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={handleDownloadChecklist} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
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
                      variant="outline"
                      size="sm"
                      onClick={addCustomItem}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
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