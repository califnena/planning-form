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
            <h1 className="text-xl font-semibold text-primary">Everlasting Funeral Advisors</h1>
            <p className="text-xs text-muted-foreground">Planning with confidence and care</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            Plan with Confidence. Support Your Loved Ones.
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Everlasting Funeral Advisors helps families organize important information, make decisions calmly, 
            and prepare for what comes next — without stress or confusion.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/login">
              <Button size="lg" className="text-lg px-10 py-7 w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-4xl mx-auto mt-24">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              About Us
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              We guide families through pre-planning, immediate steps after a passing, and organizing essential information. 
              Our goal is to make difficult moments easier with clear tools and trusted guidance. Whether you're preparing 
              in advance or helping a loved one through a loss, we're here to support you with compassion and practical resources.
            </p>
          </div>
        </div>

        {/* Simple Benefits */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Plan Ahead</h3>
            <p className="text-muted-foreground">
              Document wishes and important details in one secure place
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Support Families</h3>
            <p className="text-muted-foreground">
              Clear guidance for loved ones during difficult times
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2 text-card-foreground">Stay Secure</h3>
            <p className="text-muted-foreground">
              Your information protected with bank-level security
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
