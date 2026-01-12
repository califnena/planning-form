import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-6xl">🏠</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          This page isn't available
        </h1>
        <p className="mb-8 text-xl text-muted-foreground leading-relaxed">
          Don't worry. You can safely return home and continue where you left off.
        </p>
        <Button 
          size="lg" 
          className="gap-3 text-lg px-8 py-6 h-auto"
          onClick={() => navigate("/home-senior")}
        >
          <Home className="h-5 w-5" />
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
