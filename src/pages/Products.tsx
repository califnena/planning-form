import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package } from "lucide-react";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

export default function Products() {
  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Products & Services</h1>
            <p className="text-muted-foreground mt-2">Physical products and memorial items</p>
          </div>

          {/* Coming Soon Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Shop Caskets, Urns & Memorial Items
              </CardTitle>
              <CardDescription>
                Browse and order quality memorial products delivered to your door
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">
                  Product ordering coming soon
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  We're working on bringing you a curated selection of high-quality caskets, urns, 
                  and memorial items. Check back soon or contact us for immediate assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
