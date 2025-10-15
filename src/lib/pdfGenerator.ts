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
  const pageWidth = pdf.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 15; // 0.75" for hole punch space
  const marginBottom = 30;
  const lineHeight = 6;
  const tableOfContents: { title: string; page: number }[] = [];
  
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
    
    // Add teal line at bottom
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 25, pageWidth - marginRight, pageHeight - 25);
    
    // Add footer text - more readable
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);  // Darker for better readability
    pdf.text("Generated with Everlasting Funeral Advisors – My Final Wishes Planner", pageWidth / 2, pageHeight - 17, { align: "center" });
    
    // Add page number - larger and darker
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);  // Black for maximum contrast
    const pageNumText = totalPages ? `Page ${currentPage} of ${totalPages}` : `Page ${currentPage}`;
    pdf.text(pageNumText, pageWidth / 2, pageHeight - 10, { align: "center" });
    
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
  pdf.text("My Final Wishes", pageWidth / 2, 45, { align: "center" });
  
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

  // Instructions Section
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

  // Personal Information Section
  addTitle("My Personal Information");
  addField("Full Legal Name", profile.full_name || profile.legal_name);
  addField("Nicknames", profile.nicknames);
  addField("Maiden Name", profile.maiden_name);
  addField("Date of Birth", profile.dob || profile.date_of_birth);
  addField("Place of Birth", profile.birthplace);
  addField("Social Security Number", profile.ssn);
  addField("Citizenship", profile.citizenship);
  addField("Address", profile.address, false);
  addField("Phone", profile.phone);
  addField("Email", profile.email);
  addField("Marital Status", profile.marital_status);
  addField("Spouse/Partner Name", profile.partner_name);
  addField("Former Spouse Name", profile.ex_spouse_name);
  addField("Religion/Faith", profile.religion);
  addField("Father's Name", profile.father_name);
  addField("Mother's Name", profile.mother_name);
  
  // Children's Names
  const childNames = profile.child_names || [];
  if (childNames.length > 0 && childNames.some((name: string) => name && name.trim())) {
    checkPageBreak(15);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Children's Names:", 20, yPosition);
    yPosition += lineHeight + 2;
    
    pdf.setFont("times", "normal");
    pdf.setFontSize(10);
    childNames.forEach((name: string, index: number) => {
      if (name && name.trim()) {
        checkPageBreak();
        const childText = `${index + 1}. ${sanitizeText(name)}`;
        pdf.text(childText, 28, yPosition);
        const textWidth = pdf.getTextWidth(childText);
        pdf.setDrawColor(0, 0, 0);
        pdf.line(28, yPosition + 1, 28 + textWidth, yPosition + 1);
        yPosition += lineHeight + 2;
      }
    });
    pdf.setFont("helvetica", "normal");
    yPosition += 5;
  } else {
    addField("Children's Names", "");
  }
  
  // Military Service
  if (profile.vet_branch || profile.vet_rank || profile.vet_serial || profile.vet_war || profile.vet_entry || profile.vet_discharge) {
    checkPageBreak(25);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("Military Service", 20, yPosition);
    yPosition += lineHeight + 3;
    
    addField("Branch", profile.vet_branch);
    addField("Rank", profile.vet_rank);
    addField("Serial Number", profile.vet_serial);
    addField("War/Conflict", profile.vet_war);
    addField("Date of Entry", profile.vet_entry);
    addField("Date of Discharge", profile.vet_discharge);
    yPosition += 5;
  }

  // About Me Section
  addTitle("About Me");
  addSection("My Story & Legacy", planData.about_me_notes);

  // Checklist Section
  addTitle("Checklist");
  
  // Add instruction for checkboxes
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("This section details tasks you want your loved ones to complete:", marginLeft, yPosition);
  yPosition += lineHeight + 6;
  pdf.setFont("helvetica", "normal");
  
  const checklistItems = planData.checklist_items || [];
  if (checklistItems.length > 0 && checklistItems.some((item: string) => item && item.trim())) {
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
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(...colors.lightGray);
    pdf.text("(none provided)", marginLeft, yPosition);
    pdf.setTextColor(...colors.bodyGray);
    pdf.setFont("helvetica", "normal");
    yPosition += lineHeight + 5;
  }

  // Key Contacts Section
  addTitle("Key Contacts to Notify");
  const contacts = planData.contacts || [];
  const contactData = contacts.map((c: any) => [
    c.name || "",
    c.relationship || "",
    c.contact || "",
    c.note || ""
  ]);
  addTable(["Name", "Relationship", "Contact Info", "Notes"], contactData, contactData.length === 0 ? 3 : 0);

  // Vendors Section
  addTitle("Preferred Vendors");
  const vendors = planData.vendors || [];
  const vendorData = vendors.map((v: any) => [
    v.type || "",
    v.business || "",
    v.contact || "",
    v.notes || ""
  ]);
  addTable(["Type", "Business Name", "Contact", "Notes"], vendorData, vendorData.length === 0 ? 2 : 0);

  // Funeral Wishes Section
  addTitle("My Funeral & Memorial Wishes");
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("This section details your specific wishes for your funeral or memorial arrangements.", marginLeft, yPosition);
  yPosition += lineHeight + 6;
  pdf.setFont("helvetica", "normal");
  
  const funeral = planData.funeral || {};
  
  // Disposition of Remains subsection
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
  addCheckbox(marginLeft, yPosition, funeral.burial);
  pdf.text("Burial", marginLeft + 7, yPosition);
  yPosition += 8;
  
  addCheckbox(marginLeft, yPosition, funeral.cremation);
  pdf.text("Cremation", marginLeft + 7, yPosition);
  yPosition += 8;
  
  addCheckbox(marginLeft, yPosition, funeral.donation);
  pdf.text("Donation to Science", marginLeft + 7, yPosition);
  yPosition += 10;
  
  if (funeral.burial_notes || funeral.cremation_notes || funeral.donation_notes) {
    addField("Notes", funeral.burial_notes || funeral.cremation_notes || funeral.donation_notes, false);
  }
  
  // Memorial Service Preferences
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

  // Financial Life Section
  addTitle("Financial Life");
  const financial = planData.financial || {};
  const accounts = financial.accounts || [];
  const accountData = accounts.map((a: any) => [
    a.type || "",
    a.institution || "",
    a.details || ""
  ]);
  addTable(["Type", "Institution", "Details"], accountData, accountData.length === 0 ? 2 : 0);
  if (financial.safe_deposit_details) addField("Safe Deposit Box", financial.safe_deposit_details, false);
  if (financial.crypto_details) addField("Cryptocurrency", financial.crypto_details, false);
  if (financial.business_details) addField("Business Interests", financial.business_details, false);
  if (financial.debts_details) addField("Outstanding Debts", financial.debts_details, false);

  // Insurance Section
  addTitle("Insurance");
  const insurance = planData.insurance || {};
  const policies = insurance.policies || [];
  const policyData = policies.map((p: any) => [
    p.type || "",
    p.company || "",
    p.policy_number || "",
    p.agent || ""
  ]);
  addTable(["Type", "Company", "Policy #", "Agent"], policyData, policyData.length === 0 ? 2 : 0);

  // Property Section
  addTitle("My Property");
  const property = planData.property || {};
  
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
  if (propertyItems.length > 0) {
    checkPageBreak(15);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Property Details:", 20, yPosition);
    yPosition += lineHeight + 3;
    
    propertyItems.forEach((item: any, index: number) => {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Property ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Type", item.type);
      addField("Description & Details", item.description, false);
      addField("Document Location", item.location);
      if (item.document) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text("(Document attached - see online plan)", 20, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += lineHeight;
      }
      yPosition += 3;
    });
  }

  // Pets Section
  addTitle("My Pets");
  addSection("Pet Care Instructions", planData.pets_notes);

  // Digital World Section
  addTitle("Digital World");
  const digital = planData.digital || {};
  
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
      // Add checkbox
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
  if (phones.length > 0) {
    checkPageBreak(15);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Phone Accounts:", 20, yPosition);
    yPosition += lineHeight + 3;
    
    phones.forEach((phone: any, index: number) => {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Phone ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Carrier", phone.carrier);
      addField("Phone Number", phone.number);
      addField("PIN/Password Location", phone.pin);
      yPosition += 3;
    });
  }
  
  // Digital Accounts
  const digitalAccounts = digital.accounts || [];
  if (digitalAccounts.length > 0) {
    checkPageBreak(15);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text("Account Details:", 20, yPosition);
    yPosition += lineHeight + 3;
    
    digitalAccounts.forEach((account: any, index: number) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Account ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Platform/Service", account.platform);
      addField("Username/Email", account.username);
      
      // Preferred Action
      const actions = [];
      if (account.action_memorialize) actions.push("Memorialize");
      if (account.action_delete) actions.push("Delete");
      if (account.action_transfer) actions.push("Transfer");
      const actionText = actions.length > 0 ? actions.join(", ") : "";
      addField("Preferred Action", actionText);
      
      if (account.action_custom) {
        addField("Additional Instructions", account.action_custom, false);
      }
      yPosition += 3;
    });
  }
  
  // Password Manager
  if (digital.password_manager_info) {
    checkPageBreak(15);
    addField("Password Manager Information", digital.password_manager_info, false);
    yPosition += 5;
  }

  // Legal Section
  addTitle("Legal");
  const legal = planData.legal || {};
  addField("I have a will", legal.has_will ? "Yes" : "No");
  if (legal.will_details) addField("Will Details", legal.will_details, false);
  addField("I have a trust", legal.has_trust ? "Yes" : "No");
  if (legal.trust_details) addField("Trust Details", legal.trust_details, false);
  addField("Power of Attorney", legal.has_poa ? "Yes" : "No");
  if (legal.poa_details) addField("POA Details", legal.poa_details, false);
  addField("Advance Healthcare Directive", legal.has_advance_directive ? "Yes" : "No");
  if (legal.advance_directive_details) addField("Directive Details", legal.advance_directive_details, false);

  // Messages Section
  addTitle("Messages to Loved Ones");
  const messages = planData.messages || [];
  if (messages.length > 0) {
    messages.forEach((message: any, index: number) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Message ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("To (Recipients)", message.recipients);
      addField("Written Message", message.text_message, false);
      
      // Note about audio/video
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
    });
  } else {
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(120, 120, 120);
    pdf.text("(no messages added yet)", 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    yPosition += lineHeight + 5;
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

  // Add footer to last page
  addPageFooter();

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
    
    // Add teal line at bottom
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 25, pageWidth - marginRight, pageHeight - 25);
    
    // Add footer text - more readable
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);  // Darker for better readability
    pdf.text("Generated with Everlasting Funeral Advisors – My Final Wishes Planner", pageWidth / 2, pageHeight - 17, { align: "center" });
    
    // Add page number - larger and darker
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);  // Black for maximum contrast
    const pageNumText = `Page ${i} of ${totalPages}`;
    pdf.text(pageNumText, pageWidth / 2, pageHeight - 10, { align: "center" });
    
    pdf.setTextColor(...colors.bodyGray);
  }

  return pdf;
};
