import { useTextSize } from '@/contexts/TextSizeContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface TextSizeToggleProps {
  /** Show as compact icon buttons (for mobile header) */
  compact?: boolean;
}

export const TextSizeToggle = ({ compact = false }: TextSizeToggleProps) => {
  const { fontScale, increase, decrease, canIncrease, canDecrease } = useTextSize();

  if (compact) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          onClick={decrease}
          disabled={!canDecrease}
          className="h-8 w-8"
          aria-label="Decrease text size"
        >
          <span className="text-sm font-bold">A-</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={increase}
          disabled={!canIncrease}
          className="h-8 w-8"
          aria-label="Increase text size"
        >
          <span className="text-sm font-bold">A+</span>
        </Button>
      </>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Text size:</span>
      <div className="flex items-center gap-1 border rounded-md p-1 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={decrease}
          disabled={!canDecrease}
          className="h-8 px-3 font-semibold"
          aria-label="Decrease text size"
        >
          <Minus className="h-4 w-4 mr-1" />
          A
        </Button>
        <span className="px-2 text-sm font-medium text-muted-foreground">
          {Math.round(fontScale * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={increase}
          disabled={!canIncrease}
          className="h-8 px-3 font-semibold"
          aria-label="Increase text size"
        >
          A
          <Plus className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
