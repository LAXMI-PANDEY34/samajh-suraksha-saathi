REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.analyses FROM anon, authenticated;
GRANT SELECT, INSERT ON public.analyses TO anon, authenticated;