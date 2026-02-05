 import { Link } from "react-router-dom";
 import { PublicHeader } from "@/components/PublicHeader";
 import { AppFooter } from "@/components/AppFooter";
 import { Breadcrumbs } from "@/components/Breadcrumbs";
 import { Card, CardContent } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Phone, Mail, HandHelping, CheckCircle, Clock, Heart } from "lucide-react";
 import { ContactSuggestionDialog } from "@/components/ContactSuggestionDialog";
 import { useState } from "react";
 
 /**
  * AssistedPlanning Page
  * 
  * For users who want human help filling out their planning forms.
  * Connects them to the Do-It-For-You service or contact options.
  */
 export default function AssistedPlanning() {
   const [showContactDialog, setShowContactDialog] = useState(false);
 
   return (
     <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
       <PublicHeader />
       
       <main className="container mx-auto px-4 py-8 md:py-12">
         <Breadcrumbs className="mb-6" />
         
         {/* Hero Section */}
         <section className="max-w-2xl mx-auto text-center space-y-6 mb-12">
           <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
             <HandHelping className="h-10 w-10 text-primary" />
           </div>
           <h1 className="text-3xl md:text-4xl font-serif font-bold">
             Have Someone Help You Fill This Out
           </h1>
           <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
             Not everyone wants to fill out forms alone. We can help you through it — 
             by phone, video, or in person.
           </p>
         </section>
 
         {/* What This Includes */}
         <section className="max-w-3xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             What This Includes
           </h2>
           <Card className="border-none bg-muted/30">
             <CardContent className="p-6 md:p-8">
               <ul className="space-y-4 max-w-lg mx-auto">
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>A real person walks you through each section</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>They type your answers as you speak</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>No pressure — go at your own pace</span>
                 </li>
                 <li className="flex items-start gap-3">
                   <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                   <span>You review and approve everything before saving</span>
                 </li>
               </ul>
             </CardContent>
           </Card>
         </section>
 
         {/* Options */}
         <section className="max-w-3xl mx-auto mb-12">
           <h2 className="text-2xl font-serif font-semibold text-center mb-8">
             Choose How You'd Like Help
           </h2>
           <div className="grid md:grid-cols-2 gap-6">
             {/* Do-It-For-You Service */}
             <Card className="border-2 hover:border-primary/50 transition-colors">
               <CardContent className="p-6 space-y-4">
                 <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                   <Clock className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="text-xl font-semibold">Schedule a Session</h3>
                 <p className="text-muted-foreground leading-relaxed">
                   Book a time that works for you. We'll call or video chat and complete 
                   your planning together.
                 </p>
                 <Button 
                   asChild
                   className="w-full min-h-[48px]"
                 >
                   <Link to="/do-it-for-you">
                     Learn About This Service
                   </Link>
                 </Button>
               </CardContent>
             </Card>
 
             {/* Contact Us */}
             <Card className="border-2 hover:border-primary/50 transition-colors">
               <CardContent className="p-6 space-y-4">
                 <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                   <Heart className="h-6 w-6 text-primary" />
                 </div>
                 <h3 className="text-xl font-semibold">Just Have Questions?</h3>
                 <p className="text-muted-foreground leading-relaxed">
                   Not sure what you need? Reach out and we'll point you in the right 
                   direction. No commitment.
                 </p>
                 <Button 
                   variant="outline"
                   onClick={() => setShowContactDialog(true)}
                   className="w-full min-h-[48px]"
                 >
                   Talk to a Human
                 </Button>
               </CardContent>
             </Card>
           </div>
         </section>
 
         {/* Reassurance */}
         <section className="max-w-2xl mx-auto text-center mb-12">
           <p className="text-muted-foreground">
             You're not alone in this. Many people prefer a little guidance — 
             and that's perfectly okay.
           </p>
         </section>
       </main>
 
       <AppFooter />
       
       <ContactSuggestionDialog 
         open={showContactDialog} 
         onOpenChange={setShowContactDialog} 
       />
     </div>
   );
 }