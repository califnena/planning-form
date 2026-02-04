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
      title: "Pre-Planning Guide (Before Death)",
      icon: "📋",
      questions: [
        {
          q: "Why should I plan ahead?",
          a: (
            <>
              <p className="mb-3"><strong>Planning ahead is one of the greatest gifts you can give your family.</strong></p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>It reduces stress and confusion during a difficult time</li>
                <li>Your family will know exactly what you wanted</li>
                <li>It prevents disagreements between family members</li>
                <li>A written plan is much better than verbal wishes that can be forgotten or misunderstood</li>
              </ul>
              <p>You don't have to decide everything at once. Even a few notes are a good start.</p>
            </>
          )
        },
        {
          q: "What is the first decision I should make?",
          a: (
            <>
              <p className="mb-3"><strong>Start with your basic preference: burial or cremation.</strong></p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Burial:</strong> Your body is placed in a casket and buried in a cemetery</li>
                <li><strong>Cremation:</strong> Your body is reduced to ashes, which can be kept, scattered, or buried</li>
                <li><strong>Undecided:</strong> That's okay too—you can note that you haven't decided yet</li>
              </ul>
              <p>This choice affects cost, location, and other arrangements. It's helpful for your family to know your preference.</p>
            </>
          )
        },
        {
          q: "Do I want a service or memorial?",
          a: (
            <>
              <p className="mb-3">Think about what feels right for you:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Traditional service:</strong> A formal gathering with a viewing, ceremony, and burial or cremation</li>
                <li><strong>Memorial service:</strong> A gathering to remember you, usually after cremation or burial has already happened</li>
                <li><strong>Celebration of life:</strong> A less formal event focused on happy memories</li>
                <li><strong>No service:</strong> Some people prefer a private, simple arrangement with no public gathering</li>
              </ul>
              <p>There is no right or wrong answer. This is about what feels meaningful to you.</p>
            </>
          )
        },
        {
          q: "Where should I keep my plan?",
          a: (
            <>
              <p className="mb-3">Your plan is only helpful if your family can find it. Choose one of these options:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Physical binder:</strong> A folder or binder kept in a safe, accessible place at home (not a bank safe deposit box, which may be hard to access quickly)</li>
                <li><strong>Digital:</strong> Use our online planner to save your wishes—you can print or share it anytime</li>
              </ul>
              <p className="mb-3"><strong>Important:</strong> Tell at least one trusted person where your plan is stored.</p>
              <p>
                <Link to="/forms" className="text-primary underline hover:text-primary/80">
                  Download a printable planning form →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "What else can I include in my plan?",
          a: (
            <>
              <p className="mb-3">You can add as much or as little as you want:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Who should be notified when you pass</li>
                <li>Preferences for music, readings, or photos at a service</li>
                <li>Special requests (clothing, keepsakes, donations)</li>
                <li>Personal messages to loved ones</li>
                <li>Notes about insurance, accounts, or important documents</li>
              </ul>
              <p>You can always come back and add more later.</p>
            </>
          )
        },
        {
          q: "How do I get started?",
          a: (
            <>
              <p className="mb-3">We make it easy to begin:</p>
              <ol className="list-decimal ml-6 space-y-2 mb-3">
                <li>Start with the <Link to="/guided-action" className="text-primary underline hover:text-primary/80">Guided Planning Tool</Link>—it walks you through one small step at a time</li>
                <li>Or download a <Link to="/forms" className="text-primary underline hover:text-primary/80">printable form</Link> to fill out by hand</li>
                <li>Tell someone you trust where your plan is saved</li>
              </ol>
              <p className="text-muted-foreground text-sm mt-3"><strong>Remember:</strong> This is not legal advice. It's a simple way to organize your wishes and help your family.</p>
            </>
          )
        },
        {
          q: "Where can I print a form if I don't want to use the app?",
          a: (
            <>
              <p className="mb-3">If you prefer to write by hand, you can purchase our Printable Planning Form (EFABASIC). After purchase, you can download and print it as many times as you like.</p>
              <p>
                <Link to="/printable-form" className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80 font-medium">
                  View Printable Planning Form →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Can I print a form without using the app?",
          a: (
            <>
              <p className="mb-3">Yes. You can purchase a blank printable planning form.</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>You can print it as many times as you want</li>
                <li>You do not need to fill anything out online</li>
              </ul>
              <p>
                <Link to="/printable-form" className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80 font-medium">
                  Get the Printable Planning Form →
                </Link>
              </p>
            </>
          )
        },
      ]
    },
    {
      title: "Pre-Checklist (Minimum Preparation)",
      icon: "✅",
      questions: [
        {
          q: "Have I assigned a person in charge?",
          a: (
            <>
              <p className="mb-3"><strong>This is one of the most important steps.</strong></p>
              <p className="mb-3">Choose one trusted person to be your main contact. This person will:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Help carry out your funeral wishes</li>
                <li>Be the point of contact for funeral homes and family</li>
                <li>Make sure your plan is followed</li>
              </ul>
              <p>Write down their name and phone number in your plan.</p>
            </>
          )
        },
        {
          q: "Have I named a backup person?",
          a: (
            <>
              <p className="mb-3"><strong>A backup prevents delays if your first choice is unavailable.</strong></p>
              <p className="mb-3">Name at least one backup (two is even better). Backups step in if your primary person:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Is traveling or unreachable</li>
                <li>Has a health issue of their own</li>
                <li>Is emotionally unable to act</li>
              </ul>
              <p>Let each person know their role and where your plan is stored.</p>
            </>
          )
        },
        {
          q: "Have I located my DD-214 (military discharge papers)?",
          a: (
            <>
              <p className="mb-3"><strong>If you served in the military, this document is important.</strong></p>
              <p className="mb-3">Your DD-214 proves your service and may qualify you for:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Free burial in a national or state veterans cemetery</li>
                <li>A headstone or grave marker at no cost</li>
                <li>A burial flag and military honors</li>
              </ul>
              <p className="mb-3">Store a copy with your plan. If you can't find it, you can request a replacement from the <a href="https://www.archives.gov/veterans/military-service-records" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">National Archives</a>.</p>
              <p className="text-sm text-muted-foreground">Not applicable if you did not serve in the military.</p>
            </>
          )
        },
        {
          q: "Have I added POD beneficiaries to my bank accounts?",
          a: (
            <>
              <p className="mb-3"><strong>POD stands for "Payable on Death."</strong></p>
              <p className="mb-3">Adding a POD beneficiary to your bank account means:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>The money goes directly to the person you name—no probate needed</li>
                <li>You keep full control of the account while you're alive</li>
                <li>It's free to set up at most banks</li>
              </ul>
              <p className="mb-3">Contact your bank to add a POD beneficiary. It usually takes just a few minutes.</p>
              <p>
                <Link to="/faq?search=POD" className="text-primary underline hover:text-primary/80">
                  Learn more about POD accounts →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Have I listed my insurance policies and key accounts?",
          a: (
            <>
              <p className="mb-3"><strong>Your family needs to know what exists and where to find it.</strong></p>
              <p className="mb-3">Make a simple list that includes:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Life insurance policies (company name, policy number)</li>
                <li>Bank and investment accounts</li>
                <li>Retirement accounts (401k, IRA, pension)</li>
                <li>Property deeds or car titles</li>
              </ul>
              <p className="mb-3">You don't need account balances—just enough information so your family can locate these accounts.</p>
              <p>
                <Link to="/preplandashboard/financial" className="text-primary underline hover:text-primary/80">
                  Add accounts to your plan →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Quick checklist summary",
          a: (
            <>
              <p className="mb-3"><strong>These five steps cover the basics:</strong></p>
              <ul className="space-y-2 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Primary person in charge named</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Backup person(s) named</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>DD-214 located (if veteran)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>POD beneficiaries added to bank accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Insurance and key accounts listed</span>
                </li>
              </ul>
              <p className="text-muted-foreground text-sm">Completing even a few of these steps can save your family significant time and stress.</p>
            </>
          )
        },
      ]
    },
    {
      title: "Person in Charge (Critical Section)",
      icon: "👤",
      questions: [
        {
          q: "Why is assigning a person in charge so important?",
          a: (
            <>
              <p className="mb-3"><strong>This is one of the most helpful things you can do for your family.</strong></p>
              <p className="mb-3">When you name a person in charge:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>They coordinate decisions after your death</li>
                <li>They help prevent confusion and conflict between family members</li>
                <li>Funeral homes and others know who to contact first</li>
                <li>Your wishes are more likely to be followed</li>
              </ul>
              <p><strong>Important:</strong> This person is not responsible for your debts. They are simply helping carry out your plan.</p>
            </>
          )
        },
        {
          q: "Who should I choose as my primary person?",
          a: (
            <>
              <p className="mb-3"><strong>Pick someone you trust who can handle responsibility during a difficult time.</strong></p>
              <p className="mb-3">Good qualities to look for:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Someone who can stay calm under stress</li>
                <li>Someone who is organized and reliable</li>
                <li>Someone who will respect your wishes, even if they disagree</li>
                <li>Someone who lives nearby (helpful but not required)</li>
              </ul>
              <p>This is often a spouse, adult child, sibling, or close friend.</p>
            </>
          )
        },
        {
          q: "Why do I need a backup person?",
          a: (
            <>
              <p className="mb-3"><strong>A backup is essential in case your first choice cannot act.</strong></p>
              <p className="mb-3">Your primary person might be unavailable because:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>They are traveling or unreachable</li>
                <li>They have their own health emergency</li>
                <li>They are too emotionally overwhelmed to act</li>
                <li>They pass away before you do</li>
              </ul>
              <p className="mb-3">Name at least one backup. Two backups is even better.</p>
              <p className="text-muted-foreground text-sm"><strong>Remember:</strong> Only one person should lead at a time. The order you list them matters.</p>
            </>
          )
        },
        {
          q: "What information should I collect for each person?",
          a: (
            <>
              <p className="mb-3"><strong>For each person (primary and backups), write down:</strong></p>
              <div className="bg-muted/50 rounded-lg p-4 mb-3">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>Full name</strong> — Their legal name</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>Relationship</strong> — Spouse, daughter, son, friend, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>Phone number</strong> — A number they answer regularly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>Email address</strong> — If they use email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-medium">•</span>
                    <span><strong>City and state</strong> — Where they live</span>
                  </li>
                </ul>
              </div>
              <p>
                <Link to="/preplandashboard/contacts" className="text-primary underline hover:text-primary/80">
                  Add your contacts to your plan →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Is this the same as a legal executor?",
          a: (
            <>
              <p className="mb-3"><strong>Not exactly, but it's related.</strong></p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>A <strong>legal executor</strong> is named in your will and handles your estate after death (property, debts, legal matters)</li>
                <li>A <strong>person in charge</strong> (as described here) focuses on funeral arrangements and carrying out your wishes</li>
                <li>They can be the same person, but don't have to be</li>
              </ul>
              <p className="mb-3">This planning tool helps you name who should coordinate funeral arrangements. It does not replace a will.</p>
              <p className="text-muted-foreground text-sm">For legal matters, consult an attorney.</p>
            </>
          )
        },
        {
          q: "What if my person in charge lives far away?",
          a: (
            <>
              <p className="mb-3"><strong>Distance is not a disqualifier.</strong></p>
              <p className="mb-3">Much of the coordination can be done by phone and email. However:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Consider naming a local backup who can handle immediate needs</li>
                <li>Make sure your plan includes clear instructions so decisions are easier</li>
                <li>Provide contact information for your funeral home (if pre-arranged)</li>
              </ul>
              <p>A clear written plan makes distance less of a barrier.</p>
            </>
          )
        },
        {
          q: "Do I need to tell the people I select?",
          a: (
            <>
              <p className="mb-3"><strong>Yes. This is very important.</strong></p>
              <p className="mb-3">Let each person know:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>That you've named them in your plan</li>
                <li>What their role is (primary or backup)</li>
                <li>Where your plan is stored (binder, digital, etc.)</li>
              </ul>
              <p className="mb-3">If they don't know, they can't act. A written plan that no one knows about doesn't help.</p>
              <p className="bg-primary/10 rounded-lg p-3 text-sm"><strong>Tip:</strong> Have a simple conversation: "I've written down my wishes. I'd like you to be my main contact if something happens to me. Is that okay with you?"</p>
            </>
          )
        },
        {
          q: "Person in Charge checklist",
          a: (
            <>
              <p className="mb-3"><strong>Use this checklist to confirm you've completed this section:</strong></p>
              <ul className="space-y-2 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Primary person in charge named</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>First backup person named</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Second backup named (optional but recommended)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Contact information added for each person</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Each person notified and knows where the plan is stored</span>
                </li>
              </ul>
              <p>
                <Link to="/preplandashboard/contacts" className="text-primary underline hover:text-primary/80">
                  Add your Person in Charge to your plan →
                </Link>
              </p>
            </>
          )
        },
      ]
    },
    {
      title: "After-Death Plan (What Happens Next)",
      icon: "🕊️",
      questions: [
        {
          q: "What happens immediately after someone passes away?",
          a: (
            <>
              <p className="mb-3"><strong>The first hours are about taking care of immediate needs.</strong></p>
              <p className="mb-3">Here's what typically happens:</p>
              <ol className="list-decimal ml-6 space-y-2 mb-3">
                <li>A doctor or medical professional confirms the death</li>
                <li>The funeral home is contacted to take care of the body</li>
                <li>Close family members are notified</li>
                <li>Someone takes charge to coordinate next steps</li>
              </ol>
              <p>If there is a written plan, this process is much smoother. If not, decisions must be made quickly during an emotional time.</p>
            </>
          )
        },
        {
          q: "What does the person in charge do?",
          a: (
            <>
              <p className="mb-3"><strong>They become the main point of contact and coordinator.</strong></p>
              <p className="mb-3">The person in charge will:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Contact the funeral home and follow your wishes</li>
                <li>Notify family, friends, and important contacts</li>
                <li>Locate important documents (plan, will, insurance policies)</li>
                <li>Help coordinate the service or memorial</li>
                <li>Handle immediate decisions that need to be made</li>
              </ul>
              <p className="bg-muted/50 rounded-lg p-3 text-sm"><strong>This is why naming someone ahead of time matters.</strong> Without a named person, family members may disagree about who should lead.</p>
            </>
          )
        },
        {
          q: "What documents and instructions will be needed?",
          a: (
            <>
              <p className="mb-3"><strong>Having these items ready saves time and stress.</strong></p>
              <p className="mb-3">The person in charge will look for:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Your written wishes (burial/cremation, service preferences)</li>
                <li>A list of people to notify</li>
                <li>Insurance policies (especially life insurance)</li>
                <li>Legal documents (will, trust, power of attorney)</li>
                <li>DD-214 if you served in the military</li>
                <li>Social Security information</li>
              </ul>
              <p>If these are organized in one place (like a binder or digital plan), everything moves faster.</p>
            </>
          )
        },
        {
          q: "What benefits and payments need to be reported?",
          a: (
            <>
              <p className="mb-3"><strong>Some programs need to know right away.</strong></p>
              <p className="mb-3">Within the first few days or weeks, the person in charge should:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Notify Social Security (stops payments and may trigger a small death benefit)</li>
                <li>Contact pension or retirement accounts</li>
                <li>Notify life insurance companies to file a claim</li>
                <li>Contact banks and credit card companies</li>
                <li>Report the death to Medicare or Medicaid if applicable</li>
              </ul>
              <p className="mb-3">The funeral home often helps with the Social Security notification.</p>
              <p>
                <Link to="/public-benefits" className="text-primary underline hover:text-primary/80">
                  Learn about Social Security and Medicaid benefits →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "How does having a plan make this easier?",
          a: (
            <>
              <p className="mb-3"><strong>A clear plan reduces stress during one of the hardest times.</strong></p>
              <p className="mb-3">When you've planned ahead:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Your person in charge knows exactly who to call</li>
                <li>Important documents are easy to find</li>
                <li>Your wishes are clear, so there's no guessing</li>
                <li>Family members are less likely to disagree</li>
                <li>Decisions can be made quickly without extra worry</li>
              </ul>
              <p className="mb-3">Even a simple written plan—kept where someone can find it—makes a big difference.</p>
              <p className="bg-primary/10 rounded-lg p-3 text-sm"><strong>A gift to your family:</strong> Planning ahead isn't about you—it's about making things easier for the people you love.</p>
            </>
          )
        },
        {
          q: "What if there is no plan in place?",
          a: (
            <>
              <p className="mb-3"><strong>Things can still be handled, but it takes more effort.</strong></p>
              <p className="mb-3">Without a plan:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Family must decide who is in charge (which can cause conflict)</li>
                <li>Decisions about burial, cremation, and services must be made quickly</li>
                <li>Important documents may be hard to find</li>
                <li>There's more stress during an already difficult time</li>
              </ul>
              <p className="mb-3">If you're in this situation now, we can help.</p>
              <p>
                <Link to="/after-death" className="text-primary underline hover:text-primary/80">
                  Go to the After-Death Guide →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "What should I do right now to prepare?",
          a: (
            <>
              <p className="mb-3"><strong>Even small steps help.</strong></p>
              <ol className="list-decimal ml-6 space-y-2 mb-3">
                <li>Name a person in charge (and at least one backup)</li>
                <li>Write down your basic wishes (burial or cremation, service or no service)</li>
                <li>Keep important documents in one place</li>
                <li>Tell your person in charge where to find your plan</li>
              </ol>
              <p className="mb-3">You don't have to do everything at once. Start with what feels manageable.</p>
              <p>
                <Link to="/guided-action" className="text-primary underline hover:text-primary/80">
                  Start with one small step →
                </Link>
              </p>
            </>
          )
        },
      ]
    },
    {
      title: "After-Death Checklist (Execution)",
      icon: "📋",
      questions: [
        {
          q: "First 24–48 hours: What do I need to do?",
          a: (
            <>
              <p className="mb-3"><strong>The first two days involve several important steps.</strong></p>
              <p className="mb-3">Use this checklist to guide you:</p>
              <ul className="space-y-2 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span><strong>Confirm death was legally pronounced</strong> — A doctor, hospice nurse, or medical examiner must confirm and sign the death certificate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span><strong>Contact the person in charge</strong> — Notify the person named to coordinate arrangements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span><strong>Locate instructions and documents</strong> — Find the written plan, will, and insurance policies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span><strong>Call a funeral home</strong> — They will guide you on transporting the body and next steps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span><strong>Secure the home and property</strong> — Lock doors, secure valuables, and collect mail</span>
                </li>
              </ul>
              <p className="text-muted-foreground text-sm">If the death was unexpected or occurred outside a hospital, you may need to call 911 or the non-emergency police line first.</p>
            </>
          )
        },
        {
          q: "How is death legally confirmed?",
          a: (
            <>
              <p className="mb-3"><strong>A medical professional must officially pronounce the death.</strong></p>
              <p className="mb-3">This can be done by:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>A doctor at a hospital or nursing home</li>
                <li>A hospice nurse (if the person was in hospice care)</li>
                <li>A medical examiner or coroner (for unexpected deaths)</li>
              </ul>
              <p className="mb-3">This step is required before the funeral home can take the body and before a death certificate can be issued.</p>
              <p className="text-muted-foreground text-sm">You do not need to do this yourself—medical staff or emergency responders will handle it.</p>
            </>
          )
        },
        {
          q: "Who should I notify first?",
          a: (
            <>
              <p className="mb-3"><strong>Start with immediate family and the person in charge.</strong></p>
              <p className="mb-3">In the first day or two:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Contact the named person in charge (if that's not you)</li>
                <li>Notify close family members</li>
                <li>Notify the person's employer (if still working)</li>
                <li>Contact their house of worship (if applicable)</li>
              </ul>
              <p className="mb-3">Other notifications (insurance, banks, government) can wait a few days.</p>
              <p className="text-muted-foreground text-sm">The funeral home will often help notify Social Security.</p>
            </>
          )
        },
        {
          q: "What documents should I locate right away?",
          a: (
            <>
              <p className="mb-3"><strong>Finding these items early will help with arrangements.</strong></p>
              <p className="mb-3">Look for:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Written plan or final wishes document</li>
                <li>Life insurance policies</li>
                <li>Will or trust documents</li>
                <li>DD-214 (military discharge papers, if applicable)</li>
                <li>Social Security card or number</li>
                <li>Birth certificate and marriage certificate</li>
              </ul>
              <p className="mb-3">Check the usual places: a home safe, filing cabinet, or with an attorney.</p>
              <p>
                <Link to="/preplandashboard/legal" className="text-primary underline hover:text-primary/80">
                  Learn about organizing important documents →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "How do I secure the home and personal property?",
          a: (
            <>
              <p className="mb-3"><strong>Protect the home while focusing on arrangements.</strong></p>
              <p className="mb-3">Steps to take:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Lock all doors and windows</li>
                <li>Collect mail regularly (or put it on hold)</li>
                <li>Secure jewelry, cash, and important documents</li>
                <li>If the person lived alone, check on pets</li>
                <li>Turn off appliances if the home will be empty</li>
              </ul>
              <p className="text-muted-foreground text-sm">If the person was renting, review the lease about notice requirements.</p>
            </>
          )
        },
        {
          q: "When should I notify benefits and insurance?",
          a: (
            <>
              <p className="mb-3"><strong>Most notifications can happen within the first week.</strong></p>
              <p className="mb-3">Notify these as soon as you can:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Social Security</strong> — Benefits stop at death; a small lump sum may be available for survivors</li>
                <li><strong>Pension or retirement plans</strong> — Contact the plan administrator</li>
                <li><strong>Life insurance companies</strong> — File a claim to receive the benefit</li>
                <li><strong>Banks and credit unions</strong> — Notify them; they will freeze accounts</li>
                <li><strong>Medicare or Medicaid</strong> — Coverage ends at death</li>
              </ul>
              <p className="mb-3"><strong>Important:</strong> Some benefits (like Social Security payments) stop immediately. The estate may need to return payments received after the date of death.</p>
              <p>
                <Link to="/public-benefits" className="text-primary underline hover:text-primary/80">
                  Learn about survivor benefits →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Are there survivor benefits I should apply for?",
          a: (
            <>
              <p className="mb-3"><strong>Yes, some programs offer help to surviving family members.</strong></p>
              <p className="mb-3">Common survivor benefits:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Social Security</strong> — Spouses and dependent children may qualify for monthly survivor benefits</li>
                <li><strong>Veteran benefits</strong> — Surviving spouses of veterans may qualify for burial benefits and pensions</li>
                <li><strong>Life insurance</strong> — Beneficiaries should file a claim</li>
                <li><strong>Retirement accounts</strong> — Named beneficiaries can claim 401(k), IRA, or pension funds</li>
              </ul>
              <p className="mb-3">These benefits are not automatic—you must apply for them.</p>
              <p>
                <Link to="/public-benefits" className="text-primary underline hover:text-primary/80">
                  Learn about Social Security survivor benefits →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "After-Death Checklist summary",
          a: (
            <>
              <p className="mb-3"><strong>Use this as your guide for the first 48 hours:</strong></p>
              <ul className="space-y-2 mb-3">
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Death legally pronounced</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Person in charge notified</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Plan, will, and insurance located</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Funeral home contacted</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Home and property secured</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Close family members notified</span>
                </li>
              </ul>
              <p className="mb-3 text-muted-foreground text-sm">Benefits and insurance notifications can follow in the first week.</p>
              <p>
                <Link to="/after-death" className="text-primary underline hover:text-primary/80">
                  Use our step-by-step After-Death Guide →
                </Link>
              </p>
            </>
          )
        },
      ]
    },
    {
      title: "Money, Bills, and Debt",
      icon: "💵",
      questions: [
        {
          q: "What happens to my debt when I die?",
          a: (
            <>
              <p className="mb-3">When you pass away, your debts are usually paid from your estate—the money and property you leave behind.</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Creditors are paid from your estate first</li>
                <li>What remains goes to your heirs</li>
                <li>If there is not enough money, some debts simply go unpaid</li>
              </ul>
              <p><strong>Your family does not automatically inherit your debt.</strong></p>
            </>
          )
        },
        {
          q: "What happens to my medical bills?",
          a: (
            <>
              <p className="mb-3">Medical bills are treated like other debts:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Paid from your estate if there is money available</li>
                <li>Your family is generally not responsible for paying them</li>
                <li>The hospital or provider may file a claim against your estate</li>
              </ul>
            </>
          )
        },
        {
          q: "Will my family have to pay my debt?",
          a: (
            <>
              <p className="mb-3"><strong>In most cases, no.</strong> Your family is not responsible for your debts unless:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>They co-signed a loan or account</li>
                <li>They are a joint account holder</li>
                <li>State law requires it (rare, and usually only for spouses)</li>
              </ul>
              <p className="mt-3">Debt collectors may contact your family, but that does not mean they owe anything.</p>
            </>
          )
        },
        {
          q: "What if there is no money in my estate?",
          a: (
            <>
              <p className="mb-3">If your estate has no money or assets:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Creditors cannot collect from your family</li>
                <li>The debts usually go unpaid and are written off</li>
                <li>This is more common than people think</li>
              </ul>
            </>
          )
        },
        {
          q: "Can creditors take my house or car?",
          a: (
            <>
              <p className="mb-3">It depends on the situation:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>If there is a loan on the car or house, the lender may repossess it if payments stop</li>
                <li>If the home is paid off, it becomes part of your estate</li>
                <li>Some assets may be protected depending on state law</li>
              </ul>
              <p>If someone inherits the house or car, they may be able to take over the payments.</p>
            </>
          )
        },
        {
          q: "What happens to my credit cards?",
          a: (
            <>
              <p className="mb-3">Credit card debt is paid from your estate:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Your family is not responsible (unless they were a joint account holder)</li>
                <li>Authorized users are not responsible for the balance</li>
                <li>If the estate has no money, the debt often goes unpaid</li>
              </ul>
            </>
          )
        },
        {
          q: "What if my family keeps getting collection calls?",
          a: (
            <>
              <p className="mb-3">Your family can:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Ask the collector to stop calling</li>
                <li>Request proof of the debt</li>
                <li>Explain they are not responsible</li>
              </ul>
              <p>Collectors can contact family to find the executor, but they cannot demand payment from someone who does not owe the debt.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Bank Accounts, Phone, and Digital Access",
      icon: "📱",
      questions: [
        {
          q: "Will my family be able to access my bank accounts?",
          a: (
            <>
              <p className="mb-3"><strong>Not automatically.</strong> When you pass away:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Accounts are usually frozen</li>
                <li>Your family will need legal authority to access them</li>
                <li>A named beneficiary (POD) can claim funds with a death certificate</li>
              </ul>
              <p>Planning ahead—like adding a POD—helps avoid delays.</p>
            </>
          )
        },
        {
          q: "What happens if my accounts are frozen?",
          a: (
            <>
              <p className="mb-3">Frozen accounts mean:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>No withdrawals, transfers, or payments</li>
                <li>Automatic bills may stop being paid</li>
                <li>Someone must go through probate or show beneficiary paperwork</li>
              </ul>
              <p>This can take weeks or months without planning.</p>
            </>
          )
        },
        {
          q: "What happens to my phone and phone number?",
          a: (
            <>
              <p className="mb-3">Your phone account may be:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Canceled by the carrier after non-payment</li>
                <li>Transferred to a family member (if they contact the carrier)</li>
                <li>Kept active temporarily to receive important calls or codes</li>
              </ul>
              <p>Let someone know your carrier and account information.</p>
            </>
          )
        },
        {
          q: "How can my family access my phone if it is locked?",
          a: (
            <>
              <p className="mb-3">Access can be difficult if your phone is locked:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Apple and Google have strict policies</li>
                <li>A court order may be needed</li>
                <li>Some companies have legacy access programs</li>
              </ul>
              <p>The easiest solution is to share your passcode with a trusted person ahead of time.</p>
            </>
          )
        },
        {
          q: "Can I set up phone access ahead of time?",
          a: (
            <>
              <p className="mb-3">Yes. You can:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Share your passcode with a trusted person</li>
                <li>Set up a Legacy Contact on iPhone (Settings → [Your Name] → Sign-In & Security → Legacy Contact)</li>
                <li>Use Google Inactive Account Manager</li>
                <li>Write your passcode down and store it safely</li>
              </ul>
              <p>Planning now saves your family stress later.</p>
            </>
          )
        },
        {
          q: "What happens to email, photos, and online accounts?",
          a: (
            <>
              <p className="mb-3">Each service has its own rules:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Some accounts can be memorialized or closed</li>
                <li>Some allow a legacy contact</li>
                <li>Others may require a court order</li>
              </ul>
              <p>Consider setting up legacy contacts or writing down access instructions.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Property, Car, and Personal Belongings",
      icon: "🏠",
      questions: [
        {
          q: "What happens to my car when I die?",
          a: (
            <>
              <p className="mb-3">Your car becomes part of your estate:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Title must be transferred to the new owner</li>
                <li>If there is a loan, payments must continue or it may be repossessed</li>
                <li>A Transfer on Death (TOD) title can avoid probate in some states</li>
              </ul>
            </>
          )
        },
        {
          q: "Can someone drive or sell my car after I die?",
          a: (
            <>
              <p className="mb-3">Not without proper authority:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>The title must be transferred first</li>
                <li>An executor or administrator can handle this</li>
                <li>Insurance may not cover an unregistered driver</li>
              </ul>
            </>
          )
        },
        {
          q: "What happens to my furniture, jewelry, and personal items?",
          a: (
            <>
              <p className="mb-3">Personal belongings go through your estate:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>A will can say who gets what</li>
                <li>Without a will, state law decides</li>
                <li>Sentimental items sometimes cause family disagreements</li>
              </ul>
              <p className="mt-3">Writing down your wishes can help prevent confusion.</p>
            </>
          )
        },
        {
          q: "What if I have nobody to leave my things to?",
          a: (
            <>
              <p className="mb-3">If you have no heirs:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>You can leave items to friends or charities</li>
                <li>A will allows you to name anyone as a beneficiary</li>
                <li>Without a will, assets may go to distant relatives or the state</li>
              </ul>
            </>
          )
        },
        {
          q: "What happens if I do nothing?",
          a: (
            <>
              <p className="mb-3">If you make no plans:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>State law decides who gets your property</li>
                <li>Your estate goes through probate (court process)</li>
                <li>It may take longer and cost more</li>
                <li>Your wishes may not be followed</li>
              </ul>
            </>
          )
        },
        {
          q: "Can the state take my property?",
          a: (
            <>
              <p className="mb-3">Only in rare cases:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>If you have no heirs at all (no family, no will)</li>
                <li>The property "escheats" (goes) to the state</li>
                <li>This is uncommon—most people have at least distant relatives</li>
              </ul>
            </>
          )
        }
      ]
    },
    {
      title: "Funeral Choices and Costs",
      icon: "🕊️",
      questions: [
        {
          q: "What is cheaper: cremation or casket burial?",
          a: (
            <>
              <p className="mb-3"><strong>Cremation is usually less expensive.</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Direct cremation (no ceremony) is often the lowest-cost option</li>
                <li>Traditional burial includes more services and products</li>
                <li>Prices vary by location and provider</li>
              </ul>
              <p className="mt-3">You can always ask for a price list to compare options.</p>
            </>
          )
        },
        {
          q: "Do I need flowers?",
          a: "No. Flowers are optional. Some families ask for donations to a charity instead. There is no requirement."
        },
        {
          q: "Is a viewing required?",
          a: "No. Viewings are optional. You can have a closed casket, a memorial without the body present, or no service at all."
        },
        {
          q: "Can I keep things simple?",
          a: (
            <>
              <p className="mb-3">Yes. Simple options include:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Direct cremation or direct burial</li>
                <li>A small private gathering</li>
                <li>No formal service</li>
              </ul>
              <p className="mt-3">You are not required to have a traditional funeral.</p>
            </>
          )
        },
        {
          q: "Who decides if I do not leave instructions?",
          a: (
            <>
              <p className="mb-3">If you leave no instructions:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Your next of kin usually decides</li>
                <li>This is often a spouse, adult child, or parent</li>
                <li>Disagreements can cause stress and delays</li>
              </ul>
              <p className="mt-3">Documenting your wishes helps your family make decisions with confidence.</p>
            </>
          )
        },
        {
          q: "What happens if no one claims the body?",
          a: (
            <>
              <p className="mb-3">If no one claims the body:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>The county or state may handle the arrangements</li>
                <li>This usually means cremation or a simple burial</li>
                <li>There is typically no ceremony</li>
              </ul>
              <p className="mt-3">This is rare when someone has family or friends.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Planning Without a Will or Trust",
      icon: "📝",
      questions: [
        {
          q: "What if I don't want to pay for a will or trust?",
          a: (
            <>
              <p className="mb-3">You can still take helpful steps:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Add a POD (Payable on Death) to bank accounts—free at most banks</li>
                <li>Create a funeral preplan with Everlasting Funeral Advisors instead of informal notes</li>
                <li>Tell someone where your important documents are</li>
                <li>Name beneficiaries on insurance and retirement accounts</li>
              </ul>
              <p className="mt-3">A preplan is more reliable than loose papers.</p>
              <a href="https://everlastingfuneraladvisors.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
                Create a preplan <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "What are my options if I want to keep things simple?",
          a: (
            <>
              <p className="mb-3">Simple options that help:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Add beneficiaries to bank and retirement accounts</li>
                <li>Create a funeral preplan</li>
                <li>Tell one trusted person where your papers are</li>
              </ul>
              <p className="mt-3">These steps cost little or nothing and reduce stress for your family.</p>
            </>
          )
        },
        {
          q: "What are the minimum steps I should take?",
          a: (
            <>
              <p className="mb-3">At a minimum, consider:</p>
              <ol className="list-decimal ml-6 space-y-1">
                <li>Adding beneficiaries to accounts (POD, TOD)</li>
                <li>Creating a funeral preplan with your wishes</li>
                <li>Telling one person where your papers are</li>
              </ol>
              <p className="mt-3">These steps take little time but make a big difference.</p>
            </>
          )
        },
        {
          q: "Can I still protect my family without legal documents?",
          a: (
            <>
              <p className="mb-3">Yes, you can reduce their burden:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Use beneficiary designations on accounts</li>
                <li>Create a preplan so they know your wishes</li>
                <li>Organize and label your important documents</li>
                <li>Have conversations about what matters to you</li>
              </ul>
              <p className="mt-3">Even without a will, these steps help your family.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Trusts and Preplanning Decisions",
      icon: "⚖️",
      questions: [
        {
          q: "When is it worth paying for a trust?",
          a: (
            <>
              <p className="mb-3">A trust may be worth the cost if:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>You own property in more than one state</li>
                <li>You have a blended family or complex situation</li>
                <li>You want to avoid probate for all your assets</li>
                <li>You have a family member with special needs</li>
              </ul>
            </>
          )
        },
        {
          q: "Who usually needs a trust?",
          a: (
            <>
              <p className="mb-3">Trusts are often helpful for:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>People with significant assets</li>
                <li>Those with real estate in multiple states</li>
                <li>Families with minor children or dependents</li>
                <li>Anyone who wants to control how assets are distributed over time</li>
              </ul>
            </>
          )
        },
        {
          q: "When is a trust unnecessary?",
          a: (
            <>
              <p className="mb-3">A trust may not be needed if:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Your assets are simple (one home, a few accounts)</li>
                <li>You can use POD, TOD, and beneficiary designations</li>
                <li>Your state has simplified probate for small estates</li>
              </ul>
            </>
          )
        },
        {
          q: "Should I prepay my funeral?",
          a: (
            <>
              <p className="mb-3">Prepaying is a personal choice. It is not required.</p>
              <p className="font-medium mb-2">Possible benefits:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Lock in today's prices</li>
                <li>Reduce decisions for your family</li>
              </ul>
              <p className="font-medium mb-2">Possible downsides:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Money is tied up</li>
                <li>The funeral home could close or change</li>
                <li>Contract terms vary</li>
              </ul>
            </>
          )
        },
        {
          q: "What are the pros and cons of prepaying?",
          a: (
            <>
              <p className="font-medium mb-2">Pros:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Can lock in prices</li>
                <li>Removes burden from family</li>
                <li>May help with Medicaid planning (if irrevocable)</li>
              </ul>
              <p className="font-medium mb-2">Cons:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Funds may be hard to access or transfer</li>
                <li>Provider could go out of business</li>
                <li>Refund policies vary</li>
              </ul>
            </>
          )
        },
        {
          q: "What if prices change later?",
          a: (
            <>
              <p className="mb-3">It depends on your contract:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Some contracts lock in prices</li>
                <li>Others may require additional payment later</li>
                <li>Always read the terms carefully</li>
              </ul>
              <p className="mt-3">Ask the funeral home exactly what is guaranteed.</p>
            </>
          )
        }
      ]
    },
    {
      title: "When Someone Has Died",
      icon: "🕊️",
      questions: [
        {
          q: "What should I do first?",
          a: (
            <>
              <p className="mb-3">Take it one step at a time:</p>
              <ol className="list-decimal ml-6 space-y-1">
                <li>Call a doctor, hospice, or 911 if needed</li>
                <li>Notify close family members</li>
                <li>Contact a funeral home</li>
                <li>Locate important documents</li>
              </ol>
              <p className="mt-3">You do not have to do everything at once. Ask for help.</p>
            </>
          )
        },
        {
          q: "Who do I call?",
          a: (
            <>
              <p className="mb-3">It depends on where the death occurred:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>At home with hospice:</strong> Call hospice first</li>
                <li><strong>At home unexpectedly:</strong> Call 911</li>
                <li><strong>In a hospital or nursing home:</strong> Staff will guide you</li>
              </ul>
              <p className="mt-3">Then contact a funeral home when you are ready.</p>
            </>
          )
        },
        {
          q: "How many death certificates do I need?",
          a: (
            <>
              <p className="mb-3">A common recommendation is <strong>10–15 certified copies</strong>.</p>
              <p className="mb-2">You may need them for:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Banks and financial accounts</li>
                <li>Insurance claims</li>
                <li>Property transfers</li>
                <li>Government agencies</li>
              </ul>
              <p className="mt-3">It is easier to order more at the start than to request them later.</p>
            </>
          )
        },
        {
          q: "Where do I look for life insurance?",
          a: (
            <>
              <p className="mb-3">Check these places:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>File cabinets, safes, and important papers</li>
                <li>Email inbox (search for "policy" or "insurance")</li>
                <li>Bank statements (look for premium payments)</li>
                <li>Former employers (group life insurance)</li>
                <li>The National Association of Insurance Commissioners (NAIC) has a free policy locator</li>
              </ul>
            </>
          )
        },
        {
          q: "Can Social Security or Medicaid help with costs?",
          a: (
            <>
              <p className="mb-3">There may be limited help:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li><strong>Social Security:</strong> A one-time $255 death benefit may be available for surviving spouses or children</li>
                <li><strong>Medicaid:</strong> Some states offer burial assistance for those who qualify</li>
              </ul>
              <div className="space-y-2 mt-3">
                <a href="https://www.ssa.gov/benefits/survivors/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Social Security survivor benefits <ExternalLink className="h-3 w-3" />
                </a>
                <br />
                <a href="https://www.medicaid.gov/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  Medicaid (check your state) <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )
        },
        {
          q: "What if I cannot find documents?",
          a: (
            <>
              <p className="mb-3">If documents are missing:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Check with banks, insurance companies, and employers directly</li>
                <li>Contact the county recorder for property records</li>
                <li>Ask an attorney if you need help with probate</li>
              </ul>
              <p className="mt-3">Most records can be replaced—it just takes time.</p>
            </>
          )
        },
        {
          q: "How long does everything take?",
          a: (
            <>
              <p className="mb-3">Timelines vary:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Funeral arrangements: a few days</li>
                <li>Death certificates: 1–4 weeks</li>
                <li>Insurance claims: weeks to months</li>
                <li>Probate: months to over a year</li>
              </ul>
              <p className="mt-3">There is no rush. Handle things at your own pace.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Getting Organized the Simple Way",
      icon: "📋",
      questions: [
        {
          q: "How can I record my wishes in one place?",
          a: (
            <>
              <p className="mb-3">Everlasting Funeral Advisors provides a simple way to:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Create a funeral and end-of-life preplan</li>
                <li>Fill it out digitally or print and write by hand</li>
                <li>Save it securely</li>
                <li>Share it with a trusted person</li>
              </ul>
              <a href="https://everlastingfuneraladvisors.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Start your preplan <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "Can I share my plan with family?",
          a: (
            <>
              <p className="mb-3">Yes. You can:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Share a link with a trusted person</li>
                <li>Print a copy for your family</li>
                <li>Email a PDF to loved ones</li>
              </ul>
              <p className="mt-3">Your plan stays private until you choose to share it.</p>
            </>
          )
        },
        {
          q: "Can I update it later?",
          a: (
            <>
              <p className="mb-3">Yes. You can update your plan anytime:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Log in and make changes</li>
                <li>Download a new PDF</li>
                <li>Share the updated version</li>
              </ul>
              <p className="mt-3">We recommend reviewing your plan once a year or after major life changes.</p>
            </>
          )
        }
      ]
    },
    {
      title: "How Everlasting Funeral Advisors Can Help",
      icon: "💜",
      questions: [
        {
          q: "How can Everlasting Funeral Advisors help before I die?",
          a: (
            <>
              <p className="mb-3">We help people plan ahead without complexity:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Guidance on what matters most to plan</li>
                <li>Simple education, not legal advice</li>
                <li>Help understanding options and choices</li>
              </ul>
              <p className="font-medium mb-2">Preplanning tools:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Create a funeral and end-of-life preplan</li>
                <li>Fill it out digitally or print and write by hand</li>
                <li>Save it securely</li>
                <li>Update it anytime</li>
                <li>Share it with a trusted person</li>
              </ul>
              <p className="mb-3">Preplanning reduces stress for family, prevents confusion, and keeps wishes in one place.</p>
              <a href="https://everlastingfuneraladvisors.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Visit Everlasting Funeral Advisors <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        },
        {
          q: "How can Everlasting Funeral Advisors help after a death?",
          a: (
            <>
              <p className="mb-3">We also support families after a loved one dies:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Step-by-step guidance on what to do next</li>
                <li>Help understanding paperwork and timelines</li>
                <li>Education about public benefits like Social Security and Medicaid</li>
                <li>Guidance on checking for insurance and records</li>
              </ul>
              <p className="font-medium mb-2">Affordable funeral product options:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Caskets, urns, flowers, and other memorial items</li>
                <li>Families can compare options</li>
                <li>No obligation</li>
                <li>Designed to reduce unnecessary costs</li>
              </ul>
              <p className="mb-3">Our guides help families make decisions calmly, avoid rushed or pressured purchases, and choose what fits their needs and budget.</p>
              <a href="https://everlastingfuneraladvisors.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                Visit Everlasting Funeral Advisors <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )
        }
      ]
    },
    {
      title: "Choosing a Person in Charge",
      icon: "👤",
      questions: [
        {
          q: "Why should I choose one person to be in charge?",
          a: (
            <>
              <p className="mb-3">Choosing one person helps avoid confusion and conflict during a difficult time.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>This person helps carry out funeral arrangements</li>
                <li>They are the main point of contact for funeral homes and family</li>
                <li>They help follow your preplan</li>
              </ul>
              <p className="mt-3">When everyone knows who is in charge, decisions happen faster and with less stress.</p>
            </>
          )
        },
        {
          q: "Who should I name as my primary person in charge?",
          a: (
            <>
              <p className="mb-3"><strong>Primary Person in Charge:</strong></p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Name one trusted person</li>
                <li>This is who funeral homes and family look to first</li>
                <li>Choose someone you trust to follow your wishes</li>
              </ul>
              <p className="mt-3">This person should be willing, available, and aware of where your preplan is saved.</p>
            </>
          )
        },
        {
          q: "Should I name backup people?",
          a: (
            <>
              <p className="mb-3">Yes. Backups prevent delays if your first choice is unavailable.</p>
              <p className="font-medium mb-2">First Backup (Second Choice):</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Name a second person</li>
                <li>Steps in if the primary person is unavailable</li>
              </ul>
              <p className="font-medium mb-2">Second Backup (Third Choice):</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Optional but helpful</li>
                <li>Useful for emergencies or travel delays</li>
              </ul>
              <p><strong>Order matters.</strong> Only one person should lead at a time.</p>
            </>
          )
        },
        {
          q: "Does this replace legal documents?",
          a: (
            <>
              <p className="mb-3">No. This is a practical guide for families, not a legal document.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>It does not replace a will, power of attorney, or healthcare directive</li>
                <li>It helps family members understand your wishes</li>
                <li>You can change your choices anytime</li>
              </ul>
              <p className="mt-3"><strong>Let your chosen people know where your preplan is saved.</strong></p>
            </>
          )
        },
        {
          q: "Checklist: Choosing a Person in Charge",
          a: (
            <>
              <p className="mb-3">Use this checklist to make sure you have covered the basics:</p>
              <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Primary person named</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>First backup named</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Second backup named (optional)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>Contact information added</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-lg">☐</span>
                  <span>People notified where the plan is stored</span>
                </div>
              </div>
            </>
          )
        }
      ]
    },
    {
      title: "Social Security and Medicaid",
      icon: "🏛️",
      questions: [
        {
          q: "Does Social Security help pay for funerals?",
          a: (
            <>
              <p className="mb-3">Social Security offers a small one-time death benefit of $255 (as of 2026). This amount is limited and does not cover full funeral costs.</p>
              <p>
                <Link to="/public-benefits" className="text-primary hover:underline inline-flex items-center gap-1">
                  Learn how to apply and current rules here →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Who qualifies for the Social Security death benefit?",
          a: (
            <>
              <p className="mb-3">Certain spouses or dependent children may qualify. Eligibility depends on work history and relationship to the deceased.</p>
              <p>
                <Link to="/public-benefits" className="text-primary hover:underline inline-flex items-center gap-1">
                  See full eligibility details →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Does Medicare cover funeral or burial costs?",
          a: (
            <>
              <p className="mb-3"><strong>No.</strong> Medicare does not cover funeral, burial, or cremation costs.</p>
              <p>
                <Link to="/public-benefits" className="text-primary hover:underline inline-flex items-center gap-1">
                  Learn more about what Medicare covers →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Does Medicaid help with funeral or burial costs?",
          a: (
            <>
              <p className="mb-3">It depends on the state. Some states offer limited burial assistance through Medicaid, typically $500–$1,500. Rules vary.</p>
              <p>
                <Link to="/public-benefits" className="text-primary hover:underline inline-flex items-center gap-1">
                  Check Medicaid help by state →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "How do I apply for Social Security or Medicaid help after a death?",
          a: (
            <>
              <p className="mb-3">Applications are handled through government agencies:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Social Security: Apply online, by phone, or at a local office</li>
                <li>Medicaid: Contact your state's Medicaid office</li>
              </ul>
              <p>
                <Link to="/public-benefits" className="text-primary hover:underline inline-flex items-center gap-1">
                  View step-by-step application guides →
                </Link>
              </p>
            </>
          )
        }
      ]
    },
    {
      title: "Travel Protection",
      icon: "✈️",
      questions: [
        {
          q: "What is travel protection?",
          a: (
            <>
              <p className="mb-3">Travel protection refers to services that help if a medical emergency or death occurs while you are away from home.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Medical evacuation: transport to a hospital or home</li>
                <li>Repatriation: returning remains to your home area</li>
                <li>Coordination with local authorities and funeral homes</li>
              </ul>
              <p className="mt-3">
                <Link to="/travel-protection" className="text-primary hover:underline inline-flex items-center gap-1">
                  Learn more about travel protection →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "Why does travel protection matter?",
          a: (
            <>
              <p className="mb-3">If something happens far from home:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Medical transport can cost $50,000 or more</li>
                <li>International repatriation is complex and expensive</li>
                <li>Families may face unexpected decisions and delays</li>
              </ul>
              <p className="mt-3">Travel protection can provide peace of mind and financial coverage.</p>
            </>
          )
        },
        {
          q: "Does regular travel insurance cover this?",
          a: (
            <>
              <p className="mb-3">Not always. Standard travel insurance often covers:</p>
              <ul className="list-disc ml-6 space-y-1 mb-3">
                <li>Trip cancellation</li>
                <li>Lost baggage</li>
                <li>Some medical expenses</li>
              </ul>
              <p className="mb-3">But medical evacuation and repatriation may require separate coverage or higher limits.</p>
              <p>Always read the policy carefully.</p>
            </>
          )
        },
        {
          q: "Who should consider travel protection?",
          a: (
            <>
              <p className="mb-3">Consider travel protection if you:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Travel frequently or internationally</li>
                <li>Spend extended time away from home (snowbirds, RVers)</li>
                <li>Have health conditions that could require emergency care</li>
                <li>Want peace of mind for your family</li>
              </ul>
            </>
          )
        },
        {
          q: "What questions should I ask a provider?",
          a: (
            <>
              <p className="mb-3">Before signing up, ask:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>What is covered (medical transport, repatriation, escorts)?</li>
                <li>Are there geographic limits?</li>
                <li>Are pre-existing conditions covered?</li>
                <li>What is the claims process?</li>
                <li>Is there 24/7 assistance available?</li>
              </ul>
              <p className="mt-3">
                <Link to="/travel-protection" className="text-primary hover:underline inline-flex items-center gap-1">
                  See more travel protection FAQs →
                </Link>
              </p>
            </>
          )
        }
      ]
    },
    {
      title: "Avoiding Probate",
      icon: "🔑",
      questions: [
        {
          q: "What is probate?",
          a: (
            <>
              <p className="mb-3">Probate is the court process that:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Validates your will</li>
                <li>Pays debts and taxes</li>
                <li>Distributes property to heirs</li>
              </ul>
              <p className="mt-3">It can take months or longer and may involve fees and public records.</p>
            </>
          )
        },
        {
          q: "How can I avoid probate?",
          a: (
            <>
              <p className="mb-3">Several tools can help assets pass outside of probate:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>POD (Payable on Death):</strong> For bank accounts—free at most banks</li>
                <li><strong>TOD (Transfer on Death):</strong> For vehicles and investments</li>
                <li><strong>Beneficiary designations:</strong> On retirement accounts and life insurance</li>
                <li><strong>Joint ownership:</strong> Property passes to the surviving owner</li>
                <li><strong>Trusts:</strong> Assets held in trust avoid probate</li>
              </ul>
            </>
          )
        },
        {
          q: "What is a Payable on Death (POD) account?",
          a: (
            <>
              <p className="mb-3">A POD designation on a bank account:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Names who gets the money when you die</li>
                <li>Is free to set up at most banks</li>
                <li>Keeps you in full control while you are alive</li>
                <li>Releases funds after death with a death certificate</li>
              </ul>
              <p className="mt-3">This avoids probate for those accounts.</p>
            </>
          )
        },
        {
          q: "What is a Lady Bird Deed?",
          a: (
            <>
              <p className="mb-3">A Lady Bird Deed (Enhanced Life Estate Deed):</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Lets you keep control of your home while alive</li>
                <li>Transfers property to someone after death</li>
                <li>Avoids probate</li>
                <li>Available in some states only</li>
              </ul>
              <p className="mt-3">An attorney can help determine if this is right for you.</p>
            </>
          )
        },
        {
          q: "Does a will avoid probate?",
          a: (
            <>
              <p className="mb-3"><strong>No.</strong> A will does not avoid probate.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>A will tells the court what you want</li>
                <li>But the court still supervises distribution</li>
                <li>Use POD, TOD, or trusts to avoid probate</li>
              </ul>
            </>
          )
        },
        {
          q: "Should I give my property away early to avoid probate?",
          a: (
            <>
              <p className="mb-3"><strong>Be careful.</strong> Gifting property early can cause problems:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>You lose control of the property</li>
                <li>It may trigger gift taxes</li>
                <li>It can affect Medicaid eligibility (5-year lookback)</li>
                <li>The recipient's creditors could claim it</li>
              </ul>
              <p className="mt-3">Talk to an attorney before making large gifts.</p>
            </>
          )
        }
      ]
    },
    {
      title: "Healthcare Decisions",
      icon: "🏥",
      questions: [
        {
          q: "What is an advance directive?",
          a: (
            <>
              <p className="mb-3">An advance directive is a document that:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>States your healthcare wishes if you cannot speak for yourself</li>
                <li>May include a living will and healthcare power of attorney</li>
                <li>Guides doctors and family on your preferences</li>
              </ul>
              <p className="mt-3">
                <Link to="/preplandashboard/advance-directive" className="text-primary hover:underline inline-flex items-center gap-1">
                  Learn more about advance directives →
                </Link>
              </p>
            </>
          )
        },
        {
          q: "What is a healthcare power of attorney?",
          a: (
            <>
              <p className="mb-3">A healthcare power of attorney (also called healthcare proxy):</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Names someone to make medical decisions for you</li>
                <li>Only takes effect if you cannot communicate</li>
                <li>Should be someone who knows and respects your wishes</li>
              </ul>
            </>
          )
        },
        {
          q: "What is a DNR (Do Not Resuscitate)?",
          a: (
            <>
              <p className="mb-3">A DNR order tells medical staff not to perform CPR if your heart stops.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>It must be signed by a doctor</li>
                <li>It applies only to resuscitation, not other care</li>
                <li>You can change your mind anytime</li>
              </ul>
              <p className="mt-3">Discuss this with your doctor to understand your options.</p>
            </>
          )
        },
        {
          q: "How do I make sure my wishes are followed?",
          a: (
            <>
              <p className="mb-3">To help ensure your wishes are followed:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Complete an advance directive</li>
                <li>Give copies to your doctor and healthcare proxy</li>
                <li>Talk to your family about your preferences</li>
                <li>Keep a copy where it can be found quickly</li>
              </ul>
            </>
          )
        }
      ]
    }
  ];
  
  // Note: These programs offer limited help. Full details are available in the Benefits section.

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
          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <p className="text-base text-foreground text-center font-medium">
              Every situation is different. Small steps taken early can reduce stress later.
            </p>
          </div>
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
