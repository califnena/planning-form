import { cn } from "@/lib/utils";

interface ProgressDotProps {
  completed: boolean;
}

export const ProgressDot = ({ completed }: ProgressDotProps) => {
  return (
    <div
      className={cn(
        "w-2 h-2 rounded-full transition-colors",
        completed ? "bg-primary" : "bg-muted-foreground/30"
      )}
    />
  );
};
