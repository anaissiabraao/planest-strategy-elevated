import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye } from "lucide-react";
import type { PostListItem } from "@/lib/blog";

export default function PostCard({ post, featured = false }: { post: PostListItem; featured?: boolean }) {
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "";
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group rounded-2xl overflow-hidden border border-border/60 bg-card hover:border-primary/40 transition-colors ${featured ? "lg:col-span-2 lg:flex" : ""}`}
    >
      <Link to={`/blog/${post.slug}`} className={`block ${featured ? "lg:w-1/2" : ""}`}>
        {post.thumbnail_url ? (
          <img src={post.thumbnail_url} alt={post.title} loading="lazy" decoding="async"
            className={`w-full object-cover ${featured ? "h-64 lg:h-full" : "h-48"} group-hover:scale-[1.02] transition-transform duration-500`} />
        ) : (
          <div className={`w-full bg-gradient-to-br from-primary/20 to-accent/20 ${featured ? "h-64 lg:h-full" : "h-48"}`} />
        )}
      </Link>
      <div className={`p-5 md:p-6 flex flex-col gap-3 ${featured ? "lg:w-1/2" : ""}`}>
        {post.category && (
          <Link to={`/blog/categoria/${post.category.slug}`} className="text-xs uppercase tracking-wider text-accent font-semibold w-fit">
            {post.category.name}
          </Link>
        )}
        <Link to={`/blog/${post.slug}`} className="block">
          <h3 className={`font-heading font-bold leading-tight group-hover:text-primary transition-colors ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
            {post.title}
          </h3>
        </Link>
        {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground pt-2">
          {post.author?.name && <span>{post.author.name}</span>}
          {date && <span>·</span>}
          {date && <span>{date}</span>}
          <span className="ml-auto inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.reading_time} min</span>
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{post.views}</span>
        </div>
      </div>
    </motion.article>
  );
}