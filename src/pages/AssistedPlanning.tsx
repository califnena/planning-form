 import { Link, useNavigate } from "react-router-dom";
 import { PublicHeader } from "@/components/PublicHeader";
 import { AppFooter } from "@/components/AppFooter";
 import { Breadcrumbs } from "@/components/Breadcrumbs";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Label } from "@/components/ui/label";
 import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
 import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
 import { HandHelping, CheckCircle, Heart, MessageCircle } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { useState } from "react";
 import NotAdviceNote from "@/components/NotAdviceNote";
 
 /**
  * AssistedPlanning Page
  * 
  * Senior-friendly page for users who want human help filling out planning forms.
  * Calm, simple tone with no sales language.
  */
 export default function AssistedPlanning() {
   const navigate = useNavigate();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSubmitted, setIsSubmitted] = useState(false);
 
   // Form state
   const [whoNeedsHelp, setWhoNeedsHelp] = useState<string[]>([]);
   const [whatHelpNeeded, setWhatHelpNeeded] = useState<string[]>([]);
   const [sectionsNeeded, setSectionsNeeded] = useState<string[]>([]);
   const [contactMethod, setContactMethod] = useState("");
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");
   const [phone, setPhone] = useState("");
   const [notes, setNotes] = useState("");
 
   const handleCheckbox = (
     value: string,
     checked: boolean,
     state: string[],
     setState: React.Dispatch<React.SetStateAction<string[]>>
   ) => {
     if (checked) {
       setState([...state, value]);
     } else {
       setState(state.filter((v) => v !== value));
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (!name.trim() || !email.trim() || !contactMethod) {
       toast.error("Please fill in your name, email, and preferred contact method.");
       return;
     }
 
     setIsSubmitting(true);
 
     try {
       const { error } = await supabase.from("support_requests").insert({
         request_type: "assisted_planning",
         name: name.trim(),
          contact_method: contactMethod === "Phone call" ? "phone" : "email",
          contact_value: contactMethod === "Phone call" ? phone.trim() : email.trim(),
          preferred_time: null,
         message: JSON.stringify({
           whoNeedsHelp,
           whatHelpNeeded,
           sectionsNeeded,
           contactMethod,
            email: email.trim(),
            phone: phone.trim(),
           notes: notes.trim(),
         }),
       });
 
       if (error) throw error;
 
       setIsSubmitted(true);
     } catch (err) {
       console.error("Error submitting assisted planning request:", err);
       toast.error("Something went wrong. Please try again or contact us directly.");
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const faqs = [
     {
       q: "How much does this cost?",
       a: "We will explain any costs before you commit to anything. There is no charge just to ask questions.",
     },
     {
       q: "Do I have to finish everything in one session?",
       a: "No. You can stop anytime and pick up later. This goes at your pace.",
     },
     {
       q: "Can a family member be on the call with me?",
       a: "Absolutely. Many people find it helpful to have someone they trust present.",
     },
     {
       q: "What if I change my mind after we start?",
       a: "That is completely fine. You are never locked in. We can pause, stop, or change direction anytime.",
     },
     {
       q: "Is this legal advice?",
       a: "No. We help you organize your wishes and fill out forms. For legal matters, please consult an attorney.",
     },
   ];
 
   return (
     <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
       <PublicHeader />
  
       <main className="container mx-auto px-4 py-8 md:py-12">
         <Breadcrumbs className="mb-6" />
  
         {/* 1. Header */}
         <section className="max-w-2xl mx-auto text-center space-y-4 mb-12">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
             <HandHelping className="h-10 w-10 text-primary" />
           </div>
           <h1 className="text-3xl md:text-4xl font-serif font-bold">
             Have Someone Help You Fill This Out
           </h1>
           <p className="text-xl text-muted-foreground leading-relaxed">
             You do not have to do this alone.
           </p>
         </section>
 
         {/* 2. What This Help Includes */}
         <section className="max-w-2xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             What This Help Includes
           </h2>
           <Card className="border-none bg-muted/20">
             <CardContent className="p-6 md:p-8 space-y-4">
               <ul className="space-y-3 text-lg">
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>Help filling out planning forms</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>Explaining questions in plain language</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>Writing your wishes clearly</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>Reviewing completed sections</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>Going at your pace</span>
                 </li>
               </ul>
               <p className="text-sm text-muted-foreground pt-4 border-t">
                 This is practical help, not legal or financial advice.
               </p>
             </CardContent>
           </Card>
         </section>
 
         {/* 3. How It Works */}
         <section className="max-w-2xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             How It Works
           </h2>
           <div className="grid md:grid-cols-3 gap-6">
             <Card className="text-center border-none bg-muted/20">
               <CardContent className="p-6">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                   1
                 </div>
                 <h3 className="text-lg font-semibold mb-2">Request Help</h3>
                 <p className="text-muted-foreground">Fill out the form below.</p>
               </CardContent>
             </Card>
             <Card className="text-center border-none bg-muted/20">
               <CardContent className="p-6">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                   2
                 </div>
                 <h3 className="text-lg font-semibold mb-2">We Contact You</h3>
                 <p className="text-muted-foreground">Someone will reach out.</p>
               </CardContent>
             </Card>
             <Card className="text-center border-none bg-muted/20">
               <CardContent className="p-6">
                 <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-primary">
                   3
                 </div>
                 <h3 className="text-lg font-semibold mb-2">Complete It Together</h3>
                 <p className="text-muted-foreground">We help you at your pace.</p>
               </CardContent>
             </Card>
           </div>
         </section>
 
         {/* 4. What We Do Not Do */}
         <section className="max-w-2xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             What We Do Not Do
           </h2>
           <Card className="border-none bg-muted/20">
             <CardContent className="p-6 md:p-8">
               <ul className="space-y-3 text-lg">
                 <li className="flex items-start gap-3">
                   <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>No rushing</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>No pressure</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>No required purchases</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <Heart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>No legal advice</span>
                 </li>
               </ul>
             </CardContent>
           </Card>
         </section>
 
         {/* 5. Who This Is For */}
         <section className="max-w-2xl mx-auto mb-12 text-center">
           <h2 className="text-2xl font-serif font-semibold mb-6">
             Who This Is For
           </h2>
           <p className="text-lg text-muted-foreground leading-relaxed">
             This service is for seniors, family members, and caregivers who want a little 
             help organizing end-of-life wishes. Whether you prefer to talk things through 
             or just need someone to type while you speak, we are here to help.
           </p>
         </section>
 
         {/* 6. FAQ Section */}
         <section className="max-w-2xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             Common Questions
           </h2>
           <Accordion type="single" collapsible className="space-y-2">
             {faqs.map((faq, index) => (
               <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                 <AccordionTrigger className="text-left text-lg py-4">
                   {faq.q}
                 </AccordionTrigger>
                 <AccordionContent className="text-muted-foreground pb-4">
                   {faq.a}
                 </AccordionContent>
               </AccordionItem>
             ))}
           </Accordion>
         </section>
 
         {/* 7. Request Form */}
         <section className="max-w-2xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             Request Assisted Planning Help
           </h2>
 
           {isSubmitted ? (
             <Card className="border-2 border-primary/30 bg-primary/5">
               <CardContent className="p-8 text-center space-y-4">
                 <CheckCircle className="h-12 w-12 text-primary mx-auto" />
                 <h3 className="text-xl font-semibold">Thank You</h3>
                 <p className="text-lg text-muted-foreground">
                   Someone will reach out soon. You are not obligated to continue.
                 </p>
                 <Button variant="outline" onClick={() => navigate("/")}>
                   Return Home
                 </Button>
               </CardContent>
             </Card>
           ) : (
             <Card>
               <CardContent className="p-6 md:p-8">
                 <form onSubmit={handleSubmit} className="space-y-8">
                   {/* Who needs help */}
                   <div className="space-y-4">
                     <Label className="text-lg font-medium">Who needs help?</Label>
                     <div className="space-y-3">
                       {["Myself", "A parent", "A spouse or partner", "Another family member", "Someone I care for"].map((option) => (
                         <div key={option} className="flex items-center gap-3">
                           <Checkbox
                             id={`who-${option}`}
                             checked={whoNeedsHelp.includes(option)}
                             onCheckedChange={(checked) =>
                               handleCheckbox(option, !!checked, whoNeedsHelp, setWhoNeedsHelp)
                             }
                             className="h-6 w-6"
                           />
                           <Label htmlFor={`who-${option}`} className="text-base cursor-pointer">
                             {option}
                           </Label>
                         </div>
                       ))}
                     </div>
                   </div>
 
                   {/* What help is needed */}
                   <div className="space-y-4">
                     <Label className="text-lg font-medium">What kind of help do you need?</Label>
                     <div className="space-y-3">
                       {[
                         "Help filling out planning forms",
                         "Understanding the questions",
                         "Putting wishes into words",
                         "Reviewing what I have done",
                         "Starting from scratch",
                       ].map((option) => (
                         <div key={option} className="flex items-center gap-3">
                           <Checkbox
                             id={`what-${option}`}
                             checked={whatHelpNeeded.includes(option)}
                             onCheckedChange={(checked) =>
                               handleCheckbox(option, !!checked, whatHelpNeeded, setWhatHelpNeeded)
                             }
                             className="h-6 w-6"
                           />
                           <Label htmlFor={`what-${option}`} className="text-base cursor-pointer">
                             {option}
                           </Label>
                         </div>
                       ))}
                     </div>
                   </div>
 
                   {/* Sections needing help (optional) */}
                   <div className="space-y-4">
                     <Label className="text-lg font-medium">
                       Which sections need help? <span className="text-muted-foreground font-normal">(optional)</span>
                     </Label>
                     <div className="grid sm:grid-cols-2 gap-3">
                       {[
                         "About Me",
                         "Contacts",
                         "Funeral Wishes",
                         "Legal Documents",
                         "Financial Information",
                         "Messages to Loved Ones",
                         "Insurance",
                         "Digital Accounts",
                         "Not sure yet",
                       ].map((option) => (
                         <div key={option} className="flex items-center gap-3">
                           <Checkbox
                             id={`section-${option}`}
                             checked={sectionsNeeded.includes(option)}
                             onCheckedChange={(checked) =>
                               handleCheckbox(option, !!checked, sectionsNeeded, setSectionsNeeded)
                             }
                             className="h-6 w-6"
                           />
                           <Label htmlFor={`section-${option}`} className="text-base cursor-pointer">
                             {option}
                           </Label>
                         </div>
                       ))}
                     </div>
                   </div>
 
                   {/* Preferred contact method */}
                   <div className="space-y-4">
                     <Label className="text-lg font-medium">How would you like us to contact you?</Label>
                     <RadioGroup value={contactMethod} onValueChange={setContactMethod} className="space-y-3">
                       {["Phone call", "Email", "Either is fine"].map((option) => (
                         <div key={option} className="flex items-center gap-3">
                           <RadioGroupItem value={option} id={`contact-${option}`} className="h-6 w-6" />
                           <Label htmlFor={`contact-${option}`} className="text-base cursor-pointer">
                             {option}
                           </Label>
                         </div>
                       ))}
                     </RadioGroup>
                   </div>
 
                   {/* Contact info */}
                   <div className="space-y-4">
                     <div>
                       <Label htmlFor="name" className="text-lg font-medium">
                         Your Name
                       </Label>
                       <Input
                         id="name"
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="mt-2 text-base h-12"
                         required
                       />
                     </div>
                     <div>
                       <Label htmlFor="email" className="text-lg font-medium">
                         Your Email
                       </Label>
                       <Input
                         id="email"
                         type="email"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         className="mt-2 text-base h-12"
                         required
                       />
                     </div>
                     <div>
                       <Label htmlFor="phone" className="text-lg font-medium">
                         Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                       </Label>
                       <Input
                         id="phone"
                         type="tel"
                         value={phone}
                         onChange={(e) => setPhone(e.target.value)}
                         className="mt-2 text-base h-12"
                       />
                     </div>
                     <div>
                       <Label htmlFor="notes" className="text-lg font-medium">
                         Anything else we should know? <span className="text-muted-foreground font-normal">(optional)</span>
                       </Label>
                       <Textarea
                         id="notes"
                         value={notes}
                         onChange={(e) => setNotes(e.target.value)}
                         className="mt-2 text-base min-h-[100px]"
                         placeholder="Any details or questions..."
                       />
                     </div>
                   </div>
 
                   <Button type="submit" className="w-full min-h-[52px] text-lg" disabled={isSubmitting}>
                     {isSubmitting ? "Sending..." : "Request Help"}
                   </Button>
                 </form>
               </CardContent>
             </Card>
           )}
         </section>
 
         {/* 8. Cross-link */}
         <section className="max-w-2xl mx-auto mb-12">
           <Card className="border-none bg-muted/20">
             <CardContent className="p-6 md:p-8 text-center space-y-4">
               <MessageCircle className="h-10 w-10 text-primary mx-auto" />
               <h3 className="text-xl font-serif font-semibold">Other Ways to Get Help</h3>
               <p className="text-muted-foreground">
                 Prefer to work through things on your own with gentle guidance?
               </p>
               <Button asChild variant="outline" className="min-h-[48px]">
                 <Link to="/vip-planning-support">Work with Claire (VIP Guidance)</Link>
               </Button>
             </CardContent>
           </Card>
         </section>
 
         <NotAdviceNote />
       </main>
 
       <AppFooter />
     </div>
   );
 }