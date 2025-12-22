import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("[generate-planner-pdf] Auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      planData,
      selectedSections = [],
      piiData,
      docType = "planner",
      isDraft = false,
    } = await req.json();

    console.log("[generate-planner-pdf] Generating planner PDF", {
      userId: user.id,
      docType,
      isDraft,
      selectedSectionsCount: Array.isArray(selectedSections) ? selectedSections.length : 0,
      planDataKeys: Object.keys(planData || {}),
      contacts_notify: planData?.contacts_notify?.length || 0,
      pets: planData?.pets?.length || 0,
      insurance_policies: Array.isArray(planData?.insurance_policies)
        ? planData.insurance_policies.length
        : planData?.insurance_policies?.policies?.length || 0,
      properties: planData?.properties?.length || 0,
      bank_accounts: planData?.bank_accounts?.length || 0,
      messages: planData?.messages?.length || 0,
    });

    // IMPORTANT: The planner export should always be the full multi-page binder.
    // We generate it programmatically to avoid template mismatches.
    const response = await generateSimplePdf(
      planData,
      Array.isArray(selectedSections) ? selectedSections : [],
      piiData,
      user.id,
      supabase,
      corsHeaders,
      isDraft,
      docType,
    );

    return response;
  } catch (error: unknown) {
    console.error("[generate-planner-pdf] Error generating PDF:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({
      error: "Failed to generate PDF",
      details: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function generateSimplePdf(
  planData: any,
  _selectedSections: string[],
  piiData: any,
  userId: string,
  supabase: any,
  corsHeaders: Record<string, string>,
  isDraft: boolean,
  docType: string,
) {
  const pdfDoc = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 16;

  const profile = { ...(planData?.personal_profile || {}), ...(piiData || {}) };
  const textColor = rgb(0.15, 0.15, 0.15);
  const headerColor = rgb(0.05, 0.35, 0.35);

  const sanitizeForPdf = (text: string): string => {
    if (!text) return "";
    return String(text)
      .replace(/[\r\n]+/g, " ")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, "-")
      .replace(/\u2026/g, "...")
      // Strip ranges that commonly break WinAnsi
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .trim();
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    const sanitized = sanitizeForPdf(text);
    const words = sanitized.split(" ").filter((w) => w.length > 0);
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = helvetica.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const addDraftWatermark = (page: any) => {
    if (!isDraft) return;
    page.drawText("DRAFT", {
      x: 200,
      y: 400,
      size: 72,
      font: helveticaBold,
      color: rgb(0.92, 0.92, 0.92),
      opacity: 0.5,
    });
  };

  const addFooter = (page: any, pageNum: number) => {
    page.drawText("For planning purposes only. Not a legal document.", {
      x: margin,
      y: 40,
      size: 9,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(`Page ${pageNum}`, {
      x: pageWidth - margin - 40,
      y: 40,
      size: 9,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  };

  const addSectionHeader = (page: any, title: string, y: number): number => {
    page.drawText(sanitizeForPdf(title), {
      x: margin,
      y,
      size: 16,
      font: helveticaBold,
      color: headerColor,
    });
    return y - 30;
  };

  const addField = (page: any, label: string, value: string, y: number): number => {
    page.drawText(`${label}:`, {
      x: margin,
      y,
      size: 10,
      font: helveticaBold,
      color: textColor,
    });
    if (value) {
      page.drawText(sanitizeForPdf(value), {
        x: margin + 120,
        y,
        size: 10,
        font: helvetica,
        color: textColor,
      });
    }
    return y - lineHeight;
  };

  const addArrayItems = (
    page: any,
    items: any[],
    formatter: (item: any) => string,
    y: number,
    maxItems: number = 6,
  ): number => {
    let currentY = y;
    const displayItems = (items || []).slice(0, maxItems);

    for (const item of displayItems) {
      const text = sanitizeForPdf(formatter(item));
      if (text && currentY > 80) {
        page.drawText(`• ${text}`, {
          x: margin,
          y: currentY,
          size: 10,
          font: helvetica,
          color: textColor,
        });
        currentY -= lineHeight;
      }
    }

    if ((items || []).length > maxItems) {
      page.drawText(`... and ${(items || []).length - maxItems} more`, {
        x: margin,
        y: currentY,
        size: 9,
        font: helvetica,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= lineHeight;
    }

    return currentY;
  };

  const addNotesBox = (page: any, label: string, notes: string, y: number): number => {
    let currentY = y;
    if (!notes) return currentY;

    page.drawText(`${label}:`, {
      x: margin,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: textColor,
    });
    currentY -= lineHeight;

    const lines = wrapText(notes, pageWidth - margin * 2, 10);
    for (const line of lines.slice(0, 8)) {
      if (currentY > 80) {
        page.drawText(line, {
          x: margin,
          y: currentY,
          size: 10,
          font: helvetica,
          color: textColor,
        });
        currentY -= 14;
      }
    }

    return currentY - 10;
  };

  let pageNum = 1;

  // PAGE 1: Cover
  const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
  coverPage.drawText("My Life & Legacy Planner", {
    x: margin,
    y: pageHeight - 120,
    size: 32,
    font: helveticaBold,
    color: headerColor,
  });
  coverPage.drawText("A Complete Guide for End-of-Life Planning", {
    x: margin,
    y: pageHeight - 160,
    size: 14,
    font: helvetica,
    color: textColor,
  });
  if (profile.full_name) {
    coverPage.drawText(`Prepared for: ${sanitizeForPdf(profile.full_name)}`, {
      x: margin,
      y: pageHeight - 220,
      size: 16,
      font: helveticaBold,
      color: textColor,
    });
  }
  coverPage.drawText(
    `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    {
      x: margin,
      y: pageHeight - 250,
      size: 12,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    },
  );
  addDraftWatermark(coverPage);
  addFooter(coverPage, pageNum++);

  // PAGE 2: Table of Contents
  const tocPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let tocY = addSectionHeader(tocPage, "Table of Contents", pageHeight - 80);
  const tocSections = [
    "Checklist",
    "Instructions",
    "Personal Information",
    "Life Story & Legacy",
    "Contacts to Notify",
    "Service Providers",
    "Funeral & Memorial Wishes",
    "Financial Life",
    "Insurance Policies",
    "Property & Valuables",
    "Pets",
    "Digital Accounts",
    "Legal Documents",
    "Messages to Loved Ones",
    "Revisions",
  ];
  for (let i = 0; i < tocSections.length; i++) {
    tocPage.drawText(`${i + 3}. ${tocSections[i]}`, {
      x: margin,
      y: tocY,
      size: 11,
      font: helvetica,
      color: textColor,
    });
    tocY -= 20;
  }
  addDraftWatermark(tocPage);
  addFooter(tocPage, pageNum++);

  // PAGE 3: Checklist (use ASCII checkbox to avoid WinAnsi issues)
  const checklistPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let checkY = addSectionHeader(checklistPage, "Planning Checklist", pageHeight - 80);
  const checkItems = [
    "Complete personal information",
    "List contacts to notify",
    "Document funeral wishes",
    "Record financial accounts",
    "List insurance policies",
    "Document property and valuables",
    "Arrange pet care",
    "List digital accounts",
    "Gather legal documents",
    "Write messages to loved ones",
  ];
  for (const item of checkItems) {
    checklistPage.drawText(`[ ] ${item}`, {
      x: margin,
      y: checkY,
      size: 11,
      font: helvetica,
      color: textColor,
    });
    checkY -= 22;
  }
  addDraftWatermark(checklistPage);
  addFooter(checklistPage, pageNum++);

  // PAGE 4: Instructions
  const instructionsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let instrY = addSectionHeader(instructionsPage, "How to Use This Document", pageHeight - 80);
  instrY = addNotesBox(
    instructionsPage,
    "Instructions",
    planData?.instructions_notes ||
      "This document contains important information about your wishes and affairs. Store it in a safe place and inform your loved ones of its location.",
    instrY,
  );
  addDraftWatermark(instructionsPage);
  addFooter(instructionsPage, pageNum++);

  // PAGE 5-6: Personal Information
  const personal1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let pY = addSectionHeader(personal1, "Personal Information", pageHeight - 80);
  pY = addField(personal1, "Full Legal Name", profile.full_name || "", pY);
  pY = addField(personal1, "Nicknames", profile.nicknames || "", pY);
  pY = addField(personal1, "Maiden Name", profile.maiden_name || "", pY);
  pY = addField(personal1, "Date of Birth", profile.dob || profile.date_of_birth || "", pY);
  pY = addField(personal1, "Place of Birth", profile.birthplace || profile.place_of_birth || "", pY);
  if (piiData?.ssn) pY = addField(personal1, "SSN", piiData.ssn, pY);
  pY = addField(personal1, "Citizenship", profile.citizenship || "", pY);
  pY -= 10;
  pY = addField(personal1, "Address", profile.address || "", pY);
  pY = addField(personal1, "Phone", profile.phone || "", pY);
  pY = addField(personal1, "Email", profile.email || "", pY);
  pY -= 10;
  pY = addField(personal1, "Marital Status", profile.marital_status || "", pY);
  pY = addField(personal1, "Spouse/Partner", profile.partner_name || "", pY);
  pY = addField(personal1, "Religion", profile.religion || "", pY);
  addDraftWatermark(personal1);
  addFooter(personal1, pageNum++);

  const personal2 = pdfDoc.addPage([pageWidth, pageHeight]);
  pY = addSectionHeader(personal2, "Family Information", pageHeight - 80);
  pY = addField(personal2, "Father", profile.father_name || "", pY);
  pY = addField(personal2, "Mother", profile.mother_name || "", pY);
  pY = addField(personal2, "Ex-Spouse", profile.ex_spouse_name || "", pY);
  if (profile.child_names?.length) {
    pY = addField(personal2, "Children", profile.child_names.join(", "), pY);
  }
  addDraftWatermark(personal2);
  addFooter(personal2, pageNum++);

  // PAGE 7: Life Story & Legacy
  const legacyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let legacyY = addSectionHeader(legacyPage, "My Life Story & Legacy", pageHeight - 80);
  legacyY = addNotesBox(legacyPage, "About Me", planData?.about_me_notes || "", legacyY);
  addDraftWatermark(legacyPage);
  addFooter(legacyPage, pageNum++);

  // PAGE 8-9: Contacts
  const contacts1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let cY = addSectionHeader(contacts1, "People to Notify", pageHeight - 80);
  const contactsList = planData?.contacts_notify || [];
  cY = addArrayItems(
    contacts1,
    contactsList,
    (c) => [c.name, c.relationship ? `(${c.relationship})` : "", c.contact || c.phone || c.email].filter(Boolean).join(" - "),
    cY,
    12,
  );
  addDraftWatermark(contacts1);
  addFooter(contacts1, pageNum++);

  const contacts2 = pdfDoc.addPage([pageWidth, pageHeight]);
  cY = addSectionHeader(contacts2, "Professional Contacts", pageHeight - 80);
  const professionalList = planData?.contacts_professional || [];
  cY = addArrayItems(
    contacts2,
    professionalList,
    (c) => [c.role, c.name, c.company, c.contact].filter(Boolean).join(" - "),
    cY,
    12,
  );
  addDraftWatermark(contacts2);
  addFooter(contacts2, pageNum++);

  // PAGE 10: Service Providers
  const vendorsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let vY = addSectionHeader(vendorsPage, "Service Providers", pageHeight - 80);
  
  // Render service providers array
  const providersList = planData?.service_providers || planData?.providers || [];
  if (providersList.length > 0) {
    vY = addArrayItems(
      vendorsPage,
      providersList,
      (p) => [p.name, p.type ? `(${p.type})` : "", p.phone, p.website, p.address].filter(Boolean).join(" - "),
      vY,
      10,
    );
    vY -= 10;
  }
  
  vY = addNotesBox(vendorsPage, "Notes", planData?.service_providers_notes || "", vY);
  addDraftWatermark(vendorsPage);
  addFooter(vendorsPage, pageNum++);

  // PAGE 11-12: Funeral Wishes
  const funeral1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let fY = addSectionHeader(funeral1, "Funeral & Memorial Wishes", pageHeight - 80);
  
  // Render funeral preferences
  const disp = planData?.funeral_disposition || planData?.disposition || {};
  const svc = planData?.service_preferences || {};
  const fh = planData?.funeral_home || {};
  const cem = planData?.cemetery || {};
  
  if (disp.preference || disp.type) fY = addField(funeral1, "Disposition", disp.preference || disp.type || "", fY);
  if (fh.name) fY = addField(funeral1, "Funeral Home", [fh.name, fh.phone].filter(Boolean).join(" - "), fY);
  if (fh.address) fY = addField(funeral1, "Funeral Home Address", fh.address, fY);
  if (cem.name || cem.location) fY = addField(funeral1, "Cemetery", [cem.name, cem.location].filter(Boolean).join(" - "), fY);
  if (svc.service_type) fY = addField(funeral1, "Service Type", svc.service_type, fY);
  if (svc.location) fY = addField(funeral1, "Service Location", svc.location, fY);
  if (svc.officiant) fY = addField(funeral1, "Officiant", svc.officiant, fY);
  if (svc.music) fY = addField(funeral1, "Music", svc.music, fY);
  if (svc.readings) fY = addField(funeral1, "Readings", svc.readings, fY);
  if (svc.flowers_or_donations) fY = addField(funeral1, "Flowers/Donations", svc.flowers_or_donations, fY);
  if (svc.clothing) fY = addField(funeral1, "Clothing", svc.clothing, fY);
  fY -= 10;
  
  fY = addNotesBox(funeral1, "My Wishes", planData?.funeral_wishes_notes || "", fY);
  
  const funding = planData?.funeral_funding || [];
  if (funding.length > 0) {
    fY -= 10;
    funeral1.drawText("Funding Sources:", { x: margin, y: fY, size: 10, font: helveticaBold, color: textColor });
    fY -= lineHeight;
    fY = addArrayItems(funeral1, funding, (f) => [f.source, f.account].filter(Boolean).join(" - "), fY, 4);
  }
  addDraftWatermark(funeral1);
  addFooter(funeral1, pageNum++);

  const funeral2 = pdfDoc.addPage([pageWidth, pageHeight]);
  let f2Y = addSectionHeader(funeral2, "Service Details (continued)", pageHeight - 80);
  
  // Additional funeral details
  const pallbearers = planData?.pallbearers || [];
  if (pallbearers.length > 0) {
    funeral2.drawText("Pallbearers:", { x: margin, y: f2Y, size: 10, font: helveticaBold, color: textColor });
    f2Y -= lineHeight;
    f2Y = addArrayItems(funeral2, pallbearers, (p) => p.name || p, f2Y, 8);
    f2Y -= 10;
  }
  
  const honoraryPallbearers = planData?.honorary_pallbearers || [];
  if (honoraryPallbearers.length > 0) {
    funeral2.drawText("Honorary Pallbearers:", { x: margin, y: f2Y, size: 10, font: helveticaBold, color: textColor });
    f2Y -= lineHeight;
    f2Y = addArrayItems(funeral2, honoraryPallbearers, (p) => p.name || p, f2Y, 8);
  }
  
  addDraftWatermark(funeral2);
  addFooter(funeral2, pageNum++);

  // PAGE 13: Financial
  const financialPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let finY = addSectionHeader(financialPage, "Financial Life", pageHeight - 80);
  
  const bankList = planData?.bank_accounts || [];
  if (bankList.length > 0) {
    financialPage.drawText("Bank Accounts:", { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
    finY -= lineHeight;
    finY = addArrayItems(
      financialPage,
      bankList,
      (b) => [
        b.bank_name,
        b.account_type,
        b.account_number ? `#${b.account_number}` : "",
        b.pod ? `POD: ${b.pod}` : "",
      ].filter(Boolean).join(" - "),
      finY,
      6,
    );
    finY -= 10;
  }
  
  const investList = planData?.investments || [];
  if (investList.length > 0) {
    financialPage.drawText("Investments:", { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
    finY -= lineHeight;
    finY = addArrayItems(
      financialPage,
      investList,
      (i) => [
        i.brokerage,
        i.account_type,
        i.account_number ? `#${i.account_number}` : "",
      ].filter(Boolean).join(" - "),
      finY,
      4,
    );
    finY -= 10;
  }
  
  // Debts
  const debtsList = planData?.debts || [];
  if (debtsList.length > 0) {
    financialPage.drawText("Debts & Liabilities:", { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
    finY -= lineHeight;
    finY = addArrayItems(
      financialPage,
      debtsList,
      (d) => [
        d.creditor,
        d.debt_type,
        d.account_number ? `#${d.account_number}` : "",
      ].filter(Boolean).join(" - "),
      finY,
      4,
    );
    finY -= 10;
  }
  
  // Businesses
  const businessList = planData?.businesses || [];
  if (businessList.length > 0) {
    financialPage.drawText("Business Interests:", { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
    finY -= lineHeight;
    finY = addArrayItems(
      financialPage,
      businessList,
      (b) => [b.name, b.address, b.partnership_info].filter(Boolean).join(" - "),
      finY,
      4,
    );
    finY -= 10;
  }
  
  finY = addNotesBox(financialPage, "Financial Notes", planData?.financial_notes || "", finY);
  addDraftWatermark(financialPage);
  addFooter(financialPage, pageNum++);

  // PAGE 14: Insurance
  const insurancePage = pdfDoc.addPage([pageWidth, pageHeight]);
  let insY = addSectionHeader(insurancePage, "Insurance Policies", pageHeight - 80);

  // Support both array shape and { policies: [...] } shape
  const insuranceList = Array.isArray(planData?.insurance_policies)
    ? planData.insurance_policies
    : planData?.insurance_policies?.policies || [];

  if (insuranceList.length > 0) {
    insY = addArrayItems(
      insurancePage,
      insuranceList,
      (p) => [
        p.company,
        p.type,
        p.policy_number ? `Policy: ${p.policy_number}` : "",
        p.contact_person ? `Agent: ${p.contact_person}` : "",
        p.phone_or_url,
      ].filter(Boolean).join(" - "),
      insY,
      10,
    );
    insY -= 10;
  }
  
  insY = addNotesBox(insurancePage, "Notes", planData?.insurance_notes || "", insY);
  addDraftWatermark(insurancePage);
  addFooter(insurancePage, pageNum++);

  // PAGE 15: Property
  const propertyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let propY = addSectionHeader(propertyPage, "Property & Valuables", pageHeight - 80);
  
  const propList = planData?.properties || [];
  if (propList.length > 0) {
    propertyPage.drawText("Real Estate:", { x: margin, y: propY, size: 10, font: helveticaBold, color: textColor });
    propY -= lineHeight;
    propY = addArrayItems(
      propertyPage,
      propList,
      (p) => [
        p.address,
        p.kind,
        p.mortgage_bank ? `Lender: ${p.mortgage_bank}` : "",
        p.manager ? `Manager: ${p.manager}` : "",
      ].filter(Boolean).join(" - "),
      propY,
      6,
    );
    propY -= 10;
  }
  
  // Valuables
  const valuablesList = planData?.valuables || [];
  if (valuablesList.length > 0) {
    propertyPage.drawText("Valuables:", { x: margin, y: propY, size: 10, font: helveticaBold, color: textColor });
    propY -= lineHeight;
    propY = addArrayItems(
      propertyPage,
      valuablesList,
      (v) => [v.item, v.location, v.notes].filter(Boolean).join(" - "),
      propY,
      6,
    );
    propY -= 10;
  }
  
  // Safe deposit
  const safeDeposit = planData?.safe_deposit || {};
  if (safeDeposit.location || safeDeposit.bank) {
    propY = addField(propertyPage, "Safe Deposit Box", [safeDeposit.bank, safeDeposit.location, safeDeposit.key_location].filter(Boolean).join(" - "), propY);
    propY -= 10;
  }
  
  propY = addNotesBox(propertyPage, "Notes", planData?.property_notes || "", propY);
  addDraftWatermark(propertyPage);
  addFooter(propertyPage, pageNum++);

  // PAGE 16: Pets
  const petsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let petY = addSectionHeader(petsPage, "Pets", pageHeight - 80);
  petY = addNotesBox(petsPage, "Notes", planData?.pets_notes || "", petY);
  const petsList = planData?.pets || [];
  if (petsList.length > 0) {
    petY -= 10;
    petY = addArrayItems(
      petsPage,
      petsList,
      (p) => [p.name, p.breed, p.caregiver ? `Caregiver: ${p.caregiver}` : "", p.vet_contact ? `Vet: ${p.vet_contact}` : ""].filter(Boolean)
        .join(" - "),
      petY,
      8,
    );
  }
  addDraftWatermark(petsPage);
  addFooter(petsPage, pageNum++);

  // PAGE 17: Digital
  const digitalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let digY = addSectionHeader(digitalPage, "Digital Accounts", pageHeight - 80);
  
  // Render digital accounts array if present
  const digitalList = planData?.digital_assets || planData?.digital_accounts || [];
  if (digitalList.length > 0) {
    digY = addArrayItems(
      digitalPage,
      digitalList,
      (d) => [d.provider || d.service, d.type || d.account_type, d.access_person ? `Access: ${d.access_person}` : ""].filter(Boolean).join(" - "),
      digY,
      10,
    );
    digY -= 10;
  }
  
  // Render phones if present
  const phonesList = planData?.phones || [];
  if (phonesList.length > 0) {
    digitalPage.drawText("Phone Accounts:", { x: margin, y: digY, size: 10, font: helveticaBold, color: textColor });
    digY -= lineHeight;
    digY = addArrayItems(
      digitalPage,
      phonesList,
      (p) => [p.phone_number, p.carrier, p.access_info].filter(Boolean).join(" - "),
      digY,
      6,
    );
    digY -= 10;
  }
  
  digY = addNotesBox(digitalPage, "Notes", planData?.digital_notes || "", digY);
  addDraftWatermark(digitalPage);
  addFooter(digitalPage, pageNum++);

  // PAGE 18: Legal
  const legalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let legY = addSectionHeader(legalPage, "Legal Documents", pageHeight - 80);
  
  // Render legal document details
  const legal = planData?.legal || {};
  if (legal.executor_name) legY = addField(legalPage, "Executor", legal.executor_name, legY);
  if (legal.executor_phone) legY = addField(legalPage, "Executor Phone", legal.executor_phone, legY);
  if (legal.executor_email) legY = addField(legalPage, "Executor Email", legal.executor_email, legY);
  if (legal.alternate_executor) legY = addField(legalPage, "Alternate Executor", legal.alternate_executor, legY);
  legY -= 10;
  
  if (legal.poa_name) legY = addField(legalPage, "Power of Attorney", legal.poa_name, legY);
  if (legal.poa_phone) legY = addField(legalPage, "POA Phone", legal.poa_phone, legY);
  if (legal.healthcare_proxy) legY = addField(legalPage, "Healthcare Proxy", legal.healthcare_proxy, legY);
  if (legal.healthcare_proxy_phone) legY = addField(legalPage, "Proxy Phone", legal.healthcare_proxy_phone, legY);
  legY -= 10;
  
  if (legal.will_location) legY = addField(legalPage, "Will Location", legal.will_location, legY);
  if (legal.trust_location) legY = addField(legalPage, "Trust Location", legal.trust_location, legY);
  if (legal.poa_document_location) legY = addField(legalPage, "POA Document Location", legal.poa_document_location, legY);
  if (legal.living_will_location) legY = addField(legalPage, "Living Will Location", legal.living_will_location, legY);
  if (legal.safe_deposit_location) legY = addField(legalPage, "Safe Deposit Box", legal.safe_deposit_location, legY);
  legY -= 10;
  
  if (legal.attorney_name) legY = addField(legalPage, "Attorney", legal.attorney_name, legY);
  if (legal.attorney_phone) legY = addField(legalPage, "Attorney Phone", legal.attorney_phone, legY);
  if (legal.attorney_firm) legY = addField(legalPage, "Law Firm", legal.attorney_firm, legY);
  
  legY = addNotesBox(legalPage, "Notes", planData?.legal_notes || "", legY);
  addDraftWatermark(legalPage);
  addFooter(legalPage, pageNum++);

  // PAGES 19-22: Messages
  const messagesPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let msgY = addSectionHeader(messagesPage, "Messages to Loved Ones", pageHeight - 80);
  msgY = addNotesBox(messagesPage, "General Message", planData?.to_loved_ones_message || planData?.messages_notes || "", msgY);
  const messagesList = planData?.messages || [];
  if (messagesList.length > 0) {
    msgY -= 10;
    msgY = addArrayItems(
      messagesPage,
      messagesList,
      (m) => [m.audience || m.to_name || m.recipients, m.title].filter(Boolean).join(": "),
      msgY,
      6,
    );
  }
  addDraftWatermark(messagesPage);
  addFooter(messagesPage, pageNum++);

  for (let i = 0; i < 3; i++) {
    const msgContPage = pdfDoc.addPage([pageWidth, pageHeight]);
    addSectionHeader(msgContPage, `Messages (continued - page ${i + 2})`, pageHeight - 80);
    addDraftWatermark(msgContPage);
    addFooter(msgContPage, pageNum++);
  }

  // PAGES 23-24: Revisions
  const revPage1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let revY = addSectionHeader(revPage1, "Revisions & Updates", pageHeight - 80);
  revPage1.drawText("Use this section to record any changes or updates to your plan.", {
    x: margin,
    y: revY,
    size: 11,
    font: helvetica,
    color: textColor,
  });
  revY -= 40;
  revPage1.drawText("Date                    Change Made                    Initials", {
    x: margin,
    y: revY,
    size: 10,
    font: helveticaBold,
    color: textColor,
  });
  revY -= 20;
  for (let i = 0; i < 10; i++) {
    revPage1.drawText("________    ________________________________    ______", {
      x: margin,
      y: revY,
      size: 10,
      font: helvetica,
      color: rgb(0.7, 0.7, 0.7),
    });
    revY -= 24;
  }
  addDraftWatermark(revPage1);
  addFooter(revPage1, pageNum++);

  const revPage2 = pdfDoc.addPage([pageWidth, pageHeight]);
  revY = addSectionHeader(revPage2, "Revisions (continued)", pageHeight - 80);
  revY -= 20;
  for (let i = 0; i < 12; i++) {
    revPage2.drawText("________    ________________________________    ______", {
      x: margin,
      y: revY,
      size: 10,
      font: helvetica,
      color: rgb(0.7, 0.7, 0.7),
    });
    revY -= 24;
  }
  addDraftWatermark(revPage2);
  addFooter(revPage2, pageNum++);

  console.log(`[generate-planner-pdf] Generated planner PDF with ${pageNum - 1} pages`);

  const pdfBytes = await pdfDoc.save();

  const timestamp = Date.now();
  const filename = `${userId}/${docType}_${timestamp}.pdf`;

  const { error: uploadError } = await supabase
    .storage
    .from("generated-pdfs")
    .upload(filename, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.error("[generate-planner-pdf] Upload error:", uploadError);
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    return new Response(JSON.stringify({
      success: true,
      pdfBase64: base64Pdf,
      filename: `My-Life-and-Legacy-Planner-${new Date().toISOString().split("T")[0]}.pdf`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: signedUrl, error: signedError } = await supabase
    .storage
    .from("generated-pdfs")
    .createSignedUrl(filename, 3600);

  if (signedError) {
    console.error("[generate-planner-pdf] Signed URL error:", signedError);
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    return new Response(JSON.stringify({
      success: true,
      pdfBase64: base64Pdf,
      filename: `My-Life-and-Legacy-Planner-${new Date().toISOString().split("T")[0]}.pdf`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await supabase.from("generated_documents").insert({
    user_id: userId,
    plan_id: planData?.id || null,
    doc_type: docType,
    storage_bucket: "generated-pdfs",
    storage_path: filename,
  });

  return new Response(JSON.stringify({
    success: true,
    url: signedUrl.signedUrl,
    filename: `My-Life-and-Legacy-Planner-${new Date().toISOString().split("T")[0]}.pdf`,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
