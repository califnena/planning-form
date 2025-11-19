import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { SimplifiedUI } from "@/components/SimplifiedUI";
import {
  Save,
  Eye,
  FileText,
  FilePlus,
  CheckCircle,
  MessageCircle,
  Headphones,
  ChevronDown,
  ChevronRight,
  ListOrdered,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ActionSidebarProps {
  onPreviewPDF: () => void;
  onDownloadPDF: () => void;
  onDownloadManualForm: () => void;
  onAfterLifePlan?: () => void;
  onSave?: () => void;
}

export const ActionSidebar = ({
  onPreviewPDF,
  onDownloadPDF,
  onDownloadManualForm,
  onAfterLifePlan,
  onSave,
}: ActionSidebarProps) => {
  const { superSeniorMode } = useAccessibility();
  
  // Quick Mode state
  const [quickMode, setQuickMode] = useState(() => {
    const stored = localStorage.getItem("efa-quick-mode");
    return stored === "true";
  });

  // Collapse states for each group
  const [plannerExpanded, setPlannerExpanded] = useState(true);
  const [afterDeathExpanded, setAfterDeathExpanded] = useState(true);
  const [helpExpanded, setHelpExpanded] = useState(true);

  useEffect(() => {
    localStorage.setItem("efa-quick-mode", quickMode.toString());
  }, [quickMode]);

  const tooltips = {
    save: "Store your work so you can return anytime.",
    preview: "See what your full plan looks like.",
    generate: "Create a printable version of your plan.",
    blank: "Open a fresh, clean form if you want to start over.",
    stepByStep: "Follow a guided step-by-step process to complete your planner.",
    afterDeath: "A simple guide for loved ones after a passing.",
    quote: "Ask for pricing or get product information.",
    coach: "Speak with a personal advisor for help.",
  };

  // Group header component
  const GroupHeader = ({
    title,
    expanded,
    onToggle,
  }: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-3 hover:text-primary transition-colors"
    >
      <span>{title}</span>
      {expanded ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </button>
  );

  // Action button component with tooltip
  const ActionButton = ({
    icon: Icon,
    label,
    tooltip,
    onClick,
    variant = "outline",
    className,
    asChild,
    children,
  }: {
    icon: any;
    label: string;
    tooltip: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "secondary";
    className?: string;
    asChild?: boolean;
    children?: React.ReactNode;
  }) => (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="lg"
            className={cn(
              "w-full justify-start text-base py-6 transition-all duration-200 hover:translate-x-0.5",
              className
            )}
            onClick={onClick}
            asChild={asChild}
          >
            {asChild ? (
              children
            ) : (
              <>
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-left">{label}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-popover text-popover-foreground border max-w-xs p-3 text-sm"
          sideOffset={8}
        >
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Quick Mode - only show essential actions (or force simplified mode when super-senior is active)
  if (quickMode || superSeniorMode) {
    return (
      <div className="space-y-4 px-4">
        {/* Quick Mode Toggle - hide in super-senior mode */}
        {!superSeniorMode && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <Label htmlFor="quick-mode" className="text-sm font-medium cursor-pointer">
              Quick Mode
            </Label>
            <Switch
              id="quick-mode"
              checked={quickMode}
              onCheckedChange={setQuickMode}
            />
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Essential Actions
          </h3>

          {onSave && (
            <ActionButton
              icon={Save}
              label="Save My Progress"
              tooltip={tooltips.save}
              onClick={onSave}
              variant="default"
              className="bg-[hsl(180,45%,35%)] hover:bg-[hsl(180,45%,30%)] text-white"
            />
          )}

          <ActionButton
            icon={FileText}
            label="Generate My Document"
            tooltip={tooltips.generate}
            onClick={onDownloadPDF}
            variant="default"
            className="bg-[hsl(180,45%,35%)] hover:bg-[hsl(180,45%,30%)] text-white"
          />

          <ActionButton
            icon={ListOrdered}
            label="Step-by-Step Guide"
            tooltip={tooltips.stepByStep}
            variant="outline"
            asChild
          >
            <Link to="/wizard/preplanning">
              <ListOrdered className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="text-left">Step-by-Step Guide</span>
            </Link>
          </ActionButton>

          {onAfterLifePlan && (
            <ActionButton
              icon={CheckCircle}
              label="After-Death Checklist"
              tooltip={tooltips.afterDeath}
              onClick={onAfterLifePlan}
            />
          )}

          <ActionButton
            icon={Headphones}
            label="VIP Coach Assistant"
            tooltip={tooltips.coach}
            variant="secondary"
            className="bg-[hsl(270,50%,88%)] hover:bg-[hsl(270,50%,83%)] text-[hsl(270,50%,25%)]"
            asChild
          >
            <Link to="/vip-coach">
              <Headphones className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="text-left">VIP Coach Assistant</span>
            </Link>
          </ActionButton>

          {!superSeniorMode && (
            <button
              onClick={() => setQuickMode(false)}
              className="w-full text-sm text-primary hover:underline mt-4 py-2"
            >
              Show All Options →
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Mode - show all actions with collapsible groups
  return (
    <div className="space-y-4 px-4">
      {/* Quick Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <Label htmlFor="quick-mode" className="text-sm font-medium cursor-pointer">
          Quick Mode
        </Label>
        <Switch
          id="quick-mode"
          checked={quickMode}
          onCheckedChange={setQuickMode}
        />
      </div>

      {/* Auto-save notice */}
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
        ✓ All fields auto-save
      </div>

      {/* Your Planner (Pre-Planning Tools) */}
      <div className="space-y-2">
        <GroupHeader
          title="Your Planner"
          expanded={plannerExpanded}
          onToggle={() => setPlannerExpanded(!plannerExpanded)}
        />

        {plannerExpanded && (
          <div className="space-y-2 animate-accordion-down">
            {onSave && (
              <ActionButton
                icon={Save}
                label="Save My Progress"
                tooltip={tooltips.save}
                onClick={onSave}
                variant="default"
                className="bg-[hsl(180,45%,35%)] hover:bg-[hsl(180,45%,30%)] text-white"
              />
            )}

            <ActionButton
              icon={Eye}
              label="Preview My Planner"
              tooltip={tooltips.preview}
              onClick={onPreviewPDF}
            />

            <ActionButton
              icon={FileText}
              label="Generate My Document"
              tooltip={tooltips.generate}
              onClick={onDownloadPDF}
              variant="default"
              className="bg-[hsl(180,45%,35%)] hover:bg-[hsl(180,45%,30%)] text-white"
            />

            <ActionButton
              icon={FilePlus}
              label="Start a Blank Form"
              tooltip={tooltips.blank}
              onClick={onDownloadManualForm}
            />

            <ActionButton
              icon={ListOrdered}
              label="Step-by-Step Guide"
              tooltip={tooltips.stepByStep}
              variant="outline"
              asChild
            >
              <Link to="/wizard/preplanning">
                <ListOrdered className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-left">Step-by-Step Guide</span>
              </Link>
            </ActionButton>
          </div>
        )}
      </div>

      {/* After-Death Guidance */}
      <div className="space-y-2 pt-4 border-t border-border">
        <GroupHeader
          title="After-Death Guidance"
          expanded={afterDeathExpanded}
          onToggle={() => setAfterDeathExpanded(!afterDeathExpanded)}
        />

        {afterDeathExpanded && onAfterLifePlan && (
          <div className="space-y-2 animate-accordion-down">
            <ActionButton
              icon={CheckCircle}
              label="After-Death Checklist"
              tooltip={tooltips.afterDeath}
              onClick={onAfterLifePlan}
            />
          </div>
        )}
      </div>

      {/* Help & Support */}
      <div className="space-y-2 pt-4 border-t border-border">
        <GroupHeader
          title="Help & Support"
          expanded={helpExpanded}
          onToggle={() => setHelpExpanded(!helpExpanded)}
        />

        {helpExpanded && (
          <div className="space-y-2 animate-accordion-down">
            <ActionButton
              icon={MessageCircle}
              label="Request a Quote"
              tooltip={tooltips.quote}
              variant="secondary"
              className="bg-[hsl(45,80%,88%)] hover:bg-[hsl(45,80%,83%)] text-[hsl(45,80%,25%)]"
              asChild
            >
              <a
                href="https://everlastingfuneraladvisors.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-left">Request a Quote</span>
              </a>
            </ActionButton>

            <ActionButton
              icon={Headphones}
              label="VIP Coach Assistant"
              tooltip={tooltips.coach}
              variant="secondary"
              className="bg-[hsl(270,50%,88%)] hover:bg-[hsl(270,50%,83%)] text-[hsl(270,50%,25%)]"
              asChild
            >
              <Link to="/vip-coach">
                <Headphones className="mr-3 h-5 w-5 flex-shrink-0" />
                <span className="text-left">VIP Coach Assistant</span>
              </Link>
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
};
