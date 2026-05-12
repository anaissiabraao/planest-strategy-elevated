import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Copy, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Row { id: string; title: string; slug: string; status: string; views: number; updated_at: string; }

export default function PostsList() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    const { data } = await supabase.from("blog_posts").select("id,title,slug,status,views,updated_at").order("updated_at", { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Excluir este post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Post excluído" });
    load();
  }

  async function duplicate(id: string) {
    const { data: p } = await supabase.from("blog_posts").select("*").eq("id", id).single();
    if (!p) return;
    const { id: _, created_at, updated_at, published_at, views, slug, title, ...rest } = p as any;
    const newSlug = `${slug}-copia-${Date.now().toString(36)}`;
    const { error } = await supabase.from("blog_posts").insert({
      ...rest, slug: newSlug, title: `${title} (cópia)`, status: "draft", published_at: null, views: 0,
    });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    toast({ title: "Post duplicado" });
    load();
  }

  const filtered = (rows ?? []).filter((r) => r.title.toLowerCase().includes(q.toLowerCase()));

  const statusBadge = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      published: { label: "Publicado", cls: "bg-green-500/15 text-green-500 border-green-500/30" },
      draft: { label: "Rascunho", cls: "bg-amber-500/15 text-amber-500 border-amber-500/30" },
      archived: { label: "Arquivado", cls: "bg-muted text-muted-foreground" },
    };
    const m = map[s] ?? map.draft;
    return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Posts</h1>
          <p className="text-muted-foreground">{rows?.length ?? "…"} no total</p>
        </div>
        <Button asChild variant="cta" className="rounded-full"><Link to="/admin/posts/novo"><Plus className="h-4 w-4" /> Novo post</Link></Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título…" className="pl-9" />
      </div>

      <Card>
        {!rows && <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>}
        {rows && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">Nenhum post encontrado.</div>
        )}
        {rows && filtered.length > 0 && (
          <ul className="divide-y">
            {filtered.map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                <div className="min-w-0 flex-1">
                  <Link to={`/admin/posts/${r.id}/editar`} className="font-medium hover:underline truncate block">{r.title}</Link>
                  <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                    {statusBadge(r.status)}
                    <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{r.views}</span>
                    <span>{new Date(r.updated_at).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" asChild><Link to={`/admin/posts/${r.id}/editar`}><Pencil className="h-4 w-4" /></Link></Button>
                  <Button size="icon" variant="ghost" onClick={() => duplicate(r.id)}><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}