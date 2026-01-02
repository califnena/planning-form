import { useNavigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TravelProtection() {
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Travel Protection
          </h1>
          <p className="text-xl text-muted-foreground">
            Understanding Your Options
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1 text-base">Important Notice</h3>
              <p className="text-base text-muted-foreground">
                This page is for educational purposes only. We do not sell, recommend, or have any affiliation with travel protection providers.
              </p>
            </div>
          </div>
        </Card>

        {/* What is Travel Protection */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <HelpCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
            <h2 className="text-xl font-semibold">What is travel protection?</h2>
          </div>
          <p className="text-base text-muted-foreground mb-4">
            Travel protection helps cover the cost and coordination of bringing someone home if death occurs while traveling or living away from home.
          </p>
          <p className="text-base text-muted-foreground">
            This may include medical transport, repatriation of remains, and coordination with local authorities.
          </p>
        </Card>

        {/* Why It Matters */}
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Info className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
            <h2 className="text-xl font-semibold">Why it matters</h2>
          </div>
          <ul className="space-y-3 text-base text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Without coverage, families may face unexpected costs ranging from $10,000 to $50,000 or more.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Coordination with foreign authorities, airlines, and funeral homes can be complex and time-sensitive.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Standard travel insurance often does not cover transportation of remains.
            </li>
          </ul>
        </Card>

        {/* What Families Often Miss */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What families often miss</h2>
          <ul className="space-y-3 text-base text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Assuming their regular health insurance or Medicare covers transport home — it usually does not.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Not understanding the difference between membership plans (pay annually) and insurance plans (reimburse after).
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              Waiting until after a trip to investigate options.
            </li>
          </ul>
        </Card>

        {/* Questions to Ask a Provider */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Questions to ask a provider</h2>
          <ul className="space-y-3 text-base text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              Does this plan cover transportation of remains if death occurs away from home?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              Are there age limits or pre-existing condition exclusions?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              Is this a membership (direct coverage) or insurance (reimbursement after)?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              What is the coverage limit, and are there any out-of-pocket costs?
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              How does the claims or coordination process work?
            </li>
          </ul>
        </Card>

        {/* FAQs */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="required">
              <AccordionTrigger className="text-base text-left">
                Is travel protection required?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                No. It is optional. However, it may provide peace of mind if you travel frequently or spend part of the year away from home.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="who">
              <AccordionTrigger className="text-base text-left">
                Who should consider it?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                People who travel often, snowbirds, RV travelers, or anyone living part-time away from home.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="medicare">
              <AccordionTrigger className="text-base text-left">
                Does Medicare cover transport home?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                No. Medicare does not cover medical transport or repatriation of remains if death occurs away from home.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="difference">
              <AccordionTrigger className="text-base text-left">
                What's the difference between membership and insurance?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                <strong>Membership plans:</strong> Pay once per year. Transport is usually arranged and paid directly. Fewer surprises.
                <br /><br />
                <strong>Insurance plans:</strong> Often reimburse after the fact. Coverage limits apply. Claims may take time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/resources')} className="text-base h-12">
            Back to Resources
          </Button>
          <Button onClick={() => navigate('/preplandashboard?section=preplanning')} className="text-base h-12">
            Add to My Plan
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
