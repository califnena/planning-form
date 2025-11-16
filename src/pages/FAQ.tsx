import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Common Questions
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-8">
          Answers to the questions families ask most often, in plain language.
        </p>

        <div className="mb-8">
          <a 
            href="/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf" 
            download
            className="inline-block"
          >
            <Button size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Download Complete Guide (PDF)
            </Button>
          </a>
        </div>
        
        <div className="space-y-6">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white border border-border rounded-xl shadow-sm p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{section.icon}</span>
                {section.title}
              </h2>
              
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
      </div>
    </div>
  );
};

export default FAQ;
