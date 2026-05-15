import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { leadSchema, submitLead } from "@/lib/leadCapture";
import { Sparkles } from "lucide-react";

const FLAG = "planest_exit_modal_seen_v1";

export default function ExitIntentModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const armed = useRef(true);

  useEffect(() => {
    if (localStorage.getItem(FLAG)) return;
    let timer: number | null = null;
    const onMouseLeave = (e: MouseEvent) => {
      if (!armed.current) return;
      if (e.clientY <= 0) trigger();
    };
    const isMobile = matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      timer = window.setTimeout(() => {
        const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
        if (scrolled > 0.4) trigger();
      }, 45_000);
    } else {
      window.addEventListener("mouseleave", onMouseLeave);
    }
    function trigger() {
      armed.current = false;
      setOpen(true);
      localStorage.setItem(FLAG, "1");
    }
    return () => {
      window.removeEventListener("mouseleave", onMouseLeave);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ name, phone });
    if (!parsed.success) { toast.error(parsed.error.errors[0]?.message || "Verifique os campos"); return; }
    setLoading(true);
    try {
      await submitLead({ ...parsed.data, source: "modal_exit" });
      toast.success("Recebemos seu contato!");
      setOpen(false);
    } catch {
      toast.error("Tente novamente em instantes.");
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center mb-2">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle className="text-center font-heading text-2xl">Antes de sair…</DialogTitle>
          <DialogDescription className="text-center">
            Deixe seu WhatsApp e receba uma demonstração personalizada do Planest.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 mt-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="h-11" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="WhatsApp" className="h-11" inputMode="tel" />
          <Button type="submit" variant="cta" disabled={loading} className="w-full rounded-full h-11">
            {loading ? "Enviando..." : "Quero a demonstração"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}