import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PenLine, Check, Eraser, Save, AlertCircle, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SignaturePad, type SignaturePadRef } from "@/components/signature/SignaturePad";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Signature data model in plan_payload.signature
 * Uses append-only revisions - never overwrite, always append
 */
interface SignatureRevision {
  revision_id: string;
  signed_name: string;
  signature_image_png: string;
  signed_at: string;
  notes?: string;
}

interface SignatureData {
  revisions?: SignatureRevision[];
}

interface SectionSignatureProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * Generate a simple UUID for revision_id
 */
function generateRevisionId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

/**
 * SectionSignature
 * 
 * CANONICAL KEY: plan_payload.signature.revisions[]
 * Also updates: last_signed_at column on plans table
 * 
 * Features:
 * - Canvas-based signature drawing (touch + mouse)
 * - Typed name (required)
 * - Date (auto-set on save)
 * - Optional notes
 * - Revision history (append-only, never overwrite)
 */
export const SectionSignature = ({ data, onChange }: SectionSignatureProps) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const { isPreviewMode } = usePreviewModeContext();
  
  // Get planId from the plan data
  const planId = data.id || data.plan_id;
  
  // Get signature data from plan_payload.signature (new model)
  const planPayload = data.plan_payload || data;
  const signatureData: SignatureData = planPayload.signature || {};
  
  // Migrate from old data formats if needed
  const legacyRevisions = planPayload.revisions || [];
  const oldCurrentSignature = (signatureData as any).current; // old format had .current
  
  // Build revisions array from all sources
  let revisions: SignatureRevision[] = signatureData.revisions || [];
  
  // Migrate legacy top-level revisions[]
  if (revisions.length === 0 && legacyRevisions.length > 0) {
    revisions = legacyRevisions.map((r: any) => ({
      revision_id: r.revision_id || generateRevisionId(),
      signed_name: r.signed_name || r.prepared_by || r.preparer || '',
      signature_image_png: r.signature_image_png || r.signature_png || '',
      signed_at: r.signed_at || r.revision_date || r.date || new Date().toISOString(),
      notes: r.notes || undefined,
    }));
  }
  
  // Migrate old .current format
  if (revisions.length === 0 && oldCurrentSignature?.signature_png) {
    revisions = [{
      revision_id: generateRevisionId(),
      signed_name: oldCurrentSignature.prepared_by || '',
      signature_image_png: oldCurrentSignature.signature_png || '',
      signed_at: oldCurrentSignature.signed_at || new Date().toISOString(),
      notes: undefined,
    }];
  }
  
  // Get the latest revision (most recent signature)
  const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;

  // Form state
  const [signedName, setSignedName] = useState(
    latestRevision?.signed_name || 
    planPayload.preparer_name || 
    data.preparer_name || 
    ''
  );
  const [notes, setNotes] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    latestRevision?.signed_at ? new Date(latestRevision.signed_at) : null
  );

  // Load existing signature into canvas when component mounts
  useEffect(() => {
    if (latestRevision?.signature_image_png && signaturePadRef.current) {
      signaturePadRef.current.fromDataURL(latestRevision.signature_image_png);
    }
  }, []);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setAcknowledged(false);
  };

  const handleSave = async () => {
    if (!signedName.trim()) {
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
      console.log('[signature] adding new revision...', { planId, signedName });

      // Build new revision record (append-only)
      const newRevision: SignatureRevision = {
        revision_id: generateRevisionId(),
        signed_name: signedName.trim(),
        signature_image_png: signaturePng,
        signed_at: nowISO,
        notes: notes.trim() || undefined,
      };

      // Append to revisions array (immutable - never overwrite)
      const updatedRevisions = [...revisions, newRevision];

      // Build updated signature object
      const updatedSignature: SignatureData = {
        revisions: updatedRevisions,
      };

      // Update plan via onChange
      // This saves to plan_payload.signature
      onChange({
        ...data,
        signature: updatedSignature,
        preparer_name: signedName.trim(),
        // Clear old formats to prevent duplication
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
      
      console.log('[signature] revision added, total revisions:', updatedRevisions.length);
      toast.success('Signature revision saved');
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

  // Previous revisions (all except the latest)
  const previousRevisions = revisions.length > 1 ? revisions.slice(0, -1).reverse() : [];

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
      {latestRevision && lastSaved && (
        <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg text-green-800 dark:text-green-200">
                ✅ Plan Signed
              </h3>
              <p className="text-foreground">
                <span className="font-medium">Signed by:</span> {latestRevision.signed_name}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Date:</span> {formattedLastSaved}
              </p>
              {latestRevision.signature_image_png && (
                <div className="mt-3">
                  <img
                    src={latestRevision.signature_image_png}
                    alt="Your signature"
                    className="max-h-20 bg-white rounded border p-2"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Signature Form */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-lg">
            {latestRevision ? 'Add New Signature Revision' : 'Sign Your Plan'}
          </h3>
          {latestRevision && (
            <p className="text-sm text-muted-foreground mt-1">
              Each signature creates a new dated revision. Previous signatures are preserved.
            </p>
          )}
        </div>

        {/* Signed Name - Required */}
        <div className="space-y-2">
          <Label htmlFor="signed_name" className="text-base font-medium">
            Type your full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signed_name"
            value={signedName}
            onChange={(e) => setSignedName(e.target.value)}
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
            I confirm this reflects my current wishes as of today. <span className="text-destructive">*</span>
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
          disabled={!signedName.trim() || !acknowledged || isSaving || isPreviewMode}
          size="lg"
          className="w-full h-14 text-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {isSaving ? 'Saving...' : latestRevision ? 'Add Signature Revision' : 'Save Signature'}
        </Button>
      </Card>

      {/* Previous Signatures (read-only history) */}
      {previousRevisions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Previous Signatures ({previousRevisions.length})</h3>
          </div>
          <div className="space-y-3">
            {previousRevisions.slice(0, 5).map((rev, idx) => (
              <div key={rev.revision_id || idx} className="text-sm text-muted-foreground flex items-center gap-2 p-3 bg-muted/30 rounded">
                <PenLine className="h-4 w-4 flex-shrink-0" />
                <span>
                  {new Date(rev.signed_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {rev.signed_name && ` — ${rev.signed_name}`}
                </span>
              </div>
            ))}
            {previousRevisions.length > 5 && (
              <p className="text-xs text-muted-foreground italic">
                ...and {previousRevisions.length - 5} more
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
