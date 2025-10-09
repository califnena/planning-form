import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export const FAQDownloadButton = () => {
  const { toast } = useToast();

  const generateFAQPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const lineHeight = 7;
    let yPosition = margin;

    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    const addTitle = (text: string) => {
      checkPageBreak(15);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(text, margin, yPosition);
      yPosition += 12;
    };

    const addQuestion = (text: string) => {
      checkPageBreak(12);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight;
    };

    const addAnswer = (text: string) => {
      checkPageBreak(10);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight + 3;
    };

    // Cover Page
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("End-of-Life Planning", pageWidth / 2, 60, { align: "center" });
    doc.setFontSize(18);
    doc.text("Frequently Asked Questions", pageWidth / 2, 75, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("A comprehensive guide to planning for the future", pageWidth / 2, 90, { align: "center" });
    doc.addPage();
    yPosition = margin;

    // Getting Started
    addTitle("Getting Started");
    addQuestion("What is end-of-life planning?");
    addAnswer("End-of-life planning involves making decisions about your healthcare, financial, and personal wishes in advance. It ensures your preferences are known and followed, and helps ease the burden on loved ones during difficult times.");
    
    addQuestion("Why should I start planning now?");
    addAnswer("Planning ahead gives you control over important decisions, reduces stress for your family, and ensures your wishes are honored. It's never too early to start, and circumstances can change unexpectedly.");

    // Essential Documents
    addTitle("Essential Documents");
    addQuestion("What documents do I need?");
    addAnswer("Key documents include: Will, Healthcare Power of Attorney, Financial Power of Attorney, Living Will/Advance Directive, and HIPAA Authorization. Consider also creating a letter of instruction and organizing important records.");

    addQuestion("Do I need a lawyer to create these documents?");
    addAnswer("While not always legally required, consulting an attorney is recommended for complex situations or large estates. Many basic documents can be created using online tools or state-specific forms, but professional guidance ensures they're valid and comprehensive.");

    // Financial Planning
    addTitle("Financial Planning");
    addQuestion("How do I organize my financial information?");
    addAnswer("Create a comprehensive list of all accounts, including bank accounts, investments, retirement accounts, insurance policies, and debts. Include account numbers, institutions, and locations of important documents.");

    addQuestion("What should my family know about my finances?");
    addAnswer("Ensure they know the location of important documents, how to access accounts, contact information for financial advisors, and outstanding debts or obligations. Consider setting up a legacy contact for digital accounts.");

    // Healthcare Decisions
    addTitle("Healthcare Decisions");
    addQuestion("What is an advance directive?");
    addAnswer("An advance directive is a legal document expressing your wishes about medical treatment if you become unable to communicate. It typically includes a living will and healthcare power of attorney.");

    addQuestion("What is a healthcare proxy?");
    addAnswer("A healthcare proxy (or healthcare power of attorney) is someone you designate to make medical decisions on your behalf if you're unable to do so. Choose someone who understands your values and will honor your wishes.");

    // Digital Legacy
    addTitle("Digital Legacy");
    addQuestion("What happens to my digital accounts?");
    addAnswer("Digital assets need special planning. Create an inventory of online accounts, set up legacy contacts where available, and include access instructions in your estate plan. Many platforms have specific policies for deceased users' accounts.");

    addQuestion("How do I protect my digital privacy after death?");
    addAnswer("Specify in your plan what should happen to each account - whether to memorialize, delete, or transfer it. Use password managers and share the master password with your executor in a secure way.");

    // Funeral Planning
    addTitle("Funeral Planning");
    addQuestion("Should I pre-plan my funeral?");
    addAnswer("Pre-planning can ease the burden on loved ones and ensure your wishes are followed. Document your preferences for burial or cremation, service type, and any specific requests. Consider pre-paying to lock in costs.");

    addQuestion("What are the costs involved?");
    addAnswer("Funeral costs vary widely, from $2,000 for direct cremation to $15,000+ for traditional burial. Factors include casket/urn selection, venue, services, and location. Pre-planning helps control costs and allows price comparisons.");

    // Family Communication
    addTitle("Family Communication");
    addQuestion("How do I talk to my family about these plans?");
    addAnswer("Start conversations early in a calm, comfortable setting. Be clear about your wishes, explain your reasoning, and listen to their concerns. Share document locations and review plans periodically together.");

    addQuestion("What if my family disagrees with my wishes?");
    addAnswer("Document your wishes clearly in legal documents. While family input is valuable, ultimately these are your decisions. Having conversations early and explaining your reasoning can help prevent conflicts.");

    // Legal Considerations
    addTitle("Legal Considerations");
    addQuestion("Do I need a will if I don't have much?");
    addAnswer("Yes. A will ensures your wishes are followed, names guardians for minor children, and can simplify the probate process. Without one, state law determines how assets are distributed, which may not align with your wishes.");

    addQuestion("What is probate?");
    addAnswer("Probate is the legal process of validating a will and distributing assets. Duration and complexity vary by state and estate size. Some assets can bypass probate through beneficiary designations or trusts.");

    // Updating Plans
    addTitle("Updating Your Plans");
    addQuestion("How often should I update my plans?");
    addAnswer("Review your plans annually and update them after major life events (marriage, divorce, births, deaths, significant asset changes). Ensure named individuals are still willing and able to serve in designated roles.");

    addQuestion("What triggers the need for updates?");
    addAnswer("Major life changes include marriage, divorce, births, deaths, relocation to another state, significant changes in assets, changes in relationships with named individuals, or changes in your health status or values.");

    doc.save("End-of-Life-Planning-FAQ.pdf");

    toast({
      title: "FAQ Downloaded",
      description: "The FAQ guide has been saved as a PDF.",
    });
  };

  return (
    <Button onClick={generateFAQPDF} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Download FAQ as PDF
    </Button>
  );
};
