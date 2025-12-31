import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Section key normalizer to handle UI vs PDF key mismatches
const SECTION_KEY_MAP: Record<string, string> = {
  personal: "personal_information",
  personal_information: "personal_information",
  contacts: "contacts_notify",
  notify: "contacts_notify",
  contacts_notify: "contacts_notify",
  professional_contacts: "professional_contacts",
  pros: "professional_contacts",
  service_providers: "service_providers",
  vendors: "service_providers",
  funeral: "funeral_wishes",
  funeral_wishes: "funeral_wishes",
  financial: "financial",
  financial_life: "financial",
  insurance: "insurance",
  insurance_policies: "insurance",
  property: "property",
  properties: "property",
  valuables: "property",
  pets: "pets",
  digital: "digital",
  digital_accounts: "digital",
  digital_assets: "digital",
  legal: "legal",
  legal_documents: "legal",
  messages: "messages",
  notes: "notes",
};

function normalizeSelectedSections(selected: any): Set<string> {
  const list = Array.isArray(selected) ? selected : [];
  const normalized = list.map((k: string) => SECTION_KEY_MAP[k] || k);
  return new Set(normalized);
}

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
      planData: rawPlanData,
      selectedSections = [],
      piiData,
      docType = "planner",
      isDraft = false,
    } = await req.json();

    // Ensure all expected planData keys exist with defaults
    const planData = rawPlanData || {};
    planData.contacts_notify = planData.contacts_notify || [];
    planData.pets = planData.pets || [];
    planData.insurance_policies = planData.insurance_policies || [];
    planData.properties = planData.properties || [];
    planData.bank_accounts = planData.bank_accounts || [];
    planData.digital_assets = planData.digital_assets || [];
    planData.messages = planData.messages || [];
    planData.legal = planData.legal || {};
    planData.contacts_professional = planData.contacts_professional || [];
    planData.service_providers = planData.service_providers || [];
    planData.investments = planData.investments || [];
    planData.debts = planData.debts || [];
    planData.businesses = planData.businesses || [];
    planData.funeral_funding = planData.funeral_funding || [];
    planData.pallbearers = planData.pallbearers || [];
    planData.honorary_pallbearers = planData.honorary_pallbearers || [];
    planData.valuables = planData.valuables || [];
    planData.phones = planData.phones || [];

    // Normalize selectedSections for consistent matching
    const selectedSet = normalizeSelectedSections(selectedSections);
    const hasFilter = selectedSet.size > 0;

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
      investments: planData?.investments?.length || 0,
      debts: planData?.debts?.length || 0,
      legal_keys: Object.keys(planData?.legal || {}),
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

  const addField = (page: any, label: string, value: any, y: number): number => {
    const v = sanitizeForPdf((value ?? "").toString().trim());

    page.drawText(`${sanitizeForPdf(label)}:`, {
      x: margin,
      y,
      size: 10,
      font: helveticaBold,
      color: textColor,
    });

    // Always draw something so the field never “disappears” in the PDF
    page.drawText(v || "", {
      x: margin + 120,
      y,
      size: 10,
      font: helvetica,
      color: textColor,
    });

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
    const displayItems = Array.isArray(items) ? items.slice(0, maxItems) : [];

    // Don't draw anything if no items - caller should use drawEmpty instead
    if (displayItems.length === 0) {
      return currentY;
    }

    for (const item of displayItems) {
      if (currentY <= 80) break;

      const raw = formatter(item);
      const text = sanitizeForPdf((raw ?? "").toString().trim());
      if (!text) continue;

      page.drawText(`• ${text}`, {
        x: margin,
        y: currentY,
        size: 10,
        font: helvetica,
        color: textColor,
      });

      currentY -= lineHeight;
    }

    return currentY;
  };

  // Helper: check if text value has content
  const hasText = (v: any): boolean => {
    return (v ?? "").toString().trim().length > 0;
  };

  // Helper: check if array has items
  const hasAny = (items: any[]): boolean => {
    return Array.isArray(items) && items.length > 0;
  };

  // Helper: draw "No information entered" placeholder
  const drawEmpty = (page: any, y: number, msg = "No information entered."): number => {
    page.drawText(msg, { x: margin, y, size: 10, font: helvetica, color: rgb(0.5, 0.5, 0.5) });
    return y - lineHeight;
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
  
  if (hasAny(contactsList)) {
    cY = addArrayItems(
      contacts1,
      contactsList,
      (c) => [c.name, c.relationship ? `(${c.relationship})` : "", c.contact || c.phone || c.email].filter(Boolean).join(" - "),
      cY,
      12,
    );
  } else {
    cY = drawEmpty(contacts1, cY);
  }
  addDraftWatermark(contacts1);
  addFooter(contacts1, pageNum++);

  const contacts2 = pdfDoc.addPage([pageWidth, pageHeight]);
  cY = addSectionHeader(contacts2, "Professional Contacts", pageHeight - 80);
  const professionalList = planData?.contacts_professional || [];
  if (hasAny(professionalList)) {
    cY = addArrayItems(
      contacts2,
      professionalList,
      (c) => [c.role, c.name, c.company, c.contact].filter(Boolean).join(" - "),
      cY,
      12,
    );
  } else {
    cY = drawEmpty(contacts2, cY);
  }
  addDraftWatermark(contacts2);
  addFooter(contacts2, pageNum++);

  // PAGE 10: Service Providers
  const vendorsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let vY = addSectionHeader(vendorsPage, "Service Providers", pageHeight - 80);
  
  // Render service providers array
  const providersList = planData?.service_providers || planData?.providers || [];
  const serviceProviderNotes = planData?.service_providers_notes || "";
  const hasServiceProviders = hasAny(providersList) || hasText(serviceProviderNotes);
  
  if (!hasServiceProviders) {
    vY = drawEmpty(vendorsPage, vY);
  } else {
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
    vY = addNotesBox(vendorsPage, "Notes", serviceProviderNotes, vY);
  }
  addDraftWatermark(vendorsPage);
  addFooter(vendorsPage, pageNum++);

  // PAGE 11-12: Funeral Wishes
  const funeral1 = pdfDoc.addPage([pageWidth, pageHeight]);
  let fY = addSectionHeader(funeral1, "Funeral & Memorial Wishes", pageHeight - 80);
  
  // CRITICAL: Also read from planData.funeral object (localStorage data)
  const funeralObj = planData?.funeral || {};
  
  // Render funeral preferences - check multiple data sources
  const disp = planData?.funeral_disposition || planData?.disposition || {};
  const svc = planData?.service_preferences || {};
  const fh = planData?.funeral_home || {};
  const cem = planData?.cemetery || {};
  const funeralNotes = planData?.funeral_wishes_notes || funeralObj.funeral_preference || "";
  const funding = planData?.funeral_funding || [];
  
  // Extract disposition from funeral object checkboxes
  const dispositionFromCheckboxes = (() => {
    if (funeralObj.burial) return "Burial";
    if (funeralObj.cremation) return "Cremation";
    if (funeralObj.natural_burial) return "Natural Burial";
    if (funeralObj.mausoleum_private) return "Private Mausoleum";
    if (funeralObj.mausoleum_community) return "Community Mausoleum";
    if (funeralObj.lawn_crypt) return "Lawn Crypt";
    if (funeralObj.body_donation) return "Body Donation";
    return "";
  })();
  
  // Debug log for funeral data
  console.log("[generate-planner-pdf] Funeral section data:", {
    funeral_obj_keys: Object.keys(funeralObj),
    disp_preference: disp.preference,
    disposition_from_checkboxes: dispositionFromCheckboxes,
    funeral_notes_len: funeralNotes.length,
    funding_len: funding.length,
    has_burial: funeralObj.burial,
    has_cremation: funeralObj.cremation,
    service_type: svc.service_type || funeralObj.service_type,
    funeral_home_name: fh.name || funeralObj.funeral_home_name,
  });
  
  // Check if we have ANY funeral data
  const hasFuneral = hasText(disp.preference) || hasText(disp.type) || hasText(fh.name) || hasText(cem.name) || 
    hasText(svc.service_type) || hasText(funeralNotes) || hasAny(funding) ||
    hasText(dispositionFromCheckboxes) || hasText(funeralObj.funeral_home_name) ||
    hasText(funeralObj.service_type) || hasText(funeralObj.music_preferences) ||
    hasText(funeralObj.burial_notes) || hasText(funeralObj.cremation_notes);
  
  if (!hasFuneral) {
    fY = drawEmpty(funeral1, fY);
  } else {
    // Show disposition from either source
    const finalDisposition = disp.preference || disp.type || dispositionFromCheckboxes;
    if (finalDisposition) fY = addField(funeral1, "Disposition", finalDisposition, fY);
    
    // Show disposition notes if available
    if (funeralObj.burial && funeralObj.burial_notes) {
      fY = addField(funeral1, "Burial Notes", funeralObj.burial_notes, fY);
    }
    if (funeralObj.cremation && funeralObj.cremation_notes) {
      fY = addField(funeral1, "Cremation Notes", funeralObj.cremation_notes, fY);
    }
    if (funeralObj.natural_burial && funeralObj.natural_burial_notes) {
      fY = addField(funeral1, "Natural Burial Notes", funeralObj.natural_burial_notes, fY);
    }
    
    // Funeral home from either source
    const fhName = fh.name || funeralObj.funeral_home_name;
    const fhPhone = fh.phone || funeralObj.funeral_home_phone;
    if (fhName) fY = addField(funeral1, "Funeral Home", [fhName, fhPhone].filter(Boolean).join(" - "), fY);
    
    const fhAddr = fh.address || funeralObj.funeral_home_address;
    if (fhAddr) fY = addField(funeral1, "Funeral Home Address", fhAddr, fY);
    
    // Cemetery from either source
    const cemName = cem.name || funeralObj.cemetery_name;
    const cemLoc = cem.location || funeralObj.cemetery_location;
    if (cemName || cemLoc) fY = addField(funeral1, "Cemetery", [cemName, cemLoc].filter(Boolean).join(" - "), fY);
    
    // Service preferences from either source
    const serviceType = svc.service_type || funeralObj.service_type;
    if (serviceType) fY = addField(funeral1, "Service Type", serviceType, fY);
    
    const serviceLoc = svc.location || funeralObj.service_location;
    if (serviceLoc) fY = addField(funeral1, "Service Location", serviceLoc, fY);
    
    const officiant = svc.officiant || funeralObj.officiant;
    if (officiant) fY = addField(funeral1, "Officiant", officiant, fY);
    
    const music = svc.music || funeralObj.music_preferences;
    if (music) fY = addField(funeral1, "Music", music, fY);
    
    const readings = svc.readings || funeralObj.readings;
    if (readings) fY = addField(funeral1, "Readings", readings, fY);
    
    const flowers = svc.flowers_or_donations || funeralObj.flowers_or_donations;
    if (flowers) fY = addField(funeral1, "Flowers/Donations", flowers, fY);
    
    const clothing = svc.clothing || funeralObj.clothing;
    if (clothing) fY = addField(funeral1, "Clothing", clothing, fY);
    
    fY -= 10;
    
    // Use funeral preference text or generic notes
    const wishesText = funeralNotes || funeralObj.other_wishes || "";
    if (wishesText) fY = addNotesBox(funeral1, "My Wishes", wishesText, fY);
    
    if (funding.length > 0) {
      fY -= 10;
      funeral1.drawText("Funding Sources:", { x: margin, y: fY, size: 10, font: helveticaBold, color: textColor });
      fY -= lineHeight;
      fY = addArrayItems(funeral1, funding, (f) => [f.source, f.account].filter(Boolean).join(" - "), fY, 4);
    }
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
  // CRITICAL: Read from multiple data sources - DB arrays OR localStorage object
  const financialObj = planData?.financial || {};
  const financialAccounts = planData?.financial_accounts || financialObj.accounts || [];
  const bankList = planData?.bank_accounts?.length > 0 ? planData.bank_accounts : financialAccounts;
  const investList = planData?.investments || [];
  const debtsList = planData?.debts || [];
  const businessList = planData?.businesses || [];
  const financialNotes = planData?.financial_notes || "";
  
  console.log("[generate-planner-pdf] Financial section data:", {
    financialObj_keys: Object.keys(financialObj),
    financial_accounts_len: financialAccounts.length,
    bank_accounts_len: planData?.bank_accounts?.length || 0,
    bank_list_final: bankList.length,
    inv: investList.length,
    debts: debtsList.length,
    biz: businessList.length,
    notes_len: financialNotes.length,
    has_checking: financialObj.has_checking,
    has_savings: financialObj.has_savings,
  });

  const financialPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let finY = addSectionHeader(financialPage, "Financial Life", pageHeight - 80);

  const formatBank = (b: any) =>
    [
      b.bank_name || b.institution || b.bank || b.name,
      b.account_type || b.type,
      b.last4
        ? `Last4: ${b.last4}`
        : (b.account_last4 ? `Last4: ${b.account_last4}` : ""),
      b.beneficiary
        ? `Ben/POD: ${b.beneficiary}`
        : (b.pod ? `Ben/POD: ${b.pod}` : ""),
      b.details || "",
    ]
      .filter(Boolean)
      .join(" | ");

  // Also check for checkbox selections in financialObj (matching SectionFinancial.tsx field names)
  const hasFinancialCheckboxes = financialObj.has_checking || financialObj.has_savings || 
    financialObj.has_retirement || financialObj.has_investment || financialObj.has_crypto ||
    financialObj.has_safe_deposit || financialObj.has_business || financialObj.has_debts;
    
  const hasFinancial = hasAny(bankList) || hasAny(investList) || hasAny(debtsList) || 
    hasAny(businessList) || hasText(financialNotes) || hasFinancialCheckboxes;

  if (!hasFinancial) {
    finY = drawEmpty(financialPage, finY);
  } else {
    // Show account types if checkboxes were checked (matching SectionFinancial.tsx)
    if (hasFinancialCheckboxes) {
      const accountTypes: string[] = [];
      if (financialObj.has_checking) accountTypes.push("Checking");
      if (financialObj.has_savings) accountTypes.push("Savings");
      if (financialObj.has_retirement) accountTypes.push("Retirement (401k/IRA)");
      if (financialObj.has_investment) accountTypes.push("Investment/Brokerage");
      if (financialObj.has_crypto) accountTypes.push("Cryptocurrency");
      if (financialObj.has_safe_deposit) accountTypes.push("Safe Deposit Box");
      if (financialObj.has_business) accountTypes.push("Business Interests");
      if (financialObj.has_debts) accountTypes.push("Outstanding Debts/Loans");
      
      if (accountTypes.length > 0) {
        finY = addField(financialPage, "Account Types", accountTypes.join(", "), finY);
        finY -= 10;
      }
    }
    
    if (bankList.length > 0) {
      financialPage.drawText("Bank/Financial Accounts:", {
        x: margin,
        y: finY,
        size: 10,
        font: helveticaBold,
        color: textColor,
      });
      finY -= lineHeight;
      finY = addArrayItems(financialPage, bankList, formatBank, finY, 6);
      finY -= 10;
    }
    
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
    
    // Add additional text fields from localStorage (SectionFinancial.tsx)
    if (financialObj.safe_deposit_details) {
      finY = addNotesBox(financialPage, "Safe Deposit Box Details", financialObj.safe_deposit_details, finY);
      finY -= 10;
    }
    if (financialObj.crypto_details) {
      finY = addNotesBox(financialPage, "Cryptocurrency Details", financialObj.crypto_details, finY);
      finY -= 10;
    }
    if (financialObj.business_details) {
      finY = addNotesBox(financialPage, "Business Interests Details", financialObj.business_details, finY);
      finY -= 10;
    }
    if (financialObj.debts_details) {
      finY = addNotesBox(financialPage, "Outstanding Debts Details", financialObj.debts_details, finY);
      finY -= 10;
    }
    
    finY = addNotesBox(financialPage, "Financial Notes", financialNotes, finY);
  }
  addDraftWatermark(financialPage);
  addFooter(financialPage, pageNum++);

  // PAGE 14: Insurance
  const insurancePage = pdfDoc.addPage([pageWidth, pageHeight]);
  let insY = addSectionHeader(insurancePage, "Insurance Policies", pageHeight - 80);

  // CRITICAL: Read from multiple data sources
  const insuranceObj = planData?.insurance || {};
  const localInsurancePolicies = insuranceObj.policies || [];
  
  // Support both array shape and { policies: [...] } shape
  const insuranceList = Array.isArray(planData?.insurance_policies) && planData.insurance_policies.length > 0
    ? planData.insurance_policies
    : localInsurancePolicies;
    
  console.log("[generate-planner-pdf] Insurance section data:", {
    insurance_obj_keys: Object.keys(insuranceObj),
    local_policies_len: localInsurancePolicies.length,
    final_list_len: insuranceList.length,
  });

  const hasInsurance = insuranceList.length > 0 || hasText(planData?.insurance_notes);

  if (!hasInsurance) {
    insY = drawEmpty(insurancePage, insY);
  } else {
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
  }
  addDraftWatermark(insurancePage);
  addFooter(insurancePage, pageNum++);

  // PAGE 15: Property
  const propertyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let propY = addSectionHeader(propertyPage, "Property & Valuables", pageHeight - 80);
  
  // CRITICAL: Read from multiple data sources
  const propertyObj = planData?.property || {};
  const localPropertyItems = planData?.property_items || propertyObj.items || [];
  
  const propList = planData?.properties?.length > 0 ? planData.properties : localPropertyItems;
  const valuablesList = planData?.valuables || localPropertyItems;
  const safeDeposit = planData?.safe_deposit || {
    location: propertyObj.safe_deposit_location || "",
    bank: propertyObj.safe_deposit_bank || "",
    key_location: propertyObj.safe_deposit_key_location || "",
  };
  const propertyNotes = planData?.property_notes || "";
  
  // Check for property type checkboxes (matching SectionProperty.tsx field names)
  const hasPropertyCheckboxes = propertyObj.has_house || propertyObj.has_car || 
    propertyObj.has_business || propertyObj.has_artwork || propertyObj.has_jewelry || 
    propertyObj.has_money_cash || propertyObj.has_other;
  
  console.log("[generate-planner-pdf] Property section data:", {
    property_obj_keys: Object.keys(propertyObj),
    local_items_len: localPropertyItems.length,
    prop_list_final: propList.length,
    valuables_len: valuablesList.length,
    safe_deposit: safeDeposit,
    has_checkboxes: hasPropertyCheckboxes,
  });
  
  const hasProperty = hasAny(propList) || hasAny(valuablesList) || hasText(safeDeposit.location) || 
    hasText(safeDeposit.bank) || hasText(propertyNotes) || hasPropertyCheckboxes;
  
  if (!hasProperty) {
    propY = drawEmpty(propertyPage, propY);
  } else {
    // Show property types if checkboxes were checked (matching SectionProperty.tsx field names)
    if (hasPropertyCheckboxes) {
      const propTypes: string[] = [];
      if (propertyObj.has_house) propTypes.push("House");
      if (propertyObj.has_car) propTypes.push("Car");
      if (propertyObj.has_business) propTypes.push("Business");
      if (propertyObj.has_artwork) propTypes.push("Artwork");
      if (propertyObj.has_jewelry) propTypes.push("Jewelry");
      if (propertyObj.has_money_cash) propTypes.push("Money/Cash");
      if (propertyObj.has_other) propTypes.push(propertyObj.other_type || "Other");
      
      if (propTypes.length > 0) {
        propY = addField(propertyPage, "Property Types", propTypes.join(", "), propY);
        propY -= 10;
      }
    }
    
    if (propList.length > 0) {
      propertyPage.drawText("Property Items:", { x: margin, y: propY, size: 10, font: helveticaBold, color: textColor });
      propY -= lineHeight;
      propY = addArrayItems(
        propertyPage,
        propList,
        (p) => [
          p.address || p.description || p.type,
          p.kind || p.type,
          p.mortgage_bank ? `Lender: ${p.mortgage_bank}` : "",
          p.manager ? `Manager: ${p.manager}` : "",
          p.location || "",
        ].filter(Boolean).join(" - "),
        propY,
        6,
      );
      propY -= 10;
    }
    
    if (safeDeposit.location || safeDeposit.bank) {
      propY = addField(propertyPage, "Safe Deposit Box", [safeDeposit.bank, safeDeposit.location, safeDeposit.key_location].filter(Boolean).join(" - "), propY);
      propY -= 10;
    }
    
    propY = addNotesBox(propertyPage, "Notes", propertyNotes, propY);
  }
  addDraftWatermark(propertyPage);
  addFooter(propertyPage, pageNum++);

  // PAGE 16: Pets
  const petsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let petY = addSectionHeader(petsPage, "Pets", pageHeight - 80);
  
  const petsList = planData?.pets || [];
  const petsNotes = planData?.pets_notes || "";
  const hasPets = hasAny(petsList) || hasText(petsNotes);
  
  console.log("[generate-planner-pdf] Pets section data:", {
    pets_count: petsList.length,
    pets_notes_len: petsNotes.length,
    has_pets: hasPets,
  });
  
  if (!hasPets) {
    petY = drawEmpty(petsPage, petY);
  } else {
    if (petsList.length > 0) {
      petsPage.drawText("My Pets:", { x: margin, y: petY, size: 10, font: helveticaBold, color: textColor });
      petY -= lineHeight + 4;
      
      // Print each pet with full details
      for (const pet of petsList.slice(0, 8)) {
        if (petY <= 100) break;
        
        const petName = pet.name || pet.type || "(Unnamed pet)";
        const petType = pet.type || pet.breed || "";
        
        // Pet name and type on first line
        petsPage.drawText(`• ${sanitizeForPdf(petName)}${petType ? ` (${sanitizeForPdf(petType)})` : ""}`, {
          x: margin,
          y: petY,
          size: 10,
          font: helveticaBold,
          color: textColor,
        });
        petY -= lineHeight;
        
        // Caregiver info
        if (pet.caregiver) {
          petsPage.drawText(`  Caregiver: ${sanitizeForPdf(pet.caregiver)}`, {
            x: margin + 10,
            y: petY,
            size: 10,
            font: helvetica,
            color: textColor,
          });
          petY -= lineHeight;
        }
        
        // Vet info
        if (pet.vet_contact) {
          petsPage.drawText(`  Veterinarian: ${sanitizeForPdf(pet.vet_contact)}`, {
            x: margin + 10,
            y: petY,
            size: 10,
            font: helvetica,
            color: textColor,
          });
          petY -= lineHeight;
        }
        
        // Care instructions
        if (pet.care_instructions || pet.instructions) {
          const careText = pet.care_instructions || pet.instructions;
          const careLines = wrapText(careText, pageWidth - margin * 2 - 20, 10);
          petsPage.drawText(`  Care Notes:`, {
            x: margin + 10,
            y: petY,
            size: 10,
            font: helvetica,
            color: textColor,
          });
          petY -= lineHeight;
          for (const line of careLines.slice(0, 3)) {
            if (petY <= 100) break;
            petsPage.drawText(`    ${line}`, {
              x: margin + 10,
              y: petY,
              size: 10,
              font: helvetica,
              color: textColor,
            });
            petY -= lineHeight;
          }
        }
        
        petY -= 8; // Extra spacing between pets
      }
    }
    
    if (petsNotes) {
      petY -= 10;
      petY = addNotesBox(petsPage, "Additional Pet Notes", petsNotes, petY);
    }
  }
  addDraftWatermark(petsPage);
  addFooter(petsPage, pageNum++);

  // PAGE 17: Digital
  const digitalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let digY = addSectionHeader(digitalPage, "Digital Accounts", pageHeight - 80);
  
  // CRITICAL: Read from multiple data sources
  const digitalObj = planData?.digital || {};
  const localDigitalAccounts = digitalObj.accounts || [];
  const localPhones = digitalObj.phones || [];
  
  const digitalList = planData?.digital_assets?.length > 0 
    ? planData.digital_assets 
    : (planData?.digital_accounts?.length > 0 ? planData.digital_accounts : localDigitalAccounts);
  const phonesList = planData?.phones?.length > 0 ? planData.phones : localPhones;
  const digitalNotes = planData?.digital_notes || "";
  
  console.log("[generate-planner-pdf] Digital section data:", {
    digital_obj_keys: Object.keys(digitalObj),
    local_accounts_len: localDigitalAccounts.length,
    local_phones_len: localPhones.length,
    digital_list_final: digitalList.length,
    phones_list_final: phonesList.length,
  });
  
  const hasDigital = hasAny(digitalList) || hasAny(phonesList) || hasText(digitalNotes);
  
  if (!hasDigital) {
    digY = drawEmpty(digitalPage, digY);
  } else {
    if (digitalList.length > 0) {
      digitalPage.drawText("Online Accounts:", { x: margin, y: digY, size: 10, font: helveticaBold, color: textColor });
      digY -= lineHeight;
      digY = addArrayItems(
        digitalPage,
        digitalList,
        (d) => [
          d.provider || d.service || d.name,
          d.type || d.account_type,
          d.username ? `User: ${d.username}` : "",
          d.access_person ? `Access: ${d.access_person}` : "",
          d.notes || "",
        ].filter(Boolean).join(" - "),
        digY,
        10,
      );
      digY -= 10;
    }
    
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
    
    digY = addNotesBox(digitalPage, "Notes", digitalNotes, digY);
  }
  addDraftWatermark(digitalPage);
  addFooter(digitalPage, pageNum++);

  // PAGE 18: Legal
  const legal = planData?.legal || {};
  const legalNotes = planData?.legal_notes || "";
  
  // Check for document checkboxes
  const hasLegalDocCheckboxes = legal.has_will || legal.has_trust || legal.has_poa ||
    legal.has_healthcare_directive || legal.has_living_will || legal.has_beneficiary_designations;
  
  const executorName = legal.executor_name || legal.executor || legal.executorName;
  const executorPhone = legal.executor_phone || legal.executorPhone;
  const executorEmail = legal.executor_email || legal.executorEmail;
  const poaName = legal.poa_name || legal.power_of_attorney || legal.poa || legal.poaName;
  const poaPhone = legal.poa_phone || legal.poaPhone;
  const willLoc = legal.will_location || legal.willLocation;
  const trustLoc = legal.trust_location || legal.trustLocation;
  
  console.log("[generate-planner-pdf] Legal section data:", {
    legal_keys: Object.keys(legal),
    has_doc_checkboxes: hasLegalDocCheckboxes,
    executor: executorName,
    poa: poaName,
    will: willLoc,
    trust: trustLoc,
  });
  
  const hasLegal = hasText(executorName) || hasText(poaName) || hasText(willLoc) || hasText(trustLoc) || 
    hasText(legal.healthcare_proxy) || hasText(legal.attorney_name) || hasText(legalNotes) || hasLegalDocCheckboxes;

  const legalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let legY = addSectionHeader(legalPage, "Legal Documents", pageHeight - 80);

  if (!hasLegal) {
    legY = drawEmpty(legalPage, legY);
  } else {
    // Show document types if checkboxes were checked
    if (hasLegalDocCheckboxes) {
      const docTypes: string[] = [];
      if (legal.has_will) docTypes.push("Will");
      if (legal.has_trust) docTypes.push("Trust");
      if (legal.has_poa) docTypes.push("Power of Attorney");
      if (legal.has_healthcare_directive) docTypes.push("Healthcare Directive");
      if (legal.has_living_will) docTypes.push("Living Will");
      if (legal.has_beneficiary_designations) docTypes.push("Beneficiary Designations");
      
      if (docTypes.length > 0) {
        legY = addField(legalPage, "Documents I Have", docTypes.join(", "), legY);
        legY -= 10;
      }
    }
    
    if (executorName) legY = addField(legalPage, "Executor", executorName, legY);
    if (executorPhone) legY = addField(legalPage, "Executor Phone", executorPhone, legY);
    if (executorEmail) legY = addField(legalPage, "Executor Email", executorEmail, legY);
    if (legal.alternate_executor) legY = addField(legalPage, "Alternate Executor", legal.alternate_executor, legY);
    legY -= 10;

    if (poaName) legY = addField(legalPage, "Power of Attorney", poaName, legY);
    if (poaPhone) legY = addField(legalPage, "POA Phone", poaPhone, legY);
    if (legal.healthcare_proxy) legY = addField(legalPage, "Healthcare Proxy", legal.healthcare_proxy, legY);
    if (legal.healthcare_proxy_phone) legY = addField(legalPage, "Proxy Phone", legal.healthcare_proxy_phone, legY);
    legY -= 10;

    if (willLoc) legY = addField(legalPage, "Will Location", willLoc, legY);
    if (trustLoc) legY = addField(legalPage, "Trust Location", trustLoc, legY);
    if (legal.poa_document_location) legY = addField(legalPage, "POA Document Location", legal.poa_document_location, legY);
    if (legal.living_will_location) legY = addField(legalPage, "Living Will Location", legal.living_will_location, legY);
    if (legal.safe_deposit_location) legY = addField(legalPage, "Safe Deposit Box", legal.safe_deposit_location, legY);
    legY -= 10;
    
    if (legal.attorney_name) legY = addField(legalPage, "Attorney", legal.attorney_name, legY);
    if (legal.attorney_phone) legY = addField(legalPage, "Attorney Phone", legal.attorney_phone, legY);
    if (legal.attorney_firm) legY = addField(legalPage, "Law Firm", legal.attorney_firm, legY);
    
    legY = addNotesBox(legalPage, "Notes", legalNotes, legY);
  }
  addDraftWatermark(legalPage);
  addFooter(legalPage, pageNum++);

  // PAGES 19-22: Messages
  const messagesPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let msgY = addSectionHeader(messagesPage, "Messages to Loved Ones", pageHeight - 80);
  
  const messagesList = planData?.messages || [];
  const generalMessage = planData?.to_loved_ones_message || planData?.messages_notes || "";
  const hasMessages = hasAny(messagesList) || hasText(generalMessage);
  
  console.log("[generate-planner-pdf] Messages section data:", {
    messages_count: messagesList.length,
    general_message_len: generalMessage.length,
    has_messages: hasMessages,
  });
  
  if (!hasMessages) {
    msgY = drawEmpty(messagesPage, msgY);
  } else {
    // Print general message first
    if (generalMessage) {
      msgY = addNotesBox(messagesPage, "General Message to My Family", generalMessage, msgY);
      msgY -= 10;
    }
    
    // Print each individual message with full body
    if (messagesList.length > 0) {
      messagesPage.drawText("Individual Messages:", { x: margin, y: msgY, size: 10, font: helveticaBold, color: textColor });
      msgY -= lineHeight + 4;
      
      for (const msg of messagesList) {
        if (msgY <= 120) break;
        
        const recipient = msg.audience || msg.to_name || msg.recipients || "(Unspecified recipient)";
        const title = msg.title || "";
        const body = msg.body || msg.message || msg.content || "";
        
        // Recipient line
        messagesPage.drawText(`To: ${sanitizeForPdf(recipient)}${title ? ` - ${sanitizeForPdf(title)}` : ""}`, {
          x: margin,
          y: msgY,
          size: 10,
          font: helveticaBold,
          color: textColor,
        });
        msgY -= lineHeight;
        
        // Message body - wrap text and print
        if (body) {
          const bodyLines = wrapText(body, pageWidth - margin * 2 - 10, 10);
          for (const line of bodyLines.slice(0, 6)) {
            if (msgY <= 100) break;
            messagesPage.drawText(`  ${line}`, {
              x: margin + 10,
              y: msgY,
              size: 10,
              font: helvetica,
              color: textColor,
            });
            msgY -= 14;
          }
          if (bodyLines.length > 6) {
            messagesPage.drawText("  (continued on next page...)", {
              x: margin + 10,
              y: msgY,
              size: 9,
              font: helvetica,
              color: rgb(0.5, 0.5, 0.5),
            });
            msgY -= lineHeight;
          }
        }
        
        msgY -= 10; // Extra spacing between messages
      }
    }
  }
  addDraftWatermark(messagesPage);
  addFooter(messagesPage, pageNum++);

  // Additional message continuation pages - only add if we have many messages
  const needsContinuation = messagesList.length > 3;
  const continuationPages = needsContinuation ? 2 : 0;
  
  for (let i = 0; i < continuationPages; i++) {
    const msgContPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let contY = addSectionHeader(msgContPage, `Messages (continued - page ${i + 2})`, pageHeight - 80);
    
    // Get messages that didn't fit on first page
    const remainingMessages = messagesList.slice(3 + (i * 4), 3 + ((i + 1) * 4));
    
    if (remainingMessages.length === 0) {
      contY = drawEmpty(msgContPage, contY, "No additional messages.");
    } else {
      for (const msg of remainingMessages) {
        if (contY <= 120) break;
        
        const recipient = msg.audience || msg.to_name || msg.recipients || "(Unspecified recipient)";
        const title = msg.title || "";
        const body = msg.body || msg.message || msg.content || "";
        
        msgContPage.drawText(`To: ${sanitizeForPdf(recipient)}${title ? ` - ${sanitizeForPdf(title)}` : ""}`, {
          x: margin,
          y: contY,
          size: 10,
          font: helveticaBold,
          color: textColor,
        });
        contY -= lineHeight;
        
        if (body) {
          const bodyLines = wrapText(body, pageWidth - margin * 2 - 10, 10);
          for (const line of bodyLines.slice(0, 8)) {
            if (contY <= 100) break;
            msgContPage.drawText(`  ${line}`, {
              x: margin + 10,
              y: contY,
              size: 10,
              font: helvetica,
              color: textColor,
            });
            contY -= 14;
          }
        }
        
        contY -= 10;
      }
    }
    
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

  // Build user-friendly filename: "Planner - LastName, FirstName.pdf"
  const sanitizeFilename = (name: string): string => {
    if (!name) return "";
    return name
      .replace(/[<>:"/\\|?*]/g, "") // Remove illegal filename chars
      .replace(/\s+/g, " ")          // Normalize whitespace
      .trim()
      .substring(0, 100);            // Limit length
  };
  
  // Parse full name into first/last for senior-friendly format
  const rawFullName = sanitizeFilename(
    piiData?.full_name || 
    profile?.full_name || 
    planData?.prepared_for || 
    ""
  );
  
  // Build filename: "Planner - LastName, FirstName.pdf"
  const buildSeniorFilename = (fullName: string): string => {
    if (!fullName) return "My-Life-and-Legacy-Planner.pdf";
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "My-Life-and-Legacy-Planner.pdf";
    
    if (parts.length === 1) {
      // Only first name available
      return `Planner - ${parts[0]}.pdf`;
    }
    
    // Extract first and last name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    
    // Format: "Planner - LastName, FirstName.pdf"
    return `Planner - ${lastName}, ${firstName}.pdf`;
  };
  
  const userFriendlyFilename = buildSeniorFilename(rawFullName);
  const draftPrefix = isDraft ? "DRAFT-" : "";
  const finalUserFilename = `${draftPrefix}${userFriendlyFilename}`;
  
  console.log(`[generate-planner-pdf] User filename: ${finalUserFilename}`);

  const timestamp = Date.now();
  const storagePath = `${userId}/${docType}_${timestamp}.pdf`;

  const { error: uploadError } = await supabase
    .storage
    .from("generated-pdfs")
    .upload(storagePath, pdfBytes, { contentType: "application/pdf", upsert: true });

  if (uploadError) {
    console.error("[generate-planner-pdf] Upload error:", uploadError);
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    return new Response(JSON.stringify({
      success: true,
      pdfBase64: base64Pdf,
      filename: finalUserFilename,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: signedUrl, error: signedError } = await supabase
    .storage
    .from("generated-pdfs")
    .createSignedUrl(storagePath, 3600);

  if (signedError) {
    console.error("[generate-planner-pdf] Signed URL error:", signedError);
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    return new Response(JSON.stringify({
      success: true,
      pdfBase64: base64Pdf,
      filename: finalUserFilename,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await supabase.from("generated_documents").insert({
    user_id: userId,
    plan_id: planData?.id || null,
    doc_type: docType,
    storage_bucket: "generated-pdfs",
    storage_path: storagePath,
  });

  return new Response(JSON.stringify({
    success: true,
    url: signedUrl.signedUrl,
    filename: finalUserFilename,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
