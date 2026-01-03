import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Check, Eraser, PenLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignatureData {
  printed_name: string;
  signature_png: string;
  signed_at: string;
}

interface SectionSignatureProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * SectionSignature
 * 
 * CANONICAL KEY: signature (object in plan_payload)
 */
export const SectionSignature = ({ data, onChange }: SectionSignatureProps) => {
  const signature: SignatureData = data.signature || {};
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const { toast } = useToast();

  const updateSignature = (field: keyof SignatureData, value: string) => {
    onChange({
      ...data,
      signature: { ...signature, [field]: value },
    });
  };

  // Initialize canvas with existing signature if available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 150;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing signature
    if (signature.signature_png) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasDrawn(true);
      };
      img.src = signature.signature_png;
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    
    updateSignature("signature_png", "");
    updateSignature("signed_at", "");
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const signedAt = new Date().toISOString();

    onChange({
      ...data,
      signature: {
        ...signature,
        signature_png: dataUrl,
        signed_at: signedAt,
      },
    });

    toast({
      title: "Signature Saved",
      description: `Signed on ${new Date(signedAt).toLocaleDateString()}`,
    });
  };

  const formattedDate = signature.signed_at 
    ? new Date(signature.signed_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">✍️ Sign Your Plan</h2>
        <p className="text-muted-foreground">
          Add your signature to finalize this document. This is not a legal signature but helps verify your wishes.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="printed_name">Printed Name</Label>
          <Input
            id="printed_name"
            value={signature.printed_name || ""}
            onChange={(e) => updateSignature("printed_name", e.target.value)}
            placeholder="Your full legal name"
          />
        </div>

        <div className="space-y-2">
          <Label>Signature</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Draw your signature using your mouse or finger
          </p>
          <div className="border rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full cursor-crosshair touch-none"
              style={{ height: 150 }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={clearCanvas}>
              <Eraser className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button size="sm" onClick={saveSignature} disabled={!hasDrawn}>
              <Check className="h-4 w-4 mr-2" />
              Save Signature
            </Button>
          </div>
        </div>

        {formattedDate && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <PenLine className="h-4 w-4 inline mr-1" />
              Signed on: <span className="font-medium text-foreground">{formattedDate}</span>
            </p>
          </div>
        )}

        {signature.signature_png && (
          <div className="pt-4 border-t">
            <Label>Signature Preview</Label>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <img
                src={signature.signature_png}
                alt="Your signature"
                className="max-h-24 mx-auto"
              />
              <p className="text-center mt-2 text-sm font-medium">{signature.printed_name}</p>
              {formattedDate && (
                <p className="text-center text-xs text-muted-foreground">{formattedDate}</p>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
