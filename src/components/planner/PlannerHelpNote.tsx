 import { Link } from "react-router-dom";
 import { HelpCircle } from "lucide-react";
 
 /**
  * PlannerHelpNote
  * 
  * A small helper note displayed on planning form pages to offer
 * guidance options: Claire (planning guidance, emotional support, after-death help) or human assistance.
  */
 export const PlannerHelpNote = () => {
   return (
     <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50 text-sm">
       <HelpCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
       <div className="space-y-1">
         <p className="text-muted-foreground leading-relaxed">
          Need help? Claire offers planning guidance, emotional support, and after-death help — available 24/7. Or a person can help you fill this out.
         </p>
         <div className="flex flex-wrap gap-x-4 gap-y-1">
           <Link 
             to="/vip-planning-support" 
             className="text-primary hover:underline font-medium"
           >
            Talk to Claire
           </Link>
           <Link 
             to="/assisted-planning" 
             className="text-primary hover:underline font-medium"
           >
             Do it for me
           </Link>
         </div>
       </div>
     </div>
   );
 };