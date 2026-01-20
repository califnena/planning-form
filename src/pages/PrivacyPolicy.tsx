import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader minimal />
      
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-3xl mx-auto px-4 md:px-6">
          <article className="prose prose-lg max-w-none" style={{ fontSize: '18px', lineHeight: '1.6' }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Everlasting Funeral Advisors is a planning tool. You can use it at your own pace.
            </p>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                What we collect
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Account info (name, email)</li>
                <li>Planning info you type (wishes, notes, life story, obituary drafts, contacts you add)</li>
                <li>Uploaded files (if the app supports uploads)</li>
                <li>Messages you send to Claire (if you use CARE Support)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                How we use your information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>Save your plan so you can come back later</li>
                <li>Help you generate documents (like a summary or printable pages)</li>
                <li>Improve the app (in a general way, not by selling your data)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                What we do not do
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>We do not sell your personal information</li>
                <li>We do not provide legal or financial advice</li>
                <li>You decide what to write and what to share</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Payments
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>If you purchase a subscription on the web, payments are handled by Stripe</li>
                <li>Stripe may process payment details</li>
                <li>The app does not store full card numbers</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Your choices
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>You can edit or delete your entries anytime</li>
                <li>You can request account deletion</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mt-8 mb-4">
                Data retention
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-foreground">
                <li>We keep your information only as long as needed to provide the service</li>
                <li>You can request deletion at any time</li>
              </ul>
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

export default PrivacyPolicy;
