
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');
CREATE TYPE public.post_status AS ENUM ('draft', 'published', 'archived');

-- Helper function: updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor'));
$$;

CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Tags
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tags public read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Staff manage tags" ON public.tags FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Blog posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status public.post_status NOT NULL DEFAULT 'draft',
  seo_title TEXT,
  seo_description TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  reading_time INTEGER NOT NULL DEFAULT 1,
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_status_published ON public.blog_posts(status, published_at DESC);
CREATE INDEX idx_posts_category ON public.blog_posts(category_id);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts public read published" ON public.blog_posts FOR SELECT USING (
  status = 'published' AND published_at IS NOT NULL AND published_at <= now()
);
CREATE POLICY "Staff read all posts" ON public.blog_posts FOR SELECT USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff insert posts" ON public.blog_posts FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff update posts" ON public.blog_posts FOR UPDATE USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete posts" ON public.blog_posts FOR DELETE USING (public.has_role(auth.uid(),'admin') OR public.is_staff(auth.uid()));
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Post tags
CREATE TABLE public.post_tags (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Post tags public read" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Staff manage post tags" ON public.post_tags FOR ALL USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Post views
CREATE TABLE public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  session_hash TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_post_views_post ON public.post_views(post_id, viewed_at DESC);
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register a view" ON public.post_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Staff read views" ON public.post_views FOR SELECT USING (public.is_staff(auth.uid()));

-- Increment views function
CREATE OR REPLACE FUNCTION public.increment_post_view(_slug TEXT, _session_hash TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _post_id UUID;
  _recent BOOLEAN;
BEGIN
  SELECT id INTO _post_id FROM public.blog_posts
    WHERE slug = _slug AND status='published' AND published_at <= now();
  IF _post_id IS NULL THEN RETURN; END IF;
  SELECT EXISTS(
    SELECT 1 FROM public.post_views
    WHERE post_id = _post_id AND session_hash = _session_hash AND viewed_at > now() - interval '1 hour'
  ) INTO _recent;
  IF _recent THEN RETURN; END IF;
  INSERT INTO public.post_views(post_id, session_hash) VALUES(_post_id, _session_hash);
  UPDATE public.blog_posts SET views = views + 1 WHERE id = _post_id;
END; $$;

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('blog-media','blog-media', true);

CREATE POLICY "Blog media public read" ON storage.objects FOR SELECT USING (bucket_id = 'blog-media');
CREATE POLICY "Staff upload blog media" ON storage.objects FOR INSERT WITH CHECK (bucket_id='blog-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update blog media" ON storage.objects FOR UPDATE USING (bucket_id='blog-media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete blog media" ON storage.objects FOR DELETE USING (bucket_id='blog-media' AND public.is_staff(auth.uid()));

-- Seed categories
INSERT INTO public.categories (name, slug, description) VALUES
  ('Estratégia', 'estrategia', 'Planejamento estratégico e gestão'),
  ('Tecnologia', 'tecnologia', 'Inovação e ferramentas digitais'),
  ('Gestão', 'gestao', 'Liderança e processos'),
  ('Cases', 'cases', 'Histórias e estudos de caso');
