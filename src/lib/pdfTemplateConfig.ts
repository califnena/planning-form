/**
 * PDF TEMPLATE CONFIGURATION v1.0 (LOCKED)
 * 
 * This configuration maps user-entered data to the "My Final Wishes – Blank Form" template.
 * This file defines WHERE data is placed on the template.
 * 
 * VERSIONING RULE:
 * - This is v1 and is LOCKED
 * - Any layout or design change requires a NEW version (v2, v3, etc.)
 * - v1 must NEVER be modified after initial deployment
 * - UI changes must NEVER affect PDF output
 */

export const TEMPLATE_VERSION = "1.0";
export const TEMPLATE_FILE = "/templates/My-Final-Wishes-Blank-Form-2025-11-17.pdf";

// Page dimensions (US Letter)
export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;
export const MARGIN_LEFT = 50;
export const MARGIN_RIGHT = 50;
export const MARGIN_TOP = 50;
export const MARGIN_BOTTOM = 60;
export const LINE_HEIGHT = 18;
export const FIELD_LINE_HEIGHT = 14;

// Color palette (matching EFA branding)
export const COLORS = {
  headerNavy: { r: 0.10, g: 0.18, b: 0.27 },    // #1A2E44
  brandTeal: { r: 0.05, g: 0.46, b: 0.46 },     // #0E7676
  bodyGray: { r: 0.27, g: 0.27, b: 0.27 },      // #444444
  lightGray: { r: 0.70, g: 0.70, b: 0.70 },     // #B4B4B4
  writingLine: { r: 0.85, g: 0.85, b: 0.85 },   // Light gray for handwriting lines
};

// Typography settings
export const FONTS = {
  header: { size: 16, bold: true },
  subheader: { size: 13, bold: true },
  label: { size: 11, bold: true },
  body: { size: 11, bold: false },
  footer: { size: 9, bold: false },
};

/**
 * Section definitions in order
 * Each section maps 1:1 to the blank form layout
 * DO NOT rename, reorder, or merge sections
 */
export interface SectionConfig {
  id: string;
  title: string;
  startPage: number;
  fields: FieldMapping[];
}

export interface FieldMapping {
  key: string;              // Data key in planData
  label: string;            // Label to display
  y: number;                // Y position on page (from top)
  maxWidth: number;         // Max width for text wrap
  maxHeight: number;        // Max height (for multiline)
  fontSize: number;         // Font size
  lineHeight: number;       // Line spacing
  multiline: boolean;       // Allow multiple lines
  blankLines?: number;      // Number of blank handwriting lines when empty
}

/**
 * SECTION MAPPING (NO CHANGES)
 * These map 1:1 to the blank form layout:
 * - Personal Information (name + contact only)
 * - Emergency Contacts
 * - Healthcare Proxy (name + contact only)
 * - Advance Directive Summary (choices only)
 * - DNR / POLST Status (status + location)
 * - Medication List
 * - Care Preferences
 * - Funeral & Burial Wishes
 * - Obituary Draft
 * - Digital Assets List (account names only)
 * - Important Documents Locator
 */
