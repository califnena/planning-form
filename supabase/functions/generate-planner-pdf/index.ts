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

    // Parse request body first to check for guest identity
    const {
      planData: rawPlanData,
      selectedSections = [],
      piiData,
      docType = "planner",
      isDraft = false,
      identityType = "user",
      identityId = null,
    } = await req.json();

    // Determine identity - support both authenticated users and guests
    let effectiveIdentityType = identityType;
    let effectiveIdentityId = identityId;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (user && !userError) {
        effectiveIdentityType = "user";
        effectiveIdentityId = user.id;
      }
    }

    // For guests, require identityType and identityId in request body
    if (effectiveIdentityType === "guest" && !effectiveIdentityId) {
      console.error("[generate-planner-pdf] Guest request missing identityId");
      return new Response(JSON.stringify({ error: "Guest identity required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log identity for debugging
    console.log("[generate-planner-pdf] Identity:", { effectiveIdentityType, effectiveIdentityId });

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
      identityType: effectiveIdentityType,
      identityId: effectiveIdentityId,
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
      effectiveIdentityId || "guest",
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
  const lineHeight = 18; // Increased for senior readability

  const profile = { ...(planData?.personal_profile || {}), ...(piiData || {}) };
  const textColor = rgb(0.15, 0.15, 0.15);
  const headerColor = rgb(0.05, 0.35, 0.35);
  const brandColor = rgb(0.2, 0.4, 0.4); // EFA teal

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

  // Add page header with EFA branding (subtle, professional)
  const addPageHeader = (page: any) => {
    page.drawText("Everlasting Funeral Advisors", {
      x: pageWidth - margin - 160,
      y: pageHeight - 25,
      size: 8,
      font: helvetica,
      color: brandColor,
    });
    // Subtle line under header
    page.drawLine({
      start: { x: margin, y: pageHeight - 35 },
      end: { x: pageWidth - margin, y: pageHeight - 35 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
  };

  // Track all pages for total page count update at the end
  const allPages: { page: any; pageNum: number }[] = [];

  const addFooter = (page: any, pageNum: number) => {
    page.drawText("For planning purposes only. Not a legal document.", {
      x: margin,
      y: 40,
      size: 9,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
    // Store page reference for later "Page X of Y" update
    allPages.push({ page, pageNum });
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

    // Always draw something so the field never "disappears" in the PDF
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

      page.drawText(`- ${text}`, {
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

  // Helper: draw blank handwriting lines instead of "No information entered"
  // CONTENT RULE: Empty fields show blank lines, NOT placeholder text
  const drawBlankLines = (page: any, y: number, numLines: number = 3): number => {
    let currentY = y;
    for (let i = 0; i < numLines; i++) {
      if (currentY <= 80) break;
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 0.5,
        color: rgb(0.85, 0.85, 0.85),
      });
      currentY -= 22; // ~0.3 inch spacing for handwriting
    }
    return currentY;
  };

  // DEPRECATED: No longer used - empty sections show blank lines
  const drawEmpty = (page: any, y: number, _msg?: string): number => {
    // Draw blank lines instead of text message
    return drawBlankLines(page, y, 3);
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
    for (const line of lines.slice(0, 12)) {
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

  // ============================================================
  // PAGE 1: Cover with EFA branding
  // ============================================================
  const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
  
  // EFA Logo/Branding at top
  coverPage.drawText("Everlasting Funeral Advisors", {
    x: margin,
    y: pageHeight - 60,
    size: 16,
    font: helveticaBold,
    color: brandColor,
  });
  coverPage.drawText("Helping Families Plan with Peace and Clarity", {
    x: margin,
    y: pageHeight - 80,
    size: 11,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Decorative line
  coverPage.drawLine({
    start: { x: margin, y: pageHeight - 100 },
    end: { x: pageWidth - margin, y: pageHeight - 100 },
    thickness: 1.5,
    color: brandColor,
  });
  
  coverPage.drawText("My Life & Legacy Planner", {
    x: margin,
    y: pageHeight - 160,
    size: 32,
    font: helveticaBold,
    color: headerColor,
  });
  coverPage.drawText("A Complete Guide for End-of-Life Planning", {
    x: margin,
    y: pageHeight - 200,
    size: 14,
    font: helvetica,
    color: textColor,
  });
  if (profile.full_name) {
    coverPage.drawText(`Prepared for: ${sanitizeForPdf(profile.full_name)}`, {
      x: margin,
      y: pageHeight - 260,
      size: 18,
      font: helveticaBold,
      color: textColor,
    });
  }
  coverPage.drawText(
    `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
    {
      x: margin,
      y: pageHeight - 295,
      size: 12,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    },
  );
  
  // Note at bottom of cover
  coverPage.drawText("Store this document in a safe place and inform your loved ones of its location.", {
    x: margin,
    y: 120,
    size: 11,
    font: helvetica,
    color: textColor,
  });
  
  addDraftWatermark(coverPage);
  addFooter(coverPage, pageNum++);

  // ============================================================
  // PAGE 2: Table of Contents with page numbers
  // ============================================================
  const tocPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(tocPage);
  let tocY = addSectionHeader(tocPage, "Table of Contents", pageHeight - 100);
  
  // Define sections with their page numbers
  // NOTE: Professional Contacts and Service Providers REMOVED from PDF per requirement
  const tocSections = [
    { title: "Checklist", page: 3 },
    { title: "Instructions", page: 4 },
    { title: "Personal Information", page: 5 },
    { title: "My Life Story & Legacy", page: 7 },
    { title: "Important Contacts", page: 8 },
    { title: "Funeral & Memorial Wishes", page: 9 },
    { title: "Financial Life", page: 11 },
    { title: "Insurance Policies", page: 12 },
    { title: "Property & Valuables", page: 13 },
    { title: "Pets", page: 14 },
    { title: "Online Accounts", page: 15 },
    { title: "Legal Documents", page: 16 },
    { title: "Messages to Loved Ones", page: 17 },
    { title: "Plan Review & Signature", page: 19 },
  ];
  
  for (const section of tocSections) {
    // Draw section title
    tocPage.drawText(section.title, {
      x: margin,
      y: tocY,
      size: 12,
      font: helvetica,
      color: textColor,
    });
    // Draw dotted line between title and page number
    const titleWidth = helvetica.widthOfTextAtSize(section.title, 12);
    const pageNumText = `${section.page}`;
    const pageNumWidth = helvetica.widthOfTextAtSize(pageNumText, 12);
    const dotsStart = margin + titleWidth + 10;
    const dotsEnd = pageWidth - margin - pageNumWidth - 10;
    
    // Draw dots
    let dotX = dotsStart;
    while (dotX < dotsEnd) {
      tocPage.drawText(".", {
        x: dotX,
        y: tocY,
        size: 12,
        font: helvetica,
        color: rgb(0.7, 0.7, 0.7),
      });
      dotX += 8;
    }
    
    // Draw page number
    tocPage.drawText(pageNumText, {
      x: pageWidth - margin - pageNumWidth,
      y: tocY,
      size: 12,
      font: helvetica,
      color: textColor,
    });
    
    tocY -= 26;
  }
  addDraftWatermark(tocPage);
  addFooter(tocPage, pageNum++);

  // ============================================================
  // PAGE 3: Checklist
  // ============================================================
  const checklistPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(checklistPage);
  let checkY = addSectionHeader(checklistPage, "Planning Checklist", pageHeight - 100);
  const checkItems = [
    "Complete personal information",
    "List contacts to notify",
    "Document funeral wishes",
    "Record financial accounts",
    "List insurance policies",
    "Document property and valuables",
    "Arrange pet care",
    "List online accounts",
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
    checkY -= 24;
  }
  addDraftWatermark(checklistPage);
  addFooter(checklistPage, pageNum++);

  // ============================================================
  // PAGE 4: Instructions
  // ============================================================
  const instructionsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(instructionsPage);
  let instrY = addSectionHeader(instructionsPage, "How to Use This Document", pageHeight - 100);
  instrY = addNotesBox(
    instructionsPage,
    "Instructions",
    planData?.instructions_notes ||
      "This document contains important information about your wishes and affairs. Store it in a safe place and inform your loved ones of its location.",
    instrY,
  );
  addDraftWatermark(instructionsPage);
  addFooter(instructionsPage, pageNum++);

  // ============================================================
  // PAGE 5-6: Personal Information
  // ============================================================
  const personal1 = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(personal1);
  let pY = addSectionHeader(personal1, "Personal Information", pageHeight - 100);
  pY = addField(personal1, "Full Legal Name", profile.full_name || "", pY);
  pY = addField(personal1, "Nicknames", profile.nicknames || "", pY);
  pY = addField(personal1, "Maiden Name", profile.maiden_name || "", pY);
  pY = addField(personal1, "Date of Birth", profile.dob || profile.date_of_birth || "", pY);
  pY = addField(personal1, "Place of Birth", profile.birthplace || profile.place_of_birth || "", pY);
  if (piiData?.ssn) pY = addField(personal1, "SSN", piiData.ssn, pY);
  pY = addField(personal1, "Citizenship", profile.citizenship || "", pY);
  pY -= 10;
  
  // Build address from split fields or use legacy single field
  const addressParts = [
    profile.address_line1,
    profile.address_line2,
    [profile.city, profile.state, profile.zip].filter(Boolean).join(", "),
    profile.country,
  ].filter(Boolean);
  const fullAddress = addressParts.length > 0 ? addressParts.join(", ") : (profile.address || "");
  
  pY = addField(personal1, "Address", fullAddress, pY);
  pY = addField(personal1, "Phone", profile.phone || "", pY);
  pY = addField(personal1, "Email", profile.email || "", pY);
  pY -= 10;
  pY = addField(personal1, "Marital Status", profile.marital_status || "", pY);
  pY = addField(personal1, "Spouse/Partner", profile.partner_name || "", pY);
  pY = addField(personal1, "Religion", profile.religion || "", pY);
  addDraftWatermark(personal1);
  addFooter(personal1, pageNum++);

  const personal2 = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(personal2);
  pY = addSectionHeader(personal2, "Family Information", pageHeight - 100);
  pY = addField(personal2, "Father", profile.father_name || "", pY);
  pY = addField(personal2, "Mother", profile.mother_name || "", pY);
  pY = addField(personal2, "Ex-Spouse", profile.ex_spouse_name || "", pY);
  if (profile.child_names?.length) {
    pY = addField(personal2, "Children", profile.child_names.join(", "), pY);
  }
  // Support new children array structure
  if (Array.isArray(profile.children) && profile.children.length > 0) {
    pY -= 10;
    personal2.drawText("Children:", { x: margin, y: pY, size: 10, font: helveticaBold, color: textColor });
    pY -= lineHeight;
    for (const child of profile.children.slice(0, 10)) {
      if (pY <= 100) break;
      const childInfo = [child.name, child.phone, child.email].filter(Boolean).join(" - ");
      if (childInfo) {
        pY = addField(personal2, "", `- ${childInfo}`, pY);
      }
    }
  }
  addDraftWatermark(personal2);
  addFooter(personal2, pageNum++);

  // ============================================================
  // PAGE 7: Life Story & Legacy - FULL CONTENT (expanded)
  // ============================================================
  const legacyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(legacyPage);
  let legacyY = addSectionHeader(legacyPage, "My Life Story & Legacy", pageHeight - 100);
  
  // Get life story data from CANONICAL key: legacy.life_story
  // CRITICAL: Always read from legacy.life_story to ensure fresh data from DB
  const legacyObj = planData?.legacy || {};
  const lifeStoryNotes = legacyObj.life_story || planData?.about_me_notes || planData?.life_story || "";
  const profileHobbies = legacyObj.hobbies || profile?.hobbies || "";
  const profileAccomplishments = legacyObj.accomplishments || profile?.accomplishments || "";
  const profileRemembered = legacyObj.remembered || profile?.remembered || "";
  
  console.log("[generate-planner-pdf] Life Story section data:", {
    legacy_obj_keys: Object.keys(legacyObj),
    life_story_len: lifeStoryNotes.length,
    hobbies_len: profileHobbies.length,
    accomplishments_len: profileAccomplishments.length,
    remembered_len: profileRemembered.length,
  });
  
  const hasLifeStory = hasText(lifeStoryNotes) || hasText(profileHobbies) || 
    hasText(profileAccomplishments) || hasText(profileRemembered);
  
  if (!hasLifeStory) {
    legacyY = drawEmpty(legacyPage, legacyY);
  } else {
    // Print all life story content - with more lines allowed
    if (lifeStoryNotes) {
      legacyPage.drawText("My Story:", { x: margin, y: legacyY, size: 11, font: helveticaBold, color: textColor });
      legacyY -= lineHeight;
      const storyLines = wrapText(lifeStoryNotes, pageWidth - margin * 2, 11);
      for (const line of storyLines.slice(0, 30)) {
        if (legacyY <= 100) break;
        legacyPage.drawText(line, { x: margin, y: legacyY, size: 11, font: helvetica, color: textColor });
        legacyY -= lineHeight;
      }
      legacyY -= 10;
    }
    
    if (profileHobbies) {
      legacyPage.drawText("Hobbies & Interests:", { x: margin, y: legacyY, size: 11, font: helveticaBold, color: textColor });
      legacyY -= lineHeight;
      const hobbyLines = wrapText(profileHobbies, pageWidth - margin * 2, 11);
      for (const line of hobbyLines.slice(0, 10)) {
        if (legacyY <= 100) break;
        legacyPage.drawText(line, { x: margin, y: legacyY, size: 11, font: helvetica, color: textColor });
        legacyY -= lineHeight;
      }
      legacyY -= 10;
    }
    
    if (profileAccomplishments) {
      legacyPage.drawText("Accomplishments:", { x: margin, y: legacyY, size: 11, font: helveticaBold, color: textColor });
      legacyY -= lineHeight;
      const accLines = wrapText(profileAccomplishments, pageWidth - margin * 2, 11);
      for (const line of accLines.slice(0, 10)) {
        if (legacyY <= 100) break;
        legacyPage.drawText(line, { x: margin, y: legacyY, size: 11, font: helvetica, color: textColor });
        legacyY -= lineHeight;
      }
      legacyY -= 10;
    }
    
    if (profileRemembered) {
      legacyPage.drawText("How I Want to Be Remembered:", { x: margin, y: legacyY, size: 11, font: helveticaBold, color: textColor });
      legacyY -= lineHeight;
      const remLines = wrapText(profileRemembered, pageWidth - margin * 2, 11);
      for (const line of remLines.slice(0, 10)) {
        if (legacyY <= 100) break;
        legacyPage.drawText(line, { x: margin, y: legacyY, size: 11, font: helvetica, color: textColor });
        legacyY -= lineHeight;
      }
    }
  }
  addDraftWatermark(legacyPage);
  addFooter(legacyPage, pageNum++);

  // ============================================================
  // PAGE 8: Important Contacts (Family/Friends ONLY - contact_type = "person")
  // ============================================================
  const contacts1 = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(contacts1);
  let cY = addSectionHeader(contacts1, "Important Contacts", pageHeight - 100);
  
  // Get contacts and FILTER to only include "person" type (not professional or service)
  // This is a hard guard to prevent service/professional contacts from appearing
  const rawContactsList = planData?.contacts_notify || [];
  const unifiedContacts = planData?.contacts?.contacts || [];
  
  // Merge both sources and filter to ONLY "person" type or legacy entries without contact_type
  const EXCLUDED_CONTACT_TYPES = ["service", "professional", "service_provider"];
  const EXCLUDED_ROLES = [
    "attorney", "accountant", "financial_advisor", "insurance_agent", 
    "funeral_home", "cemetery", "church", "hospice", "medical_provider"
  ];
  
  const allContacts = [...rawContactsList, ...unifiedContacts];
  const contactsList = allContacts.filter((c: any) => {
    // Exclude by contact_type
    if (c.contact_type && EXCLUDED_CONTACT_TYPES.includes(c.contact_type)) {
      return false;
    }
    // Exclude by role (for legacy data) - check both role and role_or_relationship
    const roleValue = (c.role_or_relationship || c.role || "").toLowerCase();
    if (roleValue && EXCLUDED_ROLES.includes(roleValue)) {
      return false;
    }
    // Include if contact_type is "person" or not set (legacy contacts)
    return !c.contact_type || c.contact_type === "person";
  });
  
  console.log("[generate-planner-pdf] Important Contacts (filtered to person only):", {
    raw_contacts_count: rawContactsList.length,
    unified_contacts_count: unifiedContacts.length,
    filtered_count: contactsList.length,
  });
  
  if (hasAny(contactsList)) {
    cY = addArrayItems(
      contacts1,
      contactsList,
      (c) => [c.name, c.relationship ? `(${c.relationship})` : "", c.contact || c.phone || c.email].filter(Boolean).join(" - "),
      cY,
      15,
    );
  } else {
    cY = drawEmpty(contacts1, cY);
  }
  addDraftWatermark(contacts1);
  addFooter(contacts1, pageNum++);

  // ============================================================
  // REMOVED: Professional Contacts page (per requirement - PDF only removal)
  // Data remains in the app; just not rendered in PDF
  // ============================================================

  // ============================================================
  // REMOVED: Service Providers page (per requirement - PDF only removal)
  // Data remains in the app; just not rendered in PDF
  // ============================================================

  // ============================================================
  // PAGE 11-12: Funeral Wishes
  // ============================================================
  const funeral1 = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(funeral1);
  let fY = addSectionHeader(funeral1, "Funeral & Memorial Wishes", pageHeight - 100);
  
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
      fY = addArrayItems(funeral1, funding, (f) => [f.source, f.account].filter(Boolean).join(" - "), fY, 6);
    }
  }
  addDraftWatermark(funeral1);
  addFooter(funeral1, pageNum++);

  // ============================================================
  // PAGE 12: Service Details (continued) - ONLY IF CONTENT EXISTS
  // ============================================================
  const pallbearers = planData?.pallbearers || [];
  const honoraryPallbearers = planData?.honorary_pallbearers || [];
  const hasServiceContinued = pallbearers.length > 0 || honoraryPallbearers.length > 0;
  
  if (hasServiceContinued) {
    const funeral2 = pdfDoc.addPage([pageWidth, pageHeight]);
    addPageHeader(funeral2);
    let f2Y = addSectionHeader(funeral2, "Service Details (continued)", pageHeight - 100);
    
    // Additional funeral details
    if (pallbearers.length > 0) {
      funeral2.drawText("Pallbearers:", { x: margin, y: f2Y, size: 10, font: helveticaBold, color: textColor });
      f2Y -= lineHeight;
      f2Y = addArrayItems(funeral2, pallbearers, (p) => p.name || p, f2Y, 10);
      f2Y -= 10;
    }
    
    if (honoraryPallbearers.length > 0) {
      funeral2.drawText("Honorary Pallbearers:", { x: margin, y: f2Y, size: 10, font: helveticaBold, color: textColor });
      f2Y -= lineHeight;
      f2Y = addArrayItems(funeral2, honoraryPallbearers, (p) => p.name || p, f2Y, 10);
    }
    
    addDraftWatermark(funeral2);
    addFooter(funeral2, pageNum++);
  }

  // ============================================================
  // PAGE 13: Financial
  // ============================================================
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
  addPageHeader(financialPage);
  let finY = addSectionHeader(financialPage, "Financial Life", pageHeight - 100);

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
      finY = addArrayItems(financialPage, bankList, formatBank, finY, 8);
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
        6,
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
        6,
      );
      finY -= 10;
    }
    
    if (businessList.length > 0) {
      financialPage.drawText("Business Interests:", { x: margin, y: finY, size: 10, font: helveticaBold, color: textColor });
      finY -= lineHeight;
      finY = addArrayItems(
        financialPage,
        businessList,
        (b) => [b.name, b.address, b.partnership_info, b.notes].filter(Boolean).join(" - "),
        finY,
        4,
      );
      finY -= 10;
    }
    
    finY = addNotesBox(financialPage, "Notes", financialNotes, finY);
  }
  addDraftWatermark(financialPage);
  addFooter(financialPage, pageNum++);

  // ============================================================
  // PAGE 14: Insurance
  // ============================================================
  const insurancePage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(insurancePage);
  let insY = addSectionHeader(insurancePage, "Insurance Policies", pageHeight - 100);
  
  // CRITICAL: Read from multiple data sources
  const insuranceObj = planData?.insurance || {};
  const localInsurancePolicies = insuranceObj.policies || [];
  
  const insList = planData?.insurance_policies?.length > 0 
    ? planData.insurance_policies 
    : localInsurancePolicies;
  const insuranceNotes = planData?.insurance_notes || "";
  
  console.log("[generate-planner-pdf] Insurance section data:", {
    insurance_obj_keys: Object.keys(insuranceObj),
    local_policies_len: localInsurancePolicies.length,
    final_list_len: insList.length,
  });
  
  const hasInsurance = hasAny(insList) || hasText(insuranceNotes);
  
  if (!hasInsurance) {
    insY = drawEmpty(insurancePage, insY);
  } else {
    if (insList.length > 0) {
      insurancePage.drawText("Policies:", { x: margin, y: insY, size: 10, font: helveticaBold, color: textColor });
      insY -= lineHeight;
      insY = addArrayItems(
        insurancePage,
        insList,
        (p) => [
          p.type || p.policy_type,
          p.company,
          p.policy_number ? `#${p.policy_number}` : "",
          p.contact_person,
          p.phone_or_url,
        ].filter(Boolean).join(" - "),
        insY,
        12,
      );
      insY -= 10;
    }
    
    insY = addNotesBox(insurancePage, "Notes", insuranceNotes, insY);
  }
  addDraftWatermark(insurancePage);
  addFooter(insurancePage, pageNum++);

  // ============================================================
  // PAGE 15: Property
  // ============================================================
  const propertyPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(propertyPage);
  let propY = addSectionHeader(propertyPage, "Property & Valuables", pageHeight - 100);
  
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
        8,
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

  // ============================================================
  // PAGE 16: Pets
  // ============================================================
  const petsPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(petsPage);
  let petY = addSectionHeader(petsPage, "Pets", pageHeight - 100);
  
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
      for (const pet of petsList.slice(0, 10)) {
        if (petY <= 100) break;
        
        const petName = pet.name || pet.type || "(Unnamed pet)";
        const petType = pet.type || pet.breed || "";
        
        // Pet name and type on first line
        petsPage.drawText(`- ${sanitizeForPdf(petName)}${petType ? ` (${sanitizeForPdf(petType)})` : ""}`, {
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
          for (const line of careLines.slice(0, 4)) {
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

  // ============================================================
  // PAGE 17: Digital/Online Accounts - IMPROVED STRUCTURE
  // ============================================================
  const digitalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(digitalPage);
  let digY = addSectionHeader(digitalPage, "Online Accounts", pageHeight - 100);
  
  // Read from multiple data sources - support new categories structure
  const digitalObj = planData?.digital || planData?.online_accounts || {};
  const hasCategories = digitalObj.categories && typeof digitalObj.categories === 'object';
  
  // Old flat structure
  const localDigitalAccounts = digitalObj.accounts || [];
  const localPhones = digitalObj.phones || [];
  
  // New categories structure
  const categories = hasCategories ? digitalObj.categories : null;
  
  const digitalNotes = planData?.digital_notes || digitalObj.password_manager_info || "";
  
  console.log("[generate-planner-pdf] Digital section data:", {
    has_categories: hasCategories,
    category_keys: categories ? Object.keys(categories) : [],
    local_accounts_len: localDigitalAccounts.length,
    local_phones_len: localPhones.length,
  });
  
  // Check if we have any digital data
  const hasDigitalData = hasCategories 
    ? Object.values(categories || {}).some((arr: any) => Array.isArray(arr) && arr.length > 0)
    : (localDigitalAccounts.length > 0 || localPhones.length > 0);
  
  const hasDigital = hasDigitalData || hasText(digitalNotes);
  
  if (!hasDigital) {
    digY = drawEmpty(digitalPage, digY);
  } else {
    // New categories structure - print by category
    if (hasCategories) {
      const categoryLabels: Record<string, string> = {
        email: "Email Accounts",
        social: "Social Media",
        banking: "Banking & Financial",
        subscriptions: "Subscriptions & Streaming",
        utilities: "Utilities & Bills",
        phone: "Phone Accounts",
        other: "Other Accounts",
      };
      
      for (const [catKey, catLabel] of Object.entries(categoryLabels)) {
        const items = (categories as any)[catKey] || [];
        if (items.length === 0) continue;
        
        digitalPage.drawText(`${catLabel}:`, { x: margin, y: digY, size: 10, font: helveticaBold, color: textColor });
        digY -= lineHeight;
        
        if (catKey === 'phone') {
          // Phone accounts have different structure
          for (const phone of items.slice(0, 5)) {
            if (digY <= 100) break;
            const phoneInfo = [phone.carrier, phone.number, phone.pin_location ? `PIN: ${phone.pin_location}` : ""].filter(Boolean).join(" - ");
            digitalPage.drawText(`  - ${sanitizeForPdf(phoneInfo)}`, {
              x: margin + 10,
              y: digY,
              size: 10,
              font: helvetica,
              color: textColor,
            });
            digY -= lineHeight;
          }
        } else {
          // Regular accounts
          for (const account of items.slice(0, 5)) {
            if (digY <= 100) break;
            const accountInfo = [
              account.provider,
              account.username ? `(${account.username})` : "",
              account.twofa_method ? `2FA: ${account.twofa_method}` : "",
            ].filter(Boolean).join(" ");
            digitalPage.drawText(`  - ${sanitizeForPdf(accountInfo)}`, {
              x: margin + 10,
              y: digY,
              size: 10,
              font: helvetica,
              color: textColor,
            });
            digY -= lineHeight;
          }
        }
        digY -= 8;
      }
    } else {
      // Old flat structure
      if (localPhones.length > 0) {
        digitalPage.drawText("Phone Accounts:", { x: margin, y: digY, size: 10, font: helveticaBold, color: textColor });
        digY -= lineHeight;
        digY = addArrayItems(
          digitalPage,
          localPhones,
          (p: any) => [p.phone_number || p.number, p.carrier, p.access_info || p.pin].filter(Boolean).join(" - "),
          digY,
          8,
        );
        digY -= 10;
      }
      
      if (localDigitalAccounts.length > 0) {
        digitalPage.drawText("Online Accounts:", { x: margin, y: digY, size: 10, font: helveticaBold, color: textColor });
        digY -= lineHeight;
        digY = addArrayItems(
          digitalPage,
          localDigitalAccounts,
          (d: any) => [
            d.provider || d.service || d.name || d.platform,
            d.username ? `User: ${d.username}` : "",
            d.notes || "",
          ].filter(Boolean).join(" - "),
          digY,
          15,
        );
        digY -= 10;
      }
    }
    
    // Password manager info
    if (digitalNotes) {
      digY = addNotesBox(digitalPage, "Password Manager Info", digitalNotes, digY);
    }
  }
  addDraftWatermark(digitalPage);
  addFooter(digitalPage, pageNum++);

  // ============================================================
  // PAGE 18: Legal Documents
  // ============================================================
  const legal = planData?.legal || {};
  const legalNotes = planData?.legal_notes || "";

  // CANONICAL: Advance Directive data from plan_payload.advance_directive
  // New canonical model: has_advance_directive, document_location, healthcare_proxy_name, healthcare_proxy_phone, notes
  const advanceDirective = planData?.advance_directive || {};
  
  // Check for meaningful data - section complete when has_advance_directive is set
  const hasAdvanceDirective =
    advanceDirective.has_advance_directive !== null && 
    advanceDirective.has_advance_directive !== undefined;

  console.log("[generate-planner-pdf] Advance Directive data (CANONICAL):", {
    has_advance_directive: advanceDirective.has_advance_directive,
    document_location: advanceDirective.document_location,
    healthcare_proxy_name: advanceDirective.healthcare_proxy_name,
    notes: advanceDirective.notes,
  });

  // Medical & Care (new section data)
  const healthcareObj = planData?.healthcare || {};
  const carePrefsObj = planData?.care_preferences || {};

  const conditions = Array.isArray(healthcareObj.conditions) ? healthcareObj.conditions : [];
  const allergies = Array.isArray(healthcareObj.allergies) ? healthcareObj.allergies : [];
  const medications = Array.isArray(healthcareObj.medications) ? healthcareObj.medications : [];
  const doctorPharmacy = healthcareObj.doctorPharmacy || {};

  const hasMedical =
    hasAny(conditions) ||
    hasAny(allergies) ||
    hasAny(medications) ||
    hasText(doctorPharmacy.primaryDoctorName) ||
    hasText(doctorPharmacy.primaryDoctorPhone) ||
    hasText(doctorPharmacy.pharmacyName) ||
    hasText(doctorPharmacy.pharmacyPhone) ||
    hasAny(Array.isArray(carePrefsObj.preferences) ? carePrefsObj.preferences : []) ||
    hasText(carePrefsObj.additionalNotes);

  // Check for document checkboxes
  const hasLegalDocCheckboxes = legal.has_will || legal.has_trust || legal.has_poa ||
    legal.has_healthcare_directive || legal.has_living_will || legal.has_beneficiary_designations ||
    legal.has_none;

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
    has_medical: hasMedical,
  });

  const hasLegal =
    hasText(executorName) ||
    hasText(poaName) ||
    hasText(willLoc) ||
    hasText(trustLoc) ||
    hasText(legal.healthcare_proxy) ||
    hasText(legal.attorney_name) ||
    hasText(legalNotes) ||
    hasLegalDocCheckboxes ||
    hasMedical ||
    hasAdvanceDirective;

  const legalPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(legalPage);
  let legY = addSectionHeader(legalPage, "Legal Documents", pageHeight - 100);

  if (!hasLegal) {
    legY = drawEmpty(legalPage, legY);
  } else {
    // Show document types if checkboxes were checked
    if (hasLegalDocCheckboxes) {
      const docTypes: string[] = [];
      if (legal.has_none) docTypes.push("No Documents Yet");
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
    
    // CANONICAL: Healthcare Proxy from advance_directive section (primary) or legal section (fallback)
    const healthcareProxyName = advanceDirective.healthcare_proxy_name || legal.healthcare_proxy;
    const healthcareProxyPhone = advanceDirective.healthcare_proxy_phone || legal.healthcare_proxy_phone;
    if (healthcareProxyName) legY = addField(legalPage, "Healthcare Proxy", healthcareProxyName, legY);
    if (healthcareProxyPhone) legY = addField(legalPage, "Proxy Phone", healthcareProxyPhone, legY);
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

    // Advance Directive Section (CANONICAL: from plan_payload.advance_directive)
    // Renders: has_advance_directive, document_location, healthcare_proxy_name, healthcare_proxy_phone, notes
    if (hasAdvanceDirective) {
      legY -= 14;
      legalPage.drawText("Advance Directive:", {
        x: margin,
        y: legY,
        size: 10,
        font: helveticaBold,
        color: textColor,
      });
      legY -= lineHeight;

      // Do you have an Advance Directive?
      const hasADLabel = advanceDirective.has_advance_directive === "yes" ? "Yes" : 
                         advanceDirective.has_advance_directive === "no" ? "No" : "Not provided";
      legY = addField(legalPage, "Do you have an Advance Directive?", hasADLabel, legY);

      // Document location
      legY = addField(legalPage, "Document Location", advanceDirective.document_location || "Not provided", legY);

      // Healthcare proxy name
      legY = addField(legalPage, "Healthcare Proxy Name", advanceDirective.healthcare_proxy_name || "Not provided", legY);

      // Healthcare proxy phone
      legY = addField(legalPage, "Healthcare Proxy Phone", advanceDirective.healthcare_proxy_phone || "Not provided", legY);

      // Notes
      if (hasText(advanceDirective.notes)) {
        legY = addField(legalPage, "Notes", advanceDirective.notes, legY);
      }
      
      legY -= 10;
    }

    // Medical & Care Preferences (prints if present; keeps PDF page count unchanged)
    if (hasMedical) {
      legY -= 14;
      legalPage.drawText("Medical & Care Preferences:", {
        x: margin,
        y: legY,
        size: 10,
        font: helveticaBold,
        color: textColor,
      });
      legY -= lineHeight;

      if (conditions.length > 0) {
        legalPage.drawText("Conditions:", { x: margin, y: legY, size: 10, font: helveticaBold, color: textColor });
        legY -= lineHeight;
        legY = addArrayItems(legalPage, conditions, (c) => [c.condition, c.notes].filter(Boolean).join(" - "), legY, 6);
        legY -= 10;
      }

      if (allergies.length > 0) {
        legalPage.drawText("Allergies:", { x: margin, y: legY, size: 10, font: helveticaBold, color: textColor });
        legY -= lineHeight;
        legY = addArrayItems(legalPage, allergies, (a) => [a.substance, a.reaction].filter(Boolean).join(" - "), legY, 6);
        legY -= 10;
      }

      if (medications.length > 0) {
        legalPage.drawText("Medications:", { x: margin, y: legY, size: 10, font: helveticaBold, color: textColor });
        legY -= lineHeight;
        legY = addArrayItems(
          legalPage,
          medications,
          (m) => {
            const parts = [m.name, m.dose];
            if (m.asNeeded) parts.push("as needed");
            if (m.notes) parts.push(m.notes);
            return parts.filter(Boolean).join(" - ");
          },
          legY,
          6,
        );
        legY -= 10;
      }

      const doctorName = doctorPharmacy.primaryDoctorName;
      const doctorPhone = doctorPharmacy.primaryDoctorPhone;
      const pharmacyName = doctorPharmacy.pharmacyName;
      const pharmacyPhone = doctorPharmacy.pharmacyPhone;

      if (hasText(doctorName) || hasText(doctorPhone)) {
        legY = addField(legalPage, "Primary Doctor", [doctorName, doctorPhone].filter(Boolean).join(" - "), legY);
      }
      if (hasText(pharmacyName) || hasText(pharmacyPhone)) {
        legY = addField(legalPage, "Pharmacy", [pharmacyName, pharmacyPhone].filter(Boolean).join(" - "), legY);
      }

      const selectedPrefs = Array.isArray(carePrefsObj.preferences) ? carePrefsObj.preferences : [];
      if (selectedPrefs.length > 0) {
        legY = addField(legalPage, "Care Preferences", selectedPrefs.join(", "), legY);
      }
      if (hasText(carePrefsObj.additionalNotes)) {
        legY = addNotesBox(legalPage, "Care Notes", carePrefsObj.additionalNotes, legY);
      }
    }

    legY = addNotesBox(legalPage, "Notes", legalNotes, legY);
  }
  addDraftWatermark(legalPage);
  addFooter(legalPage, pageNum++);

  // ============================================================
  // PAGE 19-20: Messages to Loved Ones
  // ============================================================
  const messagesPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(messagesPage);
  let msgY = addSectionHeader(messagesPage, "Messages to Loved Ones", pageHeight - 100);
  
  // CANONICAL: Read from messages_to_loved_ones if available, fall back to messages array
  const messagesObj = planData?.messages_to_loved_ones || {};
  const messagesList = messagesObj.individual?.length > 0 
    ? messagesObj.individual 
    : (planData?.messages || []);
  
  // CANONICAL: Read main_message from messages_to_loved_ones, fall back to to_loved_ones_message
  const generalMessage = messagesObj.main_message || planData?.to_loved_ones_message || planData?.messages_notes || "";
  const hasMessages = hasAny(messagesList) || hasText(generalMessage);
  
  console.log("[generate-planner-pdf] Messages section data:", {
    messages_to_loved_ones: {
      main_message_len: messagesObj.main_message?.length || 0,
      individual_count: messagesObj.individual?.length || 0,
    },
    legacy_messages_count: planData?.messages?.length || 0,
    messages_list_final: messagesList.length,
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
      
      for (const msg of messagesList.slice(0, 4)) {
        if (msgY <= 120) break;
        
        // CANONICAL: 'to' and 'message' are the field names from messages_to_loved_ones.individual
        const recipient = msg.to || msg.audience || msg.to_name || msg.recipients || "(Unspecified recipient)";
        const title = msg.title || "";
        const body = msg.message || msg.body || msg.content || "";
        
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
          for (const line of bodyLines.slice(0, 8)) {
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
          if (bodyLines.length > 8) {
            messagesPage.drawText("  (continued...)", {
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
  if (messagesList.length > 4) {
    const msgContPage = pdfDoc.addPage([pageWidth, pageHeight]);
    addPageHeader(msgContPage);
    let contY = addSectionHeader(msgContPage, "Messages (continued)", pageHeight - 100);
    
    const remainingMessages = messagesList.slice(4, 10);
    
    for (const msg of remainingMessages) {
      if (contY <= 120) break;
      
      // CANONICAL: 'to' and 'message' are the field names
      const recipient = msg.to || msg.audience || msg.to_name || msg.recipients || "(Unspecified recipient)";
      const title = msg.title || "";
      const body = msg.message || msg.body || msg.content || "";
      
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
    
    addDraftWatermark(msgContPage);
    addFooter(msgContPage, pageNum++);
  }

  // ============================================================
  // PAGE: Travel & Away-From-Home
  // ============================================================
  const travelPage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(travelPage);
  let travelY = addSectionHeader(travelPage, "Travel & Away-From-Home", pageHeight - 100);
  
  const travelObj = planData?.travel || {};
  const travelNotes = travelObj.notes || "";
  
  console.log("[generate-planner-pdf] Travel section data:", {
    travel_obj_keys: Object.keys(travelObj),
    has_notes: !!travelNotes,
  });
  
  const hasTravel = hasText(travelObj.emergencyContact) || 
    hasText(travelObj.emergencyContactPhone) ||
    hasText(travelObj.travelInsurance) ||
    hasText(travelObj.medicalInfo) ||
    hasText(travelObj.medications) ||
    hasText(travelObj.allergies) ||
    hasText(travelNotes) ||
    Object.keys(travelObj).length > 0;
  
  if (!hasTravel) {
    travelY = drawEmpty(travelPage, travelY);
  } else {
    if (travelObj.emergencyContact) travelY = addField(travelPage, "Emergency Contact", travelObj.emergencyContact, travelY);
    if (travelObj.emergencyContactPhone) travelY = addField(travelPage, "Emergency Phone", travelObj.emergencyContactPhone, travelY);
    if (travelObj.travelInsurance) travelY = addField(travelPage, "Travel Insurance", travelObj.travelInsurance, travelY);
    if (travelObj.insurancePolicy) travelY = addField(travelPage, "Policy Number", travelObj.insurancePolicy, travelY);
    if (travelObj.passportLocation) travelY = addField(travelPage, "Passport Location", travelObj.passportLocation, travelY);
    if (travelObj.medicalInfo) travelY = addField(travelPage, "Medical Info", travelObj.medicalInfo, travelY);
    if (travelObj.medications) travelY = addField(travelPage, "Medications", travelObj.medications, travelY);
    if (travelObj.allergies) travelY = addField(travelPage, "Allergies", travelObj.allergies, travelY);
    if (travelObj.doctorContact) travelY = addField(travelPage, "Doctor Contact", travelObj.doctorContact, travelY);
    travelY -= 10;
    travelY = addNotesBox(travelPage, "Notes", travelNotes, travelY);
  }
  addDraftWatermark(travelPage);
  addFooter(travelPage, pageNum++);

  // ============================================================
  // FINAL PAGE: Plan Review & Signature
  // ============================================================
  const signaturePage = pdfDoc.addPage([pageWidth, pageHeight]);
  addPageHeader(signaturePage);
  let sigY = addSectionHeader(signaturePage, "Plan Review & Signature", pageHeight - 100);
  
  // Purpose text
  signaturePage.drawText("This section is for your personal records and family reference.", {
    x: margin,
    y: sigY,
    size: 11,
    font: helvetica,
    color: textColor,
  });
  sigY -= 22;
  signaturePage.drawText("Signing below indicates you have reviewed this document.", {
    x: margin,
    y: sigY,
    size: 11,
    font: helvetica,
    color: textColor,
  });
  sigY -= 50;
  
  // Check for digital signature - prioritize new model (signature.revisions[]), then legacy formats
  const signatureObj = planData?.signature || {};
  const signatureRevisions = signatureObj?.revisions || [];
  
  // Also check legacy formats for backwards compatibility
  const legacyCurrentSignature = signatureObj?.current || {}; // old .current format
  const legacyRevisionsArray = planData?.revisions || [];
  
  // Get the latest revision from new model first
  let latestRevision: any = null;
  
  if (signatureRevisions.length > 0) {
    // New model: signature.revisions[] with signed_at field
    const sortedNew = [...signatureRevisions].sort((a: any, b: any) => 
      new Date(a.signed_at || 0).getTime() - new Date(b.signed_at || 0).getTime()
    );
    latestRevision = sortedNew[sortedNew.length - 1];
  } else if (legacyCurrentSignature?.signature_png || legacyCurrentSignature?.prepared_by) {
    // Old .current format
    latestRevision = {
      signed_name: legacyCurrentSignature.prepared_by,
      signature_image_png: legacyCurrentSignature.signature_png,
      signed_at: legacyCurrentSignature.signed_at,
      notes: undefined,
    };
  } else if (legacyRevisionsArray.length > 0) {
    // Legacy top-level revisions array
    const sortedLegacy = [...legacyRevisionsArray].sort((a: any, b: any) => 
      new Date(a.revision_date || a.date || 0).getTime() - new Date(b.revision_date || b.date || 0).getTime()
    );
    const last = sortedLegacy[sortedLegacy.length - 1];
    latestRevision = {
      signed_name: last.prepared_by || last.signed_name || last.preparer,
      signature_image_png: last.signature_png || last.signature_image_png,
      signed_at: last.revision_date || last.signed_at || last.date,
      notes: last.notes,
    };
  }
  
  // Determine if we have a valid digital signature
  const hasDigitalSignature = !!(
    latestRevision?.signed_name ||
    latestRevision?.signature_image_png
  );
  
  console.log("[generate-planner-pdf] Signature data:", {
    signature_revisions_count: signatureRevisions.length,
    legacy_current_exists: !!(legacyCurrentSignature?.signature_png),
    legacy_revisions_count: legacyRevisionsArray.length,
    has_latest_revision: !!latestRevision,
    signed_name: latestRevision?.signed_name,
    has_signature_image: !!(latestRevision?.signature_image_png),
  });
  
  if (hasDigitalSignature) {
    // Render digital signature from latest revision
    const printedName = latestRevision?.signed_name || "";
    const signatureImg = latestRevision?.signature_image_png || "";
    const signedDate = latestRevision?.signed_at || "";
    const signatureNotes = latestRevision?.notes || "";
    
    signaturePage.drawText("Printed Name:", {
      x: margin,
      y: sigY,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });
    signaturePage.drawText(sanitizeForPdf(printedName), {
      x: margin + 110,
      y: sigY,
      size: 12,
      font: helvetica,
      color: textColor,
    });
    sigY -= 40;
    
    // Date
    if (signedDate) {
      const formattedDate = new Date(signedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      signaturePage.drawText("Date:", {
        x: margin,
        y: sigY,
        size: 12,
        font: helveticaBold,
        color: textColor,
      });
      signaturePage.drawText(formattedDate, {
        x: margin + 110,
        y: sigY,
        size: 12,
        font: helvetica,
        color: textColor,
      });
      sigY -= 40;
    }
    
    // Signature image footer
    signaturePage.drawText("Signed electronically on this date.", {
      x: margin,
      y: sigY,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });
    
    if (signatureImg) {
      // Try to embed the signature image
      try {
        // Handle both base64 data URLs and regular URLs
        if (signatureImg.startsWith('data:image/png;base64,')) {
          const base64Data = signatureImg.replace('data:image/png;base64,', '');
          const sigBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const sigImage = await pdfDoc.embedPng(sigBytes);
          const sigDims = sigImage.scale(0.5);
          signaturePage.drawImage(sigImage, {
            x: margin + 10,
            y: sigY - sigDims.height - 10,
            width: Math.min(sigDims.width, 200),
            height: Math.min(sigDims.height, 60),
          });
          sigY -= 80;
        } else if (signatureImg.startsWith('http')) {
          // Fetch the image from URL
          try {
            const imgResponse = await fetch(signatureImg);
            if (imgResponse.ok) {
              const imgArrayBuffer = await imgResponse.arrayBuffer();
              const imgBytes = new Uint8Array(imgArrayBuffer);
              const sigImage = await pdfDoc.embedPng(imgBytes);
              const sigDims = sigImage.scale(0.3);
              signaturePage.drawImage(sigImage, {
                x: margin + 10,
                y: sigY - Math.min(sigDims.height, 60) - 10,
                width: Math.min(sigDims.width, 200),
                height: Math.min(sigDims.height, 60),
              });
              sigY -= 80;
            } else {
              throw new Error("Failed to fetch signature image");
            }
          } catch (fetchErr) {
            console.error("[generate-planner-pdf] Failed to fetch signature URL:", fetchErr);
            signaturePage.drawText("[Signature image on file]", {
              x: margin + 10,
              y: sigY - 20,
              size: 10,
              font: helvetica,
              color: rgb(0.4, 0.4, 0.4),
            });
            sigY -= 50;
          }
        }
      } catch (e) {
        console.error("[generate-planner-pdf] Error embedding signature:", e);
        signaturePage.drawText("[Signature image on file]", {
          x: margin + 10,
          y: sigY - 20,
          size: 10,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });
        sigY -= 50;
      }
    } else {
      signaturePage.drawText("Signature not provided", {
        x: margin + 10,
        y: sigY - 20,
        size: 10,
        font: helvetica,
        color: rgb(0.5, 0.5, 0.5),
      });
      sigY -= 50;
    }
    
    // Notes if present
    if (signatureNotes) {
      sigY -= 10;
      signaturePage.drawText("Notes:", {
        x: margin,
        y: sigY,
        size: 12,
        font: helveticaBold,
        color: textColor,
      });
      sigY -= lineHeight;
      
      // Wrap notes text
      const notesMaxWidth = pageWidth - margin * 2;
      const notesLines = wrapText(sanitizeForPdf(signatureNotes), notesMaxWidth, 11);
      for (const line of notesLines.slice(0, 5)) { // Limit to 5 lines
        signaturePage.drawText(line, {
          x: margin,
          y: sigY,
          size: 11,
          font: helvetica,
          color: textColor,
        });
        sigY -= lineHeight;
      }
      sigY -= 20;
    }
  } else {
    // Show blank signature lines for manual signing
    signaturePage.drawText("Printed Name:", {
      x: margin,
      y: sigY,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });
    sigY -= 8;
    signaturePage.drawLine({
      start: { x: margin + 110, y: sigY },
      end: { x: pageWidth - margin, y: sigY },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    sigY -= 45;
    
    signaturePage.drawText("Signature:", {
      x: margin,
      y: sigY,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });
    sigY -= 8;
    signaturePage.drawLine({
      start: { x: margin + 110, y: sigY },
      end: { x: pageWidth - margin, y: sigY },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    sigY -= 45;
    
    signaturePage.drawText("Date:", {
      x: margin,
      y: sigY,
      size: 12,
      font: helveticaBold,
      color: textColor,
    });
    sigY -= 8;
    signaturePage.drawLine({
      start: { x: margin + 110, y: sigY },
      end: { x: margin + 280, y: sigY },
      thickness: 1,
      color: rgb(0.6, 0.6, 0.6),
    });
    sigY -= 50;
  }
  
  // Additional notes
  signaturePage.drawText("Important Reminders:", {
    x: margin,
    y: sigY,
    size: 11,
    font: helveticaBold,
    color: textColor,
  });
  sigY -= lineHeight + 4;
  const reminders = [
    "Keep this document in a safe, accessible location.",
    "Inform your loved ones and executor where to find it.",
    "Review and update regularly, especially after major life events.",
    "This is for planning purposes only and is not a legal document.",
  ];
  for (const reminder of reminders) {
    signaturePage.drawText(`- ${reminder}`, {
      x: margin + 10,
      y: sigY,
      size: 10,
      font: helvetica,
      color: textColor,
    });
    sigY -= lineHeight + 2;
  }
  
  addDraftWatermark(signaturePage);
  addFooter(signaturePage, pageNum++);

  // ============================================================
  // Update all page footers with "Page X of Y" format
  // ============================================================
  const totalPages = pageNum - 1;
  for (const { page, pageNum: pNum } of allPages) {
    page.drawText(`Page ${pNum} of ${totalPages}`, {
      x: pageWidth - margin - 60,
      y: 40,
      size: 9,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  console.log(`[generate-planner-pdf] Generated planner PDF with ${totalPages} pages`);

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
  
  // Build filename: "Planner - LastName, FirstName.pdf" (using en-dash for senior-friendly)
  const buildSeniorFilename = (fullName: string): string => {
    if (!fullName) return "Planner - My Wishes.pdf";
    
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "Planner - My Wishes.pdf";
    
    if (parts.length === 1) {
      // Only first name available - use fallback format
      return `Planner - ${parts[0]}.pdf`;
    }
    
    // Extract first and last name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    
    // Format: "Planner - LastName, FirstName.pdf" (en-dash character)
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
