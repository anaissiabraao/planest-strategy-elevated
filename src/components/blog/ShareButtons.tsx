import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, MessageCircle, Link2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const enc = encodeURIComponent;
  const links = [
    { ic: Twitter, label: "Twitter", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}` },
    { ic: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { ic: MessageCircle, label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
  ];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-1">Compartilhar:</span>
      {links.map((l) => (
        <Button key={l.label} size="icon" variant="outline" className="rounded-full h-9 w-9" asChild>
          <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label}><l.ic className="h-4 w-4" /></a>
        </Button>
      ))}
      <Button size="icon" variant="outline" className="rounded-full h-9 w-9"
        onClick={() => { navigator.clipboard.writeText(url); toast({ title: "Link copiado!" }); }}>
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}