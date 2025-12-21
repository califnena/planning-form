import { useState, useEffect, useRef } from "react";
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
import { analytics } from "@/lib/analytics";
import { 
  useEfaToasts, 
  ReadOnlyBanner, 
  DownloadFailedDialog 
} from "@/components/ui/efa-messages";

type DownloadType = 'pre-planning' | 'after-death' | 'reference-guide';

// Card definitions for analytics tracking
const CARD_DEFINITIONS = {
  'pre-planning': { id: 'pre_planning_checklist', name: 'Plan Your Wishes in Advance' },
  'instructions': { id: 'read_this_first', name: 'Create "Read This First" Instructions' },
  'documents': { id: 'organize_documents', name: 'Organize Accounts & Documents' },
  'after-death': { id: 'after_death_checklist', name: 'After-Death Checklist for Loved Ones' },
  'done-for-you': { id: 'done_for_you', name: "We'll Help You Complete Your Plan" },
  'vip-coach': { id: 'vip_coach', name: 'VIP Coach Assistance' },
  'memorial-song': { id: 'memorial_song', name: 'Create a Custom Memorial Song' },
  'free-checklists': { id: 'free_checklists', name: 'Download Free Planning Checklists' },
} as const;

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

  const efaToasts = useEfaToasts();
  const [downloadFailedOpen, setDownloadFailedOpen] = useState(false);
  const [failedDownloadType, setFailedDownloadType] = useState<DownloadType | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const impressedCards = useRef<Set<string>>(new Set());

  // Track card impressions using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const cardId = entry.target.getAttribute('data-card-id');
          if (entry.isIntersecting && cardId && !impressedCards.current.has(cardId)) {
            impressedCards.current.add(cardId);
            const cardDef = Object.values(CARD_DEFINITIONS).find(c => c.id === cardId);
            if (cardDef) {
              analytics.trackCardImpression(cardDef.id, cardDef.name, 'card_grid');
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isLoading]);

  const getDocType = (type: DownloadType): 'pre_planning_checklist' | 'after_death_checklist' | 'reference_guide' => {
    switch (type) {
      case 'pre-planning': return 'pre_planning_checklist';
      case 'after-death': return 'after_death_checklist';
      case 'reference-guide': return 'reference_guide';
    }
  };

  const handleDownload = async (type: DownloadType) => {
    setGenerating(type);
    const docType = getDocType(type);
    
    // Track download click
    analytics.trackDownloadClick(docType, 'pdf', 'card_grid');
    efaToasts.showDownloadStarted();

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
      
      // Track download success
      analytics.trackDownloadSuccess(docType, 'pdf', undefined, 'card_grid');
    } catch (error) {
      console.error("Error generating PDF:", error);
      
      // Track download failed
      analytics.trackDownloadFailed(docType, 'pdf', 'unknown', 'card_grid');
      
      setFailedDownloadType(type);
      setDownloadFailedOpen(true);
    } finally {
      setGenerating(null);
    }
  };

  const handleCardClick = (
    cardKey: keyof typeof CARD_DEFINITIONS,
    ctaLabel: string,
    destinationType: 'internal' | 'download' | 'checkout',
    action: () => void
  ) => {
    const cardDef = CARD_DEFINITIONS[cardKey];
    analytics.trackCardClick(cardDef.id, cardDef.name, ctaLabel, destinationType, 'card_grid');
    action();
  };

  const handleCheckoutClick = (product: 'vip' | 'do_it_for_you' | 'memorial_song', route: string) => {
    const billingPeriod = product === 'vip' ? 'monthly' : 'one_time';
    analytics.trackCheckoutStart(product, billingPeriod as 'one_time' | 'monthly' | 'annual');
    navigate(route);
  };

  const setCardRef = (cardId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(cardId, el);
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
  const showFreeChecklists = isOwner || (isTrustedContact && (permissions.canViewAfterDeathChecklist || permissions.canViewAfterDeathPlanner));

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

      {/* Read-only banner for trusted contacts */}
      {isTrustedContact && <ReadOnlyBanner />}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* CARD 1 — PRE-PLANNING CHECKLIST (Account Holder Only) */}
        {showPrePlanningChecklist && (
          <Card 
            ref={setCardRef('pre_planning_checklist')}
            data-card-id="pre_planning_checklist"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
          >
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
                onClick={() => handleCardClick('pre-planning', 'Download Pre-Planning Checklist', 'download', () => handleDownload('pre-planning'))}
                disabled={generating === 'pre-planning'}
              >
                <Download className="h-3 w-3" />
                {generating === 'pre-planning' ? 'Downloading...' : 'Download Pre-Planning Checklist'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full gap-1"
                onClick={() => handleCardClick('pre-planning', 'Continue in Planner', 'internal', () => navigate('/preplansteps?section=overview'))}
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
          <Card 
            ref={setCardRef('read_this_first')}
            data-card-id="read_this_first"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-500"
          >
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
                onClick={() => handleCardClick('instructions', isTrustedContact ? 'View Instructions' : 'Write My Instructions', 'internal', () => navigate('/preplansteps?section=instructions'))}
              >
                <FileText className="h-3 w-3" />
                {isTrustedContact ? 'View Instructions' : 'Write My Instructions'}
              </Button>
              {isOwner && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full gap-1"
                  onClick={() => handleCardClick('instructions', 'Learn More', 'internal', () => navigate('/preplansteps?section=guide'))}
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
          <Card 
            ref={setCardRef('organize_documents')}
            data-card-id="organize_documents"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-purple-500"
          >
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
                onClick={() => handleCardClick('documents', 'Organize in Planner', 'internal', () => navigate('/preplansteps?section=financial'))}
              >
                <FolderOpen className="h-3 w-3" />
                Organize in Planner
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full gap-1"
                onClick={() => handleCardClick('documents', 'Download Reference Guide', 'download', () => handleDownload('reference-guide'))}
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
          <Card 
            ref={setCardRef('after_death_checklist')}
            data-card-id="after_death_checklist"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-amber-500"
          >
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
                onClick={() => handleCardClick('after-death', 'Download After-Death Checklist', 'download', () => handleDownload('after-death'))}
                disabled={generating === 'after-death'}
              >
                <Download className="h-3 w-3" />
                {generating === 'after-death' ? 'Downloading...' : 'Download After-Death Checklist'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="w-full gap-1"
                onClick={() => handleCardClick('after-death', 'View After-Death Planner', 'internal', () => navigate('/after-death-planner'))}
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
          <Card 
            ref={setCardRef('done_for_you')}
            data-card-id="done_for_you"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-red-500"
          >
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
                onClick={() => {
                  handleCardClick('done-for-you', 'Get Help Completing My Plan', 'checkout', () => {});
                  handleCheckoutClick('do_it_for_you', '/pricing');
                }}
              >
                <Handshake className="h-3 w-3" />
                Get Help Completing My Plan
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 6 — VIP COACH (Account Holder Only) */}
        {showVipCoach && (
          <Card 
            ref={setCardRef('vip_coach')}
            data-card-id="vip_coach"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-600"
          >
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
                onClick={() => {
                  handleCardClick('vip-coach', 'Upgrade to VIP Coaching', 'checkout', () => {});
                  handleCheckoutClick('vip', '/pricing');
                }}
              >
                <Star className="h-3 w-3" />
                Upgrade to VIP Coaching
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 7 — CUSTOM MEMORIAL SONG (Account Holder Only) */}
        {showMemorialSong && (
          <Card 
            ref={setCardRef('memorial_song')}
            data-card-id="memorial_song"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-green-600"
          >
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
                onClick={() => {
                  handleCardClick('memorial-song', 'Create My Memorial Song', 'checkout', () => {});
                  handleCheckoutClick('memorial_song', '/custom-song');
                }}
              >
                <Music className="h-3 w-3" />
                Create My Memorial Song
              </Button>
            </div>
          </Card>
        )}

        {/* CARD 8 — FREE CHECKLISTS */}
        {showFreeChecklists && (
          <Card 
            ref={setCardRef('free_checklists')}
            data-card-id="free_checklists"
            className="p-4 hover:shadow-md transition-shadow border-l-4 border-l-blue-400"
          >
            <div className="flex items-start justify-between mb-3">
              <Download className="h-6 w-6 text-blue-500" />
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Free Downloads
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">Download Free Planning Checklists</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get printable checklists you can download and keep. These tools help you organize your wishes now and guide loved ones later.
            </p>
            <div className="flex flex-col gap-2">
              {/* Account holders see both checklists */}
              {isOwner && (
                <Button 
                  size="sm" 
                  className="w-full gap-2"
                  onClick={() => handleCardClick('free-checklists', 'Download Pre-Planning Checklist', 'download', () => handleDownload('pre-planning'))}
                  disabled={generating === 'pre-planning'}
                >
                  <Download className="h-3 w-3" />
                  {generating === 'pre-planning' ? 'Downloading...' : 'Download Pre-Planning Checklist'}
                </Button>
              )}
              {/* Both account holders and trusted contacts (with permission) see after-death */}
              <Button 
                size="sm" 
                variant={isOwner ? "outline" : "default"}
                className="w-full gap-2"
                onClick={() => handleCardClick('free-checklists', 'Download After-Death Checklist', 'download', () => handleDownload('after-death'))}
                disabled={generating === 'after-death'}
              >
                <Download className="h-3 w-3" />
                {generating === 'after-death' ? 'Downloading...' : 'Download After-Death Checklist'}
              </Button>
              {/* Reference guide only for account holders */}
              {isOwner && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="w-full gap-1"
                  onClick={() => handleCardClick('free-checklists', 'View Reference Guide', 'download', () => handleDownload('reference-guide'))}
                  disabled={generating === 'reference-guide'}
                >
                  <BookOpen className="h-3 w-3" />
                  {generating === 'reference-guide' ? 'Downloading...' : 'View Reference Guide'}
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Download Failed Dialog */}
      <DownloadFailedDialog
        open={downloadFailedOpen}
        onOpenChange={setDownloadFailedOpen}
        onTryAgain={() => {
          setDownloadFailedOpen(false);
          if (failedDownloadType) {
            handleDownload(failedDownloadType);
          }
        }}
        onDownloadWord={() => {
          setDownloadFailedOpen(false);
          // Could implement DOCX download here
          toast({
            title: "Word download",
            description: "Word format download will be available soon.",
          });
        }}
      />
    </div>
  );
};
