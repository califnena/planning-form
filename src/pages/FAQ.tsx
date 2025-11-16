import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "What is this planner for?",
      answer: "This planner helps you organize and document your end-of-life wishes, making it easier for your loved ones to honor your preferences and handle important matters when the time comes."
    },
    {
      question: "Is my information secure?",
      answer: "Yes, your data is securely stored and encrypted. We recommend using a password manager for sensitive passwords rather than storing them directly in this planner."
    },
    {
      question: "How often should I update this?",
      answer: "Review and update your plan at least annually, or whenever significant life changes occur (marriage, divorce, birth, death, major purchases, etc.)."
    },
    {
      question: "Who should have access to this?",
      answer: "Share your completed plan with your executor, trusted family members, and keep a copy in a secure but accessible location. Make sure key people know where to find it."
    },
    {
      question: "Can I make changes after downloading?",
      answer: "Yes, you can update your plan anytime. After making changes, download a new PDF to ensure everyone has the most current version."
    },
    {
      question: "What if I don't know all the details yet?",
      answer: "That's okay! Fill out what you can now and add more information over time. It's better to start with partial information than to delay."
    },
    {
      question: "Should I include passwords?",
      answer: "We recommend using a password manager and noting 'See password manager' rather than writing passwords directly. If you must include access information, store this document very securely."
    },
    {
      question: "Is this legally binding?",
      answer: "This planner is an informational guide for your loved ones. It does not replace legal documents like a will, trust, or advance directive. Consult an attorney for legal matters."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Common Questions
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Answers to the questions families ask most often.
        </p>

        <div className="mb-8">
          <a 
            href="/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf" 
            download
            className="inline-block"
          >
            <Button size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Download Complete Guide (PDF)
            </Button>
          </a>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card border rounded-lg px-6 py-2"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
