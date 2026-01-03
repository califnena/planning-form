import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PrivacyModal } from "@/components/PrivacyModal";

interface SectionDigitalProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * SectionDigital
 * 
 * CANONICAL KEY: online_accounts (object in plan_payload)
 * 
 * SAVE: data.online_accounts → plan_payload.online_accounts
 * READ: data.online_accounts from plan_payload
 * COMPLETION: hasMeaningfulData(plan_payload.online_accounts)
 */
export const SectionDigital = ({ data, onChange }: SectionDigitalProps) => {
  // CANONICAL: Read from online_accounts (migrate from digital if needed)
  const online_accounts = data.online_accounts || data.digital || {};
  const accounts = online_accounts.accounts || [];
  const phones = online_accounts.phones || [];
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const updateOnlineAccounts = (field: string, value: any) => {
    // CANONICAL: Write to online_accounts
    const updated = {
      ...data,
      online_accounts: { ...online_accounts, [field]: value }
    };
    
    if (import.meta.env.DEV) {
      console.log("[SectionDigital] updateOnlineAccounts:", field, "→ online_accounts");
    }
    
    onChange(updated);
  };

  const addAccount = () => {
    updateOnlineAccounts("accounts", [...accounts, { platform: "", username: "", action: "" }]);
  };

  const addAccountWithPlatform = (platform: string) => {
    updateOnlineAccounts("accounts", [...accounts, { platform, username: "", action: "" }]);
  };

  const updateAccount = (index: number, field: string, value: string | boolean) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    updateOnlineAccounts("accounts", updated);
  };

  const removeAccount = (index: number) => {
    updateOnlineAccounts("accounts", accounts.filter((_: any, i: number) => i !== index));
  };

  const addPhone = () => {
    updateOnlineAccounts("phones", [...phones, { carrier: "", number: "", pin: "" }]);
  };

  const updatePhone = (index: number, field: string, value: string) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], [field]: value };
    updateOnlineAccounts("phones", updated);
  };

  const removePhone = (index: number) => {
    updateOnlineAccounts("phones", phones.filter((_: any, i: number) => i !== index));
  };

  // Auto-create account when checkbox is checked
  const handleCheckboxChange = (field: string, value: boolean) => {
    updateOnlineAccounts(field, value);
    
    if (field.startsWith('has_') && value === true && field !== 'has_password_manager') {
      const accountType = field.replace('has_', '').replace(/_/g, ' ');
      const typeCapitalized = accountType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      const existingAccount = accounts.find((acc: any) => 
        acc.platform?.toLowerCase().includes(accountType.toLowerCase())
      );
      
      if (!existingAccount) {
        addAccountWithPlatform(typeCapitalized);
      }
    }
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Online accounts information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">💻 Online Accounts</h2>
          <p className="text-muted-foreground">
            Manage your digital legacy and online accounts.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            We do not store passwords or PINs.{" "}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="underline hover:text-foreground transition-colors"
            >
              Privacy & Data
            </button>
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Digital Assets I Have</Label>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="social_media"
              checked={online_accounts.has_social_media || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_social_media", checked as boolean)}
            />
            <Label htmlFor="social_media" className="font-normal">Social media accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={online_accounts.has_email || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_email", checked as boolean)}
            />
            <Label htmlFor="email" className="font-normal">Email accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cloud_storage"
              checked={online_accounts.has_cloud_storage || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_cloud_storage", checked as boolean)}
            />
            <Label htmlFor="cloud_storage" className="font-normal">Cloud storage (Google, iCloud, Dropbox)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="streaming"
              checked={online_accounts.has_streaming || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_streaming", checked as boolean)}
            />
            <Label htmlFor="streaming" className="font-normal">Streaming services</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shopping"
              checked={online_accounts.has_shopping || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_shopping", checked as boolean)}
            />
            <Label htmlFor="shopping" className="font-normal">Shopping accounts (Amazon, etc.)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="photo_sites"
              checked={online_accounts.has_photo_sites || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_photo_sites", checked as boolean)}
            />
            <Label htmlFor="photo_sites" className="font-normal">Photo sharing sites</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="domains"
              checked={online_accounts.has_domains || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_domains", checked as boolean)}
            />
            <Label htmlFor="domains" className="font-normal">Domain names or websites</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="password_manager"
              checked={online_accounts.has_password_manager || false}
              onCheckedChange={(checked) => handleCheckboxChange("has_password_manager", checked as boolean)}
            />
            <Label htmlFor="password_manager" className="font-normal">Password manager</Label>
          </div>
        </div>
      </div>

      {/* Phone Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">📱 Phone Accounts</Label>
          <Button onClick={addPhone} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Phone
          </Button>
        </div>

        {phones.map((phone: any, index: number) => (
          <Card key={index} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Phone {index + 1}</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addPhone}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePhone(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <p className="text-xs text-muted-foreground">Mobile service provider</p>
                <Input
                  value={phone.carrier || ""}
                  onChange={(e) => updatePhone(index, "carrier", e.target.value)}
                  placeholder="e.g., Verizon, AT&T"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <p className="text-xs text-muted-foreground">Your mobile number</p>
                <Input
                  value={phone.number || ""}
                  onChange={(e) => updatePhone(index, "number", e.target.value)}
                  placeholder="(123) 456-7890"
                />
              </div>
              <div className="space-y-2">
                <Label>PIN/Password Location</Label>
                <p className="text-xs text-muted-foreground">Where account PIN is stored</p>
                <Input
                  value={phone.pin || ""}
                  onChange={(e) => updatePhone(index, "pin", e.target.value)}
                  placeholder="Where PIN is stored"
                />
              </div>
            </div>
          </Card>
        ))}

        {phones.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No phones added yet</p>
            <Button onClick={addPhone} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Phone
            </Button>
          </div>
        )}
      </div>

      {/* Digital Accounts */}
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
                <Label>Platform/Service</Label>
                <p className="text-xs text-muted-foreground">Name of digital service or platform</p>
                <Input
                  value={account.platform || ""}
                  onChange={(e) => updateAccount(index, "platform", e.target.value)}
                  placeholder="e.g., Facebook, Gmail, Netflix"
                />
              </div>
              <div className="space-y-2">
                <Label>Username/Email</Label>
                <p className="text-xs text-muted-foreground">How you log into this account</p>
                <Input
                  value={account.username || ""}
                  onChange={(e) => updateAccount(index, "username", e.target.value)}
                  placeholder="Your account identifier"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred Action</Label>
              <p className="text-xs text-muted-foreground">What should happen to this account</p>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`memorialize-${index}`}
                      checked={account.action_memorialize || false}
                      onCheckedChange={(checked) => updateAccount(index, "action_memorialize", checked as boolean)}
                    />
                    <Label htmlFor={`memorialize-${index}`} className="font-normal">Memorialize</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`delete-${index}`}
                      checked={account.action_delete || false}
                      onCheckedChange={(checked) => updateAccount(index, "action_delete", checked as boolean)}
                    />
                    <Label htmlFor={`delete-${index}`} className="font-normal">Delete</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`transfer-${index}`}
                      checked={account.action_transfer || false}
                      onCheckedChange={(checked) => updateAccount(index, "action_transfer", checked as boolean)}
                    />
                    <Label htmlFor={`transfer-${index}`} className="font-normal">Transfer</Label>
                  </div>
                </div>
                <Input
                  value={account.action_custom || ""}
                  onChange={(e) => updateAccount(index, "action_custom", e.target.value)}
                  placeholder="Additional instructions or specify transfer recipient..."
                />
              </div>
            </div>
          </Card>
        ))}

        {accounts.length === 0 && (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-3">No digital accounts added yet</p>
            <Button onClick={addAccount} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Account
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_manager_info">Password Manager Information</Label>
        <p className="text-xs text-muted-foreground">Which password manager you use and where the master password is stored</p>
        <Textarea
          id="password_manager_info"
          value={online_accounts.password_manager_info || ""}
          onChange={(e) => updateOnlineAccounts("password_manager_info", e.target.value)}
          placeholder="Which password manager do you use? Where is the master password stored?"
          rows={3}
        />
      </div>

      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">🔗 Helpful Resources:</h3>
        <ul className="text-sm space-y-1">
          <li>
            <a
              href="https://support.apple.com/en-us/102431"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Apple Legacy Contact Setup (iPhone)
            </a>
          </li>
          <li>
            <a
              href="https://myaccount.google.com/inactive"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Inactive Account Manager
            </a>
          </li>
          <li>
            <a
              href="#faq"
              onClick={(e) => {
                e.preventDefault();
                const faqSection = document.querySelector('[data-section="faq"]');
                if (faqSection) faqSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-primary hover:underline"
            >
              Digital Legacy Section in Guide & FAQ
            </a>
          </li>
        </ul>
      </div>
      
      <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </div>
  );
};