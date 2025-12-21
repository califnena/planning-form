import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, BookOpen } from "lucide-react";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";

export default function PlanAheadGuideViewer() {
  const handleFullScreen = () => {
    window.open("https://gamma.app/embed/om4wcs6irh1s18e", "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Link 
          to="/plan-ahead" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plan Ahead
        </Link>

        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Pre-Planning Guide
              </h1>
              <p className="text-muted-foreground">
                A Gift of Peace and Clarity
              </p>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3">What You'll Learn</h2>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                How funeral pre-planning works and what decisions matter most
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                What information to gather and how to organize your wishes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                How your family will use this plan when the time comes
              </li>
            </ul>
          </div>

          {/* Full Screen Button */}
          <div className="flex justify-end mb-4">
            <Button 
              onClick={handleFullScreen} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Maximize2 className="h-4 w-4" />
              Open Full Screen
            </Button>
          </div>
        </div>

        {/* Guide Embed - Full Width */}
        <div className="w-full max-w-5xl mx-auto">
          <div className="bg-muted/30 rounded-lg overflow-hidden border">
            <iframe 
              src="https://gamma.app/embed/om4wcs6irh1s18e" 
              style={{ width: '100%', height: 'calc(100vh - 350px)', minHeight: '500px' }} 
              allow="fullscreen" 
              title="EFA Pre-Planning Guide" 
              className="border-0" 
            />
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
