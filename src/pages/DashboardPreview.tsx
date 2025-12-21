import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Star, BookOpen, Music, Printer, Users, ListChecks, ShoppingBag, Plane, Lock, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PreviewModeBanner } from "@/components/dashboard/PreviewModeBanner";
import { AppFooter } from "@/components/AppFooter";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";

/**
 * Public Dashboard Preview - viewable without login.
 * Shows the structure with locked actions that require login.
 */
export default function DashboardPreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openLockedModal, saveLastVisitedRoute, isLoggedIn } = usePreviewModeContext();

  const handleLoginRequired = (redirect: string) => {
    if (isLoggedIn) {
      navigate(redirect);
    } else {
      saveLastVisitedRoute(location.pathname);
      openLockedModal("Sign in to save your progress and personalize your plan.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-4" />
        
        {/* Preview Mode Banner */}
        <PreviewModeBanner />

        {/* Planning Menu Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Your Planning Menu</h1>
          <p className="text-muted-foreground max-w-4xl mx-auto mb-3">
            This is your planning menu. You can explore freely. Sign in only when you want to save, download, or continue.
          </p>
        </div>

        {/* Progress Tracker Preview */}
        <div className="mb-12">
          <div className="flex justify-between items-center gap-2 max-w-4xl mx-auto relative">
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-primary/30 -z-10" style={{ marginLeft: '2.5rem', marginRight: '2.5rem' }}></div>
            
            {["Plan Ahead", "Get Support", "Shop", "Personal Touch", "After-Death Guide"].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-base mb-2 shadow-md">
                  {idx + 1}
                </div>
                <span className="text-xs text-center text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1 - My Planning Steps (Preview) */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
              1
            </div>
            <h2 className="text-2xl font-bold">My Planning Steps</h2>
          </div>
          
          <Card className="p-6">
            <div className="space-y-6">
              {/* Digital Planner */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Digital Planning Tool</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Document your wishes step by step. Save your progress and come back anytime.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleLoginRequired("/preplansteps")} variant="outline" className="gap-2 opacity-70">
                      <Lock className="h-4 w-4" />
                      Begin Planning
                      <span className="text-xs text-muted-foreground">(Login required)</span>
                    </Button>
                    <Button onClick={() => handleLoginRequired("/preplansteps")} variant="outline" className="gap-2 opacity-70">
                      <Lock className="h-4 w-4" />
                      Generate PDF
                      <span className="text-xs text-muted-foreground">(Login required)</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Printable Documents */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Printer className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Printable Documents</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Prefer paper? Purchase a professionally formatted printable form.
                  </p>
                  <Button onClick={() => navigate("/plan-ahead")} variant="outline">
                    View Options
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6" />

              {/* Do-It-For-You Planning */}
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">Do-It-For-You Planning</h3>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Popular</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    We help organize your wishes and complete the planning with you.
                  </p>
                  <Button onClick={() => navigate("/plan-ahead")} variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 2 - VIP Planning Support */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
              2
            </div>
            <h2 className="text-2xl font-bold">VIP Planning Support</h2>
          </div>
          
          <Card className="p-6 bg-amber-50/50 border-amber-200">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">One-on-one guidance through your planning process</h3>
                <p className="text-muted-foreground mb-4">
                  VIP Planning Support goes beyond planning—offering compassionate check-ins and steady guidance.
                </p>
                <ul className="space-y-2 mb-4 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>One-on-one guidance through your planning steps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>Help organizing thoughts when decisions feel heavy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">✓</span>
                    <span>A real person who walks at your pace</span>
                  </li>
                </ul>
                <Button onClick={() => navigate("/vip-coach")} variant="outline" className="min-h-[48px]">
                  Add VIP Planning Support
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 3 - Shop */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
              3
            </div>
            <h2 className="text-2xl font-bold">Shop</h2>
          </div>
          
          <Card className="p-6 border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Caskets, Urns, Flowers & More</h3>
                <p className="text-muted-foreground mb-4">
                  Browse quality products at fair prices. No pressure, no sales tactics.
                </p>
                <Button onClick={() => window.open('https://everlastingfuneraladvisors.com/shop/', '_blank')} size="sm">
                  Browse Products
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 4 - Custom Memorial Song */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
              4
            </div>
            <h2 className="text-2xl font-bold">Custom Memorial Song</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Create a Unique Tribute Song</h3>
                <p className="text-muted-foreground mb-4">
                  Honor your loved one with a professionally crafted, personalized song.
                </p>
                <Button onClick={() => navigate('/products/custom-song')} size="sm">
                  Create a Song
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* STEP 5 - After-Death Planner */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
              5
            </div>
            <h2 className="text-2xl font-bold">After-Death Planner</h2>
          </div>
          
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Guided Steps After a Loss</h3>
                <p className="text-muted-foreground mb-4">
                  Step-by-step guidance for families navigating the days and weeks after a death.
                </p>
                <Button onClick={() => navigate('/after-death')} size="sm">
                  Open After-Death Planner
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Travel Protection */}
        <div className="mb-12">
          <Card className="p-6 border-l-4 border-l-sky-500">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">Travel Death Protection</h3>
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Optional</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  Protection for when someone passes away while traveling far from home. Covers coordination and transportation.
                </p>
                <Button onClick={() => navigate('/travel-protection')} variant="outline" className="border-sky-500 text-sky-600 hover:bg-sky-50">
                  Learn More
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Education & Planning Support */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Helpful Guides & Planning Support</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, label: "Helpful Guides", href: "/resources" },
              { icon: ListChecks, label: "Planning Forms", href: "/legal-forms" },
              { icon: Users, label: "FAQ", href: "/faq" },
              { icon: FileText, label: "Contact", href: "/contact" },
            ].map((item, i) => (
              <Card 
                key={i} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => navigate(item.href)}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">{item.label}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA to Sign In */}
        <div className="text-center py-8 border-t">
          <p className="text-muted-foreground mb-4">
            Ready to save your progress and personalize your plan?
          </p>
          <Button onClick={() => navigate("/login?redirect=/dashboard")} size="lg" className="min-h-[48px]">
            Sign In to Get Started
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            You can come back later. Nothing is lost.
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
