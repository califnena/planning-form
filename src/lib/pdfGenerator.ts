import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";

interface PlanData {
  prepared_by?: string;
  instructions_notes?: string;
  about_me_notes?: string;
  checklist_notes?: string;
  funeral_wishes_notes?: string;
  financial_notes?: string;
  insurance_notes?: string;
  property_notes?: string;
  pets_notes?: string;
  digital_notes?: string;
  legal_notes?: string;
  messages_notes?: string;
  [key: string]: any;
}

export const generatePlanPDF = (planData: PlanData) => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const marginBottom = 20;
  const lineHeight = 7;

  const checkPageBreak = (additionalSpace: number = 10) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  const addTitle = (title: string) => {
    checkPageBreak(15);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, 20, yPosition);
    yPosition += 10;
  };

  const addSection = (heading: string, content?: string) => {
    if (!content) return;
    
    checkPageBreak(20);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(heading, 20, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(content, 170);
    
    lines.forEach((line: string) => {
      checkPageBreak();
      pdf.text(line, 20, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 5;
  };

  // Cover page
  // Add logo at the top
  try {
    pdf.addImage(everlastingLogo, 'PNG', 80, 30, 50, 50);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }
  
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("My Final Wishes", 105, 95, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.text("End-of-Life Planning Guide", 105, 110, { align: "center" });
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "italic");
  pdf.text("Provided by Everlasting Funeral Advisors", 105, 125, { align: "center" });
  
  if (planData.prepared_by) {
    pdf.setFontSize(12);
    pdf.text(`Prepared for: ${planData.prepared_by}`, 105, 145, { align: "center" });
  }
  
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 160, { align: "center" });

  // Add sections
  pdf.addPage();
  yPosition = 20;

  addTitle("📝 Instructions");
  addSection("General Instructions", planData.instructions_notes);

  addTitle("🌟 About Me");
  addSection("About Me", planData.about_me_notes);

  addTitle("✅ Checklist");
  addSection("Checklist Notes", planData.checklist_notes);

  addTitle("🕊️ Funeral Wishes");
  addSection("Funeral Wishes", planData.funeral_wishes_notes);

  addTitle("💰 Financial Life");
  addSection("Financial Information", planData.financial_notes);

  addTitle("🛡️ Insurance");
  addSection("Insurance Information", planData.insurance_notes);

  addTitle("🏠 My Property");
  addSection("Property Information", planData.property_notes);
  
  // Add property documents if available
  if (planData.property?.items && Array.isArray(planData.property.items)) {
    planData.property.items.forEach((item: any, index: number) => {
      if (item.document) {
        checkPageBreak(60);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Property ${index + 1} Document: ${item.type || 'Untitled'}`, 20, yPosition);
        yPosition += 10;
        
        try {
          // Add the image to the PDF
          pdf.addImage(item.document, 'JPEG', 20, yPosition, 170, 100);
          yPosition += 110;
        } catch (error) {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "italic");
          pdf.text("(Document attached but could not be displayed in PDF)", 20, yPosition);
          yPosition += lineHeight;
        }
      }
    });
  }

  addTitle("🐾 My Pets");
  addSection("Pet Care Instructions", planData.pets_notes);

  addTitle("💻 Digital World");
  addSection("Digital Assets & Accounts", planData.digital_notes);

  addTitle("⚖️ Legal");
  addSection("Legal Documents & Information", planData.legal_notes);

  addTitle("❤️ Messages");
  addSection("Messages to Loved Ones", planData.messages_notes);

  // Footer on last page
  checkPageBreak(35);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Everlasting Funeral Advisors", 105, pageHeight - 25, { align: "center" });
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);
  pdf.text("Phone: (323) 863-5804", 105, pageHeight - 18, { align: "center" });
  pdf.text("Email: info@everlastingfuneraladvisors.com", 105, pageHeight - 13, { align: "center" });
  pdf.text("Website: https://everlastingfuneraladvisors.com", 105, pageHeight - 8, { align: "center" });
  pdf.text("Facebook: https://www.facebook.com/profile.php?id=61580859545223", 105, pageHeight - 3, { align: "center" });

  return pdf;
};
