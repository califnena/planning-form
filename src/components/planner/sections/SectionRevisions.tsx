import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface SectionRevisionsProps {
  data: any;
  onChange: (data: any) => void;
}

export const SectionRevisions = ({ data, onChange }: SectionRevisionsProps) => {
  const revisions = data.revisions || [];
  const preparedBy = data.prepared_by || "";
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addRevision = () => {
    onChange({
      ...data,
      revisions: [...revisions, { 
        revision_date: new Date().toISOString().split('T')[0], 
        signature_png: "",
        prepared_by: data.prepared_by || ""
      }]
    });
  };

  const updateRevision = (index: number, field: string, value: any) => {
    const updated = [...revisions];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, revisions: updated });
  };

  const removeRevision = (index: number) => {
    onChange({ ...data, revisions: revisions.filter((_: any, i: number) => i !== index) });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    updateRevision(index, "signature_png", dataUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Revisions & Approvals</h2>
          <p className="text-muted-foreground">Document plan updates and signatures</p>
        </div>
        <Button onClick={addRevision} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Revision
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prepared_by">Prepared By (Name)</Label>
        <p className="text-xs text-muted-foreground">Full name of person creating or managing this plan</p>
        <Input
          id="prepared_by"
          value={preparedBy}
          onChange={(e) => onChange({ ...data, prepared_by: e.target.value })}
          placeholder="Name of person filling out this plan"
        />
      </div>

      <div className="space-y-6">
        {revisions.map((revision: any, index: number) => (
          <Card key={index} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold">Revision {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRevision(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Prepared By (Name)</Label>
              <p className="text-xs text-muted-foreground">Full name of person signing this revision</p>
              <Input
                value={revision.prepared_by || ""}
                onChange={(e) => updateRevision(index, "prepared_by", e.target.value)}
                placeholder="Name of person creating this revision"
              />
            </div>

            <div className="space-y-2">
              <Label>Revision Date</Label>
              <Input
                type="date"
                value={revision.revision_date || ""}
                onChange={(e) => updateRevision(index, "revision_date", e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label>Signature</Label>
              <div className="border border-border rounded-lg p-4 space-y-4">
                {revision.signature_png ? (
                  <div className="space-y-2">
                    <img src={revision.signature_png} alt="Signature" className="max-w-full h-auto border rounded" />
                    <Button variant="outline" size="sm" onClick={() => updateRevision(index, "signature_png", "")}>
                      Clear Signature
                    </Button>
                  </div>
                ) : (
                  <>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="border border-dashed rounded cursor-crosshair w-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearSignature}>
                        Clear
                      </Button>
                      <Button size="sm" onClick={() => saveSignature(index)}>
                        Save Signature
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {revisions.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No revisions recorded yet</p>
            <Button onClick={addRevision} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add First Revision
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
