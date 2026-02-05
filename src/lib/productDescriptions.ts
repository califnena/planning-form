 /**
  * Centralized product descriptions for consistent user-facing language.
  * 
  * IMPORTANT: When EFABASIC or EFAPREMIUM is referenced in UI, use these exact descriptions.
  * Do not show pricing tables or comparisons unless the user initiates purchase.
  */
 
 export const PRODUCT_DESCRIPTIONS = {
   EFABASIC: {
     name: "Printable Planning Form",
     shortDescription: "Includes the printable planning form you can download and print.",
     benefits: [
       "Fill out by hand at your own pace",
       "No computer needed after printing",
       "Print unlimited copies for your family"
     ]
   },
   EFAPREMIUM: {
     name: "Digital Planner",
     shortDescription: "Includes full access to the Digital Planner to type, save, and update your wishes.",
     benefits: [
       "Interactive digital planner",
       "Step-by-step or explore-freely option",
       "Save progress automatically",
       "Download your plan as a PDF",
       "Access from any device"
     ]
   },
   EFABINDER: {
     name: "Planning Binder",
     shortDescription: "Keep your printed wishes safe and organized in one secure place.",
     benefits: [
       "Printed planner pages",
       "Organized binder",
       "Shipped to your home"
     ]
   },
   EFAVIPMONTHLY: {
     name: "VIP Planning Support",
     shortDescription: "Personal guidance and priority support for your planning journey.",
     benefits: []
   },
   EFAVIPYEAR: {
     name: "VIP Planning Support",
     shortDescription: "Personal guidance and priority support for your planning journey.",
     benefits: []
   },
   EFADOFORU: {
     name: "Do-It-For-You Service",
     shortDescription: "We help you complete your plan with personalized support.",
     benefits: []
   }
 } as const;
 
 export type ProductKey = keyof typeof PRODUCT_DESCRIPTIONS;
 
 /**
  * Get the user-friendly product name from lookup key
  */
 export function getProductName(lookupKey: string): string {
   const product = PRODUCT_DESCRIPTIONS[lookupKey as ProductKey];
   return product?.name || lookupKey;
 }
 
 /**
  * Get the short description for a product
  */
 export function getProductDescription(lookupKey: string): string {
   const product = PRODUCT_DESCRIPTIONS[lookupKey as ProductKey];
   return product?.shortDescription || "";
 }
 
 /**
  * Get the benefits list for a product
  */
 export function getProductBenefits(lookupKey: string): string[] {
   const product = PRODUCT_DESCRIPTIONS[lookupKey as ProductKey];
  return product?.benefits ? [...product.benefits] : [];
 }