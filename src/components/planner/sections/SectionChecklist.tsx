import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SectionChecklistProps {
  value?: string;
  onChange: (value: string) => void;
}

const standardItems = [
  "Obtain death certificates (typically need 10-15 copies)",
  "Notify Social Security Administration",
  "Contact life insurance companies",
  "Notify employer and/or pension plan",
  "Contact banks and financial institutions",
  "Notify credit card companies",
  "Cancel subscriptions and memberships",
  "Forward mail through USPS",
  "Update property titles and deeds",
  "File final tax return",
];

export const SectionChecklist = ({ value, onChange }: SectionChecklistProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">✅ Checklist</h2>
        <p className="text-muted-foreground mb-6">
          Important tasks and reminders for your loved ones to complete.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Standard Tasks:</h3>
        {standardItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <Checkbox id={`check-${index}`} className="mt-1" />
            <label
              htmlFor={`check-${index}`}
              className="text-sm leading-relaxed cursor-pointer"
            >
              {item}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="checklist">Additional Tasks & Notes</Label>
        <Textarea
          id="checklist"
          placeholder="Add any additional tasks, deadlines, or important reminders..."
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="resize-none"
        />
      </div>
    </div>
  );
};
