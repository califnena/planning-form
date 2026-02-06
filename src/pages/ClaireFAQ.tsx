import { GlobalHeader } from "@/components/GlobalHeader";
import { AppFooter } from "@/components/AppFooter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ_ITEMS = [
  {
    question: "What is CARE Support?",
    answer: "CARE Support gives you extra help with planning and coping when things feel overwhelming."
  },
  {
    question: "Who is Claire?",
    answer: "Claire is your planning assistant. She provides planning guidance, emotional support, and after-death help. Available 24/7, wherever you are."
  },
  {
    question: "Is Claire a real person?",
    answer: "Claire is a digital assistant designed to help with planning questions and guidance. She does not replace legal, medical, or financial professionals."
  },
  {
    question: "What can Claire help me with?",
    answer: "Claire can help with:\n• Planning support before a death\n• Emotional and practical guidance after a death\n• Understanding planning options\n• Explaining what to do next\n• Helping families stay oriented\n• Emotional reassurance\n• Answering general questions"
  },
  {
    question: "What can Claire not do?",
    answer: "Claire does not give legal, medical, or financial advice."
  },
  {
    question: "Do I have to use CARE Support?",
    answer: "No. CARE Support is optional. You can plan on your own or add support at any time."
  },
  {
    question: "Can I cancel CARE Support?",
    answer: "Yes. You can cancel anytime from your account."
  },
  {
    question: "What if I feel overwhelmed?",
    answer: "That's exactly why CARE Support exists. You can take breaks and return whenever you're ready."
  },
  {
    question: "How do I talk to Claire?",
    answer: "Look for \"Claire is here\" in the corner of the screen and click it. Claire is available 24/7, anywhere you are."
  }
];

export default function ClaireFAQ() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <GlobalHeader />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-none shadow-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl font-serif">Questions about CARE Support and Claire</CardTitle>
            </div>
            <p className="text-muted-foreground text-lg">
              Everything you need to know, in plain language.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pb-8">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed whitespace-pre-line pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="pt-6 border-t">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Ready to get started?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    size="lg"
                    onClick={() => navigate("/care-support")}
                    className="min-h-[48px]"
                  >
                    Open Claire
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/faq")}
                    className="min-h-[48px]"
                  >
                    See FAQs & Guides
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer disclaimer */}
        <p className="text-center text-sm text-muted-foreground mt-8 px-4">
          Claire provides planning guidance and educational support. She does not provide legal, medical, or financial advice.
        </p>
      </main>

      <AppFooter />
    </div>
  );
}
