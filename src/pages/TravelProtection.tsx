import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, CheckCircle2, AlertTriangle, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TravelProtection() {
  const { t } = useTranslation();
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
            {t('travelProtection.title', 'Travel Death Protection')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('travelProtection.subtitle', 'One Less Thing for Your Family to Worry About')}
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="p-6 mb-6">
          <p className="text-lg text-muted-foreground mb-6">
            {t('travelProtection.mainDescription', 'If someone passes away while traveling far from home, the cost and logistics can be overwhelming. Flights, paperwork, local laws, and language barriers can delay everything and cost thousands.')}
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            {t('travelProtection.planDescription', 'This travel protection plan covers the coordination and transportation needed to bring your loved one home. It works worldwide and is paid once, not monthly.')}
          </p>
          <p className="text-muted-foreground">
            {t('travelProtection.familyBenefit', 'The company handles the details so your family does not have to make urgent decisions during a crisis.')}
          </p>
        </Card>

        {/* Best For Section */}
        <Card className="p-6 mb-6 bg-sky-50 dark:bg-sky-950/20 border-sky-200">
          <h2 className="text-lg font-semibold mb-4">
            {t('travelProtection.bestForTitle', 'Best for')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              <span>{t('travelProtection.frequentTravelers', 'Frequent travelers')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              <span>{t('travelProtection.snowbirds', 'Snowbirds')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              <span>{t('travelProtection.retirees', 'Retirees')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              <span>{t('travelProtection.militaryFamilies', 'Military families')}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
              <span>{t('travelProtection.familyOtherStates', 'Anyone with family in other states or countries')}</span>
            </div>
          </div>
        </Card>

        {/* What This Plan Helps With - Expandable */}
        <Card className="p-6 mb-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="what-helps" className="border-none">
              <AccordionTrigger className="hover:no-underline py-0">
                <h2 className="text-lg font-semibold">
                  {t('travelProtection.whatHelpsTitle', 'What this plan helps with')}
                </h2>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('travelProtection.helpTransportation', 'Transportation of remains back home')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('travelProtection.helpCoordination', 'International and out-of-state coordination')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('travelProtection.helpPaperwork', 'Paperwork and local requirements')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('travelProtection.helpCremation', 'Optional cremation and return of ashes')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('travelProtection.helpBacked', 'Assistance backed by an established insurance underwriter')}</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        {/* Important Note */}
        <Card className="p-6 mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">
                {t('travelProtection.importantNote', 'Important note')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('travelProtection.notRequired', 'This is not required. It is an optional planning tool for people who travel or live part-time away from home.')}
              </p>
            </div>
          </div>
        </Card>

        {/* CTA Button */}
        <div className="text-center mb-8">
          <Button 
            size="lg"
            className="bg-sky-600 hover:bg-sky-700"
            onClick={() => window.open('https://www.efafuneral.com/travel-protection', '_blank')}
          >
            {t('travelProtection.learnMoreButton', 'Learn More About Travel Protection')}
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="p-4 bg-muted/50">
          <p className="text-xs text-muted-foreground text-center">
            {t('travelProtection.disclaimer', 'Everlasting Funeral Advisors does not provide insurance and does not guarantee coverage outcomes. This resource is provided for educational purposes. All services, pricing, and eligibility are determined by the provider.')}
          </p>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/preplansteps')}>
            Back to Planning Menu
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
