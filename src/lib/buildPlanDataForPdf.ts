import { supabase } from "@/integrations/supabase/client";
import { normalizePlanPayload } from "@/lib/normalizePlanPayload";
import { hasMeaningfulData } from "@/lib/getUnifiedPlan";
import { getActivePlanId } from "@/lib/getActivePlanId";

/**
 * Builds a complete plan data object from Supabase for PDF generation.
 * This is the SINGLE SOURCE OF TRUTH for PDF generation data.
 * 
 * Uses centralized getActivePlanId for consistent plan resolution.
 */
export async function buildPlanDataForPdf(userId: string): Promise<any> {
  // Use centralized plan resolution (createIfMissing = true for PDF)
  const { planId, orgId, plan } = await getActivePlanId(userId, true);

  // If still no plan, return empty
  if (!planId || !plan) {
    console.warn("[buildPlanDataForPdf] No plan available for user:", userId);
    return createEmptyPlanData(userId);
  }

  if (import.meta.env.DEV) {
    console.log("=".repeat(50));
    console.log("[buildPlanDataForPdf] PDF BUILD STARTED");
    console.log("[buildPlanDataForPdf] planId:", planId);
    console.log("[buildPlanDataForPdf] userId:", userId);
    console.log("=".repeat(50));
  }

  // Fetch all related data in parallel using the resolved planId
  const [
    { data: personalProfile },
    { data: contacts },
    { data: pets },
    { data: insurance },
    { data: properties },
    { data: messages },
    { data: investments },
    { data: debts },
    { data: bankAccounts },
    { data: businesses },
    { data: funeralFunding },
    { data: professionalContacts },
    { data: userSettings },
    { data: userProfile },
  ] = await Promise.all([
    supabase.from("personal_profiles").select("*").eq("plan_id", planId).maybeSingle(),
    supabase.from("contacts_notify").select("*").eq("plan_id", planId),
    supabase.from("pets").select("*").eq("plan_id", planId),
    supabase.from("insurance_policies").select("*").eq("plan_id", planId),
    supabase.from("properties").select("*").eq("plan_id", planId),
    supabase.from("messages").select("*").eq("plan_id", planId),
    supabase.from("investments").select("*").eq("plan_id", planId),
    supabase.from("debts").select("*").eq("plan_id", planId),
    supabase.from("bank_accounts").select("*").eq("plan_id", planId),
    supabase.from("businesses").select("*").eq("plan_id", planId),
    supabase.from("funeral_funding").select("*").eq("plan_id", planId),
    supabase.from("contacts_professional").select("*").eq("plan_id", planId),
    supabase.from("user_settings").select("selected_sections").eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
  ]);

  // Log table counts for debugging
  if (import.meta.env.DEV) {
    const tableCounts = {
      personal_profile: personalProfile ? 1 : 0,
      contacts: contacts?.length || 0,
      pets: pets?.length || 0,
      insurance: insurance?.length || 0,
      properties: properties?.length || 0,
      messages: messages?.length || 0,
      investments: investments?.length || 0,
      debts: debts?.length || 0,
      bankAccounts: bankAccounts?.length || 0,
      businesses: businesses?.length || 0,
      funeralFunding: funeralFunding?.length || 0,
      professionalContacts: professionalContacts?.length || 0,
    };
    console.log("[buildPlanDataForPdf] Table counts for planId", planId, ":", tableCounts);
    
    const totalRows = Object.values(tableCounts).reduce((a, b) => a + b, 0);
    if (totalRows === 0) {
      console.warn("⚠️ [buildPlanDataForPdf] Active plan has ZERO rows in related tables!");
      console.warn("⚠️ Data is either not being saved OR plan_id is wrong.");
    }
  }

  // Normalize plan_payload ONLY (per mandate: no localStorage fallbacks)
  const planPayload = (typeof plan.plan_payload === "object" && plan.plan_payload !== null)
    ? (plan.plan_payload as Record<string, any>)
    : {};

  const normalizedPayload = normalizePlanPayload(planPayload);

  if (import.meta.env.DEV) {
    console.log("[buildPlanDataForPdf] normalizedPayload CANONICAL keys:",
      {
        personal_profile: hasMeaningfulData(normalizedPayload.personal_profile),
        family: hasMeaningfulData(normalizedPayload.family),
        online_accounts: hasMeaningfulData(normalizedPayload.online_accounts),
        messages_to_loved_ones: {
          main_message: !!normalizedPayload.messages_to_loved_ones.main_message,
          individual_count: normalizedPayload.messages_to_loved_ones.individual.length,
        },
        legacy: hasMeaningfulData(normalizedPayload.legacy),
      }
    );
    console.log("[buildPlanDataForPdf] other keys with data:",
      Object.entries({
        contacts: normalizedPayload.contacts,
        medical: normalizedPayload.medical,
        advance_directive: normalizedPayload.advance_directive,
        wishes: normalizedPayload.wishes,
        financial: normalizedPayload.financial,
        insurance: normalizedPayload.insurance,
        property: normalizedPayload.property,
        pets: normalizedPayload.pets,
        travel: normalizedPayload.travel,
      })
        .filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0))
        .map(([k]) => k)
    );
  }

  const mergedProfile = {
    ...(personalProfile || {}),
    // CANONICAL: Merge in personal_profile from payload
    ...normalizedPayload.personal_profile,
  };

  // Ensure we have a name from somewhere
  if (!mergedProfile.full_name) {
    mergedProfile.full_name = plan.prepared_for || userProfile?.full_name || "";
  }

  // Merge normalized plan_payload sections to top level for consistent access (completion + PDF)
  // CANONICAL KEYS take precedence
  const planPayloadMerged = {
    // CANONICAL: personal_profile
    personal_profile: normalizedPayload.personal_profile,
    personal: normalizedPayload.personal_profile,
    about_you: normalizedPayload.personal_profile,

    // CANONICAL: family
    family: normalizedPayload.family,

    // CANONICAL: online_accounts
    online_accounts: normalizedPayload.online_accounts,
    digital: normalizedPayload.online_accounts, // backwards compat

    // CANONICAL: messages_to_loved_ones
    messages_to_loved_ones: normalizedPayload.messages_to_loved_ones,
    messages: normalizedPayload.messages_to_loved_ones.individual, // backwards compat

    // CANONICAL: legacy
    legacy: normalizedPayload.legacy,

    // Other sections
    funeral: normalizedPayload.wishes,
    insurance: normalizedPayload.insurance,
    financial: normalizedPayload.financial,
    property: normalizedPayload.property,
    travel: normalizedPayload.travel,
    pets: normalizedPayload.pets,

    // Contacts as object-with-array (existing UI expects this)
    contacts: { contacts: normalizedPayload.contacts, importantPeople: [] },

    // Medical-related keys
    healthcare: normalizedPayload.medical,
    care_preferences: normalizedPayload.medical?.care_preferences || {},
    advance_directive: normalizedPayload.advance_directive,
  };

  if (import.meta.env.DEV) {
    console.log(
      "[buildPlanDataForPdf] planPayloadMerged keys with data:",
      Object.entries(planPayloadMerged)
        .filter(([_, v]) => v && (Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0))
        .map(([k]) => k)
    );
  }


  return {
    // Plan metadata
    id: planId,
    org_id: plan.org_id,
    prepared_by: plan.preparer_name || mergedProfile.full_name,
    prepared_for: plan.prepared_for || mergedProfile.full_name,
    title: plan.title,
    updated_at: plan.updated_at,
    last_signed_at: plan.last_signed_at,

    // Personal profile (merged from DB + localStorage)
    personal_profile: mergedProfile,

    // Notes from plans table
    instructions_notes: plan.instructions_notes || "",
    about_me_notes: plan.about_me_notes || "",
    checklist_notes: plan.checklist_notes || "",
    funeral_wishes_notes: plan.funeral_wishes_notes || "",
    financial_notes: plan.financial_notes || "",
    insurance_notes: plan.insurance_notes || "",
    property_notes: plan.property_notes || "",
    pets_notes: plan.pets_notes || "",
    digital_notes: plan.digital_notes || "",
    legal_notes: plan.legal_notes || "",
    messages_notes: plan.messages_notes || "",
    to_loved_ones_message: plan.to_loved_ones_message || "",

    // Related data arrays (from separate tables)
    contacts_notify: contacts || [],

    // IMPORTANT: If separate tables are empty, fall back to plan_payload values
    pets: (Array.isArray(pets) && pets.length > 0) ? pets : (Array.isArray(planPayloadMerged.pets) ? planPayloadMerged.pets : []),
    insurance_policies: insurance || [],
    properties: properties || [],
    messages: (Array.isArray(messages) && messages.length > 0) ? messages : (Array.isArray(planPayloadMerged.messages) ? planPayloadMerged.messages : []),

    investments: investments || [],
    debts: debts || [],
    bank_accounts: bankAccounts || [],
    businesses: businesses || [],
    funeral_funding: funeralFunding || [],
    contacts_professional: professionalContacts || [],

    // Merged plan_payload sections at top level (CRITICAL for completion + PDF)
    ...planPayloadMerged,

    // Keep plan_payload as reference too
    plan_payload: planPayload,

    // Section visibility
    _visibleSections: userSettings?.selected_sections || undefined,
  };
}

