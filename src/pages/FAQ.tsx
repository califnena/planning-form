import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, ExternalLink, FileText, Search, X } from 'lucide-react';
import { BackNavigation } from '@/components/BackNavigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  // Required senior-friendly questions (always shown first)
  const requiredQuestions = [
    {
      q: "Do I need to complete everything at once?",
      a: "No. You can fill out as much or as little as you want, and come back anytime. Your progress is saved automatically."
    },
    {
      q: "Is this a legal document?",
      a: "No. This is a planning tool to organize your wishes and important information. It helps you prepare, but it is not a substitute for legal documents like a will or power of attorney."
    },
    {
      q: "Does this replace a will or lawyer?",
      a: "No. We help you organize your thoughts and preferences, but you should work with an attorney for legally binding documents like wills, trusts, and powers of attorney."
    },
    {
      q: "Do you store my legal documents?",
      a: "No. We help you record WHERE your documents are stored (like 'in my safe' or 'with my attorney'), but we do not store the actual documents."
    },
    {
      q: "Can my family see this?",
      a: "Only if you choose to share it with them. Your information is private until you decide to print it, email it, or share a link."
    },
    {
      q: "Do I have to buy funeral products here?",
      a: "No. Our planning tools are separate from any products or services. You are never required to buy anything."
    },
    {
      q: "What if I don't know the answer yet?",
      a: "That's okay. Skip any question you're not ready to answer. You can always come back later."
    },
    {
      q: "What happens if I change my mind?",
      a: "You can update your plan anytime. Just log in and make changes. We recommend reviewing your plan once a year."
    },
  ];

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
          q: "What happens to a bank account when someone dies?",
          a: (
            <>
              <p className="mb-3">When someone passes away, their bank accounts are usually <strong>frozen</strong>. This means:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Family members cannot withdraw money automatically</li>
                <li>Debit cards and checks stop working</li>
                <li>Online access is typically shut off</li>
              </ul>
              <p className="mb-3">To get the money out, one of two things must happen:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Probate:</strong> A court process that can take months and requires paperwork</li>
                <li><strong>Named beneficiary:</strong> If someone was named on the account (like a POD), they can claim the funds with a death certificate</li>
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">This is general information, not legal advice. Rules vary by state and bank.</p>
            </>
          )
        },
        {
          q: "What is a Payable on Death (POD) beneficiary?",
          a: (
            <>
              <p className="mb-3">A <strong>Payable on Death (POD)</strong> is a free way to name someone to receive your bank account money when you die.</p>
              <p className="font-medium mb-2">Key facts:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Free:</strong> Banks offer this at no cost</li>
                <li><strong>Used for:</strong> Checking, savings, and CDs</li>
                <li><strong>Avoids probate:</strong> Money goes directly to your beneficiary</li>
                <li><strong>Quick:</strong> Funds are released after showing a death certificate</li>
              </ul>
              <p>Think of it like a label on your account that says: "When I die, give this to [person's name]."</p>
            </>
          )
        },
        {
          q: "How do I add a POD to my bank account?",
          a: (
            <>
              <p className="mb-3">Adding a POD is simple and does not require a lawyer:</p>
              <ol className="list-decimal ml-6 space-y-1 mb-3">
                <li>Go to your bank (in person or call)</li>
                <li>Ask for a "Payable on Death" or "beneficiary" form</li>
                <li>Write in the person's full name</li>
                <li>Sign and return the form</li>
              </ol>
              <p className="font-medium mb-2">Good to know:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>No lawyer needed</li>
                <li>No cost</li>
                <li>You can change it anytime</li>
                <li>You can name more than one person</li>
              </ul>
            </>
          )
        },
        {
          q: "Can the POD beneficiary access my money while I am alive?",
          a: (
            <>
              <p className="mb-3"><strong>No.</strong> The person you name as a POD beneficiary has no access to your account while you are alive.</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>They cannot see your balance</li>
                <li>They cannot withdraw money</li>
                <li>They cannot make any changes</li>
              </ul>
              <p><strong>You keep full control.</strong> The POD only takes effect after you pass away. Until then, it is your account and your money.</p>
            </>
          )
        },
        {
          q: "What happens if there is no POD on a bank account?",
          a: (
            <>
              <p className="mb-3">If no beneficiary is named, the money becomes part of the estate. This means:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Probate required:</strong> A court must approve who gets the money</li>
                <li><strong>Delays:</strong> This can take weeks to months</li>
                <li><strong>Paperwork:</strong> Someone must file documents with the court</li>
                <li><strong>Stress for family:</strong> Your loved ones must handle legal steps during a difficult time</li>
              </ul>
              <p>Adding a POD now can save your family time, money, and stress later.</p>
            </>
          )
        },
        {
          q: "How do POD, Lady Bird Deed, and Trust compare?",
          a: (
            <>
              <p className="mb-4">Here is a simple comparison of three ways to pass assets without probate:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-2 pr-4 font-medium"></th>
                      <th className="text-left py-2 px-4 font-medium">POD</th>
                      <th className="text-left py-2 px-4 font-medium">Lady Bird Deed</th>
                      <th className="text-left py-2 px-4 font-medium">Trust</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Used for</td>
                      <td className="py-2 px-4">Bank accounts</td>
                      <td className="py-2 px-4">Real estate (some states)</td>
                      <td className="py-2 px-4">Any asset</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Avoids probate</td>
                      <td className="py-2 px-4">Yes</td>
                      <td className="py-2 px-4">Yes</td>
                      <td className="py-2 px-4">Yes</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Cost</td>
                      <td className="py-2 px-4">Free</td>
                      <td className="py-2 px-4">Recording fee</td>
                      <td className="py-2 px-4">Attorney fees</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Control while alive</td>
                      <td className="py-2 px-4">Full control</td>
                      <td className="py-2 px-4">Full control</td>
                      <td className="py-2 px-4">Full control</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Where to set up</td>
                      <td className="py-2 px-4">Your bank</td>
                      <td className="py-2 px-4">County recorder</td>
                      <td className="py-2 px-4">Attorney's office</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Risk level</td>
                      <td className="py-2 px-4">Low</td>
                      <td className="py-2 px-4">Medium</td>
                      <td className="py-2 px-4">Low (if done right)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">This is general information, not legal advice. Lady Bird Deeds are only available in some states.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Property & Home Planning",
      icon: "🏠",
      questions: [
        {
          q: "What is a Lady Bird Deed?",
          a: (
            <>
              <p className="mb-3">A <strong>Lady Bird Deed</strong> (also called an Enhanced Life Estate Deed) is a special type of property deed that:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Lets you keep <strong>full control</strong> of your home while you are alive</li>
                <li>Automatically transfers the home to someone after you pass</li>
                <li><strong>Avoids probate</strong> for the property</li>
                <li>Lets you sell, rent, or change your mind anytime</li>
              </ul>
              <p>Think of it as a way to say: "This home goes to [person] when I die, but until then, it is still mine."</p>
            </>
          )
        },
        {
          q: "Why is the name 'Lady Bird Deed' confusing?",
          a: (
            <>
              <p className="mb-3">The name "Lady Bird Deed" is informal. It reportedly comes from President Lyndon B. Johnson using this type of deed for his wife, Lady Bird Johnson.</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>The legal name is <strong>Enhanced Life Estate Deed</strong></li>
                <li>Many people have never heard this term</li>
                <li>The name does not explain what it does</li>
              </ul>
              <p>What matters is not the name—it is what the deed does: keeps your control and avoids probate.</p>
            </>
          )
        },
        {
          q: "When might a Lady Bird Deed be useful?",
          a: (
            <>
              <p className="mb-3">A Lady Bird Deed may be a good fit if:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>You want to <strong>avoid probate</strong> for your home</li>
                <li>You want to <strong>keep full control</strong> while you are alive</li>
                <li>Your state allows this type of deed</li>
                <li>Your family situation is straightforward</li>
              </ul>
              <p className="text-muted-foreground">This does not fit everyone. Complex situations may need a different approach.</p>
            </>
          )
        },
        {
          q: "What are the limitations of a Lady Bird Deed?",
          a: (
            <>
              <p className="mb-3">There are some important limits to be aware of:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Not available everywhere:</strong> Only some states allow this deed</li>
                <li><strong>Only for your home:</strong> It does not cover bank accounts, cars, or other property</li>
                <li><strong>Must be done correctly:</strong> Errors can cause problems later</li>
                <li><strong>Usually requires an attorney:</strong> To make sure it is set up right</li>
              </ul>
              <p className="text-sm text-muted-foreground">This is general information, not legal advice.</p>
            </>
          )
        },
        {
          q: "What if I transfer my home to my child while I am alive?",
          a: (
            <>
              <p className="mb-3">Transferring your home to a child now (instead of using a Lady Bird Deed or trust) can create problems:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Loss of control:</strong> You no longer own the home</li>
                <li><strong>Child's problems become yours:</strong> If your child gets divorced or has creditors, the home could be at risk</li>
                <li><strong>Tax issues:</strong> Your child may pay more in taxes when they sell</li>
                <li><strong>Medicaid impact:</strong> The transfer could affect your eligibility for benefits</li>
              </ul>
              <p>For these reasons, transferring property early is usually <strong>not recommended</strong> without professional advice.</p>
            </>
          )
        },
        {
          q: "What happens if I leave my home in a will?",
          a: (
            <>
              <p className="mb-3">A will tells people what you want, but it does <strong>not</strong> avoid probate. If your home is only in your will:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Probate required:</strong> The court must approve the transfer</li>
                <li><strong>Delays:</strong> This can take months</li>
                <li><strong>Costs:</strong> Court fees and possibly attorney fees</li>
                <li><strong>Stress for family:</strong> More paperwork during a hard time</li>
              </ul>
              <p>A will is still important, but other tools (like a Lady Bird Deed or trust) can help your home pass more smoothly.</p>
            </>
          )
        },
        {
          q: "What if I do no planning for my home?",
          a: (
            <>
              <p className="mb-3">If you do not plan for your home, here is what typically happens:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Probate:</strong> The court decides what happens to your home</li>
                <li><strong>Court control:</strong> A judge oversees the process</li>
                <li><strong>Delays:</strong> It can take many months</li>
                <li><strong>Higher conflict risk:</strong> Family disagreements may arise</li>
              </ul>
              <p>Even simple planning can help your family avoid these issues.</p>
            </>
          )
        },
        {
          q: "How does a trust work for a home?",
          a: (
            <>
              <p className="mb-3">A <strong>trust</strong> is a legal arrangement where your home (and other assets) are held for your benefit while you are alive, then passed to others when you die.</p>
              <p className="font-medium mb-2">Benefits:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Avoids probate:</strong> Property transfers privately</li>
                <li><strong>Keeps control:</strong> You manage everything while alive</li>
                <li><strong>Handles complexity:</strong> Good for multiple properties or complicated family situations</li>
              </ul>
              <p className="font-medium mb-2">Downsides:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Higher cost:</strong> Attorney fees to set up</li>
                <li><strong>More paperwork:</strong> Assets must be moved into the trust</li>
              </ul>
            </>
          )
        },
        {
          q: "How do property planning options compare?",
          a: (
            <>
              <p className="mb-4">Here is a comparison of common ways to plan for your home:</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b-2 border-border">
                      <th className="text-left py-2 pr-4 font-medium"></th>
                      <th className="text-left py-2 px-3 font-medium">Transfer Now</th>
                      <th className="text-left py-2 px-3 font-medium">Will Only</th>
                      <th className="text-left py-2 px-3 font-medium">Do Nothing</th>
                      <th className="text-left py-2 px-3 font-medium">Lady Bird Deed</th>
                      <th className="text-left py-2 px-3 font-medium">Trust</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Control while alive</td>
                      <td className="py-2 px-3">None</td>
                      <td className="py-2 px-3">Full</td>
                      <td className="py-2 px-3">Full</td>
                      <td className="py-2 px-3">Full</td>
                      <td className="py-2 px-3">Full</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Avoids probate</td>
                      <td className="py-2 px-3">Yes</td>
                      <td className="py-2 px-3">No</td>
                      <td className="py-2 px-3">No</td>
                      <td className="py-2 px-3">Yes</td>
                      <td className="py-2 px-3">Yes</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Cost</td>
                      <td className="py-2 px-3">Low</td>
                      <td className="py-2 px-3">Low</td>
                      <td className="py-2 px-3">None</td>
                      <td className="py-2 px-3">Medium</td>
                      <td className="py-2 px-3">Higher</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-2 pr-4 font-medium">Risk level</td>
                      <td className="py-2 px-3">High</td>
                      <td className="py-2 px-3">Medium</td>
                      <td className="py-2 px-3">High</td>
                      <td className="py-2 px-3">Low</td>
                      <td className="py-2 px-3">Low</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )
        },
        {
          q: "What is the general guidance for planning?",
          a: (
            <>
              <p className="mb-3">Here are some common approaches that may help:</p>
              <ul className="list-disc ml-6 space-y-1 mb-4">
                <li><strong>Bank accounts:</strong> Add a POD (Payable on Death) beneficiary—it is free and simple</li>
                <li><strong>Home:</strong> Consider a Lady Bird Deed if your state allows it and your situation is straightforward</li>
                <li><strong>Complex situations:</strong> A trust may be better for multiple properties, blended families, or special needs</li>
                <li><strong>Avoid gifting property early:</strong> This can create tax and legal problems</li>
              </ul>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground"><strong>Please note:</strong> This is general information only, not legal or financial advice. Rules vary by state. Speaking with a professional can help you choose the right approach for your situation.</p>
              </div>
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

  // Filter questions based on search query
  const filteredRequiredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return requiredQuestions;
    const query = searchQuery.toLowerCase();
    return requiredQuestions.filter(qa => 
      qa.q.toLowerCase().includes(query) || 
      (typeof qa.a === 'string' && qa.a.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return faqSections;
    const query = searchQuery.toLowerCase();
    return faqSections.map(section => ({
      ...section,
      questions: section.questions.filter(qa => 
        qa.q.toLowerCase().includes(query) || 
        (typeof qa.a === 'string' && qa.a.toLowerCase().includes(query))
      )
    })).filter(section => section.questions.length > 0);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const totalResults = filteredRequiredQuestions.length + 
    filteredSections.reduce((acc, section) => acc + section.questions.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <BackNavigation />
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-6">
          Answers to the questions families ask most often, in plain language.
        </p>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background text-foreground text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              maxLength={100}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-2">
              {totalResults === 0 
                ? 'No questions found. Try a different search term.' 
                : `Found ${totalResults} question${totalResults === 1 ? '' : 's'} matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* Essential Questions Section - Required senior-friendly questions */}
        {filteredRequiredQuestions.length > 0 && (
          <div className="mb-10">
            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">❓</span>
                Essential Questions
              </h2>
              <p className="text-base text-muted-foreground mb-6">
                The most important things to know before you start.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                {filteredRequiredQuestions.map((qa, qIndex) => (
                  <AccordionItem 
                    key={qIndex} 
                    value={`required-q-${qIndex}`}
                    className="border-b last:border-b-0"
                  >
                    <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-foreground py-4 hover:no-underline">
                      {qa.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground pb-4 leading-relaxed">
                      {qa.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* View All FAQs Section */}
        {filteredSections.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                {searchQuery ? 'Matching Questions' : 'All Frequently Asked Questions'}
              </h2>
              {!searchQuery && (
                <p className="text-base text-muted-foreground mb-6">
                  Browse all questions by topic, or scroll through the full list.
                </p>
              )}
            </div>
            
            <div className="space-y-6">
              {filteredSections.map((section, sectionIndex) => (
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
                        <AccordionContent className="text-base text-muted-foreground pb-4 leading-relaxed">
                          {qa.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Footer with helpful links */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mb-6">
            This information is provided for educational purposes only. Everlasting Funeral Advisors does not provide legal advice.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/guide">
              <Button size="lg" className="w-full sm:w-auto gap-2 min-h-[52px]">
                <FileText className="h-5 w-5" />
                View Planning Guide
              </Button>
            </Link>
            <Link to="/resources">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 min-h-[52px]">
                <Download className="h-5 w-5" />
                Download Checklists
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
