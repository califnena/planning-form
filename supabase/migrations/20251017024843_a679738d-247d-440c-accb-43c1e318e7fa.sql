-- Enable vector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- FAQs table for quick keyword answers
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Knowledge base articles for semantic search
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[],
  embedding vector(1536),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kb_articles_embedding_idx ON public.kb_articles 
USING ivfflat (embedding vector_cosine_ops);

-- Assistant conversations
CREATE TABLE IF NOT EXISTS public.assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'handoff')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Assistant messages
CREATE TABLE IF NOT EXISTS public.assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.assistant_conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant', 'system', 'note')) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- App guided tour steps
CREATE TABLE IF NOT EXISTS public.app_tour_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screen TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  selector TEXT,
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS app_tour_steps_screen_idx ON public.app_tour_steps(screen, step_order);

-- Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  channel TEXT DEFAULT 'native' CHECK (channel IN ('native', 'calcom', 'calendly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_tour_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for faqs (public read)
CREATE POLICY "Anyone can read FAQs" ON public.faqs
  FOR SELECT USING (true);

-- RLS Policies for kb_articles (public read)
CREATE POLICY "Anyone can read KB articles" ON public.kb_articles
  FOR SELECT USING (true);

-- RLS Policies for assistant_conversations
CREATE POLICY "Users can view their own conversations" ON public.assistant_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" ON public.assistant_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON public.assistant_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" ON public.assistant_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for assistant_messages
CREATE POLICY "Users can view messages in their conversations" ON public.assistant_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assistant_conversations
      WHERE id = assistant_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" ON public.assistant_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assistant_conversations
      WHERE id = assistant_messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for app_tour_steps (public read)
CREATE POLICY "Anyone can read tour steps" ON public.app_tour_steps
  FOR SELECT USING (true);

-- RLS Policies for appointments
CREATE POLICY "Users can view their own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" ON public.appointments
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at on conversations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assistant_conversations_updated_at
  BEFORE UPDATE ON public.assistant_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function for semantic search (placeholder)
CREATE OR REPLACE FUNCTION public.kb_semantic_search(query_text TEXT, match_count INT)
RETURNS TABLE (id UUID, title TEXT, snippet TEXT, similarity FLOAT) 
LANGUAGE plpgsql AS $$
BEGIN
  -- Simple fallback: return most recent articles
  -- In production, you'd generate embeddings and do cosine similarity
  RETURN QUERY
  SELECT 
    kb_articles.id, 
    kb_articles.title, 
    substr(kb_articles.body, 1, 280) as snippet,
    0.5::FLOAT as similarity
  FROM kb_articles
  ORDER BY updated_at DESC
  LIMIT match_count;
END $$;