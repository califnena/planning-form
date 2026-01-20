import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AssistantBubble } from "./AssistantBubble";
import { AssistantPanel } from "./AssistantPanel";
import { isEmotionalStageRoute } from "@/lib/utils";

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Suppress auto-appearing elements on emotional stage routes
  // The widget is still accessible but won't show the "Claire is here" prompt
  const isEmotionalRoute = isEmotionalStageRoute(location.pathname);

  // On emotional routes, completely hide the widget to prevent distraction
  if (isEmotionalRoute) {
    return null;
  }

  return (
    <>
      <AssistantBubble 
        isOpen={isOpen} 
        onClick={() => setIsOpen(!isOpen)} 
      />
      <AssistantPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
