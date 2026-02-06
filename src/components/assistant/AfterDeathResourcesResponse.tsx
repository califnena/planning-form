import { Button } from "@/components/ui/button";
import { FileText, ClipboardCheck, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface AfterDeathResourcesResponseProps {
  onClose?: () => void;
}

export function AfterDeathResourcesResponse({ onClose }: AfterDeathResourcesResponseProps) {
  return (
    <div className="bg-muted p-4 rounded-lg space-y-4 mr-8">
      <p className="text-sm font-medium">Here are two resources to help:</p>
      
      <div className="space-y-3">
        {/* After Death Guide */}
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">After Death Guide</p>
            <p className="text-xs text-muted-foreground">Overview and guidance for what to expect.</p>
            <a 
              href="/guides/EFA-After-Death-Planner-and-Checklist.pdf" 
              download
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              Download After Death Guide
            </a>
          </div>
        </div>
        
        {/* After Death Planner */}
        <div className="flex items-start gap-3">
          <ClipboardCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">After Death Planner</p>
            <p className="text-xs text-muted-foreground">Step-by-step tasks and checklists.</p>
            <a 
              href="/guides/After-Life-Action-Plan-BLANK.pdf" 
              download
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              Download After Death Planner
            </a>
          </div>
        </div>
      </div>
      
      <Link 
        to="/after-death"
        onClick={onClose}
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <ExternalLink className="h-4 w-4" />
        Open After-Death Planner & Checklist page
      </Link>
    </div>
  );
}
