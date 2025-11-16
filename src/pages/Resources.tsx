import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Resources = () => {
  const guides = [
    {
      title: "Pre-Planning Your Funeral",
      description: "A comprehensive guide to making funeral arrangements in advance - a gift of peace and clarity to your loved ones.",
      icon: "📋",
      file: "/Pre-Planning-Your-Funeral-A-Gift-of-Peace-and-Clarity.pdf"
    },
    {
      title: "Discussing Death Guide",
      description: "How to have meaningful conversations about end-of-life wishes with your family and loved ones.",
      icon: "💬",
      file: "/guides/Discussing-Death-Guide.pdf"
    },
    {
      title: "My End-of-Life Decisions",
      description: "A practical guide to documenting your personal wishes, preferences, and important information.",
      icon: "📝",
      file: "/guides/My-End-of-Life-Decisions-Guide.pdf"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-start mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Helpful Resources
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Short guides and links to help you understand your options.
        </p>
        
        <div className="grid gap-6 md:grid-cols-1">
          {guides.map((guide, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <span className="text-4xl" aria-hidden="true">{guide.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl mb-2">{guide.title}</CardTitle>
                    <CardDescription className="text-base">{guide.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <a href={guide.file} download>
                  <Button size="lg" className="gap-2 w-full md:w-auto">
                    <Download className="h-5 w-5" />
                    Download Guide (PDF)
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-xl">Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our team is here to support you through every step of the planning process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/contact">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Contact Us
                </Button>
              </Link>
              <Link to="/faq">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Common Questions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Resources;
