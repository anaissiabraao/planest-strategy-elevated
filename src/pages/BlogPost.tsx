import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { motion } from "framer-motion";
import { fetchPostBySlug, registerView, fetchPublishedPosts, type PostListItem } from "@/lib/blog";
import BlogNav from "@/components/blog/BlogNav";
import ShareButtons from "@/components/blog/ShareButtons";
import PostCard from "@/components/blog/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Loaded {
  id: string; title: string; slug: string; subtitle: string | null;
  content: string; excerpt: string | null;
  banner_url: string | null; thumbnail_url: string | null;
  published_at: string | null; reading_time: number;
  seo_title: string | null; seo_description: string | null;
  category_id: string | null;
  category?: { name: string; slug: string } | null;
  author?: { name: string | null; avatar_url: string | null } | null;
  tags?: { tag: { name: string; slug: string } }[];
}

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Loaded | null | undefined>(undefined);
  const [related, setRelated] = useState<PostListItem[]>([]);

  useEffect(() => {
    (async () => {
      const p = (await fetchPostBySlug(slug)) as unknown as Loaded | null;
      setPost(p);
      if (p) {
        registerView(slug);
        const all = await fetchPublishedPosts();
        setRelated(all.filter((x) => x.id !== p.id && x.category_id === p.category_id).slice(0, 3));
      }
    })();
  }, [slug]);

  if (post === undefined) {
    return (<><BlogNav /><main className="pt-24 pb-20 section-padding max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-12 w-3/4" /><Skeleton className="h-64 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" />
    </main></>);
  }
  if (!post) {
    return (<><BlogNav /><main className="pt-24 pb-20 text-center min-h-screen">
      <h1 className="text-2xl font-bold">Post não encontrado</h1>
      <Button asChild variant="outline" className="mt-6"><Link to="/blog"><ArrowLeft className="h-4 w-4" /> Voltar</Link></Button>
    </main></>);
  }

  const url = typeof window !== "undefined" ? window.location.href : `https://planest.com.br/blog/${slug}`;
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }) : "";
  const cleanContent = DOMPurify.sanitize(post.content);

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} | Planest Blog</title>
        <meta name="description" content={post.seo_description || post.excerpt || ""} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt || ""} />
        <meta property="og:type" content="article" />
        {post.banner_url && <meta property="og:image" content={post.banner_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org", "@type": "Article",
          headline: post.title, description: post.seo_description || post.excerpt,
          image: post.banner_url || post.thumbnail_url,
          datePublished: post.published_at,
          author: { "@type": "Person", name: post.author?.name || "Planest" },
          publisher: { "@type": "Organization", name: "Planest" },
        })}</script>
      </Helmet>
      <BlogNav />
      <main className="pt-24 pb-20">
        <article className="section-padding max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-3"><Link to="/blog"><ArrowLeft className="h-4 w-4" /> Blog</Link></Button>
            {post.category && (
              <Link to={`/blog/categoria/${post.category.slug}`} className="text-xs uppercase tracking-wider text-accent font-semibold">
                {post.category.name}
              </Link>
            )}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mt-3 mb-4">{post.title}</h1>
            {post.subtitle && <p className="text-xl text-muted-foreground mb-6">{post.subtitle}</p>}
            <div className="flex items-center gap-4 text-sm text-muted-foreground border-y py-4 mb-8 flex-wrap">
              {post.author?.name && <span className="font-medium text-foreground">{post.author.name}</span>}
              {date && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{date}</span>}
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.reading_time} min de leitura</span>
            </div>
          </motion.div>
          {post.banner_url && (
            <img src={post.banner_url} alt={post.title} className="w-full rounded-2xl mb-10 aspect-video object-cover" loading="eager" />
          )}
          <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-a:text-accent"
            dangerouslySetInnerHTML={{ __html: cleanContent }} />
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10">
              {post.tags.map(({ tag }) => <Badge key={tag.slug} variant="secondary">#{tag.name}</Badge>)}
            </div>
          )}
          <div className="mt-10 pt-6 border-t"><ShareButtons url={url} title={post.title} /></div>
        </article>
        {related.length > 0 && (
          <section className="section-padding max-w-[1400px] mx-auto mt-20">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Continue lendo</h2>
            <div className="grid md:grid-cols-3 gap-6">{related.map((p) => <PostCard key={p.id} post={p} />)}</div>
          </section>
        )}
      </main>
    </>
  );
}