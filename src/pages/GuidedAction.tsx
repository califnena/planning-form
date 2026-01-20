import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getActivePlanId } from "@/lib/getActivePlanId";

type TaskType = "text" | "choice";

interface Task {
  id: string;
  title: string;
  explanation: string;
  type: TaskType;
  choices?: { value: string; label: string }[];
  payloadKey: string;
  fieldKey: string;
}

const TASKS: Task[] = [
  {
    id: "preferred_name",
    title: "What would you like to be called?",
    explanation: "This helps us personalize your experience.",
    type: "text",
    payloadKey: "personal_information",
    fieldKey: "preferred_name",
  },
  {
    id: "disposition",
    title: "Do you have a preference for burial or cremation?",
    explanation: "This helps guide funeral planning decisions.",
    type: "choice",
    choices: [
      { value: "burial", label: "Burial" },
      { value: "cremation", label: "Cremation" },
      { value: "undecided", label: "I'm not sure yet" },
    ],
    payloadKey: "funeral",
    fieldKey: "disposition",
  },
  {
    id: "emergency_contact",
    title: "Who should be contacted first in an emergency?",
    explanation: "Just a name is enough for now.",
    type: "text",
    payloadKey: "contacts",
    fieldKey: "emergency_contact_name",
  },
];

export default function GuidedAction() {
  const navigate = useNavigate();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [skippedTasks, setSkippedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);

  const currentTask = TASKS[currentTaskIndex];
  const isLastTask = currentTaskIndex >= TASKS.length - 1;

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const result = await getActivePlanId(user.id);
        setPlanId(result.planId);
      }
    };
    init();
  }, []);

  const saveResponse = async () => {
    if (!inputValue.trim() || !planId) return;

    setIsLoading(true);
    try {
      // Get current plan payload
      const { data: plan, error: fetchError } = await supabase
        .from("plans")
        .select("plan_payload")
        .eq("id", planId)
        .single();

      if (fetchError) throw fetchError;

      const currentPayload = (plan?.plan_payload as Record<string, any>) || {};
      const sectionData = currentPayload[currentTask.payloadKey] || {};

      // Update the specific field
      const updatedPayload = {
        ...currentPayload,
        [currentTask.payloadKey]: {
          ...sectionData,
          [currentTask.fieldKey]: inputValue.trim(),
        },
      };

      const { error: updateError } = await supabase
        .from("plans")
        .update({
          plan_payload: updatedPayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", planId);

      if (updateError) throw updateError;

      toast.success("Saved!");
    } catch (error) {
      console.error("Error saving response:", error);
      toast.error("Could not save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (inputValue.trim()) {
      await saveResponse();
    }
    moveToNext();
  };

  const handleSkip = () => {
    setSkippedTasks(prev => new Set(prev).add(currentTask.id));
    moveToNext();
  };

  const moveToNext = () => {
    setInputValue("");
    if (isLastTask) {
      // Navigate to dashboard or next destination
      navigate("/dashboard");
    } else {
      setCurrentTaskIndex(prev => prev + 1);
    }
  };

  const openClaire = () => {
    navigate("/care-support");
  };

  if (!currentTask) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
            {currentTask.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentTask.explanation}
          </p>
        </div>

        <div className="space-y-6">
          {currentTask.type === "text" ? (
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className="min-h-[52px] text-lg"
              disabled={isLoading}
            />
          ) : (
            <RadioGroup
              value={inputValue}
              onValueChange={setInputValue}
              className="space-y-3"
            >
              {currentTask.choices?.map((choice) => (
                <div
                  key={choice.value}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem
                    value={choice.value}
                    id={choice.value}
                    className="min-w-[24px] min-h-[24px]"
                  />
                  <Label
                    htmlFor={choice.value}
                    className="text-lg cursor-pointer flex-1"
                  >
                    {choice.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <p className="text-sm text-muted-foreground">
            You can change this later.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            size="lg"
            className="min-h-[52px] text-lg w-full"
            onClick={handleSaveAndContinue}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save and continue"}
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-muted-foreground hover:text-foreground transition-colors py-2 text-base"
            disabled={isLoading}
          >
            Skip for now
          </button>
        </div>

        <div className="pt-6 text-center">
          <button
            type="button"
            onClick={openClaire}
            className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Need help thinking this through?
          </button>
        </div>
      </div>
    </div>
  );
}
