import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";
import NotAdviceNote from "@/components/NotAdviceNote";
import { MapPin, ClipboardList } from "lucide-react";

export default function PublicBenefits() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">
          Public Funeral Benefits
        </h1>
        
        <p className="text-lg text-muted-foreground mb-6">
          Here's a plain-language look at what government programs may—or may not—help with funeral costs.
        </p>

        <NotAdviceNote />

        {/* Social Security Death Benefit */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Social Security Death Benefit</h2>
          <p className="text-base text-muted-foreground mb-3">
            Social Security offers a one-time payment of $255 to certain surviving family members. This is called the "lump-sum death benefit."
          </p>
          <p className="text-base text-muted-foreground mb-3">
            To qualify, the surviving spouse must have been living with the person who passed away. If there is no spouse, the payment may go to a child who is receiving Social Security benefits.
          </p>
          <p className="text-base text-muted-foreground">
            This benefit does not cover funeral costs. It is a small, fixed amount that has not changed in decades.
          </p>
        </Card>

        {/* Medicare */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Medicare</h2>
          <p className="text-base text-muted-foreground mb-3">
            Medicare does not pay for funerals, burial, or cremation.
          </p>
          <p className="text-base text-muted-foreground">
            Medicare is health insurance. It covers doctor visits, hospital stays, and some medical services. It does not cover any costs after someone passes away.
          </p>
        </Card>

        {/* Medicaid */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Medicaid</h2>
          <p className="text-base text-muted-foreground mb-3">
            Medicaid is different in every state. Some states offer limited help with funeral costs for people who qualify.
          </p>
          <p className="text-base text-muted-foreground mb-3">
            This help—sometimes called "burial assistance"—is usually a small amount and may only cover basic services like a direct burial or cremation.
          </p>
          <p className="text-base text-muted-foreground">
            To find out what your state offers, contact your local Medicaid office or Department of Social Services.
          </p>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={() => window.open("https://www.medicaid.gov/about-us/contact-us/index.html", "_blank", "noopener,noreferrer")}
            className="flex-1"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Check my state
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/resources")}
            className="flex-1"
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            View checklist
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8 text-center">
          This information is for educational purposes only. Programs and eligibility rules can change. Contact the relevant agency for current details.
        </p>
      </main>

      <AppFooter />
    </div>
  );
}
