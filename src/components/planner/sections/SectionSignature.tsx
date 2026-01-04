import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PenLine, Upload, Check, X, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RevisionRecord {
  revision_date: string;
  prepared_by: string;
  signature_png?: string;
  notes?: string;
}

interface SectionSignatureProps {
  data: any;
  onChange: (data: any) => void;
}

/**
 * SectionSignature
 * 
 * CANONICAL KEY: revisions (array in plan_payload)
 * Also updates: last_signed_at column on plans table
 * 
 * Fields:
 * - Typed Name (required)
 * - Date (editable, default today)
 * - Checkbox acknowledgment (required)
 * - Optional: Upload Signature Image
 * - Optional: Notes for family
 */
export const SectionSignature = ({ data, onChange }: SectionSignatureProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get planId from the plan data
  const planId = data.id || data.plan_id;
  
  // Get revisions array from plan_payload
  const planPayload = data.plan_payload || data;
  const revisions: RevisionRecord[] = planPayload.revisions || [];
  const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;

  // Form state - initialize from latest revision if exists
  const [typedName, setTypedName] = useState(latestRevision?.prepared_by || planPayload.preparer_name || data.preparer_name || '');
  const [signatureDate, setSignatureDate] = useState(
    latestRevision?.revision_date || new Date().toISOString().split('T')[0]
  );
  const [acknowledged, setAcknowledged] = useState(false);
  const [signatureImageUrl, setSignatureImageUrl] = useState(latestRevision?.signature_png || '');
  const [notes, setNotes] = useState(latestRevision?.notes || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const filePath = `${planId}/${timestamp}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      setSignatureImageUrl(urlData.publicUrl);
      toast.success('Signature image uploaded');
    } catch (error) {
      console.error('[signature] upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeSignatureImage = () => {
    setSignatureImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!typedName.trim()) {
      toast.error('Please type your full name');
      return;
    }

    if (!acknowledged) {
      toast.error('Please check the acknowledgment box');
      return;
    }

    setIsSaving(true);

    try {
      console.log('[signature] saving revision...');

      // Create new revision
      const newRevision: RevisionRecord = {
        revision_date: signatureDate,
        prepared_by: typedName.trim(),
        signature_png: signatureImageUrl || undefined,
        notes: notes.trim() || undefined,
      };

      // Append to revisions array
      const updatedRevisions = [...revisions, newRevision];

      // Update plan via onChange
      onChange({
        ...data,
        revisions: updatedRevisions,
        preparer_name: typedName.trim(),
      });

      // Also update last_signed_at column on plans table directly
      if (planId) {
        const { error } = await supabase
          .from('plans')
          .update({ last_signed_at: new Date().toISOString() })
          .eq('id', planId);

        if (error) {
          console.error('[signature] failed to update last_signed_at:', error);
        }
      }

      console.log('[signature] revision saved successfully');
      toast.success('Plan signed successfully');
      
      // Reset acknowledgment for next time
      setAcknowledged(false);
    } catch (error) {
      console.error('[signature] save error:', error);
      toast.error('Failed to save signature');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedLatestDate = latestRevision?.revision_date
    ? new Date(latestRevision.revision_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">✍️ Review & Signature</h2>
        <p className="text-muted-foreground">
          Sign your plan to confirm you've reviewed it. This is for personal reference only, not a legal signature.
        </p>
      </div>

      {/* Current Signature Display */}
      {latestRevision && (
        <Card className="p-6 bg-muted/50 border-primary/20">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg">Plan Signed</h3>
              <p className="text-foreground">
                <span className="font-medium">Name:</span> {latestRevision.prepared_by}
              </p>
              <p className="text-foreground">
                <span className="font-medium">Date:</span> {formattedLatestDate}
              </p>
              {latestRevision.signature_png && (
                <div className="mt-3">
                  <span className="font-medium text-sm">Signature (for reference):</span>
                  <img
                    src={latestRevision.signature_png}
                    alt="Your signature"
                    className="max-h-20 mt-2 bg-white rounded border p-2"
                  />
                </div>
              )}
              {latestRevision.notes && (
                <div className="mt-3">
                  <span className="font-medium text-sm">Notes:</span>
                  <p className="text-muted-foreground mt-1 text-sm whitespace-pre-wrap">
                    {latestRevision.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Signature Form */}
      <Card className="p-6 space-y-6">
        <h3 className="font-semibold text-lg">
          {latestRevision ? 'Update Your Signature' : 'Sign Your Plan'}
        </h3>

        {/* Typed Name - Required */}
        <div className="space-y-2">
          <Label htmlFor="typed_name" className="text-base font-medium">
            Type your full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="typed_name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            placeholder="Enter your full legal name"
            className="text-lg h-12"
          />
        </div>

        {/* Date - Editable */}
        <div className="space-y-2">
          <Label htmlFor="signature_date" className="text-base font-medium">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="signature_date"
            type="date"
            value={signatureDate}
            onChange={(e) => setSignatureDate(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Acknowledgment Checkbox - Required */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            id="acknowledge"
            checked={acknowledged}
            onCheckedChange={(checked) => setAcknowledged(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="acknowledge" className="text-base leading-relaxed cursor-pointer">
            I reviewed my plan. I understand this is not a legal will. <span className="text-destructive">*</span>
          </Label>
        </div>

        {/* Optional Signature Image Upload */}
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Upload signature photo <span className="text-muted-foreground">(optional)</span>
          </Label>
          
          {signatureImageUrl ? (
            <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
              <img
                src={signatureImageUrl}
                alt="Signature preview"
                className="max-h-16 bg-white rounded border p-1"
              />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Signature image uploaded</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeSignatureImage}
                  className="mt-2 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="signature-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !planId}
                className="h-12"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Upload signature photo
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                You can upload a photo of your handwritten signature.
              </p>
            </div>
          )}
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
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!typedName.trim() || !acknowledged || isSaving}
          size="lg"
          className="w-full h-14 text-lg"
        >
          <PenLine className="h-5 w-5 mr-2" />
          {isSaving ? 'Saving...' : latestRevision ? 'Update Signature' : 'Sign My Plan'}
        </Button>
      </Card>

      {/* Revision History */}
      {revisions.length > 1 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Previous Signatures</h3>
          <div className="space-y-3">
            {revisions.slice(0, -1).reverse().map((rev, idx) => (
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
