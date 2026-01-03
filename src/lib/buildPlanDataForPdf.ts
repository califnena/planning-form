import { supabase } from "@/integrations/supabase/client";

/**
 * Builds a complete plan data object from Supabase for PDF generation.
 * This is the SINGLE SOURCE OF TRUTH for PDF generation data.
 * 
 * The returned object includes all plan-related data from all relevant tables,
 * ensuring the PDF generator has everything it needs.
 */
export async function buildPlanDataForPdf(userId: string): Promise<any> {
  // Step 1: Get the user's org membership or create one
  let orgId: string | null = null;
  
  const { data: orgMember } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (orgMember?.org_id) {
    orgId = orgMember.org_id;
  }

  let planId: string | null = null;
  let plan: any = null;

  // Try to find existing plan
  if (orgId) {
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("org_id", orgId)
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPlan) {
      planId = existingPlan.id;
      plan = existingPlan;
    }
  }

  // Fallback: Find plan directly by owner_user_id
  if (!planId) {
    const { data: fallbackPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fallbackPlan) {
      planId = fallbackPlan.id;
      plan = fallbackPlan;
      orgId = fallbackPlan.org_id || orgId;
    }
  }

  // CRITICAL: If no plan exists, CREATE one so PDF generation can proceed
  if (!planId || !plan) {
    console.log("[buildPlanDataForPdf] No plan found - creating default plan for user:", userId);
    
    // Create org if needed
    if (!orgId) {
      const { data: newOrg, error: orgError } = await supabase
        .from("orgs")
        .insert({ name: "Personal" })
        .select("id")
        .single();
      
      if (orgError) {
        console.error("[buildPlanDataForPdf] Failed to create org:", orgError);
        return createEmptyPlanData(userId);
      }
      orgId = newOrg.id;
      
      // Add user to org
      await supabase.from("org_members").insert({
        org_id: orgId,
        user_id: userId,
        role: "owner"
      });
    }
    
    // Create the plan
    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .insert({
        org_id: orgId,
        owner_user_id: userId,
        title: "My Final Wishes Plan",
        plan_payload: {}
      })
      .select("*")
      .single();
    
    if (planError) {
      console.error("[buildPlanDataForPdf] Failed to create plan:", planError);
      return createEmptyPlanData(userId);
    }
    
    planId = newPlan.id;
    plan = newPlan;
    console.log("[buildPlanDataForPdf] Created new plan:", planId);
  }

  // Step 2: Fetch all related data in parallel
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

  // Step 3: Do NOT read from localStorage here.
  // All section data is expected to come from DB-backed plan_payload.
  // (Any one-time migration from localStorage to plan_payload should happen in the section pages.)

  // Step 4: Build the complete planData object
  // Priority: DB plan_payload > defaults
  const mergedProfile = {
    ...(personalProfile || {}),
  };

  // Ensure we have a name from somewhere
  if (!mergedProfile.full_name) {
    mergedProfile.full_name = plan.prepared_for || userProfile?.full_name || "";
  }

  // Extract plan_payload and merge it to top level for consistent access
  const planPayload = (typeof plan.plan_payload === 'object' && plan.plan_payload !== null)
    ? plan.plan_payload as Record<string, any>
    : {};

  // CRITICAL: Merge plan_payload data to top level so completion checks work
  // This makes pd.financial, pd.digital, pd.pets, etc. available directly
  const planPayloadMerged = {
    // Section data from plan_payload (DB storage)
    financial: planPayload.financial || undefined,
    digital: planPayload.digital || undefined,
    property: planPayload.property || undefined,
    pets: planPayload.pets || undefined,
    messages: planPayload.messages || undefined,
    insurance: planPayload.insurance || undefined,
    contacts: planPayload.contacts || undefined,
    funeral: planPayload.funeral || undefined,
    personal: planPayload.personal || planPayload.about_you || undefined,
    about_you: planPayload.about_you || planPayload.personal || undefined,
    healthcare: planPayload.healthcare || undefined,
    care_preferences: planPayload.care_preferences || undefined,
    advance_directive: planPayload.advance_directive || undefined,
    travel: planPayload.travel || undefined,
    preplanning: planPayload.preplanning || undefined,
    legal: planPayload.legal || undefined,
    legacy: planPayload.legacy || undefined,
  };

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
 */
export function normalizePlanDataForPdf(raw: any): any {
  if (!raw) return createEmptyPlanData("");

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

  // Extract contacts from different formats and merge
  const contactsFromPayload = raw.contacts || {};
  const contactsArray = Array.isArray(contactsFromPayload) 
    ? contactsFromPayload 
    : (contactsFromPayload.contacts || []);
  const importantPeople = Array.isArray(contactsFromPayload.importantPeople)
    ? contactsFromPayload.importantPeople
    : [];
  
  // Merge contacts arrays
  const allContacts = [...contactsArray, ...importantPeople];
  
  // Extract digital accounts from different formats
  const digitalData = raw.digital || {};
  const digitalAccounts = Array.isArray(digitalData.accounts) 
    ? digitalData.accounts 
    : [];
  
  // Extract financial data
  const financialData = raw.financial || {};
  const bankAccounts = Array.isArray(financialData.bankAccounts)
    ? financialData.bankAccounts
    : (raw.bank_accounts || []);
  
  // Extract property data
  const propertyData = raw.property || {};
  const properties = Array.isArray(propertyData.properties)
    ? propertyData.properties
    : (raw.properties || []);
  const valuables = Array.isArray(propertyData.valuables)
    ? propertyData.valuables
    : [];
  
  // Extract insurance data
  const insuranceData = raw.insurance || {};
  const insurancePolicies = Array.isArray(insuranceData.policies)
    ? insuranceData.policies
    : (raw.insurance_policies || []);
  
  // Extract pets - ensure array format
  const petsData = Array.isArray(raw.pets) ? raw.pets : [];
  
  // Extract messages - ensure array format
  const messagesData = Array.isArray(raw.messages) ? raw.messages : [];
  
  // Extract healthcare/medical data for legal section
  const healthcareData = raw.healthcare || {};
  const advanceDirective = raw.advance_directive || {};
  const carePreferences = raw.care_preferences || {};
  
  return {
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
    pets: petsData.length > 0 ? petsData : (raw.pets || []),
    messages: messagesData.length > 0 ? messagesData : (raw.messages || []),
    insurance_policies: insurancePolicies.length > 0 ? insurancePolicies : (raw.insurance_policies || []),
    bank_accounts: bankAccounts.length > 0 ? bankAccounts : (raw.bank_accounts || []),
    properties: properties.length > 0 ? properties : (raw.properties || []),
    valuables: valuables.length > 0 ? valuables : (raw.valuables || []),
    digital_assets: digitalAccounts.length > 0 
      ? digitalAccounts.map((a: any) => `${a.site || a.name || ""}: ${a.username || ""}`.trim())
      : (raw.digital_assets || []),
    
    // Include section data for PDF rendering
    financial: financialData,
    digital: digitalData,
    property: propertyData,
    insurance: insuranceData,
    healthcare: healthcareData,
    advance_directive: advanceDirective,
    care_preferences: carePreferences,
    
    // Legal section - include medical care summary
    legal: {
      ...(raw.legal || {}),
      healthcare_summary: healthcareData,
      advance_directive: advanceDirective,
      care_preferences: carePreferences,
    },
  };
}
