import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { SECTION_LEARN_MORE } from "@/lib/resourceDocuments";

interface LearnMoreAccordionProps {
  sectionId: string;
}

export const LearnMoreAccordion = ({ sectionId }: LearnMoreAccordionProps) => {
  const learnMore = SECTION_LEARN_MORE[sectionId];
  
  if (!learnMore) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className="w-full mb-4">
      <AccordionItem value="learn-more" className="border rounded-lg bg-muted/30">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Learn More: {learnMore.title}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {learnMore.content}
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
