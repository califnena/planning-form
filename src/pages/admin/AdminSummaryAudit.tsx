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
 import { supabase } from "@/integrations/supabase/client";
 import { useAdminStatus } from "@/hooks/useAdminStatus";
 import { format } from "date-fns";
 import { Clock, AlertTriangle, Search, Ban } from "lucide-react";
 import { Skeleton } from "@/components/ui/skeleton";
 import { toast } from "sonner";
 import { Textarea } from "@/components/ui/textarea";
 
 interface SummaryMetadata {
   summary_id: string;
   user_id_hash: string;
   internal_user_id: string;
   created_at: string;
   renewed_at: string | null;
   expires_at: string;
   status: string;
   char_count: number;
   save_source: string;
   pii_flag: boolean;
   category_tag: string | null;
   consent_captured: boolean;
   policy_version: string;
 }
 
 export default function AdminSummaryAudit() {
   const navigate = useNavigate();
   const { isAdmin, isLoading: adminLoading } = useAdminStatus();
   const [summaries, setSummaries] = useState<SummaryMetadata[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [expireDialogOpen, setExpireDialogOpen] = useState(false);
   const [disableDialogOpen, setDisableDialogOpen] = useState(false);
   const [selectedSummary, setSelectedSummary] = useState<SummaryMetadata | null>(null);
   const [disableReason, setDisableReason] = useState("");
 
   useEffect(() => {
     if (!adminLoading && !isAdmin) {
       navigate("/");
       return;
     }
 
     if (isAdmin) {
       loadSummaries();
       logPageAccess();
     }
   }, [isAdmin, adminLoading, navigate]);
 
   const logPageAccess = async () => {
     await supabase.rpc('log_admin_page_access', { _page_path: '/admin/summary-audit' });
   };
 
   const loadSummaries = async () => {
     try {
       const { data, error } = await supabase.rpc('get_admin_summaries_metadata');
       if (error) throw error;
       setSummaries((data as SummaryMetadata[]) || []);
     } catch (err) {
       console.error('Failed to load summaries:', err);
       toast.error('Failed to load summary data');
     } finally {
       setLoading(false);
     }
   };
 
   const handleForceExpire = async () => {
     if (!selectedSummary) return;
     
     try {
       const { data, error } = await supabase.rpc('admin_force_expire_summary', {
         _summary_id: selectedSummary.summary_id
       });
       
       if (error) throw error;
       
       toast.success('Summary expired successfully');
       setExpireDialogOpen(false);
       setSelectedSummary(null);
       loadSummaries();
     } catch (err) {
       console.error('Failed to expire summary:', err);
       toast.error('Failed to expire summary');
     }
   };
 
   const handleDisableSaving = async () => {
     if (!selectedSummary || !disableReason.trim()) return;
     
     try {
       const { data, error } = await supabase.rpc('admin_disable_user_saving', {
         _user_id: selectedSummary.internal_user_id,
         _reason: disableReason
       });
       
       if (error) throw error;
       
       toast.success('User saving disabled');
       setDisableDialogOpen(false);
       setSelectedSummary(null);
       setDisableReason("");
     } catch (err) {
       console.error('Failed to disable saving:', err);
       toast.error('Failed to disable saving');
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case 'active':
         return <Badge variant="default" className="bg-green-500">Active</Badge>;
       case 'expiring_soon':
         return <Badge variant="secondary" className="bg-yellow-500 text-black">Expiring Soon</Badge>;
       case 'expired':
         return <Badge variant="destructive">Expired</Badge>;
       default:
         return <Badge variant="outline">{status}</Badge>;
     }
   };
 
   const filteredSummaries = summaries.filter(s => 
     s.user_id_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.summary_id.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   if (adminLoading || loading) {
     return (
       <div className="container mx-auto p-6 space-y-6">
         <Skeleton className="h-8 w-64" />
         <Skeleton className="h-[400px]" />
       </div>
     );
   }
 
   if (!isAdmin) return null;
 
   return (
     <div className="container mx-auto p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold">Summary Audit</h1>
         <Badge variant="outline">{summaries.length} Total Summaries</Badge>
       </div>
 
       <Card>
         <CardHeader className="pb-3">
           <CardTitle className="text-base flex items-center gap-2">
             <AlertTriangle className="h-4 w-4 text-muted-foreground" />
             Metadata Only — No Summary Content Displayed
           </CardTitle>
         </CardHeader>
       </Card>
 
       <div className="flex items-center gap-2">
         <div className="relative flex-1 max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             placeholder="Search by ID or hash..."
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
                 <TableHead>Summary ID</TableHead>
                 <TableHead>User Hash</TableHead>
                 <TableHead>Created</TableHead>
                 <TableHead>Renewed</TableHead>
                 <TableHead>Expires</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Chars</TableHead>
                 <TableHead>PII Flag</TableHead>
                 <TableHead>Consent</TableHead>
                 <TableHead>Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredSummaries.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                     No summaries found
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredSummaries.map((summary) => (
                   <TableRow key={summary.summary_id}>
                     <TableCell className="font-mono text-xs">
                       {summary.summary_id.slice(0, 8)}...
                     </TableCell>
                     <TableCell className="font-mono text-xs">
                       {summary.user_id_hash.slice(0, 12)}...
                     </TableCell>
                     <TableCell className="text-sm">
                       {format(new Date(summary.created_at), 'MMM d, yyyy')}
                     </TableCell>
                     <TableCell className="text-sm">
                       {summary.renewed_at 
                         ? format(new Date(summary.renewed_at), 'MMM d, yyyy')
                         : '—'
                       }
                     </TableCell>
                     <TableCell className="text-sm">
                       {format(new Date(summary.expires_at), 'MMM d, yyyy')}
                     </TableCell>
                     <TableCell>{getStatusBadge(summary.status)}</TableCell>
                     <TableCell>{summary.char_count ?? '—'}</TableCell>
                     <TableCell>
                       {summary.pii_flag ? (
                         <Badge variant="destructive">Yes</Badge>
                       ) : (
                         <span className="text-muted-foreground">No</span>
                       )}
                     </TableCell>
                     <TableCell>
                       {summary.consent_captured ? (
                         <Badge variant="outline" className="text-green-600">Yes</Badge>
                       ) : (
                         <span className="text-muted-foreground">No</span>
                       )}
                     </TableCell>
                     <TableCell>
                       <div className="flex gap-1">
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             setSelectedSummary(summary);
                             setExpireDialogOpen(true);
                           }}
                           disabled={summary.status === 'expired'}
                         >
                           <Clock className="h-4 w-4" />
                         </Button>
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => {
                             setSelectedSummary(summary);
                             setDisableDialogOpen(true);
                           }}
                         >
                           <Ban className="h-4 w-4" />
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
 
       {/* Force Expire Dialog */}
       <Dialog open={expireDialogOpen} onOpenChange={setExpireDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Force Expire Summary</DialogTitle>
             <DialogDescription>
               This will immediately expire the summary. This action cannot be undone.
             </DialogDescription>
           </DialogHeader>
           <div className="py-4">
             <p className="text-sm text-muted-foreground">
               Summary ID: <span className="font-mono">{selectedSummary?.summary_id}</span>
             </p>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setExpireDialogOpen(false)}>
               Cancel
             </Button>
             <Button variant="destructive" onClick={handleForceExpire}>
               Force Expire
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
 
       {/* Disable Saving Dialog */}
       <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Disable Saving for User</DialogTitle>
             <DialogDescription>
               This will prevent the user from saving any new summaries.
             </DialogDescription>
           </DialogHeader>
           <div className="py-4 space-y-4">
             <p className="text-sm text-muted-foreground">
               User Hash: <span className="font-mono">{selectedSummary?.user_id_hash.slice(0, 16)}...</span>
             </p>
             <Textarea
               placeholder="Reason for disabling (required)"
               value={disableReason}
               onChange={(e) => setDisableReason(e.target.value)}
             />
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDisableDialogOpen(false)}>
               Cancel
             </Button>
             <Button 
               variant="destructive" 
               onClick={handleDisableSaving}
               disabled={!disableReason.trim()}
             >
               Disable Saving
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 }