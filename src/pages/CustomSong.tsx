import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Music, Clock, Heart, CheckCircle, Users, Gift, BookOpen } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CustomSong() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageType: 'standard' | 'premium') => {
    setLoading(packageType);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(null);
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('stripe-song-checkout', {
        body: { packageType, userId: user.id },
      });

      if (error) {
        console.error('Stripe function error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('Opening Stripe checkout:', data.url);
        const stripeWindow = window.open(data.url, '_blank');
        
        if (!stripeWindow) {
          setLoading(null);
          toast({
            title: "Pop-up blocked",
            description: "Please allow pop-ups and try again, or use the link below.",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        } else {
          setLoading(null);
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setLoading(null);
      toast({
        title: "Checkout failed",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-10">
          {/* Header */}
          <div className="text-center space-y-4">
            <Music className="h-16 w-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Custom Memorial Song</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A custom memorial song is a personalized piece of music created to honor someone's life, story, and meaning. 
              It can be used during a service, shared with family, or kept as a private keepsake.
            </p>
            <p className="text-muted-foreground italic">
              This is not a generic song. It is written specifically for one person.
            </p>
          </div>

          {/* What This Is */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                What This Is
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A custom memorial song captures:
              </p>
              <ul className="space-y-2">
                {[
                  "Who the person was",
                  "What mattered most to them",
                  "How they are remembered"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground pt-2">
                The song is created using the details you provide, such as personality, relationships, values, and memories. 
                The result is a meaningful tribute that words alone often cannot express.
              </p>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Share the Story</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    You answer a simple set of questions about the person, such as:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    <li>• Their name and role in your life</li>
                    <li>• Important relationships</li>
                    <li>• Personality traits</li>
                    <li>• Hobbies, beliefs, or values</li>
                    <li>• Any memories or messages you want included</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    You do not need to be a writer. Short answers are fine.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Song Is Created</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Using your responses, a custom song is written and composed to reflect the tone you choose, such as:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    <li>• Calm and reflective</li>
                    <li>• Hopeful and uplifting</li>
                    <li>• Spiritual or faith-based</li>
                    <li>• Gentle and comforting</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Review and Receive</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    You receive the completed song as a digital audio file. This can be:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    <li>• Played during a service or memorial</li>
                    <li>• Shared with family and friends</li>
                    <li>• Saved as part of your planning records</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* When People Use a Custom Song */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5 text-primary" />
                When People Use a Custom Song
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "During a funeral or memorial service",
                  "At a celebration of life",
                  "As a private remembrance",
                  "As part of a legacy or memory collection"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Some families listen together. Others keep it for quiet moments. There is no right or wrong way to use it.
              </p>
            </CardContent>
          </Card>

          {/* Who This Is For */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Who This Is For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Families who want something deeply personal",
                  "Individuals planning ahead who want to leave a meaningful legacy",
                  "Those who find music comforting during grief"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Packages */}
          <div>
            <h2 className="text-2xl font-bold text-center mb-6">How to Get Started</h2>
            <p className="text-center text-muted-foreground mb-6">
              When you are ready: Complete the short questionnaire, choose the tone of the song, and submit your request. 
              You will be guided through each step.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Standard Package */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Standard Package</span>
                    <Heart className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <CardDescription>A heartfelt personalized tribute</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$49</div>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Custom lyrics based on your story",
                      "Professional AI-generated vocals",
                      "Choice of tone and mood",
                      "2-3 minute song length",
                      "MP3 delivery via email"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Delivered in 1-2 days</span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => handlePurchase('standard')}
                    disabled={loading !== null}
                  >
                    {loading === 'standard' ? 'Processing...' : 'Order Standard – $49'}
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Package */}
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Premium Package</span>
                    <Gift className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <CardDescription>Enhanced tribute with revision included</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">$99</div>
                  <ul className="space-y-2 text-sm">
                    {[
                      "Everything in Standard, plus:",
                      "Extended 3-5 minute song",
                      "Enhanced vocal quality",
                      "Full instrumental arrangement",
                      "1 revision included",
                      "High-quality WAV + MP3"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Delivered in 1-2 days</span>
                  </div>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    variant="default"
                    onClick={() => handlePurchase('premium')}
                    disabled={loading !== null}
                  >
                    {loading === 'premium' ? 'Processing...' : 'Order Premium – $99'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Important to Know */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Important to Know</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• This is a creative tribute, not a legal or official document</li>
                <li>• The song is for personal and memorial use</li>
                <li>• You can request a general tone but not a specific artist style</li>
                <li>• Turnaround time is provided at purchase</li>
              </ul>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="what-receiving">
                <AccordionTrigger>What exactly am I receiving?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You receive a personalized memorial song created from the information you provide. 
                  It is delivered as a digital audio file that you can play, share, or keep for personal remembrance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="write-lyrics">
                <AccordionTrigger>Do I need to write lyrics myself?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. You only answer simple questions about the person. The song is written and composed 
                  for you based on those responses.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-personal">
                <AccordionTrigger>How personal is the song?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The song reflects the details you share, such as personality, relationships, values, and memories. 
                  The more detail you provide, the more personal the song will feel. Short answers are still okay.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="choose-style">
                <AccordionTrigger>Can I choose the style or artist?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You may choose a general tone, such as calm, uplifting, or spiritual. 
                  Specific artists or copyrighted styles cannot be requested.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-long">
                <AccordionTrigger>How long does the song take to receive?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Turnaround time is shown at checkout. Most songs are completed within the stated timeframe 
                  after your information is submitted.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="use-funeral">
                <AccordionTrigger>Can the song be used during a funeral or memorial service?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Many families choose to play the song during services, celebrations of life, or private gatherings.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="request-changes">
                <AccordionTrigger>Can I request changes after the song is delivered?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Minor adjustments may be possible depending on the request. Revision details are provided at purchase.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="legal-doc">
                <AccordionTrigger>Is this song a legal or official document?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No. This is a creative memorial tribute. It does not replace legal documents or formal funeral arrangements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="who-owns">
                <AccordionTrigger>Who owns the song?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  The song is provided for personal and memorial use. It is not intended for commercial use or resale.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="preplanning">
                <AccordionTrigger>Can I order a song as part of pre-planning?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. Some individuals choose to create a song in advance as part of their legacy planning.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="still-living">
                <AccordionTrigger>What if I'm ordering this for someone who is still living?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  That is allowed. Many people create songs to honor parents, spouses, or loved ones in advance.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy">
                <AccordionTrigger>Is my information kept private?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes. The details you share are used only to create your song and are handled privately.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="not-sure">
                <AccordionTrigger>What if I'm not sure what to write?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can keep answers brief. Focus on what mattered most. There is no perfect way to do this.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-6">
            <p className="font-medium mb-2">Disclaimer</p>
            <p>
              This custom memorial song is a creative tribute intended for personal and memorial use. 
              It is not a legal document, official record, or replacement for funeral arrangements or estate planning. 
              Specific artists, copyrighted melodies, or commercial use cannot be requested. 
              Final delivery is based on the information provided.
            </p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
