 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Printer, Loader2 } from "lucide-react";
import { PRODUCT_DESCRIPTIONS } from "@/lib/productDescriptions";
 
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
            {PRODUCT_DESCRIPTIONS.EFABASIC.shortDescription}
            <br />
            <span className="text-sm">You'll be able to download it and print as many copies as you need.</span>
           </DialogDescription>
         </DialogHeader>
 
         <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
          {PRODUCT_DESCRIPTIONS.EFABASIC.benefits.map((benefit, idx) => (
            <p key={idx} className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              <span>{benefit}</span>
            </p>
          ))}
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