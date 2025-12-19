import jsPDF from "jspdf";
import logoImage from "@/assets/efa-logo.png";
import { AFTER_DEATH_CHECKLIST } from "./resourceDocuments";

export const generateAfterDeathChecklistPDF = async () => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 15;
  const marginBottom = 30;
  const lineHeight = 7;

  const colors = {
    headerNavy: [26, 46, 68] as [number, number, number],
    subheaderTeal: [14, 118, 118] as [number, number, number],
    bodyGray: [68, 68, 68] as [number, number, number],
    checkboxGray: [200, 200, 200] as [number, number, number],
    urgentRed: [180, 50, 50] as [number, number, number]
  };

  // Load logo
  let logoBase64 = "";
  try {
    const response = await fetch(logoImage);
    const blob = await response.blob();
    logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to load logo:", error);
  }

  const addPageFooter = () => {
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 20, pageWidth - marginRight, pageHeight - 20);
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text("EFA After-Death Planner & Checklist – Everlasting Funeral Advisors", pageWidth / 2, pageHeight - 12, { align: "center" });
  };

  const checkPageBreak = (additionalSpace: number = 15) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      addPageFooter();
      pdf.addPage();
      yPosition = 25;
    }
  };

  const addCheckbox = (x: number, y: number) => {
    pdf.setDrawColor(...colors.checkboxGray);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y - 4, 4, 4);
  };

  const addTimelineTitle = (title: string, isUrgent: boolean = false) => {
    checkPageBreak(30);
    
    // Timeline badge
    const badgeWidth = pdf.getTextWidth(title) + 20;
    const badgeColor = isUrgent ? colors.urgentRed : colors.subheaderTeal;
    pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    pdf.roundedRect(marginLeft, yPosition - 6, badgeWidth, 10, 2, 2, 'F');
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(255, 255, 255);
    pdf.text(title, marginLeft + 10, yPosition);
    
    yPosition += 14;
  };

  const addChecklistItem = (text: string) => {
    checkPageBreak(lineHeight + 2);
    
    addCheckbox(marginLeft, yPosition);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...colors.bodyGray);
    
    const maxWidth = pageWidth - marginLeft - marginRight - 12;
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string, index: number) => {
      if (index > 0) {
        checkPageBreak(lineHeight);
      }
      pdf.text(line, marginLeft + 8, yPosition);
      if (index < lines.length - 1) {
        yPosition += lineHeight;
      }
    });
    yPosition += lineHeight + 1;
  };

  // Cover Page
  pdf.setFillColor(...colors.subheaderTeal);
  pdf.rect(0, 0, pageWidth, 10, 'F');

  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("EFA After-Death Planner", pageWidth / 2, 45, { align: "center" });
  pdf.text("& Checklist", pageWidth / 2, 57, { align: "center" });

  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Essential Steps for Loved Ones, Executors, and Trusted Contacts", pageWidth / 2, 72, { align: "center" });

  // Purpose box
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(...colors.subheaderTeal);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(marginLeft, 85, pageWidth - marginLeft - marginRight, 45, 3, 3, 'FD');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("For the Person Handling Affairs:", marginLeft + 5, 95);
  
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  const purposeText = "This checklist guides you through essential tasks following the death of a loved one. Items are organized by timeline to help you prioritize what needs to happen first. Take it one step at a time. You don't have to do everything at once, and it's okay to ask for help.";
  const purposeLines = pdf.splitTextToSize(purposeText, pageWidth - marginLeft - marginRight - 15);
  let pY = 105;
  purposeLines.forEach((line: string) => {
    pdf.text(line, marginLeft + 5, pY);
    pY += 6;
  });

  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 25, 140, 50, 50);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  pdf.setFontSize(10);
  pdf.text("Everlasting Funeral Advisors", pageWidth / 2, 205, { align: "center" });
  pdf.setFontSize(9);
  pdf.text("(323) 863-5804 | info@everlastingfuneraladvisors.com", pageWidth / 2, 213, { align: "center" });

  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 230, { align: "center" });

  addPageFooter();

  // Checklist Pages
  pdf.addPage();
  yPosition = 25;

  const timelineOrder = ['First 24-48 Hours', 'First Week', 'First Month', '3-12 Months'];
  
  timelineOrder.forEach((timeline, index) => {
    const items = AFTER_DEATH_CHECKLIST[timeline];
    if (items) {
      addTimelineTitle(timeline, index === 0);
      items.forEach(item => {
        addChecklistItem(item);
      });
      yPosition += 10;
    }
  });

  addPageFooter();

  // Important Contacts Page
  pdf.addPage();
  yPosition = 25;
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Important Contacts & Information", marginLeft, yPosition);
  yPosition += 15;

  const contactFields = [
    'Funeral Home:',
    'Attorney:',
    'Accountant/CPA:',
    'Insurance Agent:',
    'Bank/Financial Advisor:',
    'Employer HR Contact:',
    'Social Security Office:',
    'Emergency Contact 1:',
    'Emergency Contact 2:',
    'Other:'
  ];

  contactFields.forEach(field => {
    checkPageBreak(20);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.bodyGray);
    pdf.text(field, marginLeft, yPosition);
    yPosition += 6;
    
    pdf.setDrawColor(...colors.checkboxGray);
    pdf.setLineWidth(0.3);
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 4;
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10;
  });

  addPageFooter();

  // Notes Page
  pdf.addPage();
  yPosition = 25;
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Notes", marginLeft, yPosition);
  yPosition += 15;
  
  pdf.setDrawColor(...colors.checkboxGray);
  pdf.setLineWidth(0.3);
  
  for (let i = 0; i < 28; i++) {
    checkPageBreak(lineHeight + 2);
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += lineHeight + 2;
  }

  addPageFooter();

  // Update page numbers
  const totalPages = pdf.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - marginRight, pageHeight - 12, { align: "right" });
  }

  pdf.save("EFA-After-Death-Planner-Checklist.pdf");
};
