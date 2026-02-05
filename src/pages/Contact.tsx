 import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TextSizeToggle } from '@/components/TextSizeToggle';
 import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
 import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

   useEffect(() => {
     const getUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       setUserId(user?.id ?? null);
     };
     getUser();
   }, []);
 
   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     setIsSubmitting(true);
     
     try {
       // Save to support_requests table
       const { error } = await supabase
         .from('support_requests')
         .insert({
           user_id: userId,
           name: formData.name,
           contact_method: 'email',
           contact_value: formData.email,
           preferred_time: formData.phone ? `Phone: ${formData.phone}` : null,
           message: formData.message,
           request_type: 'contact',
         });
 
       if (error) throw error;
 
       toast({
         title: "Message received",
         description: "Thank you for contacting us. We'll get back to you soon.",
       });
       setFormData({ name: '', email: '', phone: '', message: '' });
     } catch (error) {
       console.error('Error submitting contact form:', error);
       toast({
         title: "Something went wrong",
         description: "Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSubmitting(false);
     }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Planning Menu
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Contact Us
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ask for help, pricing, or a custom plan. We're here to assist you.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-base font-semibold">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-2 text-base h-12"
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-base font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-2 text-base h-12"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-base font-semibold">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-2 text-base h-12"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-base font-semibold">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={6}
              className="mt-2 text-base"
            />
          </div>
          
           <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Message
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
