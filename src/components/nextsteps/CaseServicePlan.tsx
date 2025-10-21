import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CaseServicePlanProps {
  caseId: string;
  servicePlan: any;
  transport: any;
  onUpdate: () => void;
}

export const CaseServicePlan = ({ caseId, servicePlan, transport, onUpdate }: CaseServicePlanProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Plan</CardTitle>
          <CardDescription>
            Service type, disposition, venue, and ceremony details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {servicePlan ? (
            <div className="grid grid-cols-2 gap-4">
              {servicePlan.service_type && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Service Type</p>
                  <p className="capitalize">{servicePlan.service_type}</p>
                </div>
              )}
              {servicePlan.disposition && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Disposition</p>
                  <p className="capitalize">{servicePlan.disposition}</p>
                </div>
              )}
              {servicePlan.venue_name && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Venue</p>
                  <p>{servicePlan.venue_name}</p>
                  {servicePlan.venue_address && (
                    <p className="text-sm text-muted-foreground">{servicePlan.venue_address}</p>
                  )}
                </div>
              )}
              {servicePlan.date_time && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                  <p>{new Date(servicePlan.date_time).toLocaleString()}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No service plan details yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transport</CardTitle>
          <CardDescription>
            Logistics for moving the deceased
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transport ? (
            <div className="space-y-4">
              {transport.from_funeral_home && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">From</p>
                  <p>{transport.from_funeral_home}</p>
                </div>
              )}
              {transport.to_funeral_home && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">To</p>
                  <p>{transport.to_funeral_home}</p>
                </div>
              )}
              {transport.escort_required_bool !== null && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Escort Required</p>
                  <p>{transport.escort_required_bool ? "Yes" : "No"}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transport details yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
