import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SectionFinancialProps {
  value?: string;
  onChange: (value: string) => void;
}

export const SectionFinancial = ({ value, onChange }: SectionFinancialProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">💰 Financial Life</h2>
        <p className="text-muted-foreground mb-6">
          Document your financial accounts, assets, and important financial information.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="financial">Financial Overview & Notes</Label>
        <Textarea
          id="financial"
          placeholder="Include information about:
- Bank accounts (checking, savings)
- Investment accounts (brokerage, retirement, 401k, IRA)
- Loans and debts (mortgages, credit cards, personal loans)
- Safe deposit boxes and their locations
- Cryptocurrency or digital assets
- Business interests or partnerships
- Expected inheritances or trusts
- Tax preparation information
- Financial advisor contact information"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className="resize-none"
        />
      </div>

      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
        <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
          🔒 Security Note:
        </h3>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Sensitive information like account numbers and passwords should be stored securely.
          Consider using a password manager and only noting "See password manager" here.
        </p>
      </div>
    </div>
  );
};
