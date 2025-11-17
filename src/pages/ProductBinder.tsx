import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

export default function ProductBinder() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Binder & Printed Planner Materials</h1>
            <p className="text-muted-foreground mt-2">Order a physical binder to store your planner and documents</p>
          </div>

          {/* Coming Soon Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Fireproof Document Binder
              </CardTitle>
              <CardDescription>
                A secure, organized way to keep your important documents in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">
                  Binder ordering coming soon
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We're preparing a high-quality binder solution to help you organize your planner and documents. 
                  Check back soon or contact us for more information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