/**
 * Creates an empty plan data structure for users without a plan.
 */
function createEmptyPlanData(userId: string): any {
  return {
    id: null,
    org_id: null,
    prepared_by: "",
    prepared_for: "",
    title: "My Final Wishes Plan",
    updated_at: null,
    last_signed_at: null,
    personal_profile: {},
    instructions_notes: "",
    about_me_notes: "",
    checklist_notes: "",
    funeral_wishes_notes: "",
    financial_notes: "",
    insurance_notes: "",
    property_notes: "",
    pets_notes: "",
    digital_notes: "",
    legal_notes: "",
    messages_notes: "",
    to_loved_ones_message: "",
    contacts_notify: [],
    pets: [],
    insurance_policies: [],
    properties: [],
    messages: [],
    investments: [],
    debts: [],
    bank_accounts: [],
    businesses: [],
    funeral_funding: [],
    contacts_professional: [],
    _visibleSections: undefined,
  };
}

/**
 * Normalizes plan data to ensure consistent field names and types for PDF generation.
 * This prevents "UI shows data but PDF thinks empty" problems.
 * Maps section data to the keys expected by the PDF edge function.
 * 
 * Uses unified data approach for consistent section data extraction.
 */
export function normalizePlanDataForPdf(raw: any): any {
  if (!raw) return createEmptyPlanData("");

  // DEV: Log section data status before normalization
  if (import.meta.env.DEV) {
    console.log("[normalizePlanDataForPdf] input keys:", Object.keys(raw));
  }

  const profile = raw.personal_profile || {};

  // Normalize address: support both single "address" and split fields
  let normalizedAddress = profile.address || "";
  if (!normalizedAddress && (profile.address_line1 || profile.city)) {
    const parts = [
      profile.address_line1,
      profile.address_line2,
      profile.city,
      profile.state,
      profile.zip,
    ].filter(Boolean);
    normalizedAddress = parts.join(", ");
  }

  // Normalize name: support multiple possible field names
  let normalizedName = profile.full_name || profile.legal_name || profile.full_legal_name || "";
  if (!normalizedName) {
    normalizedName = raw.prepared_for || raw.prepared_by || "";
  }

  // Extract section data using multiple fallback paths
  const payloadSource = raw.plan_payload || {};
  const payloadData = payloadSource.data || {};
  const payloadSections = payloadSource.sections || {};
  const merged = { ...payloadSource, ...payloadData, ...payloadSections };
  
  // Get section data with fallbacks
  const personalData = merged.personal || merged.about_you || merged.about || merged.personal_profile || raw.personal || {};
  const legacyData = merged.legacy || merged.life_story || raw.legacy || {};
  const contactsData = merged.contacts || raw.contacts || {};
  const healthcareData = merged.healthcare || merged.health_care || merged.medical || raw.healthcare || {};
  const advanceDirective = merged.advance_directive || merged.advanceDirective || raw.advance_directive || {};
  const financialData = merged.financial || merged.financial_life || raw.financial || {};
  const digitalData = merged.digital || merged.digital_accounts || raw.digital || {};
  const propertyData = merged.property || merged.property_valuables || raw.property || {};
  const insuranceData = merged.insurance || merged.insurance_policies || raw.insurance || {};
  const travelData = merged.travel || merged.travel_planning || raw.travel || {};
  const petsData = merged.pets || raw.pets || [];
  const messagesData = merged.messages || raw.messages || [];
  
  // Normalize contacts to array
  const contactsArray = Array.isArray(contactsData) 
    ? contactsData 
    : (typeof contactsData === "object" && contactsData !== null)
      ? (contactsData.contacts || contactsData.importantPeople || [])
      : [];
  const allContacts = [...contactsArray, ...(raw.contacts_notify || [])];
  
  // Normalize digital accounts
  const digital = (digitalData && typeof digitalData === "object") ? digitalData : {};
  const digitalAccounts = Array.isArray(digital.accounts) ? digital.accounts : [];
  
  // Normalize financial
  const financial = (financialData && typeof financialData === "object") ? financialData : {};
  const bankAccounts = Array.isArray(financial.accounts)
    ? financial.accounts
    : (raw.bank_accounts || []);
  
  // Normalize property
  const property = (propertyData && typeof propertyData === "object") ? propertyData : {};
  const properties = Array.isArray(property.items)
    ? property.items
    : (raw.properties || []);
  const valuables = Array.isArray(property.valuables)
    ? property.valuables
    : [];
  
  // Normalize insurance
  const insurance = (insuranceData && typeof insuranceData === "object") ? insuranceData : {};
  const insurancePolicies = Array.isArray(insurance.policies)
    ? insurance.policies
    : (raw.insurance_policies || []);
  
  // Normalize pets and messages
  const petsArray = Array.isArray(petsData) ? petsData : (raw.pets || []);
  const messagesArray = Array.isArray(messagesData) ? messagesData : (raw.messages || []);
  
  // DEV: Log PDF OMIT warnings
  if (import.meta.env.DEV) {
    const sectionsToCheck = [
      { key: "financial", data: financialData, mapped: financial, label: "Financial Life" },
      { key: "digital", data: digitalData, mapped: digital, label: "Online Accounts" },
      { key: "property", data: propertyData, mapped: property, label: "Property & Valuables" },
      { key: "pets", data: petsData, mapped: petsArray, label: "Pets" },
      { key: "messages", data: messagesData, mapped: messagesArray, label: "Messages to Loved Ones" },
      { key: "healthcare", data: healthcareData, mapped: healthcareData, label: "Medical & Care" },
      { key: "travel", data: travelData, mapped: travelData, label: "Travel" },
    ];
    
    for (const { key, data, mapped, label } of sectionsToCheck) {
      if (hasMeaningfulData(data) && !hasMeaningfulData(mapped)) {
        console.warn(`[PDF OMIT] ${label} has source data but mapped output is empty!`);
      } else if (hasMeaningfulData(data)) {
        console.log(`[PDF] Section ${label} has data`);
      }
    }
  }

  const result = {
    ...raw,
    personal_profile: {
      ...profile,
      full_name: normalizedName.trim(),
      address: normalizedAddress.trim(),
    },
    prepared_for: normalizedName.trim() || raw.prepared_for || "",
    prepared_by: raw.prepared_by || normalizedName.trim() || "",
    
    // Map to PDF expected keys
    contacts_notify: allContacts.length > 0 ? allContacts : (raw.contacts_notify || []),
    pets: petsArray.length > 0 ? petsArray : (raw.pets || []),
    messages: messagesArray.length > 0 ? messagesArray : (raw.messages || []),
    insurance_policies: insurancePolicies.length > 0 ? insurancePolicies : (raw.insurance_policies || []),
    bank_accounts: bankAccounts.length > 0 ? bankAccounts : (raw.bank_accounts || []),
    properties: properties.length > 0 ? properties : (raw.properties || []),
    valuables: valuables.length > 0 ? valuables : (raw.valuables || []),
    digital_assets: digitalAccounts.length > 0 
      ? digitalAccounts.map((a: any) => `${a.platform || a.site || a.name || ""}: ${a.username || ""}`.trim())
      : (raw.digital_assets || []),
    
    // Include section data for PDF rendering
    financial: financial,
    digital: digital,
    property: property,
    insurance: insurance,
    healthcare: healthcareData,
    advance_directive: advanceDirective,
    care_preferences: (healthcareData as any)?.care_preferences || {},
    travel: travelData,
    legacy: legacyData,
    personal: personalData,
    
    // Legal section - include medical care summary
    legal: {
      ...(raw.legal || {}),
      healthcare_summary: healthcareData,
      advance_directive: advanceDirective,
      care_preferences: (healthcareData as any)?.care_preferences || {},
    },
  };

  // DEV: Log final output status
  if (import.meta.env.DEV) {
    const outputSections = ["pets", "messages", "bank_accounts", "properties", "digital", "financial", "healthcare", "travel"];
    const withData = outputSections.filter(k => hasMeaningfulData(result[k]));
    console.log("[normalizePlanDataForPdf] output sections with data:", withData);
  }

  return result;
}
