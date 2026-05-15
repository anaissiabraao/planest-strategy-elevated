import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { leadSchema, submitLead } from "@/lib/leadCapture";
import { CheckCircle2, Phone } from "lucide-react";

export default function LeadFunnelSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = leadSchema.safeParse({ name, phone });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || "Verifique os campos");
      return;
    }
    setLoading(true);
    try {
      await submitLead({ ...parsed.data, source: "section_inline" });
      setDone(true);
      toast.success("Recebemos seu contato! Em breve falaremos com você.");
    } catch (err) {
      toast.error("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="falar-especialista" className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <div className="section-padding max-w-[1100px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center rounded-3xl border border-border/60 bg-card/60 backdrop-blur p-8 md:p-12 shadow-xl"
        >
          <div>
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-accent mb-4">Fale com um especialista</p>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
              Quer ver o Planest <span className="text-accent">aplicado ao seu negócio?</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
              Deixe seu nome e WhatsApp. Um consultor entra em contato em até 1 dia útil para mostrar como organizar a estratégia dos seus clientes.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {["Demonstração personalizada", "Sem compromisso", "Atendimento humano"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />{t}</li>
              ))}
            </ul>
          </div>

          {done ? (
            <div className="rounded-2xl bg-accent/10 border border-accent/30 p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-heading text-xl font-bold">Tudo certo!</h3>
              <p className="text-sm text-muted-foreground mt-2">Seu contato foi registrado. Em breve falamos com você.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="mt-1.5 h-12" autoComplete="name" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">WhatsApp</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1.5 h-12" inputMode="tel" autoComplete="tel" />
              </div>
              <Button type="submit" variant="cta" size="lg" disabled={loading} className="w-full rounded-full h-12 gap-2">
                <Phone className="h-4 w-4" />
                {loading ? "Enviando..." : "Quero falar com um especialista"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Ao enviar você concorda com nossa <a href="/privacidade" className="underline">política de privacidade</a>.</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}