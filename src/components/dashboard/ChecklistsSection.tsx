import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, 
  ChevronRight, 
  FileText, 
  FolderOpen, 
  ClipboardList,
  Handshake,
  Star,
  Music,
  Settings,
  BookOpen,
  Info
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generatePrePlanningChecklistPDF } from "@/lib/preplanningChecklistPdfGenerator";
import { generateAfterDeathChecklistPDF } from "@/lib/afterDeathChecklistPdfGenerator";
import { generateReferenceGuidePDF } from "@/lib/referenceGuidePdfGenerator";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

type DownloadType = 'pre-planning' | 'after-death' | 'reference-guide';

export const ChecklistsSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [generating, setGenerating] = useState<DownloadType | null>(null);
  const { 
    isOwner, 
    isTrustedContact, 
    isLoggedIn, 
    permissions, 
    isLoading 
  } = useUserRole();

  const handleDownload = async (type: DownloadType) => {
    setGenerating(type);
    try {
      switch (type) {
        case 'pre-planning':
          await generatePrePlanningChecklistPDF();
          break;
        case 'after-death':
          await generateAfterDeathChecklistPDF();
          break;
        case 'reference-guide':
          await generateReferenceGuidePDF();
          break;
      }
      toast({
        title: "PDF Downloaded",
        description: "Your document has been downloaded successfully."
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-6 mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show trusted contact notice
  const showTrustedContactNotice = isTrustedContact;
  
  // Visibility logic
  const showPrePlanningChecklist = isOwner;
  const showInstructions = isOwner || (isTrustedContact && permissions.canViewInstructions);
  const showOrganizeDocuments = isOwner;
  const showAfterDeathChecklist = isOwner || (isTrustedContact && (permissions.canViewAfterDeathChecklist || permissions.canViewAfterDeathPlanner));
  const showDoneForYou = isOwner;
  const showVipCoach = isOwner;
  const showMemorialSong = isOwner;
  const showAccessibility = isLoggedIn;

  // If trusted contact has no permissions enabled
  const trustedContactHasNoAccess = isTrustedContact && !showInstructions && !showAfterDeathChecklist;

  return (
    <div className="space-y-6">
      {/* Trusted Contact Notice */}
      {showTrustedContactNotice && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            You've been granted access to specific after-death planning tools. Other information remains private.
          </AlertDescription>
        </Alert>
      )}

      {trustedContactHasNoAccess && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            The account holder hasn't shared any planning tools with you yet. Contact them to request access.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* CARD 1 — PRE-PLANNING CHECKLIST (Account Holder Only) */}
        {showPrePlanningChecklist && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between mb-3">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Free Download
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">Plan Your Wishes in Advance</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Complete a guided Pre-Planning Checklist to record your funeral preferences, personal wishes, and important details—at your own pace.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => handleDownload('pre-planning')}
                disabled={generating === 'pre-planning'}
              >
                <Download className="h-3 w-3" />
                {generating === 'pre-planning' ? 'Downloading...' : 'Download Pre-Planning Checklist'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full gap-1"
                onClick={() => navigate('/app?section=overview')}
              >
                <FolderOpen className="h-3 w-3" />
                Continue in Planner
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 2 — READ THIS FIRST / INSTRUCTIONS */}
        {showInstructions && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-6 w-6 text-green-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                {isTrustedContact ? 'Read Only' : 'Checklist'}
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">Create "Read This First" Instructions</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {isTrustedContact 
                ? "View the step-by-step instructions left for you about what to do first and who to contact."
                : "Leave clear, step-by-step instructions so your loved ones know exactly what to do first, who to contact, and what matters most."
              }
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/app?section=instructions')}
              >
                <FileText className="h-3 w-3" />
                {isTrustedContact ? 'View Instructions' : 'Write My Instructions'}
              </Button>
              {isOwner && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full gap-1"
                  onClick={() => navigate('/app?section=guide')}
                >
                  <BookOpen className="h-3 w-3" />
                  Learn More
                  <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* CARD 3 — DOCUMENTS & ACCOUNTS (Account Holder Only) */}
        {showOrganizeDocuments && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <div className="flex items-start justify-between mb-3">
              <FolderOpen className="h-6 w-6 text-purple-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Free Download
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">Organize Accounts & Documents</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Securely organize financial accounts, insurance, legal documents, and digital information so nothing important is lost or overlooked.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/app?section=financial')}
              >
                <FolderOpen className="h-3 w-3" />
                Organize in Planner
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full gap-1"
                onClick={() => handleDownload('reference-guide')}
                disabled={generating === 'reference-guide'}
              >
                <Download className="h-3 w-3" />
                {generating === 'reference-guide' ? 'Downloading...' : 'Download Reference Guide'}
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 4 — AFTER-DEATH CHECKLIST */}
        {showAfterDeathChecklist && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
            <div className="flex items-start justify-between mb-3">
              <ClipboardList className="h-6 w-6 text-amber-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Free Download
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">After-Death Checklist for Loved Ones</h4>
            <p className="text-sm text-muted-foreground mb-4">
              A time-based After-Death Checklist that guides your family step by step—from the first 24 hours to the months that follow.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => handleDownload('after-death')}
                disabled={generating === 'after-death'}
              >
                <Download className="h-3 w-3" />
                {generating === 'after-death' ? 'Downloading...' : 'Download After-Death Checklist'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full gap-1"
                onClick={() => navigate('/after-death-planner')}
              >
                <ClipboardList className="h-3 w-3" />
                View After-Death Planner
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Can be shared with trusted contacts.
            </p>
          </Card>
        )}

        {/* CARD 5 — DONE-FOR-YOU SERVICE (Account Holder Only) */}
        {showDoneForYou && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <div className="flex items-start justify-between mb-3">
              <Handshake className="h-6 w-6 text-red-600" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                Paid Service
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">We'll Help You Complete Your Plan</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Prefer guidance? Our specialists can help you complete your planner and checklists through a gentle, guided conversation.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/pricing')}
              >
                <Handshake className="h-3 w-3" />
                Get Help Completing My Plan
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 6 — VIP COACH (Account Holder Only) */}
        {showVipCoach && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
            <div className="flex items-start justify-between mb-3">
              <Star className="h-6 w-6 text-blue-700" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                Paid Service
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">VIP Coach Assistance</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get ongoing support from a planning coach to review your checklist, answer questions, and keep everything up to date.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/pricing')}
              >
                <Star className="h-3 w-3" />
                Upgrade to VIP Coaching
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 7 — CUSTOM MEMORIAL SONG (Account Holder Only) */}
        {showMemorialSong && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-600">
            <div className="flex items-start justify-between mb-3">
              <Music className="h-6 w-6 text-green-700" />
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                Paid Service
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">Create a Custom Memorial Song</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create a personalized tribute song that reflects your life, values, and legacy—perfect for services or remembrance.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/custom-song')}
              >
                <Music className="h-3 w-3" />
                Create My Memorial Song
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 8 — ACCESSIBILITY (All Logged-in Users) */}
        {showAccessibility && (
          <Card className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-gray-500">
            <div className="flex items-start justify-between mb-3">
              <Settings className="h-6 w-6 text-gray-600" />
              <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                Optional Support
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">Adjust Settings for Easier Reading</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Increase text size and adjust display options to make planning comfortable and accessible.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                className="w-full gap-2"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-3 w-3" />
                Adjust Settings
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
