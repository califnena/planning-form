import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";

interface PlanData {
  personal_profile?: {
    full_name?: string;
    address?: string;
    marital_status?: string;
    citizenship?: string;
    partner_name?: string;
    father_name?: string;
    mother_name?: string;
    children?: Array<{ name?: string; phone?: string; email?: string }>;
    dob?: string;
    religion?: string;
  };
  contacts_notify?: Array<{
    name?: string;
    relationship?: string;
    contact?: string;
  }>;
  funeral_wishes_notes?: string;
  instructions_notes?: string;
  legal_notes?: string;
  messages_notes?: string;
  property_notes?: string;
  financial_notes?: string;
  pets_notes?: string;
  [key: string]: any;
}

const colors = {
  headerNavy: [26, 46, 68] as [number, number, number],
  subheaderTeal: [14, 118, 118] as [number, number, number],
  bodyGray: [68, 68, 68] as [number, number, number],
  lightGray: [180, 180, 180] as [number, number, number],
  watermark: [200, 200, 200] as [number, number, number],
};

const addWatermark = (pdf: jsPDF) => {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  pdf.setTextColor(...colors.watermark);
  pdf.setFontSize(40);
  pdf.setFont("helvetica", "bold");
  
  // Diagonal watermark
  pdf.saveGraphicsState();
  const text = "NOT A LEGAL DOCUMENT";
  const textWidth = pdf.getTextWidth(text);
  
  // Center and rotate
  pdf.text(text, pageWidth / 2 - textWidth / 2 + 20, pageHeight / 2, {
    angle: 45,
  });
  pdf.restoreGraphicsState();
  
  pdf.setTextColor(...colors.bodyGray);
};

const addPageFooter = (pdf: jsPDF, footerText: string) => {
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  
  pdf.setDrawColor(...colors.subheaderTeal);
  pdf.setLineWidth(0.5);
  pdf.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.lightGray);
  pdf.text(footerText, pageWidth / 2, pageHeight - 12, { align: "center" });
};

const addHeader = (pdf: jsPDF, title: string, subtitle: string) => {
  const pageWidth = pdf.internal.pageSize.width;
  
  // Logo
  try {
    pdf.addImage(everlastingLogo, 'PNG', pageWidth - 35, 10, 20, 20);
  } catch (e) {
    console.log('Logo not loaded');
  }
  
  // Title
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text(title, 20, 25);
  
  // Subtitle
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.lightGray);
  pdf.text(subtitle, 20, 33);
  
  // Date
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.setFontSize(9);
  pdf.text(`Generated on: ${date}`, pageWidth - 20, 35, { align: "right" });
  pdf.text("Prepared by: Everlasting Funeral Advisors", pageWidth - 20, 42, { align: "right" });
  
  // Divider
  pdf.setDrawColor(...colors.subheaderTeal);
  pdf.setLineWidth(1);
  pdf.line(20, 48, pageWidth - 20, 48);
  
  return 55; // Starting Y position for content
};

const addSection = (
  pdf: jsPDF, 
  title: string, 
  content: string | string[], 
  y: number,
  pageHeight: number
): number => {
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  
  // Check if we need a new page
  if (y > pageHeight - 60) {
    pdf.addPage();
    addWatermark(pdf);
    y = 30;
  }
  
  // Section title
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text(title, margin, y);
  y += 8;
  
  // Section content
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  
  if (Array.isArray(content)) {
    content.forEach(line => {
      if (y > pageHeight - 40) {
        pdf.addPage();
        addWatermark(pdf);
        y = 30;
      }
      const lines = pdf.splitTextToSize(line, maxWidth - 10);
      pdf.text(lines, margin + 5, y);
      y += lines.length * 5 + 3;
    });
  } else {
    const lines = pdf.splitTextToSize(content, maxWidth);
    lines.forEach((line: string) => {
      if (y > pageHeight - 40) {
        pdf.addPage();
        addWatermark(pdf);
        y = 30;
      }
      pdf.text(line, margin, y);
      y += 5;
    });
  }
  
  return y + 8;
};

