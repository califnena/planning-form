import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Download, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Billing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscriptionData) {
        setSubscription(subscriptionData);
      }

      const { data: invoiceData } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (invoiceData) {
        setInvoices(invoiceData);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleUpdatePaymentMethod = () => {
    toast({
      title: t("billing.comingSoon"),
      description: t("billing.paymentMethodComingSoon"),
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/app")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("billing.returnHome")}
      </Button>
      
      <div>
        <h1 className="text-3xl font-bold">{t("billing.title")}</h1>
        <p className="text-muted-foreground">{t("billing.description")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing.paymentMethod")}</CardTitle>
          <CardDescription>{t("billing.paymentMethodDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription?.stripe_customer_id ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{t("billing.cardOnFile")}</p>
                  <p className="text-sm text-muted-foreground">{t("billing.paymentConnected")}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleUpdatePaymentMethod}>
                {t("billing.update")}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t("billing.noPaymentMethod")}</p>
              <Button onClick={handleUpdatePaymentMethod}>
                <CreditCard className="mr-2 h-4 w-4" />
                {t("billing.addPaymentMethod")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing.billingHistory")}</CardTitle>
          <CardDescription>{t("billing.billingHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("billing.dateColumn")}</TableHead>
                  <TableHead>{t("billing.amountColumn")}</TableHead>
                  <TableHead>{t("billing.statusColumn")}</TableHead>
                  <TableHead className="text-right">{t("billing.invoiceColumn")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.invoice_pdf && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("billing.noInvoices")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
