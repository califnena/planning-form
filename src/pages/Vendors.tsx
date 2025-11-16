import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TextSizeToggle } from '@/components/TextSizeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { VendorDisclaimer } from '@/components/vendors/VendorDisclaimer';
import { VendorDirectory } from '@/components/vendors/VendorDirectory';
import { VendorAdmin } from '@/components/vendors/VendorAdmin';
import { supabase } from '@/integrations/supabase/client';
import { isTestModeEnabled } from '@/lib/utils';

const Vendors = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (isTestModeEnabled()) {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        setIsAdmin(!!roles);
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
        <div className="flex justify-between items-start mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <TextSizeToggle />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Helpful Contacts & Vendors
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-6">
          Find professionals who can help with planning, finances, and services. Use this as a starting point and always do your own research.
        </p>

        <VendorDisclaimer />

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="directory" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="directory">Directory</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin">Admin</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="directory" className="mt-6">
              <VendorDirectory />
            </TabsContent>
            
            {isAdmin && (
              <TabsContent value="admin" className="mt-6">
                <VendorAdmin />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Vendors;