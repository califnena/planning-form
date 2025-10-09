import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SectionPersonalProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionPersonal = ({ data, onChange }: SectionPersonalProps) => {
  const profile = data.personal_profile || {};
  const { toast } = useToast();

  const updateProfile = (field: string, value: any) => {
    onChange({
      ...data,
      personal_profile: { ...profile, [field]: value }
    });
  };

  const handleSave = () => {
    toast({
      title: "Saved",
      description: "Personal information has been saved.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
          <p className="text-muted-foreground">Complete biographical details for official records</p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Legal Name</Label>
          <p className="text-xs text-muted-foreground">Enter your complete legal name as it appears on official documents</p>
          <Input
            id="full_name"
            value={profile.full_name || ""}
            onChange={(e) => updateProfile("full_name", e.target.value)}
            placeholder="First Middle Last"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maiden_name">Maiden Name (if applicable)</Label>
          <p className="text-xs text-muted-foreground">Birth name if different from current legal name</p>
          <Input
            id="maiden_name"
            value={profile.maiden_name || ""}
            onChange={(e) => updateProfile("maiden_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <p className="text-xs text-muted-foreground">Needed for official records and certificates</p>
          <Input
            id="dob"
            type="date"
            value={profile.dob || ""}
            onChange={(e) => updateProfile("dob", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthplace">Place of Birth</Label>
          <p className="text-xs text-muted-foreground">City, State, and Country where you were born</p>
          <Input
            id="birthplace"
            value={profile.birthplace || ""}
            onChange={(e) => updateProfile("birthplace", e.target.value)}
            placeholder="City, State, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ssn">Social Security Number</Label>
          <p className="text-xs text-muted-foreground">Required for benefits and official notifications</p>
          <Input
            id="ssn"
            value={profile.ssn || ""}
            onChange={(e) => updateProfile("ssn", e.target.value)}
            placeholder="XXX-XX-XXXX"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="citizenship">Citizenship</Label>
          <p className="text-xs text-muted-foreground">Country of citizenship</p>
          <Input
            id="citizenship"
            value={profile.citizenship || ""}
            onChange={(e) => updateProfile("citizenship", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Current Address</Label>
        <p className="text-xs text-muted-foreground">Your complete residential address</p>
        <Textarea
          id="address"
          value={profile.address || ""}
          onChange={(e) => updateProfile("address", e.target.value)}
          placeholder="Street, City, State, ZIP"
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="marital_status">Marital Status</Label>
          <Input
            id="marital_status"
            value={profile.marital_status || ""}
            onChange={(e) => updateProfile("marital_status", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partner_name">Spouse/Partner Name</Label>
          <Input
            id="partner_name"
            value={profile.partner_name || ""}
            onChange={(e) => updateProfile("partner_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ex_spouse_name">Former Spouse Name (if applicable)</Label>
          <Input
            id="ex_spouse_name"
            value={profile.ex_spouse_name || ""}
            onChange={(e) => updateProfile("ex_spouse_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="religion">Religion/Faith</Label>
          <Input
            id="religion"
            value={profile.religion || ""}
            onChange={(e) => updateProfile("religion", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="father_name">Father's Name</Label>
          <Input
            id="father_name"
            value={profile.father_name || ""}
            onChange={(e) => updateProfile("father_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mother_name">Mother's Name</Label>
          <Input
            id="mother_name"
            value={profile.mother_name || ""}
            onChange={(e) => updateProfile("mother_name", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Children's Names</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const current = profile.child_names || ["", "", "", ""];
              updateProfile("child_names", [...current, ""]);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Child
          </Button>
        </div>
        <div className="space-y-3">
          {(profile.child_names || ["", "", "", ""]).map((name: string, index: number) => (
            <div key={index} className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => {
                  const updated = [...(profile.child_names || ["", "", "", ""])];
                  updated[index] = e.target.value;
                  updateProfile("child_names", updated);
                }}
                placeholder={`Child ${index + 1} name`}
              />
              {(profile.child_names?.length || 0) > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updated = (profile.child_names || []).filter((_: string, i: number) => i !== index);
                    updateProfile("child_names", updated);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Military Service (if applicable)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="vet_branch">Branch</Label>
            <Input
              id="vet_branch"
              value={profile.vet_branch || ""}
              onChange={(e) => updateProfile("vet_branch", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_rank">Rank</Label>
            <Input
              id="vet_rank"
              value={profile.vet_rank || ""}
              onChange={(e) => updateProfile("vet_rank", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_serial">Serial Number</Label>
            <Input
              id="vet_serial"
              value={profile.vet_serial || ""}
              onChange={(e) => updateProfile("vet_serial", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_war">War/Conflict</Label>
            <Input
              id="vet_war"
              value={profile.vet_war || ""}
              onChange={(e) => updateProfile("vet_war", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_entry">Date of Entry</Label>
            <Input
              id="vet_entry"
              type="date"
              value={profile.vet_entry || ""}
              onChange={(e) => updateProfile("vet_entry", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_discharge">Date of Discharge</Label>
            <Input
              id="vet_discharge"
              type="date"
              value={profile.vet_discharge || ""}
              onChange={(e) => updateProfile("vet_discharge", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
