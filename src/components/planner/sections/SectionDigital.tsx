import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Canonical categories for online accounts
const ACCOUNT_CATEGORIES = [
  { value: "email", label: "Email" },
  { value: "banking", label: "Banking" },
  { value: "investments", label: "Investments" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "social", label: "Social Media" },
  { value: "shopping", label: "Shopping" },
  { value: "utilities", label: "Utilities" },
  { value: "subscriptions", label: "Subscriptions" },
  { value: "phone", label: "Phone/Mobile" },
  { value: "health", label: "Health/Medical" },
  { value: "other", label: "Other" },
] as const;

const TWO_FACTOR_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
] as const;

const PASSWORD_MANAGER_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
] as const;

// CANONICAL data model for online accounts
interface OnlineAccount {
  id: string;
  category: string;
  provider_name: string;
  website_url: string | null;
  username_or_email: string | null;
  recovery_method: string | null;
  two_factor_enabled: "yes" | "no" | "unknown" | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OnlineAccountsData {
  warning_acknowledged: boolean;
  accounts: OnlineAccount[];
  access_instructions: string | null;
  password_manager_used: "yes" | "no" | "unknown" | null;
  password_manager_name: string | null;
  last_updated: string | null;
}

interface SectionDigitalProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

// Generate UUID safely
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Normalize incoming data to CANONICAL structure
function normalizeOnlineAccountsData(data: Record<string, any>): OnlineAccountsData {
  const source = data?.online_accounts || data?.digital || {};
  
  let accounts: OnlineAccount[] = [];
  
  // Case 1: New canonical flat accounts array
  if (Array.isArray(source.accounts)) {
    accounts = source.accounts.map((acc: any) => ({
      id: acc.id || generateId(),
      category: acc.category || "other",
      provider_name: acc.provider_name || acc.provider || acc.platform || "",
      website_url: acc.website_url || acc.url || null,
      username_or_email: acc.username_or_email || acc.username || acc.email || null,
      recovery_method: acc.recovery_method || acc.recovery || acc.recovery_info || null,
      two_factor_enabled: acc.two_factor_enabled || 
        (acc.twofa_method && acc.twofa_method !== "None" ? "yes" : null),
      notes: acc.notes || null,
      created_at: acc.created_at || new Date().toISOString(),
      updated_at: acc.updated_at || new Date().toISOString(),
    }));
  } 
  // Case 2: Legacy categorized structure (from old UI)
  else if (source.categories) {
    const categories = source.categories;
    const categoryKeys = ["email", "social", "banking", "subscriptions", "utilities", "phone", "other", "investments", "crypto", "health", "shopping"];
    
    categoryKeys.forEach((cat) => {
      const catAccounts = categories[cat];
      if (Array.isArray(catAccounts)) {
        catAccounts.forEach((acc: any) => {
          // Handle phone accounts differently (they have carrier/number instead of provider)
          if (cat === "phone" && (acc.carrier || acc.number)) {
            accounts.push({
              id: acc.id || generateId(),
              category: "phone",
              provider_name: acc.carrier || "",
              website_url: null,
              username_or_email: acc.number || null,
              recovery_method: acc.pin_location || null,
              two_factor_enabled: null,
              notes: null,
              created_at: acc.created_at || new Date().toISOString(),
              updated_at: acc.updated_at || new Date().toISOString(),
            });
          } else if (acc.provider || acc.provider_name) {
            accounts.push({
              id: acc.id || generateId(),
              category: cat,
              provider_name: acc.provider_name || acc.provider || "",
              website_url: acc.website_url || null,
              username_or_email: acc.username_or_email || acc.username || null,
              recovery_method: acc.recovery_method || acc.recovery_info || null,
              two_factor_enabled: acc.twofa_method && acc.twofa_method !== "None" ? "yes" : null,
              notes: acc.notes || null,
              created_at: acc.created_at || new Date().toISOString(),
              updated_at: acc.updated_at || new Date().toISOString(),
            });
          }
        });
      }
    });
  }

  return {
    warning_acknowledged: source.warning_acknowledged ?? false,
    accounts,
    access_instructions: source.access_instructions || source.password_manager_info || null,
    password_manager_used: source.password_manager_used || null,
    password_manager_name: source.password_manager_name || null,
    last_updated: source.last_updated || null,
  };
}

export const SectionDigital = ({ data, onChange }: SectionDigitalProps) => {
  const { toast } = useToast();
  const [onlineAccounts, setOnlineAccounts] = useState<OnlineAccountsData>(() => 
    normalizeOnlineAccountsData(data)
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Re-normalize when data prop changes from parent
  useEffect(() => {
    const normalized = normalizeOnlineAccountsData(data);
    setOnlineAccounts(normalized);
    setHasChanges(false);
  }, [data]);

  const updateLocalState = (updates: Partial<OnlineAccountsData>) => {
    const newData: OnlineAccountsData = {
      ...onlineAccounts,
      ...updates,
      last_updated: new Date().toISOString(),
    };
    setOnlineAccounts(newData);
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save to parent with CANONICAL key: online_accounts
    onChange({
      ...data,
      online_accounts: onlineAccounts,
    });
    setHasChanges(false);
    toast({
      title: "Saved",
      description: "Online accounts information has been saved.",
    });
  };

  const addAccount = () => {
    const newAccount: OnlineAccount = {
      id: generateId(),
      category: "other",
      provider_name: "",
      website_url: null,
      username_or_email: null,
      recovery_method: null,
      two_factor_enabled: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    updateLocalState({ accounts: [...onlineAccounts.accounts, newAccount] });
  };

  const updateAccount = (id: string, field: keyof OnlineAccount, value: any) => {
    const updatedAccounts = onlineAccounts.accounts.map((acc) =>
      acc.id === id
        ? { ...acc, [field]: value || null, updated_at: new Date().toISOString() }
        : acc
    );
    updateLocalState({ accounts: updatedAccounts });
  };

  const removeAccount = (id: string) => {
    updateLocalState({ accounts: onlineAccounts.accounts.filter((acc) => acc.id !== id) });
  };

  const acknowledgeWarning = () => {
    updateLocalState({ warning_acknowledged: true });
  };

  const getTotalAccounts = () => onlineAccounts.accounts.length;

  return (
    <div className="space-y-6">
      {/* Security Warning - ALWAYS VISIBLE */}
      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
        <Shield className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
          <strong>Security Notice:</strong> Do not store passwords here. This section helps your family locate and access accounts. For security, only record account names, usernames, and recovery methods.
        </AlertDescription>
      </Alert>

      {/* Warning Acknowledgement */}
      {!onlineAccounts.warning_acknowledged && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              Your data is encrypted and stored securely. Only share access with trusted individuals.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={acknowledgeWarning}
              className="border-amber-500 text-amber-700 hover:bg-amber-100"
            >
              I understand, continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Accounts Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Online Accounts</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {getTotalAccounts()} account{getTotalAccounts() !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button onClick={handleSave} size="sm" className="gap-1">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            )}
            <Button onClick={addAccount} variant="outline" size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {onlineAccounts.accounts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No accounts added yet. Click "Add Account" to get started.
            </p>
          ) : (
            onlineAccounts.accounts.map((account, index) => (
              <Card key={account.id} className="bg-muted/30">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Account {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccount(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select
                        value={account.category}
                        onValueChange={(value) => updateAccount(account.id, "category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACCOUNT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Provider Name *</Label>
                      <Input
                        value={account.provider_name}
                        onChange={(e) => updateAccount(account.id, "provider_name", e.target.value)}
                        placeholder="e.g., Gmail, Chase Bank"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Website URL</Label>
                      <Input
                        value={account.website_url || ""}
                        onChange={(e) => updateAccount(account.id, "website_url", e.target.value)}
                        placeholder="e.g., gmail.com"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">Username or Email</Label>
                      <Input
                        value={account.username_or_email || ""}
                        onChange={(e) => updateAccount(account.id, "username_or_email", e.target.value)}
                        placeholder="e.g., john.doe@email.com"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs">2FA Enabled?</Label>
                      <Select
                        value={account.two_factor_enabled || "unknown"}
                        onValueChange={(value) => updateAccount(account.id, "two_factor_enabled", value as "yes" | "no" | "unknown")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {TWO_FACTOR_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Recovery Method</Label>
                      <Input
                        value={account.recovery_method || ""}
                        onChange={(e) => updateAccount(account.id, "recovery_method", e.target.value)}
                        placeholder="e.g., Phone, backup email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <Textarea
                      value={account.notes || ""}
                      onChange={(e) => updateAccount(account.id, "notes", e.target.value)}
                      placeholder="Any additional information..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Password Manager Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Password Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Do you use a password manager?</Label>
              <Select
                value={onlineAccounts.password_manager_used || "unknown"}
                onValueChange={(value) => updateLocalState({ password_manager_used: value as "yes" | "no" | "unknown" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {PASSWORD_MANAGER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {onlineAccounts.password_manager_used === "yes" && (
              <div>
                <Label>Password Manager Name</Label>
                <Input
                  value={onlineAccounts.password_manager_name || ""}
                  onChange={(e) => updateLocalState({ password_manager_name: e.target.value || null })}
                  placeholder="e.g., 1Password, LastPass, Bitwarden"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Access Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Access Instructions for Family</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={onlineAccounts.access_instructions || ""}
            onChange={(e) => updateLocalState({ access_instructions: e.target.value || null })}
            placeholder="Provide general instructions for your family on how to access your accounts. For example: 'My password manager master password is stored in the fireproof safe. Contact my IT friend John Smith for help with technical issues.'"
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            This is a safe place to leave instructions without including actual passwords.
          </p>
        </CardContent>
      </Card>

      {/* Helpful Resources */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Helpful Resources:</h3>
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

      {/* Save Button at bottom */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      )}
    </div>
  );
};
