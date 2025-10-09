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
  const marginBottom = 20;
  const lineHeight = 7;

  // Helper to sanitize text for PDF (handle special characters)
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, '-') // Replace em/en dashes
      .replace(/\u2026/g, '...'); // Replace ellipsis
  };

  // Helper to add small logo to bottom right of page
  const addPageLogo = () => {
    try {
      pdf.addImage(everlastingLogo, 'PNG', pageWidth - 25, pageHeight - 25, 15, 15);
    } catch (error) {
      console.error('Error adding page logo:', error);
    }
  };

  const checkPageBreak = (additionalSpace: number = 10) => {
    if (yPosition + additionalSpace > pageHeight - marginBottom) {
      addPageLogo(); // Add logo before new page
      pdf.addPage();
      yPosition = 20;
    }
  };

  const addTitle = (title: string) => {
    checkPageBreak(15);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(sanitizeText(title), 20, yPosition);
    yPosition += 10;
  };

  const addSection = (heading: string, content?: string, showBlankLines: boolean = true) => {
    checkPageBreak(20);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(sanitizeText(heading), 20, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    
    if (content && content.trim()) {
      const sanitized = sanitizeText(content);
      const lines = pdf.splitTextToSize(sanitized, 170);
      lines.forEach((line: string) => {
        checkPageBreak();
        pdf.text(line, 20, yPosition);
        yPosition += lineHeight;
      });
    } else if (showBlankLines) {
      // Add blank lines for printing/hand-writing
      pdf.setTextColor(150, 150, 150);
      for (let i = 0; i < 3; i++) {
        checkPageBreak();
        pdf.text("_".repeat(80), 20, yPosition);
        yPosition += lineHeight;
      }
      pdf.setTextColor(0, 0, 0);
    }
    yPosition += 5;
  };

  const addField = (label: string, value?: string) => {
    checkPageBreak(15);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(sanitizeText(label) + ":", 20, yPosition);
    yPosition += lineHeight;
    
    pdf.setFont("helvetica", "normal");
    if (value && value.trim()) {
      const sanitized = sanitizeText(value);
      const lines = pdf.splitTextToSize(sanitized, 170);
      lines.forEach((line: string) => {
        checkPageBreak();
        pdf.text(line, 25, yPosition);
        yPosition += lineHeight;
      });
    } else {
      pdf.setTextColor(150, 150, 150);
      pdf.text("_".repeat(75), 25, yPosition);
      yPosition += lineHeight;
      pdf.setTextColor(0, 0, 0);
    }
    yPosition += 3;
  };

  // Cover page
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.text("My Final Wishes", 105, 60, { align: "center" });
  
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  pdf.text("End-of-Life Planning Guide", 105, 75, { align: "center" });
  
  if (planData.prepared_by) {
    pdf.setFontSize(12);
    pdf.text(sanitizeText(`Prepared for: ${planData.prepared_by}`), 105, 95, { align: "center" });
  } else {
    pdf.setFontSize(12);
    pdf.setTextColor(150, 150, 150);
    pdf.text("Prepared for: ___________________________", 105, 95, { align: "center" });
    pdf.setTextColor(0, 0, 0);
  }
  
  pdf.setFontSize(10);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 110, { align: "center" });
  
  // Add contact info on cover page
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Provided by:", 105, 140, { align: "center" });
  pdf.text("Everlasting Funeral Advisors", 105, 150, { align: "center" });
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);
  pdf.text("Phone: (323) 863-5804", 105, 162, { align: "center" });
  pdf.text("Email: info@everlastingfuneraladvisors.com", 105, 169, { align: "center" });
  pdf.text("Website: https://everlastingfuneraladvisors.com", 105, 176, { align: "center" });
  pdf.text("Facebook: https://www.facebook.com/profile.php?id=61580859545223", 105, 183, { align: "center" });
  
  // Add logo at the bottom of cover page
  try {
    pdf.addImage(everlastingLogo, 'PNG', pageWidth / 2 - 25, pageHeight - 65, 50, 50);
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }

  // Add sections
  pdf.addPage();
  yPosition = 20;

  // Instructions Section
  addTitle("📝 Instructions");
  addSection("General Instructions", planData.instructions_notes);

  // Personal Information Section
  addTitle("👤 My Personal Information");
  const profile = planData.personal_profile || {};
  addField("Full Legal Name", profile.legal_name);
  addField("Date of Birth", profile.date_of_birth);
  addField("Social Security Number", profile.ssn);
  addField("Address", profile.address);
  addField("Phone", profile.phone);
  addField("Email", profile.email);

  // About Me Section
  addTitle("🌟 About Me");
  addSection("My Story & Legacy", planData.about_me_notes);

  // Key Contacts Section
  addTitle("📞 Key Contacts to Notify");
  const contacts = planData.contacts || [];
  if (contacts.length > 0) {
    contacts.forEach((contact: any, index: number) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Contact ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Name", contact.name);
      addField("Relationship", contact.relationship);
      addField("Contact Info", contact.contact);
      addField("Notes", contact.note);
      yPosition += 3;
    });
  } else {
    for (let i = 1; i <= 3; i++) {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Contact ${i}`, 20, yPosition);
      yPosition += lineHeight;
      addField("Name", "");
      addField("Relationship", "");
      addField("Contact Info", "");
      addField("Notes", "");
      yPosition += 3;
    }
  }

  // Vendors Section
  addTitle("🤝 Preferred Vendors");
  const vendors = planData.vendors || [];
  if (vendors.length > 0) {
    vendors.forEach((vendor: any, index: number) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Vendor ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Type", vendor.type);
      addField("Business Name", vendor.business);
      addField("Contact", vendor.contact);
      addField("Notes", vendor.notes);
      yPosition += 3;
    });
  } else {
    for (let i = 1; i <= 2; i++) {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Vendor ${i}`, 20, yPosition);
      yPosition += lineHeight;
      addField("Type", "");
      addField("Business Name", "");
      addField("Contact", "");
      addField("Notes", "");
      yPosition += 3;
    }
  }

  // Funeral Wishes Section
  addTitle("🕊️ Funeral Wishes");
  const funeral = planData.funeral || {};
  addField("Funeral Preference", funeral.funeral_preference);
  addField("Burial", funeral.burial ? "Yes" : "No");
  if (funeral.burial_notes) addField("Burial Notes", funeral.burial_notes);
  addField("Cremation", funeral.cremation ? "Yes" : "No");
  if (funeral.cremation_notes) addField("Cremation Notes", funeral.cremation_notes);
  addField("Body/Organ Donation", funeral.donation ? "Yes" : "No");
  if (funeral.donation_notes) addField("Donation Notes", funeral.donation_notes);
  addField("Cemetery Plot Details", funeral.cemetery_plot);
  addField("Religious Service", funeral.religious_service ? "Yes" : "No");
  if (funeral.religious_notes) addField("Religious Service Notes", funeral.religious_notes);
  addField("Additional Details", funeral.general_notes);

  // Financial Life Section
  addTitle("💰 Financial Life");
  const financial = planData.financial || {};
  const accounts = financial.accounts || [];
  if (accounts.length > 0) {
    accounts.forEach((account: any, index: number) => {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Account ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Type", account.type);
      addField("Institution", account.institution);
      addField("Details", account.details);
      yPosition += 3;
    });
  } else {
    for (let i = 1; i <= 2; i++) {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Account ${i}`, 20, yPosition);
      yPosition += lineHeight;
      addField("Type", "");
      addField("Institution", "");
      addField("Details", "");
      yPosition += 3;
    }
  }
  if (financial.safe_deposit_details) addField("Safe Deposit Box", financial.safe_deposit_details);
  if (financial.crypto_details) addField("Cryptocurrency", financial.crypto_details);
  if (financial.business_details) addField("Business Interests", financial.business_details);
  if (financial.debts_details) addField("Outstanding Debts", financial.debts_details);

  // Insurance Section
  addTitle("🛡️ Insurance");
  const insurance = planData.insurance || {};
  const policies = insurance.policies || [];
  if (policies.length > 0) {
    policies.forEach((policy: any, index: number) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Policy ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Type", policy.type);
      addField("Company", policy.company);
      addField("Policy Number", policy.policy_number);
      addField("Agent/Contact", policy.agent);
      addField("Beneficiaries", policy.beneficiaries);
      addField("Document Location", policy.location);
      yPosition += 3;
    });
  } else {
    for (let i = 1; i <= 2; i++) {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Policy ${i}`, 20, yPosition);
      yPosition += lineHeight;
      addField("Type", "");
      addField("Company", "");
      addField("Policy Number", "");
      addField("Agent/Contact", "");
      addField("Beneficiaries", "");
      addField("Document Location", "");
      yPosition += 3;
    }
  }

  // Property Section
  addTitle("🏠 My Property");
  const property = planData.property || {};
  if (property.home_details) addField("Primary Residence", property.home_details);
  if (property.vacation_details) addField("Vacation/Secondary Property", property.vacation_details);
  if (property.vehicles_details) addField("Vehicles", property.vehicles_details);
  
  const propertyItems = property.items || [];
  if (propertyItems.length > 0) {
    propertyItems.forEach((item: any, index: number) => {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Valuable Item ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Item Name", item.item);
      addField("Value", item.value);
      addField("Location", item.location);
      addField("Intended Recipient", item.recipient);
      yPosition += 3;
    });
  }

  // Pets Section
  addTitle("🐾 My Pets");
  addSection("Pet Care Instructions", planData.pets_notes);

  // Digital World Section
  addTitle("💻 Digital World");
  const digital = planData.digital || {};
  const digitalAccounts = digital.accounts || [];
  if (digitalAccounts.length > 0) {
    digitalAccounts.forEach((account: any, index: number) => {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Digital Account ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Platform", account.platform);
      addField("Username", account.username);
      addField("Access Instructions", account.access);
      addField("Wishes", account.wishes);
      yPosition += 3;
    });
  } else {
    for (let i = 1; i <= 2; i++) {
      checkPageBreak(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Digital Account ${i}`, 20, yPosition);
      yPosition += lineHeight;
      addField("Platform", "");
      addField("Username", "");
      addField("Access Instructions", "");
      addField("Wishes", "");
      yPosition += 3;
    }
  }
  if (digital.devices_notes) addField("Devices & Passwords", digital.devices_notes);

  // Legal Section
  addTitle("⚖️ Legal");
  const legal = planData.legal || {};
  addField("I have a will", legal.has_will ? "Yes" : "No");
  if (legal.will_details) addField("Will Details", legal.will_details);
  addField("I have a trust", legal.has_trust ? "Yes" : "No");
  if (legal.trust_details) addField("Trust Details", legal.trust_details);
  addField("Power of Attorney", legal.has_poa ? "Yes" : "No");
  if (legal.poa_details) addField("POA Details", legal.poa_details);
  addField("Advance Healthcare Directive", legal.has_advance_directive ? "Yes" : "No");
  if (legal.advance_directive_details) addField("Directive Details", legal.advance_directive_details);

  // Messages Section
  addTitle("❤️ Messages to Loved Ones");
  const messages = planData.messages || [];
  if (messages.length > 0) {
    messages.forEach((message: any, index: number) => {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(sanitizeText(`Message ${index + 1}`), 20, yPosition);
      yPosition += lineHeight;
      addField("Recipient", message.recipient);
      addField("Message", message.message);
      yPosition += 5;
    });
  } else {
    for (let i = 1; i <= 2; i++) {
      checkPageBreak(25);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Message ${i}`, 20, yPosition);
      yPosition += lineHeight;
      addField("Recipient", "");
      addField("Message", "");
      yPosition += 5;
    }
  }

  // Footer on last page
  checkPageBreak(40);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Contact Information:", 105, yPosition, { align: "center" });
  yPosition += 8;
  
  pdf.setFontSize(9);
  pdf.text("Everlasting Funeral Advisors", 105, yPosition, { align: "center" });
  yPosition += 7;
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);
  pdf.text("Phone: (323) 863-5804", 105, yPosition, { align: "center" });
  yPosition += 5;
  pdf.text("Email: info@everlastingfuneraladvisors.com", 105, yPosition, { align: "center" });
  yPosition += 5;
  pdf.text("Website: https://everlastingfuneraladvisors.com", 105, yPosition, { align: "center" });
  yPosition += 5;
  pdf.text("Facebook: https://www.facebook.com/profile.php?id=61580859545223", 105, yPosition, { align: "center" });

  // Add logo to last page
  addPageLogo();

  return pdf;
};
