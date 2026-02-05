 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { GlobalHeader } from "@/components/GlobalHeader";
 import { AppFooter } from "@/components/AppFooter";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Trash2, Edit2, Eye, ArrowLeft, Save, X, Clock, RefreshCw, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from "@/components/ui/alert-dialog";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 
 interface PlanningSummary {
   id: string;
   title: string;
   summary_text: string;
   created_at: string;
   updated_at: string;
  expires_at: string;
  last_renewed_at: string | null;
 }
 
 export default function SavedSummaries() {
   const navigate = useNavigate();
   const { toast } = useToast();
   const [summaries, setSummaries] = useState<PlanningSummary[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [deleteId, setDeleteId] = useState<string | null>(null);
   const [viewSummary, setViewSummary] = useState<PlanningSummary | null>(null);
   const [editSummary, setEditSummary] = useState<PlanningSummary | null>(null);
   const [editText, setEditText] = useState("");
   const [isSaving, setIsSaving] = useState(false);
  const [renewSummary, setRenewSummary] = useState<PlanningSummary | null>(null);
  const [renewEditText, setRenewEditText] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);
 
   useEffect(() => {
     loadSummaries();
   }, []);
 
   const loadSummaries = async () => {
     try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
         navigate("/login");
         return;
       }
 
       const { data, error } = await supabase
         .from("planning_summaries")
         .select("*")
         .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
         .order("created_at", { ascending: false });
 
       if (error) throw error;
       setSummaries(data || []);
     } catch (error) {
       console.error("Error loading summaries:", error);
       toast({
         title: "Error",
         description: "Failed to load summaries.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   const handleDelete = async () => {
     if (!deleteId) return;
 
     try {
       const { error } = await supabase
         .from("planning_summaries")
         .delete()
         .eq("id", deleteId);
 
       if (error) throw error;
 
       setSummaries(prev => prev.filter(s => s.id !== deleteId));
       toast({
         title: "Summary deleted",
         description: "Your summary has been removed.",
       });
     } catch (error) {
       console.error("Error deleting summary:", error);
       toast({
         title: "Error",
         description: "Failed to delete summary.",
         variant: "destructive",
       });
     } finally {
       setDeleteId(null);
     }
   };
 
   const handleEdit = (summary: PlanningSummary) => {
     setEditSummary(summary);
     setEditText(summary.summary_text);
   };
 
   const handleSaveEdit = async () => {
     if (!editSummary || editText.length > 750) return;
 
     setIsSaving(true);
     try {
       const { error } = await supabase
         .from("planning_summaries")
         .update({ summary_text: editText })
         .eq("id", editSummary.id);
 
       if (error) throw error;
 
       setSummaries(prev =>
         prev.map(s =>
           s.id === editSummary.id ? { ...s, summary_text: editText } : s
         )
       );
       toast({
         title: "Summary updated",
         description: "Your changes have been saved.",
       });
       setEditSummary(null);
     } catch (error) {
       console.error("Error updating summary:", error);
       toast({
         title: "Error",
         description: "Failed to update summary.",
         variant: "destructive",
       });
     } finally {
       setIsSaving(false);
     }
   };
 
  const getDaysUntilExpiry = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (expiresAt: string) => {
    const days = getDaysUntilExpiry(expiresAt);
    if (days <= 0) return { status: "expired", label: "Expired", variant: "destructive" as const };
    if (days <= 14) return { status: "expiring", label: `Expires in ${days} day${days === 1 ? "" : "s"}`, variant: "secondary" as const };
    return { status: "active", label: `Expires in ${days} days`, variant: "outline" as const };
  };

  const handleRenew = (summary: PlanningSummary) => {
    setRenewSummary(summary);
    setRenewEditText(summary.summary_text);
  };

  const handleConfirmRenew = async () => {
    if (!renewSummary || renewEditText.length > 750) return;

    setIsRenewing(true);
    try {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 90);

      const { error } = await supabase
        .from("planning_summaries")
        .update({ 
          summary_text: renewEditText,
          expires_at: newExpiresAt.toISOString(),
          last_renewed_at: new Date().toISOString()
        })
        .eq("id", renewSummary.id);

      if (error) throw error;

      setSummaries(prev =>
        prev.map(s =>
          s.id === renewSummary.id 
            ? { ...s, summary_text: renewEditText, expires_at: newExpiresAt.toISOString(), last_renewed_at: new Date().toISOString() } 
            : s
        )
      );
      toast({
        title: "Summary renewed",
        description: "Your summary has been renewed for another 90 days.",
      });
      setRenewSummary(null);
    } catch (error) {
      console.error("Error renewing summary:", error);
      toast({
        title: "Error",
        description: "Failed to renew summary.",
        variant: "destructive",
      });
    } finally {
      setIsRenewing(false);
    }
  };

   const formatDate = (dateString: string) => {
     return new Date(dateString).toLocaleDateString("en-US", {
       year: "numeric",
       month: "long",
       day: "numeric",
     });
   };
 
   if (isLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin" />
       </div>
     );
   }
 
   return (
     <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
       <GlobalHeader />
 
       <main className="flex-1 container max-w-3xl mx-auto px-4 py-8">
         {/* Back button */}
         <Button
           variant="ghost"
           onClick={() => navigate(-1)}
           className="mb-6"
         >
           <ArrowLeft className="h-4 w-4 mr-2" />
           Back
         </Button>
 
         {/* Header */}
         <div className="space-y-2 mb-8">
           <h1 className="text-3xl font-serif font-bold">Your Saved Planning Summaries</h1>
           <p className="text-muted-foreground">
             These are short summaries you asked Claire to save. They do not include personal details.
           </p>
         </div>
 
         {/* Summary List or Empty State */}
         {summaries.length === 0 ? (
           <Card className="text-center py-12">
             <CardContent className="space-y-4">
               <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto" />
               <div className="space-y-2">
                 <p className="text-lg font-medium">No saved summaries yet</p>
                 <p className="text-muted-foreground">
                   You don't have any saved summaries yet. You can ask Claire to save one at any time.
                 </p>
               </div>
               <Button
                 variant="outline"
                 onClick={() => navigate("/care-support")}
                 className="mt-4"
               >
                 Talk to Claire
               </Button>
             </CardContent>
           </Card>
         ) : (
           <div className="space-y-4">
             {summaries.map((summary) => (
               <Card key={summary.id} className={getExpiryStatus(summary.expires_at).status === "expiring" ? "border-amber-500/50" : ""}>
                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div>
                       <div className="flex items-center gap-2 flex-wrap">
                         <CardTitle className="text-lg">{summary.title}</CardTitle>
                         {getExpiryStatus(summary.expires_at).status === "expiring" && (
                           <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 text-xs">
                             <AlertTriangle className="h-3 w-3 mr-1" />
                             {getExpiryStatus(summary.expires_at).label}
                           </Badge>
                         )}
                       </div>
                       <CardDescription>
                         Saved on {formatDate(summary.created_at)} • Expires {formatDate(summary.expires_at)}
                       </CardDescription>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   {getExpiryStatus(summary.expires_at).status === "expiring" && (
                     <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                       <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                       <div className="text-sm">
                         <p className="text-amber-800 dark:text-amber-300 font-medium">
                           This summary will expire soon. Would you like to keep it?
                         </p>
                         <Button
                           variant="link"
                           size="sm"
                           onClick={() => handleRenew(summary)}
                           className="h-auto p-0 text-amber-700 dark:text-amber-400 hover:text-amber-900"
                         >
                           <RefreshCw className="h-3 w-3 mr-1" />
                           Renew for 90 days
                         </Button>
                       </div>
                     </div>
                   )}
                   <p className="text-sm text-muted-foreground line-clamp-3">
                     {summary.summary_text}
                   </p>
                   <div className="flex flex-wrap gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setViewSummary(summary)}
                     >
                       <Eye className="h-4 w-4 mr-1" />
                       View
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleEdit(summary)}
                     >
                       <Edit2 className="h-4 w-4 mr-1" />
                       Edit
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => handleRenew(summary)}
                     >
                       <RefreshCw className="h-4 w-4 mr-1" />
                       Renew
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setDeleteId(summary.id)}
                       className="text-destructive hover:text-destructive"
                     >
                       <Trash2 className="h-4 w-4 mr-1" />
                       Delete
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
 
         {/* Privacy note */}
         <p className="text-xs text-muted-foreground/70 text-center mt-8">
           Summaries are stored for 90 days. Maximum 10 summaries, 750 characters each.
           No personal details are saved.
         </p>
       </main>
 
       <AppFooter />
 
       {/* View Dialog */}
       <Dialog open={!!viewSummary} onOpenChange={() => setViewSummary(null)}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle>{viewSummary?.title}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
               Saved on {viewSummary && formatDate(viewSummary.created_at)}
             </p>
             <p className="text-sm whitespace-pre-wrap">{viewSummary?.summary_text}</p>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Edit Dialog */}
       <Dialog open={!!editSummary} onOpenChange={() => setEditSummary(null)}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle>Edit Summary</DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Textarea
                 value={editText}
                 onChange={(e) => setEditText(e.target.value)}
                 className="min-h-[150px]"
                 maxLength={750}
               />
               <p className={`text-xs mt-1 ${editText.length > 750 ? "text-destructive" : "text-muted-foreground"}`}>
                 {editText.length}/750 characters
               </p>
             </div>
             <div className="flex gap-2 justify-end">
               <Button
                 variant="outline"
                 onClick={() => setEditSummary(null)}
               >
                 <X className="h-4 w-4 mr-1" />
                 Cancel
               </Button>
               <Button
                 onClick={handleSaveEdit}
                 disabled={isSaving || editText.length > 750 || !editText.trim()}
               >
                 {isSaving ? (
                   <Loader2 className="h-4 w-4 animate-spin mr-1" />
                 ) : (
                   <Save className="h-4 w-4 mr-1" />
                 )}
                 Save
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Delete Confirmation */}
       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Delete this summary?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. The summary will be permanently deleted.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction
               onClick={handleDelete}
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
             >
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       {/* Renew Confirmation Dialog */}
       <Dialog open={!!renewSummary} onOpenChange={() => setRenewSummary(null)}>
         <DialogContent className="max-w-lg">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <RefreshCw className="h-5 w-5" />
               Renew Summary
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
               I can keep this summary for another 90 days. I will not store personal details. Do you want to renew it?
             </p>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Edit before renewing (optional):</label>
               <Textarea
                 value={renewEditText}
                 onChange={(e) => setRenewEditText(e.target.value)}
                 className="min-h-[120px]"
                 maxLength={750}
               />
               <p className={`text-xs ${renewEditText.length > 750 ? "text-destructive" : "text-muted-foreground"}`}>
                 {renewEditText.length}/750 characters
               </p>
             </div>
             
             <div className="flex gap-2 justify-end">
               <Button
                 variant="outline"
                 onClick={() => setRenewSummary(null)}
               >
                 Cancel
               </Button>
               <Button
                 onClick={handleConfirmRenew}
                 disabled={isRenewing || renewEditText.length > 750 || !renewEditText.trim()}
               >
                 {isRenewing ? (
                   <Loader2 className="h-4 w-4 animate-spin mr-1" />
                 ) : (
                   <RefreshCw className="h-4 w-4 mr-1" />
                 )}
                 Renew for 90 days
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }