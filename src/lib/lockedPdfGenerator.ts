/**
 * LOCKED PDF GENERATOR v1.0
 * 
 * This is the SINGLE PDF generator for the "My Final Wishes" planner.
 * It uses the locked template configuration to overlay user data.
 * 
 * ARCHITECTURE RULES:
 * 1. Uses ONLY the locked master template
 * 2. Data placement comes ONLY from the mapping configuration
 * 3. No alternative generators, no fallback formatting, no UI-based rendering
 * 
 * CONTENT RULES:
 * - Empty fields: Leave visible with blank handwriting lines (no "No information entered")
 * - Long text: Wrap within area, continue on next page with "Continued" label
 * - Privacy: NEVER print SSN or DOB
 */

import { jsPDF } from "jspdf";
import everlastingLogo from "@/assets/everlasting-logo.png";
import {
  TEMPLATE_VERSION,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  MARGIN_LEFT,
  MARGIN_RIGHT,
  MARGIN_TOP,
  MARGIN_BOTTOM,
  LINE_HEIGHT,
  COLORS,
  FONTS,
  SECTION_CONFIGS,
  isAllowedField,
  getNestedValue,
  formatArrayForPdf,
  type SectionConfig,
  type FieldMapping,
} from "./pdfTemplateConfig";

interface PlanData {
  prepared_by?: string;
  personal_profile?: any;
  contacts_notify?: any[];
  contacts_professional?: any[];
  funeral?: any;
  legal?: any;
  digital_assets?: any[];
  insurance_policies?: any[];
  properties?: any[];
  pets?: any[];
  messages?: any[];
  [key: string]: any;
}

interface GeneratorOptions {
  isDraft?: boolean;
  selectedSections?: string[];
}

/**
 * Generate PDF using locked template system
 */
