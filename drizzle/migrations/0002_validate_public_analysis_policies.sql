CREATE FUNCTION public.is_valid_analysis_content(document_type text, verdict text, summary text, risky_clauses jsonb, questions jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  line text;
  item jsonb;
  lines text[];
BEGIN
  IF document_type IS NULL OR document_type NOT IN ('Rent agreement', 'Loan letter', 'Bank notice', 'Insurance policy', 'Hospital bill', 'Other document')
    OR verdict IS NULL OR verdict NOT IN ('green', 'yellow', 'red')
    OR summary IS NULL OR risky_clauses IS NULL OR questions IS NULL THEN
    RETURN false;
  END IF;
  lines := string_to_array(summary, E'\n');
  IF cardinality(lines) <> 5 THEN RETURN false; END IF;
  FOREACH line IN ARRAY lines LOOP
    IF char_length(btrim(line)) NOT BETWEEN 1 AND 2400 OR line !~ '[ऀ-ॿ]' THEN RETURN false; END IF;
  END LOOP;
  IF jsonb_typeof(risky_clauses) <> 'array' OR jsonb_typeof(questions) <> 'array' THEN RETURN false; END IF;
  IF jsonb_array_length(risky_clauses) > 15 OR jsonb_array_length(questions) <> 3 THEN RETURN false; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(risky_clauses) LOOP
    IF jsonb_typeof(item) <> 'object' THEN RETURN false; END IF;
    IF NOT (item ? 'clause_text' AND item ? 'explanation') OR (item - 'clause_text' - 'explanation') <> '{}'::jsonb THEN RETURN false; END IF;
    IF jsonb_typeof(item->'clause_text') <> 'string' OR jsonb_typeof(item->'explanation') <> 'string' THEN RETURN false; END IF;
    IF char_length(item->>'clause_text') NOT BETWEEN 1 AND 2400
      OR char_length(btrim(item->>'explanation')) NOT BETWEEN 1 AND 2400
      OR (item->>'explanation') !~ '[ऀ-ॿ]' THEN RETURN false; END IF;
  END LOOP;
  FOR item IN SELECT value FROM jsonb_array_elements(questions) LOOP
    IF jsonb_typeof(item) <> 'string' THEN RETURN false; END IF;
    line := item #>> '{}';
    IF char_length(btrim(line)) NOT BETWEEN 1 AND 2400 OR line !~ '[ऀ-ॿ]' THEN RETURN false; END IF;
  END LOOP;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.is_valid_analysis_content(text, text, text, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_valid_analysis_content(text, text, text, jsonb, jsonb) TO anon, authenticated, service_role;
ALTER POLICY "Anyone can insert analyses" ON public.analyses
  WITH CHECK (public.is_valid_analysis_content(document_type, verdict, summary, risky_clauses, questions));
ALTER POLICY "Anyone can read analyses" ON public.analyses
  USING (public.is_valid_analysis_content(document_type, verdict, summary, risky_clauses, questions));