import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionLegalProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionLegal = ({ value, onChange }: SectionLegalProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">⚖️ Legal (Will/Trust)</h2>
        <p className="text-muted-foreground mb-6">
          Document location of legal documents, attorney information, and estate planning details.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="legal">Legal Documents & Estate Planning</Label>
        <Textarea
          id="legal"
          placeholder="Document the following:

WILL & TRUST:
- Location of original will
- Date will was last updated
- Executor(s) name and contact
- Trust information if applicable
- Trustee contact information

POWERS OF ATTORNEY:
- Financial power of attorney
- Healthcare power of attorney / Healthcare proxy
- Document locations

ADVANCE DIRECTIVES:
- Living will
- Do Not Resuscitate (DNR) orders
- POLST (Physician Orders for Life-Sustaining Treatment)

ATTORNEY INFORMATION:
- Estate planning attorney name
- Law firm and contact information
- Case or client number

GUARDIANSHIP:
- Guardians for minor children
- Backup guardians

OTHER LEGAL DOCUMENTS:
- Prenuptial or postnuptial agreements
- Divorce decrees
- Adoption papers
- Military discharge papers"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
        <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
          ⚠️ Important:
        </h3>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Keep original legal documents in a secure location (safe, safe deposit box, attorney's office).
          Inform your executor and trusted family members where these documents can be found.
        </p>
      </div>
    </div>
  );
};
