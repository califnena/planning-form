import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import mascotCouple from "@/assets/mascot-couple-scene.png";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">My Final Wishes</h1>
            <p className="text-xs text-muted-foreground">Everlasting Funeral Advisors</p>
            <Link 
              to="/about-us"
              className="text-xs text-primary hover:underline"
            >
              About Us
            </Link>
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

        {/* Mascot Image */}
        <div className="flex justify-center mt-20 mb-12">
          <img 
            src={mascotCouple} 
            alt="Funeral Planning Mascots" 
            className="w-64 h-auto"
          />
        </div>

        {/* Overview Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-card border border-border rounded-lg p-8 md:p-12 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
              Our Mission
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              Are you prepared for one of life's most difficult moments? Our mission is to guide families through the process of planning an affordable funeral with care, compassion, and expertise. From understanding your options to making thoughtful decisions, we're here to support you every step of the way. With our resources and guidance, you can create a meaningful farewell that honors your loved one's life while easing the burden on your family during a challenging time. Let us help you navigate this journey with sensitivity and understanding.
            </p>
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

        {/* About Us Section */}
        <div id="about" className="max-w-6xl mx-auto mt-32 mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              About Everlasting Funeral Advisors
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Your trusted partner in compassionate, affordable funeral planning
            </p>
          </div>

          {/* Testimonial */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-8 md:p-12 mb-16">
            <div className="flex flex-col items-center text-center">
              <div className="text-5xl mb-4">💙</div>
              <blockquote className="text-lg md:text-xl italic text-foreground mb-4">
                "Everlasting Caskets made a difficult time much easier with their compassionate guidance and affordable options. We are forever grateful."
              </blockquote>
              <p className="text-sm text-muted-foreground">— A grateful family</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Products */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <span className="text-3xl">🏺</span>
                Affordable Products
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Premium and budget-friendly caskets</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Beautiful cremation urns in various styles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Fresh flower arrangements and memorial tributes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Complete funeral packages tailored to your budget</span>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <span className="text-3xl">🤝</span>
                Professional Services
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Expert funeral planning advisors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Legacy Planner (physical binder & digital platform)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Customized eulogy writing and song selection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span className="text-muted-foreground">Guidance and coaching to document your funeral plans and last wishes</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer">
                Learn More About Our Services
              </a>
            </Button>
          </div>
        </div>

        {/* Video Section */}
        <div className="max-w-4xl mx-auto mt-20">
          <video 
            className="w-full rounded-lg shadow-lg"
            controls
            poster="/placeholder.svg"
          >
            <source src="/videos/funeral-planner-ad.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <h3 className="font-semibold text-lg mb-3 text-foreground">Provided by</h3>
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
      
      <AssistantWidget />
    </div>
  );
};

export default Landing;