export function generateLockedPlanPDF(
  planData: PlanData,
  options: GeneratorOptions = {}
): jsPDF {
  const { isDraft = false, selectedSections } = options;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = PAGE_WIDTH;
  const pageHeight = PAGE_HEIGHT;
  const marginLeft = MARGIN_LEFT;
  const marginRight = MARGIN_RIGHT;
  let yPosition = MARGIN_TOP;
  let currentPage = 1;

  // Track pages for TOC and total count
  const tableOfContents: { title: string; page: number }[] = [];

  // Color helpers
  const setColor = (color: { r: number; g: number; b: number }) => {
    pdf.setTextColor(color.r * 255, color.g * 255, color.b * 255);
  };

  const setDrawColorRGB = (color: { r: number; g: number; b: number }) => {
    pdf.setDrawColor(color.r * 255, color.g * 255, color.b * 255);
  };

  // Text sanitization
  const sanitizeText = (text: string): string => {
    if (!text) return "";
    return String(text)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\u2013|\u2014/g, "-")
      .replace(/\u2026/g, "...")
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .trim();
  };

  // Get legal name for footer
  const profile = planData.personal_profile || {};
  const legalName = sanitizeText(profile.full_name || profile.legal_name || "My Final Wishes");

  // Helper: Add page footer
  const addPageFooter = () => {
    // Teal line at bottom
    setDrawColorRGB(COLORS.brandTeal);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, pageHeight - 40, pageWidth - marginRight, pageHeight - 40);

    // Footer text
    pdf.setFontSize(FONTS.footer.size);
    pdf.setFont("helvetica", "normal");
    setColor(COLORS.bodyGray);
    pdf.text(
      "provided by Everlasting Funeral Advisors – My Final Wishes Planner",
      pageWidth / 2,
      pageHeight - 28,
      { align: "center" }
    );

    // Page number (will be updated at end)
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
  };

  // Helper: Add page header (for content pages, not cover)
  const addPageHeader = () => {
    // Small logo in top right
    try {
      const logoSize = 12;
      pdf.addImage(
        everlastingLogo,
        "PNG",
        pageWidth - marginRight - logoSize,
        12,
        logoSize,
        logoSize
      );
    } catch (error) {
      console.error("Error adding header logo:", error);
    }

    // Subtle line under header
    setDrawColorRGB({ r: 0.85, g: 0.85, b: 0.85 });
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, 30, pageWidth - marginRight, 30);
  };

  // Helper: Check page break
  const checkPageBreak = (neededSpace: number = 50) => {
    if (yPosition + neededSpace > pageHeight - MARGIN_BOTTOM) {
      addPageFooter();
      pdf.addPage();
      currentPage++;
      yPosition = MARGIN_TOP + 20;
      addPageHeader();
      return true;
    }
    return false;
  };

  // Helper: Add draft watermark
  const addDraftWatermark = () => {
    if (!isDraft) return;
    pdf.setFontSize(72);
    pdf.setTextColor(230, 230, 230);
    pdf.setFont("helvetica", "bold");
    pdf.text("DRAFT", pageWidth / 2, pageHeight / 2, {
      align: "center",
      angle: 45,
    });
  };

  // Helper: Draw blank handwriting lines
  const drawBlankLines = (numLines: number, startY: number): number => {
    let y = startY;
    setDrawColorRGB(COLORS.writingLine);
    pdf.setLineWidth(0.5);

    for (let i = 0; i < numLines; i++) {
      if (y > pageHeight - MARGIN_BOTTOM - 20) break;
      pdf.line(marginLeft, y, pageWidth - marginRight, y);
      y += 22; // ~0.3 inch spacing for handwriting
    }

    return y;
  };

  // Helper: Add section header
  const addSectionHeader = (title: string): number => {
    checkPageBreak(60);

    pdf.setFontSize(FONTS.header.size);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.headerNavy);
    pdf.text(sanitizeText(title), marginLeft, yPosition);

    // Teal underline
    const titleWidth = pdf.getTextWidth(sanitizeText(title));
    setDrawColorRGB(COLORS.brandTeal);
    pdf.setLineWidth(1.5);
    pdf.line(marginLeft, yPosition + 3, marginLeft + titleWidth, yPosition + 3);

    tableOfContents.push({ title, page: currentPage });
    yPosition += 25;
    return yPosition;
  };

  // Helper: Add field with value or blank line
  const addField = (field: FieldMapping, value: any): number => {
    checkPageBreak(field.maxHeight + 30);

    // Label
    pdf.setFontSize(FONTS.label.size);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.bodyGray);
    pdf.text(sanitizeText(field.label) + ":", marginLeft, yPosition);
    yPosition += 7;

    const contentWidth = pageWidth - marginLeft - marginRight;
    const startY = yPosition;

    if (value && String(value).trim()) {
      // Has content - render it
      const sanitized = sanitizeText(String(value));
      pdf.setFontSize(field.fontSize);
      pdf.setFont("helvetica", "normal");
      setColor(COLORS.bodyGray);

      if (field.multiline) {
        const lines = pdf.splitTextToSize(sanitized, field.maxWidth);
        let renderedLines = 0;
        const maxLines = Math.floor(field.maxHeight / field.lineHeight);

        for (const line of lines) {
          if (renderedLines >= maxLines) {
            // Check if we need to continue on next page
            if (checkPageBreak(field.lineHeight + 20)) {
              pdf.setFontSize(9);
              pdf.setFont("helvetica", "italic");
              setColor(COLORS.lightGray);
              pdf.text("(Continued)", marginLeft, yPosition);
              yPosition += 14;
              pdf.setFontSize(field.fontSize);
              pdf.setFont("helvetica", "normal");
              setColor(COLORS.bodyGray);
            }
          }

          pdf.text(line, marginLeft, yPosition);
          yPosition += field.lineHeight;
          renderedLines++;
        }
      } else {
        pdf.text(sanitized, marginLeft, yPosition);
        yPosition += field.lineHeight;
      }
    } else {
      // Empty - draw blank handwriting lines instead of "No information entered"
      const numLines = field.blankLines || (field.multiline ? 3 : 1);
      yPosition = drawBlankLines(numLines, yPosition);
    }

    yPosition += 8;
    return yPosition;
  };

  // Helper: Format contacts array
  const formatContacts = (contacts: any[]): string => {
    return formatArrayForPdf(contacts, (contact) => {
      const parts = [];
      if (contact.name) parts.push(contact.name);
      if (contact.relationship) parts.push(`(${contact.relationship})`);
      if (contact.contact || contact.phone || contact.email) {
        parts.push(`- ${contact.contact || contact.phone || contact.email}`);
      }
      return parts.join(" ");
    });
  };

  // Helper: Format digital assets (names only, NO passwords)
  const formatDigitalAssets = (assets: any[]): string => {
    return formatArrayForPdf(assets, (asset) => {
      // PRIVACY: Only account names, never passwords
      const parts = [];
      if (asset.platform || asset.service) parts.push(asset.platform || asset.service);
      if (asset.username) parts.push(`(${asset.username})`);
      return parts.join(" ");
    });
  };

  // ========================================================
  // PAGE 1: COVER PAGE
  // ========================================================
  // Teal accent bar at top
  pdf.setFillColor(COLORS.brandTeal.r * 255, COLORS.brandTeal.g * 255, COLORS.brandTeal.b * 255);
  pdf.rect(0, 0, pageWidth, 10, "F");

  // Title
  yPosition = 80;
  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.headerNavy);
  pdf.text("My Final Wishes", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 30;
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "normal");
  setColor(COLORS.bodyGray);
  pdf.text("End-of-Life Planning Guide", pageWidth / 2, yPosition, { align: "center" });

  // Prepared for
  yPosition += 60;
  if (legalName && legalName !== "My Final Wishes") {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.headerNavy);
    pdf.text(`Prepared for: ${legalName}`, pageWidth / 2, yPosition, { align: "center" });
  } else {
    // Blank line for handwriting
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    setColor(COLORS.bodyGray);
    pdf.text("Prepared for:", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;
    setDrawColorRGB(COLORS.lightGray);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 2 - 100, yPosition, pageWidth / 2 + 100, yPosition);
  }

  // Generation date
  yPosition += 50;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  setColor(COLORS.bodyGray);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, {
    align: "center",
  });

  // Logo and contact info
  yPosition += 60;
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(0, 0, 0);
  pdf.text("Provided by:", pageWidth / 2, yPosition, { align: "center" });

  try {
    pdf.addImage(everlastingLogo, "PNG", pageWidth / 2 - 30, yPosition + 15, 60, 60);
  } catch (error) {
    console.error("Error adding cover logo:", error);
  }

  yPosition += 90;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.text("Everlasting Funeral Advisors", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 18;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(64, 64, 64);
  pdf.text("Phone: (323) 863-5804", pageWidth / 2, yPosition, { align: "center" });
  pdf.text("Email: info@everlastingfuneraladvisors.com", pageWidth / 2, yPosition + 12, {
    align: "center",
  });
  pdf.text("Website: everlastingfuneraladvisors.com", pageWidth / 2, yPosition + 24, {
    align: "center",
  });

  addDraftWatermark();
  addPageFooter();

  // ========================================================
  // PAGE 2: TABLE OF CONTENTS (placeholder, updated at end)
  // ========================================================
  pdf.addPage();
  currentPage++;
  yPosition = MARGIN_TOP;

  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.headerNavy);
  pdf.text("Table of Contents", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 40;

  // TOC will be filled in at the end
  const tocPageIndex = currentPage;

  addDraftWatermark();
  addPageFooter();

  // ========================================================
  // CONTENT SECTIONS
  // ========================================================
  const sectionsToRender = selectedSections?.length
    ? SECTION_CONFIGS.filter((s) => selectedSections.includes(s.id))
    : SECTION_CONFIGS;

  for (const section of sectionsToRender) {
    pdf.addPage();
    currentPage++;
    yPosition = MARGIN_TOP;
    addPageHeader();

    addSectionHeader(section.title);

    for (const field of section.fields) {
      // Skip PII fields (SSN, DOB)
      if (!isAllowedField(field.key)) continue;

      // Get the value from planData
      let value = getNestedValue(planData, field.key);

      // Handle array fields specially
      if (Array.isArray(value)) {
        if (field.key === "contacts_notify" || field.key.includes("contacts")) {
          value = formatContacts(value);
        } else if (field.key === "digital_assets" || field.key.includes("digital")) {
          value = formatDigitalAssets(value);
        } else {
          value = formatArrayForPdf(value);
        }
      }

      addField(field, value);
    }

    addDraftWatermark();
    addPageFooter();
  }

  // ========================================================
  // FINAL PAGE: SIGNATURE PAGE
  // ========================================================
  pdf.addPage();
  currentPage++;
  yPosition = MARGIN_TOP;
  addPageHeader();

  addSectionHeader("Plan Review & Signature");

  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  setColor(COLORS.bodyGray);
  pdf.text(
    "I have reviewed this document and confirm that the information is accurate",
    marginLeft,
    yPosition
  );
  pdf.text("to the best of my knowledge.", marginLeft, yPosition + 14);
  yPosition += 50;

  // Signature line
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("Signature:", marginLeft, yPosition);
  setDrawColorRGB(COLORS.lightGray);
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft + 70, yPosition, marginLeft + 300, yPosition);

  yPosition += 30;
  pdf.text("Date:", marginLeft, yPosition);
  pdf.line(marginLeft + 70, yPosition, marginLeft + 200, yPosition);

  yPosition += 30;
  pdf.text("Witness:", marginLeft, yPosition);
  pdf.line(marginLeft + 70, yPosition, marginLeft + 300, yPosition);

  yPosition += 50;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  setColor(COLORS.lightGray);
  pdf.text(
    "Store this document in a safe place and inform your loved ones of its location.",
    marginLeft,
    yPosition
  );

  addDraftWatermark();
  addPageFooter();

  // ========================================================
  // UPDATE ALL PAGE NUMBERS
  // ========================================================
  const totalPages = currentPage;
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(0, 0, 0);
    // Clear previous area and write page number
    pdf.setFillColor(255, 255, 255);
    pdf.rect(pageWidth / 2 - 60, pageHeight - 20, 120, 15, "F");
    const pageText = `Page ${i} of ${totalPages} (${legalName})`;
    pdf.text(pageText, pageWidth / 2, pageHeight - 12, { align: "center" });
  }

  // ========================================================
  // UPDATE TABLE OF CONTENTS
  // ========================================================
  pdf.setPage(tocPageIndex);
  let tocY = MARGIN_TOP + 50;

  for (const entry of tableOfContents) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    setColor(COLORS.bodyGray);

    // Section title
    pdf.text(sanitizeText(entry.title), marginLeft, tocY);

    // Dots and page number
    const titleWidth = pdf.getTextWidth(sanitizeText(entry.title));
    const pageNumText = String(entry.page);
    const pageNumWidth = pdf.getTextWidth(pageNumText);

    // Draw dots
    let dotX = marginLeft + titleWidth + 10;
    const dotsEnd = pageWidth - marginRight - pageNumWidth - 10;
    while (dotX < dotsEnd) {
      pdf.text(".", dotX, tocY);
      dotX += 5;
    }

    // Page number
    pdf.text(pageNumText, pageWidth - marginRight - pageNumWidth, tocY);

    tocY += 22;
  }

  return pdf;
}

/**
 * Generate and save the PDF with proper filename
 */
export function downloadLockedPlanPDF(planData: PlanData, options: GeneratorOptions = {}): void {
  const pdf = generateLockedPlanPDF(planData, options);

  // Generate filename: "Planner – LastName, FirstName.pdf"
  const profile = planData.personal_profile || {};
  const fullName = profile.full_name || profile.legal_name || "";
  let filename = "My-Final-Wishes.pdf";

  if (fullName) {
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      const lastName = nameParts[nameParts.length - 1];
      const firstName = nameParts[0];
      filename = `Planner-${lastName}-${firstName}.pdf`;
    } else {
      filename = `Planner-${nameParts[0]}.pdf`;
    }
  }

  pdf.save(filename.replace(/[^a-zA-Z0-9-_.]/g, "-"));
}

/**
 * Get PDF as blob for email/upload
 */
export function getLockedPlanPDFBlob(planData: PlanData, options: GeneratorOptions = {}): Blob {
  const pdf = generateLockedPlanPDF(planData, options);
  return pdf.output("blob");
}
