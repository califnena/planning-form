import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PenLine, Check, Eraser, Save, AlertCircle, History, Plus, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SignaturePad, type SignaturePadRef } from "@/components/signature/SignaturePad";
import { usePreviewModeContext } from "@/contexts/PreviewModeContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/**
 * CANONICAL DATA MODEL for plan_payload.revisions
 * 
 * plan_payload.revisions = [
 *   {
 *     id: uuid,
 *     revision_number: integer (1, 2, 3...),
 *     signer_name: string|null,
 *     signature_image_data_url: string|null (base64 PNG),
 *     signed_at: timestamp,
 *     change_note: string|null,
 *     created_at: timestamp
 *   }
 * ]
 * 
 * APPEND-ONLY: Never overwrite or edit older revisions.
 */
interface Revision {
  id: string;
  revision_number: number;
  signer_name: string | null;
  signature_image_data_url: string | null;
  signed_at: string;
  change_note: string | null;
  created_at: string;
}

interface SectionSignatureProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * Generate a UUID
 */
function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

/**
 * Migrate legacy formats to canonical structure
 */
function migrateToCanonical(data: any): Revision[] {
  const planPayload = data.plan_payload || data;
  
  // Check for canonical format first
  if (Array.isArray(planPayload.revisions) && planPayload.revisions.length > 0) {
    const first = planPayload.revisions[0];
    // If already canonical (has signature_image_data_url), return as-is
    if ('signature_image_data_url' in first || 'revision_number' in first) {
      return planPayload.revisions.map((r: any, idx: number) => ({
        id: r.id || generateId(),
        revision_number: r.revision_number || idx + 1,
        signer_name: r.signer_name || r.signed_name || null,
        signature_image_data_url: r.signature_image_data_url || r.signature_image_png || null,
        signed_at: r.signed_at || new Date().toISOString(),
        change_note: r.change_note || r.notes || null,
        created_at: r.created_at || r.signed_at || new Date().toISOString(),
      }));
    }
  }
  
  // Check old signature.revisions format
  const signatureObj = planPayload.signature || {};
  if (Array.isArray(signatureObj.revisions) && signatureObj.revisions.length > 0) {
    return signatureObj.revisions.map((r: any, idx: number) => ({
      id: r.revision_id || r.id || generateId(),
      revision_number: idx + 1,
      signer_name: r.signed_name || null,
      signature_image_data_url: r.signature_image_png || null,
      signed_at: r.signed_at || new Date().toISOString(),
      change_note: r.notes || null,
      created_at: r.signed_at || new Date().toISOString(),
    }));
  }
  
  // Check old signature.current format
  if (signatureObj.current?.signature_png) {
    return [{
      id: generateId(),
      revision_number: 1,
      signer_name: signatureObj.current.prepared_by || null,
      signature_image_data_url: signatureObj.current.signature_png,
      signed_at: signatureObj.current.signed_at || new Date().toISOString(),
      change_note: null,
      created_at: signatureObj.current.signed_at || new Date().toISOString(),
    }];
  }
  
  // Check legacy top-level revisions array
  if (Array.isArray(data.revisions) && data.revisions.length > 0) {
    return data.revisions.map((r: any, idx: number) => ({
      id: r.revision_id || r.id || generateId(),
      revision_number: idx + 1,
      signer_name: r.signed_name || r.prepared_by || r.preparer || null,
      signature_image_data_url: r.signature_image_png || r.signature_png || null,
      signed_at: r.signed_at || r.revision_date || r.date || new Date().toISOString(),
      change_note: r.notes || null,
      created_at: r.signed_at || r.revision_date || new Date().toISOString(),
    }));
  }
  
  return [];
}

/**
 * SectionSignature - Revisions and Signature
 * 
 * CANONICAL KEY: plan_payload.revisions[]
 * Also updates: last_signed_at column on plans table
 */
