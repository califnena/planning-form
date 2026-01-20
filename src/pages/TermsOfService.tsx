import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader minimal />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-3xl mx-auto px-4 md:px-6">
          <article className="prose prose-lg max-w-none" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Everlasting Funeral Advisors helps you organize information. It does not replace professional advice.
            </p>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                What this app is
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>A planning and organization tool for end-of-life wishes and related documents</li>
                <li>Self-paced and optional</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                What this app is not
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Not legal advice</li>
                <li>Not financial advice</li>
                <li>Not medical advice</li>
                <li>Not emergency services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Your responsibility
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>You are responsible for what you enter</li>
                <li>You should review information before sharing or printing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Accounts and security
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>You should keep your password private</li>
                <li>Contact support if you believe your account was accessed</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Subscriptions and billing
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>If you subscribe, you can cancel anytime</li>
                <li>Access continues until the end of the billing period</li>
                <li>No guarantees that specific outcomes will occur</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Acceptable use
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>No illegal use</li>
                <li>No harassment</li>
                <li>No attempts to break or misuse the system</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Limitation of liability
              </h2>
              <p className="text-foreground">
                We are not responsible for decisions you make using the app. This tool is for informational and organizational purposes only.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Changes
              </h2>
              <p className="text-foreground">
                We may update these terms and will update the "Last updated" date when we do.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Contact us
              </h2>
              <p className="text-foreground">
                Email us at:{" "}
                <a 
                  href="mailto:info@everlastingfuneraladvisors.com" 
                  className="text-primary hover:underline"
                >
                  info@everlastingfuneraladvisors.com
                </a>
              </p>
            </section>

            <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border">
              Last updated: January 19, 2026
            </p>
          </article>
        </div>
      </main>

      <AppFooter />
    </div>
  );
};

export default TermsOfService;
