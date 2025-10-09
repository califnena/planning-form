import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">My Final Wishes</h1>
            <p className="text-xs text-muted-foreground">Everlasting Funeral Advisors</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Plan Your Final Wishes with Peace of Mind
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            A comprehensive, secure planning guide to document your wishes, protect your loved ones, 
            and ensure your legacy is preserved exactly as you envision.
          </p>
          <div className="pt-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Planner
              </Button>
            </Link>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your sensitive information is protected with bank-level encryption and secure access controls.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Comprehensive Planning</h3>
            <p className="text-muted-foreground">
              Cover every detail from funeral wishes to financial accounts, legal documents, and personal messages.
            </p>
          </div>
          
          <div className="p-6 rounded-lg border border-border bg-card">
            <div className="text-3xl mb-4">❤️</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Peace for Loved Ones</h3>
            <p className="text-muted-foreground">
              Give your family clarity and guidance during difficult times with organized, accessible information.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="font-semibold text-lg mb-3 text-foreground">Contact Us</h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">Everlasting Funeral Advisors</p>
              <p>(323) 863-5804</p>
              <p>
                <a href="mailto:info@everlastingfuneraladvisors.com" className="text-primary hover:underline">
                  info@everlastingfuneraladvisors.com
                </a>
              </p>
              <p>
                <a 
                  href="https://everlastingfuneraladvisors.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  everlastingfuneraladvisors.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
