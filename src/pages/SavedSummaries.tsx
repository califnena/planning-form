 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import { GlobalHeader } from "@/components/GlobalHeader";
 import { AppFooter } from "@/components/AppFooter";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { useToast } from "@/hooks/use-toast";
 import { Loader2, FileText, Trash2, Edit2, Eye, ArrowLeft, Save, X } from "lucide-react";
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
               <Card key={summary.id}>
                 <CardHeader className="pb-3">
                   <div className="flex items-start justify-between">
                     <div>
                       <CardTitle className="text-lg">{summary.title}</CardTitle>
                       <CardDescription>
                         Saved on {formatDate(summary.created_at)}
                       </CardDescription>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
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
     </div>
   );
 }