import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Scale, ExternalLink, FileText, AlertTriangle, ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { US_STATES, STATE_LEGAL_INFO } from "@/lib/us-states";

export const SectionLegalResources = () => {
  const [selectedState, setSelectedState] = useState<string>("");

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("legal_selected_state");
    if (savedState) {
      setSelectedState(savedState);
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (selectedState) {
      localStorage.setItem("legal_selected_state", selectedState);
    }
  }, [selectedState]);

  // Get state-specific info
  const stateInfo = selectedState && STATE_LEGAL_INFO[selectedState] 
    ? STATE_LEGAL_INFO[selectedState] 
    : STATE_LEGAL_INFO.DEFAULT;

  const selectedStateName = selectedState 
    ? US_STATES.find(s => s.value === selectedState)?.label 
    : null;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
          <Scale className="h-8 w-8 text-primary" />
          Legal Documents & Resources
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Essential legal forms, guides, and resources to help you prepare important documents. 
          Find state-specific information and trusted templates for advance directives, wills, and more.
        </p>
      </div>

      {/* State Selector */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Select Your State
          </CardTitle>
          <CardDescription className="text-base">
            Choose your state to see specific legal requirements and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full max-w-md bg-background">
              <SelectValue placeholder="Choose your state..." />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50 max-h-[300px]">
              {US_STATES.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedState && (
            <div className="mt-4 p-4 bg-background rounded-lg border space-y-2">
              <h3 className="font-semibold text-base">Requirements for {selectedStateName}:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>Will Witnesses Required:</strong> {stateInfo.willWitnesses}</li>
                <li>• <strong>Notary Required:</strong> {stateInfo.notaryRequired ? "Yes" : "No"}</li>
                <li>• <strong>Advance Directive:</strong> {stateInfo.advanceDirectiveType}</li>
                <li>• <strong>Probate Threshold:</strong> {stateInfo.probateThreshold}</li>
              </ul>
              {stateInfo.notes && (
                <p className="text-sm text-muted-foreground pt-2 italic">
                  ℹ️ {stateInfo.notes}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legal Disclaimer - Prominent */}
      <Alert variant="destructive" className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-bold mb-2">Important Legal Disclaimer</AlertTitle>
        <AlertDescription className="text-base space-y-2">
          <p>
            <strong>We are not attorneys and do not provide legal advice.</strong> The information on this page 
            is for educational purposes only and should not be considered legal advice.
          </p>
          <p>
            Legal requirements vary by state and change over time. Always consult with a qualified attorney 
            in your state for advice specific to your situation.
          </p>
          <p className="pt-2 font-semibold">
            Using these resources does not create an attorney-client relationship.
          </p>
        </AlertDescription>
      </Alert>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              State-Specific Forms
            </CardTitle>
            <CardDescription className="text-base">
              Find legal forms and requirements for your state
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedState 
                ? `Select your state above to see specific legal requirements for ${selectedStateName}.`
                : "Each state has different laws about wills, advance directives, and power of attorney. Select your state above to see specific requirements."
              }
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="#state-resources">
                {selectedState ? `View ${selectedStateName} Resources` : "Select a State to View Resources"}
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              Document Guides
            </CardTitle>
            <CardDescription className="text-base">
              Learn what each legal document does
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Understand the purpose of different legal documents and which ones you might need 
              for your situation.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href="#document-guides">Learn More</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Common Questions about Legal Documents */}
      <div className="space-y-4" id="document-guides">
        <h2 className="text-2xl font-bold">Common Questions About Legal Documents</h2>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="advance-directive">
            <AccordionTrigger className="text-lg">What is an Advance Directive?</AccordionTrigger>
            <AccordionContent>
              <div className="text-base text-muted-foreground space-y-3">
                <p>
                  An advance directive is a legal document that tells doctors and family members your wishes 
                  for medical care if you become unable to speak for yourself.
                </p>
                <p>
                  It typically includes two parts:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Living Will:</strong> Describes what medical treatments you do or don't want</li>
                  <li><strong>Healthcare Power of Attorney:</strong> Names someone to make medical decisions for you</li>
                </ul>
                <p className="pt-2">
                  Every adult should have an advance directive. It gives you control and prevents family disagreements 
                  during difficult times.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="will-vs-trust">
            <AccordionTrigger className="text-lg">What's the difference between a Will and a Trust?</AccordionTrigger>
            <AccordionContent>
              <div className="text-base text-muted-foreground space-y-3">
                <p><strong>A Will:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Takes effect only after you pass away</li>
                  <li>Goes through probate court (public process)</li>
                  <li>Names guardians for minor children</li>
                  <li>Less expensive to create</li>
                </ul>
                <p><strong>A Trust:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Can take effect while you're still alive</li>
                  <li>Avoids probate (private, faster process)</li>
                  <li>Gives more control over when/how assets are distributed</li>
                  <li>More complex and expensive to set up</li>
                </ul>
                <p className="pt-2">
                  Many people benefit from having both. Consult with an estate planning attorney to determine 
                  what's best for your situation.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="power-of-attorney">
            <AccordionTrigger className="text-lg">What is a Power of Attorney?</AccordionTrigger>
            <AccordionContent>
              <div className="text-base text-muted-foreground space-y-3">
                <p>
                  A Power of Attorney (POA) is a legal document that gives someone you trust the authority 
                  to act on your behalf.
                </p>
                <p><strong>Types of Power of Attorney:</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Financial POA:</strong> Handles money, property, and business matters</li>
                  <li><strong>Healthcare POA:</strong> Makes medical decisions (also called Healthcare Proxy)</li>
                  <li><strong>Durable POA:</strong> Remains valid even if you become incapacitated</li>
                  <li><strong>Springing POA:</strong> Only takes effect when a specific event occurs</li>
                </ul>
                <p className="pt-2">
                  Choose someone you trust completely and discuss your wishes with them before signing any POA document.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="notary">
            <AccordionTrigger className="text-lg">Do I need a notary or witnesses?</AccordionTrigger>
            <AccordionContent>
              <div className="text-base text-muted-foreground space-y-3">
                <p>
                  Requirements vary by state and document type:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Wills:</strong> Usually require 2-3 witnesses (requirements vary by state)</li>
                  <li><strong>Power of Attorney:</strong> Often requires notarization</li>
                  <li><strong>Advance Directives:</strong> May require witnesses or notarization depending on state</li>
                  <li><strong>Trusts:</strong> Usually require notarization</li>
                </ul>
                <p className="pt-2">
                  Check your state's specific requirements. Many banks, libraries, and government offices offer 
                  free notary services. Witnesses should be adults who are not beneficiaries in your documents.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="update">
            <AccordionTrigger className="text-lg">How often should I update my legal documents?</AccordionTrigger>
            <AccordionContent>
              <div className="text-base text-muted-foreground space-y-3">
                <p>
                  Review and update your documents whenever major life events occur:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Marriage or divorce</li>
                  <li>Birth or adoption of children</li>
                  <li>Death of a beneficiary or named executor</li>
                  <li>Significant change in assets or property</li>
                  <li>Move to a different state</li>
                  <li>Change in health status</li>
                </ul>
                <p>
                  Even without major changes, review your documents every 3-5 years to ensure they still 
                  reflect your wishes and comply with current laws.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cost">
            <AccordionTrigger className="text-lg">How much does it cost to create these documents?</AccordionTrigger>
            <AccordionContent>
              <div className="text-base text-muted-foreground space-y-3">
                <p><strong>DIY Options (Free - $200):</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Free state-provided forms (advance directives)</li>
                  <li>Online legal document services ($50-$200)</li>
                  <li>Self-help books with templates</li>
                </ul>
                <p><strong>Attorney Services ($300 - $3,000+):</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Simple will: $300-$1,000</li>
                  <li>Basic estate plan (will, POA, advance directive): $1,000-$2,000</li>
                  <li>Living trust: $1,500-$3,000+</li>
                  <li>Complex estate plan: $3,000-$7,000+</li>
                </ul>
                <p className="pt-2">
                  For simple situations, DIY documents may be sufficient. For complex estates, blended families, 
                  or business ownership, consulting an attorney is strongly recommended.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Trusted Resources */}
      <div className="space-y-4" id="state-resources">
        <h2 className="text-2xl font-bold">Trusted Resources & Organizations</h2>
        
        {/* State-Specific Resources - Show when state is selected */}
        {selectedState && (
          <Alert className="border-primary/30 bg-primary/5">
            <MapPin className="h-5 w-5 text-primary" />
            <AlertTitle className="font-bold">Resources for {selectedStateName}</AlertTitle>
            <AlertDescription className="space-y-3 mt-2">
              <p className="text-sm">
                Here are some helpful starting points for finding legal forms and information specific to {selectedStateName}:
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(selectedStateName + " advance directive form official")}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Search for {selectedStateName} Advance Directive Forms
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(selectedStateName + " last will testament requirements")}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Search for {selectedStateName} Will Requirements
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild className="w-full justify-start">
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(selectedStateName + " power of attorney form official")}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Search for {selectedStateName} Power of Attorney Forms
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                National Healthcare Decisions Day
              </CardTitle>
              <CardDescription>Free advance directive forms and state-specific information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Provides free, state-specific advance directive forms and educational resources about healthcare decisions.
              </p>
              <Button variant="outline" asChild>
                <a href="https://theconversationproject.org/nhdd/" target="_blank" rel="noopener noreferrer">
                  Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                National Association of Estate Planners & Councils
              </CardTitle>
              <CardDescription>Find qualified estate planning professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Directory of accredited estate planning attorneys, CPAs, and financial advisors in your area.
              </p>
              <Button variant="outline" asChild>
                <a href="https://www.naepc.org/" target="_blank" rel="noopener noreferrer">
                  Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                American Bar Association
              </CardTitle>
              <CardDescription>Free legal guides and lawyer referral service</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Comprehensive guides on estate planning, wills, trusts, and how to find an attorney in your state.
              </p>
              <Button variant="outline" asChild>
                <a href="https://www.americanbar.org/groups/real_property_trust_estate/" target="_blank" rel="noopener noreferrer">
                  Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-primary" />
                Caring.com
              </CardTitle>
              <CardDescription>Estate planning guides and state-specific information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Detailed state-by-state guides for wills, probate, power of attorney, and advance directives.
              </p>
              <Button variant="outline" asChild>
                <a href="https://www.caring.com/caregivers/estate-planning/" target="_blank" rel="noopener noreferrer">
                  Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Ready to Start Planning?</CardTitle>
          <CardDescription className="text-base">
            Use our Pre-Planning tool to organize all your important information in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground">
            While you research and create your legal documents, use our planner to keep track of:
          </p>
          <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground ml-4">
            <li>Where your legal documents are stored</li>
            <li>Names and contact info for your attorney, executor, and healthcare proxy</li>
            <li>Important account numbers and passwords</li>
            <li>Your wishes for funeral arrangements and final care</li>
          </ul>
          <div className="flex gap-3 pt-4">
            <Button size="lg" asChild>
              <Link to="/preplansteps">
                Go to Pre-Planning Tool <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/resources">View More Resources</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
