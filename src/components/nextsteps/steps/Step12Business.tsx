import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface Step12BusinessProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

export function Step12Business({ formData, onSave }: Step12BusinessProps) {
  const [businessName, setBusinessName] = useState(formData?.step12?.businessName || "");
  const [businessType, setBusinessType] = useState(formData?.step12?.businessType || "");
  const [ein, setEin] = useState(formData?.step12?.ein || "");
  const [ownership, setOwnership] = useState(formData?.step12?.ownership || "");
  const [keyContacts, setKeyContacts] = useState(formData?.step12?.keyContacts || "");
  const [accountant, setAccountant] = useState(formData?.step12?.accountant || "");
  const [attorney, setAttorney] = useState(formData?.step12?.attorney || "");
  const [successionPlan, setSuccessionPlan] = useState(formData?.step12?.successionPlan || "");
  const [bankAccounts, setBankAccounts] = useState(formData?.step12?.bankAccounts || "");
  const [assets, setAssets] = useState(formData?.step12?.assets || "");
  const [liabilities, setLiabilities] = useState(formData?.step12?.liabilities || "");
  const [disposition, setDisposition] = useState(formData?.step12?.disposition || "");
  const [notes, setNotes] = useState(formData?.step12?.notes || "");
  
  const [partnersNotified, setPartnersNotified] = useState(formData?.step12?.partnersNotified || false);
  const [employeesNotified, setEmployeesNotified] = useState(formData?.step12?.employeesNotified || false);
  const [accountsTransferred, setAccountsTransferred] = useState(formData?.step12?.accountsTransferred || false);
  const [licensesHandled, setLicensesHandled] = useState(formData?.step12?.licensesHandled || false);
  const [dispositionComplete, setDispositionComplete] = useState(formData?.step12?.dispositionComplete || false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({
        step12: {
          businessName,
          businessType,
          ein,
          ownership,
          keyContacts,
          accountant,
          attorney,
          successionPlan,
          bankAccounts,
          assets,
          liabilities,
          disposition,
          notes,
          partnersNotified,
          employeesNotified,
          accountsTransferred,
          licensesHandled,
          dispositionComplete,
        },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    businessName, businessType, ein, ownership, keyContacts, accountant, attorney,
    successionPlan, bankAccounts, assets, liabilities, disposition, notes,
    partnersNotified, employeesNotified, accountsTransferred, licensesHandled, dispositionComplete
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Business Ownership & Management
        </h2>
        <p className="text-muted-foreground">
          Document business details, succession plans, key contacts, and disposition instructions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Legal business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Input
            id="businessType"
            placeholder="e.g., LLC, Corporation, Sole Proprietorship, Partnership"
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ein">EIN (Employer Identification Number)</Label>
          <Input
            id="ein"
            placeholder="Federal tax ID number"
            value={ein}
            onChange={(e) => setEin(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownership">Ownership Structure</Label>
          <Input
            id="ownership"
            placeholder="% ownership, partners, shareholders"
            value={ownership}
            onChange={(e) => setOwnership(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="keyContacts">Key Business Contacts</Label>
        <Textarea
          id="keyContacts"
          placeholder="Partners, managers, key employees with contact information"
          value={keyContacts}
          onChange={(e) => setKeyContacts(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="accountant">Business Accountant</Label>
          <Input
            id="accountant"
            placeholder="Name and contact information"
            value={accountant}
            onChange={(e) => setAccountant(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attorney">Business Attorney</Label>
          <Input
            id="attorney"
            placeholder="Name and contact information"
            value={attorney}
            onChange={(e) => setAttorney(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="successionPlan">Succession Plan</Label>
        <Textarea
          id="successionPlan"
          placeholder="Who will take over? Buy-sell agreement? Operating agreement provisions?"
          value={successionPlan}
          onChange={(e) => setSuccessionPlan(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bankAccounts">Business Bank Accounts</Label>
        <Textarea
          id="bankAccounts"
          placeholder="Bank names, account types, signers, online access"
          value={bankAccounts}
          onChange={(e) => setBankAccounts(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assets">Business Assets</Label>
        <Textarea
          id="assets"
          placeholder="Equipment, inventory, intellectual property, real estate, vehicles"
          value={assets}
          onChange={(e) => setAssets(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="liabilities">Business Liabilities</Label>
        <Textarea
          id="liabilities"
          placeholder="Loans, leases, contracts, obligations, payroll"
          value={liabilities}
          onChange={(e) => setLiabilities(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="disposition">Disposition Instructions</Label>
        <Textarea
          id="disposition"
          placeholder="Sell, transfer, dissolve? Timeline? Instructions for winding down or continuing?"
          value={disposition}
          onChange={(e) => setDisposition(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="font-semibold text-foreground">Business Tasks Checklist</h3>
        
        <div className="flex items-center gap-2">
          <Checkbox
            id="partnersNotified"
            checked={partnersNotified}
            onCheckedChange={(checked) => setPartnersNotified(checked as boolean)}
          />
          <Label htmlFor="partnersNotified" className="cursor-pointer">
            Partners/Co-owners notified
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="employeesNotified"
            checked={employeesNotified}
            onCheckedChange={(checked) => setEmployeesNotified(checked as boolean)}
          />
          <Label htmlFor="employeesNotified" className="cursor-pointer">
            Employees notified
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="accountsTransferred"
            checked={accountsTransferred}
            onCheckedChange={(checked) => setAccountsTransferred(checked as boolean)}
          />
          <Label htmlFor="accountsTransferred" className="cursor-pointer">
            Bank accounts and financial accounts transferred or closed
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="licensesHandled"
            checked={licensesHandled}
            onCheckedChange={(checked) => setLicensesHandled(checked as boolean)}
          />
          <Label htmlFor="licensesHandled" className="cursor-pointer">
            Business licenses and permits handled
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="dispositionComplete"
            checked={dispositionComplete}
            onCheckedChange={(checked) => setDispositionComplete(checked as boolean)}
          />
          <Label htmlFor="dispositionComplete" className="cursor-pointer">
            Business disposition completed per instructions
          </Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any other important business-related information"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
