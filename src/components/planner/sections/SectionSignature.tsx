import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PenLine, Check, Eraser, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SignaturePad, type SignaturePadRef } from "@/components/signature/SignaturePad";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Signature data model in plan_payload.signature
 */
interface SignatureCurrent {
  prepared_by: string;
  signed_at: string;
  signature_png: string;
}

interface SignatureRevision {
  revision_date: string;
  prepared_by: string;
  signature_png: string;
  notes?: string;
}

interface SignatureData {
  current?: SignatureCurrent;
  revisions?: SignatureRevision[];
}

interface SectionSignatureProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * SectionSignature
 * 
 * CANONICAL KEY: plan_payload.signature (object with current + revisions)
 * Also updates: last_signed_at column on plans table
 * 
 * Features:
 * - Canvas-based signature drawing (touch + mouse)
 * - Typed name (required)
 * - Date (auto-set on save)
 * - Optional notes
 * - Revision history (append-only)
 */
export const SectionSignature = ({ data, onChange }: SectionSignatureProps) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const { isPreviewMode } = usePreviewModeContext();
  
  // Get planId from the plan data
  const planId = data.id || data.plan_id;
  
  // Get signature data from plan_payload.signature (new model)
  // Also handle migration from old top-level revisions[]
  const planPayload = data.plan_payload || data;
  const signatureData: SignatureData = planPayload.signature || {};
  
  // Migrate from old revisions[] if needed
  const legacyRevisions = planPayload.revisions || [];
  const migratedRevisions = signatureData.revisions || 
    (legacyRevisions.length > 0 ? legacyRevisions.map((r: any) => ({
      revision_date: r.revision_date || r.date || new Date().toISOString(),
      prepared_by: r.prepared_by || r.preparer || '',
      signature_png: r.signature_png || '',
      notes: r.notes || '',
    })) : []);
  
  // Get current signature from signature.current or latest revision
  const currentSignature = signatureData.current || 
    (migratedRevisions.length > 0 ? {
      prepared_by: migratedRevisions[migratedRevisions.length - 1].prepared_by,
      signed_at: migratedRevisions[migratedRevisions.length - 1].revision_date,
      signature_png: migratedRevisions[migratedRevisions.length - 1].signature_png,
    } : null);

  // Form state
  const [preparedBy, setPreparedBy] = useState(
    currentSignature?.prepared_by || 
    planPayload.preparer_name || 
    data.preparer_name || 
    ''
  );
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    currentSignature?.signed_at ? new Date(currentSignature.signed_at) : null
  );

  // Load existing signature into canvas when component mounts
  useEffect(() => {
    if (currentSignature?.signature_png && signaturePadRef.current) {
      signaturePadRef.current.fromDataURL(currentSignature.signature_png);
    }
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setAcknowledged(false);
  };

  const handleSave = async () => {
    if (!preparedBy.trim()) {
      toast.error('Please type your full name');
      return;
    }

    if (!acknowledged) {
      toast.error('Please check the acknowledgment box');
      return;
    }

    const signaturePng = signaturePadRef.current?.toDataURL() || '';
    
    // Check if signature is empty (just white canvas)
    if (signaturePadRef.current?.isEmpty()) {
      toast.error('Please draw your signature');
      return;
    }

    setIsSaving(true);

    try {
      const nowISO = new Date().toISOString();
      console.log('[signature] saving signature...', { planId, preparedBy });

      // Build new revision record
      const newRevision: SignatureRevision = {
        revision_date: nowISO,
        prepared_by: preparedBy.trim(),
        signature_png: signaturePng,
        notes: notes.trim() || undefined,
      };

      // Build new current signature
      const newCurrent: SignatureCurrent = {
        prepared_by: preparedBy.trim(),
        signed_at: nowISO,
        signature_png: signaturePng,
      };

      // Append to revisions array (immutable)
      const updatedRevisions = [...migratedRevisions, newRevision];

      // Build updated signature object
      const updatedSignature: SignatureData = {
        current: newCurrent,
        revisions: updatedRevisions,
      };

      // Update plan via onChange
      // This saves to plan_payload.signature
      onChange({
        ...data,
        signature: updatedSignature,
        preparer_name: preparedBy.trim(),
        // Clear old top-level revisions to prevent duplication
        revisions: undefined,
      });

      // Also update last_signed_at column on plans table directly
      if (planId) {
        const { error } = await supabase
          .from('plans')
          .update({ last_signed_at: nowISO })
          .eq('id', planId);

        if (error) {
          console.error('[signature] failed to update last_signed_at:', error);
        }
      }

      setLastSaved(new Date());
      setNotes('');
      setAcknowledged(false);
      
      console.log('[signature] signature saved successfully, revisions count:', updatedRevisions.length);
      toast.success('Signature saved successfully');
    } catch (error) {
      console.error('[signature] save error:', error);
      toast.error('Failed to save signature');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedLastSaved = lastSaved
    ? lastSaved.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">✍️ Review & Signature</h2>
        <p className="text-muted-foreground">
          Draw your signature with a finger or mouse. This saves to your plan and prints on your PDF.
        </p>
      </div>

      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Preview only. Upgrade to sign and save your plan.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Signature Status */}
      {currentSignature && lastSaved && (
        <Card className="p-6 bg-muted/50 border-primary/20">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg">Plan Signed</h3>
              <p className="text-foreground">
                <span className="font-medium">Name:</span> {currentSignature.prepared_by}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Date:</span> {formattedLastSaved}
              </p>
              {currentSignature.signature_png && (
                <div className="mt-3">
                  <span className="font-medium text-sm">Signature (for reference):</span>
                  <img
                    src={currentSignature.signature_png}
                    alt="Your signature"
                    className="max-h-20 mt-2 bg-white rounded border p-2"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Signature Form */}
      <Card className="p-6 space-y-6">
        <h3 className="font-semibold text-lg">
          {currentSignature ? 'Update Your Signature' : 'Sign Your Plan'}
        </h3>

        {/* Prepared By - Required */}
        <div className="space-y-2">
          <Label htmlFor="prepared_by" className="text-base font-medium">
            Type your full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="prepared_by"
            value={preparedBy}
            onChange={(e) => setPreparedBy(e.target.value)}
            placeholder="Enter your full legal name"
            className="text-lg h-12"
            disabled={isPreviewMode}
          />
        </div>

        {/* Signature Pad */}
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Draw your signature <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Use your mouse or finger to sign below
          </p>
          <div className="flex justify-center">
            <SignaturePad
              ref={signaturePadRef}
              width={Math.min(400, window.innerWidth - 80)}
              height={150}
              strokeColor="#000000"
              strokeWidth={2}
              disabled={isPreviewMode}
              className="bg-white"
            />
          </div>
          <div className="flex justify-center mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isPreviewMode}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Acknowledgment Checkbox - Required */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
            className="mt-0.5"
            disabled={isPreviewMode}
          />
          <Label htmlFor="acknowledge" className="text-base leading-relaxed cursor-pointer">
            I reviewed my plan. I understand this is not a legal will. <span className="text-destructive">*</span>
          </Label>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base font-medium">
            Notes for my family <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes or messages..."
            rows={3}
            disabled={isPreviewMode}
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!preparedBy.trim() || !acknowledged || isSaving || isPreviewMode}
          size="lg"
          className="w-full h-14 text-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSaving ? 'Saving...' : currentSignature ? 'Update Signature' : 'Save Signature'}
        </Button>
      </Card>

      {/* Revision History */}
      {migratedRevisions.length > 1 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Previous Signatures ({migratedRevisions.length - 1})</h3>
          <div className="space-y-3">
            {migratedRevisions.slice(0, -1).reverse().slice(0, 5).map((rev: SignatureRevision, idx: number) => (
              <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2 p-3 bg-muted/30 rounded">
                <PenLine className="h-4 w-4 flex-shrink-0" />
                <span>
                  {new Date(rev.revision_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {rev.prepared_by && ` — ${rev.prepared_by}`}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
