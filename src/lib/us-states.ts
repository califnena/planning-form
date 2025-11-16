export const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

// State-specific legal information
export const STATE_LEGAL_INFO: Record<string, {
  willWitnesses: number;
  notaryRequired: boolean;
  advanceDirectiveType: string;
  probateThreshold: string;
  notes: string;
}> = {
  AL: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Directive for Healthcare",
    probateThreshold: "$25,000",
    notes: "Alabama allows self-proved wills with notarization."
  },
  AZ: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Living Will and Healthcare Power of Attorney",
    probateThreshold: "$100,000",
    notes: "Arizona is a community property state. Allows holographic wills."
  },
  CA: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Healthcare Directive",
    probateThreshold: "$184,500",
    notes: "California allows holographic (handwritten) wills. Community property state."
  },
  CO: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Declaration as to Medical Treatment and Medical Power of Attorney",
    probateThreshold: "$80,000",
    notes: "Colorado allows self-proved wills with notarization."
  },
  FL: {
    willWitnesses: 2,
    notaryRequired: true,
    advanceDirectiveType: "Living Will and Healthcare Surrogate",
    probateThreshold: "$75,000",
    notes: "Florida requires wills to be notarized or have two witnesses. No state income or estate tax."
  },
  GA: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Directive for Healthcare",
    probateThreshold: "No specific threshold",
    notes: "Georgia allows self-proved wills with notarization."
  },
  IL: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Illinois Living Will and Power of Attorney for Healthcare",
    probateThreshold: "$100,000",
    notes: "Illinois requires wills to be in writing and signed by the testator."
  },
  MA: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Healthcare Proxy",
    probateThreshold: "$25,000",
    notes: "Massachusetts has state estate tax with $2 million exemption."
  },
  MI: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Patient Advocate Designation and Living Will",
    probateThreshold: "$27,000",
    notes: "Michigan allows self-proved wills with notarization."
  },
  NC: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Directive for a Natural Death and Healthcare Power of Attorney",
    probateThreshold: "$30,000",
    notes: "North Carolina allows self-proved wills with notarization."
  },
  NJ: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Directive for Healthcare",
    probateThreshold: "$50,000",
    notes: "New Jersey has state estate tax with exemption equal to federal amount."
  },
  NY: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Health Care Proxy and Living Will",
    probateThreshold: "$50,000",
    notes: "New York requires two witnesses for wills. Has state estate tax with $6.94 million exemption."
  },
  OH: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Living Will and Healthcare Power of Attorney",
    probateThreshold: "$35,000",
    notes: "Ohio allows self-proved wills with notarization."
  },
  PA: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Living Will and Healthcare Power of Attorney",
    probateThreshold: "$50,000",
    notes: "Pennsylvania allows self-proved wills with notarization. Has inheritance tax."
  },
  TX: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Directive to Physicians and Medical Power of Attorney",
    probateThreshold: "$75,000",
    notes: "Texas allows self-proved wills with notarization. Community property state."
  },
  VA: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Medical Directive",
    probateThreshold: "$50,000",
    notes: "Virginia allows self-proved wills with notarization."
  },
  WA: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Health Care Directive",
    probateThreshold: "$100,000",
    notes: "Washington is a community property state. No state income or estate tax."
  },
  // Default for states not listed above
  DEFAULT: {
    willWitnesses: 2,
    notaryRequired: false,
    advanceDirectiveType: "Advance Directive",
    probateThreshold: "Varies",
    notes: "Check with a local attorney for your state's specific requirements. Most states require 2 witnesses for wills."
  }
};