// PDF 1: Will Information Summary
export const generateWillSummaryPDF = (planData: PlanData): jsPDF => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  const profile = planData.personal_profile || {};
  const contacts = planData.contacts_notify || [];
  
  addWatermark(pdf);
  let y = addHeader(pdf, "Will Information Summary", "For planning and review only");
  
  // Personal Information
  y = addSection(pdf, "Personal Information", [
    `Full Name: ${profile.full_name || "Not provided"}`,
    `Date of Birth: ${profile.dob || "Not provided"}`,
    `Address: ${profile.address || "Not provided"}`,
    `State of Residence: ${profile.address?.split(",").pop()?.trim() || "Not provided"}`,
  ], y, pageHeight);
  
  // Family & Relationships
  const childNames = profile.children?.map(c => c.name).filter(Boolean).join(", ") || "Not listed";
  y = addSection(pdf, "Family & Relationships", [
    `Spouse / Partner: ${profile.partner_name || "Not listed"}`,
    `Children: ${childNames}`,
    `Other Dependents: See contacts list`,
  ], y, pageHeight);
  
  // Executor Preferences
  const executorContact = contacts.find(c => c.relationship?.toLowerCase().includes('executor'));
  const alternateExecutor = contacts.find(c => c.relationship?.toLowerCase().includes('alternate'));
  y = addSection(pdf, "Executor Preferences", [
    `Primary Executor: ${executorContact?.name || "Not designated"}`,
    `Alternate Executor: ${alternateExecutor?.name || "Not designated"}`,
  ], y, pageHeight);
  
  // Guardianship Wishes
  const guardianContact = contacts.find(c => c.relationship?.toLowerCase().includes('guardian'));
  y = addSection(pdf, "Guardianship Wishes (if applicable)", [
    `Preferred Guardian(s): ${guardianContact?.name || "Not designated"}`,
    `Notes: See special instructions section`,
  ], y, pageHeight);
  
  // Asset Overview
  y = addSection(pdf, "Asset Overview (High-Level)", [
    `Real Estate: ${planData.property_notes ? "Summary recorded" : "Not provided"}`,
    `Financial Accounts: ${planData.financial_notes ? "Summary recorded" : "Not provided"}`,
    `Personal Property Notes: See property section of plan`,
  ], y, pageHeight);
  
  // Special Instructions
  const instructions = planData.instructions_notes || planData.funeral_wishes_notes || "Not provided";
  y = addSection(pdf, "Special Instructions", [
    `Personal Wishes: ${instructions.slice(0, 200)}${instructions.length > 200 ? "..." : ""}`,
    `Notes to Family: See messages section of plan`,
  ], y, pageHeight);
  
  addPageFooter(pdf, "Not a Legal Document • For Review Only");
  
  return pdf;
};

