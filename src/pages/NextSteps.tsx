import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText, Eye, Download, Mail, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Case {
  id: string;
  case_status: string;
  created_at: string;
  decedent?: {
    legal_name: string;
    dod: string | null;
  };
}

export default function NextSteps() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("cases")
        .select(`
          *,
          decedent:decedents(legal_name, dod)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast({
        title: "Error",
        description: "Failed to load cases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewCase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: newCase, error } = await supabase
        .from("cases")
        .insert({ user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Case Created",
        description: "New case has been created successfully",
      });

      navigate(`/next-steps/case/${newCase.id}`);
    } catch (error) {
      console.error("Error creating case:", error);
      toast({
        title: "Error",
        description: "Failed to create case",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: "default",
      on_hold: "secondary",
      closed: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading cases...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Everlasting Next Steps</h1>
              <p className="text-muted-foreground mt-1">After-Life Action Plan</p>
            </div>
            <Button onClick={createNewCase} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Start New Case
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cases.length === 0 ? (
          <div className="text-center py-16">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Cases Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first case to start organizing and tracking post-death action items
            </p>
            <Button onClick={createNewCase} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Start New Case
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cases.map((caseItem) => (
              <Card
                key={caseItem.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/next-steps/case/${caseItem.id}`)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {caseItem.decedent?.legal_name || "Unnamed Case"}
                      </h3>
                      {caseItem.decedent?.dod && (
                        <p className="text-sm text-muted-foreground">
                          Date of Death: {new Date(caseItem.decedent.dod).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(caseItem.case_status)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(caseItem.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="mr-1 h-3 w-3" />
                      PDF
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-border pt-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">About After-Life Action Plans</h2>
            <p className="text-muted-foreground mb-4">
              The After-Life Action Plan guides executors and family members from the moment of death 
              through the first 30-90 days. It provides a structured checklist covering:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Immediate actions (0-48 hours): funeral home selection, securing residence, notifying family</li>
              <li>Filings and notices: Social Security, employer, insurance, banks, utilities</li>
              <li>Document location index: will, trust, deeds, titles, insurance policies</li>
              <li>Death certificate orders and distribution tracking</li>
              <li>Obituary drafting and publication management</li>
              <li>Service planning: venue, officiant, pallbearers, music, readings</li>
              <li>Financial and property management tasks</li>
              <li>Digital account handling</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
