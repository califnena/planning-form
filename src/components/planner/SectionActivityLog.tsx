import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock, History, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  fetchSectionAuditLog, 
  AuditLogEntry, 
  formatAuditEventLabel,
  getLastUpdatedAt,
  getLastCompletedAt 
} from "@/lib/auditLog";
import { cn } from "@/lib/utils";

interface SectionActivityLogProps {
  userId: string;
  sectionId: string;
  isCompleted?: boolean;
}

export const SectionActivityLog = ({ 
  userId, 
  sectionId,
  isCompleted = false
}: SectionActivityLogProps) => {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<AuditLogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimestamps = async () => {
      const [updated, completed] = await Promise.all([
        getLastUpdatedAt(userId, sectionId),
        getLastCompletedAt(userId, sectionId)
      ]);
      setLastUpdated(updated);
      setLastCompleted(completed);
    };
    
    if (userId && sectionId) {
      fetchTimestamps();
    }
  }, [userId, sectionId]);

  const handleOpenActivity = async () => {
    if (!isOpen && activityLog.length === 0) {
      setLoading(true);
      const logs = await fetchSectionAuditLog(userId, sectionId);
      setActivityLog(logs);
      setLoading(false);
    }
    setIsOpen(!isOpen);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return timestamp;
    }
  };

  if (!lastUpdated && !lastCompleted && !isCompleted) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Timestamps */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {lastUpdated && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Last updated: {formatTimestamp(lastUpdated)}</span>
          </div>
        )}
        {isCompleted && lastCompleted && (
          <div className="flex items-center gap-1.5 text-green-700">
            <span>Completed: {formatTimestamp(lastCompleted)}</span>
          </div>
        )}
      </div>

      {/* Activity log collapsible */}
      <Collapsible open={isOpen} onOpenChange={handleOpenActivity}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            View activity
            {isOpen ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 rounded-lg border bg-muted/30 p-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {activityLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground shrink-0 w-36">
                      {formatTimestamp(entry.created_at)}
                    </span>
                    <span className="text-foreground">
                      {formatAuditEventLabel(entry.event_type)}
                      {entry.note && (
                        <span className="text-muted-foreground ml-1">
                          ({entry.note})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
