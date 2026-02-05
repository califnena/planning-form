 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Printer, Loader2 } from "lucide-react";
 
 interface PrintableFormModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onUnlock: () => void;
   isLoading?: boolean;
 }
 
 /**
  * Modal shown when users click "Get Printable Planning Form" without access.
  * Explains the printable form benefit and provides unlock action.
  */
 export function PrintableFormModal({ open, onOpenChange, onUnlock, isLoading }: PrintableFormModalProps) {
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
             <Printer className="h-7 w-7 text-primary" />
           </div>
           <DialogTitle className="text-center text-xl">Printable Planning Form</DialogTitle>
           <DialogDescription className="text-center text-base leading-relaxed">
             This printable form is included with your purchase.
             You'll be able to download it and print as many copies as you need.
           </DialogDescription>
         </DialogHeader>
 
         <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
           <p className="flex items-start gap-2">
             <span className="text-primary">✓</span>
             <span>Fill out by hand at your own pace</span>
           </p>
           <p className="flex items-start gap-2">
             <span className="text-primary">✓</span>
             <span>No computer needed after printing</span>
           </p>
           <p className="flex items-start gap-2">
             <span className="text-primary">✓</span>
             <span>Print unlimited copies for your family</span>
           </p>
         </div>
 
         <DialogFooter className="flex flex-col gap-2 sm:flex-col">
           <Button 
             onClick={onUnlock} 
             className="w-full min-h-[48px]"
             disabled={isLoading}
           >
             {isLoading ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Loading...
               </>
             ) : (
               "Unlock Printable Form"
             )}
           </Button>
           <Button 
             variant="ghost" 
             onClick={() => onOpenChange(false)}
             className="w-full"
           >
             Maybe Later
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }