import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PIIData {
  // Personal
  ssn?: string;
  dob?: string;
  address?: string;
  phone?: string;
  email?: string;
  
  // Financial
  financial_accounts?: string;
  safe_deposit?: string;
  crypto?: string;
  
  // Insurance
  insurance_policies?: string;
  
  // Legal
  legal_documents?: string;
}

interface PIICollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (piiData: PIIData) => void;
}

export const PIICollectionDialog = ({ open, onOpenChange, onSubmit }: PIICollectionDialogProps) => {
  const [piiData, setPIIData] = useState<PIIData>({});

  const updateField = (field: keyof PIIData, value: string) => {
    setPIIData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(piiData);
    onOpenChange(false);
    // Clear data after submission
    setPIIData({});
  };

  const handleSkip = () => {
    onSubmit({});
    onOpenChange(false);
    setPIIData({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Add Information for Your Printable Copy</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-900 dark:text-amber-100 text-sm leading-relaxed">
                <strong>For your privacy, we do not save</strong> Social Security numbers, date of birth, or full address. 
                If you want them included on your printable copy, you can type them here. 
                You can also skip and handwrite them later.
              </AlertDescription>
            </Alert>
            <p className="text-sm leading-relaxed">
              Enter any details you want included in your printable copy. All fields are optional - 
              skip any you don't want to include.
            </p>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Personal Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="ssn">Social Security Number</Label>
                <Input
                  id="ssn"
                  placeholder="XXX-XX-XXXX"
                  value={piiData.ssn || ""}
                  onChange={(e) => updateField("ssn", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={piiData.dob || ""}
                  onChange={(e) => updateField("dob", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  placeholder="Street, City, State, ZIP"
                  value={piiData.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(XXX) XXX-XXXX"
                    value={piiData.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={piiData.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Financial Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="financial_accounts">Bank/Investment Accounts</Label>
                <Textarea
                  id="financial_accounts"
                  placeholder="List account numbers, institutions, and details..."
                  value={piiData.financial_accounts || ""}
                  onChange={(e) => updateField("financial_accounts", e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Example: Chase Checking #1234, Fidelity IRA #5678
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="safe_deposit">Safe Deposit Box Details</Label>
                <Input
                  id="safe_deposit"
                  placeholder="Bank, box number, key location..."
                  value={piiData.safe_deposit || ""}
                  onChange={(e) => updateField("safe_deposit", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crypto">Cryptocurrency Wallets</Label>
                <Textarea
                  id="crypto"
                  placeholder="Wallet addresses, recovery phrases, exchange accounts..."
                  value={piiData.crypto || ""}
                  onChange={(e) => updateField("crypto", e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Insurance Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="insurance_policies">Insurance Policies</Label>
                <Textarea
                  id="insurance_policies"
                  placeholder="List policy numbers, companies, beneficiaries..."
                  value={piiData.insurance_policies || ""}
                  onChange={(e) => updateField("insurance_policies", e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Example: Life Insurance - State Farm #ABC123, beneficiary: John Doe
                </p>
              </div>
            </div>

            {/* Legal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-base border-b pb-2">Legal Documents</h3>
              
              <div className="space-y-2">
                <Label htmlFor="legal_documents">Legal Document Details</Label>
                <Textarea
                  id="legal_documents"
                  placeholder="Will location, executor details, power of attorney info..."
                  value={piiData.legal_documents || ""}
                  onChange={(e) => updateField("legal_documents", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto min-h-[48px]">
            Skip - I'll handwrite these later
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto min-h-[48px]">
            Create My Printable Copy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};