import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plane, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TravelProtectionData {
  travelAway: string;
  homeCity: string;
  homeState: string;
  hasCoverage: string;
  coverageType: string;
  providerName: string;
  notes: string;
}

const PROVIDERS = [
  { name: "Medjet", area: "Worldwide", type: "Membership", cost: "$300–$600 / year", url: "https://medjet.com" },
  { name: "AirMedCare Network", area: "United States", type: "Membership", cost: "$99–$150 / year", url: "https://airmedcarenetwork.com" },
  { name: "MASA Global", area: "Worldwide", type: "Membership", cost: "$400–$700 / year", url: "https://masaglobal.com" },
  { name: "Global Rescue", area: "Worldwide", type: "Membership", cost: "$329–$649 / year", url: "https://globalrescue.com" },
  { name: "Seven Corners", area: "Worldwide", type: "Insurance", cost: "$150–$500 / trip", url: "https://sevencorners.com" },
  { name: "Travelex Insurance", area: "Worldwide", type: "Insurance", cost: "$100–$400 / trip", url: "https://travelexinsurance.com" },
];

export default function TravelProtection() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<TravelProtectionData>({
    travelAway: "",
    homeCity: "",
    homeState: "",
    hasCoverage: "",
    coverageType: "",
    providerName: "",
    notes: "",
  });

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem("travel-protection-data");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
  }, []);

  // Auto-save on change
  useEffect(() => {
    localStorage.setItem("travel-protection-data", JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: keyof TravelProtectionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
            If Death Occurs Away From Home
          </p>
        </div>

        {/* Disclaimer */}
        <Card className="p-4 mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1 text-base">Important Notice</h3>
              <p className="text-base text-muted-foreground">
                We are not affiliated with, sponsored by, or compensated by any travel protection provider listed below.
              </p>
              <p className="text-base text-muted-foreground mt-2">
                Information is provided for planning and educational purposes only. Coverage, pricing, and eligibility vary by provider and plan.
              </p>
            </div>
          </div>
        </Card>

        {/* Plain-Language Explanation */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">What is travel protection?</h2>
          <p className="text-base text-muted-foreground mb-4">
            Travel protection helps cover the cost and coordination of bringing someone home if death occurs while traveling.
          </p>
          <h3 className="text-lg font-semibold mb-2">Why it matters:</h3>
          <p className="text-base text-muted-foreground">
            Without coverage, families may face high costs and delays during an already stressful time.
          </p>
        </Card>

        {/* Your Travel Information */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Travel Information</h2>
          
          <div className="space-y-6">
            {/* Do you travel away from home */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Do you travel away from home overnight?
              </Label>
              <RadioGroup 
                value={formData.travelAway} 
                onValueChange={(v) => updateField("travelAway", v)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="travel-yes" className="h-6 w-6" />
                  <Label htmlFor="travel-yes" className="text-base cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="travel-no" className="h-6 w-6" />
                  <Label htmlFor="travel-no" className="text-base cursor-pointer">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="travel-unsure" className="h-6 w-6" />
                  <Label htmlFor="travel-unsure" className="text-base cursor-pointer">Unsure</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Primary home location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="home-city" className="text-base font-medium mb-2 block">
                  Primary home city
                </Label>
                <Input
                  id="home-city"
                  value={formData.homeCity}
                  onChange={(e) => updateField("homeCity", e.target.value)}
                  placeholder="City"
                  className="text-base h-12"
                />
              </div>
              <div>
                <Label htmlFor="home-state" className="text-base font-medium mb-2 block">
                  State
                </Label>
                <Input
                  id="home-state"
                  value={formData.homeState}
                  onChange={(e) => updateField("homeState", e.target.value)}
                  placeholder="State"
                  className="text-base h-12"
                />
              </div>
            </div>

            {/* Travel protection in place */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Travel protection in place?
              </Label>
              <RadioGroup 
                value={formData.hasCoverage} 
                onValueChange={(v) => updateField("hasCoverage", v)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="coverage-yes" className="h-6 w-6" />
                  <Label htmlFor="coverage-yes" className="text-base cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="coverage-no" className="h-6 w-6" />
                  <Label htmlFor="coverage-no" className="text-base cursor-pointer">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="coverage-unsure" className="h-6 w-6" />
                  <Label htmlFor="coverage-unsure" className="text-base cursor-pointer">Unsure</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Type of coverage */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Type of coverage
              </Label>
              <RadioGroup 
                value={formData.coverageType} 
                onValueChange={(v) => updateField("coverageType", v)}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="membership" id="type-membership" className="h-6 w-6" />
                  <Label htmlFor="type-membership" className="text-base cursor-pointer">Membership</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="insurance" id="type-insurance" className="h-6 w-6" />
                  <Label htmlFor="type-insurance" className="text-base cursor-pointer">Insurance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="type-unsure" className="h-6 w-6" />
                  <Label htmlFor="type-unsure" className="text-base cursor-pointer">Unsure</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Provider name */}
            <div>
              <Label htmlFor="provider-name" className="text-base font-medium mb-2 block">
                Provider name (optional)
              </Label>
              <Input
                id="provider-name"
                value={formData.providerName}
                onChange={(e) => updateField("providerName", e.target.value)}
                placeholder="e.g., Medjet, AirMedCare"
                className="text-base h-12"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-base font-medium mb-2 block">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Any additional details about your coverage or travel plans"
                className="text-base min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        {/* Provider Comparison Table */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Reliable Prepaid Travel Protection Options</h2>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-base font-semibold">Provider</TableHead>
                  <TableHead className="text-base font-semibold">Coverage Area</TableHead>
                  <TableHead className="text-base font-semibold">Type</TableHead>
                  <TableHead className="text-base font-semibold">Approx. Cost*</TableHead>
                  <TableHead className="text-base font-semibold">Website</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROVIDERS.map((provider) => (
                  <TableRow key={provider.name}>
                    <TableCell className="text-base font-medium">{provider.name}</TableCell>
                    <TableCell className="text-base">{provider.area}</TableCell>
                    <TableCell className="text-base">{provider.type}</TableCell>
                    <TableCell className="text-base">{provider.cost}</TableCell>
                    <TableCell>
                      <a 
                        href={provider.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-base"
                      >
                        Visit <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4 italic">
            *Approximate costs shown for planning purposes only. Actual pricing varies by age, location, and coverage level.
          </p>
        </Card>

        {/* Membership vs Insurance */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Membership vs Insurance</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Membership plans:</h3>
              <p className="text-base text-muted-foreground">
                Pay once per year. Transport is usually arranged and paid directly. Fewer surprises.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">Insurance plans:</h3>
              <p className="text-base text-muted-foreground">
                Often reimburse after the fact. Coverage limits apply. Claims may take time.
              </p>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-base text-muted-foreground">
                <strong>Plain truth:</strong> Many people assume travel insurance covers transportation home. Many plans do not.
              </p>
            </div>
          </div>
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
                No. It is optional.
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
            
            <AccordionItem value="recommend">
              <AccordionTrigger className="text-base text-left">
                Do you sell or recommend one provider over another?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                No. We are not affiliated with any provider listed.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="later">
              <AccordionTrigger className="text-base text-left">
                Can I add this later?
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                Yes. You can update this section anytime.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/preplansteps')} className="text-base h-12">
            Skip for now
          </Button>
          <Button onClick={() => navigate('/plan-summary')} className="text-base h-12">
            View My Plan
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
