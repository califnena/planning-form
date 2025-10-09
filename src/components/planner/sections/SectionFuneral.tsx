import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionFuneralProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionFuneral = ({ data, onChange }: SectionFuneralProps) => {
  const funeral = data.funeral || {};
  const { toast } = useToast();

  const updateFuneral = (field: string, value: any) => {
    onChange({
      ...data,
      funeral: { ...funeral, [field]: value }
    });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Funeral wishes have been saved.",
    });
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
          <Label htmlFor="funeral_general_notes">Additional Details & Special Requests</Label>
          <p className="text-xs text-muted-foreground">Preferred funeral home, music, readings, speakers, traditions, dress code, flowers, budget, pre-paid plan details</p>
          <Textarea
            id="funeral_general_notes"
            placeholder="Include:
- Preferred funeral home or location
- Music, readings, or speakers
- Specific traditions or rituals
- Dress code or flower preferences
- Budget guidelines
- Pre-paid plan details and contract location"
            value={funeral.general_notes || ""}
            onChange={(e) => updateFuneral("general_notes", e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div>
            <h3 className="font-semibold mb-2">💼 Get Quotes for Funeral Services</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Request individual quotes from Everlasting Funeral Services
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm">
              <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer">
                Get Quote: Caskets
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer">
                Get Quote: Urns
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="https://everlastingfuneraladvisors.com" target="_blank" rel="noopener noreferrer">
                Get Quote: Flowers
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};