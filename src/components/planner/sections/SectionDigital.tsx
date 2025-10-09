import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionDigitalProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionDigital = ({ data, onChange }: SectionDigitalProps) => {
  const digital = data.digital || {};
  const accounts = digital.accounts || [];
  const phones = digital.phones || [];
  const { toast } = useToast();

  const updateDigital = (field: string, value: any) => {
    onChange({
      ...data,
      digital: { ...digital, [field]: value }
    });
  };

  const addAccount = () => {
    updateDigital("accounts", [...accounts, { platform: "", username: "", action: "" }]);
  };

  const updateAccount = (index: number, field: string, value: string) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    updateDigital("accounts", updated);
  };

  const removeAccount = (index: number) => {
    updateDigital("accounts", accounts.filter((_: any, i: number) => i !== index));
  };

  const addPhone = () => {
    updateDigital("phones", [...phones, { carrier: "", number: "", pin: "" }]);
  };

  const updatePhone = (index: number, field: string, value: string) => {
    const updated = [...phones];
    updated[index] = { ...updated[index], [field]: value };
    updateDigital("phones", updated);
  };

  const removePhone = (index: number) => {
    updateDigital("phones", phones.filter((_: any, i: number) => i !== index));
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Digital world information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">💻 Digital World</h2>
          <p className="text-muted-foreground">
            Manage your digital legacy and online accounts.
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
              checked={digital.has_social_media || false}
              onCheckedChange={(checked) => updateDigital("has_social_media", checked)}
            />
            <Label htmlFor="social_media" className="font-normal">Social media accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email"
              checked={digital.has_email || false}
              onCheckedChange={(checked) => updateDigital("has_email", checked)}
            />
            <Label htmlFor="email" className="font-normal">Email accounts</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cloud_storage"
              checked={digital.has_cloud_storage || false}
              onCheckedChange={(checked) => updateDigital("has_cloud_storage", checked)}
            />
            <Label htmlFor="cloud_storage" className="font-normal">Cloud storage (Google, iCloud, Dropbox)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="streaming"
              checked={digital.has_streaming || false}
              onCheckedChange={(checked) => updateDigital("has_streaming", checked)}
            />
            <Label htmlFor="streaming" className="font-normal">Streaming services</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shopping"
              checked={digital.has_shopping || false}
              onCheckedChange={(checked) => updateDigital("has_shopping", checked)}
            />
            <Label htmlFor="shopping" className="font-normal">Shopping accounts (Amazon, etc.)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="photo_sites"
              checked={digital.has_photo_sites || false}
              onCheckedChange={(checked) => updateDigital("has_photo_sites", checked)}
            />
            <Label htmlFor="photo_sites" className="font-normal">Photo sharing sites</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="domains"
              checked={digital.has_domains || false}
              onCheckedChange={(checked) => updateDigital("has_domains", checked)}
            />
            <Label htmlFor="domains" className="font-normal">Domain names or websites</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="password_manager"
              checked={digital.has_password_manager || false}
              onCheckedChange={(checked) => updateDigital("has_password_manager", checked)}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removePhone(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAccount(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
              <p className="text-xs text-muted-foreground">What should happen to this account (memorialize, delete, transfer)</p>
              <Input
                value={account.action || ""}
                onChange={(e) => updateAccount(index, "action", e.target.value)}
                placeholder="e.g., Memorialize, Delete, Transfer to..."
              />
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
          value={digital.password_manager_info || ""}
          onChange={(e) => updateDigital("password_manager_info", e.target.value)}
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
              Apple Legacy Contact Setup
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
        </ul>
      </div>
    </div>
  );
};