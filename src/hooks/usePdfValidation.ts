import { useMemo } from "react";

export interface MissingField {
  sectionKey: string;
  sectionLabel: string;
  fieldKey: string;
  fieldLabel: string;
  message: string;
  fixRoute: string;
  severity: "hard" | "recommended"; // hard = cannot bypass, recommended = can bypass
}

export interface ValidationResult {
  isValid: boolean;
  missing: MissingField[];
  missingSectionCount: number;
  hasHardRequired: boolean; // true if any hard-required fields are missing
  canBypass: boolean; // true if only recommended fields are missing
}

interface PlanData {
  // Personal profile can come from personal_profiles table OR localStorage
  personal_profile?: {
    full_name?: string;
    birthplace?: string;
    address?: string;
    marital_status?: string;
    partner_name?: string;
    citizenship?: string;
    religion?: string;
    father_name?: string;
    mother_name?: string;
    child_names?: string[];
  };
  contacts?: Array<{
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  }>;
  funeral?: {
    funeral_preference?: string;
    disposition?: string;
    service_preference?: string;
  };
  funeral_wishes_notes?: string;
  about_me_notes?: string;
  legal?: {
    will_status?: string;
    document_location?: string;
    executor_name?: string;
  };
  legal_notes?: string;
  financial_notes?: string;
  insurance_notes?: string;
  property_notes?: string;
  pets_notes?: string;
  digital_notes?: string;
  messages_notes?: string;
  to_loved_ones_message?: string;
  prepared_for?: string;
  // Also check the plans table prepared_for field as fallback for name
}

// Section route mapping for "Go to section" navigation
const SECTION_ROUTES: Record<string, string> = {
  personal: "/preplandashboard?section=personal",
  contacts: "/preplandashboard?section=contacts",
  funeral: "/preplandashboard?section=funeral",
  legacy: "/preplandashboard?section=legacy",
  legal: "/preplandashboard?section=legal",
  financial: "/preplandashboard?section=financial",
  insurance: "/preplandashboard?section=insurance",
  property: "/preplandashboard?section=property",
  pets: "/preplandashboard?section=pets",
  digital: "/preplandashboard?section=digital",
  messages: "/preplandashboard?section=messages",
};

// Section labels for display
const SECTION_LABELS: Record<string, string> = {
  personal: "Personal & Family Details",
  contacts: "Key Contacts to Notify",
  funeral: "Funeral Wishes",
  legacy: "Life Story & Legacy",
  legal: "Legal Documents",
  financial: "Financial Life",
  insurance: "Insurance",
  property: "Property & Valuables",
  pets: "Pet Care",
  digital: "Digital Accounts",
  messages: "Messages to Loved Ones",
};

export function validatePdfReady(
  planData: PlanData | null,
  selectedSections: string[]
): ValidationResult {
  const missing: MissingField[] = [];
  const selectedSet = new Set(selectedSections);

  // Helper to add missing field
  const addMissing = (
    sectionKey: string,
    fieldKey: string,
    fieldLabel: string,
    message: string,
    severity: "hard" | "recommended"
  ) => {
    missing.push({
      sectionKey,
      sectionLabel: SECTION_LABELS[sectionKey] || sectionKey,
      fieldKey,
      fieldLabel,
      message,
      fixRoute: SECTION_ROUTES[sectionKey] || "/preplandashboard",
      severity,
    });
  };

  // Only validate sections the user selected
  
  // A) Personal & Family Details - HARD REQUIRED: full_name OR prepared_for
  if (selectedSet.has("personal")) {
    const profile = planData?.personal_profile;
    
    // Check for name in multiple possible locations (DB profile, localStorage, or plans.prepared_for)
    const hasName = !!(
      (profile?.full_name && profile.full_name.trim().length >= 2) ||
      (planData?.prepared_for && planData.prepared_for.trim().length >= 2)
    );
    
    if (!hasName) {
      addMissing("personal", "full_name", "Full Legal Name", "Add your full legal name", "hard");
    }
    
    // Address check - minimum 5 characters for valid address
    const hasAddress = !!(profile?.address && profile.address.trim().length >= 5);
    
    if (!hasAddress) {
      addMissing("personal", "address", "Current Address", "Add your current address", "hard");
    }
  }

  // B) Contacts to Notify - RECOMMENDED
  if (selectedSet.has("contacts")) {
    const contacts = planData?.contacts || [];
    const validContacts = contacts.filter(c => 
      c.name?.trim() && 
      c.relationship?.trim() && 
      (c.phone?.trim() || c.email?.trim())
    );
    
    if (validContacts.length === 0) {
      addMissing("contacts", "contact_entry", "Emergency Contact", "Add at least one person to notify", "recommended");
    }
  }

  // C) Funeral Wishes - RECOMMENDED
  if (selectedSet.has("funeral")) {
    const funeral = planData?.funeral;
    const funeralNotes = planData?.funeral_wishes_notes;
    
    const hasDisposition = funeral?.disposition?.trim() || funeral?.funeral_preference?.trim();
    const hasNotes = funeralNotes?.trim();
    
    if (!hasDisposition && !hasNotes) {
      addMissing("funeral", "disposition", "Burial or Cremation", "Choose burial, cremation, or 'Unsure'", "recommended");
    }
  }

  // D) Legal Documents - RECOMMENDED
  if (selectedSet.has("legal")) {
    const legal = planData?.legal;
    const legalNotes = planData?.legal_notes;
    
    const hasWillInfo = legal?.will_status?.trim() || legalNotes?.trim();
    
    if (!hasWillInfo) {
      addMissing("legal", "will_status", "Will Status", "Note whether you have a will", "recommended");
    }
  }

  // Count unique sections with missing fields
  const missingSectionKeys = new Set(missing.map(m => m.sectionKey));
  const hasHardRequired = missing.some(m => m.severity === "hard");
  const canBypass = missing.length > 0 && !hasHardRequired;

  return {
    isValid: missing.length === 0,
    missing,
    missingSectionCount: missingSectionKeys.size,
    hasHardRequired,
    canBypass,
  };
}

export function usePdfValidation(
  planData: PlanData | null,
  selectedSections: string[]
): ValidationResult {
  return useMemo(() => {
    return validatePdfReady(planData, selectedSections);
  }, [planData, selectedSections]);
}
