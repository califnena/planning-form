import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionMessagesProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionMessages = ({ value, onChange }: SectionMessagesProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">❤️ Messages</h2>
        <p className="text-muted-foreground mb-6">
          Leave heartfelt messages for your loved ones that will be cherished forever.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="messages">Letters to Loved Ones</Label>
        <Textarea
          id="messages"
          placeholder="Write personal messages to:

- Your spouse or partner
- Your children
- Your parents
- Your siblings
- Close friends
- Future generations

Share:
- Your love and gratitude
- Cherished memories
- Life lessons and wisdom
- Hopes and dreams for their future
- Apologies or forgiveness if needed
- Final wishes or requests

These messages will be a precious gift to those you leave behind."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💝 Suggestions:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Be authentic and speak from the heart</li>
          <li>Share specific memories that were meaningful to you</li>
          <li>Express gratitude for the time you shared together</li>
          <li>Include humor and lightness where appropriate</li>
          <li>Remind them to take care of themselves and each other</li>
        </ul>
      </div>
    </div>
  );
};
