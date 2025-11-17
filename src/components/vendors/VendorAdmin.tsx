import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type VendorDirectory = Tables<'vendor_directory'>;
type VendorDirectoryInsert = TablesInsert<'vendor_directory'>;

const VENDOR_CATEGORIES = [
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

const INITIAL_FORM_STATE: Partial<VendorDirectoryInsert> = {
  name: '',
  category: 'Other',
  state: '',
  city: '',
  contact_name: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  notes: '',
  is_featured: false,
  is_active: true,
};

export const VendorAdmin = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<VendorDirectoryInsert>>(INITIAL_FORM_STATE);
  const queryClient = useQueryClient();

  // Fetch all vendors (admin can see inactive ones too)
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendor-directory-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_directory')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VendorDirectory[];
    },
  });

  // Create vendor mutation
  const createMutation = useMutation({
    mutationFn: async (newVendor: VendorDirectoryInsert) => {
      const { data, error } = await supabase
        .from('vendor_directory')
        .insert(newVendor)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-directory'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-directory-admin'] });
      toast.success('Vendor created successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create vendor: ${error.message}`);
    },
  });

  // Update vendor mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'vendor_directory'> }) => {
      const { data, error } = await supabase
        .from('vendor_directory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-directory'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-directory-admin'] });
      toast.success('Vendor updated successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update vendor: ${error.message}`);
    },
  });

  // Delete vendor mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vendor_directory')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-directory'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-directory-admin'] });
      toast.success('Vendor deleted successfully');
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete vendor: ${error.message}`);
      setDeletingId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.state) {
      toast.error('Please fill in required fields: Name, Category, and State');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ 
        id: editingId, 
        updates: formData as TablesUpdate<'vendor_directory'>
      });
    } else {
      createMutation.mutate(formData as VendorDirectoryInsert);
    }
  };

  const loadVendorForEdit = (vendor: VendorDirectory) => {
    setEditingId(vendor.id);
    setFormData({
      name: vendor.name,
      category: vendor.category,
      state: vendor.state,
      city: vendor.city || '',
      contact_name: vendor.contact_name || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      website: vendor.website || '',
      address: vendor.address || '',
      notes: vendor.notes || '',
      is_featured: vendor.is_featured,
      is_active: vendor.is_active,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Vendor Form */}
      <div className="bg-white border border-border rounded-xl p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
          {editingId ? 'Edit Vendor' : 'Add New Vendor'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category || 'Other'}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state || ''}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                placeholder="e.g., FL, CA, TX"
                maxLength={2}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_name || ''}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Optional: Add any special notes or disclosures about business relationships..."
            />
          </div>
          
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked as boolean })}
              />
              <Label htmlFor="is_featured" className="cursor-pointer">Featured</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
            </div>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              {editingId ? 'Save Changes' : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vendor
                </>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Vendor List */}
      <div className="bg-white border border-border rounded-xl p-5 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">
          All Vendors ({vendors?.length || 0})
        </h2>
        
        <div className="space-y-2">
          {vendors?.map(vendor => (
            <div
              key={vendor.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{vendor.name}</p>
                  {vendor.is_featured && (
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Featured
                    </span>
                  )}
                  {!vendor.is_active && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {vendor.category} • {vendor.city ? `${vendor.city}, ` : ''}{vendor.state}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadVendorForEdit(vendor)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(vendor.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vendor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};