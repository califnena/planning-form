import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { AppFooter } from "@/components/AppFooter";
import NotAdviceNote from "@/components/NotAdviceNote";
import { MapPin, ClipboardList } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { US_STATES } from "@/lib/us-states";

export default function PublicBenefits() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>("");

  const selectedStateLabel = US_STATES.find(s => s.value === selectedState)?.label || "";

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

          {/* State Selector */}
          <div className="bg-muted/50 rounded-lg p-4 mt-6">
            <h3 className="font-medium mb-3">Which state did the deceased live in?</h3>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full max-w-xs bg-background">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedState && (
              <div className="mt-4 space-y-3">
                <p className="text-base text-muted-foreground">
                  Medicaid funeral assistance rules in <strong>{selectedStateLabel}</strong> are set by the state. Coverage is not guaranteed.
                </p>
                
                <h4 className="font-medium mt-3">What to search for</h4>
                <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
                  <li>"{selectedStateLabel} Medicaid burial assistance"</li>
                  <li>"{selectedStateLabel} funeral expense help"</li>
                  <li>"{selectedStateLabel} indigent burial program"</li>
                </ul>

                <h4 className="font-medium mt-3">Who to contact</h4>
                <ul className="list-disc list-inside text-base text-muted-foreground space-y-1">
                  <li>{selectedStateLabel} Medicaid office</li>
                  <li>{selectedStateLabel} Department of Social Services</li>
                  <li>Your county or city social services office</li>
                </ul>

                <p className="text-sm text-muted-foreground mt-4">
                  We cannot confirm what {selectedStateLabel} currently offers. Rules change, and approval depends on individual circumstances.
                </p>
              </div>
            )}
          </div>
          
          <p className="text-base text-muted-foreground mt-4 mb-3">
            For official information, visit:
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

        {/* Social Security Checklist */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Social Security Death Benefit Checklist</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Locate the deceased's Social Security number</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Confirm surviving spouse lived with the deceased</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Gather death certificate</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Call Social Security at 1-800-772-1213</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Or visit your local Social Security office</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Apply within 2 years of death</span>
            </li>
          </ul>
        </Card>

        {/* Medicaid Checklist */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Medicaid Funeral Assistance Checklist</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Identify the state where the deceased lived</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Search for "[State] Medicaid burial assistance"</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Contact state Medicaid office or Department of Social Services</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Ask about income and asset limits</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Gather proof of income and assets</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Gather death certificate</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 min-w-[24px] rounded border-2 border-border" />
              <span className="text-base">Submit application before arranging services (if required)</span>
            </li>
          </ul>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button 
            onClick={() => window.open("https://www.medicaid.gov/", "_blank", "noopener,noreferrer")}
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
          Rules and amounts may change. Always confirm using official links.
        </p>
      </main>

      <AppFooter />
    </div>
  );
}
