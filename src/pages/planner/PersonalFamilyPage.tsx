import { usePlanContext, usePreviewMode } from "./PlannerLayout";
import { SectionPersonalInfo } from "@/components/planner/sections/SectionPersonalInfo";
import { SectionAboutYouNew } from "@/components/planner/sections/SectionAboutYouNew";
import { PreviewModeWrapper } from "@/components/planner/PreviewModeWrapper";
import { SectionNavigation } from "@/components/planner/SectionNavigation";
import { AutosaveIndicator } from "@/components/planner/AutosaveIndicator";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Users } from "lucide-react";

/**
 * PersonalFamilyPage
 * 
 * Displays two sections in tabs:
 * 1. Personal Information (personal_information) - core identity, address, contact
 * 2. About You (about_you) - family info, faith, background
 */
export default function PersonalFamilyPage() {
  const { plan, updatePlan, saveState } = usePlanContext();
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/preplandashboard/address");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <AutosaveIndicator 
          saving={saveState.saving} 
          lastSaved={saveState.lastSaved}
          error={saveState.error}
        />
      </div>
      
      <Tabs defaultValue="personal_info" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="personal_info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="about_you" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family & Background
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal_info">
          <PreviewModeWrapper>
            <SectionPersonalInfo data={plan} onChange={updatePlan} />
          </PreviewModeWrapper>
        </TabsContent>
        
        <TabsContent value="about_you">
          <PreviewModeWrapper>
            <SectionAboutYouNew data={plan} onChange={updatePlan} />
          </PreviewModeWrapper>
        </TabsContent>
      </Tabs>
      
      <SectionNavigation
        currentSection="personal"
        onNext={handleNext}
        onGenerateDocument={() => navigate("/preplan-summary")}
        isLastSection={false}
        onSave={() => {}}
      />
    </div>
  );
}
