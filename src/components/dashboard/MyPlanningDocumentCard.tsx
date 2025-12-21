import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Printer } from "lucide-react";

interface MyPlanningDocumentCardProps {
  hasData?: boolean;
}

export const MyPlanningDocumentCard = ({ hasData = true }: MyPlanningDocumentCardProps) => {
  const navigate = useNavigate();

  if (!hasData) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            My Planning Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Your planning document will appear here once you start.
          </p>
          <Button onClick={() => navigate("/plan-ahead")}>
            Start Planning
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          My Planning Document
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View, print, or share everything you've written so far.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={() => navigate("/preplan-summary")} 
          className="w-full gap-2"
        >
          <FileText className="h-4 w-4" />
          Open My Planning Document
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/preplan-summary?print=1")} 
          className="w-full gap-2"
        >
          <Printer className="h-4 w-4" />
          Download to Print
        </Button>
      </CardContent>
    </Card>
  );
};
