import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PRODUCT_DESCRIPTIONS } from "@/lib/productDescriptions";

interface PrintableFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Modal shown when users click "Get Printable Planning Form" without access.
 * Routes directly to one-page checkout at /printable-form.
 */
export function PrintableFormModal({ open, onOpenChange }: PrintableFormModalProps) {
  const navigate = useNavigate();

  const handleUnlock = () => {
    onOpenChange(false);
    navigate("/printable-form");
  };

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
            onClick={handleUnlock} 
            className="w-full min-h-[48px]"
          >
            Get Printable Form
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