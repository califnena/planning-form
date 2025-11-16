import { Link } from "react-router-dom";
import { Heart, ClipboardList, Store, MessageCircle, Settings, BookOpen, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  const tiles = [
    {
      title: "Pre-Planning",
      description: "Plan your funeral arrangements",
      icon: Heart,
      path: "/",
      color: "bg-primary/10 hover:bg-primary/20",
    },
    {
      title: "After-Life Plan",
      description: "Steps for loved ones after death",
      icon: ClipboardList,
      path: "/next-steps",
      color: "bg-secondary/10 hover:bg-secondary/20",
    },
    {
      title: "Vendors",
      description: "Find trusted service providers",
      icon: Store,
      path: "/vendors",
      color: "bg-accent/10 hover:bg-accent/20",
    },
    {
      title: "VIP Coach",
      description: "Get personalized guidance",
      icon: MessageCircle,
      path: "/vip-coach",
      color: "bg-primary/10 hover:bg-primary/20",
    },
    {
      title: "Settings",
      description: "Customize your preferences",
      icon: Settings,
      path: "/app/profile",
      color: "bg-secondary/10 hover:bg-secondary/20",
    },
    {
      title: "Helpful Resources",
      description: "Guides and information",
      icon: BookOpen,
      path: "/resources",
      color: "bg-accent/10 hover:bg-accent/20",
    },
    {
      title: "Common Questions",
      description: "Frequently asked questions",
      icon: HelpCircle,
      path: "/faq",
      color: "bg-primary/10 hover:bg-primary/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Welcome to Everlasting Funeral Advisors
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose an option below to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <Link key={tile.path} to={tile.path}>
                <Card className={`h-full transition-all duration-200 ${tile.color} border-2 hover:border-primary hover:shadow-lg cursor-pointer`}>
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center min-h-[240px]">
                    <Icon className="w-16 h-16 mb-4 text-primary" strokeWidth={1.5} />
                    <h2 className="text-2xl font-semibold mb-2 text-foreground">
                      {tile.title}
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      {tile.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
