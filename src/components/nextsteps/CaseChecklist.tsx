import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, CheckCircle2, Circle, Clock } from "lucide-react";

interface Task {
  id: string;
  title: string;
  category: string;
  status: string;
  due_date: string | null;
}

interface CaseChecklistProps {
  caseId: string;
  tasks: Task[];
  onUpdate: () => void;
}

export const CaseChecklist = ({ caseId, tasks, onUpdate }: CaseChecklistProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<string>("all");

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Task Updated",
        description: "Task status changed successfully",
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const filteredTasks = filter === "all" 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "doing":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      legal: "bg-purple-100 text-purple-800",
      funeral: "bg-blue-100 text-blue-800",
      finance: "bg-green-100 text-green-800",
      digital: "bg-cyan-100 text-cyan-800",
      home: "bg-orange-100 text-orange-800",
      obituary: "bg-pink-100 text-pink-800",
      veterans: "bg-red-100 text-red-800",
      transport: "bg-yellow-100 text-yellow-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post-Death Checklist</CardTitle>
        <CardDescription>
          Track all action items from immediate needs through the first 90 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant={filter === "todo" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("todo")}
          >
            To Do ({tasks.filter(t => t.status === "todo").length})
          </Button>
          <Button
            variant={filter === "doing" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("doing")}
          >
            In Progress ({tasks.filter(t => t.status === "doing").length})
          </Button>
          <Button
            variant={filter === "done" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("done")}
          >
            Done ({tasks.filter(t => t.status === "done").length})
          </Button>
        </div>

        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No tasks in this category</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <button onClick={() => {
                  const nextStatus = task.status === "todo" ? "doing" : task.status === "doing" ? "done" : "todo";
                  updateTaskStatus(task.id, nextStatus);
                }}>
                  {getStatusIcon(task.status)}
                </button>
                <div className="flex-1">
                  <p className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.due_date && (
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge className={getCategoryColor(task.category)}>
                  {task.category}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
