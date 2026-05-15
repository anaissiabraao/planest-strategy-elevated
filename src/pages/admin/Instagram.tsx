import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Plus, Calendar as CalendarIcon, Loader2, Send } from "lucide-react";
import { format } from "date-fns";

type Status = "idea" | "scheduled" | "published" | "failed";
type Pillar = "educacional" | "case" | "prova_social" | "cta" | "bastidores";
type Post = {
  id: string; caption: string; hashtags: string | null; media_url: string | null;
  pillar: Pillar; goal_metric: string | null; status: Status; scheduled_for: string | null;
  published_at: string | null; ai_generated: boolean; error_message: string | null;
};

const PILLARS: Pillar[] = ["educacional", "case", "prova_social", "cta", "bastidores"];
const STATUS_COLOR: Record<Status, string> = {
  idea: "bg-muted text-foreground", scheduled: "bg-primary/15 text-primary",
  published: "bg-emerald-500/15 text-emerald-600", failed: "bg-destructive/15 text-destructive",
};

export default function Instagram() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Post | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("instagram_posts").select("*").order("scheduled_for", { ascending: true, nullsFirst: false });
    setPosts((data as any) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function generate() {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-strategist`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ days: 7 }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha");
      toast.success(`${json.created} posts gerados`);
      load();
    } catch (e) { toast.error(String((e as Error).message)); }
    finally { setBusy(false); }
  }

  async function newPost() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase.from("instagram_posts").insert({ caption: "Novo post", pillar: "educacional", status: "idea" } as any).select().single();
    if (error) return toast.error(error.message);
    setActive(data as any);
    load();
  }

  async function save(p: Post) {
    const { error } = await supabase.from("instagram_posts").update({
      caption: p.caption, hashtags: p.hashtags, media_url: p.media_url, pillar: p.pillar,
      goal_metric: p.goal_metric, status: p.status, scheduled_for: p.scheduled_for,
    }).eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    load();
  }

  async function publishNow(p: Post) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify({ post_id: p.id }),
    });
    const json = await res.json();
    if (!res.ok) return toast.error(json.error || "Falha. Configure as credenciais Meta primeiro.");
    const r = json.results?.[0];
    if (r?.ok) toast.success("Publicado!"); else toast.error(r?.error || "Falha ao publicar");
    load();
    setActive(null);
  }

  async function remove(id: string) {
    if (!confirm("Excluir este post?")) return;
    await supabase.from("instagram_posts").delete().eq("id", id);
    setActive(null); load();
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold">Instagram</h1>
          <p className="text-sm text-muted-foreground">Plano de conteúdo focado em conversão</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={newPost}><Plus className="h-4 w-4" /> Novo post</Button>
          <Button variant="cta" onClick={generate} disabled={busy}>
            <Sparkles className="h-4 w-4" /> {busy ? "Gerando..." : "Gerar plano semanal com IA"}
          </Button>
        </div>
      </div>

      {posts.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">Nenhum post ainda. Gere um plano com IA para começar.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(p => (
            <Card key={p.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActive(p)}>
              <div className="flex items-center justify-between mb-2">
                <Badge className={STATUS_COLOR[p.status]}>{p.status}</Badge>
                <Badge variant="outline" className="text-[10px]">{p.pillar}</Badge>
              </div>
              {p.scheduled_for && (
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" /> {format(new Date(p.scheduled_for), "dd/MM HH:mm")}
                </p>
              )}
              <p className="text-sm line-clamp-4 whitespace-pre-wrap">{p.caption}</p>
              {p.ai_generated && <Badge variant="secondary" className="text-[10px] mt-2"><Sparkles className="h-2.5 w-2.5" /> IA</Badge>}
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {active && (
            <>
              <SheetHeader><SheetTitle>Post Instagram</SheetTitle></SheetHeader>
              <div className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Status</label>
                    <Select value={active.status} onValueChange={(v) => setActive({ ...active, status: v as Status })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Ideia</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Pilar</label>
                    <Select value={active.pillar} onValueChange={(v) => setActive({ ...active, pillar: v as Pillar })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PILLARS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Agendar para</label>
                  <Input type="datetime-local" value={active.scheduled_for ? active.scheduled_for.slice(0, 16) : ""} onChange={(e) => setActive({ ...active, scheduled_for: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">URL da imagem</label>
                  <Input value={active.media_url || ""} onChange={(e) => setActive({ ...active, media_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Legenda</label>
                  <Textarea value={active.caption} onChange={(e) => setActive({ ...active, caption: e.target.value })} rows={8} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Hashtags</label>
                  <Textarea value={active.hashtags || ""} onChange={(e) => setActive({ ...active, hashtags: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Métrica-meta</label>
                  <Input value={active.goal_metric || ""} onChange={(e) => setActive({ ...active, goal_metric: e.target.value })} />
                </div>
                {active.error_message && <p className="text-xs text-destructive">⚠ {active.error_message}</p>}
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Button onClick={() => save(active)}>Salvar</Button>
                  <Button variant="cta" onClick={() => publishNow(active)}><Send className="h-4 w-4" /> Publicar agora</Button>
                  <Button variant="outline" className="text-destructive" onClick={() => remove(active.id)}>Excluir</Button>
                </div>
                <p className="text-[11px] text-muted-foreground pt-2">
                  Publicação real exige secrets <code>IG_ACCESS_TOKEN</code> e <code>IG_BUSINESS_ID</code> configurados (Instagram Business + Facebook Page + token Meta).
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}