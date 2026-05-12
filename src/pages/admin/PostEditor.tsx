import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import TipTapEditor from "@/components/admin/TipTapEditor";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Eye, Loader2 } from "lucide-react";
import { slugify, readingTimeFromHtml, excerptFromHtml } from "@/lib/slugify";
import { toast } from "@/hooks/use-toast";

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; slug: string; }

interface FormState {
  title: string;
  slug: string;
  subtitle: string;
  content: string;
  excerpt: string;
  thumbnail_url: string | null;
  banner_url: string | null;
  category_id: string | null;
  status: "draft" | "published" | "archived";
  seo_title: string;
  seo_description: string;
  featured: boolean;
  scheduled_for: string | null;
  tagsInput: string;
}

const empty: FormState = {
  title: "", slug: "", subtitle: "", content: "", excerpt: "",
  thumbnail_url: null, banner_url: null, category_id: null,
  status: "draft", seo_title: "", seo_description: "",
  featured: false, scheduled_for: null, tagsInput: "",
};

export default function PostEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const slugTouched = useRef(false);

  useEffect(() => {
    supabase.from("categories").select("id,name").order("name").then(({ data }) => setCategories(data ?? []));
    if (id) {
      (async () => {
        const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single();
        if (post) {
          const { data: pt } = await supabase.from("post_tags").select("tags(name)").eq("post_id", id);
          const tagNames = (pt ?? []).map((r: any) => r.tags?.name).filter(Boolean).join(", ");
          setForm({
            title: post.title, slug: post.slug, subtitle: post.subtitle ?? "",
            content: post.content ?? "", excerpt: post.excerpt ?? "",
            thumbnail_url: post.thumbnail_url, banner_url: post.banner_url,
            category_id: post.category_id, status: post.status,
            seo_title: post.seo_title ?? "", seo_description: post.seo_description ?? "",
            featured: post.featured, scheduled_for: post.scheduled_for,
            tagsInput: tagNames,
          });
          slugTouched.current = true;
        }
        setLoading(false);
      })();
    }
  }, [id]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  useEffect(() => {
    if (!slugTouched.current && form.title) {
      setForm((f) => ({ ...f, slug: slugify(f.title) }));
    }
  }, [form.title]);

  async function save(publishNow = false) {
    if (!form.title.trim()) return toast({ title: "Título obrigatório", variant: "destructive" });
    if (!user) return;
    setSaving(true);
    const status = publishNow ? "published" : form.status;
    const reading_time = readingTimeFromHtml(form.content);
    const excerpt = form.excerpt || excerptFromHtml(form.content);
    const payload = {
      title: form.title.trim(),
      slug: (form.slug || slugify(form.title)).trim(),
      subtitle: form.subtitle || null,
      content: form.content,
      excerpt,
      thumbnail_url: form.thumbnail_url,
      banner_url: form.banner_url,
      author_id: user.id,
      category_id: form.category_id,
      status,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      featured: form.featured,
      scheduled_for: form.scheduled_for,
      reading_time,
      published_at: status === "published" ? new Date().toISOString() : null,
    };
    let postId = id;
    if (id) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
      if (error) { setSaving(false); return toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); }
    } else {
      const { data, error } = await supabase.from("blog_posts").insert(payload).select("id").single();
      if (error) { setSaving(false); return toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }); }
      postId = data.id;
    }
    // tags
    const tagNames = form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (postId) {
      await supabase.from("post_tags").delete().eq("post_id", postId);
      for (const name of tagNames) {
        const slug = slugify(name);
        let { data: tag } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();
        if (!tag) {
          const { data: created } = await supabase.from("tags").insert({ name, slug }).select("id").single();
          tag = created;
        }
        if (tag) await supabase.from("post_tags").insert({ post_id: postId, tag_id: tag.id });
      }
    }
    setSaving(false);
    toast({ title: publishNow ? "Publicado!" : "Salvo" });
    if (!id && postId) nav(`/admin/posts/${postId}/editar`, { replace: true });
  }

  // autosave drafts
  useEffect(() => {
    if (!id || form.status !== "draft") return;
    const t = setTimeout(() => { void save(false); }, 30000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.content, form.title]);

  const previewHtml = useMemo(() => form.content, [form.content]);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" asChild><Link to="/admin/posts"><ArrowLeft className="h-4 w-4" /> Voltar</Link></Button>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-4 w-4" /> {preview ? "Editar" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => save(false)} disabled={saving}>
            <Save className="h-4 w-4" /> Salvar rascunho
          </Button>
          <Button variant="cta" size="sm" onClick={() => save(true)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4 min-w-0">
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Título do post"
            className="text-2xl md:text-3xl font-bold h-auto py-3 border-0 px-0 shadow-none focus-visible:ring-0"
          />
          <Input
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="Subtítulo (opcional)"
            className="text-lg text-muted-foreground border-0 px-0 shadow-none focus-visible:ring-0"
          />
          {preview ? (
            <article className="prose prose-invert max-w-none border rounded-lg p-6 bg-background min-h-[400px]"
              dangerouslySetInnerHTML={{ __html: previewHtml || "<p><em>Nada ainda.</em></p>" }} />
          ) : (
            <TipTapEditor value={form.content} onChange={(html) => update("content", html)} />
          )}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Publicação</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => update("status", v as FormState["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Destacar</Label>
                <Switch id="featured" checked={form.featured} onCheckedChange={(c) => update("featured", c)} />
              </div>
              <div>
                <Label>Agendar para</Label>
                <Input type="datetime-local" value={form.scheduled_for ?? ""} onChange={(e) => update("scheduled_for", e.target.value || null)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Organização</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => { slugTouched.current = true; update("slug", slugify(e.target.value)); }} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.category_id ?? "none"} onValueChange={(v) => update("category_id", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags (vírgula)</Label>
                <Input value={form.tagsInput} onChange={(e) => update("tagsInput", e.target.value)} placeholder="estratégia, gestão" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Capas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ImageUploadField label="Thumbnail" value={form.thumbnail_url} onChange={(u) => update("thumbnail_url", u)} />
              <ImageUploadField label="Banner" value={form.banner_url} onChange={(u) => update("banner_url", u)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">SEO</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={form.seo_title} maxLength={70} onChange={(e) => update("seo_title", e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.seo_description} maxLength={170} rows={3} onChange={(e) => update("seo_description", e.target.value)} />
              </div>
              <div>
                <Label>Resumo (excerpt)</Label>
                <Textarea value={form.excerpt} rows={2} onChange={(e) => update("excerpt", e.target.value)} placeholder="Auto se vazio" />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}