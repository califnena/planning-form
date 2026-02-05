 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Package, Users } from "lucide-react";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
 import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";

const AboutUs = () => {
   const [showContactDialog, setShowContactDialog] = useState(false);
 
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <GlobalHeader />

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            About Everlasting Funeral Advisors
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your trusted partner in compassionate, affordable funeral planning
          </p>
        </div>

        {/* Testimonial Card */}
        <Card className="mb-12 border-2 border-primary/20 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <Heart className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="text-lg italic mb-4 text-foreground">
                  "Everlasting Caskets made a difficult time much easier with their compassionate 
                  guidance and affordable options. We are forever grateful."
                </p>
                <p className="text-sm text-muted-foreground font-medium">— A grateful family</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Affordable Products */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-primary">Affordable Products</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Premium and budget-friendly caskets</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Beautiful cremation urns in various styles</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Fresh flower arrangements and memorial tributes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Complete funeral packages tailored to your budget</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Professional Services */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-primary">Professional Services</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Expert funeral planning advisors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Legacy Planner (physical binder & digital platform)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Customized eulogy writing and song selection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold mt-1">✓</span>
                  <span className="text-foreground">Guidance and coaching to document your funeral plans and last wishes</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4 text-primary">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Begin planning with compassion and care. Our tools and guidance are here to support you 
              every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-lg">
                <Link to="/signup">Start Your Plan</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="outline"
                className="shadow-lg"
              >
                <a 
                  href="https://everlastingfuneraladvisors.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Visit Our Website
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4 text-primary">Contact Us</h3>
          <div className="text-muted-foreground space-y-2">
            <p className="font-medium">Everlasting Funeral Advisors</p>
            <p>(323) 863-5804</p>
           <button
             onClick={() => setShowContactDialog(true)}
             className="text-primary hover:underline block mx-auto"
            >
             Send a Message
           </button>
            <a
              href="https://everlastingfuneraladvisors.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              everlastingfuneraladvisors.com
            </a>
          </div>
        </div>

       {/* Contact Dialog */}
       <ContactSuggestionDialog 
         open={showContactDialog} 
         onOpenChange={setShowContactDialog} 
       />
      </main>
      <AppFooter />
    </div>
  );
};

export default AboutUs;
