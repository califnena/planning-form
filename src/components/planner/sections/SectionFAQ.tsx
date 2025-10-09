import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const SectionFAQ = () => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">📖 Guide & FAQ</h2>
        <p className="text-muted-foreground mb-6">
          Helpful information and frequently asked questions about end-of-life planning.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>What's the difference between prepaying and prearranging?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Prearranging</strong> means planning your funeral in advance by selecting services
              and products, but not paying for them. <strong>Prepaying</strong> means paying for your
              funeral in advance at today's prices, which can protect against inflation.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>How do I compare funeral costs?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Under the FTC Funeral Rule, funeral homes must provide a General Price List (GPL) that
                clearly itemizes costs. Get GPLs from multiple providers to compare prices.
              </p>
              <a
                href="https://consumer.ftc.gov/articles/planning-your-own-funeral"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                FTC: Planning Your Own Funeral →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>How does Medicaid treat prepaid funeral trusts?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Medicaid often excludes irrevocable prepaid funeral trusts from asset calculations for
              eligibility. However, rules vary by state. Consult with an elder law attorney or Medicaid
              planner in your state for specific guidance.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>Who should I notify first?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Immediate priorities:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Immediate family members</li>
                <li>Executor of the estate</li>
                <li>Funeral home or memorial service provider</li>
                <li>Employer (if currently working)</li>
                <li>Social Security Administration</li>
                <li>Life insurance companies</li>
                <li>Banks and financial institutions</li>
              </ol>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>How many death certificates do I need?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most people need 10-15 certified copies. You'll need them for insurance claims, banks,
              investment accounts, property transfers, Social Security, veterans benefits, and more.
              Order extras initially as they're cheaper in bulk and obtaining more later is time-consuming.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>What are VA burial benefits?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Veterans and eligible family members may receive burial benefits including burial in VA
                national cemeteries, headstones, markers, medallions, burial flags, and Presidential
                Memorial Certificates at no cost.
              </p>
              <a
                href="https://www.va.gov/burials-memorials/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                VA Burials & Memorials →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-7">
          <AccordionTrigger>How do I plan for pet care?</AccordionTrigger>
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

        <AccordionItem value="item-8">
          <AccordionTrigger>Should I use a password manager?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Yes! Password managers provide secure, encrypted storage for all your login credentials.
                Popular options include 1Password, LastPass, Dashlane, and Bitwarden. Make sure your
                executor knows how to access your password manager and keep the master password in a
                secure location.
              </p>
              <p className="pt-2">
                Also consider setting up emergency access features that let trusted contacts request
                access to your vault after a waiting period.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-9">
          <AccordionTrigger>What is an Apple Legacy Contact?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Apple Legacy Contact lets you designate someone who can access your Apple ID account and
                personal data after you pass away. They can access photos, messages, notes, files, and
                more with an access key you generate.
              </p>
              <a
                href="https://support.apple.com/en-us/102431"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Learn how to set up Legacy Contact →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-10">
          <AccordionTrigger>What is Google Inactive Account Manager?</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Google's Inactive Account Manager lets you decide what happens to your Google account
                data when you stop using it. You can choose to delete your account or share data with
                trusted contacts after a specified period of inactivity (3-18 months).
              </p>
              <a
                href="https://myaccount.google.com/inactive"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Set up Inactive Account Manager →
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
    </div>
  );
};
