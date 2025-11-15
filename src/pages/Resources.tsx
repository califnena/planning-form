import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { ArrowLeft } from 'lucide-react';

const Resources = () => {
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
        
        <div className="bg-muted/50 border rounded-lg p-6">
          <p className="text-muted-foreground">
            Content coming soon. This will include guides on funeral planning, estate planning, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;
