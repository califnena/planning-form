// Resource document definitions and data
export interface ResourceDocument {
  id: string;
  title: string;
  description: string;
  intendedUse: 'before-death' | 'after-death' | 'both';
  type: 'reference' | 'checklist' | 'planner';
  icon: string;
}

export const EFA_DOCUMENTS: ResourceDocument[] = [
  {
    id: 'reference-guide',
    title: 'EFA Integrated Reference Guide',
    description: 'Educational guide explaining what each section means and why it matters. Includes definitions for common acronyms and links to app sections.',
    intendedUse: 'both',
    type: 'reference',
    icon: '📖'
  },
  {
    id: 'pre-planning-checklist',
    title: 'EFA Pre-Planning Checklist',
    description: 'Organized by app sections with checkbox format. No explanations—just clear action items to complete your pre-planning.',
    intendedUse: 'before-death',
    type: 'checklist',
    icon: '✅'
  },
  {
    id: 'after-death-planner',
    title: 'EFA After-Death Planner & Checklist',
    description: 'Timeline-based checklist for loved ones, executors, or trusted contacts. Organized by 24-48 hours, week, month, and 3-12 months.',
    intendedUse: 'after-death',
    type: 'planner',
    icon: '📋'
  }
];

// Acronym definitions for the Reference Guide
export const ACRONYM_DEFINITIONS: Record<string, string> = {
  'CPA': 'Certified Public Accountant – A licensed accounting professional who can help with tax and financial matters.',
  'HIPAA': 'Health Insurance Portability and Accountability Act – Federal law protecting medical information privacy.',
  'DNR': 'Do Not Resuscitate – A medical order indicating you do not want CPR if your heart stops.',
  'POD': 'Payable on Death – A bank account designation that transfers funds directly to a named beneficiary upon death.',
  'TOD': 'Transfer on Death – Similar to POD but typically used for investment and brokerage accounts.',
  'IRA': 'Individual Retirement Account – A tax-advantaged savings account for retirement.',
  'HYSA': 'High-Yield Savings Account – A savings account that pays higher interest rates than traditional accounts.',
  'POA': 'Power of Attorney – A legal document giving someone authority to act on your behalf.',
  'HCPOA': 'Healthcare Power of Attorney – Grants someone authority to make medical decisions for you.',
  'DPOA': 'Durable Power of Attorney – Remains effective even if you become incapacitated.'
};

// Learn More snippets for each section
export const SECTION_LEARN_MORE: Record<string, { title: string; content: string }> = {
  overview: {
    title: 'About Your Planning Overview',
    content: 'This section gives you a quick snapshot of your progress. Think of it as your personal roadmap—it helps you see what\'s done and what still needs attention. You don\'t have to complete everything at once. Go at your own pace.'
  },
  instructions: {
    title: 'Why Document Your Instructions',
    content: 'Writing down your wishes removes uncertainty for your family during a difficult time. These notes can include how you want to be remembered, any specific requests, or simply comforting words for loved ones.'
  },
  personal: {
    title: 'Personal Details Matter',
    content: 'Basic information like your legal name, birthdate, and family details help ensure official documents are accurate. This information is also used for death certificates and obituaries.'
  },
  legacy: {
    title: 'Preserving Your Story',
    content: 'Your life story is unique and worth preserving. Documenting accomplishments, favorite memories, and meaningful relationships helps create a lasting tribute that honors who you are.'
  },
  contacts: {
    title: 'Who Should Be Notified',
    content: 'Having a list of important contacts ready saves your family from scrambling during an emotional time. Include family, friends, employers, and anyone who should know.'
  },
  providers: {
    title: 'Service Provider Information',
    content: 'Knowing your preferred funeral home, religious leader, or ceremony venue in advance gives your family clear direction and ensures your wishes are honored.'
  },
  funeral: {
    title: 'Planning Your Service',
    content: 'Whether you prefer a traditional funeral, celebration of life, or simple gathering, documenting your preferences gives your family peace of mind and guidance.'
  },
  financial: {
    title: 'Organizing Financial Information',
    content: 'Locating accounts, understanding debts, and knowing where important documents are stored helps your family manage practical matters during a difficult time.'
  },
  insurance: {
    title: 'Insurance and Benefits',
    content: 'Life insurance, pensions, and Social Security benefits can provide crucial financial support. Having policy details organized ensures claims are filed promptly.'
  },
  property: {
    title: 'Property and Valuables',
    content: 'Documenting real estate, vehicles, and valuable possessions helps with estate settlement and ensures items go where you intend.'
  },
  pets: {
    title: 'Caring for Your Pets',
    content: 'Your pets depend on you. Naming a caregiver and providing care instructions ensures they\'ll be looked after according to your wishes.'
  },
  digital: {
    title: 'Digital Life Management',
    content: 'From email to social media to online banking, our digital footprint is significant. Documenting account access helps your family manage your online presence.'
  },
  legal: {
    title: 'Legal Document Organization',
    content: 'Knowing where to find your will, trust, and other legal documents saves time and prevents confusion. Keep this information updated as you make changes.'
  },
  messages: {
    title: 'Personal Messages',
    content: 'Letters and messages to loved ones can be a meaningful gift. Whether it\'s words of love, advice, or memories to share, these personal notes can bring comfort.'
  }
};

