import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { Home, ExternalLink, FileText, Download } from 'lucide-react';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppFooter } from '@/components/AppFooter';
import { BackNavigation } from '@/components/BackNavigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ResourcesDownloadSection } from '@/components/resources/ResourcesDownloadSection';
const Resources = () => {
  const resourceSections = [{
    title: "Funeral Planning Essentials",
    icon: "🕊️",
    description: "Basics for understanding funeral decisions, legal requirements, and consumer rights.",
    items: [{
      name: "Know Your Rights Under the Funeral Rule (FTC)",
      description: "The FTC Funeral Rule protects consumers when arranging funerals. You have the right to: receive a General Price List, choose only the services you want, buy caskets/urns from any seller, and decline embalming in most cases. Report concerns to the FTC at reportfraud.ftc.gov.",
      link: "/guides/Complying-with-the-Funeral-Rule.pdf",
      isDownload: true
    }, {
      name: "FTC Funeral Consumer Guide",
      description: "Official guidance on planning your own funeral, comparing prices, and avoiding scams.",
      link: "https://consumer.ftc.gov/articles/planning-your-own-funeral"
    }, {
      name: "General Price List (GPL) Guide",
      description: "Funeral homes must provide a GPL showing itemized prices. Use it to compare costs between providers. The GPL must include prices for basic services, caskets, urns, embalming, viewing, and ceremony options."
    }, {
      name: "Burial vs Cremation Summary",
      description: "Burial typically costs $7,000-$12,000+ (includes casket, plot, vault, service). Cremation typically costs $1,000-$3,000 (direct cremation) or $4,000-$7,000 (with service). Consider: religious requirements, family preferences, environmental factors, and geographic location."
    }, {
      name: "Casket & Urn Shopping Tips",
      description: "You have the right to buy a casket or urn anywhere (online, warehouse stores) and bring it to the funeral home. The funeral home cannot charge a handling fee. Compare prices carefully—markups can be 300-500%."
    }]
  }, {
    title: "Financial & Legal Resources",
    icon: "💰",
    description: "Straightforward tools for managing beneficiaries, estate basics, insurance, and probate.",
    items: [{
      name: "Payable-on-Death (POD) Overview",
      description: "A POD beneficiary on a bank account receives the money directly when you die, bypassing probate. To set up: ask your bank for a POD form, list the person's full name, and return it. Usually free and one of the simplest ways to help loved ones access cash quickly."
    }, {
      name: "Transfer-on-Death (TOD) for Investments",
      description: "TOD designations on brokerage accounts work like POD for bank accounts. Assets transfer directly to named beneficiaries without probate. Contact your brokerage to add TOD beneficiaries to stocks, bonds, and mutual funds."
    }, {
      name: "Starter Guide: Wills vs. Living Trusts",
      description: "A will goes through probate court and becomes public. A living trust avoids probate, stays private, and takes effect if you become incapacitated. Trusts cost more upfront but can save time and money later. Consult an attorney to decide what's best for your situation."
    }, {
      name: "Life Insurance 101",
      description: "Keep policy documents accessible. Beneficiaries need: policy number, insurer contact info, and death certificate. Most policies pay within 30-60 days of claim. Review beneficiaries annually—especially after marriage, divorce, births, or deaths."
    }, {
      name: "Safe Deposit Box Guide",
      description: "Safe deposit boxes are sealed upon death in some states. Don't store your will there—keep it with your attorney or in a home safe. Good for: jewelry, deeds, titles, bonds. Bad for: items needed immediately after death."
    }]
  }, {
    title: "Travel & Out-of-State Death",
    icon: "✈️",
    description: "What to know when death occurs away from home.",
    items: [{
      name: "Travel Death Protection",
      description: "If someone passes away while traveling far from home, the cost and logistics can be overwhelming. Travel death protection is a one-time payment plan that covers transportation of remains, international coordination, paperwork, and optional cremation services. It works worldwide and helps families avoid urgent decisions during a crisis.",
      link: "/travel-protection",
      isInternal: true
    }, {
      name: "Who Should Consider This",
      description: "Travel death protection is especially useful for: frequent travelers, snowbirds, retirees, military families, and anyone with family in other states or countries. This is an optional planning tool—not a requirement—for people who travel or live part-time away from home."
    }, {
      name: "What It Covers",
      description: "A typical travel death protection plan helps with: transportation of remains back home, international and out-of-state coordination, paperwork and local requirements, optional cremation and return of ashes, and assistance backed by an established insurance underwriter."
    }]
  }, {
    title: "After-Death Logistics",
    icon: "📋",
    description: "Practical steps for families in the first 72 hours and beyond.",
    items: [{
      name: "Who to Notify First",
      description: "If expected death (hospice/home): Call hospice nurse or family doctor first. If unexpected: Call 911. Then notify: funeral home, immediate family, employer, and close friends. Within days: insurance companies, banks, Social Security, pension providers."
    }, {
      name: "Death Certificates: How Many to Order",
      description: "Order 10-15 certified copies from the funeral home or vital records office. Each organization needs an original: banks, insurance, Social Security, pension, property transfers, vehicle titles. Ordering later costs more and takes longer."
    }, {
      name: "Social Security Guide",
      description: "Notify Social Security immediately—funeral home often does this. Benefits include: $255 lump-sum death benefit (if eligible), survivor benefits for spouses and children. Learn more at:",
      link: "https://www.ssa.gov/benefits/survivors/"
    }, {
      name: "Employer & Pension Notifications",
      description: "Contact HR within days. Documents needed: death certificate, marriage certificate, beneficiary forms. Ask about: final paycheck, unused PTO, retirement accounts, life insurance, pension survivor benefits, COBRA health coverage for dependents."
    }, {
      name: "Closing Accounts & Memberships",
      description: "Create a checklist: credit cards, subscriptions (streaming, gym, magazines), utilities, memberships (AAA, AARP, clubs), loyalty programs. Cancel to avoid recurring charges. Some may offer refunds."
    }]
  }, {
    title: "Digital Life & Passwords",
    icon: "💻",
    description: "Managing digital accounts and online presence after death.",
    items: [{
      name: "Apple Legacy Contact",
      description: "Set up a Legacy Contact to give someone access to your Apple account and data after you die. Go to: Settings → [Your Name] → Sign-In & Security → Legacy Contact. Give them the access key. They'll need it plus your death certificate to request access.",
      link: "https://support.apple.com/en-us/102431"
    }, {
      name: "Google Inactive Account Manager",
      description: "Tell Google what to do with your account if you're inactive for a chosen period (3-18 months). Options: delete account, share data with trusted contacts, or keep it. Set up at:",
      link: "https://myaccount.google.com/inactive"
    }, {
      name: "Social Media: Memorialize or Delete",
      description: "Facebook: Set Legacy Contact or choose to delete. Instagram: Account can be memorialized or deleted by family. TikTok: Family can request account removal. LinkedIn: Family can close account with death certificate. Check each platform's help center for specific steps."
    }, {
      name: "Password Manager Recommendations",
      description: "Use a password manager (1Password, Bitwarden, Dashlane) to store all login credentials. Set up emergency access or share master password with executor. Alternative: write critical passwords in a fireproof safe or safe deposit box."
    }, {
      name: "Digital Executor Overview",
      description: "Choose someone tech-savvy you trust. Give them: list of accounts, where passwords are stored, instructions for each account (close, memorialize, transfer). Include: email, social media, cloud storage, financial accounts, subscriptions."
    }]
  }, {
    title: "Special Groups (Veterans, Parents, Pet Owners)",
    icon: "🎖️",
    description: "Resources for veterans, parents of minors, and pet owners.",
    items: [{
      name: "Veterans' Burial Benefits",
      description: "Eligible veterans and spouses can receive: free burial in a national cemetery, government headstone or marker, burial flag, Presidential Memorial Certificate. No charge for plot, opening/closing, or marker. Learn more:",
      link: "https://www.va.gov/burials-memorials/"
    }, {
      name: "Benefits for Spouses of Veterans",
      description: "Spouses and dependent children may be buried in a national cemetery with the veteran at no cost. Spouses can also receive a headstone or marker. Eligibility varies—check with the VA."
    }, {
      name: "Planning for Pets",
      description: "Steps: (1) Choose a trusted caregiver and confirm they agree. (2) Document their contact info and care instructions. (3) Name them in your will or create a pet trust. (4) Set aside funds for food, vet care, and supplies. Some states allow formal pet trusts for long-term care."
    }, {
      name: "Resources for Parents",
      description: "If you have minor children: Name a guardian in your will. Discuss with them first. Create an emergency binder with: medical info, school contacts, routines, preferences. Consider life insurance to provide for their care. Consult a family law attorney."
    }]
  }, {
    title: "External Tools & Printable Guides",
    icon: "🔗",
    description: "Trusted organizations and downloadable resources.",
    items: [{
      name: "FTC Funeral Assistance Resources",
      description: "Consumer information on funeral planning, costs, and rights.",
      link: "https://consumer.ftc.gov/funerals"
    }, {
      name: "Funeral Consumers Alliance",
      description: "Nonprofit consumer group with guides, checklists, and funeral home reviews. Helps families make informed, affordable choices.",
      link: "https://funerals.org"
    }, {
      name: "VA Burial Benefits",
      description: "Complete guide to VA burial allowances, headstones, flags, and cemetery eligibility.",
      link: "https://www.va.gov/burials-memorials/veterans-burial-allowance/"
    }, {
      name: "Downloads from This App",
      description: <>
              Access our downloadable guides and blank forms:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><a href="/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf" download className="text-primary hover:underline">Pre-Planning Your Funeral Guide (PDF)</a></li>
                <li><a href="/guides/Discussing-Death-Guide.pdf" download className="text-primary hover:underline">Discussing Death Guide (PDF)</a></li>
                <li><a href="/guides/My-End-of-Life-Decisions-Guide.pdf" download className="text-primary hover:underline">My End-of-Life Decisions Guide (PDF)</a></li>
                <li><Link to="/forms" className="text-primary hover:underline">Blank Fillable Forms (Pre-Planning & After-Death Planner)</Link></li>
              </ul>
            </>
    }]
  }];
  return <div className="min-h-screen bg-background flex flex-col">
      <GlobalHeader />
      <div className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
        <div className="flex justify-between items-start mb-8">
          <BackNavigation />
          <TextSizeToggle />
        </div>

        {/* Featured Guide - Gamma Embed */}
        <div className="mb-12">
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 md:p-8 shadow-lg">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full mb-2">
                📖 Featured Guide
              </span>
              <h2 className="text-2xl font-bold text-foreground">
                Planning Your Funeral: A Gift of Peace & Clarity
              </h2>
            </div>
            <div className="flex justify-center">
              <iframe src="https://gamma.app/embed/rwk4xlwaixs6gbj" style={{
              width: '700px',
              maxWidth: '100%',
              height: '450px'
            }} allow="fullscreen" title="Planning Your Funeral: A Gift of Peace & Clarity" className="rounded-lg border border-border" />
            </div>
          </div>
        </div>
        {/* Resources & Downloads Section */}
        <div className="mb-12">
          <ResourcesDownloadSection />
        </div>

        {/* Know Your Rights Visual Card */}
        <div className="mb-12">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚖️</span>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Know Your Rights Under the Funeral Rule
                </h2>
              </div>
              <p className="text-muted-foreground mb-6">
                The Federal Trade Commission's Funeral Rule protects consumers when arranging funeral services. Understanding these rights helps families avoid unnecessary costs and pressure during an emotional time.
              </p>
              <img src="/images/Know-Your-Rights-When-Arranging-a-Funeral.png" alt="Know Your Rights When Arranging a Funeral - Federal protections under the FTC Funeral Rule including requesting price lists, choosing only what you want, declining unwanted items, buying from any provider, receiving itemized pricing, and understanding embalming is usually not required" className="w-full rounded-lg border border-border shadow-sm mb-6" />
              <div className="flex flex-wrap gap-3">
                <a href="/guides/Know-Your-Rights-When-Arranging-a-Funeral.pdf" download className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm">
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
                <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm">
                  <ExternalLink className="h-4 w-4" />
                  Report a Concern (FTC)
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Helpful Resources
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8">
          Quick guides, trusted tools, and important information to help you and your family feel prepared.
        </p>
        
        <div className="space-y-6">
          {resourceSections.map((section, sectionIndex) => <div key={sectionIndex} className="bg-white border border-border rounded-xl shadow-sm p-5 md:p-6">
              <h2 className="text-lg md:text-xl font-semibold text-foreground mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{section.icon}</span>
                {section.title}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-4">{section.description}</p>
              
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, itemIndex) => <AccordionItem key={itemIndex} value={`section-${sectionIndex}-item-${itemIndex}`} className="border-b last:border-b-0">
                    <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground py-3 hover:no-underline">
                      {item.name}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-muted-foreground pb-3">
                      <div className="space-y-2">
                        {typeof item.description === 'string' ? <p>{item.description}</p> : item.description}
                        {item.link && (item.isDownload ? <a href={item.link} download className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                              Download PDF <Download className="h-3 w-3" />
                            </a> : item.isInternal ? <Link to={item.link} className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                              Learn more <ExternalLink className="h-3 w-3" />
                            </Link> : <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 font-medium">
                              Visit resource <ExternalLink className="h-3 w-3" />
                            </a>)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>)}
              </Accordion>
            </div>)}
        </div>

        <div className="mt-8 bg-muted/30 border border-border rounded-xl p-6">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-3">Need More Help?</h3>
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Our team is here to support you through every step of the planning process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact">
              
            </Link>
            <Link to="/faq">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Common Questions
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>;
};
export default Resources;