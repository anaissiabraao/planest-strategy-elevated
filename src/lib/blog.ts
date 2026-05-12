import { supabase } from "@/integrations/supabase/client";

export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  excerpt: string | null;
  thumbnail_url: string | null;
  banner_url: string | null;
  published_at: string | null;
  reading_time: number;
  views: number;
  featured: boolean;
  category_id: string | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string | null; avatar_url: string | null } | null;
}

const SELECT_LIST =
  "id,title,slug,subtitle,excerpt,thumbnail_url,banner_url,published_at,reading_time,views,featured,category_id,category:categories(name,slug),author:profiles(name,avatar_url)";

export async function fetchPublishedPosts(): Promise<PostListItem[]> {
  const { data } = await supabase
    .from("blog_posts")
    .select(SELECT_LIST)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  return (data ?? []) as unknown as PostListItem[];
}

export async function fetchPostBySlug(slug: string) {
  const { data } = await supabase
    .from("blog_posts")
    .select(`${SELECT_LIST},content,seo_title,seo_description,tags:post_tags(tag:tags(name,slug))`)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  return data;
}

export async function registerView(slug: string) {
  const sessionHash = (() => {
    const k = "planest_session";
    let v = localStorage.getItem(k);
    if (!v) { v = crypto.randomUUID(); localStorage.setItem(k, v); }
    return v;
  })();
  await supabase.rpc("increment_post_view", { _slug: slug, _session_hash: sessionHash });
}