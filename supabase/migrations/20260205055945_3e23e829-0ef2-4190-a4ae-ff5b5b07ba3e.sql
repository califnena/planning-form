-- Create planning_summaries table for Claire saved summaries
CREATE TABLE public.planning_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  summary_text TEXT NOT NULL CHECK (char_length(summary_text) <= 750),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.planning_summaries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access only
CREATE POLICY "Users can view their own summaries" 
ON public.planning_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own summaries" 
ON public.planning_summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" 
ON public.planning_summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" 
ON public.planning_summaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to enforce max 10 summaries per user
CREATE OR REPLACE FUNCTION public.check_summary_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.planning_summaries WHERE user_id = NEW.user_id) >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 summaries per user allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for limit enforcement
CREATE TRIGGER enforce_summary_limit
BEFORE INSERT ON public.planning_summaries
FOR EACH ROW
EXECUTE FUNCTION public.check_summary_limit();

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planning_summaries_updated_at
BEFORE UPDATE ON public.planning_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();