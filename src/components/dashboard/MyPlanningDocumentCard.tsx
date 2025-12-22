import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, ArrowRight } from "lucide-react";

interface MyPlanningDocumentCardProps {
  hasData?: boolean;
}

export const MyPlanningDocumentCard = ({ hasData = false }: MyPlanningDocumentCardProps) => {
  const navigate = useNavigate();

  // User has NOT started planning
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
          <Button onClick={() => navigate("/preplandashboard")}>
            Start Planning
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // User HAS started planning
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          My Planning Document
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Continue where you left off, or view what you've completed.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={() => navigate("/preplandashboard")} 
          className="flex-1 gap-2"
        >
          Continue Planning
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/preplan-summary")}
          className="flex-1 gap-2"
        >
          <Eye className="h-4 w-4" />
          View / Print My Document
        </Button>
      </CardContent>
    </Card>
  );
};
