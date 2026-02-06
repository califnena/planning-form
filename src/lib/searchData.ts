import { ALL_SECTIONS, REQUIRED_SECTIONS } from './sections';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'section' | 'afterdeath' | 'resource' | 'faq' | 'legal';
  url: string;
  category: string;
  keywords?: string[];
}

// After-Death Plan steps
export const AFTERDEATH_STEPS = [
  { id: 'step0', title: 'Overview', description: 'Introduction to the After-Death Plan', url: '/next-steps/overview' },
  { id: 'step1', title: 'Immediate Needs', description: 'First hours and days', url: '/next-steps/step1' },
  { id: 'step2', title: 'Official Notifications', description: 'Notify government and organizations', url: '/next-steps/step2' },
  { id: 'step3', title: 'Key Documents', description: 'Gather important papers', url: '/next-steps/step3' },
  { id: 'step4', title: 'Death Certificates', description: 'Order copies', url: '/next-steps/step4' },
  { id: 'step5', title: 'Obituary', description: 'Write and publish', url: '/next-steps/step5' },
  { id: 'step6', title: 'Service Details', description: 'Plan funeral or memorial', url: '/next-steps/step6' },
  { id: 'step7', title: 'Finances & Estate', description: 'Banks, insurance, and debts', url: '/next-steps/step7' },
  { id: 'step8', title: 'Digital Accounts', description: 'Online accounts and passwords', url: '/next-steps/step8' },
  { id: 'step9', title: 'Real Estate & Utilities', description: 'Property and services', url: '/next-steps/step9' },
  { id: 'step10', title: 'Subscriptions', description: 'Cancel services', url: '/next-steps/step10' },
  { id: 'step11', title: 'Other Property', description: 'Vehicles and valuables', url: '/next-steps/step11' },
  { id: 'step12', title: 'Business', description: 'Business interests', url: '/next-steps/step12' },
];

// FAQ categories and questions
export const FAQ_ITEMS = [
  { id: 'faq1', title: 'What is funeral preplanning?', description: 'Making choices before they are needed', category: 'Funeral & Preplanning Basics' },
  { id: 'faq2', title: 'At what age should I plan?', description: 'There is no right age', category: 'Funeral & Preplanning Basics' },
  { id: 'faq3', title: 'Should I prepay my funeral?', description: 'Prepaying vs prearranging', category: 'Funeral & Preplanning Basics' },
  { id: 'faq4', title: 'How to compare funeral homes?', description: 'Ask for General Price Lists', category: 'Funeral & Preplanning Basics' },
  { id: 'faq5', title: 'What is a POD beneficiary?', description: 'Payable on Death accounts', category: 'Financial Tools & Terms' },
  { id: 'faq6', title: 'What is TOD?', description: 'Transfer on Death for investments', category: 'Financial Tools & Terms' },
  { id: 'faq7', title: 'Will vs Living Trust?', description: 'Probate and privacy differences', category: 'Financial Tools & Terms' },
  { id: 'faq8', title: 'What is an Advance Directive?', description: 'Living will and healthcare proxy', category: 'Legal Planning' },
  { id: 'faq9', title: 'What is a Living Will?', description: 'End-of-life medical wishes', category: 'Legal Planning' },
  { id: 'faq10', title: 'Power of Attorney explained', description: 'Financial and healthcare POA', category: 'Legal Planning' },
];

// Resource categories
export const RESOURCE_ITEMS = [
  { id: 'res1', title: 'FTC Funeral Consumer Guide', description: 'Official guidance on planning', category: 'Funeral Planning Essentials' },
  { id: 'res2', title: 'General Price List Guide', description: 'Compare funeral costs', category: 'Funeral Planning Essentials' },
  { id: 'res3', title: 'Burial vs Cremation', description: 'Cost and considerations', category: 'Funeral Planning Essentials' },
  { id: 'res4', title: 'POD Overview', description: 'Payable-on-Death accounts', category: 'Financial & Legal Resources' },
  { id: 'res5', title: 'TOD for Investments', description: 'Transfer-on-Death setup', category: 'Financial & Legal Resources' },
  { id: 'res6', title: 'Wills vs Living Trusts', description: 'Estate planning basics', category: 'Financial & Legal Resources' },
  { id: 'res7', title: 'Life Insurance 101', description: 'Policy and beneficiaries', category: 'Financial & Legal Resources' },
  { id: 'res8', title: 'Who to Notify First', description: 'Immediate contacts', category: 'After-Death Logistics' },
  { id: 'res9', title: 'Death Certificate Guide', description: 'How many to order', category: 'After-Death Logistics' },
];

