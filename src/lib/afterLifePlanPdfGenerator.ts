import jsPDF from "jspdf";
import logoImage from "@/assets/efa-logo.png";

interface PlanData {
  decedentName?: string;
  preparedFor?: string;
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
  step7?: any;
  step8?: any;
  step9?: any;
  step10?: any;
}

export const generateAfterLifePlanPDF = async (formData: PlanData, decedentName: string) => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 15;
  const marginBottom = 35;
  const lineHeight = 6;
  
  // Color palette (matching My Final Wishes)
  const colors = {
    headerNavy: [26, 46, 68] as [number, number, number],      // #1A2E44
    subheaderTeal: [14, 118, 118] as [number, number, number], // #0E7676
    bodyGray: [68, 68, 68] as [number, number, number],        // #444444
    lightGray: [180, 180, 180] as [number, number, number],
    boxBg: [249, 250, 251] as [number, number, number],
    boxBorder: [220, 220, 220] as [number, number, number]
  };
  
  // Prepared for name (sanitized for filename)
  const preparedForRaw = formData.preparedFor || decedentName || "";
  const preparedForName = preparedForRaw
    ? preparedForRaw
        .trim()
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
    : "Plan";

  const preparedForDisplay = preparedForRaw.trim() || "";

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

  // Helper to sanitize text
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '');
  };

  // Helper to add page footer
  const addPageFooter = () => {
    const currentPage = pdf.internal.pages.length - 1;
    
    // Add teal line at bottom
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 23, pageWidth - marginRight, pageHeight - 23);
    
    // Add footer text
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("provided by Everlasting Funeral Advisors – After-Life Action Plan", pageWidth / 2, pageHeight - 15, { align: "center" });
    
    // Add page number with name - bold and black
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    const pageNumText = preparedForDisplay 
      ? `Page ${currentPage} of 11 (${preparedForDisplay})`
      : `Page ${currentPage} of 11`;
    pdf.text(pageNumText, pageWidth / 2, pageHeight - 8, { align: "center" });
    
    pdf.setTextColor(...colors.bodyGray);
  };

  const checkPageBreak = (additionalSpace: number = 10) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      addPageFooter();
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Helper to add section title
  const addTitle = (title: string) => {
    checkPageBreak(20);
    
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

  // Helper to add field with box
  const addField = (label: string, value?: string, multiline: boolean = false) => {
    checkPageBreak(20);
    
    const boxWidth = pageWidth - marginLeft - marginRight;
    
    if (label) {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.bodyGray);
      pdf.text(sanitizeText(label), marginLeft, yPosition);
      yPosition += 7;
    }
    
    const boxStartY = yPosition;
    
    if (value && value.trim()) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      const sanitized = sanitizeText(value);
      const lines = pdf.splitTextToSize(sanitized, boxWidth - 6);
      const boxHeight = Math.max(lines.length * lineHeight + 6, multiline ? 20 : 12);
      
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
      const boxHeight = multiline ? 20 : 12;
      pdf.setFillColor(...colors.boxBg);
      pdf.setDrawColor(...colors.boxBorder);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginLeft, boxStartY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
      
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(...colors.lightGray);
      pdf.text("(not provided)", marginLeft + 3, boxStartY + (multiline ? 12 : 8));
      pdf.setTextColor(...colors.bodyGray);
      yPosition = boxStartY + boxHeight + 5;
    }
    pdf.setFont("helvetica", "normal");
  };

  // Helper to add checkbox
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

  // Cover page - Modern clean design
  // Teal accent bar at top
  pdf.setFillColor(...colors.subheaderTeal);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  
  // Title
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("After-Life Action Plan", pageWidth / 2, 45, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Essential Steps for Loved Ones", pageWidth / 2, 58, { align: "center" });
  
  // Prepared for
  let nameYPosition = 85;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Prepared for:", pageWidth / 2, nameYPosition, { align: "center" });
  
  nameYPosition += 10;
  if (preparedForDisplay) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text(sanitizeText(preparedForDisplay), pageWidth / 2, nameYPosition, { align: "center" });
  } else {
    // Draw blank line for manual entry
    pdf.setDrawColor(...colors.boxBorder);
    pdf.setLineWidth(0.3);
    const lineWidth = 100;
    pdf.line(pageWidth / 2 - lineWidth / 2, nameYPosition + 2, pageWidth / 2 + lineWidth / 2, nameYPosition + 2);
  }
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const generatedYPosition = 100;
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, generatedYPosition, { align: "center" });
  
  // Add blank space
  let separationY = generatedYPosition + 50;
  
  // Add "Provided by:"
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Provided by:", pageWidth / 2, separationY, { align: "center" });
  
  // Add logo
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 25, separationY + 10, 50, 50);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
  // Add contact info
  const contactYPosition = separationY + 70;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Everlasting Funeral Advisors", pageWidth / 2, contactYPosition, { align: "center" });
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);
  pdf.text("Phone: (323) 863-5804", pageWidth / 2, contactYPosition + 12, { align: "center" });
  pdf.text("Email: info@everlastingfuneraladvisors.com", pageWidth / 2, contactYPosition + 19, { align: "center" });
  pdf.text("Website: https://everlastingfuneraladvisors.com", pageWidth / 2, contactYPosition + 26, { align: "center" });

  // Step 1: Immediate Needs
  pdf.addPage();
  yPosition = 20;
  addTitle("IMMEDIATE NEEDS (First 48 Hours)");
  
  const step1 = formData.step1 || {};
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.bodyGray);
  addCheckbox(marginLeft, yPosition, step1.funeralHomeContacted);
  pdf.text("Contact funeral home", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Name:", step1.funeralHomeName);
  addField("Phone:", step1.funeralHomePhone);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step1.residenceSecured);
  pdf.text("Secure residence", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Notes:", step1.residenceNotes, true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step1.familyNotified);
  pdf.text("Notify immediate family", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Contacts:", step1.familyContacts, true);
  yPosition += 3;
  
  addField("Other urgent items:", step1.otherUrgent, true);
  
  addPageFooter();

  // Step 2: Official Notifications
  pdf.addPage();
  yPosition = 20;
  addTitle("OFFICIAL NOTIFICATIONS");
  
  const step2 = formData.step2 || {};
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step2.ssaDone);
  pdf.text("Social Security Administration", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Contact:", step2.ssaContact);
  addField("Confirmation:", step2.ssaConfirmation);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step2.employerDone);
  pdf.text("Employer or HR Contact", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Contact:", step2.employerContact);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step2.insuranceDone);
  pdf.text("Insurance Company", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Company:", step2.insuranceCompany);
  addField("Policy:", step2.insurancePolicy);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step2.bankDone);
  pdf.text("Bank or Account Closing", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("Status:", step2.bankStatus, true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step2.utilitiesDone);
  pdf.text("Utilities or Subscriptions", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addField("List:", step2.utilitiesList, true);
  
  addPageFooter();

  // Step 3: Key Documents
  pdf.addPage();
  yPosition = 20;
  addTitle("KEY DOCUMENTS AND LOCATIONS");
  
  const step3 = formData.step3 || {};
  
  addField("Will or Trust Location:", step3.willLocation);
  addField("Living Trust:", step3.trustLocation);
  addField("Deeds or Titles:", step3.deedsLocation);
  addField("Insurance Policy Folder:", step3.insuranceLocation);
  addField("Tax Returns Found In:", step3.taxDocLocation);
  addField("Safe Deposit Box:", step3.safeDepositBox);
  
  addPageFooter();

  // Step 4: Death Certificates
  pdf.addPage();
  yPosition = 20;
  addTitle("DEATH CERTIFICATES");
  
  const step4 = formData.step4 || {};
  
  addField("Number Ordered:", step4.numberOrdered?.toString());
  addField("Recipients:", step4.recipients, true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step4.allReceived);
  pdf.text("All certificates received", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 5: Obituary
  pdf.addPage();
  yPosition = 20;
  addTitle("OBITUARY AND ANNOUNCEMENTS");
  
  const step5 = formData.step5 || {};
  
  addField("Obituary Text:", step5.obituaryText, true);
  addField("Publication(s):", step5.publications, true);
  addField("Online Link:", step5.onlineLink);
  
  addPageFooter();

  // Step 6: Service Details
  pdf.addPage();
  yPosition = 20;
  addTitle("SERVICE AND MEMORIAL DETAILS");
  
  const step6 = formData.step6 || {};
  
  addField("Service Type:", step6.serviceType);
  addField("Venue:", step6.venueName);
  addField("Address:", step6.venueAddress);
  addField("Date/Time:", step6.dateTime ? new Date(step6.dateTime).toLocaleString() : undefined);
  addField("Officiants:", step6.officiants, true);
  addField("Music or Readings:", step6.musicReadings, true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step6.confirmed);
  pdf.text("Confirmed with funeral home", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 7: Finances and Estate
  pdf.addPage();
  yPosition = 20;
  addTitle("FINANCES AND ESTATE TASKS");
  
  const step7 = formData.step7 || {};
  
  addField("Executor:", step7.executorName);
  addField("Contact:", step7.executorContact);
  addField("Attorney:", step7.attorney);
  addField("Bank Accounts or Debts:", step7.bankAccounts, true);
  addField("Property Transfers:", step7.propertyTransfers, true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step7.estateSettled);
  pdf.text("Estate accounts settled", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 8: Digital Accounts
  pdf.addPage();
  yPosition = 20;
  addTitle("DIGITAL ACCOUNTS AND ACCESS");
  
  const step8 = formData.step8 || {};
  
  if (step8.accounts && Array.isArray(step8.accounts)) {
    step8.accounts.forEach((account: any, index: number) => {
      checkPageBreak(25);
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Account ${index + 1}`, marginLeft, yPosition);
      yPosition += 7;
      
      addField("Platform:", account.platform);
      addField("Username:", account.username);
      addField("Status:", account.status ? account.status.charAt(0).toUpperCase() + account.status.slice(1) : "");
      addField("Notes:", account.notes);
      yPosition += 3;
    });
  }
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition, step8.allClosed);
  pdf.text("All digital accounts have been handled", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 9: Real Estate & Utilities
  pdf.addPage();
  yPosition = 20;
  addTitle("REAL ESTATE & UTILITIES");
  
  const step9 = formData.step9 || {};
  
  if (step9.properties && Array.isArray(step9.properties)) {
    step9.properties.forEach((property: any, index: number) => {
      checkPageBreak(30);
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...colors.subheaderTeal);
      pdf.text(`Property ${index + 1}`, marginLeft, yPosition);
      pdf.setTextColor(...colors.bodyGray);
      yPosition += 7;
      
      addField("Address:", property.address);
      addField("Mortgage:", property.mortgage);
      addField("Tax Info:", property.taxInfo);
      addField("Insurance:", property.insurance);
      
      // Utilities section
      checkPageBreak(20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Utilities & Services:", marginLeft, yPosition);
      yPosition += 6;
      
      const utilities = property.utilities || {};
      if (utilities.water) addField("Water:", utilities.water);
      if (utilities.electric) addField("Electric:", utilities.electric);
      if (utilities.gas) addField("Gas:", utilities.gas);
      if (utilities.phone) addField("Phone:", utilities.phone);
      if (utilities.internet) addField("Internet:", utilities.internet);
      if (utilities.cable) addField("Cable:", utilities.cable);
      if (utilities.lawn) addField("Lawn:", utilities.lawn);
      if (utilities.pool) addField("Pool:", utilities.pool);
      if (utilities.pest) addField("Pest:", utilities.pest);
      if (utilities.propane) addField("Propane:", utilities.propane);
      if (utilities.other) addField("Other:", utilities.other);
      
      // Disposition section
      checkPageBreak(20);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Disposition & Transfer:", marginLeft, yPosition);
      yPosition += 6;
      
      addField("Realtor Estimate:", property.realtorEstimate);
      addField("Future Use:", property.futureUse);
      addField("Transfer Notes:", property.transferNotes, true);
      yPosition += 5;
    });
  } else {
    addField("No properties documented", "");
  }
  
  addPageFooter();

  // Step 10: Subscriptions
  pdf.addPage();
  yPosition = 20;
  addTitle("NON-DIGITAL SUBSCRIPTIONS");
  
  const step10 = formData.step10 || {};
  
  if (step10.subscriptions && Array.isArray(step10.subscriptions)) {
    step10.subscriptions.forEach((subscription: any, index: number) => {
      checkPageBreak(20);
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Subscription ${index + 1}`, marginLeft, yPosition);
      yPosition += 7;
      
      addField("Type:", subscription.type);
      addField("Provider:", subscription.provider);
      addField("Account Info:", subscription.accountInfo);
      addField("Notes:", subscription.notes, true);
      
      pdf.setFont("helvetica", "bold");
      addCheckbox(marginLeft, yPosition, subscription.cancelled);
      pdf.text("Cancelled or Transferred", marginLeft + 8, yPosition);
      yPosition += 10;
    });
  } else {
    addField("No subscriptions documented", "");
  }
  
  addPageFooter();

  // Save the PDF
  const fileName = `After-Life-Action-Plan-${preparedForName}-${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(fileName);
};