// PDF 2: Will Outline (Draft for Review)
export const generateWillOutlinePDF = (planData: PlanData): jsPDF => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const profile = planData.personal_profile || {};
  const contacts = planData.contacts_notify || [];
  
  // Title Page
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Sample Will", pageWidth / 2, 80, { align: "center" });
  
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "italic");
  pdf.text("— For Review Only —", pageWidth / 2, 95, { align: "center" });
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  const disclaimer = pdf.splitTextToSize(
    "This document is a draft prepared for review. It is not a legally binding will and does not replace legal advice.",
    pageWidth - 60
  );
  pdf.text(disclaimer, pageWidth / 2, 130, { align: "center" });
  
  try {
    pdf.addImage(everlastingLogo, 'PNG', pageWidth / 2 - 15, 160, 30, 30);
  } catch (e) {
    console.log('Logo not loaded');
  }
  
  addPageFooter(pdf, "Draft for Review Only • Not a Legal Will");
  
  // Content pages
  pdf.addPage();
  addWatermark(pdf);
  let y = 30;
  
  // 1. Declaration
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("1. Declaration", 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  const declaration = `I, ${profile.full_name || "[Full Legal Name]"}, of ${profile.address || "[City, State]"}, being of sound mind and memory, do hereby declare this to be my Last Will and Testament, revoking all previous wills and codicils.`;
  const declLines = pdf.splitTextToSize(declaration, pageWidth - 50);
  pdf.text(declLines, 25, y);
  y += declLines.length * 5 + 15;
  
  // 2. Personal Information
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("2. Personal Information", 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text(`Name: ${profile.full_name || "[To be completed]"}`, 25, y);
  y += 7;
  pdf.text(`Residence: ${profile.address || "[To be completed]"}`, 25, y);
  y += 15;
  
  // 3. Family & Relationships
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("3. Family & Relationships", 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  let familyText = `I am currently ${profile.marital_status || "[marital status]"}.`;
  if (profile.partner_name) {
    familyText += ` My spouse/partner is ${profile.partner_name}.`;
  }
  if (profile.children && profile.children.length > 0) {
    const childNames = profile.children.map(c => c.name).filter(Boolean).join(", ");
    if (childNames) {
      familyText += ` I have ${profile.children.length} child(ren): ${childNames}.`;
    }
  }
  const famLines = pdf.splitTextToSize(familyText, pageWidth - 50);
  pdf.text(famLines, 25, y);
  y += famLines.length * 5 + 15;
  
  // 4. Appointment of Executor
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("4. Appointment of Executor", 20, y);
  y += 10;
  
  const executor = contacts.find(c => c.relationship?.toLowerCase().includes('executor'));
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  const execText = `I wish to appoint ${executor?.name || "[Executor Name to be designated]"} as the executor of my estate, with full authority to manage, distribute, and settle my affairs according to this Will.`;
  const execLines = pdf.splitTextToSize(execText, pageWidth - 50);
  pdf.text(execLines, 25, y);
  y += execLines.length * 5 + 15;
  
  // Check for new page
  if (y > pageHeight - 80) {
    pdf.addPage();
    addWatermark(pdf);
    y = 30;
  }
  
  // 5. Guardianship Preferences
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("5. Guardianship Preferences", 20, y);
  y += 10;
  
  const guardian = contacts.find(c => c.relationship?.toLowerCase().includes('guardian'));
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  const guardText = guardian 
    ? `If I have minor children, I wish to designate ${guardian.name} as their guardian.`
    : "If I have minor children, I wish to designate [Guardian Name] as their guardian, with [Alternate Guardian] as an alternate.";
  const guardLines = pdf.splitTextToSize(guardText, pageWidth - 50);
  pdf.text(guardLines, 25, y);
  y += guardLines.length * 5 + 15;
  
  // 6. Distribution Overview
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("6. Distribution Overview", 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  const distText = "It is my wish that my estate be distributed according to the following general intentions: [To be discussed with attorney based on asset information provided]...";
  const distLines = pdf.splitTextToSize(distText, pageWidth - 50);
  pdf.text(distLines, 25, y);
  y += distLines.length * 5 + 15;
  
  // 7. Special Wishes
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("7. Special Wishes", 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  const specialWishes = planData.instructions_notes || planData.funeral_wishes_notes || "[Special wishes to be added]...";
  const specialLines = pdf.splitTextToSize(specialWishes.slice(0, 300), pageWidth - 50);
  pdf.text(specialLines, 25, y);
  y += specialLines.length * 5 + 15;
  
  // Check for new page
  if (y > pageHeight - 60) {
    pdf.addPage();
    addWatermark(pdf);
    y = 30;
  }
  
  // 8. Closing Statement
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("8. Closing Statement", 20, y);
  y += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  const closingText = "In witness whereof, I have hereunto set my hand on this _____ day of __________, 20____.";
  pdf.text(closingText, 25, y);
  y += 20;
  
  pdf.text("_______________________________", 25, y);
  y += 7;
  pdf.text(`${profile.full_name || "[Signature]"}`, 25, y);
  
  addPageFooter(pdf, "Draft for Review Only • Not a Legal Will");
  
  return pdf;
};

// PDF 3: Attorney-Ready Preparation Template
export const generateAttorneyPrepPDF = (planData: PlanData, missingItems: string[]): jsPDF => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const profile = planData.personal_profile || {};
  const contacts = planData.contacts_notify || [];
  
  addWatermark(pdf);
  let y = addHeader(pdf, "Attorney Preparation Summary", "Prepared by client using Everlasting Funeral Advisors");
  
  // Section 1: Client Snapshot
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Section 1: Client Snapshot", 20, y);
  y += 10;
  
  // Draw box
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(220, 220, 220);
  pdf.roundedRect(20, y, pageWidth - 40, 35, 3, 3, 'FD');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text(`Name: ${profile.full_name || "—"}`, 25, y + 10);
  pdf.text(`State: ${profile.address?.split(",").pop()?.trim() || "—"}`, pageWidth / 2, y + 10);
  pdf.text(`Marital Status: ${profile.marital_status || "—"}`, 25, y + 22);
  pdf.text(`Children/Dependents: ${profile.children?.length || 0}`, pageWidth / 2, y + 22);
  y += 50;
  
  // Section 2: Decisions Made
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Section 2: Decisions Made", 20, y);
  y += 10;
  
  pdf.setFillColor(236, 253, 245);
  pdf.roundedRect(20, y, pageWidth - 40, 40, 3, 3, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(21, 128, 61);
  
  const hasExecutor = contacts.some(c => c.relationship?.toLowerCase().includes('executor'));
  const hasGuardian = contacts.some(c => c.relationship?.toLowerCase().includes('guardian'));
  const hasAssets = !!(planData.property_notes || planData.financial_notes);
  const hasInstructions = !!(planData.instructions_notes || planData.funeral_wishes_notes);
  
  let bulletY = y + 10;
  if (hasExecutor) {
    pdf.text("✓ Executor selected", 25, bulletY);
    bulletY += 7;
  }
  if (hasGuardian) {
    pdf.text("✓ Guardianship preferences noted", 25, bulletY);
    bulletY += 7;
  }
  if (hasAssets) {
    pdf.text("✓ General distribution intentions recorded", 25, bulletY);
    bulletY += 7;
  }
  if (hasInstructions) {
    pdf.text("✓ Special wishes documented", 25, bulletY);
    bulletY += 7;
  }
  
  y += 55;
  
  // Section 3: Items to Confirm with Attorney
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Section 3: Items to Confirm with Attorney", 20, y);
  y += 10;
  
  pdf.setFillColor(239, 246, 255);
  pdf.roundedRect(20, y, pageWidth - 40, 45, 3, 3, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(30, 64, 175);
  
  const confirmItems = [
    "• State-specific requirements",
    "• Witness / notarization rules",
    "• Asset titling and beneficiary alignment",
    "• Tax considerations",
    "• Trust considerations (if applicable)",
  ];
  
  bulletY = y + 10;
  confirmItems.forEach(item => {
    pdf.text(item, 25, bulletY);
    bulletY += 7;
  });
  
  y += 60;
  
  // Section 4: Open Questions
  if (missingItems.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text("Section 4: Open Questions", 20, y);
    y += 10;
    
    const boxHeight = Math.min(missingItems.length * 7 + 15, 50);
    pdf.setFillColor(254, 252, 232);
    pdf.roundedRect(20, y, pageWidth - 40, boxHeight, 3, 3, 'F');
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(161, 98, 7);
    
    bulletY = y + 10;
    missingItems.forEach(item => {
      pdf.text(`• ${item}`, 25, bulletY);
      bulletY += 7;
    });
    
    y += boxHeight + 15;
  }
  
  // Final disclaimer page
  if (y > pageHeight - 80) {
    pdf.addPage();
    addWatermark(pdf);
    y = 60;
  } else {
    y += 20;
  }
  
  // Final disclaimer
  pdf.setFillColor(254, 242, 242);
  pdf.setDrawColor(220, 38, 38);
  pdf.roundedRect(20, y, pageWidth - 40, 30, 3, 3, 'FD');
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(153, 27, 27);
  pdf.text("Important Disclaimer", pageWidth / 2, y + 12, { align: "center" });
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("This document is a preparation summary only and is not a legal will.", pageWidth / 2, y + 22, { align: "center" });
  
  addPageFooter(pdf, "Not a Legal Document • Attorney Preparation Summary");
  
  return pdf;
};
