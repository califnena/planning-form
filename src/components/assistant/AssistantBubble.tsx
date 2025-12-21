import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssistantBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function AssistantBubble({ isOpen, onClick, unreadCount = 0 }: AssistantBubbleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 flex flex-col items-end gap-2">
            {/* Label visible when closed */}
            {!isOpen && (
              <div className="bg-background/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 shadow-lg animate-in fade-in slide-in-from-right-2 duration-300">
                <span className="text-sm font-medium text-foreground">Claire is here</span>
                <span className="block text-xs text-muted-foreground">Planning help when you need it</span>
              </div>
            )}
            <Button
              onClick={onClick}
              size="icon"
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                "hover:scale-110 active:scale-95",
                isOpen ? "bg-muted" : "bg-primary"
              )}
              aria-label={isOpen ? "Close assistant" : "Open assistant"}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <>
                  <Heart className="h-6 w-6 text-primary-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Start a conversation with your planning assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
