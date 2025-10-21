import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

interface DigitalAccount {
  id: string;
  platform: string;
  username: string;
  status: "open" | "closed" | "memorialized" | "transferred";
  notes: string;
}

export function Step8DigitalAccounts({ formData, onSave }: StepProps) {
  const [accounts, setAccounts] = useState<DigitalAccount[]>(
    formData?.step8?.accounts || [
      {
        id: crypto.randomUUID(),
        platform: "",
        username: "",
        status: "open" as const,
        notes: "",
      },
    ]
  );
  const [allClosed, setAllClosed] = useState(formData?.step8?.allClosed || false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step8: { accounts, allClosed } });
    }, 1000);
    return () => clearTimeout(timer);
  }, [accounts, allClosed]);

  const addAccount = () => {
    setAccounts([
      ...accounts,
      {
        id: crypto.randomUUID(),
        platform: "",
        username: "",
        status: "open" as const,
        notes: "",
      },
    ]);
  };

  const removeAccount = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
  };

  const updateAccount = (id: string, field: string, value: any) => {
    setAccounts(
      accounts.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Track digital accounts including email, social media, and streaming services. Document the status of each account.
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <p className="text-sm">
          <strong>Examples:</strong> Gmail, Facebook, Instagram, Twitter/X, LinkedIn, Netflix, Spotify, 
          Amazon, iCloud, Dropbox, PayPal, banking apps, gaming accounts, etc.
        </p>
      </div>

      {accounts.map((account, index) => (
        <div key={account.id} className="border rounded-lg p-4 space-y-4 relative">
          {accounts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAccount(account.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <h3 className="font-semibold">Account {index + 1}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`platform-${account.id}`}>Platform / Service</Label>
              <Input
                id={`platform-${account.id}`}
                placeholder="e.g., Facebook, Gmail, Netflix"
                value={account.platform}
                onChange={(e) => updateAccount(account.id, "platform", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`username-${account.id}`}>Username / Email</Label>
              <Input
                id={`username-${account.id}`}
                placeholder="Account username or email"
                value={account.username}
                onChange={(e) => updateAccount(account.id, "username", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`status-${account.id}`}>Status</Label>
            <Select
              value={account.status}
              onValueChange={(value) => updateAccount(account.id, "status", value)}
            >
              <SelectTrigger id={`status-${account.id}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="memorialized">Memorialized</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`notes-${account.id}`}>Notes</Label>
            <Input
              id={`notes-${account.id}`}
              placeholder="Date closed, confirmation number, or other notes"
              value={account.notes}
              onChange={(e) => updateAccount(account.id, "notes", e.target.value)}
            />
          </div>
        </div>
      ))}

      <Button onClick={addAccount} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Another Account
      </Button>

      <div className="flex items-center space-x-2 pt-4 border-t">
        <Checkbox
          id="allClosed"
          checked={allClosed}
          onCheckedChange={(checked) => setAllClosed(!!checked)}
        />
        <Label htmlFor="allClosed" className="cursor-pointer font-medium">
          All digital accounts have been handled
        </Label>
      </div>
    </div>
  );
}
