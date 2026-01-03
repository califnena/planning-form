import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PrivacyModal } from "@/components/PrivacyModal";

interface Account {
  id: string;
  provider: string;
  username: string;
  twofa_method: string;
  recovery_info: string;
  notes: string;
}

interface PhoneAccount {
  id: string;
  carrier: string;
  number: string;
  pin_location: string;
}

interface OnlineAccountsData {
  categories: {
    email: Account[];
    social: Account[];
    banking: Account[];
    subscriptions: Account[];
    utilities: Account[];
    phone: PhoneAccount[];
    other: Account[];
  };
  password_manager_info: string;
}

interface SectionDigitalProps {
  data: any;
  onChange: (data: any) => void;
}

const ACCOUNT_CATEGORIES = [
  { key: "email", label: "📧 Email Accounts", icon: "📧" },
  { key: "social", label: "💬 Social Media", icon: "💬" },
  { key: "banking", label: "🏦 Banking & Financial", icon: "🏦" },
  { key: "subscriptions", label: "📺 Subscriptions & Streaming", icon: "📺" },
  { key: "utilities", label: "🏠 Utilities & Bills", icon: "🏠" },
  { key: "other", label: "📦 Other Accounts", icon: "📦" },
];

const TWOFA_METHODS = [
  "None",
  "Text/SMS",
  "Authenticator App",
  "Security Key",
  "Email",
  "Phone Call",
  "Unknown",
];

/**
 * SectionDigital
 * 
 * CANONICAL KEY: online_accounts (object in plan_payload)
 * Structure: { categories: { email:[], social:[], ... }, password_manager_info: string }
 */
