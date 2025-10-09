import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SectionPersonalProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionPersonal = ({ data, onChange }: SectionPersonalProps) => {
  const profile = data.personal_profile || {};

  const updateProfile = (field: string, value: any) => {
    onChange({
      ...data,
      personal_profile: { ...profile, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
        <p className="text-muted-foreground">Complete biographical details for official records</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Legal Name</Label>
          <Input
            id="full_name"
            value={profile.full_name || ""}
            onChange={(e) => updateProfile("full_name", e.target.value)}
            placeholder="First Middle Last"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maiden_name">Maiden Name (if applicable)</Label>
          <Input
            id="maiden_name"
            value={profile.maiden_name || ""}
            onChange={(e) => updateProfile("maiden_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={profile.dob || ""}
            onChange={(e) => updateProfile("dob", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthplace">Place of Birth</Label>
          <Input
            id="birthplace"
            value={profile.birthplace || ""}
            onChange={(e) => updateProfile("birthplace", e.target.value)}
            placeholder="City, State, Country"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ssn">Social Security Number</Label>
          <Input
            id="ssn"
            value={profile.ssn || ""}
            onChange={(e) => updateProfile("ssn", e.target.value)}
            placeholder="XXX-XX-XXXX"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="citizenship">Citizenship</Label>
          <Input
            id="citizenship"
            value={profile.citizenship || ""}
            onChange={(e) => updateProfile("citizenship", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Current Address</Label>
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

      <div className="space-y-2">
        <Label htmlFor="child_names">Children's Names (one per line)</Label>
        <Textarea
          id="child_names"
          value={(profile.child_names || []).join("\n")}
          onChange={(e) => updateProfile("child_names", e.target.value.split("\n").filter(Boolean))}
          placeholder="Enter each child's name on a new line"
          rows={4}
        />
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
