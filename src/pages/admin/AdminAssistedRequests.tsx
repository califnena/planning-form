 import { useEffect, useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { 
   Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
 } from "@/components/ui/table";
 import {
   Dialog, DialogContent, DialogDescription, DialogFooter, 
   DialogHeader, DialogTitle
 } from "@/components/ui/dialog";
 import {
   Select, SelectContent, SelectItem, SelectTrigger, SelectValue
 } from "@/components/ui/select";
 import { Textarea } from "@/components/ui/textarea";
 import { supabase } from "@/integrations/supabase/client";
 import { useAdminStatus } from "@/hooks/useAdminStatus";
 import { format } from "date-fns";
 import { Search, Edit, Headphones } from "lucide-react";
 import { Skeleton } from "@/components/ui/skeleton";
 import { toast } from "sonner";
 
 interface AssistedRequest {
   id: string;
   created_at: string;
   full_name: string;
   email: string;
   phone: string | null;
   relationship: string;
   help_topics: string[];
   timing: string;
   involvement_level: string;
   status: string;
   admin_notes: string | null;
   primary_contact_name: string;
   primary_contact_relationship: string;
 }
 
 const STATUS_OPTIONS = ['pending', 'contacted', 'scheduled', 'completed', 'closed'];
 
 export default function AdminAssistedRequests() {
   const navigate = useNavigate();
   const { isAdmin, isLoading: adminLoading } = useAdminStatus();
   const [hasSupportRole, setHasSupportRole] = useState(false);
   const [requests, setRequests] = useState<AssistedRequest[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [editDialogOpen, setEditDialogOpen] = useState(false);
   const [selectedRequest, setSelectedRequest] = useState<AssistedRequest | null>(null);
   const [newStatus, setNewStatus] = useState("");
   const [adminNotes, setAdminNotes] = useState("");
 
   useEffect(() => {
     checkAccess();
   }, []);
 
   const checkAccess = async () => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
       navigate("/");
       return;
     }
 
     // Check for admin role
     const { data: isAdminRole } = await supabase.rpc('has_app_role', { 
       _user_id: user.id, 
       _role: 'admin' 
     });
 
     // Check for support role
     const { data: isSupportRole } = await supabase.rpc('has_app_role', { 
       _user_id: user.id, 
       _role: 'support' 
     });
 
     if (!isAdminRole && !isSupportRole) {
       navigate("/");
       return;
     }
 
     setHasSupportRole(isSupportRole || false);
     loadRequests();
     logPageAccess();
   };
 
   const logPageAccess = async () => {
     await supabase.rpc('log_admin_page_access', { _page_path: '/admin/assisted-requests' });
   };
 
   const loadRequests = async () => {
     try {
       const { data, error } = await supabase
         .from('efa_do_for_you_intake')
         .select('*')
         .order('created_at', { ascending: false });
       
       if (error) throw error;
       setRequests(data || []);
     } catch (err) {
       console.error('Failed to load requests:', err);
       toast.error('Failed to load assisted requests');
     } finally {
       setLoading(false);
     }
   };
 
   const handleUpdateRequest = async () => {
     if (!selectedRequest) return;
 
     try {
       const { error } = await supabase
         .from('efa_do_for_you_intake')
         .update({
           status: newStatus,
           admin_notes: adminNotes,
           updated_at: new Date().toISOString()
         })
         .eq('id', selectedRequest.id);
 
       if (error) throw error;
 
       // Log the action
       await supabase.from('admin_audit_log').insert({
         admin_user_id: (await supabase.auth.getUser()).data.user?.id,
         action_type: 'update_assisted_request',
         target_table: 'efa_do_for_you_intake',
         target_id: selectedRequest.id,
         details: { new_status: newStatus }
       });
 
       toast.success('Request updated successfully');
       setEditDialogOpen(false);
       setSelectedRequest(null);
       loadRequests();
     } catch (err) {
       console.error('Failed to update request:', err);
       toast.error('Failed to update request');
     }
   };
 
   const getStatusBadge = (status: string) => {
     const variants: Record<string, string> = {
       pending: 'bg-yellow-500',
       contacted: 'bg-blue-500',
       scheduled: 'bg-purple-500',
       completed: 'bg-green-500',
       closed: 'bg-gray-500'
     };
     return (
       <Badge className={variants[status] || 'bg-gray-500'}>
         {status.charAt(0).toUpperCase() + status.slice(1)}
       </Badge>
     );
   };
 
   const filteredRequests = requests.filter(r => 
     r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.id.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   if (adminLoading || loading) {
     return (
       <div className="container mx-auto p-6 space-y-6">
         <Skeleton className="h-8 w-64" />
         <Skeleton className="h-[400px]" />
       </div>
     );
   }
 
   return (
     <div className="container mx-auto p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold flex items-center gap-2">
           <Headphones className="h-6 w-6" />
           Assisted Planning Requests
         </h1>
         <Badge variant="outline">{requests.length} Total Requests</Badge>
       </div>
 
       <div className="flex items-center gap-2">
         <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search by name, email, or ID..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="pl-9"
           />
         </div>
       </div>
 
       <Card>
         <CardContent className="p-0">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Request ID</TableHead>
                 <TableHead>Created</TableHead>
                 <TableHead>Name</TableHead>
                 <TableHead>Contact Method</TableHead>
                 <TableHead>Help Topics</TableHead>
                 <TableHead>Timing</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredRequests.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                     No assisted requests found
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredRequests.map((request) => (
                   <TableRow key={request.id}>
                     <TableCell className="font-mono text-xs">
                       {request.id.slice(0, 8)}...
                     </TableCell>
                     <TableCell className="text-sm">
                       {format(new Date(request.created_at), 'MMM d, yyyy')}
                     </TableCell>
                     <TableCell>{request.full_name}</TableCell>
                     <TableCell>
                       <div className="text-sm">
                         <div>{request.email}</div>
                         {request.phone && (
                           <div className="text-muted-foreground">{request.phone}</div>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex flex-wrap gap-1 max-w-[200px]">
                         {request.help_topics.slice(0, 3).map((topic, i) => (
                           <Badge key={i} variant="outline" className="text-xs">
                             {topic}
                           </Badge>
                         ))}
                         {request.help_topics.length > 3 && (
                           <Badge variant="outline" className="text-xs">
                             +{request.help_topics.length - 3}
                           </Badge>
                         )}
                       </div>
                     </TableCell>
                     <TableCell className="text-sm">{request.timing}</TableCell>
                     <TableCell>{getStatusBadge(request.status)}</TableCell>
                     <TableCell>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => {
                           setSelectedRequest(request);
                           setNewStatus(request.status);
                           setAdminNotes(request.admin_notes || '');
                           setEditDialogOpen(true);
                         }}
                       >
                         <Edit className="h-4 w-4" />
                       </Button>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
 
       {/* Edit Dialog */}
       <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle>Update Request</DialogTitle>
             <DialogDescription>
               Update the status and add notes for this assisted planning request.
             </DialogDescription>
           </DialogHeader>
           
           {selectedRequest && (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div>
                   <span className="text-muted-foreground">Name:</span>
                   <p className="font-medium">{selectedRequest.full_name}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Relationship:</span>
                   <p className="font-medium">{selectedRequest.relationship}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Primary Contact:</span>
                   <p className="font-medium">{selectedRequest.primary_contact_name}</p>
                 </div>
                 <div>
                   <span className="text-muted-foreground">Involvement:</span>
                   <p className="font-medium">{selectedRequest.involvement_level}</p>
                 </div>
               </div>
 
               <div className="space-y-2">
                 <label className="text-sm font-medium">Status</label>
                 <Select value={newStatus} onValueChange={setNewStatus}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {STATUS_OPTIONS.map((status) => (
                       <SelectItem key={status} value={status}>
                         {status.charAt(0).toUpperCase() + status.slice(1)}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
 
               <div className="space-y-2">
                 <label className="text-sm font-medium">Admin Notes</label>
                 <Textarea
                   placeholder="Add notes about this request..."
                   value={adminNotes}
                   onChange={(e) => setAdminNotes(e.target.value)}
                   rows={4}
                 />
               </div>
             </div>
           )}
 
           <DialogFooter>
             <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
               Cancel
             </Button>
             <Button onClick={handleUpdateRequest}>
               Save Changes
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }