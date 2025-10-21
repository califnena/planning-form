import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

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
  cancelled: boolean;
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
        cancelled: false,
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
        cancelled: false,
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

      {subscriptions.map((subscription, index) => (
        <div key={subscription.id} className="border rounded-lg p-4 space-y-4 relative">
          {subscriptions.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSubscription(subscription.id)}
              className="absolute top-2 right-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <h3 className="font-semibold">Subscription {index + 1}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`type-${subscription.id}`}>Type / Category</Label>
              <Input
                id={`type-${subscription.id}`}
                placeholder="e.g., Magazine, Newspaper, Membership"
                value={subscription.type}
                onChange={(e) => updateSubscription(subscription.id, "type", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`provider-${subscription.id}`}>Provider / Publisher</Label>
              <Input
                id={`provider-${subscription.id}`}
                placeholder="e.g., New York Times, National Geographic, AAA"
                value={subscription.provider}
                onChange={(e) => updateSubscription(subscription.id, "provider", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`account-${subscription.id}`}>Account / Member Number</Label>
            <Input
              id={`account-${subscription.id}`}
              placeholder="Account or membership number, if applicable"
              value={subscription.accountInfo}
              onChange={(e) => updateSubscription(subscription.id, "accountInfo", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`notes-${subscription.id}`}>Cancellation / Transfer Notes</Label>
            <Textarea
              id={`notes-${subscription.id}`}
              placeholder="How to cancel, who to contact, transfer instructions, etc."
              value={subscription.notes}
              onChange={(e) => updateSubscription(subscription.id, "notes", e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`cancelled-${subscription.id}`}
              checked={subscription.cancelled}
              onCheckedChange={(checked) =>
                updateSubscription(subscription.id, "cancelled", checked)
              }
            />
            <Label htmlFor={`cancelled-${subscription.id}`} className="cursor-pointer font-medium">
              Cancelled or Transferred
            </Label>
          </div>
        </div>
      ))}

      <Button onClick={addSubscription} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Another Subscription
      </Button>
    </div>
  );
}