export const SectionDigital = ({ data, onChange }: SectionDigitalProps) => {
  // Read and normalize from canonical key
  const rawOnlineAccounts = data.online_accounts || data.digital || {};
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Migrate old structure to new categories structure
  const getOnlineAccounts = (): OnlineAccountsData => {
    // If already has categories structure, use it
    if (rawOnlineAccounts.categories) {
      return rawOnlineAccounts as OnlineAccountsData;
    }

    // Migrate from old flat structure
    const oldAccounts = rawOnlineAccounts.accounts || [];
    const oldPhones = rawOnlineAccounts.phones || [];

    // Create new categories structure with migrated data
    const categories: OnlineAccountsData["categories"] = {
      email: [],
      social: [],
      banking: [],
      subscriptions: [],
      utilities: [],
      phone: oldPhones.map((p: any) => ({
        id: p.id || crypto.randomUUID(),
        carrier: p.carrier || "",
        number: p.number || "",
        pin_location: p.pin || "",
      })),
      other: oldAccounts.map((a: any) => ({
        id: a.id || crypto.randomUUID(),
        provider: a.platform || "",
        username: a.username || "",
        twofa_method: "",
        recovery_info: "",
        notes: a.action_custom || "",
      })),
    };

    return {
      categories,
      password_manager_info: rawOnlineAccounts.password_manager_info || "",
    };
  };

  const online_accounts = getOnlineAccounts();

  const updateOnlineAccounts = (updated: OnlineAccountsData) => {
    onChange({
      ...data,
      online_accounts: updated,
    });

    if (import.meta.env.DEV) {
      console.log("[SectionDigital] Updated online_accounts with categories");
    }
  };

  const addAccount = (category: string) => {
    if (category === "phone") {
      const newPhone: PhoneAccount = {
        id: crypto.randomUUID(),
        carrier: "",
        number: "",
        pin_location: "",
      };
      const updated = { ...online_accounts };
      updated.categories.phone = [...updated.categories.phone, newPhone];
      updateOnlineAccounts(updated);
    } else {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        provider: "",
        username: "",
        twofa_method: "",
        recovery_info: "",
        notes: "",
      };
      const updated = { ...online_accounts };
      (updated.categories as any)[category] = [...(updated.categories as any)[category], newAccount];
      updateOnlineAccounts(updated);
    }
  };

  const updateAccount = (category: string, index: number, field: string, value: string) => {
    const updated = { ...online_accounts };
    const categoryArray = [...(updated.categories as any)[category]];
    categoryArray[index] = { ...categoryArray[index], [field]: value };
    (updated.categories as any)[category] = categoryArray;
    updateOnlineAccounts(updated);
  };

  const removeAccount = (category: string, index: number) => {
    const updated = { ...online_accounts };
    (updated.categories as any)[category] = (updated.categories as any)[category].filter(
      (_: any, i: number) => i !== index
    );
    updateOnlineAccounts(updated);
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Online accounts information has been saved.",
    });
  };

  const getTotalAccounts = () => {
    return Object.values(online_accounts.categories).reduce(
      (sum, arr) => sum + (arr?.length || 0),
      0
    );
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
          <p className="text-sm text-primary mt-1">
            {getTotalAccounts()} accounts tracked
          </p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      {/* Phone Accounts - Special section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">📱 Phone Accounts</h3>
          <Button onClick={() => addAccount("phone")} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Phone
          </Button>
        </div>

        {online_accounts.categories.phone.length === 0 ? (
          <p className="text-muted-foreground text-sm">No phone accounts added yet.</p>
        ) : (
          <div className="space-y-3">
            {online_accounts.categories.phone.map((phone, index) => (
              <div key={phone.id} className="border rounded-lg p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Phone {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccount("phone", index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Carrier</Label>
                    <Input
                      value={phone.carrier}
                      onChange={(e) => updateAccount("phone", index, "carrier", e.target.value)}
                      placeholder="e.g., Verizon"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Phone Number</Label>
                    <Input
                      value={phone.number}
                      onChange={(e) => updateAccount("phone", index, "number", e.target.value)}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">PIN Location</Label>
                    <Input
                      value={phone.pin_location}
                      onChange={(e) => updateAccount("phone", index, "pin_location", e.target.value)}
                      placeholder="Where PIN is stored"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Account Categories - Accordion */}
      <Accordion type="multiple" className="space-y-2">
        {ACCOUNT_CATEGORIES.map(({ key, label }) => {
          const accounts = (online_accounts.categories as any)[key] || [];
          return (
            <AccordionItem key={key} value={key} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {accounts.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4">
                <Button
                  onClick={() => addAccount(key)}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add {label.split(" ").slice(1).join(" ")} Account
                </Button>

                {accounts.map((account: Account, index: number) => (
                  <Card key={account.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Account {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAccount(key, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Provider/Service</Label>
                        <Input
                          value={account.provider}
                          onChange={(e) =>
                            updateAccount(key, index, "provider", e.target.value)
                          }
                          placeholder="e.g., Google, Netflix"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Username/Email</Label>
                        <Input
                          value={account.username}
                          onChange={(e) =>
                            updateAccount(key, index, "username", e.target.value)
                          }
                          placeholder="Your login identifier"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">2FA Method</Label>
                        <Select
                          value={account.twofa_method}
                          onValueChange={(value) =>
                            updateAccount(key, index, "twofa_method", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select 2FA method" />
                          </SelectTrigger>
                          <SelectContent>
                            {TWOFA_METHODS.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Recovery Info Location</Label>
                        <Input
                          value={account.recovery_info}
                          onChange={(e) =>
                            updateAccount(key, index, "recovery_info", e.target.value)
                          }
                          placeholder="Where recovery codes are stored"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Notes</Label>
                      <Textarea
                        value={account.notes}
                        onChange={(e) => updateAccount(key, index, "notes", e.target.value)}
                        placeholder="Additional instructions..."
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}

                {accounts.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-2">
                    No accounts in this category yet.
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Password Manager */}
      <div className="space-y-2">
        <Label htmlFor="password_manager_info">🔐 Password Manager Information</Label>
        <p className="text-xs text-muted-foreground">
          Which password manager you use and where the master password is stored
        </p>
        <Textarea
          id="password_manager_info"
          value={online_accounts.password_manager_info || ""}
          onChange={(e) =>
            updateOnlineAccounts({
              ...online_accounts,
              password_manager_info: e.target.value,
            })
          }
          placeholder="Which password manager do you use? Where is the master password stored?"
          rows={3}
        />
      </div>

      {/* Helpful Resources */}
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
              href="https://www.facebook.com/help/1568013990080948"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Facebook Legacy Contact
            </a>
          </li>
        </ul>
      </div>

      <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />
    </div>
  );
};
