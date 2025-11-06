// Helper functions for PDF generation to check if sections have content

export const hasFinancialData = (financial: any): boolean => {
  if (!financial) return false;
  const accounts = financial.accounts || [];
  return !!(
    (accounts.length > 0 && accounts.some((a: any) => a.type || a.institution || a.details)) ||
    financial.safe_deposit_details ||
    financial.crypto_details ||
    financial.business_details ||
    financial.debts_details
  );
};

export const hasInsuranceData = (insurance: any): boolean => {
  if (!insurance) return false;
  const policies = insurance.policies || [];
  return policies.length > 0 && policies.some((p: any) => p.type || p.company || p.policy_number);
};

export const hasPropertyData = (property: any): boolean => {
  if (!property) return false;
  const propertyTypes = !!(
    property.has_primary_home || property.has_vacation_home || property.has_investment ||
    property.has_land || property.has_vehicles || property.has_boats_rvs ||
    property.has_business || property.has_valuables
  );
  const propertyItems = property.items || [];
  return propertyTypes || (propertyItems.length > 0 && propertyItems.some((i: any) => i.type || i.description));
};

export const hasPetsData = (planData: any): boolean => {
  const pets = planData.pets || [];
  const hasPetsList = pets.length > 0 && pets.some((pet: any) => pet.name || pet.type || pet.instructions);
  const hasPetsNotes = !!(planData.pets_notes && planData.pets_notes.trim());
  return hasPetsList || hasPetsNotes;
};

export const hasDigitalData = (digital: any): boolean => {
  if (!digital) return false;
  const hasAssets = !!(
    digital.has_social_media || digital.has_email || digital.has_cloud_storage ||
    digital.has_streaming || digital.has_shopping || digital.has_photo_sites ||
    digital.has_domains || digital.has_password_manager
  );
  const phones = digital.phones || [];
  const accounts = digital.accounts || [];
  return hasAssets || phones.length > 0 || accounts.length > 0 || digital.password_manager_info;
};

export const hasLegalData = (legal: any): boolean => {
  if (!legal) return false;
  return !!(
    legal.has_will || legal.will_details ||
    legal.has_trust || legal.trust_details ||
    legal.has_poa || legal.poa_details ||
    legal.has_advance_directive || legal.advance_directive_details
  );
};

export const hasMessagesData = (messages: any): boolean => {
  if (!messages || !Array.isArray(messages)) return false;
  return messages.length > 0 && messages.some((m: any) => m.recipients || m.text_message || m.audio_url || m.video_url);
};
