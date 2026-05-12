import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { fetchPublishedPosts, type PostListItem } from "@/lib/blog";
import BlogNav from "@/components/blog/BlogNav";
import PostCard from "@/components/blog/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogCategory() {
  const { slug = "" } = useParams();
  const [posts, setPosts] = useState<PostListItem[] | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id,name").eq("slug", slug).maybeSingle();
      if (!cat) { setPosts([]); return; }
      setName(cat.name);
      const all = await fetchPublishedPosts();
      setPosts(all.filter((p) => p.category_id === cat.id));
    })();
  }, [slug]);

  return (
    <>
      <Helmet><title>{name || "Categoria"} | Blog Planest</title></Helmet>
      <BlogNav />
      <main className="pt-24 pb-20 section-padding max-w-[1400px] mx-auto">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3"><Link to="/blog"><ArrowLeft className="h-4 w-4" /> Blog</Link></Button>
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-10">{name || "Categoria"}</h1>
        {!posts && <div className="grid md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}</div>}
        {posts && posts.length === 0 && <p className="text-muted-foreground">Sem posts nesta categoria.</p>}
        {posts && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{posts.map((p) => <PostCard key={p.id} post={p} />)}</div>
        )}
      </main>
    </>
  );
}