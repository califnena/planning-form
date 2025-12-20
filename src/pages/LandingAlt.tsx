import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  ClipboardList, 
  ShoppingBag, 
  Heart,
  Download,
  ArrowRight,
  Shield,
  Users,
  Sparkles
} from "lucide-react";
import { AppFooter } from "@/components/AppFooter";

const LandingAlt = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-28">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
            The Greatest Gift You Can Give Your Family Is Clarity
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Organize your wishes in advance so your loved ones aren't left guessing during one of life's hardest moments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button size="lg" className="text-lg px-8 py-6" asChild>
              <Link to="/resources">
                Start with Free Education & Planning Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Preview tools • Learn at your own pace • Upgrade only when ready
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section id="how-it-works" className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
            How Everlasting Funeral Advisors Helps
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            We provide clear education, step-by-step planning tools, and optional support to help individuals and families make informed decisions—before and after a death. You can begin by learning and organizing at your own pace, preview our tools, and choose paid options only if and when they make sense for you.
          </p>
        </div>
      </section>

      {/* Four Paths Section */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-12">
            Choose Where You'd Like to Begin
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Path 1: Understanding Your Options */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-foreground">
                    Understanding Your Options
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4 text-lg">
                  Plain-language education about funeral choices, costs, and your rights.
                </p>
                <ul className="text-muted-foreground mb-6 space-y-2">
                  <li>• Education & Planning Basics</li>
                  <li>• Guides & FAQs</li>
                  <li>• FTC Funeral Rule information</li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/resources">Learn the Basics</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Path 2: Plan Ahead */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-foreground">
                    Plan Ahead
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4 text-lg">
                  Tools to document your wishes in advance—on your own or with help.
                </p>
                <ul className="text-muted-foreground mb-6 space-y-2">
                  <li>• Pre-planning checklist</li>
                  <li>• Fillable & printable forms</li>
                  <li>• App-based planning (preview available)</li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/preview-preplanning">Start Pre-Planning</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Path 3: Affordable Funeral Products */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-foreground">
                    Affordable Funeral Products
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4 text-lg">
                  Transparent, competitively priced products without pressure or upselling.
                </p>
                <ul className="text-muted-foreground mb-6 space-y-2">
                  <li>• Caskets, urns, flowers</li>
                  <li>• Waterproof, fireproof planning binder</li>
                  <li>• Custom memorial songs</li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/products">View Products</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Path 4: After a Death */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-serif font-semibold text-foreground">
                    After a Death
                  </h3>
                </div>
                <p className="text-muted-foreground mb-4 text-lg">
                  Guidance for families when a death occurs.
                </p>
                <ul className="text-muted-foreground mb-6 space-y-2">
                  <li>• After-death checklist</li>
                  <li>• Step-by-step process</li>
                  <li>• Optional empathy and planning support</li>
                </ul>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/preview-afterdeath">Get Guidance Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Free Planning Resources
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            These resources are available to help you get started and understand what's involved.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2" asChild>
              <a href="/guides/EFA-Pre-Planning-Checklist.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="h-5 w-5" />
                Pre-Planning Checklist
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2" asChild>
              <a href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="h-5 w-5" />
                After-Death Checklist
              </a>
            </Button>
            <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2" asChild>
              <a href="/guides/Everlasting-Funeral-Advisors-Guide.pdf" target="_blank" rel="noopener noreferrer">
                <Download className="h-5 w-5" />
                Education & Planning Guide
              </a>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Access to advanced tools and saving progress may require creating an account later.
          </p>
        </div>
      </section>

      {/* Payment Expectation Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-medium text-foreground">Transparent & No Pressure</span>
          </div>
          <p className="text-muted-foreground text-lg">
            You can explore our education and preview planning tools before deciding to continue. Some advanced features and services require payment, but you'll always know what's included before you're asked to commit.
          </p>
        </div>
      </section>

      {/* Optional Support Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Optional Support, If You'd Like It
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Some families prefer personal guidance. These services are optional and never required.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-6 mb-8">
            <Card className="text-center p-6">
              <Users className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">VIP Planning Assistance</h3>
              <p className="text-sm text-muted-foreground">Personalized guidance through your planning journey</p>
            </Card>
            <Card className="text-center p-6">
              <ClipboardList className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Done-For-You Coordination</h3>
              <p className="text-sm text-muted-foreground">Let us handle the details for you</p>
            </Card>
            <Card className="text-center p-6">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Custom Memorial Song</h3>
              <p className="text-sm text-muted-foreground">A personalized tribute in music</p>
            </Card>
          </div>
          
          <Button variant="outline" size="lg" asChild>
            <Link to="/pricing">Explore Optional Support</Link>
          </Button>
        </div>
      </section>

      {/* Emotional Close Section */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-xl md:text-2xl text-foreground mb-8 font-serif italic">
            You don't need to do everything at once. Even taking one small step today can bring clarity and peace of mind to your family.
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link to="/resources">
              Start with Education & Planning Tools
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <AppFooter />
    </div>
  );
};

export default LandingAlt;
