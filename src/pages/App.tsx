import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const AppPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-primary">My Final Wishes</h1>
            <p className="text-xs text-muted-foreground">Interactive Planning Guide</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Welcome, {user?.email}!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your planner is being set up. We'll have the full interface ready shortly.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">📝 Get Started</h3>
              <p className="text-muted-foreground">
                Begin documenting your personal information, contacts, and wishes.
              </p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🛡️ Secure Storage</h3>
              <p className="text-muted-foreground">
                All your information is encrypted and securely stored.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppPage;
