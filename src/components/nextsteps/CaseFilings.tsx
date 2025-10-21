import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface CaseFilingsProps {
  caseId: string;
  notices: any[];
  deathCertRequests: any[];
  obituary: any;
  onUpdate: () => void;
}

export const CaseFilings = ({ caseId, notices, deathCertRequests, obituary, onUpdate }: CaseFilingsProps) => {
  const getNoticeStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      submitted: { variant: "default", label: "Submitted" },
      confirmed: { variant: "outline", label: "Confirmed" },
      completed: { variant: "outline", label: "Completed" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Tabs defaultValue="notices" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="notices">Notices & Filings</TabsTrigger>
        <TabsTrigger value="death-certs">Death Certificates</TabsTrigger>
        <TabsTrigger value="obituary">Obituary</TabsTrigger>
      </TabsList>

      <TabsContent value="notices">
        <Card>
          <CardHeader>
            <CardTitle>Filings and Notices</CardTitle>
            <CardDescription>
              Track each organization you notify and save confirmation proof
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No notices recorded yet. Add organizations to notify.
                </p>
              ) : (
                notices.map((notice) => (
                  <div key={notice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{notice.notice_type.replace(/_/g, " ")}</p>
                      {notice.submitted_on && (
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(notice.submitted_on).toLocaleDateString()}
                        </p>
                      )}
                      {notice.confirmation_ref && (
                        <p className="text-xs text-muted-foreground">Ref: {notice.confirmation_ref}</p>
                      )}
                    </div>
                    {getNoticeStatusBadge(notice.status)}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="death-certs">
        <Card>
          <CardHeader>
            <CardTitle>Death Certificate Orders</CardTitle>
            <CardDescription>
              Track quantity, recipients, and distribution status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {deathCertRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No death certificate orders yet
              </p>
            ) : (
              <div className="space-y-4">
                {deathCertRequests.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Quantity: {req.quantity_requested}</p>
                      <Badge>{req.status}</Badge>
                    </div>
                    {req.ordered_on && (
                      <p className="text-sm text-muted-foreground">
                        Ordered: {new Date(req.ordered_on).toLocaleDateString()}
                      </p>
                    )}
                    {req.received_on && (
                      <p className="text-sm text-muted-foreground">
                        Received: {new Date(req.received_on).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="obituary">
        <Card>
          <CardHeader>
            <CardTitle>Obituary</CardTitle>
            <CardDescription>
              Draft, outlets, and publication tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {obituary ? (
              <div className="space-y-4">
                <div>
                  <Badge>{obituary.status}</Badge>
                </div>
                {obituary.draft_text && (
                  <div>
                    <h4 className="font-medium mb-2">Draft</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {obituary.draft_text}
                    </p>
                  </div>
                )}
                {obituary.other_outlets && (
                  <div>
                    <h4 className="font-medium mb-2">Outlets</h4>
                    <p className="text-sm text-muted-foreground">{obituary.other_outlets}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No obituary information yet
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
