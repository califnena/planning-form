import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionAboutProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionAbout = ({ value, onChange }: SectionAboutProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">🌟 About Me</h2>
        <p className="text-muted-foreground mb-6">
          Share your life story, accomplishments, hobbies, and how you'd like to be remembered.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="about">My Story & Legacy</Label>
        <Textarea
          id="about"
          placeholder="Share your life story, accomplishments, favorite memories, hobbies, and how you'd like to be remembered..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 What to Include:</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Career highlights and achievements</li>
          <li>Hobbies, passions, and interests</li>
          <li>Favorite memories with loved ones</li>
          <li>Values and beliefs that guided your life</li>
          <li>How you'd like to be remembered</li>
        </ul>
      </div>
    </div>
  );
};
