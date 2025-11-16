import jsPDF from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";
import {
  hasFinancialData,
  hasInsuranceData,
  hasPropertyData,
  hasPetsData,
  hasDigitalData,
  hasLegalData,
  hasMessagesData
} from "./pdf_helpers";
import { pdfLabels } from "./pdfTranslations";

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
  _visibleSections?: string[];
  [key: string]: any;
}

export const generatePlanPDF = (planData: PlanData) => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 15; // 0.75" for hole punch space
  const marginBottom = 35;
  const lineHeight = 6;
  const tableOfContents: { title: string; page: number }[] = [];
  
  // Get visible sections
  const visibleSections = new Set(planData._visibleSections || [
    "overview", "instructions", "personal", "legacy", "contacts", 
    "providers", "funeral", "financial", "insurance", "property", 
    "pets", "digital", "legal", "messages", "resources", "faq"
  ]);
  
  const isSectionVisible = (sectionId: string) => visibleSections.has(sectionId);
  
  // Color palette
  const colors = {
    headerNavy: [26, 46, 68] as [number, number, number],      // #1A2E44
    subheaderTeal: [14, 118, 118] as [number, number, number], // #0E7676
    bodyGray: [68, 68, 68] as [number, number, number],        // #444444
    lightGray: [180, 180, 180] as [number, number, number],
    boxBg: [249, 250, 251] as [number, number, number],        // Light background for form boxes
    boxBorder: [220, 220, 220] as [number, number, number]     // Subtle gray border
  };
  
  // Get legal name for footer
  const profile = planData.personal_profile || {};
  const legalName = profile.full_name || profile.legal_name || "My Final Wishes";

  // Helper to sanitize text for PDF (handle special characters)
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, '-') // Replace em/en dashes
      .replace(/\u2026/g, '...') // Replace ellipsis
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, ''); // Remove dingbats
  };

  // Helper to add page footer with number
  const addPageFooter = (totalPages?: number) => {
    const currentPage = pdf.internal.pages.length - 1;
    
    // Add small logo to top right (except on cover and TOC pages)
    if (currentPage > 2) {
      try {
        const logoSize = 12;
        pdf.addImage(everlastingLogo, 'PNG', pageWidth - marginRight - logoSize, 8, logoSize, logoSize);
      } catch (error) {
        console.error('Error adding logo to page:', error);
      }
    }
    
    // Add teal line at bottom
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 23, pageWidth - marginRight, pageHeight - 23);
    
    // Add footer text
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text(pdfLabels.providedBy(), pageWidth / 2, pageHeight - 15, { align: "center" });
    
    // Add page number with legal name - bold and black
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    const pageNumText = totalPages ? `${pdfLabels.pageOf()} ${currentPage} ${pdfLabels.of()} ${totalPages} (${legalName})` : `${pdfLabels.pageOf()} ${currentPage} (${legalName})`;
    pdf.text(pageNumText, pageWidth / 2, pageHeight - 8, { align: "center" });
    
    pdf.setTextColor(...colors.bodyGray);
  };
  
  // Helper to add small logo to bottom right of page (legacy)
  const addPageLogo = () => {
    addPageFooter();
  };

  const checkPageBreak = (additionalSpace: number = 10) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Helper to add checkbox (modern square with optional check)
  const addCheckbox = (x: number, y: number, checked: boolean = false) => {
    const size = 4;
    pdf.setDrawColor(...colors.bodyGray);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y - size + 1, size, size, 0.5, 0.5, 'S');
    
    if (checked) {
      pdf.setFillColor(...colors.subheaderTeal);
      pdf.setDrawColor(...colors.subheaderTeal);
      pdf.roundedRect(x + 0.5, y - size + 1.5, size - 1, size - 1, 0.3, 0.3, 'F');
    }
  };

  const addTitle = (title: string, addToTOC: boolean = true) => {
    checkPageBreak(20);
    
    // Add to table of contents
    if (addToTOC) {
      const currentPage = pdf.internal.pages.length - 1;
      tableOfContents.push({ title, page: currentPage });
    }
    
    // Modern section header with teal underline
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text(sanitizeText(title), marginLeft, yPosition);
    
    // Teal underline
    const titleWidth = pdf.getTextWidth(sanitizeText(title));
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(1.5);
    pdf.line(marginLeft, yPosition + 2, marginLeft + titleWidth, yPosition + 2);
    
    pdf.setTextColor(...colors.bodyGray);
    yPosition += 14;
  };

  const addSection = (heading: string, content?: string, showBlankLines: boolean = true) => {
    checkPageBreak(30);
    
    // Subheader
    pdf.setFontSize(13);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.subheaderTeal);
    pdf.text(sanitizeText(heading), marginLeft, yPosition);
    yPosition += 10;

    // Form box with rounded corners and light background
    const boxWidth = pageWidth - marginLeft - marginRight;
    const boxStartY = yPosition;
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...colors.bodyGray);
    
    if (content && content.trim()) {
      const sanitized = sanitizeText(content);
      const lines = pdf.splitTextToSize(sanitized, boxWidth - 8);
      const boxHeight = Math.max(lines.length * lineHeight + 8, 20);
      
      // Draw rounded box
      pdf.setFillColor(...colors.boxBg);
      pdf.setDrawColor(...colors.boxBorder);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginLeft, boxStartY, boxWidth, boxHeight, 2, 2, 'FD');
      
      // Add text inside box
      let textY = boxStartY + 6;
      lines.forEach((line: string) => {
        pdf.text(line, marginLeft + 4, textY);
        textY += lineHeight;
      });
      yPosition = boxStartY + boxHeight + 4;
    } else {
      const boxHeight = 15;
      pdf.setFillColor(...colors.boxBg);
      pdf.setDrawColor(...colors.boxBorder);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginLeft, boxStartY, boxWidth, boxHeight, 2, 2, 'FD');
      
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(...colors.lightGray);
      pdf.text("(none provided)", marginLeft + 4, boxStartY + 10);
      pdf.setTextColor(...colors.bodyGray);
      pdf.setFont("helvetica", "normal");
      yPosition = boxStartY + boxHeight + 4;
    }
  };

  const addField = (label: string, value?: string, inline: boolean = true) => {
    checkPageBreak(20);
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.bodyGray);
    
    const boxWidth = pageWidth - marginLeft - marginRight;
    
    if (inline) {
      // Label above value in a clean box format
      pdf.text(sanitizeText(label), marginLeft, yPosition);
      yPosition += 7;
      
      const boxStartY = yPosition;
      const boxHeight = 12;
      
      // Draw form field box
      pdf.setFillColor(...colors.boxBg);
      pdf.setDrawColor(...colors.boxBorder);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginLeft, boxStartY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
      
      if (value && value.trim()) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const sanitized = sanitizeText(value);
        const lines = pdf.splitTextToSize(sanitized, boxWidth - 6);
        pdf.text(lines[0], marginLeft + 3, boxStartY + 8);
      } else {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.lightGray);
        pdf.text("(not provided)", marginLeft + 3, boxStartY + 8);
        pdf.setTextColor(...colors.bodyGray);
      }
      
      yPosition = boxStartY + boxHeight + 5;
      pdf.setFont("helvetica", "normal");
    } else {
      // Multi-line format with larger box
      pdf.text(sanitizeText(label), marginLeft, yPosition);
      yPosition += 7;
      
      const boxStartY = yPosition;
      
      if (value && value.trim()) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const sanitized = sanitizeText(value);
        const lines = pdf.splitTextToSize(sanitized, boxWidth - 6);
        const boxHeight = Math.max(lines.length * lineHeight + 6, 15);
        
        pdf.setFillColor(...colors.boxBg);
        pdf.setDrawColor(...colors.boxBorder);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(marginLeft, boxStartY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
        
        let textY = boxStartY + 6;
        lines.forEach((line: string) => {
          pdf.text(line, marginLeft + 3, textY);
          textY += lineHeight;
        });
        yPosition = boxStartY + boxHeight + 5;
      } else {
        const boxHeight = 15;
        pdf.setFillColor(...colors.boxBg);
        pdf.setDrawColor(...colors.boxBorder);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(marginLeft, boxStartY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
        
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.lightGray);
        pdf.text("(not provided)", marginLeft + 3, boxStartY + 10);
        pdf.setTextColor(...colors.bodyGray);
        yPosition = boxStartY + boxHeight + 5;
      }
      pdf.setFont("helvetica", "normal");
    }
  };

  const addTable = (headers: string[], data: any[][], emptyRows: number = 0) => {
    const colWidths = [50, 50, 60, 30]; // Adjust based on columns
    const startX = marginLeft;
    
    checkPageBreak(15 + (data.length || emptyRows) * 7);
    
    // Draw header
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.bodyGray);
    let xPos = startX;
    headers.forEach((header, i) => {
      pdf.text(sanitizeText(header), xPos, yPosition);
      xPos += colWidths[i];
    });
    yPosition += lineHeight + 2;
    
    // Draw data rows
    pdf.setFont("helvetica", "normal");
    if (data.length > 0) {
      data.forEach(row => {
        checkPageBreak();
        xPos = startX;
        row.forEach((cell, i) => {
          const cellText = cell ? sanitizeText(String(cell)) : "";
          const wrapped = pdf.splitTextToSize(cellText, colWidths[i] - 2);
          pdf.text(wrapped[0] || "", xPos, yPosition);
          xPos += colWidths[i];
        });
        yPosition += lineHeight;
      });
    } else {
      // Empty rows for manual filling
      pdf.setTextColor(150, 150, 150);
      for (let i = 0; i < emptyRows; i++) {
        checkPageBreak();
        xPos = startX;
        headers.forEach((_, idx) => {
          pdf.text("_".repeat(Math.floor(colWidths[idx] / 2)), xPos, yPosition);
          xPos += colWidths[idx];
        });
        yPosition += lineHeight;
      }
      pdf.setTextColor(0, 0, 0);
    }
    yPosition += 5;
  };

  // Cover page - Modern clean design
  // Teal accent bar at top
  pdf.setFillColor(...colors.subheaderTeal);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  
  // Title
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("My Life & Legacy Planner", pageWidth / 2, 45, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("End-of-Life Planning Guide", pageWidth / 2, 58, { align: "center" });
  
  // Display full legal name on cover
  let nameYPosition = 85;
  if (legalName && legalName !== "My Final Wishes") {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(sanitizeText(legalName), 105, nameYPosition, { align: "center" });
    
    // Add nickname (AKA) if available
    if (profile.nicknames) {
      nameYPosition += 8;
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "italic");
      pdf.text(sanitizeText(`(AKA ${profile.nicknames})`), 105, nameYPosition, { align: "center" });
      pdf.setFont("helvetica", "normal");
    }
  } else if (planData.prepared_by) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text(sanitizeText(`Prepared for: ${planData.prepared_by}`), 105, nameYPosition, { align: "center" });
  } else {
    pdf.setFontSize(12);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Prepared for: ___________________________", 105, nameYPosition, { align: "center" });
    pdf.setTextColor(0, 0, 0);
  }
  
  pdf.setFontSize(10);
  const generatedYPosition = profile.nicknames ? 108 : 100;
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, generatedYPosition, { align: "center" });
  
  // Add 10 blank lines for separation (space only, no visible lines)
  let separationY = generatedYPosition + 10;
  for (let i = 0; i < 10; i++) {
    separationY += 5;
  }
  
  // Add "Provided by:" after the blank space
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Provided by:", 105, separationY, { align: "center" });
  
  // Add logo in center
  try {
    pdf.addImage(everlastingLogo, 'PNG', pageWidth / 2 - 25, separationY + 10, 50, 50);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }
  
  // Add contact info below logo
  const contactYPosition = separationY + 70;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Everlasting Funeral Advisors", 105, contactYPosition, { align: "center" });
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);
  pdf.text("Phone: (323) 863-5804", 105, contactYPosition + 12, { align: "center" });
  pdf.text("Email: info@everlastingfuneraladvisors.com", 105, contactYPosition + 19, { align: "center" });
  pdf.text("Website: https://everlastingfuneraladvisors.com", 105, contactYPosition + 26, { align: "center" });
  pdf.text("Facebook: https://www.facebook.com/profile.php?id=61580859545223", 105, contactYPosition + 33, { align: "center" });
  pdf.setTextColor(0, 0, 0);

  // Add Table of Contents page
  pdf.addPage();
  yPosition = 40;
  
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("Table of Contents", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 20;
  
  // We'll fill this in at the end, just placeholder for now
  const tocPageNumber = pdf.internal.pages.length - 1;
  
  // Add sections
  pdf.addPage();
  yPosition = 20;

  // Instructions Section - only if has content
  if (planData.instructions_notes && planData.instructions_notes.trim()) {
    addTitle("Instructions");
    
    // Add important tip about handwritten changes
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Important Tip:", 20, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    const tipText = "If you make any handwritten changes on this printed document, it is recommended to initial and date those changes for the record.";
    const tipLines = pdf.splitTextToSize(tipText, 170);
    tipLines.forEach((line: string) => {
      checkPageBreak();
      pdf.text(line, 20, yPosition);
      yPosition += lineHeight - 1;
    });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    yPosition += 8;
    
    addSection("General Instructions", planData.instructions_notes);
  }

  // Checklist Section - only if has checklist items
  const checklistItems = planData.checklist_items || [];
  const hasChecklistItems = checklistItems.length > 0 && checklistItems.some((item: string) => item && item.trim());
  
  if (hasChecklistItems) {
    addTitle("Checklist");
    
    // Add instruction for checkboxes
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...colors.bodyGray);
    pdf.text("This section details tasks you want your loved ones to complete:", marginLeft, yPosition);
    yPosition += lineHeight + 6;
    pdf.setFont("helvetica", "normal");
    
    checklistItems.forEach((item: string, index: number) => {
      if (item && item.trim()) {
        checkPageBreak(12);
        
        // Add modern checkbox
        addCheckbox(marginLeft, yPosition, false);
        
        // Add item text
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(...colors.bodyGray);
        const sanitized = sanitizeText(item);
        const boxWidth = pageWidth - marginLeft - marginRight - 8;
        const lines = pdf.splitTextToSize(sanitized, boxWidth);
        pdf.text(lines[0], marginLeft + 7, yPosition);
        yPosition += lineHeight + 2;
        
        // Wrap additional lines if needed
        for (let i = 1; i < lines.length; i++) {
          checkPageBreak();
          pdf.text(lines[i], marginLeft + 7, yPosition);
          yPosition += lineHeight + 2;
        }
      }
    });
    yPosition += 3;
  }

  // Personal Information Section - only if has personal profile data
  const personalProfile = planData.personal_profile || {};
  const hasPersonalData = !!(
    personalProfile.full_name || personalProfile.legal_name || personalProfile.nicknames || personalProfile.maiden_name ||
    personalProfile.dob || personalProfile.date_of_birth || personalProfile.birthplace || personalProfile.ssn ||
    personalProfile.citizenship || personalProfile.address || personalProfile.phone || personalProfile.email ||
    personalProfile.marital_status || personalProfile.partner_name || personalProfile.ex_spouse_name ||
    personalProfile.religion || personalProfile.father_name || personalProfile.mother_name ||
    (personalProfile.children && personalProfile.children.length > 0)
  );
  
  if (hasPersonalData) {
    addTitle("My Personal Information");
    if (personalProfile.full_name || personalProfile.legal_name) addField("Full Legal Name", personalProfile.full_name || personalProfile.legal_name);
    if (personalProfile.nicknames) addField("Nicknames", personalProfile.nicknames);
    if (personalProfile.maiden_name) addField("Maiden Name", personalProfile.maiden_name);
    if (personalProfile.dob || personalProfile.date_of_birth) addField("Date of Birth", personalProfile.dob || personalProfile.date_of_birth);
    if (personalProfile.birthplace) addField("Place of Birth", personalProfile.birthplace);
    if (personalProfile.ssn) addField("Social Security Number", personalProfile.ssn);
    if (personalProfile.citizenship) addField("Citizenship", personalProfile.citizenship);
    if (personalProfile.address) addField("Address", personalProfile.address, false);
    if (personalProfile.phone) addField("Phone", personalProfile.phone);
    if (personalProfile.email) addField("Email", personalProfile.email);
    if (personalProfile.marital_status) addField("Marital Status", personalProfile.marital_status);
    if (personalProfile.partner_name) addField("Spouse/Partner Name", personalProfile.partner_name);
    if (personalProfile.partner_phone) addField("Spouse/Partner Phone", personalProfile.partner_phone);
    if (personalProfile.partner_email) addField("Spouse/Partner Email", personalProfile.partner_email);
    if (personalProfile.ex_spouse_name) addField("Former Spouse Name", personalProfile.ex_spouse_name);
    if (personalProfile.religion) addField("Religion/Faith", personalProfile.religion);
    if (personalProfile.father_name) addField("Father's Name", personalProfile.father_name);
    if (personalProfile.father_phone) addField("Father's Phone", personalProfile.father_phone);
    if (personalProfile.father_email) addField("Father's Email", personalProfile.father_email);
    if (personalProfile.mother_name) addField("Mother's Name", personalProfile.mother_name);
    if (personalProfile.mother_phone) addField("Mother's Phone", personalProfile.mother_phone);
    if (personalProfile.mother_email) addField("Mother's Email", personalProfile.mother_email);
    
    // Children's Names
    const children = personalProfile.children || [];
    if (children.length > 0 && children.some((child: any) => child.name && child.name.trim())) {
      checkPageBreak(15);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Children's Names:", 20, yPosition);
      yPosition += lineHeight + 2;
      
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      children.forEach((child: any, index: number) => {
        if (child.name && child.name.trim()) {
          checkPageBreak();
          const childText = `${index + 1}. ${sanitizeText(child.name)}`;
          pdf.text(childText, 28, yPosition);
          const textWidth = pdf.getTextWidth(childText);
          pdf.setDrawColor(0, 0, 0);
          pdf.line(28, yPosition + 1, 28 + textWidth, yPosition + 1);
          yPosition += lineHeight + 2;
          
          if (child.phone) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.text(`   Phone: ${sanitizeText(child.phone)}`, 28, yPosition);
            yPosition += lineHeight;
          }
          if (child.email) {
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);
            pdf.text(`   Email: ${sanitizeText(child.email)}`, 28, yPosition);
            yPosition += lineHeight + 2;
          }
          pdf.setFont("times", "normal");
          pdf.setFontSize(10);
        }
      });
      pdf.setFont("helvetica", "normal");
      yPosition += 5;
    }
    
    // Military Service
    if (personalProfile.vet_branch || personalProfile.vet_rank || personalProfile.vet_serial || personalProfile.vet_war || personalProfile.vet_entry || personalProfile.vet_discharge) {
      checkPageBreak(25);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Military Service", 20, yPosition);
      yPosition += lineHeight + 3;
      
      if (personalProfile.vet_branch) addField("Branch", personalProfile.vet_branch);
      if (personalProfile.vet_rank) addField("Rank", personalProfile.vet_rank);
      if (personalProfile.vet_serial) addField("Serial Number", personalProfile.vet_serial);
      if (personalProfile.vet_war) addField("War/Conflict", personalProfile.vet_war);
      if (personalProfile.vet_entry) addField("Date of Entry", personalProfile.vet_entry);
      if (personalProfile.vet_discharge) addField("Date of Discharge", personalProfile.vet_discharge);
      yPosition += 5;
    }
  }

  // About Me Section - Only show if has content AND visible
  if (planData.about_me_notes && planData.about_me_notes.trim() && isSectionVisible("legacy")) {
    pdf.addPage();
    yPosition = 20;
    addTitle("About Me");
    addSection("My Story & Legacy", planData.about_me_notes);
  }

  // Key Contacts Section - Only show if has contacts AND visible
  const contacts = planData.contacts || [];
  const hasContacts = contacts.length > 0 && contacts.some((c: any) => c.name || c.relationship || c.contact);
  if (hasContacts && isSectionVisible("contacts")) {
    if (yPosition > 100) {
      pdf.addPage();
      yPosition = 20;
    }
    addTitle("Key Contacts to Notify");
    const contactData = contacts
      .filter((c: any) => c.name || c.relationship || c.contact)
      .map((c: any) => [
        c.name || "",
        c.relationship || "",
        c.contact || "",
        c.note || ""
      ]);
    addTable(["Name", "Relationship", "Contact Info", "Notes"], contactData, 0);
  }

  // Vendors Section - Only show if has vendors AND visible
  const vendors = planData.vendors || [];
  const hasVendors = vendors.length > 0 && vendors.some((v: any) => v.type || v.business || v.contact);
  if (hasVendors && isSectionVisible("providers")) {
    if (yPosition > 100) {
      pdf.addPage();
      yPosition = 20;
    }
    addTitle("Preferred Vendors");
    const vendorData = vendors
      .filter((v: any) => v.type || v.business || v.contact)
      .map((v: any) => [
        v.type || "",
        v.business || "",
        v.contact || "",
        v.notes || ""
      ]);
    addTable(["Type", "Business Name", "Contact", "Notes"], vendorData, 0);
  }

  // Funeral Wishes Section - Only show if has funeral data AND visible
  const funeral = planData.funeral || {};
  const hasFuneralWishes = !!(
    funeral.burial || funeral.cremation || funeral.donation ||
    funeral.burial_notes || funeral.cremation_notes || funeral.donation_notes ||
    funeral.religious_service || funeral.funeral_preference || funeral.cemetery_plot ||
    funeral.religious_notes || funeral.flower_preferences || funeral.charity_donations ||
    funeral.general_notes
  );
  
  if (hasFuneralWishes && isSectionVisible("funeral")) {
    pdf.addPage();
    yPosition = 20;
    addTitle("My Funeral & Memorial Wishes");
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...colors.bodyGray);
    pdf.text("This section details your specific wishes for your funeral or memorial arrangements.", marginLeft, yPosition);
    yPosition += lineHeight + 6;
    pdf.setFont("helvetica", "normal");
    
    // Disposition of Remains subsection
    if (funeral.burial || funeral.cremation || funeral.donation || funeral.burial_notes || funeral.cremation_notes || funeral.donation_notes) {
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.subheaderTeal);
      pdf.text("Disposition of My Remains", marginLeft, yPosition);
      yPosition += 10;
      
      // Checkboxes for disposition options
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...colors.bodyGray);
      
      checkPageBreak(30);
      if (funeral.burial) {
        addCheckbox(marginLeft, yPosition, true);
        pdf.text("Burial", marginLeft + 7, yPosition);
        yPosition += 8;
      }
      
      if (funeral.cremation) {
        addCheckbox(marginLeft, yPosition, true);
        pdf.text("Cremation", marginLeft + 7, yPosition);
        yPosition += 8;
      }
      
      if (funeral.donation) {
        addCheckbox(marginLeft, yPosition, true);
        pdf.text("Donation to Science", marginLeft + 7, yPosition);
        yPosition += 10;
      }
      
      if (funeral.burial_notes || funeral.cremation_notes || funeral.donation_notes) {
        addField("Notes", funeral.burial_notes || funeral.cremation_notes || funeral.donation_notes, false);
      }
    }
    
    // Memorial Service Preferences
    if (funeral.religious_service || funeral.funeral_preference || funeral.cemetery_plot || 
        funeral.religious_notes || funeral.flower_preferences || funeral.charity_donations || funeral.general_notes) {
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.subheaderTeal);
      pdf.text("My Memorial Service Preferences", marginLeft, yPosition);
      yPosition += 10;
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(...colors.bodyGray);
      
      if (funeral.religious_service) {
        addCheckbox(marginLeft, yPosition, true);
        pdf.text("Religious Ceremony", marginLeft + 7, yPosition);
        yPosition += 8;
      }
      
      if (funeral.funeral_preference) {
        addField("Service Type", funeral.funeral_preference, false);
      }
      
      if (funeral.cemetery_plot) addField("Location", funeral.cemetery_plot, false);
      if (funeral.religious_notes) addField("Music or Readings", funeral.religious_notes, false);
      if (funeral.flower_preferences) addField("Flower Preferences", funeral.flower_preferences, false);
      if (funeral.charity_donations) addField("Memorial Donations to Charity", funeral.charity_donations, false);
      if (funeral.general_notes) addField("Additional Wishes", funeral.general_notes, false);
    }
  }

  // Financial Life Section - only if has financial data AND visible
  const financial = planData.financial || {};
  if (hasFinancialData(financial) && isSectionVisible("financial")) {
    if (yPosition > 100) {
      pdf.addPage();
      yPosition = 20;
    }
    addTitle("Financial Life");
    const accounts = financial.accounts || [];
    const accountData = accounts
      .filter((a: any) => a.type || a.institution || a.details)
      .map((a: any) => [
        a.type || "",
        a.institution || "",
        a.details || ""
      ]);
    if (accountData.length > 0) {
      addTable(["Type", "Institution", "Details"], accountData, 0);
    }
    if (financial.safe_deposit_details) addField("Safe Deposit Box", financial.safe_deposit_details, false);
    if (financial.crypto_details) addField("Cryptocurrency", financial.crypto_details, false);
    if (financial.business_details) addField("Business Interests", financial.business_details, false);
    if (financial.debts_details) addField("Outstanding Debts", financial.debts_details, false);
  }

  // Insurance Section - only if has insurance data AND visible
  const insurance = planData.insurance || {};
  if (hasInsuranceData(insurance) && isSectionVisible("insurance")) {
    if (yPosition > 100) {
      pdf.addPage();
      yPosition = 20;
    }
    addTitle("Insurance");
    const policies = insurance.policies || [];
    const policyData = policies
      .filter((p: any) => p.type || p.company || p.policy_number)
      .map((p: any) => [
        p.type || "",
        p.company || "",
        p.policy_number || "",
        p.agent || ""
      ]);
    addTable(["Type", "Company", "Policy #", "Agent"], policyData, 0);
  }

  // Property Section - only if has property data AND visible
  const property = planData.property || {};
  if (hasPropertyData(property) && isSectionVisible("property")) {
    pdf.addPage();
    yPosition = 20;
    addTitle("My Property");
    
    // Property types owned
    const propertyTypes = [];
    if (property.has_primary_home) propertyTypes.push("Primary residence");
    if (property.has_vacation_home) propertyTypes.push("Vacation home");
    if (property.has_investment) propertyTypes.push("Investment property");
    if (property.has_land) propertyTypes.push("Land or lots");
    if (property.has_vehicles) propertyTypes.push("Vehicles");
    if (property.has_boats_rvs) propertyTypes.push("Boats or RVs");
    if (property.has_business) propertyTypes.push("Business ownership");
    if (property.has_valuables) propertyTypes.push("Jewelry, art, collectibles");
    
    if (propertyTypes.length > 0) {
      checkPageBreak(15);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Property I Own:", 20, yPosition);
      yPosition += lineHeight + 2;
      
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      propertyTypes.forEach((type: string) => {
        checkPageBreak();
        // Add checkbox
        pdf.setDrawColor(0, 0, 0);
        pdf.setFillColor(0, 0, 0);
        pdf.rect(20, yPosition - 3, 3, 3, 'F');
        pdf.text(sanitizeText(type), 26, yPosition);
        yPosition += lineHeight + 1;
      });
      pdf.setFont("helvetica", "normal");
      yPosition += 5;
    }
    
    // Property details
    const propertyItems = property.items || [];
    if (propertyItems.length > 0 && propertyItems.some((i: any) => i.type || i.description)) {
      checkPageBreak(15);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Property Details:", 20, yPosition);
      yPosition += lineHeight + 3;
      
      propertyItems.forEach((item: any, index: number) => {
        if (item.type || item.description) {
          checkPageBreak(20);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(sanitizeText(`Property ${index + 1}`), 20, yPosition);
          yPosition += lineHeight;
          if (item.type) addField("Type", item.type);
          if (item.description) addField("Description & Details", item.description, false);
          if (item.location) addField("Document Location", item.location);
          if (item.document) {
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(9);
            pdf.setTextColor(100, 100, 100);
            pdf.text("(Document attached - see online plan)", 20, yPosition);
            pdf.setTextColor(0, 0, 0);
            yPosition += lineHeight;
          }
          yPosition += 3;
        }
      });
    }
  }

  // Pets Section - only if has pets data AND visible
  if (hasPetsData(planData) && isSectionVisible("pets")) {
    if (yPosition > 100) {
      pdf.addPage();
      yPosition = 20;
    }
    addTitle("My Pets");
    
    const pets = planData.pets || [];
    if (pets.length > 0 && pets.some((pet: any) => pet.name || pet.type || pet.instructions)) {
      pets.forEach((pet: any, index: number) => {
        if (pet.name || pet.type || pet.instructions) {
          checkPageBreak(30);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(sanitizeText(`Pet ${index + 1}`), 20, yPosition);
          yPosition += lineHeight;
          
          if (pet.type) addField("Type", pet.type);
          if (pet.name) addField("Name", pet.name);
          if (pet.instructions) addField("Care Instructions", pet.instructions, false);
          yPosition += 5;
        }
      });
    } else if (planData.pets_notes && planData.pets_notes.trim()) {
      addSection("Pet Care Instructions", planData.pets_notes);
    }
  }

  // Digital World Section - only if has digital data AND visible
  const digital = planData.digital || {};
  if (hasDigitalData(digital) && isSectionVisible("digital")) {
    pdf.addPage();
    yPosition = 20;
    addTitle("Digital World");
    
    // Digital Assets
    const digitalAssets = [];
    if (digital.has_social_media) digitalAssets.push("Social media accounts");
    if (digital.has_email) digitalAssets.push("Email accounts");
    if (digital.has_cloud_storage) digitalAssets.push("Cloud storage (Google, iCloud, Dropbox)");
    if (digital.has_streaming) digitalAssets.push("Streaming services");
    if (digital.has_shopping) digitalAssets.push("Shopping accounts (Amazon, etc.)");
    if (digital.has_photo_sites) digitalAssets.push("Photo sharing sites");
    if (digital.has_domains) digitalAssets.push("Domain names or websites");
    if (digital.has_password_manager) digitalAssets.push("Password manager");
    
    if (digitalAssets.length > 0) {
      checkPageBreak(15);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Digital Assets I Have:", 20, yPosition);
      yPosition += lineHeight + 2;
      
      pdf.setFont("times", "normal");
      pdf.setFontSize(10);
      digitalAssets.forEach((asset: string) => {
        checkPageBreak();
        pdf.setDrawColor(0, 0, 0);
        pdf.setFillColor(0, 0, 0);
        pdf.rect(20, yPosition - 3, 3, 3, 'F');
        pdf.text(sanitizeText(asset), 26, yPosition);
        yPosition += lineHeight + 1;
      });
      pdf.setFont("helvetica", "normal");
      yPosition += 5;
    }
    
    // Phone Accounts
    const phones = digital.phones || [];
    if (phones.length > 0 && phones.some((p: any) => p.carrier || p.number)) {
      checkPageBreak(15);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Phone Accounts:", 20, yPosition);
      yPosition += lineHeight + 3;
      
      phones.forEach((phone: any, index: number) => {
        if (phone.carrier || phone.number) {
          checkPageBreak(20);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(sanitizeText(`Phone ${index + 1}`), 20, yPosition);
          yPosition += lineHeight;
          if (phone.carrier) addField("Carrier", phone.carrier);
          if (phone.number) addField("Phone Number", phone.number);
          if (phone.pin) addField("PIN/Password Location", phone.pin);
          yPosition += 3;
        }
      });
    }
    
    // Digital Accounts
    const digitalAccounts = digital.accounts || [];
    if (digitalAccounts.length > 0 && digitalAccounts.some((a: any) => a.platform || a.username)) {
      checkPageBreak(15);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Account Details:", 20, yPosition);
      yPosition += lineHeight + 3;
      
      digitalAccounts.forEach((account: any, index: number) => {
        if (account.platform || account.username) {
          checkPageBreak(25);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "bold");
          pdf.text(sanitizeText(`Account ${index + 1}`), 20, yPosition);
          yPosition += lineHeight;
          if (account.platform) addField("Platform/Service", account.platform);
          if (account.username) addField("Username/Email", account.username);
          
          const actions = [];
          if (account.action_memorialize) actions.push("Memorialize");
          if (account.action_delete) actions.push("Delete");
          if (account.action_transfer) actions.push("Transfer");
          if (actions.length > 0) {
            addField("Preferred Action", actions.join(", "));
          }
          
          if (account.action_custom) {
            addField("Additional Instructions", account.action_custom, false);
          }
          yPosition += 3;
        }
      });
    }
    
    if (digital.password_manager_info) {
      checkPageBreak(15);
      addField("Password Manager Information", digital.password_manager_info, false);
      yPosition += 5;
    }
  }

  // Legal Section - only if has legal data AND visible
  const legal = planData.legal || {};
  if (hasLegalData(legal) && isSectionVisible("legal")) {
    if (yPosition > 100) {
      pdf.addPage();
      yPosition = 20;
    }
    addTitle("Legal");
    if (legal.has_will) addField("I have a will", "Yes");
    if (legal.will_details) addField("Will Details", legal.will_details, false);
    if (legal.has_trust) addField("I have a trust", "Yes");
    if (legal.trust_details) addField("Trust Details", legal.trust_details, false);
    if (legal.has_poa) addField("Power of Attorney", "Yes");
    if (legal.poa_details) addField("POA Details", legal.poa_details, false);
    if (legal.has_advance_directive) addField("Advance Healthcare Directive", "Yes");
    if (legal.advance_directive_details) addField("Directive Details", legal.advance_directive_details, false);
  }

  // Messages Section - only if has messages AND visible
  const messages = planData.messages || [];
  if (hasMessagesData(messages) && isSectionVisible("messages")) {
    pdf.addPage();
    yPosition = 20;
    addTitle("Messages to Loved Ones");
    messages.forEach((message: any, index: number) => {
      if (message.recipients || message.text_message || message.audio_url || message.video_url) {
        checkPageBreak(25);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(sanitizeText(`Message ${index + 1}`), 20, yPosition);
        yPosition += lineHeight;
        if (message.recipients) addField("To (Recipients)", message.recipients);
        if (message.text_message) addField("Written Message", message.text_message, false);
        
        if (message.audio_url || message.video_url) {
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          const mediaTypes = [];
          if (message.audio_url) mediaTypes.push("audio");
          if (message.video_url) mediaTypes.push("video");
          pdf.text(`(${mediaTypes.join(" and ")} message available in online plan)`, 20, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += lineHeight;
        }
        yPosition += 5;
      }
    });
  }

  // Revisions & Approvals Section
  addTitle("Revisions & Approvals");
  const revisions = planData.revisions || [];
  const preparedBy = planData.prepared_by || "";
  
  if (preparedBy) {
    addField("Prepared By (Overall)", preparedBy);
    yPosition += 5;
  }
  
  if (revisions.length > 0) {
    revisions.forEach((revision: any, index: number) => {
      checkPageBreak(40);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Revision ${index + 1}`), 20, yPosition);
      yPosition += lineHeight + 2;
      
      addField("Prepared By", revision.prepared_by);
      addField("Revision Date", revision.revision_date);
      
      // Add signature if available
      if (revision.signature_png) {
        checkPageBreak(30);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Signature:", 20, yPosition);
        yPosition += lineHeight;
        
        try {
          // Add signature image
          pdf.addImage(revision.signature_png, 'PNG', 20, yPosition, 60, 20);
          yPosition += 25;
        } catch (error) {
          console.error('Error adding signature to PDF:', error);
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(9);
          pdf.setTextColor(100, 100, 100);
          pdf.text("(signature could not be displayed)", 20, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += lineHeight;
        }
      }
      
      yPosition += 5;
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(120, 120, 120);
    pdf.text("(no revisions recorded yet)", 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    yPosition += lineHeight + 5;
  }

  // Footer on last page with teal accent
  checkPageBreak(50);
  
  // Teal divider line
  pdf.setDrawColor(...colors.subheaderTeal);
  pdf.setLineWidth(1);
  pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("Generated with Everlasting Funeral Advisors – My Final Wishes Planner", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Everlasting Funeral Advisors", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 6;
  
  pdf.setFontSize(8);
  pdf.text("Phone: (323) 863-5804 | Email: info@everlastingfuneraladvisors.com", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 5;
  pdf.text("Website: https://everlastingfuneraladvisors.com", pageWidth / 2, yPosition, { align: "center" });

  // Appendix section for uploaded documents/images
  pdf.addPage();
  yPosition = 20;
  addTitle("Appendix - Digital Media & Documents");
  
  // Check if user has any digital media
  const hasDigitalMedia = !!(
    planData.digital_media || 
    planData.uploaded_files || 
    planData.attachments ||
    (planData.digital && (
      planData.digital.has_social_media ||
      planData.digital.has_email ||
      planData.digital.has_cloud_storage ||
      planData.digital.has_streaming ||
      planData.digital.has_shopping ||
      planData.digital.has_photo_sites ||
      planData.digital.has_domains ||
      planData.digital.has_password_manager
    ))
  );
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  
  if (hasDigitalMedia) {
    pdf.text("IMPORTANT NOTICE:", 20, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("You have digital media and assets associated with this plan.", 20, yPosition);
    yPosition += lineHeight + 2;
    pdf.text("Any uploaded images, documents, audio recordings, or video files", 20, yPosition);
    yPosition += lineHeight;
    pdf.text("can be accessed in the online application at:", 20, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("https://everlastingfuneraladvisors.com", 20, yPosition);
    yPosition += lineHeight + 4;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("These digital assets cannot be embedded in this PDF but are securely", 20, yPosition);
    yPosition += lineHeight;
    pdf.text("stored in your online plan and can be accessed at any time.", 20, yPosition);
    yPosition += 12;
  } else {
    pdf.text("Digital Media Status:", 20, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("You do not currently have any digital media or uploaded files", 20, yPosition);
    yPosition += lineHeight;
    pdf.text("associated with this plan.", 20, yPosition);
    yPosition += lineHeight + 4;
    
    pdf.text("To add digital media, documents, or files, please visit:", 20, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont("helvetica", "bold");
    pdf.text("https://everlastingfuneraladvisors.com", 20, yPosition);
    yPosition += lineHeight + 4;
    
    pdf.setFont("helvetica", "normal");
    pdf.text("and access the Digital World section of your online plan.", 20, yPosition);
    yPosition += 12;
  }
  
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(100, 100, 100);
  pdf.text("Space for additional documentation:", 20, yPosition);
  yPosition += lineHeight + 5;
  pdf.setTextColor(0, 0, 0);
  
  // Add lines for manual documentation tracking
  pdf.setFont("helvetica", "normal");
  for (let i = 0; i < 15; i++) {
    checkPageBreak();
    pdf.setTextColor(150, 150, 150);
    pdf.text("_".repeat(80), 20, yPosition);
    yPosition += lineHeight;
  }
  pdf.setTextColor(0, 0, 0);
  
  // Calculate total pages (excluding cover)
  const totalPages = pdf.internal.pages.length - 1;
  
  // Go back and fill in the Table of Contents
  pdf.setPage(tocPageNumber);
  yPosition = 60;
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  
  tableOfContents.forEach((item) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }
    
    const dots = ".".repeat(Math.floor((pageWidth - 80 - pdf.getTextWidth(item.title) - pdf.getTextWidth(String(item.page))) / 2));
    pdf.text(sanitizeText(item.title), 30, yPosition);
    pdf.text(dots, 30 + pdf.getTextWidth(sanitizeText(item.title)) + 2, yPosition);
    pdf.text(String(item.page), pageWidth - 30, yPosition, { align: "right" });
    yPosition += 8;
  });
  
  // Update all page footers with total page count
  for (let i = 2; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Add small logo to top right (except on cover and TOC pages)
    if (i > 2) {
      try {
        const logoSize = 12;
        pdf.addImage(everlastingLogo, 'PNG', pageWidth - marginRight - logoSize, 8, logoSize, logoSize);
      } catch (error) {
        console.error('Error adding logo to page:', error);
      }
    }
    
    // Add teal line at bottom
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 23, pageWidth - marginRight, pageHeight - 23);
    
    // Add footer text
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("Generated with Everlasting Funeral Advisors – My Final Wishes Planner", pageWidth / 2, pageHeight - 15, { align: "center" });
    
    // Add page number - bold and black
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    const pageNumText = `Page ${i} of ${totalPages}`;
    pdf.text(pageNumText, pageWidth / 2, pageHeight - 8, { align: "center" });
    
    pdf.setTextColor(...colors.bodyGray);
  }

  return pdf;
};
