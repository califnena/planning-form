-- Fix search_path for kb_semantic_search function
CREATE OR REPLACE FUNCTION public.kb_semantic_search(query_text text, match_count integer)
RETURNS TABLE(id uuid, title text, snippet text, similarity double precision)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $function$
BEGIN
  -- Simple fallback: return most recent articles
  -- In production, you'd generate embeddings and do cosine similarity
  RETURN QUERY
  SELECT 
    kb_articles.id, 
    kb_articles.title, 
    substr(kb_articles.body, 1, 280) as snippet,
    0.5::FLOAT as similarity
  FROM public.kb_articles
  ORDER BY updated_at DESC
  LIMIT match_count;
END $function$;

-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;