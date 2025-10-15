import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Save, Upload, X, Image as ImageIcon, FileText, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface SectionFuneralProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionFuneral = ({ data, onChange }: SectionFuneralProps) => {
  const funeral = data.funeral || {};
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const updateFuneral = async (field: string, value: any) => {
    onChange({
      ...data,
      funeral: { ...funeral, [field]: value }
    });
    
    // Send email when contact_everlasting is checked
    if (field === "contact_everlasting" && value === true) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.functions.invoke('send-contact-email', {
          body: {
            name: user?.email || "User",
            email: user?.email || "no-email@provided.com",
            message: "A user has requested to be contacted by Everlasting Funeral Advisors through the My Final Wishes platform.",
            type: "contact"
          }
        });

        if (error) throw error;

        toast({
          title: "Request sent",
          description: "Everlasting Funeral Advisors will contact you soon.",
        });
      } catch (error) {
        console.error('Error sending email:', error);
        toast({
          title: "Notice",
          description: "Your preference has been saved. You can also contact Everlasting Funeral Advisors directly.",
          variant: "default",
        });
      }
    }
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Funeral wishes have been saved.",
    });
  };

  useEffect(() => {
    // Load existing photo if available
    if (funeral.photo_path) {
      const { data: { publicUrl } } = supabase.storage
        .from('funeral-photos')
        .getPublicUrl(funeral.photo_path);
      setPhotoUrl(publicUrl);
    }
  }, [funeral.photo_path]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/funeral-photo-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (funeral.photo_path) {
        await supabase.storage
          .from('funeral-photos')
          .remove([funeral.photo_path]);
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('funeral-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('funeral-photos')
        .getPublicUrl(fileName);

      setPhotoUrl(publicUrl);
      updateFuneral('photo_path', fileName);

      toast({
        title: "Photo uploaded",
        description: "Your funeral photo has been uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your photo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!funeral.photo_path) return;

    try {
      await supabase.storage
        .from('funeral-photos')
        .remove([funeral.photo_path]);

      setPhotoUrl(null);
      updateFuneral('photo_path', null);

      toast({
        title: "Photo removed",
        description: "Your funeral photo has been removed.",
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Remove failed",
        description: "There was an error removing your photo. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">🕊️ Funeral Wishes</h2>
          <p className="text-muted-foreground">
            Document your preferences for funeral or memorial services.
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="funeral_preference">Funeral Preference (If Any)</Label>
          <p className="text-xs text-muted-foreground">Briefly describe your overall funeral or memorial service preferences</p>
          <Textarea
            id="funeral_preference"
            value={funeral.funeral_preference || ""}
            onChange={(e) => updateFuneral("funeral_preference", e.target.value)}
            placeholder="Example: I prefer a simple graveside service with close family only, or I'd like a celebration of life at my favorite park..."
            rows={3}
          />
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Final Disposition Preference</Label>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="burial"
                  checked={funeral.burial || false}
                  onCheckedChange={(checked) => updateFuneral("burial", checked)}
                />
                <Label htmlFor="burial" className="font-normal">Burial</Label>
              </div>
              {funeral.burial && (
                <Textarea
                  value={funeral.burial_notes || ""}
                  onChange={(e) => updateFuneral("burial_notes", e.target.value)}
                  placeholder="Where would you like to be buried? Cemetery name, location, plot details..."
                  rows={2}
                  className="ml-6"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cremation"
                  checked={funeral.cremation || false}
                  onCheckedChange={(checked) => updateFuneral("cremation", checked)}
                />
                <Label htmlFor="cremation" className="font-normal">Cremation</Label>
              </div>
              {funeral.cremation && (
                <Textarea
                  value={funeral.cremation_notes || ""}
                  onChange={(e) => updateFuneral("cremation_notes", e.target.value)}
                  placeholder="What should be done with your ashes? (e.g., scattered at favorite location, kept in urn, divided among family, buried in cemetery)..."
                  rows={2}
                  className="ml-6"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="donation"
                  checked={funeral.donation || false}
                  onCheckedChange={(checked) => updateFuneral("donation", checked)}
                />
                <Label htmlFor="donation" className="font-normal">Body/Organ Donation</Label>
              </div>
              {funeral.donation && (
                <Textarea
                  value={funeral.donation_notes || ""}
                  onChange={(e) => updateFuneral("donation_notes", e.target.value)}
                  placeholder="Specify which organs, whole body donation to science, organization details..."
                  rows={2}
                  className="ml-6"
                />
              )}
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            <Label htmlFor="cemetery_plot">Cemetery Plot Details</Label>
            <p className="text-xs text-muted-foreground">Cemetery name, location, plot number, deed information, or pre-purchased plot details</p>
            <Textarea
              id="cemetery_plot"
              value={funeral.cemetery_plot || ""}
              onChange={(e) => updateFuneral("cemetery_plot", e.target.value)}
              placeholder="Example: Green Hills Cemetery, Section C, Plot 123, Los Angeles, CA. Deed is in safe deposit box..."
              rows={3}
            />
          </div>

          <div className="space-y-2 mt-4">
            <Label htmlFor="disposition_notes">Final Disposition Notes</Label>
            <p className="text-xs text-muted-foreground">Additional details about ashes disposal location, burial specifics, or other disposition preferences</p>
            <Textarea
              id="disposition_notes"
              value={funeral.disposition_notes || ""}
              onChange={(e) => updateFuneral("disposition_notes", e.target.value)}
              placeholder="Example: Ashes to be scattered at favorite beach, buried at specific cemetery plot location, etc."
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-semibold">Pre-Arranged or Prepaid Items/Services</Label>
          <p className="text-xs text-muted-foreground mb-4">
            Check off what you&apos;ve already arranged or where you need assistance
          </p>
          
          <div className="space-y-4">
            {/* Funeral Home */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Label className="font-normal">Funeral Home</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchased_funeral_home"
                    checked={funeral.purchased_funeral_home || false}
                    onCheckedChange={(checked) => updateFuneral("purchased_funeral_home", checked)}
                  />
                  <Label htmlFor="purchased_funeral_home" className="text-xs font-normal whitespace-nowrap">Arranged/Prepaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_funeral_home"
                    checked={funeral.needs_funeral_home || false}
                    onCheckedChange={(checked) => updateFuneral("needs_funeral_home", checked)}
                  />
                  <Label htmlFor="needs_funeral_home" className="text-xs font-normal whitespace-nowrap">Needs to be Done</Label>
                </div>
              </div>
              {funeral.purchased_funeral_home && (
                <Input
                  value={funeral.funeral_home_name || ""}
                  onChange={(e) => updateFuneral("funeral_home_name", e.target.value)}
                  placeholder="Funeral home name, contract details, payment status, document location"
                  className="ml-0"
                />
              )}
            </div>

            {/* Cemetery Plot */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Label className="font-normal">Cemetery Plot</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchased_cemetery"
                    checked={funeral.purchased_cemetery || false}
                    onCheckedChange={(checked) => updateFuneral("purchased_cemetery", checked)}
                  />
                  <Label htmlFor="purchased_cemetery" className="text-xs font-normal whitespace-nowrap">Arranged/Prepaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_cemetery"
                    checked={funeral.needs_cemetery || false}
                    onCheckedChange={(checked) => updateFuneral("needs_cemetery", checked)}
                  />
                  <Label htmlFor="needs_cemetery" className="text-xs font-normal whitespace-nowrap">Needs to be Done</Label>
                </div>
              </div>
              {funeral.purchased_cemetery && (
                <Input
                  value={funeral.cemetery_name || ""}
                  onChange={(e) => updateFuneral("cemetery_name", e.target.value)}
                  placeholder="Cemetery name, plot location, deed location, payment status"
                  className="ml-0"
                />
              )}
            </div>

            {/* Funeral Plan */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Label className="font-normal">Funeral Plan (prepaid)</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchased_funeral_packet"
                    checked={funeral.purchased_funeral_packet || false}
                    onCheckedChange={(checked) => updateFuneral("purchased_funeral_packet", checked)}
                  />
                  <Label htmlFor="purchased_funeral_packet" className="text-xs font-normal whitespace-nowrap">Arranged/Prepaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_funeral_packet"
                    checked={funeral.needs_funeral_packet || false}
                    onCheckedChange={(checked) => updateFuneral("needs_funeral_packet", checked)}
                  />
                  <Label htmlFor="needs_funeral_packet" className="text-xs font-normal whitespace-nowrap">Needs to be Done</Label>
                </div>
              </div>
              {funeral.purchased_funeral_packet && (
                <Input
                  value={funeral.funeral_packet_name || ""}
                  onChange={(e) => updateFuneral("funeral_packet_name", e.target.value)}
                  placeholder="Package name, provider, what's included, contract location"
                  className="ml-0"
                />
              )}
            </div>

            {/* Headstone/Marker */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Label className="font-normal">Headstone/Marker</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchased_headstone"
                    checked={funeral.purchased_headstone || false}
                    onCheckedChange={(checked) => updateFuneral("purchased_headstone", checked)}
                  />
                  <Label htmlFor="purchased_headstone" className="text-xs font-normal whitespace-nowrap">Arranged/Prepaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_headstone"
                    checked={funeral.needs_headstone || false}
                    onCheckedChange={(checked) => updateFuneral("needs_headstone", checked)}
                  />
                  <Label htmlFor="needs_headstone" className="text-xs font-normal whitespace-nowrap">Needs to be Done</Label>
                </div>
              </div>
              {funeral.purchased_headstone && (
                <Input
                  value={funeral.headstone_name || ""}
                  onChange={(e) => updateFuneral("headstone_name", e.target.value)}
                  placeholder="Vendor, design details, inscription, payment status, receipt location"
                  className="ml-0"
                />
              )}
            </div>

            {/* Flowers/Arrangements */}
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <Label className="font-normal">Flowers/Arrangements</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="purchased_flowers"
                    checked={funeral.purchased_flowers || false}
                    onCheckedChange={(checked) => updateFuneral("purchased_flowers", checked)}
                  />
                  <Label htmlFor="purchased_flowers" className="text-xs font-normal whitespace-nowrap">Arranged/Prepaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_flowers"
                    checked={funeral.needs_flowers || false}
                    onCheckedChange={(checked) => updateFuneral("needs_flowers", checked)}
                  />
                  <Label htmlFor="needs_flowers" className="text-xs font-normal whitespace-nowrap">Needs to be Done</Label>
                </div>
              </div>
              {funeral.purchased_flowers && (
                <Input
                  value={funeral.flowers_name || ""}
                  onChange={(e) => updateFuneral("flowers_name", e.target.value)}
                  placeholder="Florist name, arrangement details, payment status, contact info"
                  className="ml-0"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="contact_everlasting"
                    checked={funeral.contact_everlasting || false}
                    onCheckedChange={(checked) => updateFuneral("contact_everlasting", checked)}
                  />
                  <Label htmlFor="contact_everlasting" className="font-normal">Get a quote from Everlasting Funeral Advisors</Label>
                </div>
                <Button 
                  asChild 
                  variant="outline"
                  size="sm"
                >
                  <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Request a Quote
                  </a>
                </Button>
              </div>
              {funeral.contact_everlasting && (
                <div className="ml-6 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">
                    ✓ Email notification sent to Everlasting Funeral Advisors - they will contact you soon to discuss your needs.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prearranged_notes">Notes on Pre-Arranged Items</Label>
            <p className="text-xs text-muted-foreground">Additional details about pre-arranged or prepaid services</p>
            <Textarea
              id="prearranged_notes"
              value={funeral.prearranged_notes || ""}
              onChange={(e) => updateFuneral("prearranged_notes", e.target.value)}
              placeholder="Example: Contract details, payment information, location of paperwork..."
              rows={3}
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Service Preferences</Label>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="religious"
                  checked={funeral.religious_service || false}
                  onCheckedChange={(checked) => updateFuneral("religious_service", checked)}
                />
                <Label htmlFor="religious" className="font-normal">Religious service</Label>
              </div>
              {funeral.religious_service && (
                <Textarea
                  value={funeral.religious_notes || ""}
                  onChange={(e) => updateFuneral("religious_notes", e.target.value)}
                  placeholder="Which faith tradition? Specific church/temple? Preferred clergy? Special rituals or prayers?"
                  rows={2}
                  className="ml-6"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="secular"
                  checked={funeral.secular_service || false}
                  onCheckedChange={(checked) => updateFuneral("secular_service", checked)}
                />
                <Label htmlFor="secular" className="font-normal">Secular/Non-religious service</Label>
              </div>
              {funeral.secular_service && (
                <Textarea
                  value={funeral.secular_notes || ""}
                  onChange={(e) => updateFuneral("secular_notes", e.target.value)}
                  placeholder="Preferred tone, speakers, readings, or themes..."
                  rows={2}
                  className="ml-6"
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="celebration"
                  checked={funeral.celebration_of_life || false}
                  onCheckedChange={(checked) => updateFuneral("celebration_of_life", checked)}
                />
                <Label htmlFor="celebration" className="font-normal">Celebration of life</Label>
              </div>
              {funeral.celebration_of_life && (
                <Textarea
                  value={funeral.celebration_notes || ""}
                  onChange={(e) => updateFuneral("celebration_notes", e.target.value)}
                  placeholder="Preferred venue, style (formal/casual), activities, music, food preferences..."
                  rows={2}
                  className="ml-6"
                />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="no_service"
                checked={funeral.no_service || false}
                onCheckedChange={(checked) => updateFuneral("no_service", checked)}
              />
              <Label htmlFor="no_service" className="font-normal">No formal service</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service_preferences_notes">Notes on Service Preferences</Label>
            <p className="text-xs text-muted-foreground">Additional details about your service preferences</p>
            <Textarea
              id="service_preferences_notes"
              value={funeral.service_preferences_notes || ""}
              onChange={(e) => updateFuneral("service_preferences_notes", e.target.value)}
              placeholder="Example: Specific venue preferences, attendee list considerations, special requests..."
              rows={3}
            />
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Additional Preferences</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="open_casket"
                checked={funeral.open_casket || false}
                onCheckedChange={(checked) => updateFuneral("open_casket", checked)}
              />
              <Label htmlFor="open_casket" className="font-normal">Open casket</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="visitation"
                checked={funeral.visitation || false}
                onCheckedChange={(checked) => updateFuneral("visitation", checked)}
              />
              <Label htmlFor="visitation" className="font-normal">Visitation/viewing</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="military_honors"
                checked={funeral.military_honors || false}
                onCheckedChange={(checked) => updateFuneral("military_honors", checked)}
              />
              <Label htmlFor="military_honors" className="font-normal">Military honors (if applicable)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="prepaid_plan"
                checked={funeral.prepaid_plan || false}
                onCheckedChange={(checked) => updateFuneral("prepaid_plan", checked)}
              />
              <Label htmlFor="prepaid_plan" className="font-normal">I have a pre-paid funeral plan</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flower_preferences">Flower Preferences</Label>
          <p className="text-xs text-muted-foreground">Specify preferred flowers, arrangements, or if you prefer donations instead of flowers</p>
          <Textarea
            id="flower_preferences"
            value={funeral.flower_preferences || ""}
            onChange={(e) => updateFuneral("flower_preferences", e.target.value)}
            placeholder="Example: White lilies and roses, garden arrangements, no flowers please - donations instead..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="charity_donations">Memorial Donations to Charity</Label>
          <p className="text-xs text-muted-foreground">Name specific charities or causes where you'd like memorial donations directed</p>
          <Textarea
            id="charity_donations"
            value={funeral.charity_donations || ""}
            onChange={(e) => updateFuneral("charity_donations", e.target.value)}
            placeholder="Example: American Cancer Society, Local Animal Shelter, Veterans Foundation, etc. Include contact info or website if known..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="funeral_general_notes">Additional Details & Special Requests</Label>
          <p className="text-xs text-muted-foreground">Preferred funeral home, music, readings, speakers, traditions, dress code, budget, pre-paid plan details, and any other pertinent information</p>
          <Textarea
            id="funeral_general_notes"
            placeholder="Include:
- Preferred funeral home or location
- Music, readings, or speakers
- Specific traditions or rituals
- Dress code preferences
- Budget guidelines
- Pre-paid plan details and contract location
- Any other pertinent information"
            value={funeral.general_notes || ""}
            onChange={(e) => updateFuneral("general_notes", e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="funeral_photo" className="text-base font-semibold">Preferred Photo</Label>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              Upload a photo you'd like to be used at your funeral or memorial service
            </p>
            
            {photoUrl ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img 
                    src={photoUrl} 
                    alt="Funeral photo" 
                    className="w-48 h-48 object-cover rounded-lg border-2 border-border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Label htmlFor="funeral_photo_replace" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Replace Photo
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="funeral_photo_replace"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="funeral_photo" className="cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <ImageIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">
                      {uploading ? "Uploading..." : "Click to upload photo"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WEBP (max 5MB)
                    </p>
                  </div>
                </Label>
                <input
                  id="funeral_photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-yellow-50 via-amber-50 to-background dark:from-yellow-950/20 dark:via-amber-950/10 dark:to-background border-2 border-yellow-400/30 rounded-lg shadow-md">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
            💼 Need Help Planning?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get expert quotes from Everlasting Funeral Services for <span className="font-semibold text-foreground">urns, caskets, flowers,</span> and <span className="font-semibold text-foreground">funeral packages</span>
          </p>
          <Button 
            asChild 
            size="lg" 
            className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base group"
          >
            <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
              Request a Quote from Everlasting Funeral Services
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};