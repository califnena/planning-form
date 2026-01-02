import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicalCondition {
  id: string;
  condition: string;
  notes?: string;
}

interface Allergy {
  id: string;
  substance: string;
  reaction: string;
}

interface Medication {
  id: string;
  name: string;
  dose: string;
  notes?: string;
  asNeeded: boolean;
}

interface DoctorPharmacy {
  primaryDoctorName: string;
  primaryDoctorPhone: string;
  pharmacyName: string;
  pharmacyPhone: string;
}

interface HealthCareData {
  conditions?: MedicalCondition[];
  allergies?: Allergy[];
  medications?: Medication[];
  doctorPharmacy?: DoctorPharmacy;
  advanceDirectiveStatus?: "yes" | "no" | "unknown";
  advanceDirectiveLocation?: string;
  dnrPolstStatus?: "yes" | "no" | "unknown";
  dnrPolstLocation?: string;
}

interface SectionHealthCareProps {
  data?: HealthCareData;
  onChange?: (data: HealthCareData) => void;
}

export const SectionHealthCare = ({ data = {}, onChange }: SectionHealthCareProps) => {
  const [activeTab, setActiveTab] = useState("conditions");

  const conditions = data.conditions || [];
  const allergies = data.allergies || [];
  const medications = data.medications || [];
  const doctorPharmacy = data.doctorPharmacy || {
    primaryDoctorName: "",
    primaryDoctorPhone: "",
    pharmacyName: "",
    pharmacyPhone: "",
  };

  const updateData = (updates: Partial<HealthCareData>) => {
    onChange?.({ ...data, ...updates });
  };

  // Conditions handlers
  const addCondition = () => {
    updateData({
      conditions: [...conditions, { id: crypto.randomUUID(), condition: "", notes: "" }],
    });
  };

  const updateCondition = (id: string, updates: Partial<MedicalCondition>) => {
    updateData({
      conditions: conditions.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeCondition = (id: string) => {
    updateData({ conditions: conditions.filter((c) => c.id !== id) });
  };

  // Allergies handlers
  const addAllergy = () => {
    updateData({
      allergies: [...allergies, { id: crypto.randomUUID(), substance: "", reaction: "" }],
    });
  };

  const updateAllergy = (id: string, updates: Partial<Allergy>) => {
    updateData({
      allergies: allergies.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    });
  };

  const removeAllergy = (id: string) => {
    updateData({ allergies: allergies.filter((a) => a.id !== id) });
  };

  // Medications handlers
  const addMedication = () => {
    updateData({
      medications: [
        ...medications,
        { id: crypto.randomUUID(), name: "", dose: "", notes: "", asNeeded: false },
      ],
    });
  };

  const updateMedication = (id: string, updates: Partial<Medication>) => {
    updateData({
      medications: medications.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    });
  };

  const removeMedication = (id: string) => {
    updateData({ medications: medications.filter((m) => m.id !== id) });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Health & Care Overview
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          A summary of health information your family and caregivers may need.<br />
          This is for awareness only — not medical records or advice.
        </p>
      </div>

      {/* Safety Notice */}
      <Card className="p-4 bg-accent/30 border-accent/50 mb-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground">
              This section stores <strong>summaries only</strong>. We do not store test results,
              treatment plans, or medical documents.
            </p>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="conditions" className="text-sm">Conditions</TabsTrigger>
          <TabsTrigger value="allergies" className="text-sm">Allergies</TabsTrigger>
          <TabsTrigger value="medications" className="text-sm">Medications</TabsTrigger>
          <TabsTrigger value="contacts" className="text-sm">Doctor/Pharmacy</TabsTrigger>
        </TabsList>

        {/* Medical Conditions */}
        <TabsContent value="conditions" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">Major Medical Conditions</h3>
            <p className="text-muted-foreground">List major conditions only. Keep it simple.</p>
          </div>

          {conditions.map((condition) => (
            <Card key={condition.id} className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`condition-${condition.id}`}>Condition</Label>
                  <Input
                    id={`condition-${condition.id}`}
                    value={condition.condition}
                    onChange={(e) => updateCondition(condition.id, { condition: e.target.value })}
                    placeholder="e.g., Diabetes, High blood pressure"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`condition-notes-${condition.id}`}>Notes (optional)</Label>
                  <Textarea
                    id={`condition-notes-${condition.id}`}
                    value={condition.notes || ""}
                    onChange={(e) => updateCondition(condition.id, { notes: e.target.value })}
                    placeholder="Any helpful notes for caregivers"
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCondition(condition.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}

          <Button variant="outline" onClick={addCondition} className="w-full py-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </TabsContent>

        {/* Allergies */}
        <TabsContent value="allergies" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">Allergies</h3>
            <p className="text-muted-foreground">What are you allergic to and what happens?</p>
          </div>

          {allergies.map((allergy) => (
            <Card key={allergy.id} className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`substance-${allergy.id}`}>Substance</Label>
                  <Input
                    id={`substance-${allergy.id}`}
                    value={allergy.substance}
                    onChange={(e) => updateAllergy(allergy.id, { substance: e.target.value })}
                    placeholder="e.g., Penicillin, Peanuts"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`reaction-${allergy.id}`}>Reaction</Label>
                  <Input
                    id={`reaction-${allergy.id}`}
                    value={allergy.reaction}
                    onChange={(e) => updateAllergy(allergy.id, { reaction: e.target.value })}
                    placeholder="e.g., Rash, Difficulty breathing"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAllergy(allergy.id)}
                className="text-destructive hover:text-destructive mt-3"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </Card>
          ))}

          <Button variant="outline" onClick={addAllergy} className="w-full py-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Allergy
          </Button>
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">Current Medications</h3>
            <p className="text-muted-foreground">List what you take regularly.</p>
          </div>

          {medications.map((med) => (
            <Card key={med.id} className="p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`med-name-${med.id}`}>Medication Name</Label>
                  <Input
                    id={`med-name-${med.id}`}
                    value={med.name}
                    onChange={(e) => updateMedication(med.id, { name: e.target.value })}
                    placeholder="e.g., Metformin"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor={`med-dose-${med.id}`}>Dose</Label>
                  <Input
                    id={`med-dose-${med.id}`}
                    value={med.dose}
                    onChange={(e) => updateMedication(med.id, { dose: e.target.value })}
                    placeholder="e.g., 500mg twice daily"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor={`med-notes-${med.id}`}>Notes (optional)</Label>
                <Input
                  id={`med-notes-${med.id}`}
                  value={med.notes || ""}
                  onChange={(e) => updateMedication(med.id, { notes: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="mt-1"
                />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`as-needed-${med.id}`}
                  checked={med.asNeeded}
                  onChange={(e) => updateMedication(med.id, { asNeeded: e.target.checked })}
                  className="h-5 w-5 rounded border-2 border-primary"
                />
                <Label htmlFor={`as-needed-${med.id}`} className="cursor-pointer">
                  As needed (not daily)
                </Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMedication(med.id)}
                className="text-destructive hover:text-destructive mt-3"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </Card>
          ))}

          <Button variant="outline" onClick={addMedication} className="w-full py-6">
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </TabsContent>

        {/* Doctor / Pharmacy */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-foreground mb-2">Doctor & Pharmacy</h3>
            <p className="text-muted-foreground">Who should be contacted about your health?</p>
          </div>

          <Card className="p-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="doctor-name">Primary Doctor Name</Label>
                <Input
                  id="doctor-name"
                  value={doctorPharmacy.primaryDoctorName}
                  onChange={(e) =>
                    updateData({
                      doctorPharmacy: { ...doctorPharmacy, primaryDoctorName: e.target.value },
                    })
                  }
                  placeholder="Dr. Smith"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="doctor-phone">Office Phone</Label>
                <Input
                  id="doctor-phone"
                  value={doctorPharmacy.primaryDoctorPhone}
                  onChange={(e) =>
                    updateData({
                      doctorPharmacy: { ...doctorPharmacy, primaryDoctorPhone: e.target.value },
                    })
                  }
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
                <Input
                  id="pharmacy-name"
                  value={doctorPharmacy.pharmacyName}
                  onChange={(e) =>
                    updateData({
                      doctorPharmacy: { ...doctorPharmacy, pharmacyName: e.target.value },
                    })
                  }
                  placeholder="CVS, Walgreens, etc."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pharmacy-phone">Pharmacy Phone</Label>
                <Input
                  id="pharmacy-phone"
                  value={doctorPharmacy.pharmacyPhone || ""}
                  onChange={(e) =>
                    updateData({
                      doctorPharmacy: { ...doctorPharmacy, pharmacyPhone: e.target.value },
                    })
                  }
                  placeholder="(555) 987-6543"
                  className="mt-1"
                />
              </div>
            </div>
          </Card>

          {/* Advance Directive Status */}
          <Card className="p-5 space-y-4">
            <h4 className="font-medium text-foreground">Advance Directive</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="ad-yes"
                  name="advance-directive"
                  checked={data.advanceDirectiveStatus === "yes"}
                  onChange={() => updateData({ advanceDirectiveStatus: "yes" })}
                  className="h-5 w-5"
                />
                <Label htmlFor="ad-yes" className="cursor-pointer">I have one</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="ad-no"
                  name="advance-directive"
                  checked={data.advanceDirectiveStatus === "no"}
                  onChange={() => updateData({ advanceDirectiveStatus: "no" })}
                  className="h-5 w-5"
                />
                <Label htmlFor="ad-no" className="cursor-pointer">I don't have one</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="ad-unknown"
                  name="advance-directive"
                  checked={data.advanceDirectiveStatus === "unknown"}
                  onChange={() => updateData({ advanceDirectiveStatus: "unknown" })}
                  className="h-5 w-5"
                />
                <Label htmlFor="ad-unknown" className="cursor-pointer">I'm not sure</Label>
              </div>
            </div>
            {data.advanceDirectiveStatus === "yes" && (
              <div className="mt-3">
                <Label htmlFor="ad-location">Where is it kept?</Label>
                <Input
                  id="ad-location"
                  value={data.advanceDirectiveLocation || ""}
                  onChange={(e) => updateData({ advanceDirectiveLocation: e.target.value })}
                  placeholder="e.g., In the safe, with my attorney"
                  className="mt-1"
                />
              </div>
            )}
          </Card>

          {/* DNR/POLST Status */}
          <Card className="p-5 space-y-4">
            <h4 className="font-medium text-foreground">DNR / POLST</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="dnr-yes"
                  name="dnr-polst"
                  checked={data.dnrPolstStatus === "yes"}
                  onChange={() => updateData({ dnrPolstStatus: "yes" })}
                  className="h-5 w-5"
                />
                <Label htmlFor="dnr-yes" className="cursor-pointer">I have one</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="dnr-no"
                  name="dnr-polst"
                  checked={data.dnrPolstStatus === "no"}
                  onChange={() => updateData({ dnrPolstStatus: "no" })}
                  className="h-5 w-5"
                />
                <Label htmlFor="dnr-no" className="cursor-pointer">I don't have one</Label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="dnr-unknown"
                  name="dnr-polst"
                  checked={data.dnrPolstStatus === "unknown"}
                  onChange={() => updateData({ dnrPolstStatus: "unknown" })}
                  className="h-5 w-5"
                />
                <Label htmlFor="dnr-unknown" className="cursor-pointer">I'm not sure</Label>
              </div>
            </div>
            {data.dnrPolstStatus === "yes" && (
              <div className="mt-3">
                <Label htmlFor="dnr-location">Where is it kept?</Label>
                <Input
                  id="dnr-location"
                  value={data.dnrPolstLocation || ""}
                  onChange={(e) => updateData({ dnrPolstLocation: e.target.value })}
                  placeholder="e.g., On the refrigerator, with my doctor"
                  className="mt-1"
                />
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
