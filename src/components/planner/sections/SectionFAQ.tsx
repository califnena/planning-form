import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQDownloadButton } from "./FAQDownloadButton";
import { useState } from "react";
import { PrivacyModal } from "@/components/PrivacyModal";

export const SectionFAQ = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">❓ FAQ</h2>
          <p className="text-muted-foreground">
            Frequently asked questions about end-of-life planning.
          </p>
        </div>
        <FAQDownloadButton />
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-6 mb-6">
        <p className="text-sm leading-relaxed">
          While we receive many questions related to funeral planning, there are several that we encounter on a regular basis. 
          With that in mind, we've compiled the top questions we hear. We've listed them below, along with a summary of our answers. 
          To help you explore these questions about funeral planning further, we've included links to sections of our website with more detail.
        </p>
        <p className="text-sm leading-relaxed mt-4">
          Planning a funeral can be difficult. Whether you're making arrangements after the loss of a loved one or preparing in advance for yourself, 
          the process can be overwhelming. That's because it involves emotional decisions, financial considerations, and logistical details that most 
          people don't think about until the need arises.
        </p>
      </div>

      {/* Privacy & Security Questions */}
      <div className="space-y-3 mb-8">
        <h3 className="text-lg font-semibold">🔒 Privacy & Security</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="privacy">
            <AccordionTrigger>How does this app protect my privacy?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p className="text-foreground font-semibold">
                  Your Privacy is Protected
                </p>
                <p>
                  <strong>We do NOT save sensitive personal information (PII)</strong> such as Social Security Numbers, 
                  financial account numbers, insurance policy details, or other sensitive data.
                </p>
                <p>
                  You can safely enter this information to generate your PDF, but you'll need to re-enter it each time. 
                  This information is <strong>only used for printing</strong> and is never stored in our database.
                </p>
                <p className="pt-2">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-primary hover:underline font-medium"
                  >
                    Open Privacy & Data details →
                  </button>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="guided-tour">
            <AccordionTrigger>How do I see the guided tour again?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  The guided tour appears automatically the first time you use the Pre-Planning tool. If you'd like to see it again:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>Go to <strong>Preferences</strong> in the left sidebar</li>
                  <li>Look for the <strong>"Restart Guided Tour"</strong> button at the top of the page</li>
                  <li>Click it and refresh the page to start the tour again</li>
                </ol>
                <p className="pt-2">
                  The tour will walk you through key features including how to choose topics, save your work, and create your PDF document.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Top Questions */}
      <div className="space-y-3 mb-8">
        <h3 className="text-lg font-semibold">💰 Top Questions</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="cost">
            <AccordionTrigger>How much does a funeral cost?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Questions about the cost of a funeral are by far the most common that we receive. The answer may be a bit complicated. 
                  The actual cost of a funeral depends on several factors. Among these are location, the type of service you choose, and your personal preferences.
                </p>
                <p>
                  According to the National Funeral Directors Association, the average cost of a traditional funeral with a burial in the U.S. 
                  ranges from $7,000 to $12,000, including the casket, service fees, and burial plot. Cremation tends to be less expensive, 
                  averaging $4,000 to $7,000. Additional costs may include flowers, catering, or memorial keepsakes.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="importance">
            <AccordionTrigger>Why is funeral planning important?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  We often say that the best time to plan a funeral is before you need it. We really believe that. Funeral planning can ensure 
                  that your wishes or the wishes of your loved one are honored. Best of all, spelling out how you want to be memorialized can ease 
                  the emotional and financial burdens on your family members during a difficult time.
                </p>
                <p>
                  Planning allows you to make thoughtful decisions about the type of service, burial or cremation options, and other essential details. 
                  When you prepare, you ensure that everything aligns with personal values and preferences. You'll also have time to make financial 
                  arrangements so that the expenses associated with your funeral are taken care of.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="steps">
            <AccordionTrigger>What are the steps in planning a funeral?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>Planning a funeral is similar to planning any other significant event designed to celebrate a life milestone. The key steps include:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li><strong>Set a Budget:</strong> Knowing how much you can comfortably spend will give you a framework for the many decisions you'll need to make.</li>
                  <li><strong>Decide on Disposition:</strong> Choose between burial, cremation, or other options.</li>
                  <li><strong>Choose Service Options:</strong> Select the type of service you want. Do you want a traditional funeral, or would you prefer a memorial service and a celebration of life?</li>
                  <li><strong>Estimate Costs:</strong> Assess the expected expenses and adjust your choices to align with your budget.</li>
                  <li><strong>Communicate Your Plan:</strong> Share your decisions with family or a trusted individual.</li>
                  <li><strong>Flesh out the ceremony details:</strong> You can specify elements like readings, music, and who will participate in the ceremony.</li>
                  <li><strong>Arrange Financing:</strong> Explore options such as funeral insurance, trusts, or pre-purchase services.</li>
                  <li><strong>Organize Your Personal Information:</strong> Gather and organize key documents such as wills, insurance policies, and other key information.</li>
                </ol>
                <p className="mt-3">
                  Our After Me Planner and Organizer is the perfect tool to help you manage all steps of the funeral planning process.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="financial-help">
            <AccordionTrigger>What financial help is available for funeral expenses?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Thinking about your own mortality or having someone close to you pass can be overwhelming. When you add the stress of figuring out 
                  how to pay for it, the burden feels even heavier. Unfortunately, funerals are expensive. There are several ways to get help, but it's 
                  always best to ensure you have set aside funds to cover it.
                </p>
                <p>It's always a good idea to ask the funeral home if they are familiar with any available resources. Some other options include:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Life insurance policies that cover funeral costs</li>
                  <li>Veterans' benefits for eligible service members</li>
                  <li>Social Security (a one-time death benefit of $255 for qualifying survivors)</li>
                  <li>State or county assistance programs for low-income families</li>
                  <li>Charitable organizations such as churches and social groups</li>
                  <li>Crowdfunding and Social Networks</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="immediate-steps">
            <AccordionTrigger>What should I do right away when someone dies?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  When someone dies, the initial steps depend on the circumstances of the death, including the location and manner in which it occurred.
                </p>
                <p>
                  If the death happens at home and the person was under medical care, contact their doctor or hospice nurse so they can officially 
                  pronounce the death. If it was unexpected or there was no medical professional involved, call 911 so emergency personnel can assess the situation.
                </p>
                <p>
                  Once the death is legally confirmed, you'll need to choose a funeral home or mortuary to take the person into their care. If your 
                  loved one had made arrangements in advance or has documented their wishes, locate those papers. They can save you from having to 
                  guess what your loved one would have wanted.
                </p>
                <p>
                  The next step is to notify close family and friends. You will also need to handle practical matters such as securing the home, 
                  caring for pets, and gathering important documents.
                </p>
                <p>
                  It's okay to ask for help. There's a lot to manage, and you don't have to do it all alone. Take things one step at a time, 
                  lean on others for support. Remember, while there are legal and logistical tasks to handle, taking time to process your emotions 
                  is just as important.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Additional Questions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">🕊️ Funeral Planning</h3>
        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What is funeral preplanning and why do people do it?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Funeral preplanning means arranging your funeral and burial or cremation details ahead of time. 
                This ensures your wishes are honored, saves your family stress, and can help control costs.
              </p>
              <a
                href="https://consumer.ftc.gov/articles/planning-your-own-funeral"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Learn more: FTC Planning Your Own Funeral →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>At what age should I plan my funeral?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              There's no specific age—it's wise to start once you have dependents or assets. Planning early 
              gives you more control and peace of mind.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>Should I prepay my funeral or just prearrange?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Prepaying can lock in today's prices, but consider the financial health of the provider. 
                <strong> Prearranging</strong> means planning services without paying. <strong>Prepaying</strong> means 
                paying in advance at today's prices to protect against inflation.
              </p>
              <a
                href="https://consumer.ftc.gov/articles/planning-your-own-funeral"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Read FTC guidance →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>How do I compare funeral costs?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Request a General Price List (GPL) from each funeral home. By law, funeral homes must provide one 
                upon request. Compare line items carefully: service fees, casket or urn, embalming, ceremony space, 
                transport, burial plot or cremation, flowers, and death certificates.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>What if I can't afford a funeral?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Options include direct cremation or burial, government aid, veterans' benefits, or charity programs. 
              Contact local social services for help.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>What is a prepaid funeral plan?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A contract allowing you to pay now for future funeral services. Funds are often held in trust or 
              an insurance policy.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger>Can I cancel a prepaid plan?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Usually yes, though refunds or penalties depend on state laws. Verify terms before signing.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-8">
          <AccordionTrigger>What if the funeral home closes?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can usually transfer your prepaid plan. Contact your state's funeral board for assistance.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-9">
          <AccordionTrigger>How does Medicaid treat prepaid funeral trusts?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Some irrevocable prepaid funeral trusts may be excluded from Medicaid asset limits. Check your 
              state's Medicaid office for guidance.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>

      {/* Digital Legacy Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">💻 Digital Legacy</h3>
        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-10">
          <AccordionTrigger>What is a digital legacy?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your digital legacy includes your online accounts, data, passwords, and photos. Without a plan, 
              heirs may lose access.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-11">
          <AccordionTrigger>How can my family access my phone after I die?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Apple:</strong> Add a Legacy Contact under Settings &gt; [Your Name] &gt; Sign-In & Security 
                &gt; Legacy Contact. Provide them the access key and death certificate.
              </p>
              <a
                href="https://support.apple.com/en-us/102431"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Apple Legacy Contact Setup →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-12">
          <AccordionTrigger>How can my family access Google or social media accounts?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Google:</strong> Set up Inactive Account Manager. <strong>Facebook:</strong> Add a Legacy 
                Contact. Each platform has its own policies—review account settings.
              </p>
              <a
                href="https://myaccount.google.com/inactive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Google Inactive Account Manager →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-13">
          <AccordionTrigger>What's a digital executor?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A digital executor manages your online assets after death. You can name one in your will, but don't 
              include actual passwords in the will document.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-14">
          <AccordionTrigger>How should I store passwords for my heirs?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Use a password manager (like 1Password or Bitwarden) or write them down and store securely. 
                Reference its location in your estate documents. Many password managers offer emergency access 
                features that let trusted contacts request access to your vault after a waiting period.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
      </div>

      {/* Estate & Administrative Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">📋 Estate & Administrative</h3>
        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-15">
          <AccordionTrigger>Who should I notify first after a death?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Funeral home, doctor, or coroner (for pronouncement of death), then family, employer, insurance, 
              and Social Security.</p>
              <p className="pt-2">Key steps after a death:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Notify family and authorities</li>
                <li>Arrange funeral</li>
                <li>Obtain death certificates</li>
                <li>Notify insurance and banks</li>
                <li>Begin estate or probate process</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-16">
          <AccordionTrigger>How many death certificates should I order?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Order 10–15 certified copies; many agencies require originals. They're needed for insurance claims, 
              banks, investment accounts, property transfers, Social Security, veterans benefits, and more. 
              Order extras initially as they're cheaper in bulk.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-17">
          <AccordionTrigger>What's the role of an executor?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              They handle debts, assets, and distribution according to the will, and may manage digital assets 
              if authorized.
            </p>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
      </div>

      {/* Special Considerations Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">🎖️ Special Considerations</h3>
        <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-18">
          <AccordionTrigger>What about veterans' benefits?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Veterans may qualify for burial in a national cemetery and partial funeral cost coverage, 
                headstones, markers, medallions, burial flags, and Presidential Memorial Certificates at no cost.
              </p>
              <a
                href="https://www.va.gov/burials-memorials/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                VA Burials & Memorials Eligibility →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-19">
          <AccordionTrigger>Can I donate my body to science?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes. Research medical schools and donation programs in advance. Some cover transportation costs, 
              but make sure your family knows your wishes.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-20">
          <AccordionTrigger>How do I plan for pet care after my death?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Key steps for pet planning:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Name a caregiver and backup caregiver</li>
                <li>Set aside funds for ongoing pet care</li>
                <li>Document feeding schedules, medications, and vet info</li>
                <li>Consider creating a pet trust for long-term care</li>
                <li>Keep photos and important documents accessible</li>
                <li>Update microchip registration with caregiver information</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-21">
          <AccordionTrigger>Can I move or change a funeral plan?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Yes. Most contracts are transferable, but check the fine print for fees or restrictions.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      </div>

      <div className="mt-8 pt-6 border-t border-border">
        <h3 className="font-semibold mb-3">Additional Resources:</h3>
        <div className="space-y-2 text-sm">
          <a
            href="https://consumer.ftc.gov/funerals"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline block"
          >
            FTC Funerals Information →
          </a>
          <a
            href="https://consumer.ftc.gov/articles/planning-your-own-funeral"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline block"
          >
            FTC: Planning Your Own Funeral →
          </a>
          <a
            href="https://www.va.gov/burials-memorials/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline block"
          >
            VA Burials & Memorials →
          </a>
        </div>
      </div>

      {/* Body Care & Special Circumstances Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">🏥 Body Care & Special Circumstances</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="organ-donation">
            <AccordionTrigger>Can I still have a home funeral with organ or tissue donation?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Yes, you can still have a home funeral if the deceased was an organ and/or tissue donor.
                </p>
                <p>
                  <strong>Organ donation</strong> typically requires the person to have died in a hospital setting while on life-support, 
                  as organs need an ongoing supply of blood and oxygen. Organ donation may include the heart, lungs, liver, kidneys, 
                  pancreas, and intestines.
                </p>
                <p>
                  <strong>Tissue donation</strong> may include corneas, bone, tendons, skin, heart valves, veins, and arteries. 
                  Tissue donors may be eligible even if they didn&apos;t die in a hospital. Some organ procurement organizations (OPOs) 
                  allow up to twelve hours after death before transport to their facility, which means you may spend time with the 
                  body before and/or after tissue donation.
                </p>
                <p>
                  <strong>Important:</strong> Let the OPO know you&apos;re preparing the body without a funeral director. Request that 
                  they pack recovery areas, neatly suture incisions, wrap the body well, and/or dress it in a Unionall. Check their 
                  policies for self-transport.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="organ-donation-care">
            <AccordionTrigger>How do I care for a body after organ & tissue donation?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Because organ and tissue donation is a surgical procedure, special considerations are needed:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>If the OPO sutures and wraps recovery sites well, you may work around the wraps or use a Unionall</li>
                  <li>You can shroud, veil, and symbolically care for parts of the body (like hands or face) if preparing the entire body feels overwhelming</li>
                  <li>Take extra care when turning, bathing, and dressing - have multiple people help</li>
                  <li>Long bones may have been removed and replaced with dowel rods or similar materials</li>
                  <li>Large sections of skin and soft tissues may have been removed from the abdomen, back, and/or limbs</li>
                </ul>
                <p>
                  <strong>Caring for recovery sites:</strong> Clean, dry, and cover incisions with absorbent materials (cotton, gauze, 
                  panty liners). Tape them down with medical or duct tape. You can seal incisions with Gorilla Glue and prevent leakage 
                  by wrapping with plastic wrap or butcher paper. Place ice directly on incision/recovery sites when cooling the body.
                </p>
                <p className="text-xs italic">
                  Note: Some materials may not be compatible with certain disposition types like natural burial - check with your provider.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="autopsy">
            <AccordionTrigger>Can I still have a home funeral if an autopsy was performed?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Yes, you can still have a home funeral after an autopsy. An autopsy is a postmortem examination to determine cause 
                  of death and may include surgical procedures with incisions in the chest, abdomen, and head.
                </p>
                <p>
                  <strong>Important steps:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Inform the medical examiner/coroner that the body won&apos;t be going to a funeral home</li>
                  <li>Ask them to tightly and neatly suture incisions and to rinse the body</li>
                  <li>Learn the autopsy provider&apos;s policy for non-funeral director transport</li>
                  <li>If cause of death is obvious (like in an accident), you may ask them not to do a surgical autopsy</li>
                </ul>
                <p>
                  There is no cost for an autopsy when ordered by a medical examiner/coroner.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="autopsy-care">
            <AccordionTrigger>How do I care for a body after an autopsy?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Take extra care when turning, bathing, and dressing. Have multiple people help with moving and transporting.
                </p>
                <p>
                  <strong>Incision care:</strong> Treat incisions like any wound - clean and dry them without getting water inside. 
                  Bandage or cover as needed. Use a Unionall suit if concerned about leakage. Place ice directly on incision sites 
                  when cooling the body.
                </p>
                <p>
                  <strong>Cranial incisions:</strong> The head may have been shaved with prominent stitches across the scalp. 
                  Use hats or scarves to cover incisions. If eyes were removed, eye sockets can be filled with cotton balls.
                </p>
                <p>
                  <strong>Internal organs:</strong> Organs examined during autopsy are often placed in a plastic viscera bag in the 
                  abdomen. These bags aren&apos;t compatible with natural burial, natural organic reduction (NOR), or water cremation and 
                  may need removal. Check with your disposition facility - they may remove it as part of the process.
                </p>
                <p>
                  You can ask the autopsy provider not to use a plastic bag or to dispose of organs. If organs are disposed of, 
                  pad the sunken abdomen with cotton batting or cloth under clothing.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="decomposition">
            <AccordionTrigger>Can I have a home funeral if the body has started to decompose?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Yes, you can still have a home funeral in the early stages of decomposition.
                </p>
                <p>
                  Decomposition is the natural process after death involving the breakdown of cells and bacterial growth. As it progresses, 
                  skin changes color and texture, gases build and are released, and fluids leak from the body.
                </p>
                <p>
                  <strong>Factors affecting decomposition speed:</strong> time since death, body condition, air temperature, and humidity.
                </p>
                <p>
                  <strong>Care considerations:</strong> The body will usually be examined by a medical examiner/coroner, and an autopsy 
                  may be performed. Extra care should be given to prevent further decomposition by keeping the body cool. You may wish 
                  to hire a professional if a viewing is desired.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="skin-slippage">
            <AccordionTrigger>What is skin slippage and how do I handle it?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Skin slippage (skin slip) is the separation of the outermost layer of skin from the underlying layer. There may be 
                  fluid in the spaces, and the skin can split and leak. This is a natural decomposition process.
                </p>
                <p>
                  <strong>Treatment options:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Apply isopropyl alcohol on affected areas to dry out the skin</li>
                  <li>Wrap the area with saran wrap or butcher paper taped/tied into place (butcher paper is preferred for natural burial)</li>
                  <li>For significant fluid or large skin openings, use cotton balls, cotton batting, gauze, or chux pad strips to cover before wrapping</li>
                  <li>Use cornstarch to help absorb fluid</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="body-trauma">
            <AccordionTrigger>How does body trauma affect home funeral care?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Body trauma related to the cause of death may affect how a body looks, the position it can be placed in for viewing, 
                  odors present, and more.
                </p>
                <p>
                  These may be cases where you enlist professional help. In cases where there will be no viewing, you have more flexibility 
                  in how you approach body care.
                </p>
                <p>
                  Consider symbolic care - you don&apos;t have to prepare the entire body. You can focus on caring for specific parts like 
                  the hands or face, or use veiling and shrouding techniques.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="unionall">
            <AccordionTrigger>What is a Unionall and when is it used?</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>
                  Unionalls are plastic one-piece bodysuits used to contain fluids, often after autopsy or organ/tissue donation.
                </p>
                <p>
                  You can dress a person in clothing once the Unionall is in place. However, if opting for natural burial, natural 
                  organic reduction (composting), or water cremation, the Unionall will likely need to be removed before disposition.
                </p>
                <p>
                  Talk to your disposition provider about their requirements and policies regarding Unionalls.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Legal Documents Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">⚖️ Legal Documents</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="legal-forms-one-state">
            <AccordionTrigger>Why can't I use one form for all states?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                Each state has its own legal requirements for advance directives, powers of attorney, and other legal documents. Some states require specific mandatory language, unique notices, or their own statutory forms. A form from one state may not be legally valid in another state. To ensure your documents are enforceable, always use forms designed specifically for your state.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-attorney-needed">
            <AccordionTrigger>Do I need an attorney to complete these forms?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                Many basic legal forms can be completed without an attorney, including advance directives, living wills, and powers of attorney. However, you should consider consulting an attorney if:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>You have a complex estate or family situation</li>
                <li>You have questions about what powers to grant</li>
                <li>You want to ensure everything is properly executed</li>
                <li>You need forms that go beyond basic templates</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-advance-directive-vs-living-will">
            <AccordionTrigger>What's the difference between an advance directive and a living will?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                The terminology varies by state, but generally:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>A <strong>living will</strong> specifies your wishes about life-sustaining medical treatment if you become unable to communicate</li>
                <li>An <strong>advance directive</strong> is a broader term that may include both a living will and a healthcare power of attorney</li>
                <li>Some states combine these into a single document, while others have separate forms</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-forms-validity">
            <AccordionTrigger>How do I make sure my forms are legally valid?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">To ensure validity:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Use forms specifically designed for your state</li>
                <li>Follow all execution requirements (witnesses, notarization) exactly as specified</li>
                <li>Ensure witnesses meet your state's qualifications (not family members, not beneficiaries, etc.)</li>
                <li>Store originals in a safe place and provide copies to relevant parties (healthcare proxy, family, doctors)</li>
                <li>Review and update documents regularly, especially after major life changes</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-multiple-states">
            <AccordionTrigger>What happens if I spend time in multiple states?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                Some states honor advance directives from other states, while others require compliance with their own laws. If you regularly spend significant time in multiple states (such as snowbirds), it's recommended to complete advance directives for each state where you reside.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-change-revoke">
            <AccordionTrigger>Can I change or revoke these documents later?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">
                Yes. You can typically revoke or modify these documents at any time while you have mental capacity. Follow your state's specific procedures for revocation, which may include destroying the original, creating a new document, or filing a written revocation. Always notify everyone who has copies of the old document.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="legal-document-storage">
            <AccordionTrigger>Where should I keep these documents?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-2">
                Keep original documents in a safe but accessible location. Provide copies to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                <li>Your healthcare agent/proxy</li>
                <li>Your primary care physician</li>
                <li>Close family members</li>
                <li>Your attorney (if you have one)</li>
                <li>Hospital or nursing facility (if applicable)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2 font-semibold">
                Do NOT keep them in a safe deposit box, as they may not be accessible in an emergency.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      
      <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </div>
  );
};