export const SECTION_CONFIGS: SectionConfig[] = [
  {
    id: "checklist",
    title: "Checklist",
    startPage: 3,
    fields: [
      { key: "checklist_items", label: "Important tasks for loved ones", y: 100, maxWidth: 500, maxHeight: 600, fontSize: 11, lineHeight: 18, multiline: true, blankLines: 20 },
    ],
  },
  {
    id: "instructions",
    title: "My Instructions",
    startPage: 4,
    fields: [
      { key: "instructions_notes", label: "General Instructions", y: 100, maxWidth: 500, maxHeight: 600, fontSize: 11, lineHeight: 18, multiline: true, blankLines: 25 },
    ],
  },
  {
    id: "personal_information",
    title: "Personal Information",
    startPage: 5,
    fields: [
      // PRIVACY: SSN and DOB are NEVER collected or printed digitally
      { key: "personal_profile.full_name", label: "Full Legal Name", y: 100, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "personal_profile.maiden_name", label: "Maiden Name (if applicable)", y: 130, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "personal_profile.birthplace", label: "Place of Birth", y: 160, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "personal_profile.citizenship", label: "Citizenship", y: 190, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "personal_profile.address", label: "Current Address", y: 220, maxWidth: 450, maxHeight: 40, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "personal_profile.religion", label: "Religion/Faith", y: 280, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "personal_profile.marital_status", label: "Marital Status", y: 310, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "personal_profile.partner_name", label: "Spouse/Partner Name", y: 340, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
    ],
  },
  {
    id: "emergency_contacts",
    title: "Emergency Contacts",
    startPage: 6,
    fields: [
      { key: "contacts_notify", label: "Key Contacts to Notify", y: 100, maxWidth: 500, maxHeight: 550, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 15 },
    ],
  },
  {
    id: "healthcare_proxy",
    title: "Healthcare Proxy",
    startPage: 7,
    fields: [
      { key: "contacts_professional.healthcare_proxy_name", label: "Healthcare Proxy Name", y: 100, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "contacts_professional.healthcare_proxy_contact", label: "Contact Information", y: 130, maxWidth: 450, maxHeight: 40, fontSize: 11, lineHeight: 14, multiline: true },
    ],
  },
  {
    id: "advance_directive",
    title: "Advance Directive Summary",
    startPage: 8,
    fields: [
      { key: "legal.advance_directive_exists", label: "Advance Directive", y: 100, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "legal.advance_directive_location", label: "Location", y: 130, maxWidth: 450, maxHeight: 40, fontSize: 11, lineHeight: 14, multiline: true },
    ],
  },
  {
    id: "dnr_polst",
    title: "DNR / POLST Status",
    startPage: 9,
    fields: [
      { key: "legal.dnr_status", label: "DNR Status", y: 100, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "legal.polst_status", label: "POLST Status", y: 130, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "legal.dnr_location", label: "Document Location", y: 160, maxWidth: 450, maxHeight: 40, fontSize: 11, lineHeight: 14, multiline: true },
    ],
  },
  {
    id: "medications",
    title: "Medication List",
    startPage: 10,
    fields: [
      { key: "medications", label: "Current Medications", y: 100, maxWidth: 500, maxHeight: 550, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 20 },
    ],
  },
  {
    id: "care_preferences",
    title: "Care Preferences",
    startPage: 11,
    fields: [
      { key: "care_preferences", label: "Care Preferences", y: 100, maxWidth: 500, maxHeight: 550, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 20 },
    ],
  },
  {
    id: "funeral_wishes",
    title: "Funeral & Burial Wishes",
    startPage: 12,
    fields: [
      { key: "funeral.disposition", label: "Final Disposition", y: 100, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "funeral.service_type", label: "Service Type", y: 130, maxWidth: 450, maxHeight: 20, fontSize: 11, lineHeight: 14, multiline: false },
      { key: "funeral.location_preference", label: "Location Preference", y: 160, maxWidth: 450, maxHeight: 40, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "funeral_wishes_notes", label: "Additional Wishes", y: 220, maxWidth: 500, maxHeight: 350, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 15 },
    ],
  },
  {
    id: "obituary",
    title: "Obituary Draft",
    startPage: 14,
    fields: [
      { key: "about_me_notes", label: "Life Story / Obituary Draft", y: 100, maxWidth: 500, maxHeight: 550, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 25 },
    ],
  },
  {
    id: "digital_assets",
    title: "Digital Assets List",
    startPage: 16,
    fields: [
      // PRIVACY: Only account names, NO passwords
      { key: "digital_assets", label: "Online Accounts (names only, no passwords)", y: 100, maxWidth: 500, maxHeight: 550, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 20 },
    ],
  },
  {
    id: "documents_locator",
    title: "Important Documents Locator",
    startPage: 17,
    fields: [
      { key: "legal.will_location", label: "Will Location", y: 100, maxWidth: 450, maxHeight: 30, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "legal.trust_location", label: "Trust Location", y: 150, maxWidth: 450, maxHeight: 30, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "legal.poa_location", label: "Power of Attorney Location", y: 200, maxWidth: 450, maxHeight: 30, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "legal.insurance_location", label: "Insurance Documents Location", y: 250, maxWidth: 450, maxHeight: 30, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "legal.safe_deposit_location", label: "Safe Deposit Box Location", y: 300, maxWidth: 450, maxHeight: 30, fontSize: 11, lineHeight: 14, multiline: true },
      { key: "legal_notes", label: "Additional Document Notes", y: 360, maxWidth: 500, maxHeight: 250, fontSize: 11, lineHeight: 16, multiline: true, blankLines: 10 },
    ],
  },
];

/**
 * PRIVACY RULES (STRICT)
 * These fields are NEVER collected, stored, or printed digitally
 */
export const EXCLUDED_PII_FIELDS = [
  "ssn",
  "social_security_number",
  "date_of_birth",
  "dob",
  "birth_date",
];

/**
 * Validates that a field key is not a PII field
 */
export function isAllowedField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return !EXCLUDED_PII_FIELDS.some(pii => lowerKey.includes(pii));
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  const parts = path.split(".");
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  
  return current;
}

/**
 * Format array data for PDF display
 */
export function formatArrayForPdf(items: any[], formatter?: (item: any) => string): string {
  if (!Array.isArray(items) || items.length === 0) return "";
  
  return items
    .map((item, index) => {
      if (formatter) {
        return `${index + 1}. ${formatter(item)}`;
      }
      if (typeof item === "string") {
        return `${index + 1}. ${item}`;
      }
      if (item.name) {
        const parts = [item.name];
        if (item.relationship) parts.push(`(${item.relationship})`);
        if (item.contact || item.phone || item.email) {
          parts.push(`- ${item.contact || item.phone || item.email}`);
        }
        return `${index + 1}. ${parts.join(" ")}`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}
