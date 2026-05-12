import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, FileEdit, CheckCircle2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  total: number;
  published: number;
  drafts: number;
  views: number;
  topPosts: { id: string; title: string; views: number; slug: string }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const [{ count: total }, { count: published }, { count: drafts }, { data: posts }] = await Promise.all([
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("blog_posts").select("id,title,slug,views").order("views", { ascending: false }).limit(5),
      ]);
      const views = (posts ?? []).reduce((s, p) => s + (p.views ?? 0), 0);
      setStats({
        total: total ?? 0,
        published: published ?? 0,
        drafts: drafts ?? 0,
        views,
        topPosts: posts ?? [],
      });
    })();
  }, []);

  const cards = [
    { label: "Total de posts", value: stats?.total, icon: FileText, color: "text-primary" },
    { label: "Publicados", value: stats?.published, icon: CheckCircle2, color: "text-green-500" },
    { label: "Rascunhos", value: stats?.drafts, icon: FileEdit, color: "text-amber-500" },
    { label: "Visualizações (top 5)", value: stats?.views, icon: Eye, color: "text-accent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do conteúdo do blog</p>
        </div>
        <Button asChild variant="cta" className="rounded-full">
          <Link to="/admin/posts/novo"><Plus className="h-4 w-4" /> Novo post</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</span>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              {stats ? (
                <div className="text-3xl font-bold font-heading">{c.value}</div>
              ) : (
                <Skeleton className="h-8 w-16" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-lg">Posts mais lidos</CardTitle></CardHeader>
        <CardContent>
          {!stats && <Skeleton className="h-32 w-full" />}
          {stats && stats.topPosts.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">Ainda não há posts. Crie o primeiro!</p>
          )}
          {stats && stats.topPosts.length > 0 && (
            <ul className="divide-y">
              {stats.topPosts.map((p) => (
                <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <Link to={`/admin/posts/${p.id}/editar`} className="font-medium truncate hover:underline">{p.title}</Link>
                  <span className="text-sm text-muted-foreground inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}