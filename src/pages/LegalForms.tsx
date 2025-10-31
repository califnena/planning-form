import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, ExternalLink, FileText, Scale, Heart, FileCheck, UserCheck, Stethoscope, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageSelector } from "@/components/LanguageSelector";

const LegalForms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <Link to="/" className="block">
              <h1 className="text-xl font-semibold text-primary">My Final Wishes</h1>
              <p className="text-xs text-muted-foreground">Legal Documents & Resources</p>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Essential Legal Documents & Resources
          </h1>
          <p className="text-lg text-muted-foreground">
            Free state-specific forms and guidance for end-of-life planning
          </p>
        </div>

        {/* Primary Disclaimer */}
        <Alert className="mb-8 border-destructive bg-destructive/5">
          <Shield className="h-5 w-5 text-destructive" />
          <AlertTitle className="text-destructive font-bold text-lg mb-2">
            IMPORTANT LEGAL DISCLAIMER
          </AlertTitle>
          <AlertDescription className="text-sm space-y-2 text-foreground/90">
            <p className="font-semibold">
              The information and resources provided here are for educational purposes only and do not constitute legal advice. We are not a law firm and do not provide legal services.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>These forms must be specific to your state to be legally valid</li>
              <li>State laws vary significantly regarding execution requirements (witnesses, notarization)</li>
              <li>We strongly recommend consulting with an attorney for complex situations or if you have questions</li>
              <li>Improperly executed documents may not be legally enforceable</li>
            </ul>
            <p className="font-semibold mt-3">
              By using these resources, you acknowledge that you understand these limitations and agree to obtain proper legal counsel as needed.
            </p>
          </AlertDescription>
        </Alert>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <p className="text-base text-muted-foreground leading-relaxed">
              Planning ahead with the right legal documents ensures your wishes are honored and reduces burden on your loved ones during difficult times. Below is a guide to essential legal forms. <strong>Remember: these documents must be specific to your state to be legally valid.</strong> We've provided links to trusted resources where you can access free, state-specific forms.
            </p>
          </CardContent>
        </Card>

        {/* FAQ Section with Documents and Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions & Resources</h2>
          
          <Accordion type="single" collapsible className="space-y-3">
            {/* Legal Documents Guide */}
            <AccordionItem value="documents" className="border border-primary/30 rounded-lg px-4 bg-primary/5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-base">Legal Documents Guide</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <Accordion type="single" collapsible className="space-y-3">
                  
                  {/* Advance Directive */}
                  <AccordionItem value="advance-directive" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <FileCheck className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">Advance Directive (Healthcare Directive)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A legal document that communicates your wishes about medical treatment if you become unable to make decisions for yourself. May include instructions about life support, resuscitation, pain management, and organ donation.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Every adult should consider having an advance directive.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>STATE-SPECIFIC REQUIREMENT:</strong> This document must comply with your state's specific legal requirements.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <a 
                              href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              AARP Advance Directives - Free state-specific forms
                            </a>
                            <a 
                              href="https://www.caringinfo.org/planning/advance-directives/by-state/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              CaringInfo - Free state-specific forms with instructions
                            </a>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Living Will */}
                  <AccordionItem value="living-will" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">Living Will</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A document that specifies your preferences for life-sustaining medical treatment in end-of-life situations. It typically addresses decisions about ventilators, feeding tubes, resuscitation, and other interventions when there is no reasonable hope of recovery.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Anyone who wants to ensure their end-of-life treatment preferences are known and followed.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>STATE-SPECIFIC REQUIREMENT:</strong> This document must comply with your state's specific legal requirements.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <a 
                              href="https://www.caringinfo.org/planning/advance-directives/by-state/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              CaringInfo - Often included in advance directive forms
                            </a>
                            <a 
                              href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              AARP - State-specific versions
                            </a>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Medical Power of Attorney */}
                  <AccordionItem value="medical-poa" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <UserCheck className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">Medical Power of Attorney (Healthcare Proxy)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A document that designates someone you trust (your "agent" or "healthcare proxy") to make medical decisions on your behalf if you're unable to do so. This person will work with doctors to make treatment decisions based on your wishes.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Everyone should designate a healthcare proxy - someone who will advocate for your medical preferences.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>STATE-SPECIFIC REQUIREMENT:</strong> This document must comply with your state's specific legal requirements.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <a 
                              href="https://www.caringinfo.org/planning/advance-directives/by-state/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              CaringInfo - Often combined with advance directives
                            </a>
                            <a 
                              href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              AARP - State-specific forms
                            </a>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Financial Power of Attorney */}
                  <AccordionItem value="financial-poa" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Scale className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">Durable Power of Attorney (Financial)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A document that authorizes someone to manage your financial affairs if you become incapacitated. This can include paying bills, managing bank accounts, handling investments, and making financial decisions. "Durable" means it remains valid even if you become mentally incapacitated.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Anyone who wants to ensure their financial matters are handled without court intervention if they become unable to manage them.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>STATE-SPECIFIC REQUIREMENT:</strong> This document must comply with your state's specific legal requirements.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Check your state's official government website or legal aid organizations in your state</p>
                            <a 
                              href="https://eforms.com/power-of-attorney/durable/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              eForms.com - State-specific templates
                            </a>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* HIPAA Authorization */}
                  <AccordionItem value="hipaa" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Stethoscope className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">HIPAA Authorization</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A document that authorizes specific people to access your protected health information. Under federal privacy laws (HIPAA), healthcare providers cannot share your medical information without your permission. This form grants that permission to designated individuals.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Anyone who wants family members or friends to be able to discuss their medical condition with healthcare providers.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>NOTE:</strong> Federal law applies, but state requirements for execution may vary.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Often included with advance directive forms or available from your healthcare provider</p>
                            <a 
                              href="https://www.caringinfo.org/planning/advance-directives/by-state/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              CaringInfo - Forms typically include HIPAA authorization
                            </a>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* DNR */}
                  <AccordionItem value="dnr" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <XCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">Do Not Resuscitate (DNR) Order</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A medical order that instructs healthcare providers not to perform CPR if your heart stops or you stop breathing. This is different from an advance directive - it's an actual medical order signed by a physician.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Individuals with serious illness or advanced age who do not wish to receive CPR.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>STATE-SPECIFIC REQUIREMENT:</strong> Must be on your state's approved form and signed by a physician.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              <strong>Discuss with your doctor</strong> - they must complete and sign this form. State health department websites often provide DNR forms. Some states have portable/out-of-hospital DNR forms for use outside medical facilities.
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Organ Donation */}
                  <AccordionItem value="organ-donation" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Heart className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">Organ Donation Authorization</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> Documentation of your decision to donate organs, tissues, or your whole body after death. This is typically indicated on your driver's license, but a separate document can provide more detailed instructions.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Anyone who wishes to donate organs or tissues after death.
                        </p>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>NOTE:</strong> State registries vary; driver's license designation is most common.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Register with your state's donor registry (link on driver's license application) or include wishes in your advance directive</p>
                            <a 
                              href="https://www.donatelife.net/" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Donate Life America - National organ donation registry
                            </a>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Last Will and Testament */}
                  <AccordionItem value="will" className="border border-border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Scale className="h-5 w-5 text-destructive flex-shrink-0" />
                        <span className="font-semibold">Last Will and Testament (Requires Greater Caution)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">What it is:</strong> A legal document that specifies how you want your property and assets distributed after death, names guardians for minor children, and designates an executor to manage your estate.
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          <strong className="text-foreground">Who needs it:</strong> Anyone with assets, property, or minor children.
                        </p>
                        <Alert className="border-destructive bg-destructive/10 mb-3">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <AlertDescription className="text-xs text-destructive">
                            <strong>STRICT state requirements for execution - strongly consider attorney consultation</strong>
                          </AlertDescription>
                        </Alert>
                        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20 mb-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>SPECIAL NOTE:</strong> Wills have very specific requirements that vary significantly by state (witness qualifications, number of witnesses, notarization requirements, specific language). An improperly executed will may be invalid, causing your estate to be distributed according to state law rather than your wishes. For any but the simplest estates, attorney consultation is strongly recommended.
                          </AlertDescription>
                        </Alert>
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-2">Where to find it:</p>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground font-semibold">
                              <strong>Consider consulting an attorney</strong> - wills have strict execution requirements and are more likely to be contested if improperly created.
                            </p>
                            <p className="text-sm text-muted-foreground">State bar associations often provide basic will forms, or online legal services (LegalZoom, Nolo) offer state-specific templates.</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>

            {/* Resources Section */}
            <AccordionItem value="resources" className="border border-primary/30 rounded-lg px-4 bg-primary/5">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <ExternalLink className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-base">Trusted Resources for State-Specific Forms</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                {/* AARP Section */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-primary" />
                      AARP Advance Directives
                    </CardTitle>
                    <CardDescription>
                      Free state-specific healthcare documents for all 50 states
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">What AARP provides:</strong> AARP offers free, downloadable advance directive forms tailored to each state's specific legal requirements. Their forms are legally valid and designed to be easy to complete.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Best for:</strong> Advance directives, living wills, and healthcare powers of attorney. AARP provides separate forms for each state, ensuring compliance with local laws.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Why state-specific matters:</strong> Each state has unique requirements for valid advance directives. AARP's state-specific forms include the exact language, witness requirements, and notarization needs required by your state's law.
                    </p>
                    <a 
                      href="https://www.aarp.org/caregiving/financial-legal/free-printable-advance-directives/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit AARP Advance Directives →
                    </a>
                  </CardContent>
                </Card>

                {/* CaringInfo Section */}
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ExternalLink className="h-5 w-5 text-primary" />
                      CaringInfo (National Hospice and Palliative Care Organization)
                    </CardTitle>
                    <CardDescription>
                      State-specific forms with detailed instructions and guidance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">What CaringInfo provides:</strong> CaringInfo, a program of the National Hospice and Palliative Care Organization, offers free advance directives for every state with comprehensive instructions, FAQs, and completion guidance.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Best for:</strong> Users who want detailed guidance on completing their forms. CaringInfo includes step-by-step instructions, explanations of medical terminology, and answers to common questions about end-of-life planning.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Why state-specific matters:</strong> Legal requirements vary dramatically between states - from witness qualifications to specific mandatory language. CaringInfo's forms are updated regularly to reflect current state laws and include state-specific instructions for proper execution.
                    </p>
                    <a 
                      href="https://www.caringinfo.org/planning/advance-directives/by-state/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-semibold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit CaringInfo →
                    </a>
                  </CardContent>
                </Card>

                {/* Additional Resources */}
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">Additional Resources:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Your state's official government website (search "[Your State] advance directive")</li>
                    <li>• Your state's Bar Association (for attorney referrals and legal aid)</li>
                    <li>• Local Area Agency on Aging</li>
                    <li>• Legal Aid organizations in your state</li>
                    <li>
                      <a 
                        href="https://www.donatelife.net/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Donate Life America - National organ donation registration
                      </a>
                    </li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* FAQ Questions */}
            <AccordionItem value="faq-1" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                Why can't I use one form for all states?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Each state has its own legal requirements for advance directives, powers of attorney, and other legal documents. Some states require specific mandatory language, unique notices, or their own statutory forms. A form from one state may not be legally valid in another state. To ensure your documents are enforceable, always use forms designed specifically for your state.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                Do I need an attorney to complete these forms?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Many basic legal forms can be completed without an attorney, including advance directives, living wills, and powers of attorney. However, you should consider consulting an attorney if:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>You have a complex estate or family situation</li>
                  <li>You have questions about what powers to grant</li>
                  <li>You want to ensure everything is properly executed</li>
                  <li>You need forms that go beyond basic templates</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                What's the difference between an advance directive and a living will?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  The terminology varies by state, but generally:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>A <strong>living will</strong> specifies your wishes about life-sustaining medical treatment if you become unable to communicate</li>
                  <li>An <strong>advance directive</strong> is a broader term that may include both a living will and a healthcare power of attorney</li>
                  <li>Some states combine these into a single document, while others have separate forms</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                How do I make sure my forms are legally valid?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">To ensure validity:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Use forms specifically designed for your state</li>
                  <li>Follow all execution requirements (witnesses, notarization) exactly as specified</li>
                  <li>Ensure witnesses meet your state's qualifications (not family members, not beneficiaries, etc.)</li>
                  <li>Store originals in a safe place and provide copies to relevant parties (healthcare proxy, family, doctors)</li>
                  <li>Review and update documents regularly, especially after major life changes</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                What happens if I spend time in multiple states?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Some states honor advance directives from other states, while others require compliance with their own laws. If you regularly spend significant time in multiple states (such as snowbirds), it's recommended to complete advance directives for each state where you reside.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-6" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                Can I change or revoke these documents later?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground">
                  Yes. You can typically revoke or modify these documents at any time while you have mental capacity. Follow your state's specific procedures for revocation, which may include destroying the original, creating a new document, or filing a written revocation. Always notify everyone who has copies of the old document.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-7" className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline text-left">
                Where should I keep these documents?
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Keep original documents in a safe but accessible location. Provide copies to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                  <li>Your healthcare agent/proxy</li>
                  <li>Your primary care physician</li>
                  <li>Close family members</li>
                  <li>Your attorney (if you have one)</li>
                  <li>Hospital or nursing facility (if applicable)</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2 font-semibold">
                  Do NOT keep them in a safe deposit box, as they may not be accessible in an emergency.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to Start Planning?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Use our comprehensive planning tool to organize all your end-of-life wishes in one secure place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2024 My Final Wishes. All rights reserved.</p>
          <p className="mt-2">This site provides educational information only and does not constitute legal advice.</p>
        </div>
      </footer>
    </div>
  );
};

export default LegalForms;
