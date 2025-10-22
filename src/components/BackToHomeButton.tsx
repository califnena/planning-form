import { Link } from "react-router-dom";
import everlastingLogo from "@/assets/everlasting-logo.png";

export function BackToHomeButton() {
  return (
    <Link to="/" className="inline-block hover:opacity-80 transition-opacity">
      <img 
        src={everlastingLogo} 
        alt="Everlasting - Back to Home" 
        className="h-8 w-auto"
      />
    </Link>
  );
}
