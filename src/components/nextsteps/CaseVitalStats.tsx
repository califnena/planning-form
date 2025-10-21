import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface CaseVitalStatsProps {
  caseId: string;
  decedent: any;
  onUpdate: () => void;
}

export const CaseVitalStats = ({ caseId, decedent, onUpdate }: CaseVitalStatsProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    legal_name: "",
    dob: "",
    pob_city: "",
    pob_state: "",
    ssn_encrypted: "",
    religion: "",
    citizenship: "",
    marital_status: "",
    military_branch: "",
    place_of_death: "",
    dod: "",
    tod: "",
    cod_text: "",
    physician_name: "",
    residence_address: "",
    notes: "",
  });

  useEffect(() => {
    if (decedent) {
      setFormData({
        legal_name: decedent.legal_name || "",
        dob: decedent.dob || "",
        pob_city: decedent.pob_city || "",
        pob_state: decedent.pob_state || "",
        ssn_encrypted: decedent.ssn_encrypted || "",
        religion: decedent.religion || "",
        citizenship: decedent.citizenship || "",
        marital_status: decedent.marital_status || "",
        military_branch: decedent.military_branch || "",
        place_of_death: decedent.place_of_death || "",
        dod: decedent.dod || "",
        tod: decedent.tod || "",
        cod_text: decedent.cod_text || "",
        physician_name: decedent.physician_name || "",
        residence_address: decedent.residence_address || "",
        notes: decedent.notes || "",
      });
    }
  }, [decedent]);

  const handleSave = async () => {
    try {
      if (decedent?.id) {
        const { error } = await supabase
          .from("decedents")
          .update(formData)
          .eq("id", decedent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("decedents")
          .insert({ ...formData, case_id: caseId });
        
        if (error) throw error;
      }

      toast({
        title: "Saved",
        description: "Vital statistics updated successfully",
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving vital stats:", error);
      toast({
        title: "Error",
        description: "Failed to save vital statistics",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vital Statistics</CardTitle>
        <CardDescription>
          Basic information needed by the funeral home and for legal filings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="legal_name">Full Legal Name *</Label>
            <Input
              id="legal_name"
              value={formData.legal_name}
              onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
              placeholder="Full legal name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pob_city">Place of Birth - City</Label>
            <Input
              id="pob_city"
              value={formData.pob_city}
              onChange={(e) => setFormData({ ...formData, pob_city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pob_state">Place of Birth - State</Label>
            <Input
              id="pob_state"
              value={formData.pob_state}
              onChange={(e) => setFormData({ ...formData, pob_state: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssn_encrypted">Social Security Number</Label>
            <Input
              id="ssn_encrypted"
              type="password"
              value={formData.ssn_encrypted}
              onChange={(e) => setFormData({ ...formData, ssn_encrypted: e.target.value })}
              placeholder="XXX-XX-XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="citizenship">Citizenship</Label>
            <Input
              id="citizenship"
              value={formData.citizenship}
              onChange={(e) => setFormData({ ...formData, citizenship: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="religion">Religion/Faith</Label>
            <Input
              id="religion"
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status</Label>
            <Input
              id="marital_status"
              value={formData.marital_status}
              onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dod">Date of Death</Label>
            <Input
              id="dod"
              type="date"
              value={formData.dod}
              onChange={(e) => setFormData({ ...formData, dod: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tod">Time of Death</Label>
            <Input
              id="tod"
              type="time"
              value={formData.tod}
              onChange={(e) => setFormData({ ...formData, tod: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="place_of_death">Place of Death</Label>
            <Input
              id="place_of_death"
              value={formData.place_of_death}
              onChange={(e) => setFormData({ ...formData, place_of_death: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="physician_name">Attending Physician</Label>
            <Input
              id="physician_name"
              value={formData.physician_name}
              onChange={(e) => setFormData({ ...formData, physician_name: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cod_text">Cause of Death</Label>
            <Input
              id="cod_text"
              value={formData.cod_text}
              onChange={(e) => setFormData({ ...formData, cod_text: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="residence_address">Residence Address</Label>
            <Textarea
              id="residence_address"
              value={formData.residence_address}
              onChange={(e) => setFormData({ ...formData, residence_address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="military_branch">Military Service (if applicable)</Label>
            <Input
              id="military_branch"
              value={formData.military_branch}
              onChange={(e) => setFormData({ ...formData, military_branch: e.target.value })}
              placeholder="Branch, rank, serial number, dates"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Save Vital Statistics
        </Button>
      </CardContent>
    </Card>
  );
};
