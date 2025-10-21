import jsPDF from "jspdf";

interface PlanData {
  decedentName?: string;
  step1?: any;
  step2?: any;
  step3?: any;
  step4?: any;
  step5?: any;
  step6?: any;
  step7?: any;
  step8?: any;
}

export const generateAfterLifePlanPDF = (formData: PlanData, decedentName: string) => {
  const pdf = new jsPDF();
  let yPos = 20;
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (additionalSpace: number = 10) => {
    if (yPos + additionalSpace > pageHeight - 20) {
      pdf.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Helper function to add wrapped text
  const addWrappedText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    pdf.setFontSize(fontSize);
    pdf.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkPageBreak();
      pdf.text(line, margin, yPos);
      yPos += fontSize * 0.5;
    });
  };

  // Cover Page
  pdf.setFillColor(99, 102, 241); // Primary color
  pdf.rect(0, 0, pageWidth, 80, "F");
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text("Everlasting Next Steps", pageWidth / 2, 40, { align: "center" });
  
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "normal");
  pdf.text("After-Life Action Plan", pageWidth / 2, 55, { align: "center" });
  
  pdf.setTextColor(0, 0, 0);
  yPos = 100;
  
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Plan for: ${decedentName || "Unnamed"}`, margin, yPos);
  yPos += 15;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 20;

  // Add overview
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("What This Plan Helps You Do", margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  addWrappedText(
    "The Everlasting Next Steps Plan guides family members and executors through what to do in the hours and days after a loss. It provides organized checklists, document tracking, and guidance so nothing important is missed."
  );
  yPos += 10;

  // Step 1: Immediate Needs
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 1 – Immediate Needs (First 48 Hours)", margin, yPos);
  yPos += 10;
  
  if (formData.step1) {
    const step1 = formData.step1;
    
    pdf.setFontSize(11);
    pdf.text(`${step1.funeralHomeContacted ? "☑" : "☐"} Contact funeral home`, margin, yPos);
    yPos += 6;
    if (step1.funeralHomeName) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`   Name: ${step1.funeralHomeName}`, margin, yPos);
      yPos += 5;
    }
    if (step1.funeralHomePhone) {
      pdf.text(`   Phone: ${step1.funeralHomePhone}`, margin, yPos);
      yPos += 5;
    }
    yPos += 3;
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step1.residenceSecured ? "☑" : "☐"} Secure residence`, margin, yPos);
    yPos += 6;
    if (step1.residenceNotes) {
      pdf.setFont("helvetica", "normal");
      addWrappedText(`   Notes: ${step1.residenceNotes}`);
      yPos += 3;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step1.familyNotified ? "☑" : "☐"} Notify immediate family`, margin, yPos);
    yPos += 6;
    if (step1.familyContacts) {
      pdf.setFont("helvetica", "normal");
      addWrappedText(`   Contacts: ${step1.familyContacts}`);
      yPos += 3;
    }
    
    if (step1.otherUrgent) {
      yPos += 5;
      pdf.setFont("helvetica", "bold");
      pdf.text("Other urgent items:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step1.otherUrgent);
    }
  }

  // Step 2: Official Notifications
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 2 – Official Notifications", margin, yPos);
  yPos += 10;
  
  if (formData.step2) {
    const step2 = formData.step2;
    pdf.setFontSize(11);
    
    pdf.text(`${step2.ssaDone ? "☑" : "☐"} Social Security Administration`, margin, yPos);
    yPos += 6;
    if (step2.ssaContact || step2.ssaConfirmation) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      if (step2.ssaContact) {
        pdf.text(`   Contact: ${step2.ssaContact}`, margin, yPos);
        yPos += 5;
      }
      if (step2.ssaConfirmation) {
        pdf.text(`   Confirmation: ${step2.ssaConfirmation}`, margin, yPos);
        yPos += 5;
      }
    }
    yPos += 3;
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step2.employerDone ? "☑" : "☐"} Employer / HR Contact`, margin, yPos);
    yPos += 6;
    if (step2.employerContact) {
      pdf.setFont("helvetica", "normal");
      pdf.text(`   ${step2.employerContact}`, margin, yPos);
      yPos += 5;
    }
    yPos += 3;
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step2.insuranceDone ? "☑" : "☐"} Insurance Company`, margin, yPos);
    yPos += 6;
    if (step2.insuranceCompany || step2.insurancePolicy) {
      pdf.setFont("helvetica", "normal");
      if (step2.insuranceCompany) {
        pdf.text(`   Company: ${step2.insuranceCompany}`, margin, yPos);
        yPos += 5;
      }
      if (step2.insurancePolicy) {
        pdf.text(`   Policy: ${step2.insurancePolicy}`, margin, yPos);
        yPos += 5;
      }
    }
    yPos += 3;
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step2.bankDone ? "☑" : "☐"} Bank / Account Closing`, margin, yPos);
    yPos += 6;
    if (step2.bankStatus) {
      pdf.setFont("helvetica", "normal");
      addWrappedText(`   ${step2.bankStatus}`);
      yPos += 3;
    }
    
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step2.utilitiesDone ? "☑" : "☐"} Utilities / Subscriptions`, margin, yPos);
    yPos += 6;
    if (step2.utilitiesList) {
      pdf.setFont("helvetica", "normal");
      addWrappedText(`   ${step2.utilitiesList}`);
    }
  }

  // Step 3: Key Documents
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 3 – Find Key Documents", margin, yPos);
  yPos += 10;
  
  if (formData.step3) {
    const step3 = formData.step3;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    if (step3.willLocation) {
      pdf.text(`Will / Trust: ${step3.willLocation}`, margin, yPos);
      yPos += 6;
    }
    if (step3.trustLocation) {
      pdf.text(`Living Trust: ${step3.trustLocation}`, margin, yPos);
      yPos += 6;
    }
    if (step3.deedsLocation) {
      pdf.text(`Deeds/Titles: ${step3.deedsLocation}`, margin, yPos);
      yPos += 6;
    }
    if (step3.insuranceLocation) {
      pdf.text(`Insurance Policies: ${step3.insuranceLocation}`, margin, yPos);
      yPos += 6;
    }
    if (step3.taxDocLocation) {
      pdf.text(`Tax Documents: ${step3.taxDocLocation}`, margin, yPos);
      yPos += 6;
    }
    if (step3.safeDepositBox) {
      pdf.text(`Safe Deposit Box: ${step3.safeDepositBox}`, margin, yPos);
      yPos += 6;
    }
  }

  // Step 4: Death Certificates
  checkPageBreak(40);
  yPos += 10;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 4 – Death Certificates", margin, yPos);
  yPos += 10;
  
  if (formData.step4) {
    const step4 = formData.step4;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    if (step4.numberOrdered) {
      pdf.text(`Number ordered: ${step4.numberOrdered}`, margin, yPos);
      yPos += 6;
    }
    if (step4.recipients) {
      pdf.text("Recipients:", margin, yPos);
      yPos += 6;
      addWrappedText(step4.recipients);
      yPos += 3;
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step4.allReceived ? "☑" : "☐"} All certificates received`, margin, yPos);
  }

  // Step 5: Obituary
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 5 – Obituary & Announcements", margin, yPos);
  yPos += 10;
  
  if (formData.step5) {
    const step5 = formData.step5;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    if (step5.obituaryText) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Obituary Text:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step5.obituaryText);
      yPos += 5;
    }
    if (step5.publications) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Publications:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step5.publications);
      yPos += 5;
    }
    if (step5.onlineLink) {
      pdf.text(`Online Link: ${step5.onlineLink}`, margin, yPos);
    }
  }

  // Step 6: Service Details
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 6 – Service & Memorial Details", margin, yPos);
  yPos += 10;
  
  if (formData.step6) {
    const step6 = formData.step6;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    if (step6.serviceType) {
      pdf.text(`Service Type: ${step6.serviceType}`, margin, yPos);
      yPos += 6;
    }
    if (step6.venueName) {
      pdf.text(`Venue: ${step6.venueName}`, margin, yPos);
      yPos += 6;
    }
    if (step6.venueAddress) {
      pdf.text(`Address: ${step6.venueAddress}`, margin, yPos);
      yPos += 6;
    }
    if (step6.dateTime) {
      pdf.text(`Date/Time: ${new Date(step6.dateTime).toLocaleString()}`, margin, yPos);
      yPos += 6;
    }
    if (step6.officiants) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Officiants:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step6.officiants);
      yPos += 3;
    }
    if (step6.musicReadings) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Music/Readings:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step6.musicReadings);
      yPos += 3;
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step6.confirmed ? "☑" : "☐"} Confirmed with funeral home`, margin, yPos);
  }

  // Step 7: Finances & Estate
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 7 – Finances & Estate", margin, yPos);
  yPos += 10;
  
  if (formData.step7) {
    const step7 = formData.step7;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    if (step7.executorName) {
      pdf.text(`Executor: ${step7.executorName}`, margin, yPos);
      yPos += 6;
    }
    if (step7.executorContact) {
      pdf.text(`Contact: ${step7.executorContact}`, margin, yPos);
      yPos += 6;
    }
    if (step7.attorney) {
      pdf.text(`Attorney: ${step7.attorney}`, margin, yPos);
      yPos += 6;
    }
    if (step7.bankAccounts) {
      yPos += 3;
      pdf.setFont("helvetica", "bold");
      pdf.text("Bank Accounts:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step7.bankAccounts);
      yPos += 3;
    }
    if (step7.propertyTransfers) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Property Transfers:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step7.propertyTransfers);
      yPos += 3;
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step7.estateSettled ? "☑" : "☐"} Estate accounts settled`, margin, yPos);
  }

  // Step 8: Digital Accounts
  pdf.addPage();
  yPos = 20;
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text("Step 8 – Digital Accounts", margin, yPos);
  yPos += 10;
  
  if (formData.step8) {
    const step8 = formData.step8;
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    
    if (step8.primaryEmail) {
      pdf.text(`Primary Email: ${step8.primaryEmail}`, margin, yPos);
      yPos += 6;
    }
    if (step8.socialMediaAccounts) {
      yPos += 3;
      pdf.setFont("helvetica", "bold");
      pdf.text("Social Media:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step8.socialMediaAccounts);
      yPos += 3;
    }
    if (step8.streamingServices) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Streaming/Subscriptions:", margin, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      addWrappedText(step8.streamingServices);
      yPos += 3;
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(`${step8.allClosed ? "☑" : "☐"} All digital accounts closed`, margin, yPos);
  }

  // Footer on last page
  yPos = pageHeight - 15;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    "Generated by Everlasting Funeral Advisors – everlastingfuneraladvisors.com",
    pageWidth / 2,
    yPos,
    { align: "center" }
  );

  // Save the PDF
  const fileName = `After-Life-Plan-${decedentName?.replace(/\s+/g, "-") || "Unnamed"}-${
    new Date().toISOString().split("T")[0]
  }.pdf`;
  pdf.save(fileName);
};
