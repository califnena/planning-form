-- Create song_orders table
CREATE TABLE public.song_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  payment_session_id TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('standard', 'premium')),
  request_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.song_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own song orders"
ON public.song_orders
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own song orders"
ON public.song_orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_song_orders_updated_at
BEFORE UPDATE ON public.song_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();