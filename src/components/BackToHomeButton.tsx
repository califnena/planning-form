import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToHomeButton() {
  return (
    <Link to="/">
      <Button variant="ghost" size="sm" className="gap-2">
        <Home className="h-4 w-4" />
        Home
      </Button>
    </Link>
  );
}
