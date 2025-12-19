import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import type { ResourceDocument } from "@/lib/resourceDocuments";

interface ResourceCardProps {
  document: ResourceDocument;
  onDownloadPDF: () => void;
  isGenerating?: boolean;
}

export const ResourceCard = ({ document, onDownloadPDF, isGenerating }: ResourceCardProps) => {
  const getIntendedUseBadge = () => {
    switch (document.intendedUse) {
      case 'before-death':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Before Death</Badge>;
      case 'after-death':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">After Death</Badge>;
      case 'both':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Before & After</Badge>;
    }
  };

  const getTypeLabel = () => {
    switch (document.type) {
      case 'reference':
        return 'Educational Guide';
      case 'checklist':
        return 'Checklist';
      case 'planner':
        return 'Planner & Checklist';
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-3xl">{document.icon}</span>
          {getIntendedUseBadge()}
        </div>
        <CardTitle className="text-lg leading-tight">{document.title}</CardTitle>
        <div className="flex items-center gap-2">
          <FileText className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{getTypeLabel()}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="flex-1 mb-4 text-sm">
          {document.description}
        </CardDescription>
        <div className="flex gap-2">
          <Button 
            onClick={onDownloadPDF} 
            disabled={isGenerating}
            className="flex-1 gap-2"
            size="sm"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
