import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionInstructionsProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionInstructions = ({ value, onChange }: SectionInstructionsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">📝 Instructions</h2>
        <p className="text-muted-foreground mb-6">
          Use this section to provide any special instructions or guidance for those who will use this plan.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">General Instructions & Notes</Label>
        <p className="text-xs text-muted-foreground">Document locations, time-sensitive actions, key contacts, and access codes</p>
        <Textarea
          id="instructions"
          placeholder="Add any instructions or important notes here..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Tips:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Include where important documents are stored</li>
          <li>Note any time-sensitive actions that should be taken</li>
          <li>Mention key people who should be contacted first</li>
          <li>Add passwords or access codes for critical accounts</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h3 className="font-semibold mb-3">Suggested Text:</h3>
        <p className="text-sm text-foreground leading-relaxed italic">
          "If you are reading this, it means you have the difficult task of carrying out my final wishes. 
          I want you to know that everything written here was prepared with love, to make this time a little 
          easier for you. My hope is that these pages will guide you — not only with the practical details, 
          but also with the memories and words I've left behind. Please trust that what I've recorded is meant 
          to lighten your burden and honor the life we shared. I am deeply grateful for your care and your love. 
          Thank you, with all my heart and soul."
        </p>
      </div>
    </div>
  );
};
