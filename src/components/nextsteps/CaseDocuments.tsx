import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaseDocumentsProps {
  caseId: string;
  documents: any[];
  onUpdate: () => void;
}

export const CaseDocuments = ({ caseId, documents, onUpdate }: CaseDocumentsProps) => {
  const getDocTypeLabel = (docType: string) => {
    const labels: Record<string, string> = {
      will: "Will",
      trust: "Trust",
      insurance: "Insurance Policy",
      deed: "Property Deed",
      title: "Vehicle Title",
      tax_return: "Tax Return",
      burial_plot: "Burial Plot Certificate",
      safe_deposit: "Safe Deposit Box",
      obituary_draft: "Obituary Draft",
      death_cert_order: "Death Certificate Order",
      receipt: "Receipt",
    };
    return labels[docType] || docType;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Location Index</CardTitle>
        <CardDescription>
          Where to find key documents: will, trust, deeds, insurance, and more
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No documents recorded yet. Add document locations to help executors find important papers.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{getDocTypeLabel(doc.doc_type)}</p>
                  {doc.storage_location_text && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Location: {doc.storage_location_text}
                    </p>
                  )}
                  {doc.file_url && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-1"
                      asChild
                    >
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View File
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
