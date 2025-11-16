import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorCard } from './VendorCard';
import { Tables } from '@/integrations/supabase/types';

type VendorDirectory = Tables<'vendor_directory'>;

const VENDOR_CATEGORIES = [
  'All',
  'Insurance',
  'Lawyers / Estate Attorneys',
  'Financial Advisors',
  'Funeral Homes',
  'Cremation Providers',
  'Cemeteries',
  'Caskets',
  'Urns',
  'Flowers',
  'Grief Support',
  'Other',
];

export const VendorDirectory = () => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendor-directory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_directory')
        .select('*')
        .order('category')
        .order('name');
      
      if (error) throw error;
      return data as VendorDirectory[];
    },
  });

  // Get unique states from vendors
  const availableStates = useMemo(() => {
    if (!vendors) return [];
    const states = [...new Set(vendors.map(v => v.state).filter(Boolean))];
    return states.sort();
  }, [vendors]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    if (!vendors) return [];
    
    return vendors.filter(vendor => {
      // Category filter
      if (categoryFilter !== 'All' && vendor.category !== categoryFilter) {
        return false;
      }
      
      // State filter
      if (stateFilter !== 'All' && vendor.state !== stateFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchFields = [
          vendor.name,
          vendor.city,
          vendor.category,
          vendor.notes,
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchFields.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [vendors, categoryFilter, stateFilter, searchQuery]);

  // Group vendors by category
  const vendorsByCategory = useMemo(() => {
    const grouped: Record<string, VendorDirectory[]> = {};
    
    filteredVendors.forEach(vendor => {
      const category = vendor.category || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(vendor);
    });
    
    return grouped;
  }, [filteredVendors]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading vendors...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4 mb-6">
        <div className="flex-1">
          <Label htmlFor="category" className="text-sm md:text-base">Category</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger id="category" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VENDOR_CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="state" className="text-sm md:text-base">State</Label>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger id="state" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All States</SelectItem>
              {availableStates.map(state => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm md:text-base">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by name, city, or keyword"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Vendor Display */}
      {Object.keys(vendorsByCategory).length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">
            No vendors match your selections yet. Try changing the category or state, or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(vendorsByCategory).map(([category, categoryVendors]) => (
            <div key={category}>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};