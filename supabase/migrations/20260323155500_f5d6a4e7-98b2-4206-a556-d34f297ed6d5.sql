DROP POLICY IF EXISTS "Anyone can insert lead responses" ON public.lead_responses;

CREATE POLICY "Public can insert lead responses with valid data"
ON public.lead_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL AND email <> '' AND
  name IS NOT NULL AND name <> ''
);
