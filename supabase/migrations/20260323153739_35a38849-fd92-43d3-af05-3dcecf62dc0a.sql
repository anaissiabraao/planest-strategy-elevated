
CREATE TABLE public.lead_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  name text,
  email text,
  phone text,
  role text,
  company_size text,
  pain_points text[],
  current_tools text,
  strategic_planning_frequency text,
  biggest_challenge text
);

ALTER TABLE public.lead_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert lead responses"
  ON public.lead_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
