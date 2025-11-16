import { Mail, Phone, Globe, MapPin } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type VendorDirectory = Tables<'vendor_directory'>;

interface VendorCardProps {
  vendor: VendorDirectory;
}

export const VendorCard = ({ vendor }: VendorCardProps) => {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-4 md:p-5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-foreground">{vendor.name}</h3>
        {vendor.is_featured && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
            Featured
          </span>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-3">
        {vendor.category}
        {vendor.city && ` • ${vendor.city}, ${vendor.state}`}
        {!vendor.city && ` • ${vendor.state}`}
      </p>

      <div className="space-y-2">
        {vendor.phone && (
          <a 
            href={`tel:${vendor.phone}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="h-4 w-4" />
            {vendor.phone}
          </a>
        )}
        
        {vendor.email && (
          <a 
            href={`mailto:${vendor.email}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="h-4 w-4" />
            {vendor.email}
          </a>
        )}
        
        {vendor.website && (
          <a 
            href={vendor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Globe className="h-4 w-4" />
            Visit Website
          </a>
        )}
        
        {vendor.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{vendor.address}</span>
          </div>
        )}
      </div>

      {vendor.notes && (
        <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">
          {vendor.notes}
        </p>
      )}
    </div>
  );
};