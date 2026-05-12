import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { openSaas } from "@/lib/openSaas";

export default function BlogNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="section-padding flex items-center justify-between h-16 max-w-[1400px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Planest" className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-heading font-semibold hidden sm:inline">Planest</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground font-medium">
          <Link to="/" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Site
          </Link>
          <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          <Link to="/para-quem" className="hover:text-foreground transition-colors">Para quem</Link>
        </div>
        <Button variant="cta" size="sm" className="rounded-full px-6" onClick={openSaas}>Acessar</Button>
      </div>
    </nav>
  );
}