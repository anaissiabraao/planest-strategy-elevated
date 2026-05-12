import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { fetchPublishedPosts, type PostListItem } from "@/lib/blog";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/blog/PostCard";
import BlogNav from "@/components/blog/BlogNav";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Sort = "recent" | "views" | "featured";

export default function Blog() {
  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  const [cats, setCats] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("recent");

  useEffect(() => {
    fetchPublishedPosts().then(setPosts);
    supabase.from("categories").select("id,name,slug").order("name").then(({ data }) => setCats(data ?? []));
  }, []);

  const list = useMemo(() => {
    if (!posts) return [];
    let r = [...posts];
    if (cat) r = r.filter((p) => p.category_id === cat);
    if (q) {
      const t = q.toLowerCase();
      r = r.filter((p) => p.title.toLowerCase().includes(t) || (p.excerpt ?? "").toLowerCase().includes(t));
    }
    if (sort === "views") r.sort((a, b) => b.views - a.views);
    else if (sort === "featured") r.sort((a, b) => Number(b.featured) - Number(a.featured));
    return r;
  }, [posts, q, cat, sort]);

  const featured = posts?.find((p) => p.featured) ?? posts?.[0];
  const rest = list.filter((p) => p.id !== featured?.id);
  const showFeatured = featured && !cat && !q && sort === "recent";

  return (
    <>
      <Helmet>
        <title>Blog | Planest — Estratégia, gestão e tecnologia</title>
        <meta name="description" content="Artigos, cases e ideias sobre planejamento estratégico, gestão e tecnologia para PMEs e consultorias." />
        <link rel="canonical" href="https://planest.com.br/blog" />
        <meta property="og:title" content="Blog Planest" />
        <meta property="og:type" content="website" />
      </Helmet>
      <BlogNav />
      <main className="pt-24 pb-20 min-h-screen">
        <section className="section-padding max-w-[1400px] mx-auto mb-12 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-xs text-accent uppercase tracking-wider font-semibold mb-4">
              <Sparkles className="h-4 w-4" /> Blog Planest
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl">
              Tecnologia, estratégia e <span className="text-accent">gestão</span> que movem o seu negócio.
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
              Insights práticos, cases e frameworks para tirar a estratégia das planilhas e colocá-la em ação.
            </p>
            <div className="relative max-w-md mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar artigos…" className="pl-10 h-12 rounded-full" />
            </div>
          </motion.div>
        </section>

        <section className="section-padding max-w-[1400px] mx-auto mb-8 flex flex-wrap items-center gap-2">
          <Button size="sm" variant={!cat ? "default" : "outline"} className="rounded-full" onClick={() => setCat(null)}>Todos</Button>
          {cats.map((c) => (
            <Button key={c.id} size="sm" variant={cat === c.id ? "default" : "outline"} className="rounded-full" onClick={() => setCat(c.id)}>
              {c.name}
            </Button>
          ))}
          <div className="ml-auto flex gap-1">
            {(["recent", "views", "featured"] as Sort[]).map((s) => (
              <Button key={s} size="sm" variant={sort === s ? "secondary" : "ghost"} onClick={() => setSort(s)}>
                {s === "recent" ? "Recentes" : s === "views" ? "Mais lidos" : "Destaques"}
              </Button>
            ))}
          </div>
        </section>

        <section className="section-padding max-w-[1400px] mx-auto">
          {!posts && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
            </div>
          )}
          {posts && list.length === 0 && <div className="text-center py-20 text-muted-foreground">Nenhum post encontrado.</div>}
          {posts && list.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showFeatured && <PostCard post={featured!} featured />}
              {(showFeatured ? rest : list).map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </section>
      </main>
    </>
  );
}