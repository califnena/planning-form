import { useTextSize } from '@/contexts/TextSizeContext';
import { Button } from '@/components/ui/button';

export const TextSizeToggle = () => {
  const { textSize, setTextSize } = useTextSize();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Text size:</span>
      <div className="flex gap-1 border rounded-md p-1 bg-card">
        <Button
          variant={textSize === 'small' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTextSize('small')}
          className="h-8 px-3 font-semibold"
          aria-label="Small text size"
        >
          A-
        </Button>
        <Button
          variant={textSize === 'medium' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTextSize('medium')}
          className="h-8 px-3 font-semibold"
          aria-label="Medium text size"
        >
          A
        </Button>
        <Button
          variant={textSize === 'large' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTextSize('large')}
          className="h-8 px-3 font-semibold"
          aria-label="Large text size"
        >
          A+
        </Button>
      </div>
    </div>
  );
};
