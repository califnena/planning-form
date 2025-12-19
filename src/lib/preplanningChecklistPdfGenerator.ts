import jsPDF from "jspdf";
import logoImage from "@/assets/efa-logo.png";
import { PRE_PLANNING_CHECKLIST } from "./resourceDocuments";

export const generatePrePlanningChecklistPDF = async () => {
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
    checkboxGray: [200, 200, 200] as [number, number, number]
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
    pdf.text("EFA Pre-Planning Checklist – Everlasting Funeral Advisors", pageWidth / 2, pageHeight - 12, { align: "center" });
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

  const addSectionTitle = (title: string) => {
    checkPageBreak(25);
    
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text(title, marginLeft, yPosition);
    
    const titleWidth = pdf.getTextWidth(title);
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(1);
    pdf.line(marginLeft, yPosition + 2, marginLeft + titleWidth, yPosition + 2);
    
    yPosition += 12;
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

  pdf.setFontSize(26);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("EFA Pre-Planning Checklist", pageWidth / 2, 50, { align: "center" });

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Complete Your End-of-Life Planning", pageWidth / 2, 65, { align: "center" });

  // Purpose box
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(...colors.subheaderTeal);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(marginLeft, 80, pageWidth - marginLeft - marginRight, 35, 3, 3, 'FD');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Purpose:", marginLeft + 5, 90);
  
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  const purposeText = "Use this checklist to track your pre-planning progress. Check off items as you complete them in the Everlasting Funeral Advisors app. This document is for planning ahead—before death—to document your wishes and organize important information.";
  const purposeLines = pdf.splitTextToSize(purposeText, pageWidth - marginLeft - marginRight - 15);
  let pY = 98;
  purposeLines.forEach((line: string) => {
    pdf.text(line, marginLeft + 5, pY);
    pY += 6;
  });

  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 25, 130, 50, 50);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  pdf.setFontSize(10);
  pdf.text("Everlasting Funeral Advisors", pageWidth / 2, 195, { align: "center" });
  pdf.setFontSize(9);
  pdf.text("(323) 863-5804 | info@everlastingfuneraladvisors.com", pageWidth / 2, 203, { align: "center" });

  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 220, { align: "center" });

  addPageFooter();

  // Checklist Pages
  pdf.addPage();
  yPosition = 25;

  Object.entries(PRE_PLANNING_CHECKLIST).forEach(([section, items]) => {
    addSectionTitle(section);
    items.forEach(item => {
      addChecklistItem(item);
    });
    yPosition += 8;
  });

  addPageFooter();

  // Notes Page
  pdf.addPage();
  yPosition = 25;
  
  addSectionTitle("Additional Notes");
  
  pdf.setDrawColor(...colors.checkboxGray);
  pdf.setLineWidth(0.3);
  
  for (let i = 0; i < 25; i++) {
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

  pdf.save("EFA-Pre-Planning-Checklist.pdf");
};
