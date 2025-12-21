import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react';
import { BackNavigation } from '@/components/BackNavigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqSections = [
    {
      title: "Funeral & Preplanning Basics",
      icon: "🕊️",
      questions: [
        {
          q: "What is funeral preplanning and why do people do it?",
          a: (
            <>
              Funeral preplanning means making choices about your funeral and burial or cremation <strong>before</strong> they are needed. It helps:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Make sure your wishes are known and followed</li>
                <li>Reduce stress and guesswork for your family</li>
                <li>Sometimes control or lock in costs</li>
              </ul>
              <a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Learn more from the FTC <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "At what age should I plan my funeral?",
          a: "There is no \"right\" age. Many people start once they have dependents, own a home, or simply want to be prepared. Planning early gives you more control and saves your family from hard decisions later."
        },
        {
          q: "Should I prepay my funeral or just prearrange it?",
          a: (
            <>
              Prepaying can lock in today's prices, but it also means your money is tied to a specific provider or product. Prearranging without prepaying still gives your family a clear plan. If you prepay, check:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>How the money is held (trust or insurance)</li>
                <li>What happens if the funeral home changes ownership or closes</li>
                <li>Any cancellation or transfer rules</li>
              </ul>
              <a href="https://consumer.ftc.gov/articles/planning-your-own-funeral" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                FTC guidance on prepaid funerals <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "How can I compare funeral homes?",
          a: (
            <>
              Ask each funeral home for a <strong>General Price List (GPL)</strong>. In the United States, they are required by law to give you one if you ask. Compare:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Basic services fee</li>
                <li>Casket and urn prices</li>
                <li>Embalming and preparation costs</li>
                <li>Viewing and ceremony costs</li>
                <li>Any "package" vs individual line-item prices</li>
              </ul>
            </>
          )
        }
      ]
    },
    {
      title: "Financial Tools & Terms",
      icon: "💰",
      questions: [
        {
          q: "What is a Payable on Death (POD) beneficiary and why is it important?",
          a: (
            <>
              A Payable on Death (POD) beneficiary is a person you name on a bank account so they receive the money <strong>right away</strong> when you die. The money passes directly to them and usually <strong>avoids probate</strong>.
              <br /><br />
              To set it up:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Ask your bank for a POD or beneficiary form</li>
                <li>List the person's full name and relationship</li>
                <li>Return the form to the bank</li>
              </ul>
              <p className="mt-2">It is usually free and is one of the simplest ways to help your loved ones get access to cash quickly.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Prepaid Contracts & Funeral Trusts",
      icon: "📋",
      questions: [
        {
          q: "What is a prepaid funeral plan?",
          a: (
            <>
              A prepaid funeral plan is a contract where you pay now for some or all of your future funeral services. The money is typically placed in a trust or an insurance policy.
              <br /><br />
              <strong>Benefits:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>May lock in today's prices</li>
                <li>Reduces decisions and payments for your family later</li>
              </ul>
              <strong className="block mt-2">Risks:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>The provider could change ownership or close</li>
                <li>Contract terms can limit refunds or transfers</li>
              </ul>
            </>
          )
        },
        {
          q: "How does Medicaid treat prepaid funeral plans?",
          a: (
            <>
              In many states, certain <strong>irrevocable</strong> prepaid funeral trusts are not counted as assets for Medicaid, which can help people qualify for benefits. The rules are very state-specific.
              <p className="mt-2 text-sm italic">Always check with your state's Medicaid office or an elder law attorney before making these decisions.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Digital Legacy & Online Accounts",
      icon: "💻",
      questions: [
        {
          q: "How can my family access my Apple iPhone after I die?",
          a: (
            <>
              Apple offers a <strong>Legacy Contact</strong> feature:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>On your iPhone, go to: Settings → [Your Name] → Sign-In & Security → Legacy Contact</li>
                <li>Add a trusted person as your Legacy Contact</li>
                <li>Share the access key with them and tell them where to find it</li>
              </ul>
              <p className="mt-2">After you pass, they will need the key and your death certificate to request access.</p>
              <a href="https://support.apple.com/en-us/102431" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Apple Legacy Contact instructions <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "How can my family access my Google or social media accounts?",
          a: (
            <>
              Each platform has its own rules:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Google:</strong> Use Inactive Account Manager to say who can access your account and what they can see.</li>
                <li><strong>Facebook:</strong> You can pick a Legacy Contact or choose to have your account deleted after death.</li>
                <li><strong>Other platforms:</strong> Check the account's security or legacy settings for options like memorialize, close, or transfer.</li>
              </ul>
            </>
          )
        },
        {
          q: "How should I store passwords for my heirs?",
          a: (
            <>
              Options:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Use a password manager (such as 1Password or Bitwarden) and make sure your executor knows how to access it.</li>
                <li>Or write down key login information and store it in a safe place (safe deposit box, home safe).</li>
              </ul>
              <p className="mt-2">In your planning documents, explain <strong>where</strong> this information is stored.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Practical Steps After a Death",
      icon: "📞",
      questions: [
        {
          q: "Who should my family notify first when someone dies?",
          a: (
            <>
              In most situations, the order is:
              <ol className="list-decimal ml-6 mt-2 space-y-1">
                <li>Doctor, hospice, or emergency services (for official pronouncement of death)</li>
                <li>Funeral home or mortuary</li>
                <li>Immediate family</li>
                <li>Employer</li>
                <li>Insurance companies</li>
                <li>Social Security and pension providers</li>
              </ol>
              <p className="mt-2">This can vary depending on where the death occurs, but this list gives families a clear starting point.</p>
            </>
          )
        },
        {
          q: "How many death certificates should my family order?",
          a: (
            <>
              A common recommendation is <strong>10–15 certified copies</strong>. Different organizations may need their own copy, including:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Banks and investment firms</li>
                <li>Life insurance companies</li>
                <li>Pension and retirement plans</li>
                <li>Property and title transfers</li>
              </ul>
              <p className="mt-2">It is easier to order more at the beginning than to go back later.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Travel & Out-of-State Death",
      icon: "✈️",
      questions: [
        {
          q: "What happens if someone dies while traveling far from home?",
          a: (
            <>
              When a death occurs away from home—whether in another state or country—the logistics can be overwhelming:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Transportation of remains can cost thousands of dollars</li>
                <li>International paperwork, language barriers, and local laws add delays</li>
                <li>Families often have to make urgent decisions during a crisis</li>
              </ul>
              <p className="mt-2">Planning ahead with travel death protection can save your family from these burdens.</p>
              <Link to="/travel-protection" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Learn about Travel Death Protection <ExternalLink className="h-3 w-3" />
              </Link>
            </>
          )
        },
        {
          q: "What is travel death protection?",
          a: (
            <>
              Travel death protection is a one-time payment plan that covers:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Transportation of remains back home</li>
                <li>International and out-of-state coordination</li>
                <li>Paperwork and local requirements</li>
                <li>Optional cremation and return of ashes</li>
              </ul>
              <p className="mt-2">It works worldwide and is paid once, not monthly. The company handles the details so your family doesn't have to.</p>
              <Link to="/travel-protection" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Learn more about this optional planning tool <ExternalLink className="h-3 w-3" />
              </Link>
            </>
          )
        },
        {
          q: "Who should consider travel death protection?",
          a: (
            <>
              This is especially useful for:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Frequent travelers</li>
                <li>Snowbirds who spend part of the year in another state</li>
                <li>Retirees who travel regularly</li>
                <li>Military families stationed away from home</li>
                <li>Anyone with family in other states or countries</li>
              </ul>
              <p className="mt-2 text-sm italic">This is an optional planning tool, not a requirement.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Unique Considerations & Extra Resources",
      icon: "🎖️",
      questions: [
        {
          q: "What special benefits are available for veterans?",
          a: (
            <>
              Eligible veterans may receive:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Burial in a national cemetery (with no cost for the grave, opening/closing, or headstone)</li>
                <li>A government headstone or marker</li>
                <li>A burial flag and sometimes a Presidential Memorial Certificate</li>
              </ul>
              <a href="https://www.va.gov/burials-memorials/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Learn more about VA burial benefits <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "How do I plan for my pets?",
          a: (
            <>
              Steps:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Choose a trusted person willing to care for your pet.</li>
                <li>Talk with them ahead of time and confirm they agree.</li>
                <li>In your will or trust, name this caregiver and, if possible, leave some money for the pet's care.</li>
              </ul>
              <p className="mt-2">In some states you can create a <strong>pet trust</strong> for long-term care.</p>
            </>
          )
        },
        {
          q: "Where can I find reliable information about funerals and planning?",
          a: (
            <>
              Good starting points:
              <ul className="list-none space-y-2 mt-2">
                <li>
                  <a href="https://consumer.ftc.gov/funerals" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Federal Trade Commission (FTC) funerals info <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://funerals.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Funeral Consumers Alliance <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a href="https://www.va.gov/burials-memorials/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    VA burial and memorial benefits <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              </ul>
            </>
          )
        }
      ]
    },
    {
      title: "Funeral Planning & Consumer Rights",
      icon: "⚖️",
      description: "Educational information based on FTC consumer guidance. Not legal advice.",
      source: "https://consumer.ftc.gov/articles/shopping-funeral-services",
      questions: [
        {
          q: "What is the Funeral Rule?",
          a: "The Funeral Rule is a federal law that protects consumers when arranging funeral services. It requires funeral providers to give clear pricing and allows families to choose only what they want.",
          category: "Rights"
        },
        {
          q: "Do I have to buy everything the funeral home offers?",
          a: "No. You can decline any service or item you do not want.",
          category: "Rights"
        },
        {
          q: "Can a funeral home require embalming?",
          a: "Usually no. Embalming is rarely required by law, and funeral homes must disclose this.",
          category: "Burial"
        },
        {
          q: "Do I have to buy a casket from the funeral home?",
          a: "No. Funeral homes must accept caskets or urns purchased elsewhere.",
          category: "Rights"
        },
        {
          q: "Can I ask for prices in writing?",
          a: "Yes. You have the right to receive a General Price List (GPL) that shows itemized pricing.",
          category: "Pricing"
        },
        {
          q: "Where can I report a concern?",
          a: (
            <>
              You can report concerns to the Federal Trade Commission at:{" "}
              <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                reportfraud.ftc.gov
              </a>
            </>
          ),
          category: "Rights"
        },
        {
          q: "What price lists am I entitled to receive?",
          a: (
            <>
              Funeral homes must provide:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>General Price List (GPL)</li>
                <li>Casket Price List</li>
                <li>Outer Burial Container Price List</li>
              </ul>
              <p className="mt-2">You can ask for these before discussing arrangements.</p>
            </>
          ),
          category: "Pricing"
        },
        {
          q: "Do I have to buy a vault or burial container?",
          a: "Not always. Vaults or grave liners are often required by cemeteries, not by law. The funeral home must explain this clearly.",
          category: "Burial"
        },
        {
          q: "Are cremation services less expensive?",
          a: "Often, yes. Direct cremation usually costs less than traditional burial. Prices vary by provider and services selected.",
          category: "Cremation"
        },
        {
          q: "Can I plan and pay for funeral services in advance?",
          a: "Yes. This is called pre-need planning. You can document your wishes and prepay through insurance or funeral trusts. Always review refund and transfer terms.",
          category: "Planning"
        },
        {
          q: "What happens if I change my mind after prepaying?",
          a: (
            <>
              It depends on the contract. Some plans are revocable, others are not. Always ask:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Can I cancel?</li>
                <li>Can I transfer providers?</li>
                <li>Are there fees or penalties?</li>
              </ul>
            </>
          ),
          category: "Planning"
        },
        {
          q: "Are funeral prices regulated?",
          a: "Prices are not capped, but disclosure is regulated. Funeral homes must be transparent and truthful.",
          category: "Pricing"
        },
        {
          q: "Can I compare funeral homes before making a decision?",
          a: "Yes, and you should. You are allowed to call, ask questions, and request price lists without pressure.",
          category: "Rights"
        },
        {
          q: "Is it okay to negotiate funeral prices?",
          a: "Yes. Some prices may be negotiable, especially on packages or non-essential services.",
          category: "Pricing"
        },
        {
          q: "What is a direct burial or direct cremation?",
          a: "These options include only basic services without ceremonies or viewing. They are often the lowest-cost choices.",
          category: "Cremation"
        },
        {
          q: "Who is responsible for paying funeral costs?",
          a: (
            <>
              Payment responsibility depends on:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Prepaid arrangements</li>
                <li>Available funds</li>
                <li>Family agreements</li>
              </ul>
              <p className="mt-2">No one is personally required to pay unless they agree to.</p>
            </>
          ),
          category: "Pricing"
        },
        {
          q: "Can a funeral home refuse services if I ask questions?",
          a: "No. You have the right to ask questions and receive written pricing without being pressured.",
          category: "Rights"
        },
        {
          q: "What should I do if I think a funeral home violated the rules?",
          a: (
            <>
              You can file a complaint with:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>The Federal Trade Commission (FTC)</li>
                <li>Your state consumer protection agency</li>
              </ul>
              <a href="https://reportfraud.ftc.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                File a complaint with the FTC <ExternalLink className="h-3 w-3" />
              </a>
            </>
          ),
          category: "Rights"
        },
        {
          q: "How can planning ahead help my family?",
          a: (
            <>
              Planning:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Reduces stress</li>
                <li>Prevents overspending</li>
                <li>Ensures wishes are honored</li>
                <li>Helps avoid family conflict</li>
              </ul>
            </>
          ),
          category: "Planning"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <BackNavigation />
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Common Questions
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8">
          Answers to the questions families ask most often, in plain language.
        </p>

        <div className="mb-8">
          {/* Featured Pre-Planning Guide */}
          <div className="bg-card border-2 border-primary/20 rounded-lg p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Download className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                  Pre-Planning Your Funeral: A Gift of Peace and Clarity
                </h2>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  A comprehensive guide to help you understand the importance of pre-planning your funeral arrangements. Learn about different burial options, service types, and how to communicate your wishes to loved ones.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  size="lg" 
                  className="gap-2 whitespace-nowrap"
                  onClick={() => window.location.href = '/guide'}
                >
                  <FileText className="h-5 w-5" />
                  View Guide
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-card border border-border rounded-xl shadow-sm p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{section.icon}</span>
                {section.title}
              </h2>
              
              {section.description && (
                <p className="text-sm text-muted-foreground mb-2">{section.description}</p>
              )}
              
              {section.source && (
                <a 
                  href={section.source} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline inline-flex items-center gap-1 mb-4"
                >
                  Source: FTC Consumer Guidance <ExternalLink className="h-3 w-3" />
                </a>
              )}
              
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((qa, qIndex) => (
                  <AccordionItem 
                    key={qIndex} 
                    value={`section-${sectionIndex}-q-${qIndex}`}
                    className="border-b last:border-b-0"
                  >
                    <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground py-4 hover:no-underline">
                      {qa.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm md:text-base text-muted-foreground pb-4">
                      {qa.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        
        {/* Footer Disclaimer */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
            This information is provided for educational purposes only and is based on public consumer guidance from the Federal Trade Commission. Everlasting Funeral Advisors does not provide legal advice or funeral services directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/resources">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download the Funeral Planning Checklist
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="sm">
                Book a Planning Consultation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
