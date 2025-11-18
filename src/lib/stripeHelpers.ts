import { supabase } from "@/integrations/supabase/client";
import { STRIPE_LOOKUP_KEYS } from "./stripeLookupKeys";

export interface StripeProduct {
  id: string;
  name: string;
  description: string;
  images: string[];
  priceId: string;
  amount: number;
  currency: string;
  interval?: string;
  intervalCount?: number;
}

export async function fetchProductByLookupKey(
  lookupKey: string
): Promise<StripeProduct | null> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stripe-product', {
      body: { lookupKey },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching Stripe product:', error);
    return null;
  }
}

export async function fetchAllProducts(): Promise<Record<string, StripeProduct>> {
  const products: Record<string, StripeProduct> = {};
  
  const lookupKeys = Object.values(STRIPE_LOOKUP_KEYS);
  
  for (const lookupKey of lookupKeys) {
    const product = await fetchProductByLookupKey(lookupKey);
    if (product) {
      products[lookupKey] = product;
    }
  }
  
  return products;
}

export function formatPrice(amount: number, currency: string, interval?: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);

  if (interval) {
    return `${formatted} / ${interval}`;
  }
  
  return formatted;
}
