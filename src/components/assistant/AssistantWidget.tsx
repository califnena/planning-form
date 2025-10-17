import { useState } from "react";
import { AssistantBubble } from "./AssistantBubble";
import { AssistantPanel } from "./AssistantPanel";

export function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);

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
