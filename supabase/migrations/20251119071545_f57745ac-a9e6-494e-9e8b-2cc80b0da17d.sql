-- Create purchases table for one-time product purchases
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_lookup_key TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'completed',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for purchases
CREATE POLICY "Users can view their own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Create index for faster lookups
CREATE INDEX idx_purchases_user_product ON public.purchases(user_id, product_lookup_key);
CREATE INDEX idx_purchases_stripe_payment ON public.purchases(stripe_payment_intent_id);