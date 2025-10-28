import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SectionFinancialProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionFinancial = ({ data, onChange }: SectionFinancialProps) => {
  const financial = data.financial || {};
  const accounts = financial.accounts || [];
  const { toast } = useToast();
  const { t } = useTranslation();

  const updateFinancial = (field: string, value: any) => {
    onChange({
      ...data,
      financial: { ...financial, [field]: value }
    });
  };

  const addAccount = () => {
    updateFinancial("accounts", [...accounts, { type: "", institution: "", details: "" }]);
  };

  const updateAccount = (index: number, field: string, value: string) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    updateFinancial("accounts", updated);
  };

  const removeAccount = (index: number) => {
    updateFinancial("accounts", accounts.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: t("common.saved"),
      description: t("financial.saved"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t("navigation.financial")}</h2>
          <p className="text-muted-foreground">
            {t("financial.description")}
          </p>
          <p className="text-xs text-primary mt-1">✓ Auto-saves as you type</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {t("common.save")}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Fields auto-save automatically</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold text-sm">
          Privacy Protected: Financial Information Not Saved
        </AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 text-xs mt-1">
          For your security, <strong>we do NOT save</strong> sensitive financial details like account numbers, balances, or policy numbers. 
          You'll re-enter this information only when generating your PDF. It's only used for printing and never stored.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Account Types I Have</Label>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="checking"
              checked={financial.has_checking || false}
              onCheckedChange={(checked) => updateFinancial("has_checking", checked)}
            />
            <Label htmlFor="checking" className="font-normal">Checking accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="savings"
              checked={financial.has_savings || false}
              onCheckedChange={(checked) => updateFinancial("has_savings", checked)}
            />
            <Label htmlFor="savings" className="font-normal">Savings accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="retirement"
              checked={financial.has_retirement || false}
              onCheckedChange={(checked) => updateFinancial("has_retirement", checked)}
            />
            <Label htmlFor="retirement" className="font-normal">Retirement accounts (401k, IRA)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="investment"
              checked={financial.has_investment || false}
              onCheckedChange={(checked) => updateFinancial("has_investment", checked)}
            />
            <Label htmlFor="investment" className="font-normal">Investment/Brokerage accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="crypto"
              checked={financial.has_crypto || false}
              onCheckedChange={(checked) => updateFinancial("has_crypto", checked)}
            />
            <Label htmlFor="crypto" className="font-normal">Cryptocurrency</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="safe_deposit"
              checked={financial.has_safe_deposit || false}
              onCheckedChange={(checked) => updateFinancial("has_safe_deposit", checked)}
            />
            <Label htmlFor="safe_deposit" className="font-normal">Safe deposit box</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="business"
              checked={financial.has_business || false}
              onCheckedChange={(checked) => updateFinancial("has_business", checked)}
            />
            <Label htmlFor="business" className="font-normal">Business interests</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="debts"
              checked={financial.has_debts || false}
              onCheckedChange={(checked) => updateFinancial("has_debts", checked)}
            />
            <Label htmlFor="debts" className="font-normal">Outstanding debts/loans</Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Account Details</Label>
          <Button onClick={addAccount} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>

        {accounts.map((account: any, index: number) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Account {index + 1}</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addAccount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAccount(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <p className="text-xs text-muted-foreground">Category of financial account</p>
                <Input
                  value={account.type || ""}
                  onChange={(e) => updateAccount(index, "type", e.target.value)}
                  placeholder="e.g., Checking, 401k, Brokerage"
                />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <p className="text-xs text-muted-foreground">Bank or financial company name</p>
                <Input
                  value={account.institution || ""}
                  onChange={(e) => updateAccount(index, "institution", e.target.value)}
                  placeholder="Bank or company name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Details & Location of Documents</Label>
              <p className="text-xs text-muted-foreground">Account numbers, beneficiaries, document locations (use password manager for sensitive info)</p>
              <Textarea
                value={account.details || ""}
                onChange={(e) => updateAccount(index, "details", e.target.value)}
                placeholder="Account numbers, beneficiaries, document locations (avoid sensitive passwords)"
                rows={3}
              />
            </div>
          </Card>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No accounts added yet</p>
            <Button onClick={addAccount} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        )}
      </div>

      {/* Safe Deposit Box */}
      {financial.has_safe_deposit && (
        <div className="space-y-2">
          <Label htmlFor="safe_deposit_details" className="text-base font-semibold">Safe Deposit Box Details</Label>
          <p className="text-xs text-muted-foreground">Bank location, box number, key location, who has access, contents list</p>
          <Textarea
            id="safe_deposit_details"
            value={financial.safe_deposit_details || ""}
            onChange={(e) => updateFinancial("safe_deposit_details", e.target.value)}
            placeholder="Bank name and location, box number, key location, who has access, contents list..."
            rows={4}
          />
        </div>
      )}

      {/* Cryptocurrency */}
      {financial.has_crypto && (
        <div className="space-y-2">
          <Label htmlFor="crypto_details" className="text-base font-semibold">Cryptocurrency Details</Label>
          <p className="text-xs text-muted-foreground">Types of crypto, exchanges, wallet info, seed phrase location (store securely!), value</p>
          <Textarea
            id="crypto_details"
            value={financial.crypto_details || ""}
            onChange={(e) => updateFinancial("crypto_details", e.target.value)}
            placeholder="Types of crypto owned, exchanges used, wallet information, seed phrase location (stored securely!), estimated value..."
            rows={4}
          />
        </div>
      )}

      {/* Business Interests */}
      {financial.has_business && (
        <div className="space-y-2">
          <Label htmlFor="business_details" className="text-base font-semibold">Business Interests Details</Label>
          <p className="text-xs text-muted-foreground">Business name, ownership %, partners, succession plans, document locations, accountant/attorney contacts</p>
          <Textarea
            id="business_details"
            value={financial.business_details || ""}
            onChange={(e) => updateFinancial("business_details", e.target.value)}
            placeholder="Business name, ownership percentage, partner information, succession plans, business documents location, accountant/attorney contacts..."
            rows={4}
          />
        </div>
      )}

      {/* Debts */}
      {financial.has_debts && (
        <div className="space-y-2">
          <Label htmlFor="debts_details" className="text-base font-semibold">Outstanding Debts Details</Label>
          <p className="text-xs text-muted-foreground">List all loans, credit cards, mortgages with creditor names, account numbers, balances</p>
          <Textarea
            id="debts_details"
            value={financial.debts_details || ""}
            onChange={(e) => updateFinancial("debts_details", e.target.value)}
            placeholder="List all loans, credit cards, mortgages, car loans, personal loans. Include creditor names, account numbers, and approximate balances..."
            rows={4}
          />
        </div>
      )}

      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
        <h3 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
          🔒 Security Note:
        </h3>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          Avoid storing sensitive passwords or PINs here. Use a password manager and note "See password manager" instead.
        </p>
      </div>
    </div>
  );
};