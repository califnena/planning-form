import jsPDF from "jspdf";
import logoImage from "@/assets/efa-logo.png";

export const generateBlankAfterLifePlanPDF = async () => {
  const pdf = new jsPDF();
  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const marginLeft = 20;
  const marginRight = 15;
  const marginBottom = 35;
  
  // Color palette (matching My Final Wishes)
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
    // Page number will be updated at the end
    const currentPage = pdf.internal.pages.length - 1;
    
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 23, pageWidth - marginRight, pageHeight - 23);
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 60, 60);
    pdf.text("provided by Everlasting Funeral Advisors – After-Life Action Plan", pageWidth / 2, pageHeight - 15, { align: "center" });
    
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    // Placeholder - will be updated at the end
    pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    
    pdf.setTextColor(...colors.bodyGray);
  };

  const updateAllPageNumbers = () => {
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(0, 0, 0);
      // Clear previous text area
      pdf.setFillColor(255, 255, 255);
      pdf.rect(pageWidth / 2 - 30, pageHeight - 12, 60, 10, 'F');
      // Add correct page number
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    }
  };

  const checkPageBreak = (additionalSpace: number = 10) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      addPageFooter();
      pdf.addPage();
      yPosition = 20;
    }
  };

  const addTitle = (title: string) => {
    checkPageBreak(20);
    
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...colors.headerNavy);
    pdf.text(title, marginLeft, yPosition);
    
    const titleWidth = pdf.getTextWidth(title);
    pdf.setDrawColor(...colors.subheaderTeal);
    pdf.setLineWidth(1.5);
    pdf.line(marginLeft, yPosition + 2, marginLeft + titleWidth, yPosition + 2);
    
    pdf.setTextColor(...colors.bodyGray);
    yPosition += 14;
  };

  const addBlankField = (label: string, multiline: boolean = false) => {
    checkPageBreak(20);
    
    const boxWidth = pageWidth - marginLeft - marginRight;
    
    if (label) {
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.bodyGray);
      pdf.text(label, marginLeft, yPosition);
      yPosition += 7;
    }
    
    const boxHeight = multiline ? 20 : 12;
    pdf.setFillColor(...colors.boxBg);
    pdf.setDrawColor(...colors.boxBorder);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(marginLeft, yPosition, boxWidth, boxHeight, 1.5, 1.5, 'FD');
    
    yPosition += boxHeight + 5;
    pdf.setFont("helvetica", "normal");
  };

  const addCheckbox = (x: number, y: number) => {
    const size = 4;
    pdf.setDrawColor(...colors.bodyGray);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y - size + 1, size, size, 0.5, 0.5, 'S');
  };

  // Cover page
  pdf.setFillColor(...colors.subheaderTeal);
  pdf.rect(0, 0, pageWidth, 8, 'F');
  
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...colors.headerNavy);
  pdf.text("After-Life Action Plan", pageWidth / 2, 45, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...colors.bodyGray);
  pdf.text("Essential Steps for Loved Ones", pageWidth / 2, 58, { align: "center" });
  
  let nameYPosition = 85;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Prepared for:", pageWidth / 2, nameYPosition, { align: "center" });
  
  nameYPosition += 10;
  pdf.setDrawColor(...colors.boxBorder);
  pdf.setLineWidth(0.3);
  const lineWidth = 100;
  pdf.line(pageWidth / 2 - lineWidth / 2, nameYPosition + 2, pageWidth / 2 + lineWidth / 2, nameYPosition + 2);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const generatedYPosition = 100;
  pdf.text(`Date: _____________________`, pageWidth / 2, generatedYPosition, { align: "center" });
  
  let separationY = generatedYPosition + 50;
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Provided by:", pageWidth / 2, separationY, { align: "center" });
  
  if (logoBase64) {
    try {
      pdf.addImage(logoBase64, 'PNG', pageWidth / 2 - 25, separationY + 10, 50, 50);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
    }
  }
  
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
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Contact funeral home", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Name:");
  addBlankField("Phone:");
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Secure residence", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Notes:", true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Notify immediate family", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Contacts:", true);
  yPosition += 3;
  
  addBlankField("Other urgent items:", true);
  
  addPageFooter();

  // Step 2: Official Notifications
  pdf.addPage();
  yPosition = 20;
  addTitle("OFFICIAL NOTIFICATIONS");
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Social Security Administration", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Contact:");
  addBlankField("Confirmation:");
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Employer or HR Contact", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Contact:");
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Insurance Company", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Company:");
  addBlankField("Policy:");
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Bank or Account Closing", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Status:", true);
  
  addPageFooter();

  // Step 3: Key Documents
  pdf.addPage();
  yPosition = 20;
  addTitle("KEY DOCUMENTS AND LOCATIONS");
  
  addBlankField("Will or Trust Location:");
  addBlankField("Living Trust:");
  addBlankField("Deeds or Titles:");
  addBlankField("Insurance Policy Folder:");
  addBlankField("Tax Returns Found In:");
  addBlankField("Safe Deposit Box:");
  
  addPageFooter();

  // Step 4: Death Certificates
  pdf.addPage();
  yPosition = 20;
  addTitle("DEATH CERTIFICATES");
  
  addBlankField("Number Ordered:");
  addBlankField("Recipients:", true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("All certificates received", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 5: Obituary
  pdf.addPage();
  yPosition = 20;
  addTitle("OBITUARY AND ANNOUNCEMENTS");
  
  addBlankField("Obituary Text:", true);
  addBlankField("Publication(s):", true);
  addBlankField("Online Link:");
  
  addPageFooter();

  // Step 6: Service Details
  pdf.addPage();
  yPosition = 20;
  addTitle("SERVICE AND MEMORIAL DETAILS");
  
  addBlankField("Service Type:");
  addBlankField("Venue:");
  addBlankField("Address:");
  addBlankField("Date/Time:");
  addBlankField("Officiants:", true);
  addBlankField("Music or Readings:", true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Confirmed with funeral home", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 7: Finances and Estate
  pdf.addPage();
  yPosition = 20;
  addTitle("FINANCES AND ESTATE TASKS");
  
  addBlankField("Executor:");
  addBlankField("Contact:");
  addBlankField("Attorney:");
  addBlankField("Bank Accounts or Debts:", true);
  addBlankField("Property Transfers:", true);
  yPosition += 3;
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Estate accounts settled", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 8: Digital Accounts
  pdf.addPage();
  yPosition = 20;
  addTitle("DIGITAL ACCOUNTS AND ACCESS");
  
  for (let i = 1; i <= 3; i++) {
    checkPageBreak(35);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Account ${i}`, marginLeft, yPosition);
    yPosition += 7;
    
    addBlankField("Platform:");
    addBlankField("Username:");
    addBlankField("Status:");
    
    pdf.setFont("helvetica", "bold");
    addCheckbox(marginLeft, yPosition);
    pdf.text("Completed", marginLeft + 8, yPosition);
    yPosition += 7;
    
    addBlankField("Notes:");
    yPosition += 3;
  }
  
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("All digital accounts handled", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Step 9: Real Estate & Utilities
  pdf.addPage();
  yPosition = 20;
  addTitle("REAL ESTATE & UTILITIES");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...colors.subheaderTeal);
  pdf.text("Property 1", marginLeft, yPosition);
  pdf.setTextColor(...colors.bodyGray);
  yPosition += 7;
  
  addBlankField("Address:");
  addBlankField("Mortgage:");
  addBlankField("Tax Info:");
  addBlankField("Insurance:");
  
  checkPageBreak(20);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Utilities & Services:", marginLeft, yPosition);
  yPosition += 6;
  
  const utilityTypes = ["Water", "Electric", "Gas", "Phone", "Internet", "Cable", "Lawn", "Pool", "Pest", "Propane", "Other"];
  utilityTypes.forEach(utility => {
    checkPageBreak(20);
    addBlankField(`${utility}:`);
    pdf.setFont("helvetica", "bold");
    addCheckbox(marginLeft, yPosition);
    pdf.text("Completed", marginLeft + 8, yPosition);
    yPosition += 7;
  });
  
  checkPageBreak(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("Disposition & Transfer:", marginLeft, yPosition);
  yPosition += 6;
  
  addBlankField("Realtor Estimate:");
  addBlankField("Future Use:");
  addBlankField("Transfer Notes:", true);
  
  checkPageBreak(15);
  pdf.setFont("helvetica", "bold");
  addCheckbox(marginLeft, yPosition);
  pdf.text("Property Completed", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addBlankField("Additional Notes:", true);
  
  addPageFooter();

  // Step 10: Subscriptions
  pdf.addPage();
  yPosition = 20;
  addTitle("NON-DIGITAL SUBSCRIPTIONS");
  
  for (let i = 1; i <= 3; i++) {
    checkPageBreak(30);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Subscription ${i}`, marginLeft, yPosition);
    yPosition += 7;
    
    addBlankField("Type:");
    addBlankField("Provider:");
    addBlankField("Account Info:");
    
    pdf.setFont("helvetica", "bold");
    addCheckbox(marginLeft, yPosition);
    pdf.text("Completed", marginLeft + 8, yPosition);
    yPosition += 7;
    
    addBlankField("Notes:", true);
    yPosition += 5;
  }
  
  addPageFooter();

  // Step 11: Other Property
  pdf.addPage();
  yPosition = 20;
  addTitle("OTHER PROPERTY & POSSESSIONS");
  
  for (let i = 1; i <= 2; i++) {
    checkPageBreak(35);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Property Item ${i}`, marginLeft, yPosition);
    yPosition += 7;
    
    addBlankField("Category:");
    addBlankField("Description:", true);
    addBlankField("Location/Storage:");
    addBlankField("Estimated Value:");
    addBlankField("Intended Disposition:");
    addBlankField("Notes:", true);
    
    pdf.setFont("helvetica", "bold");
    addCheckbox(marginLeft, yPosition);
    pdf.text("Completed", marginLeft + 8, yPosition);
    yPosition += 10;
  }
  
  addBlankField("General Notes:", true);
  
  addPageFooter();

  // Step 12: Business
  pdf.addPage();
  yPosition = 20;
  addTitle("BUSINESS OWNERSHIP & MANAGEMENT");
  
  addBlankField("Business Name:");
  addBlankField("Business Type:");
  addBlankField("EIN:");
  addBlankField("Ownership Structure:");
  addBlankField("Key Business Contacts:", true);
  addBlankField("Business Accountant:");
  addBlankField("Business Attorney:");
  
  checkPageBreak(20);
  addBlankField("Succession Plan:", true);
  addBlankField("Business Bank Accounts:", true);
  addBlankField("Business Assets:", true);
  addBlankField("Business Liabilities:", true);
  addBlankField("Disposition Instructions:", true);
  
  checkPageBreak(30);
  pdf.setFont("helvetica", "bold");
  pdf.text("Business Tasks Checklist:", marginLeft, yPosition);
  yPosition += 8;
  
  addCheckbox(marginLeft, yPosition);
  pdf.text("Partners/Co-owners notified", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addCheckbox(marginLeft, yPosition);
  pdf.text("Employees notified", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addCheckbox(marginLeft, yPosition);
  pdf.text("Accounts transferred or closed", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addCheckbox(marginLeft, yPosition);
  pdf.text("Licenses handled", marginLeft + 8, yPosition);
  yPosition += 7;
  
  addCheckbox(marginLeft, yPosition);
  pdf.text("Disposition completed", marginLeft + 8, yPosition);
  
  addPageFooter();

  // Update all page numbers with correct total
  updateAllPageNumbers();

  // Save the PDF
  const fileName = `After-Life-Action-Plan-BLANK-${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(fileName);
};
