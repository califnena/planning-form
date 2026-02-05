  import { useState, useEffect } from "react";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { useToast } from "@/hooks/use-toast";
 import { Phone, Mail, CheckCircle } from "lucide-react";
  import { supabase } from "@/integrations/supabase/client";
 
 interface CallbackRequestDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export const CallbackRequestDialog = ({
   open,
   onOpenChange,
 }: CallbackRequestDialogProps) => {
   const { toast } = useToast();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isSubmitted, setIsSubmitted] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
   const [formData, setFormData] = useState({
     name: "",
     contactMethod: "phone",
     phone: "",
     email: "",
     preferredTime: "",
     message: "",
   });
 
    // Get current user if logged in
    useEffect(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
      };
      getUser();
    }, [open]);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     // Basic validation
     if (!formData.name.trim()) {
       toast({
         title: "Name required",
         description: "Please enter your name.",
         variant: "destructive",
       });
       return;
     }
 
     if (formData.contactMethod === "phone" && !formData.phone.trim()) {
       toast({
         title: "Phone required",
         description: "Please enter your phone number.",
         variant: "destructive",
       });
       return;
     }
 
     if (formData.contactMethod === "email" && !formData.email.trim()) {
       toast({
         title: "Email required",
         description: "Please enter your email address.",
         variant: "destructive",
       });
       return;
     }
 
     setIsSubmitting(true);
 
     try {
       const contactInfo = formData.contactMethod === "phone" 
         ? formData.phone 
         : formData.email;

        // Save to database instead of sending email
        const { error } = await supabase
          .from('support_requests')
          .insert({
            user_id: userId,
            name: formData.name,
            contact_method: formData.contactMethod,
            contact_value: contactInfo,
            preferred_time: formData.preferredTime || null,
            message: formData.message || null,
            request_type: 'callback',
          });

        if (error) throw error;

       setIsSubmitted(true);
     } catch (error) {
        console.error('Error submitting callback request:', error);
       toast({
         title: "Something went wrong",
          description: "Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleClose = () => {
     setIsSubmitted(false);
     setFormData({
       name: "",
       contactMethod: "phone",
       phone: "",
       email: "",
       preferredTime: "",
       message: "",
     });
     onOpenChange(false);
   };
 
   if (isSubmitted) {
     return (
       <Dialog open={open} onOpenChange={handleClose}>
         <DialogContent className="sm:max-w-md">
           <div className="text-center py-6">
             <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="h-8 w-8 text-primary" />
             </div>
             <DialogTitle className="text-xl mb-2">Request Sent</DialogTitle>
             <DialogDescription className="text-base">
               Thank you, {formData.name}. We'll be in touch soon.
             </DialogDescription>
             <p className="text-sm text-muted-foreground mt-4">
               No obligation. Just friendly guidance.
             </p>
             <Button onClick={handleClose} className="mt-6 min-h-[48px]">
               Close
             </Button>
           </div>
         </DialogContent>
       </Dialog>
     );
   }
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="text-xl">Request a Callback</DialogTitle>
           <DialogDescription className="text-base">
             We'll reach out at a time that works for you. No pressure, no obligation.
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-5 mt-4">
           {/* Name */}
           <div className="space-y-2">
             <Label htmlFor="name" className="text-base">Your Name</Label>
             <Input
               id="name"
               placeholder="Enter your name"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               className="min-h-[48px] text-base"
             />
           </div>
 
           {/* Contact Method */}
           <div className="space-y-2">
             <Label className="text-base">How should we reach you?</Label>
             <div className="flex gap-3">
               <Button
                 type="button"
                 variant={formData.contactMethod === "phone" ? "default" : "outline"}
                 className="flex-1 min-h-[48px]"
                 onClick={() => setFormData({ ...formData, contactMethod: "phone" })}
               >
                 <Phone className="h-4 w-4 mr-2" />
                 Phone
               </Button>
               <Button
                 type="button"
                 variant={formData.contactMethod === "email" ? "default" : "outline"}
                 className="flex-1 min-h-[48px]"
                 onClick={() => setFormData({ ...formData, contactMethod: "email" })}
               >
                 <Mail className="h-4 w-4 mr-2" />
                 Email
               </Button>
             </div>
           </div>
 
           {/* Phone or Email Input */}
           {formData.contactMethod === "phone" ? (
             <div className="space-y-2">
               <Label htmlFor="phone" className="text-base">Phone Number</Label>
               <Input
                 id="phone"
                 type="tel"
                 placeholder="(555) 123-4567"
                 value={formData.phone}
                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                 className="min-h-[48px] text-base"
               />
             </div>
           ) : (
             <div className="space-y-2">
               <Label htmlFor="email" className="text-base">Email Address</Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="you@example.com"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 className="min-h-[48px] text-base"
               />
             </div>
           )}
 
           {/* Preferred Time */}
           <div className="space-y-2">
             <Label htmlFor="preferredTime" className="text-base">Best Time to Reach You (Optional)</Label>
             <Select
               value={formData.preferredTime}
               onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
             >
               <SelectTrigger className="min-h-[48px] text-base">
                 <SelectValue placeholder="Select a time" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="morning">Morning (9am - 12pm)</SelectItem>
                 <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                 <SelectItem value="evening">Evening (5pm - 8pm)</SelectItem>
                 <SelectItem value="anytime">Anytime</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           {/* Optional Message */}
           <div className="space-y-2">
             <Label htmlFor="message" className="text-base">Anything you'd like us to know? (Optional)</Label>
             <Textarea
               id="message"
               placeholder="Brief note about your question..."
               value={formData.message}
               onChange={(e) => setFormData({ ...formData, message: e.target.value })}
               className="min-h-[80px] text-base resize-none"
               rows={3}
             />
           </div>
 
           {/* Helper text */}
           <p className="text-sm text-muted-foreground text-center">
             For guidance only. No sales or legal advice.
           </p>
 
           {/* Submit */}
           <Button 
             type="submit" 
             className="w-full min-h-[52px] text-base"
             disabled={isSubmitting}
           >
             {isSubmitting ? "Sending..." : "Send Request"}
           </Button>
         </form>
       </DialogContent>
     </Dialog>
   );
 };