import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
 import { useState } from "react";
 import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";

const TermsOfService = () => {
   const [showContactDialog, setShowContactDialog] = useState(false);
 
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1 px-4 py-8 md:py-12">
        <article className="mx-auto max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Everlasting Funeral Advisors helps you organize information. It does not replace professional advice.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              What this app is
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>A planning and organization tool for end-of-life wishes and related documents</li>
              <li>Self-paced and optional</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              What this app is not
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>Not legal advice</li>
              <li>Not financial advice</li>
              <li>Not medical advice</li>
              <li>Not emergency services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Your responsibility
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>You are responsible for what you enter</li>
              <li>Review information before sharing or printing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Accounts and security
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>Keep your password private</li>
              <li>Contact support if you believe your account was accessed</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Subscriptions and billing
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>You can cancel anytime</li>
              <li>Access continues through the end of the billing period (if applicable)</li>
              <li>No guarantee of outcomes</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Acceptable use
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>No illegal use</li>
              <li>No harassment</li>
              <li>No attempts to break or misuse the system</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Limitation of liability
            </h2>
            <p className="text-lg leading-relaxed text-foreground">
              We are not responsible for decisions you make using the app.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Changes
            </h2>
            <p className="text-lg leading-relaxed text-foreground">
              We may update these terms and will update the "Last updated" date.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Contact us
            </h2>
            <p className="text-lg leading-relaxed text-foreground">
             <button 
               onClick={() => setShowContactDialog(true)}
               className="text-primary hover:underline"
              >
               Send a Message
             </button>
            </p>
          </section>

          <footer className="pt-8 border-t border-border">
            <p className="text-base text-muted-foreground">
              Last updated: January 19, 2026
            </p>
          </footer>
        </article>
      </main>

     {/* Contact Dialog */}
     <ContactSuggestionDialog 
       open={showContactDialog} 
       onOpenChange={setShowContactDialog} 
     />

      <AppFooter />
    </div>
  );
};

export default TermsOfService;