// Pre-Planning Checklist items organized by section
export const PRE_PLANNING_CHECKLIST: Record<string, string[]> = {
  'Personal & Family Details': [
    'Record your full legal name and any maiden/former names',
    'Document your date and place of birth',
    'Note your citizenship status',
    'List your marital status and spouse/partner information',
    'Record names of children and parents',
    'Document your religious affiliation (if any)',
    'Note military service details (if applicable)'
  ],
  'Important Contacts': [
    'List immediate family members with contact information',
    'Add close friends who should be notified',
    'Include employer/HR contact information',
    'Note religious leader or clergy contact',
    'Add attorney and accountant contact details',
    'List any other important contacts'
  ],
  'Service Providers': [
    'Choose and note preferred funeral home',
    'Select ceremony venue or location',
    'Identify officiant or celebrant',
    'Note preferred florist or caterer',
    'Document any pre-paid arrangements'
  ],
  'Funeral & Ceremony Wishes': [
    'Indicate preference: burial, cremation, or other',
    'Choose service type: traditional, celebration, private',
    'Select readings, poems, or scripture',
    'Choose music or songs for the service',
    'Note pallbearer preferences',
    'Specify dress code or attire',
    'Document any special requests'
  ],
  'Financial Information': [
    'List all bank accounts with locations',
    'Document investment and retirement accounts',
    'Note any debts or loans',
    'Record safe deposit box location and access',
    'Document automatic payments and subscriptions',
    'List sources of funeral funding'
  ],
  'Insurance & Benefits': [
    'Document life insurance policies with numbers',
    'Note health insurance information',
    'Record pension and retirement benefits',
    'Document Social Security information',
    'Note any veteran benefits eligibility'
  ],
  'Property & Valuables': [
    'List real estate with deed locations',
    'Document vehicle titles and registrations',
    'Inventory valuable items and jewelry',
    'Note storage unit locations if any',
    'Document disposition wishes for items'
  ],
  'Pet Care': [
    'Name designated pet caregiver',
    'Document veterinarian contact',
    'Note pet medications and care needs',
    'Provide feeding and routine information'
  ],
  'Digital Accounts': [
    'List email accounts',
    'Document social media profiles with instructions',
    'Note cloud storage accounts',
    'Record important subscriptions',
    'Designate digital executor if desired'
  ],
  'Legal Documents': [
    'Locate and file will',
    'Store trust documents',
    'Complete advance directive/living will',
    'Designate power of attorney',
    'Complete healthcare power of attorney',
    'Note document storage locations'
  ]
};

// After-Death Checklist organized by timeline
export const AFTER_DEATH_CHECKLIST: Record<string, string[]> = {
  'First 24-48 Hours': [
    'Contact funeral home to arrange transport',
    'Locate important documents (will, insurance policies)',
    'Secure the residence if applicable',
    'Notify immediate family members',
    'Begin making funeral arrangements',
    'Request multiple certified death certificates',
    'Care for any pets'
  ],
  'First Week': [
    'Notify employer and request final paycheck',
    'Contact life insurance companies to file claims',
    'Notify Social Security Administration',
    'Finalize funeral and burial/cremation arrangements',
    'Prepare and publish obituary',
    'Notify close friends and extended family',
    'Begin gathering financial account information',
    'Contact attorney regarding will and estate'
  ],
  'First Month': [
    'Cancel health insurance (if not needed by dependents)',
    'Notify credit card companies',
    'Contact mortgage company or landlord',
    'Transfer or cancel utility accounts',
    'File for life insurance benefits',
    'Apply for survivor benefits (Social Security, pension)',
    'Begin probate process if required',
    'Notify DMV and transfer vehicle titles',
    'Close or transfer bank accounts'
  ],
  '3-12 Months': [
    'File final tax returns',
    'Distribute assets according to will',
    'Close remaining accounts',
    'Cancel subscriptions and memberships',
    'Update property deeds and titles',
    'Settle outstanding debts',
    'Complete probate process',
    'Memorialization: headstone, memorial donations',
    'Consider estate planning review for surviving spouse'
  ]
};

// Legal disclaimer text
export const LEGAL_DISCLAIMER = `
IMPORTANT LEGAL DISCLAIMER

The information provided in this document and the Everlasting Funeral Advisors app is for educational and informational purposes only. It is not intended to be, and should not be construed as, legal, financial, tax, or medical advice.

• Consult a licensed attorney for legal matters including wills, trusts, powers of attorney, and estate planning.
• Consult a certified public accountant (CPA) or tax professional for tax-related questions.
• Consult a licensed financial advisor for investment and retirement planning decisions.
• Consult a healthcare provider for medical decisions and advance directive guidance.

Laws vary by state and jurisdiction. The forms and information referenced may not meet the specific requirements of your location. Always verify requirements with local authorities or qualified professionals.

Everlasting Funeral Advisors is not responsible for any actions taken based on the information provided in these materials.
`;
