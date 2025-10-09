import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionFuneralProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionFuneral = ({ value, onChange }: SectionFuneralProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">🕊️ Funeral Wishes</h2>
        <p className="text-muted-foreground mb-6">
          Document your preferences for funeral or memorial services, burial or cremation, and any specific wishes.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="funeral">Funeral & Memorial Preferences</Label>
        <Textarea
          id="funeral"
          placeholder="Describe your preferences for:
- Funeral home or memorial service location
- Burial, cremation, or other arrangements
- Type of service (religious, secular, celebration of life)
- Music, readings, or speakers you'd like
- Preferred burial location or what to do with ashes
- Any specific traditions or rituals to include
- Dress code or flower preferences"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Important Considerations:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Pre-paid funeral plans (include contract details)</li>
          <li>Veteran burial benefits if applicable</li>
          <li>Organ or body donation preferences</li>
          <li>Memorial or obituary preferences</li>
          <li>Budget guidelines for services</li>
        </ul>
      </div>
    </div>
  );
};
