import { supabase } from "@/integrations/supabase/client";

/**
 * Builds a complete plan data object from Supabase for PDF generation.
 * This is the SINGLE SOURCE OF TRUTH for PDF generation data.
 * 
 * The returned object includes all plan-related data from all relevant tables,
 * ensuring the PDF generator has everything it needs.
 */
export async function buildPlanDataForPdf(userId: string): Promise<any> {
  // Step 1: Get the user's active plan
  const { data: orgMember } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let planId: string | null = null;
  let plan: any = null;

  if (orgMember?.org_id) {
    const { data: existingPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("org_id", orgMember.org_id)
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
    }
  }

  if (!planId || !plan) {
    console.warn("[buildPlanDataForPdf] No plan found for user:", userId);
    return createEmptyPlanData(userId);
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

  // Step 3: Also check localStorage for any unsaved data (form saves to localStorage)
  let localPlan: any = null;
  let localProfile: any = null;
  try {
    const raw = localStorage.getItem(`plan_${userId}`);
    if (raw) {
      localPlan = JSON.parse(raw);
      localProfile = localPlan?.personal_profile;
    }
  } catch (e) {
    console.warn("[buildPlanDataForPdf] Failed to parse local plan:", e);
  }

  // Step 4: Build the complete planData object
  // Priority: localStorage > DB > defaults
  const mergedProfile = {
    ...(personalProfile || {}),
    ...(localProfile || {}),
  };

  // Ensure we have a name from somewhere
  if (!mergedProfile.full_name) {
    mergedProfile.full_name = plan.prepared_for || userProfile?.full_name || "";
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
    instructions_notes: plan.instructions_notes || localPlan?.instructions_notes || "",
    about_me_notes: plan.about_me_notes || localPlan?.about_me_notes || "",
    checklist_notes: plan.checklist_notes || localPlan?.checklist_notes || "",
    funeral_wishes_notes: plan.funeral_wishes_notes || localPlan?.funeral_wishes_notes || "",
    financial_notes: plan.financial_notes || localPlan?.financial_notes || "",
    insurance_notes: plan.insurance_notes || localPlan?.insurance_notes || "",
    property_notes: plan.property_notes || localPlan?.property_notes || "",
    pets_notes: plan.pets_notes || localPlan?.pets_notes || "",
    digital_notes: plan.digital_notes || localPlan?.digital_notes || "",
    legal_notes: plan.legal_notes || localPlan?.legal_notes || "",
    messages_notes: plan.messages_notes || localPlan?.messages_notes || "",
    to_loved_ones_message: plan.to_loved_ones_message || localPlan?.to_loved_ones_message || "",

    // Related data arrays (from Supabase)
    contacts_notify: contacts || [],
    pets: pets || [],
    insurance_policies: insurance || [],
    properties: properties || [],
    messages: messages || [],
    investments: investments || [],
    debts: debts || [],
    bank_accounts: bankAccounts || [],
    businesses: businesses || [],
    funeral_funding: funeralFunding || [],
    contacts_professional: professionalContacts || [],

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
 * Normalizes plan data to ensure consistent field names and types.
 * This prevents "UI shows data but PDF thinks empty" problems.
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

  return {
    ...raw,
    personal_profile: {
      ...profile,
      full_name: normalizedName.trim(),
      address: normalizedAddress.trim(),
    },
    prepared_for: normalizedName.trim() || raw.prepared_for || "",
    prepared_by: raw.prepared_by || normalizedName.trim() || "",
  };
}
