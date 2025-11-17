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

// Helper functions for After-Death Planner PDF sections
export const hasStep1Data = (step1: any): boolean => {
  if (!step1) return false;
  return !!(
    step1.funeralHomeContacted || step1.funeralHomeName || step1.funeralHomePhone ||
    step1.residenceSecured || step1.residenceNotes ||
    step1.familyNotified || step1.familyContacts || step1.otherUrgent
  );
};

export const hasStep2Data = (step2: any): boolean => {
  if (!step2) return false;
  return !!(
    step2.ssaDone || step2.ssaContact || step2.ssaConfirmation ||
    step2.employerDone || step2.employerContact ||
    step2.insuranceDone || step2.insuranceCompany || step2.insurancePolicy ||
    step2.bankDone || step2.bankStatus ||
    step2.utilitiesDone || step2.utilitiesList
  );
};

export const hasStep3Data = (step3: any): boolean => {
  if (!step3) return false;
  return !!(
    step3.willLocation || step3.trustLocation || step3.deedsLocation ||
    step3.insuranceLocation || step3.taxDocLocation || step3.safeDepositBox
  );
};

export const hasStep4Data = (step4: any): boolean => {
  if (!step4) return false;
  return !!(step4.numberOrdered || step4.recipients || step4.allReceived);
};

export const hasStep5Data = (step5: any): boolean => {
  if (!step5) return false;
  return !!(step5.obituaryText || step5.publications || step5.onlineLink);
};

export const hasStep6Data = (step6: any): boolean => {
  if (!step6) return false;
  return !!(
    step6.serviceType || step6.venueName || step6.venueAddress ||
    step6.dateTime || step6.officiants || step6.musicReadings || step6.confirmed
  );
};

export const hasStep7Data = (step7: any): boolean => {
  if (!step7) return false;
  return !!(
    step7.executorName || step7.executorContact || step7.attorney ||
    step7.bankAccounts || step7.propertyTransfers || step7.estateSettled
  );
};

export const hasStep8Data = (step8: any): boolean => {
  if (!step8) return false;
  const accounts = step8.accounts || [];
  return (accounts.length > 0 && accounts.some((a: any) => a.platform || a.username || a.status)) || step8.allClosed;
};

export const hasStep9Data = (step9: any): boolean => {
  if (!step9) return false;
  const properties = step9.properties || [];
  return properties.length > 0 && properties.some((p: any) => 
    p.address || p.mortgage || p.taxInfo || p.insurance || p.utilities || 
    p.realtorEstimate || p.futureUse || p.transferNotes
  );
};

export const hasStep10Data = (step10: any): boolean => {
  if (!step10) return false;
  const subscriptions = step10.subscriptions || [];
  return subscriptions.length > 0 && subscriptions.some((s: any) => s.type || s.provider || s.accountInfo);
};

export const hasStep11Data = (step11: any): boolean => {
  if (!step11) return false;
  const properties = step11.properties || [];
  return (properties.length > 0 && properties.some((p: any) => 
    p.category || p.description || p.location || p.estimatedValue || p.disposition
  )) || (step11.generalNotes && step11.generalNotes.trim());
};

export const hasStep12Data = (step12: any): boolean => {
  if (!step12) return false;
  return !!(
    step12.businessName || step12.businessType || step12.ein || step12.ownership ||
    step12.keyContacts || step12.accountant || step12.attorney || step12.successionPlan ||
    step12.bankAccounts || step12.assets || step12.liabilities || step12.disposition ||
    step12.partnersNotified || step12.employeesNotified || step12.accountsTransferred ||
    step12.licensesHandled || step12.dispositionComplete || step12.notes
  );
};
