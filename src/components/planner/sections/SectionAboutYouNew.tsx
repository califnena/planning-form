import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePreviewMode } from "@/pages/PlannerApp";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";

interface SectionAboutYouNewProps {
  data?: any;
  onChange?: (data: any) => void;
}

/**
 * SectionAboutYouNew
 * 
 * CANONICAL KEY: about_you (object in plan_payload)
 * 
 * SAVE: data.about_you → plan_payload.about_you
 * READ: data.about_you from plan_payload
 * COMPLETION: hasMeaningfulData(plan_payload.about_you)
 * 
 * Fields:
 * - parents: string[] (array of parent names)
 * - children: string[] (array of child names)
 * - family_notes: string
 * - faith_or_religion: string
 * - background_notes: string
 * - last_updated: timestamp
 */
export const SectionAboutYouNew = ({ data, onChange }: SectionAboutYouNewProps) => {
  const { t } = useTranslation();
  const { isPreviewMode } = usePreviewMode();
  
  // CANONICAL: Read from 'about_you' key
  const aboutYou = data?.about_you || {};

  const updateField = (field: string, value: any) => {
    if (onChange) {
      const updated = {
        ...data,
        about_you: { 
          ...aboutYou, 
          [field]: value,
          last_updated: new Date().toISOString()
        }
      };
      
      if (import.meta.env.DEV) {
        console.log("[SectionAboutYouNew] updateField:", field, "→ about_you");
      }
      
      onChange(updated);
    }
  };

  // Array helpers
  const addParent = () => {
    const current = aboutYou.parents || [];
    updateField("parents", [...current, ""]);
  };

  const removeParent = (index: number) => {
    const current = aboutYou.parents || [];
    updateField("parents", current.filter((_: string, i: number) => i !== index));
  };

  const updateParent = (index: number, value: string) => {
    const current = [...(aboutYou.parents || [])];
    current[index] = value;
    updateField("parents", current);
  };

  const addChild = () => {
    const current = aboutYou.children || [];
    updateField("children", [...current, ""]);
  };

  const removeChild = (index: number) => {
    const current = aboutYou.children || [];
    updateField("children", current.filter((_: string, i: number) => i !== index));
  };

  const updateChild = (index: number, value: string) => {
    const current = [...(aboutYou.children || [])];
    current[index] = value;
    updateField("children", current);
  };

  // Ensure at least one empty entry for parents and children
  const parents = aboutYou.parents?.length > 0 ? aboutYou.parents : [""];
  const children = aboutYou.children?.length > 0 ? aboutYou.children : [""];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          About You
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Tell us about your family background and personal values.
        </p>
        <p className="text-base text-primary mt-2">✓ Auto-saves as you type</p>
      </div>

      <PreviewModeWrapper>
        <div className="space-y-6">
          {/* Parents */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Parents</h2>
                <p className="text-muted-foreground text-sm">Your parents' full names</p>
              </div>
              <Button variant="outline" size="sm" onClick={addParent}>
                <Plus className="h-4 w-4 mr-2" />
                Add Parent
              </Button>
            </div>
            
            <div className="space-y-3">
              {parents.map((parent: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={parent || ""}
                    onChange={(e) => updateParent(index, e.target.value)}
                    placeholder={`Parent ${index + 1} name`}
                    className="text-base h-12"
                  />
                  {parents.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParent(index)}
                      className="h-12 w-12 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Children */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Children</h2>
                <p className="text-muted-foreground text-sm">Your children's full names</p>
              </div>
              <Button variant="outline" size="sm" onClick={addChild}>
                <Plus className="h-4 w-4 mr-2" />
                Add Child
              </Button>
            </div>
            
            <div className="space-y-3">
              {children.map((child: string, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={child || ""}
                    onChange={(e) => updateChild(index, e.target.value)}
                    placeholder={`Child ${index + 1} name`}
                    className="text-base h-12"
                  />
                  {children.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChild(index)}
                      className="h-12 w-12 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Family Notes */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="family_notes" className="text-base font-medium">
              Family Notes
            </Label>
            <p className="text-muted-foreground text-sm">
              Any additional notes about your family (siblings, grandchildren, etc.)
            </p>
            <Textarea
              id="family_notes"
              value={aboutYou.family_notes || ""}
              onChange={(e) => updateField("family_notes", e.target.value)}
              placeholder="e.g., Two grandchildren: Emma and Jack. Brother lives in Florida."
              className="min-h-[100px] text-base"
            />
          </div>

          {/* Faith/Religion */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="faith_or_religion" className="text-base font-medium">
              Faith or Religion
            </Label>
            <p className="text-muted-foreground text-sm">
              Your religious or spiritual affiliation, if any
            </p>
            <Input
              id="faith_or_religion"
              value={aboutYou.faith_or_religion || ""}
              onChange={(e) => updateField("faith_or_religion", e.target.value)}
              placeholder="e.g., Catholic, Jewish, None, Spiritual"
              className="text-base h-12"
            />
          </div>

          {/* Background Notes */}
          <div className="space-y-2 border-t pt-6">
            <Label htmlFor="background_notes" className="text-base font-medium">
              Background Notes
            </Label>
            <p className="text-muted-foreground text-sm">
              Any other personal background you'd like to share
            </p>
            <Textarea
              id="background_notes"
              value={aboutYou.background_notes || ""}
              onChange={(e) => updateField("background_notes", e.target.value)}
              placeholder="e.g., Retired teacher, originally from Chicago, moved to Florida in 2005."
              className="min-h-[100px] text-base"
            />
          </div>
        </div>
      </PreviewModeWrapper>
    </div>
  );
};
