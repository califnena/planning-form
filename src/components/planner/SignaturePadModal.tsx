import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SignaturePadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  preparerName?: string;
  onSignatureSaved: (signatureUrl: string, revisionData: {
    revision_date: string;
    prepared_by: string;
    signature_png: string;
  }) => void;
}

export function SignaturePadModal({
  open,
  onOpenChange,
  planId,
  preparerName,
  onSignatureSaved,
}: SignaturePadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      setHasDrawn(false);
      setAcknowledged(false);
    }
  }, [open]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      toast.error('Please draw your signature first');
      return;
    }

    if (!acknowledged) {
      toast.error('Please acknowledge the disclaimer');
      return;
    }

    setIsSaving(true);

    try {
      console.log('[signature] uploading…');

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/png');
      });

      // Create file path
      const timestamp = Date.now();
      const filePath = `${planId}/${timestamp}.png`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, blob, {
          contentType: 'image/png',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      const signatureUrl = urlData.publicUrl;
      console.log('[signature] uploaded url:', signatureUrl);

      // Create revision data
      const revisionDate = new Date().toISOString().split('T')[0];
      const revisionData = {
        revision_date: revisionDate,
        prepared_by: preparerName || '',
        signature_png: signatureUrl,
      };

      onSignatureSaved(signatureUrl, revisionData);
      console.log('[signature] plan updated with revision');
      
      toast.success('Signature saved successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('[signature] upload error:', error);
      toast.error('Failed to save signature');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sign Your Plan</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              width={460}
              height={200}
              className="w-full h-[200px] cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Draw your signature above using your mouse or finger
          </p>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="acknowledge"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <Label htmlFor="acknowledge" className="text-sm leading-relaxed cursor-pointer">
              I understand this is a personal planning document and not a legal e-signature.
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={clearCanvas} disabled={isSaving}>
            Clear
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasDrawn || !acknowledged || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Signature'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
