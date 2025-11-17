import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePlanData } from "@/hooks/usePlanData";

export default function SongInfo() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { plan } = usePlanData("default");
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [packageType, setPackageType] = useState<string>('');
  
  const [formData, setFormData] = useState({
    personName: '',
    deliveryEmail: '',
    phone: '',
    genre: '',
    mood: '',
    language: 'English',
    vocalStyle: '',
    length: '',
    lifeStory: '',
    relationships: '',
    specialMemories: '',
    additionalNotes: '',
  });

  useEffect(() => {
    const verifyPayment = async () => {
      const session_id = searchParams.get('session_id');
      
      if (!session_id) {
        toast({
          title: "Invalid access",
          description: "No payment session found",
          variant: "destructive",
        });
        navigate('/products/custom-song');
        return;
      }

      setSessionId(session_id);
      
      // In production, verify with Stripe here
      // For now, we'll trust the session_id and extract package type from URL if needed
      // You would call Stripe API to verify the session
      
      setPackageType('standard'); // This should come from Stripe session metadata
      setVerifying(false);
    };

    verifyPayment();
  }, [searchParams, navigate, toast]);

  useEffect(() => {
    // Prefill from planner data
    if (plan) {
      setFormData(prev => ({
        ...prev,
        lifeStory: plan.about_me_notes || prev.lifeStory,
        personName: plan.prepared_for || prev.personName,
      }));
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Save to database
      const { data: order, error: dbError } = await supabase
        .from('song_orders')
        .insert({
          user_id: user.id,
          payment_session_id: sessionId!,
          package_type: packageType,
          request_data: formData,
          status: 'pending',
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-song-order-email', {
        body: {
          orderId: order.id,
          packageType,
          requestData: formData,
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the whole flow if email fails
      }

      toast({
        title: "Order submitted!",
        description: "Your custom tribute song request has been received.",
      });

      navigate('/song-confirmation');
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission failed",
        description: "Unable to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Song Request Details</CardTitle>
            <CardDescription>
              Tell us about your loved one to help us create a meaningful tribute song.
              We've pre-filled what we can from your planner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="personName">Person's Name *</Label>
                  <Input
                    id="personName"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryEmail">Email to Send Song *</Label>
                  <Input
                    id="deliveryEmail"
                    type="email"
                    value={formData.deliveryEmail}
                    onChange={(e) => setFormData({ ...formData, deliveryEmail: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Song Preferences */}
              <div className="space-y-4">
                <h3 className="font-semibold">Song Preferences</h3>
                
                <div>
                  <Label htmlFor="genre">Genre *</Label>
                  <Select value={formData.genre} onValueChange={(value) => setFormData({ ...formData, genre: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="country">Country</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="acoustic">Acoustic</SelectItem>
                      <SelectItem value="gospel">Gospel</SelectItem>
                      <SelectItem value="classical">Classical</SelectItem>
                      <SelectItem value="folk">Folk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="mood">Mood *</Label>
                  <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uplifting">Uplifting & Celebratory</SelectItem>
                      <SelectItem value="peaceful">Peaceful & Reflective</SelectItem>
                      <SelectItem value="hopeful">Hopeful & Comforting</SelectItem>
                      <SelectItem value="emotional">Emotional & Heartfelt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vocalStyle">Vocal Style *</Label>
                  <Select value={formData.vocalStyle} onValueChange={(value) => setFormData({ ...formData, vocalStyle: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vocal style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="choir">Choir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="length">Preferred Length *</Label>
                  <Select value={formData.length} onValueChange={(value) => setFormData({ ...formData, length: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-3">2-3 minutes (Standard)</SelectItem>
                      <SelectItem value="3-5">3-5 minutes (Premium)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Story Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Tell Us Their Story</h3>
                
                <div>
                  <Label htmlFor="lifeStory">Life Story & Accomplishments</Label>
                  <Textarea
                    id="lifeStory"
                    value={formData.lifeStory}
                    onChange={(e) => setFormData({ ...formData, lifeStory: e.target.value })}
                    rows={4}
                    placeholder="Share their life journey, achievements, and what made them special..."
                  />
                </div>

                <div>
                  <Label htmlFor="relationships">Relationships & Family</Label>
                  <Textarea
                    id="relationships"
                    value={formData.relationships}
                    onChange={(e) => setFormData({ ...formData, relationships: e.target.value })}
                    rows={3}
                    placeholder="Tell us about their loved ones, relationships, and family..."
                  />
                </div>

                <div>
                  <Label htmlFor="specialMemories">Special Memories</Label>
                  <Textarea
                    id="specialMemories"
                    value={formData.specialMemories}
                    onChange={(e) => setFormData({ ...formData, specialMemories: e.target.value })}
                    rows={3}
                    placeholder="Share special moments, favorite things, or memorable stories..."
                  />
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes</Label>
                  <Textarea
                    id="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    rows={2}
                    placeholder="Any other details you'd like included..."
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Song Request'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
