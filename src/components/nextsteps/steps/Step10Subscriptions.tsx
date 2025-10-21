import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StepProps {
  formData: any;
  onSave: (data: any) => void;
  caseId: string;
}

interface Subscription {
  id: string;
  type: string;
  provider: string;
  accountInfo: string;
  completed: boolean;
  notes: string;
}

export function Step10Subscriptions({ formData, onSave }: StepProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    formData?.step10?.subscriptions || [
      {
        id: crypto.randomUUID(),
        type: "",
        provider: "",
        accountInfo: "",
        completed: false,
        notes: "",
      },
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ step10: { subscriptions } });
    }, 1000);
    return () => clearTimeout(timer);
  }, [subscriptions]);

  const addSubscription = () => {
    setSubscriptions([
      ...subscriptions,
      {
        id: crypto.randomUUID(),
        type: "",
        provider: "",
        accountInfo: "",
        completed: false,
        notes: "",
      },
    ]);
  };

  const removeSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((s) => s.id !== id));
  };

  const updateSubscription = (id: string, field: string, value: any) => {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground mb-4">
        Track non-digital subscriptions such as magazines, newspapers, memberships, and recurring services that need to be cancelled or transferred.
      </p>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
        <p className="text-sm">
          <strong>Examples:</strong> Newspapers, magazines, book clubs, AAA membership, gym memberships, 
          professional associations, alumni groups, charitable recurring donations, etc.
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type / Category</TableHead>
              <TableHead>Provider / Publisher</TableHead>
              <TableHead>Account / Member #</TableHead>
              <TableHead className="w-[100px]">Completed</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  <Input
                    placeholder="e.g., Magazine, Membership"
                    value={subscription.type}
                    onChange={(e) => updateSubscription(subscription.id, "type", e.target.value)}
                    className="min-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="e.g., New York Times, AAA"
                    value={subscription.provider}
                    onChange={(e) => updateSubscription(subscription.id, "provider", e.target.value)}
                    className="min-w-[150px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="Account number"
                    value={subscription.accountInfo}
                    onChange={(e) => updateSubscription(subscription.id, "accountInfo", e.target.value)}
                    className="min-w-[120px]"
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={subscription.completed}
                    onCheckedChange={(checked) => updateSubscription(subscription.id, "completed", !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Cancellation notes, contact info, etc."
                    value={subscription.notes}
                    onChange={(e) => updateSubscription(subscription.id, "notes", e.target.value)}
                    className="min-w-[200px]"
                    rows={1}
                  />
                </TableCell>
                <TableCell>
                  {subscriptions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubscription(subscription.id)}
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

      <Button onClick={addSubscription} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Another Subscription
      </Button>
    </div>
  );
}
