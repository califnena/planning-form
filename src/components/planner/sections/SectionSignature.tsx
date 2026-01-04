import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PenLine } from "lucide-react";
import { SignaturePadModal } from "@/components/planner/SignaturePadModal";
import { supabase } from "@/integrations/supabase/client";

interface RevisionRecord {
  revision_date: string;
  prepared_by: string;
  signature_png: string;
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
 */
export const SectionSignature = ({ data, onChange }: SectionSignatureProps) => {
  const [showModal, setShowModal] = useState(false);
  
  // Get planId from the plan data
  const planId = data.id || data.plan_id;
  
  // Get revisions array and latest revision from plan_payload
  const planPayload = data.plan_payload || data;
  const revisions: RevisionRecord[] = planPayload.revisions || [];
  const latestRevision = revisions.length > 0 ? revisions[revisions.length - 1] : null;
  const preparerName = planPayload.preparer_name || data.preparer_name || '';

  const handleSignatureSaved = async (signatureUrl: string, revisionData: RevisionRecord) => {
    console.log('[signature] plan updated with revision');
    
    // Append to revisions array
    const updatedRevisions = [...revisions, revisionData];
    
    // Update plan_payload with new revision
    onChange({
      ...data,
      revisions: updatedRevisions,
      preparer_name: revisionData.prepared_by || preparerName,
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
  };

  const formattedDate = latestRevision?.revision_date 
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
          Add your signature to finalize this document. This is a personal planning document, not a legal e-signature.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="preparer_name">Prepared By (Printed Name)</Label>
          <Input
            id="preparer_name"
            value={preparerName}
            onChange={(e) => onChange({ ...data, preparer_name: e.target.value })}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-4">
          <Label>Signature</Label>
          
          {latestRevision?.signature_png ? (
            <div className="p-4 bg-muted rounded-lg">
              <img
                src={latestRevision.signature_png}
                alt="Your signature"
                className="max-h-24 mx-auto bg-white rounded border"
              />
              <p className="text-center mt-2 text-sm font-medium">
                {latestRevision.prepared_by || preparerName}
              </p>
              {formattedDate && (
                <p className="text-center text-xs text-muted-foreground">
                  <PenLine className="h-3 w-3 inline mr-1" />
                  Signed on: {formattedDate}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No signature on file. Click below to sign your plan.
            </p>
          )}

          <Button onClick={() => setShowModal(true)}>
            <PenLine className="h-4 w-4 mr-2" />
            {latestRevision ? 'Update Signature' : 'Sign Your Plan'}
          </Button>
        </div>

        {revisions.length > 1 && (
          <div className="pt-4 border-t">
            <Label>Revision History</Label>
            <div className="mt-2 space-y-2">
              {revisions.slice(0, -1).reverse().map((rev, idx) => (
                <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <PenLine className="h-3 w-3" />
                  <span>
                    {new Date(rev.revision_date).toLocaleDateString()} 
                    {rev.prepared_by && ` - ${rev.prepared_by}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {planId && (
        <SignaturePadModal
          open={showModal}
          onOpenChange={setShowModal}
          planId={planId}
          preparerName={preparerName}
          onSignatureSaved={handleSignatureSaved}
        />
      )}
    </div>
  );
};
