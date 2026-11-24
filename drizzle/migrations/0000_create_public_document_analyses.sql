CREATE TABLE public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  document_type text NOT NULL CHECK (char_length(document_type) BETWEEN 1 AND 100),
  verdict text NOT NULL CHECK (verdict IN ('green', 'yellow', 'red')),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 1 AND 12000),
  risky_clauses jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(risky_clauses) = 'array'),
  questions jsonb NOT NULL CHECK (jsonb_typeof(questions) = 'array' AND jsonb_array_length(questions) = 3)
);
GRANT SELECT, INSERT ON public.analyses TO anon, authenticated;
GRANT ALL ON public.analyses TO service_role;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read analyses" ON public.analyses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert analyses" ON public.analyses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX analyses_created_at_idx ON public.analyses (created_at DESC);