import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import mascotCouple from "@/assets/mascot-couple.png";

interface AssistantBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function AssistantBubble({ isOpen, onClick, unreadCount = 0 }: AssistantBubbleProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg transition-all duration-300 z-50",
        "md:bottom-8 md:right-8",
        "hover:scale-110 active:scale-95",
        isOpen ? "bg-muted" : "bg-primary"
      )}
      aria-label={isOpen ? "Close assistant" : "Open assistant"}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <>
          <Avatar className="h-12 w-12">
            <AvatarImage src={mascotCouple} alt="Mr. Everlasting" className="object-cover" />
            <AvatarFallback>EFA</AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-semibold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