export const SectionSignature = ({ data, onChange }: SectionSignatureProps) => {
  const signaturePadRef = useRef<SignaturePadRef>(null);
  const { isPreviewMode } = usePreviewModeContext();
  
  const planId = data.id || data.plan_id;
  const planPayload = data.plan_payload || data;
  
  // Get and migrate revisions to canonical format
  const revisions: Revision[] = migrateToCanonical(data);
  
  // Get the latest revision (highest revision_number)
  const latestRevision = revisions.length > 0 
    ? revisions.reduce((latest, r) => 
        (r.revision_number > (latest?.revision_number || 0)) ? r : latest
      , revisions[0])
    : null;

  // Previous revisions (all except latest, sorted by revision_number descending)
  const previousRevisions = revisions
    .filter(r => r.id !== latestRevision?.id)
    .sort((a, b) => b.revision_number - a.revision_number);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingRevision, setViewingRevision] = useState<Revision | null>(null);
  
  // Form state for adding revision
  const [signerName, setSignerName] = useState(
    planPayload.preparer_name || data.preparer_name || ''
  );
  const [changeNote, setChangeNote] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    setAcknowledged(false);
  };

  const handleOpenAddModal = () => {
    setSignerName(planPayload.preparer_name || data.preparer_name || '');
    setChangeNote('');
    setAcknowledged(false);
    setIsAddModalOpen(true);
    // Clear the signature pad after modal opens
    setTimeout(() => signaturePadRef.current?.clear(), 100);
  };

  const handleSaveRevision = async () => {
    if (!signerName.trim()) {
      toast.error('Please type your full name');
      return;
    }

    if (!acknowledged) {
      toast.error('Please check the acknowledgment box');
      return;
    }

    if (signaturePadRef.current?.isEmpty()) {
      toast.error('Please draw your signature');
      return;
    }

    const signatureDataUrl = signaturePadRef.current?.toDataURL() || '';
    
    setIsSaving(true);

    try {
      const nowISO = new Date().toISOString();
      
      // Compute next revision number
      const maxRevNum = revisions.reduce((max, r) => Math.max(max, r.revision_number || 0), 0);
      const nextRevNum = maxRevNum + 1;

      console.log('[signature] adding revision #', nextRevNum, { planId, signerName });

      // Build new revision (canonical format)
      const newRevision: Revision = {
        id: generateId(),
        revision_number: nextRevNum,
        signer_name: signerName.trim(),
        signature_image_data_url: signatureDataUrl,
        signed_at: nowISO,
        change_note: changeNote.trim() || null,
        created_at: nowISO,
      };

      // Append to revisions array (immutable - never overwrite)
      const updatedRevisions = [...revisions, newRevision];

      // Update plan via onChange - save to plan_payload.revisions (canonical location)
      onChange({
        ...data,
        revisions: updatedRevisions,
        preparer_name: signerName.trim(),
        // Clear old formats to prevent duplication
        signature: undefined,
      });

      // Also update last_signed_at column on plans table
      if (planId) {
        const { error } = await supabase
          .from('plans')
          .update({ last_signed_at: nowISO })
          .eq('id', planId);

        if (error) {
          console.error('[signature] failed to update last_signed_at:', error);
        }
      }

      setIsAddModalOpen(false);
      setChangeNote('');
      setAcknowledged(false);
      
      console.log('[signature] revision added, total revisions:', updatedRevisions.length);
      toast.success(`Revision #${nextRevNum} saved`);
    } catch (error) {
      console.error('[signature] save error:', error);
      toast.error('Failed to save revision');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">✍️ Revisions and Signature</h2>
        <p className="text-muted-foreground">
          Each revision saves a snapshot. Older revisions stay in history.
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

      {/* Latest Revision Display */}
      {latestRevision && (
        <Card className="p-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg text-green-800 dark:text-green-200">
                Latest Revision (#{latestRevision.revision_number})
              </h3>
              <p className="text-foreground">
                <span className="font-medium">Signed by:</span> {latestRevision.signer_name || '—'}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Date:</span> {formatDateTime(latestRevision.signed_at)}
              </p>
              {latestRevision.change_note && (
                <p className="text-foreground">
                  <span className="font-medium">Note:</span> {latestRevision.change_note}
                </p>
              )}
              {latestRevision.signature_image_data_url && (
                <div className="mt-3">
                  <img
                    src={latestRevision.signature_image_data_url}
                    alt="Your signature"
                    className="max-h-20 bg-white rounded border p-2"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Add Revision CTA */}
      <Button
        onClick={handleOpenAddModal}
        disabled={isPreviewMode}
        size="lg"
        className="w-full h-14 text-lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Add a Revision
      </Button>

      {/* Revision History */}
      {previousRevisions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Revision History ({previousRevisions.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Rev #</th>
                  <th className="text-left py-2 px-2 font-medium">Date</th>
                  <th className="text-left py-2 px-2 font-medium">Name</th>
                  <th className="text-left py-2 px-2 font-medium">Note</th>
                  <th className="text-left py-2 px-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {previousRevisions.map((rev) => (
                  <tr key={rev.id} className="border-b last:border-0">
                    <td className="py-2 px-2">{rev.revision_number}</td>
                    <td className="py-2 px-2">{formatDate(rev.signed_at)}</td>
                    <td className="py-2 px-2">{rev.signer_name || '—'}</td>
                    <td className="py-2 px-2 max-w-[200px] truncate">{rev.change_note || '—'}</td>
                    <td className="py-2 px-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingRevision(rev)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No revisions message */}
      {revisions.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          <PenLine className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No revisions yet. Click "Add a Revision" to sign your plan.</p>
        </Card>
      )}

      {/* Add Revision Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a Revision</DialogTitle>
            <DialogDescription>
              Sign to create a new dated revision. Previous revisions are preserved.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="signer_name" className="text-base font-medium">
                Name (for this revision) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="signer_name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Your full name"
                className="text-lg h-12"
              />
            </div>

            {/* What changed */}
            <div className="space-y-2">
              <Label htmlFor="change_note" className="text-base font-medium">
                What changed? <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="change_note"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder="Describe updates made in this revision..."
                rows={2}
              />
            </div>

            {/* Signature Pad */}
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Signature (draw below) <span className="text-destructive">*</span>
              </Label>
              <div className="flex justify-center">
                <SignaturePad
                  ref={signaturePadRef}
                  width={Math.min(350, window.innerWidth - 100)}
                  height={120}
                  strokeColor="#000000"
                  strokeWidth={2}
                  className="bg-white"
                />
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={handleClear}>
                  <Eraser className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Acknowledgment */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="acknowledge"
                checked={acknowledged}
                onCheckedChange={(checked) => setAcknowledged(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="acknowledge" className="text-base leading-relaxed cursor-pointer">
                I confirm this reflects my current wishes as of today. <span className="text-destructive">*</span>
              </Label>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveRevision}
              disabled={!signerName.trim() || !acknowledged || isSaving}
              size="lg"
              className="w-full h-12"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Revision'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Revision Modal */}
      <Dialog open={!!viewingRevision} onOpenChange={() => setViewingRevision(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Revision #{viewingRevision?.revision_number}</DialogTitle>
            <DialogDescription>
              Viewing historical revision (read-only)
            </DialogDescription>
          </DialogHeader>
          
          {viewingRevision && (
            <div className="space-y-4 pt-4">
              <div>
                <Label className="font-medium">Signed by</Label>
                <p>{viewingRevision.signer_name || '—'}</p>
              </div>
              <div>
                <Label className="font-medium">Date</Label>
                <p>{formatDateTime(viewingRevision.signed_at)}</p>
              </div>
              {viewingRevision.change_note && (
                <div>
                  <Label className="font-medium">What changed</Label>
                  <p>{viewingRevision.change_note}</p>
                </div>
              )}
              {viewingRevision.signature_image_data_url && (
                <div>
                  <Label className="font-medium">Signature</Label>
                  <img
                    src={viewingRevision.signature_image_data_url}
                    alt="Signature"
                    className="max-h-24 bg-white rounded border p-2 mt-2"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
