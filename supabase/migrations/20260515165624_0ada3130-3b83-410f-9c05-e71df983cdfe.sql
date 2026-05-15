
-- Enums
CREATE TYPE public.lead_status AS ENUM ('novo','contato','qualificado','proposta','fechado','perdido');
CREATE TYPE public.lead_source AS ENUM ('section_inline','modal_exit','whatsapp_form','blog','outro');
CREATE TYPE public.ig_post_status AS ENUM ('idea','scheduled','published','failed');
CREATE TYPE public.ig_pillar AS ENUM ('educacional','case','prova_social','cta','bastidores');

-- page_views
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path TEXT NOT NULL,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  country TEXT,
  user_agent TEXT,
  session_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_path ON public.page_views(path);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register a page view" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read page views" ON public.page_views FOR SELECT USING (public.is_staff(auth.uid()));

-- leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  source public.lead_source NOT NULL DEFAULT 'section_inline',
  status public.lead_status NOT NULL DEFAULT 'novo',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  page TEXT,
  ai_score INTEGER,
  ai_intent TEXT,
  ai_next_action TEXT,
  ai_suggested_message TEXT,
  ai_objectives JSONB,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can insert leads" ON public.leads FOR INSERT WITH CHECK (
  name IS NOT NULL AND name <> '' AND phone IS NOT NULL AND phone <> ''
);
CREATE POLICY "Staff read leads" ON public.leads FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update leads" ON public.leads FOR UPDATE USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete leads" ON public.leads FOR DELETE USING (public.is_staff(auth.uid()));
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- lead_notes
CREATE TABLE public.lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_id UUID,
  kind TEXT NOT NULL DEFAULT 'note', -- note | ai
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lead_notes_lead ON public.lead_notes(lead_id, created_at DESC);
ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage lead notes" ON public.lead_notes FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- instagram_posts
CREATE TABLE public.instagram_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caption TEXT NOT NULL,
  hashtags TEXT,
  media_url TEXT,
  pillar public.ig_pillar NOT NULL DEFAULT 'educacional',
  goal_metric TEXT,
  status public.ig_post_status NOT NULL DEFAULT 'idea',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  ig_media_id TEXT,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ig_posts_scheduled ON public.instagram_posts(scheduled_for);
CREATE INDEX idx_ig_posts_status ON public.instagram_posts(status);
ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage ig posts" ON public.instagram_posts FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER ig_posts_updated_at BEFORE UPDATE ON public.instagram_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
