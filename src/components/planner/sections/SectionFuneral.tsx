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

      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Final Disposition Preference</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="burial"
                checked={funeral.burial || false}
                onCheckedChange={(checked) => updateFuneral("burial", checked)}
              />
              <Label htmlFor="burial" className="font-normal">Burial</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cremation"
                checked={funeral.cremation || false}
                onCheckedChange={(checked) => updateFuneral("cremation", checked)}
              />
              <Label htmlFor="cremation" className="font-normal">Cremation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="donation"
                checked={funeral.donation || false}
                onCheckedChange={(checked) => updateFuneral("donation", checked)}
              />
              <Label htmlFor="donation" className="font-normal">Body/Organ Donation</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-semibold mb-3 block">Service Preferences</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="religious"
                checked={funeral.religious_service || false}
                onCheckedChange={(checked) => updateFuneral("religious_service", checked)}
              />
              <Label htmlFor="religious" className="font-normal">Religious service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="secular"
                checked={funeral.secular_service || false}
                onCheckedChange={(checked) => updateFuneral("secular_service", checked)}
              />
              <Label htmlFor="secular" className="font-normal">Secular/Non-religious service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="celebration"
                checked={funeral.celebration_of_life || false}
                onCheckedChange={(checked) => updateFuneral("celebration_of_life", checked)}
              />
              <Label htmlFor="celebration" className="font-normal">Celebration of life</Label>
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
          <Label htmlFor="funeral_notes">Additional Details & Special Requests</Label>
          <Textarea
            id="funeral_notes"
            placeholder="Include:
- Preferred funeral home or location
- Music, readings, or speakers
- Burial location or what to do with ashes
- Specific traditions or rituals
- Dress code or flower preferences
- Budget guidelines
- Pre-paid plan details and contract location"
            value={funeral.notes || ""}
            onChange={(e) => updateFuneral("notes", e.target.value)}
            rows={10}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
};