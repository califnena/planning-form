import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface SectionPersonalProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionPersonal = ({ data, onChange }: SectionPersonalProps) => {
  const profile = data.personal_profile || {};
  const { toast } = useToast();
  const { t } = useTranslation();

  const updateProfile = (field: string, value: any) => {
    onChange({
      ...data,
      personal_profile: { ...profile, [field]: value }
    });
  };

  const handleSave = () => {
    toast({
      title: t("common.saved"),
      description: t("personal.saved"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{t("personal.title")}</h2>
          <p className="text-muted-foreground">{t("personal.description")}</p>
        </div>
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          {t("common.save")}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="full_name">{t("personal.fullName")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.fullNameHelp")}</p>
          <Input
            id="full_name"
            value={profile.full_name || ""}
            onChange={(e) => updateProfile("full_name", e.target.value)}
            placeholder={t("personal.fullNamePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nicknames">{t("personal.nicknames")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.nicknamesHelp")}</p>
          <Input
            id="nicknames"
            value={profile.nicknames || ""}
            onChange={(e) => updateProfile("nicknames", e.target.value)}
            placeholder={t("personal.nicknamesPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maiden_name">{t("personal.maidenName")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.maidenNameHelp")}</p>
          <Input
            id="maiden_name"
            value={profile.maiden_name || ""}
            onChange={(e) => updateProfile("maiden_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">{t("personal.dob")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.dobHelp")}</p>
          <Input
            id="dob"
            type="date"
            value={profile.dob || ""}
            onChange={(e) => updateProfile("dob", e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthplace">{t("personal.birthplace")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.birthplaceHelp")}</p>
          <Input
            id="birthplace"
            value={profile.birthplace || ""}
            onChange={(e) => updateProfile("birthplace", e.target.value)}
            placeholder={t("personal.birthplacePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ssn">{t("personal.ssn")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.ssnHelp")}</p>
          <Input
            id="ssn"
            value={profile.ssn || ""}
            onChange={(e) => updateProfile("ssn", e.target.value)}
            placeholder={t("personal.ssnPlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="citizenship">{t("personal.citizenship")}</Label>
          <p className="text-xs text-muted-foreground">{t("personal.citizenshipHelp")}</p>
          <Input
            id="citizenship"
            value={profile.citizenship || ""}
            onChange={(e) => updateProfile("citizenship", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">{t("personal.address")}</Label>
        <p className="text-xs text-muted-foreground">{t("personal.addressHelp")}</p>
        <Textarea
          id="address"
          value={profile.address || ""}
          onChange={(e) => updateProfile("address", e.target.value)}
          placeholder={t("personal.addressPlaceholder")}
          rows={3}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="marital_status">{t("personal.maritalStatus")}</Label>
          <Input
            id="marital_status"
            value={profile.marital_status || ""}
            onChange={(e) => updateProfile("marital_status", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partner_name">{t("personal.partnerName")}</Label>
          <Input
            id="partner_name"
            value={profile.partner_name || ""}
            onChange={(e) => updateProfile("partner_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ex_spouse_name">{t("personal.exSpouseName")}</Label>
          <Input
            id="ex_spouse_name"
            value={profile.ex_spouse_name || ""}
            onChange={(e) => updateProfile("ex_spouse_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="religion">{t("personal.religion")}</Label>
          <Input
            id="religion"
            value={profile.religion || ""}
            onChange={(e) => updateProfile("religion", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="father_name">{t("personal.fatherName")}</Label>
          <Input
            id="father_name"
            value={profile.father_name || ""}
            onChange={(e) => updateProfile("father_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mother_name">{t("personal.motherName")}</Label>
          <Input
            id="mother_name"
            value={profile.mother_name || ""}
            onChange={(e) => updateProfile("mother_name", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("personal.childrenNames")}</Label>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const current = profile.child_names || ["", "", "", ""];
              updateProfile("child_names", [...current, ""]);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("personal.addChild")}
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
                placeholder={t("personal.childPlaceholder", { index: index + 1 })}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = profile.child_names || ["", "", "", ""];
                  updateProfile("child_names", [...current, ""]);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
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
        <h3 className="text-lg font-semibold mb-4">{t("personal.militaryService")}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="vet_branch">{t("personal.vetBranch")}</Label>
            <Input
              id="vet_branch"
              value={profile.vet_branch || ""}
              onChange={(e) => updateProfile("vet_branch", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_rank">{t("personal.vetRank")}</Label>
            <Input
              id="vet_rank"
              value={profile.vet_rank || ""}
              onChange={(e) => updateProfile("vet_rank", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_serial">{t("personal.vetSerial")}</Label>
            <Input
              id="vet_serial"
              value={profile.vet_serial || ""}
              onChange={(e) => updateProfile("vet_serial", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_war">{t("personal.vetWar")}</Label>
            <Input
              id="vet_war"
              value={profile.vet_war || ""}
              onChange={(e) => updateProfile("vet_war", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_entry">{t("personal.vetEntry")}</Label>
            <Input
              id="vet_entry"
              type="date"
              value={profile.vet_entry || ""}
              onChange={(e) => updateProfile("vet_entry", e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vet_discharge">{t("personal.vetDischarge")}</Label>
            <Input
              id="vet_discharge"
              type="date"
              value={profile.vet_discharge || ""}
              onChange={(e) => updateProfile("vet_discharge", e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
