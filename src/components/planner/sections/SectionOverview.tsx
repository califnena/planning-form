import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

interface SectionOverviewProps {
  onNavigateToChecklist?: () => void;
}

export const SectionOverview = ({ onNavigateToChecklist }: SectionOverviewProps) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">📖 Pre-Planning Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your pre-planning journey. Use this guide to understand the process and get started with your personalized plan.
        </p>
      </div>

      {/* Embedded Pre-Planning Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Pre-Planning Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video w-full rounded-lg overflow-hidden border">
            <iframe 
              src="https://gamma.app/embed/om4wcs6irh1s18e" 
              style={{ width: '100%', height: '100%' }}
              allow="fullscreen" 
              title="Pre-Planning Guide"
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            This interactive guide walks you through the key decisions and information you'll want to document in your pre-plan.
          </p>
        </CardContent>
      </Card>

      {/* Navigate to Checklist - simple link */}
      {onNavigateToChecklist && (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Pre-Planning Checklist</h3>
                <p className="text-sm text-muted-foreground">
                  Track your progress with our comprehensive checklist.
                </p>
              </div>
              <Button onClick={onNavigateToChecklist} variant="outline" className="gap-2">
                Open Checklist
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
