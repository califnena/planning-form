import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1 px-4 py-8 md:py-12">
        <article className="mx-auto max-w-3xl space-y-8">
          <header>
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Everlasting Funeral Advisors is a planning tool. You can use it at your own pace.
            </p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              What we collect
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>Account info (name, email)</li>
              <li>Planning info you type (wishes, notes, life story, obituary drafts, contacts you add)</li>
              <li>Uploaded files (if you upload anything)</li>
              <li>Messages you send to Claire (CARE Support), if you choose to use it</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              How we use your information
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>Save your plan so you can come back later</li>
              <li>Help you generate summaries or printable documents</li>
              <li>Improve the app (general improvements)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              What we do not do
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>We do not sell your personal information</li>
              <li>We do not provide legal, financial, or medical advice</li>
              <li>You control what you enter and what you share</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Payments
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>If you purchase on the web, payments are handled by Stripe</li>
              <li>The app does not store full card numbers</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Your choices
            </h2>
            <ul className="space-y-2 text-lg leading-relaxed text-foreground list-disc list-inside">
              <li>Edit or delete entries</li>
              <li>Export your data</li>
              <li>Delete your account</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Contact us
            </h2>
            <p className="text-lg leading-relaxed text-foreground">
              <a 
                href="mailto:info@everlastingfuneraladvisors.com" 
                className="text-primary hover:underline"
              >
                info@everlastingfuneraladvisors.com
              </a>
            </p>
          </section>

          <footer className="pt-8 border-t border-border">
            <p className="text-base text-muted-foreground">
              Last updated: January 19, 2026
            </p>
          </footer>
        </article>
      </main>

      <AppFooter />
    </div>
  );
};

export default PrivacyPolicy;
