import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { ArrowRight, ArrowLeft, Info } from "lucide-react";

// Guide topics matching the planner sections
const guideTopics = [
  {
    id: "personal-info",
    title: "Personal Information",
    whatIsThis: "Basic details about yourself—your name, contact information, and how to reach you.",
    whyItMatters: "This helps your family know exactly who you are and how to contact people on your behalf. It also helps with official paperwork later.",
    whatYoullEnter: "Your full name, address, phone number, and email address. Nothing sensitive like Social Security numbers.",
    plannerRoute: "/preplandashboard/personal-family"
  },
  {
    id: "emergency-contacts",
    title: "Emergency Contacts",
    whatIsThis: "A list of people who should be contacted immediately if something happens to you.",
    whyItMatters: "When there's an emergency, your family won't have to search for phone numbers or wonder who to call. This saves time and reduces stress.",
    whatYoullEnter: "Names, phone numbers, and relationships for 2-5 people you trust most.",
    plannerRoute: "/preplandashboard/contacts"
  },
  {
    id: "healthcare-proxy",
    title: "Healthcare Proxy",
    whatIsThis: "The person you choose to make medical decisions for you if you cannot speak for yourself.",
    whyItMatters: "If you're ever unconscious or too ill to communicate, someone you trust will speak for you instead of leaving doctors to guess.",
    whatYoullEnter: "The name and contact information of your chosen healthcare agent. You can add a backup person too.",
    plannerRoute: "/preplandashboard/legal-docs"
  },
  {
    id: "advance-directive",
    title: "Advance Directive Summary",
    whatIsThis: "Your written wishes about medical treatment if you cannot speak for yourself.",
    whyItMatters: "It gives your family and doctors clear guidance about what you want—like whether you want life support or comfort care only.",
    whatYoullEnter: "Your general preferences (not the full legal form). You can note if you have an official document and where it's kept.",
    plannerRoute: "/preplandashboard/legal-docs"
  },
  {
    id: "dnr-polst",
    title: "DNR / POLST Status",
    whatIsThis: "DNR means 'Do Not Resuscitate.' POLST is a form that tells emergency responders your treatment wishes.",
    whyItMatters: "If you have these documents, your family needs to know where they are so paramedics and hospitals can follow your wishes.",
    whatYoullEnter: "Whether you have a DNR or POLST, and where the original document is stored.",
    plannerRoute: "/preplandashboard/legal-docs"
  },
  {
    id: "medication-list",
    title: "Medication List",
    whatIsThis: "A list of all medications, vitamins, and supplements you take regularly.",
    whyItMatters: "If you're hospitalized or need emergency care, doctors need this list quickly. It also helps your family manage your care.",
    whatYoullEnter: "Medication names, dosages, and what they're for. You can also list your pharmacy.",
    plannerRoute: "/preplandashboard/personal-family"
  },
  {
    id: "care-preferences",
    title: "Care Preferences",
    whatIsThis: "Your personal preferences about daily care, comfort, and end-of-life wishes.",
    whyItMatters: "Everyone has different preferences. Writing them down helps caregivers respect what makes you comfortable.",
    whatYoullEnter: "Things like preferred routines, food preferences, spiritual needs, or comfort measures.",
    plannerRoute: "/preplandashboard/instructions"
  },
  {
    id: "funeral-wishes",
    title: "Funeral & Burial Wishes",
    whatIsThis: "What kind of service you want, burial vs. cremation, and any special requests.",
    whyItMatters: "Your family won't have to guess what you would have wanted. It also prevents family disagreements.",
    whatYoullEnter: "Your preferences for burial or cremation, type of service, music, readings, and any special instructions.",
    plannerRoute: "/preplandashboard/funeral-wishes"
  },
  {
    id: "obituary",
    title: "Obituary Draft",
    whatIsThis: "A draft of what you'd like people to know about your life when you pass.",
    whyItMatters: "Writing your own obituary ensures your story is told the way you want. It also takes this burden off your grieving family.",
    whatYoullEnter: "Key facts about your life, accomplishments, and what mattered most to you.",
    plannerRoute: "/preplandashboard/life-story"
  },
  {
    id: "digital-assets",
    title: "Digital Assets List",
    whatIsThis: "A list of your online accounts—email, social media, subscriptions, and banking.",
    whyItMatters: "Your family will need to close accounts, cancel subscriptions, and access important information. Without this list, they may never find everything.",
    whatYoullEnter: "Account names and services only. We do NOT store passwords for security reasons.",
    plannerRoute: "/preplandashboard/digital"
  },
  {
    id: "documents-locator",
    title: "Important Documents Locator",
    whatIsThis: "Where to find your important papers—will, trust, insurance policies, deeds, etc.",
    whyItMatters: "In an emergency, your family needs to find these fast. Knowing where things are stored saves days or weeks of searching.",
    whatYoullEnter: "Descriptions of where documents are kept (safe, filing cabinet, attorney's office, bank box).",
    plannerRoute: "/preplandashboard/legal-docs"
  },
];

export default function Guide() {
  const [searchParams] = useSearchParams();
  const topicId = searchParams.get("topic");
  
  // Find the current topic
  const currentTopic = topicId ? guideTopics.find(t => t.id === topicId) : null;
  
  // If a specific topic is selected, show the detail view
  if (currentTopic) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <GlobalHeader />
        
        <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
          {/* Back button */}
          <Link to="/guide" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-base">
            <ArrowLeft className="h-4 w-4" />
            Back to all guides
          </Link>
          
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl md:text-3xl">{currentTopic.title}</CardTitle>
              <CardDescription className="text-base">
                Step-by-step guide to help you understand this section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* What is this? */}
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  What is this?
                </h3>
                <p className="text-base leading-relaxed">{currentTopic.whatIsThis}</p>
              </div>
              
              {/* Why it matters */}
              <div className="bg-primary/5 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3">Why it matters</h3>
                <p className="text-base leading-relaxed">{currentTopic.whyItMatters}</p>
              </div>
              
              {/* What you'll enter */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3">What you'll enter</h3>
                <p className="text-base leading-relaxed">{currentTopic.whatYoullEnter}</p>
              </div>
              
              {/* Skip note */}
              <div className="border border-border/50 rounded-xl p-5 text-center">
                <p className="text-muted-foreground text-base">
                  You can skip this for now. Come back anytime.
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={currentTopic.plannerRoute} className="flex-1">
                  <Button size="lg" className="w-full min-h-[52px] text-base gap-2">
                    Start this section
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/guide" className="flex-1">
                  <Button variant="outline" size="lg" className="w-full min-h-[52px] text-base">
                    View other guides
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        
        <AppFooter />
      </div>
    );
  }
  
  // Default: show all guide topics
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GlobalHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Step-by-Step Planning Guide</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Learn what each section is for and why it matters—before you fill anything out.
          </p>
        </div>
        
        <div className="grid gap-4">
          {guideTopics.map((topic) => (
            <Link 
              key={topic.id} 
              to={`/guide?topic=${topic.id}`}
              className="block"
            >
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {topic.title}
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    {topic.whatIsThis}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* Ready to start */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Ready to start filling out your plan?</p>
          <Link to="/preplandashboard">
            <Button size="lg" className="min-h-[52px] text-base px-8">
              Go to Planner
            </Button>
          </Link>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
