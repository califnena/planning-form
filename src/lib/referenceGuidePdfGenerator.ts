import jsPDF from "jspdf";
import logoImage from "@/assets/efa-logo.png";
import {
  ACRONYM_DEFINITIONS,
  SECTION_LEARN_MORE,
  LEGAL_DISCLAIMER
} from "./resourceDocuments";

export const generateReferenceGuidePDF = async () => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 15;
  const marginBottom = 30;
  const lineHeight = 6;

  const colors = {
    headerNavy: [26, 46, 68] as [number, number, number],
    subheaderTeal: [14, 118, 118] as [number, number, number],
    bodyGray: [68, 68, 68] as [number, number, number],
    lightGray: [180, 180, 180] as [number, number, number],
    boxBg: [249, 250, 251] as [number, number, number],
    boxBorder: [220, 220, 220] as [number, number, number]
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
    pdf.text("EFA Integrated Reference Guide – Everlasting Funeral Advisors", pageWidth / 2, pageHeight - 12, { align: "center" });
  };

  const checkPageBreak = (additionalSpace: number = 20) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      addPageFooter();
      pdf.addPage();
      yPosition = 25;
    }
  };

  const addSectionTitle = (title: string) => {
    checkPageBreak(25);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text(title, marginLeft, yPosition);
    
    const titleWidth = pdf.getTextWidth(title);
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(1);
    pdf.line(marginLeft, yPosition + 2, marginLeft + titleWidth, yPosition + 2);
    
    yPosition += 12;
  };

  const addParagraph = (text: string, indent: number = 0) => {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...colors.bodyGray);
    
    const maxWidth = pageWidth - marginLeft - marginRight - indent;
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      pdf.text(line, marginLeft + indent, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 3;
  };

  // Cover Page
  pdf.setFillColor(...colors.subheaderTeal);
  pdf.rect(0, 0, pageWidth, 10, 'F');

  pdf.setFontSize(26);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("EFA Integrated Reference Guide", pageWidth / 2, 50, { align: "center" });

  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Understanding Your End-of-Life Planning Journey", pageWidth / 2, 65, { align: "center" });

  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 30, 85, 60, 60);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  pdf.setFontSize(11);
  pdf.text("Provided by Everlasting Funeral Advisors", pageWidth / 2, 160, { align: "center" });
  
  pdf.setFontSize(9);
  pdf.text("Phone: (323) 863-5804", pageWidth / 2, 172, { align: "center" });
  pdf.text("Email: info@everlastingfuneraladvisors.com", pageWidth / 2, 179, { align: "center" });
  pdf.text("Website: everlastingfuneraladvisors.com", pageWidth / 2, 186, { align: "center" });

  pdf.setFontSize(10);
  pdf.setTextColor(...colors.lightGray);
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 210, { align: "center" });

  addPageFooter();

  // Purpose Section
  pdf.addPage();
  yPosition = 25;
  
  addSectionTitle("Purpose of This Guide");
  addParagraph("This reference guide is designed to help you understand each section of the Everlasting Funeral Advisors planning app. Unlike checklists which focus on tasks, this guide explains WHY each piece of information matters and HOW it will help your loved ones.");
  addParagraph("Use this guide alongside the app to make informed decisions about your end-of-life planning. For each section, you'll find:");
  addParagraph("• An explanation of what the section covers", 10);
  addParagraph("• Why this information is important", 10);
  addParagraph("• How it connects to other parts of your plan", 10);
  yPosition += 5;

  // Related Documents Section
  addSectionTitle("Related EFA Documents");
  addParagraph("This Reference Guide works alongside two other important documents:");
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  pdf.text("EFA Pre-Planning Checklist", marginLeft + 10, yPosition);
  yPosition += lineHeight;
  pdf.setFont("helvetica", "normal");
  addParagraph("A task-focused checklist for completing your pre-planning. Use this before death to document your wishes.", 10);
  
  pdf.setFont("helvetica", "bold");
  pdf.text("EFA After-Death Planner & Checklist", marginLeft + 10, yPosition);
  yPosition += lineHeight;
  pdf.setFont("helvetica", "normal");
  addParagraph("A timeline-based guide for your loved ones to follow after your passing. Share this with your executor or trusted contacts.", 10);
  yPosition += 5;

  // App Section Explanations
  addSectionTitle("Understanding Each App Section");
  yPosition += 3;

  const sectionOrder = ['overview', 'instructions', 'personal', 'legacy', 'contacts', 'providers', 'funeral', 'financial', 'insurance', 'property', 'pets', 'digital', 'legal', 'messages'];

  sectionOrder.forEach((sectionId) => {
    const info = SECTION_LEARN_MORE[sectionId];
    if (info) {
      checkPageBreak(30);
      
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.subheaderTeal);
      pdf.text(info.title, marginLeft, yPosition);
      yPosition += 8;
      
      addParagraph(info.content);
      yPosition += 5;
    }
  });

  // Acronym Definitions
  pdf.addPage();
  yPosition = 25;
  
  addSectionTitle("Common Acronyms & Terms");
  addParagraph("You may encounter these terms during your planning process:");
  yPosition += 5;

  Object.entries(ACRONYM_DEFINITIONS).forEach(([acronym, definition]) => {
    checkPageBreak(20);
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text(acronym, marginLeft, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...colors.bodyGray);
    const lines = pdf.splitTextToSize(definition, pageWidth - marginLeft - marginRight - 10);
    lines.forEach((line: string) => {
      checkPageBreak(lineHeight);
      pdf.text(line, marginLeft + 10, yPosition);
      yPosition += lineHeight;
    });
    yPosition += 4;
  });

  // Legal Disclaimer
  pdf.addPage();
  yPosition = 25;
  
  addSectionTitle("Legal Disclaimer");
  
  const disclaimerLines = LEGAL_DISCLAIMER.trim().split('\n').filter(line => line.trim());
  disclaimerLines.forEach(line => {
    addParagraph(line.trim());
  });

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

  pdf.save("EFA-Integrated-Reference-Guide.pdf");
};
