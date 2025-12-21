import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { launchCheckout } from "@/lib/checkoutLauncher";

export default function DoItForYouIntake() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    preferredName: "",
    dob: "",
    email: "",
    phone: "",
    relationship: "",
    helpTopics: [] as string[],
    involvementLevel: "",
    servicePreference: "",
    serviceType: "",
    locationPreference: "",
    nonNegotiables: "",
    primaryContactName: "",
    primaryContactRelationship: "",
    primaryContactPhone: "",
    primaryContactEmail: "",
    secondaryContactName: "",
    secondaryContactRelationship: "",
    secondaryContactPhone: "",
    secondaryContactEmail: "",
    timing: "",
    bestTimes: "",
    notes: "",
    consent: false
  });

  const helpTopicOptions = [
    { id: "review_started", label: "Help reviewing what I've started" },
    { id: "finish_planning", label: "Help finishing the planning" },
    { id: "questions_guidance", label: "I have questions and need guidance" },
    { id: "not_sure", label: "I'm not sure what I need yet" },
    { id: "plan_ahead", label: "Plan Ahead information and wishes" },
    { id: "after_death", label: "After-death checklist setup for my family" },
    { id: "contacts", label: "Contacts and key people list" },
    { id: "documents", label: "Documents list and organization" },
    { id: "obituary", label: "Writing a short obituary or life summary" },
    { id: "custom_song", label: "Custom memorial song request" },
    { id: "other", label: "Other" }
  ];

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);
      setFormData(prev => ({ ...prev, email: user.email || "" }));

      // Check if user has EFADOFORU access
      const { data: purchases } = await supabase
        .from('purchases')
        .select('product_lookup_key')
        .eq('user_id', user.id)
        .eq('product_lookup_key', 'EFADOFORU')
        .eq('status', 'completed');

      // Also check user_roles for done_for_you role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role_id, app_roles(name)')
        .eq('user_id', user.id);

      const hasDoneForYouRole = roles?.some((r: any) => r.app_roles?.name === 'done_for_you');
      const hasPurchase = purchases && purchases.length > 0;

      setHasAccess(hasPurchase || hasDoneForYouRole);
    } catch (error) {
      console.error('Error checking access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async () => {
    await launchCheckout({
      lookupKey: 'EFADOFORU',
      successUrl: `${window.location.origin}/do-it-for-you/confirmation`,
      cancelUrl: window.location.href,
      navigate,
      onLoadingChange: setIsPurchasing,
    });
  };

  const handleHelpTopicChange = (topicId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      helpTopics: checked 
        ? [...prev.helpTopics, topicId]
        : prev.helpTopics.filter(t => t !== topicId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (!formData.relationship) {
      toast.error("Please select your relationship");
      return;
    }
    if (formData.helpTopics.length === 0) {
      toast.error("Please select at least one topic you want help with");
      return;
    }
    if (!formData.involvementLevel) {
      toast.error("Please select how involved you want to be");
      return;
    }
    if (!formData.primaryContactName.trim()) {
      toast.error("Please enter the primary contact name");
      return;
    }
    if (!formData.primaryContactRelationship.trim()) {
      toast.error("Please enter the primary contact relationship");
      return;
    }
    if (!formData.primaryContactPhone && !formData.primaryContactEmail) {
      toast.error("Please enter at least a phone or email for the primary contact");
      return;
    }
    if (!formData.timing) {
      toast.error("Please select when you would like to start");
      return;
    }
    if (!formData.consent) {
      toast.error("Please confirm you understand this service");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('efa_do_for_you_intake').insert({
        user_id: user.id,
        full_name: formData.fullName,
        preferred_name: formData.preferredName || null,
        dob: formData.dob || null,
        email: formData.email,
        phone: formData.phone || null,
        relationship: formData.relationship,
        help_topics: formData.helpTopics,
        involvement_level: formData.involvementLevel,
        service_preference: formData.servicePreference || null,
        service_type: formData.serviceType || null,
        location_preference: formData.locationPreference || null,
        non_negotiables: formData.nonNegotiables || null,
        primary_contact_name: formData.primaryContactName,
        primary_contact_relationship: formData.primaryContactRelationship,
        primary_contact_phone: formData.primaryContactPhone || null,
        primary_contact_email: formData.primaryContactEmail || null,
        secondary_contact_name: formData.secondaryContactName || null,
        secondary_contact_relationship: formData.secondaryContactRelationship || null,
        secondary_contact_phone: formData.secondaryContactPhone || null,
        secondary_contact_email: formData.secondaryContactEmail || null,
        timing: formData.timing,
        best_times: formData.bestTimes || null,
        notes: formData.notes || null
      });

      if (error) throw error;

      toast.success("Intake received", {
        description: "We will reach out using your preferred contact method."
      });
      navigate('/do-it-for-you/intake-submitted');
    } catch (error: any) {
      console.error('Error submitting intake:', error);
      toast.error("Unable to submit intake. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GlobalHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <AppFooter />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GlobalHeader />
        <main className="flex-1 flex items-center justify-center py-16 px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Purchase Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You need to purchase the Do-It-For-You Planning service to access this intake form.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full"
                >
                  {isPurchasing ? "Loading..." : "Purchase Do-It-For-You Planning"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/do-it-for-you')}
                  className="w-full"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Reassuring Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-3">We'll Help You With This</h1>
            <p className="text-lg text-muted-foreground mb-4">
              You don't have to finish this on your own.<br />
              We'll use what you've already started.
            </p>
          </div>

          {/* Progress Reassurance Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
            <p className="text-sm text-foreground leading-relaxed text-center">
              We've saved your progress. Someone will review what you've entered and guide you through the rest.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Reassurance */}
            <p className="text-sm text-muted-foreground text-center">
              You can stop anytime. Nothing is final until you choose to save.
            </p>
            {/* Section 1: Who This Plan Is For */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Who This Plan Is For</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="First and last name"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredName">Preferred Name</Label>
                    <Input
                      id="preferredName"
                      placeholder="What should we call you?"
                      value={formData.preferredName}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Only if you want a call or text"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship to Person Being Planned For *</Label>
                    <Select
                      value={formData.relationship}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">This plan is for me</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="spouse">Spouse/Partner</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: What You Want Help With */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">What You Want Help With</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>What would you like us to help you complete? *</Label>
                  <div className="space-y-2">
                    {helpTopicOptions.map((option) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <Checkbox
                          id={option.id}
                          checked={formData.helpTopics.includes(option.id)}
                          onCheckedChange={(checked) => handleHelpTopicChange(option.id, checked as boolean)}
                        />
                        <Label htmlFor={option.id} className="font-normal cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>How involved do you want to be? *</Label>
                  <RadioGroup
                    value={formData.involvementLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, involvementLevel: value }))}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="guided" id="guided" />
                      <Label htmlFor="guided" className="font-normal cursor-pointer">
                        I want to answer questions and you guide me
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="hands_off" id="hands_off" />
                      <Label htmlFor="hands_off" className="font-normal cursor-pointer">
                        I want you to handle most of it and I review
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="not_sure" id="not_sure" />
                      <Label htmlFor="not_sure" className="font-normal cursor-pointer">
                        I am not sure yet
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Planning Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Planning Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Preference (if known)</Label>
                    <Select
                      value={formData.servicePreference}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, servicePreference: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="burial">Burial</SelectItem>
                        <SelectItem value="cremation">Cremation</SelectItem>
                        <SelectItem value="not_sure">Not sure yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service Type (if known)</Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="traditional">Traditional</SelectItem>
                        <SelectItem value="celebration">Celebration of Life</SelectItem>
                        <SelectItem value="not_sure">Not sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationPreference">Location preference</Label>
                  <Input
                    id="locationPreference"
                    placeholder="City/state, church, funeral home, or 'not sure'"
                    value={formData.locationPreference}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationPreference: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nonNegotiables">Any specific wishes or non-negotiables?</Label>
                  <Textarea
                    id="nonNegotiables"
                    placeholder="Examples: music, readings, military honors, religious preferences."
                    value={formData.nonNegotiables}
                    onChange={(e) => setFormData(prev => ({ ...prev, nonNegotiables: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Key Contacts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Key Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Primary Contact Person *</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactName">Name *</Label>
                      <Input
                        id="primaryContactName"
                        value={formData.primaryContactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryContactName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactRelationship">Relationship *</Label>
                      <Input
                        id="primaryContactRelationship"
                        value={formData.primaryContactRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryContactRelationship: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactPhone">Phone</Label>
                      <Input
                        id="primaryContactPhone"
                        value={formData.primaryContactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryContactPhone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryContactEmail">Email</Label>
                      <Input
                        id="primaryContactEmail"
                        type="email"
                        value={formData.primaryContactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryContactEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-medium">Secondary Contact (Optional)</Label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactName">Name</Label>
                      <Input
                        id="secondaryContactName"
                        value={formData.secondaryContactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryContactName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactRelationship">Relationship</Label>
                      <Input
                        id="secondaryContactRelationship"
                        value={formData.secondaryContactRelationship}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryContactRelationship: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactPhone">Phone</Label>
                      <Input
                        id="secondaryContactPhone"
                        value={formData.secondaryContactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryContactPhone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryContactEmail">Email</Label>
                      <Input
                        id="secondaryContactEmail"
                        type="email"
                        value={formData.secondaryContactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryContactEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Timing and Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Timing and Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>When would you like to start? *</Label>
                  <Select
                    value={formData.timing}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timing: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">As soon as possible</SelectItem>
                      <SelectItem value="2_weeks">Within the next 2 weeks</SelectItem>
                      <SelectItem value="1_month">Within the next month</SelectItem>
                      <SelectItem value="not_sure">Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bestTimes">Best days/times</Label>
                  <Input
                    id="bestTimes"
                    placeholder="Weekdays after 5pm, Saturdays morning, etc."
                    value={formData.bestTimes}
                    onChange={(e) => setFormData(prev => ({ ...prev, bestTimes: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Anything Else */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Anything Else</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Anything you want us to know before we begin?</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex items-start gap-2 pt-4">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked as boolean }))}
                  />
                  <Label htmlFor="consent" className="font-normal cursor-pointer text-sm leading-relaxed">
                    I understand this service provides planning support and organization help. It is not legal or financial advice.
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground text-center">
                There is no obligation. We'll reach out to explain next steps.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Request Help
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Return to Planning Menu
                </Button>
              </div>
            </div>

            {/* Footer Disclaimer */}
            <p className="text-xs text-muted-foreground text-center pt-4">
              Planning assistance is educational and supportive. It does not replace legal or medical advice.
            </p>
          </form>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}