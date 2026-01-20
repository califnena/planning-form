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
            Social Security offers a one-time payment of $255 to certain surviving family members. As of 2026, this amount has not changed.
          </p>
          
          <h3 className="font-medium mt-4 mb-2">Who qualifies</h3>
          <p className="text-base text-muted-foreground mb-3">
            A surviving spouse who was living with the person at the time of death may qualify. If there is no spouse, a child who is already receiving Social Security benefits on that person's record may be eligible.
          </p>
          
          <h3 className="font-medium mt-4 mb-2">How to apply</h3>
          <p className="text-base text-muted-foreground mb-3">
            You can apply by calling Social Security at 1-800-772-1213 or visiting your local Social Security office. You will need the deceased person's Social Security number.
          </p>
          
          <p className="text-base text-muted-foreground mb-3">
            Amounts and rules may change. Check the official website for current information:
          </p>
          <a 
            href="https://www.ssa.gov/benefits/survivors/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            www.ssa.gov/benefits/survivors
            <span className="text-xs text-muted-foreground ml-1">(opens in new tab)</span>
          </a>
        </Card>

        {/* Medicare */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Medicare</h2>
          <p className="text-base text-muted-foreground mb-3">
            Medicare does not cover funeral or burial costs.
          </p>
          
          <h3 className="font-medium mt-4 mb-2">What Medicare does not cover</h3>
          <ul className="list-disc list-inside text-base text-muted-foreground space-y-1 mb-4">
            <li>Funeral services</li>
            <li>Burial or cremation</li>
            <li>Caskets or urns</li>
            <li>Cemetery plots or headstones</li>
            <li>Transportation of remains</li>
          </ul>
          
          <p className="text-base text-muted-foreground mb-3">
            Medicare is health insurance for living patients. It does not provide any benefits after death.
          </p>
          <a 
            href="https://www.medicare.gov/what-medicare-covers" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            www.medicare.gov/what-medicare-covers
            <span className="text-xs text-muted-foreground ml-1">(opens in new tab)</span>
          </a>
        </Card>

        {/* Medicaid */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Medicaid</h2>
          <p className="text-base text-muted-foreground mb-3">
            Medicaid funeral help depends on the state. Each state sets its own rules for what is covered and who qualifies.
          </p>
          
          <h3 className="font-medium mt-4 mb-2">What to know</h3>
          <ul className="list-disc list-inside text-base text-muted-foreground space-y-1 mb-4">
            <li>Typical help ranges from $500 to $1,500</li>
            <li>Income and asset limits apply</li>
            <li>Approval is not guaranteed</li>
            <li>Some states have no funeral assistance at all</li>
          </ul>
          
          <p className="text-base text-muted-foreground mb-3">
            Check your state's rules by contacting your local Medicaid office or Department of Social Services.
          </p>
          <a 
            href="https://www.medicaid.gov/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            www.medicaid.gov
            <span className="text-xs text-muted-foreground ml-1">(opens in new tab)</span>
          </a>
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