// Legal documents
export const LEGAL_ITEMS = [
  { id: 'legal1', title: 'Advance Healthcare Directive', description: 'Medical wishes and healthcare proxy', category: 'End-of-Life Legal Documents' },
  { id: 'legal2', title: 'Living Will', description: 'End-of-life treatment preferences', category: 'End-of-Life Legal Documents' },
  { id: 'legal3', title: 'Healthcare Power of Attorney', description: 'Medical decision maker', category: 'End-of-Life Legal Documents' },
  { id: 'legal4', title: 'Do Not Resuscitate (DNR)', description: 'CPR preferences', category: 'End-of-Life Legal Documents' },
  { id: 'legal5', title: 'Organ Donation Form', description: 'Donation registry', category: 'End-of-Life Legal Documents' },
  { id: 'legal6', title: 'Last Will and Testament', description: 'Asset distribution', category: 'Estate Planning Documents' },
  { id: 'legal7', title: 'Financial Power of Attorney', description: 'Financial decision maker', category: 'Estate Planning Documents' },
];

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  // Add After-Death Planner & Checklist as a top-level item
  results.push({
    id: 'after-death-planner',
    title: 'After-Death Planner & Checklist',
    description: 'Step-by-step tasks and checklists for after a death',
    type: 'resource',
    category: 'After-Death Resources',
    url: '/after-death',
    keywords: ['after death', 'death', 'checklist', 'executor', 'funeral steps', 'what to do when someone dies', 'after passing'],
  });

  // Add Pre-Planning sections
  ALL_SECTIONS.forEach(section => {
    results.push({
      id: section.id,
      title: section.title,
      description: section.description || '',
      type: 'section',
      category: 'Planner Sections',
      url: `/preplansteps#${section.id}`,
    });
  });

  // Add required sections
  REQUIRED_SECTIONS.forEach(section => {
    if (section.id === 'preferences') {
      results.push({
        id: section.id,
        title: section.title,
        description: section.description || '',
        type: 'section',
        category: 'Planner Sections',
        url: '/preplansteps/preferences',
      });
    } else if (section.id === 'legalresources') {
      results.push({
        id: section.id,
        title: section.title,
        description: section.description || '',
        type: 'legal',
        category: 'Legal Documents & Forms',
        url: '/legal-documents',
      });
    } else if (section.id === 'resources') {
      results.push({
        id: section.id,
        title: section.title,
        description: section.description || '',
        type: 'resource',
        category: 'Helpful Resources',
        url: '/resources',
      });
    } else if (section.id === 'faq') {
      results.push({
        id: section.id,
        title: section.title,
        description: section.description || '',
        type: 'faq',
        category: 'Common Questions',
        url: '/faq',
      });
    }
  });

  // Add After-Death steps
  AFTERDEATH_STEPS.forEach(step => {
    results.push({
      id: step.id,
      title: step.title,
      description: step.description,
      type: 'afterdeath',
      category: 'After-Death Steps',
      url: step.url,
    });
  });

  // Add FAQ items
  FAQ_ITEMS.forEach(item => {
    results.push({
      id: item.id,
      title: item.title,
      description: item.description,
      type: 'faq',
      category: 'Common Questions',
      url: '/faq',
    });
  });

  // Add Resource items
  RESOURCE_ITEMS.forEach(item => {
    results.push({
      id: item.id,
      title: item.title,
      description: item.description,
      type: 'resource',
      category: 'Helpful Resources',
      url: '/resources',
    });
  });

  // Add Legal items
  LEGAL_ITEMS.forEach(item => {
    results.push({
      id: item.id,
      title: item.title,
      description: item.description,
      type: 'legal',
      category: 'Legal Documents & Forms',
      url: '/legal-documents',
    });
  });

  return results;
}

export function searchContent(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchIndex = buildSearchIndex();
  const lowerQuery = query.toLowerCase().trim();

  // Filter and score results
  const matches = searchIndex
    .map(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const descMatch = item.description.toLowerCase().includes(lowerQuery);
      const categoryMatch = item.category.toLowerCase().includes(lowerQuery);
      const keywordMatch = item.keywords?.some(kw => kw.toLowerCase().includes(lowerQuery) || lowerQuery.includes(kw.toLowerCase()));

      // Calculate relevance score
      let score = 0;
      if (titleMatch) score += 10;
      if (keywordMatch) score += 8;
      if (descMatch) score += 5;
      if (categoryMatch) score += 3;

      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Limit to top 25 results
  return matches.slice(0, 25);
}

export function groupResultsByCategory(results: SearchResult[]): Record<string, SearchResult[]> {
  const grouped: Record<string, SearchResult[]> = {};

  results.forEach(result => {
    if (!grouped[result.category]) {
      grouped[result.category] = [];
    }
    grouped[result.category].push(result);
  });

  return grouped;
}
