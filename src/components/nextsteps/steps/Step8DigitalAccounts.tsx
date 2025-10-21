import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

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
  completed: boolean;
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
        completed: false,
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
        completed: false,
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

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform / Service</TableHead>
              <TableHead>Username / Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Completed</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <Input
                    placeholder="e.g., Facebook, Gmail"
                    value={account.platform}
                    onChange={(e) => updateAccount(account.id, "platform", e.target.value)}
                    className="min-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Username or email"
                    value={account.username}
                    onChange={(e) => updateAccount(account.id, "username", e.target.value)}
                    className="min-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={account.status}
                    onValueChange={(value) => updateAccount(account.id, "status", value)}
                  >
                    <SelectTrigger className="min-w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="memorialized">Memorialized</SelectItem>
                      <SelectItem value="transferred">Transferred</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={account.completed}
                    onCheckedChange={(checked) => updateAccount(account.id, "completed", !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Notes, confirmation number, etc."
                    value={account.notes}
                    onChange={(e) => updateAccount(account.id, "notes", e.target.value)}
                    className="min-w-[200px]"
                    rows={1}
                  />
                </TableCell>
                <TableCell>
                  {accounts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccount(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
