import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionCompleteButtonProps {
  isCompleted: boolean;
  onMarkComplete: () => void;
  onEdit?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SectionCompleteButton = ({
  isCompleted,
  onMarkComplete,
  onEdit,
  disabled = false,
  className
}: SectionCompleteButtonProps) => {
  if (isCompleted) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Completed</span>
        </div>
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Section
          </Button>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={onMarkComplete}
      disabled={disabled}
      className={cn("gap-2", className)}
    >
      <Check className="h-4 w-4" />
      Mark Section Complete
    </Button>
  );
};
