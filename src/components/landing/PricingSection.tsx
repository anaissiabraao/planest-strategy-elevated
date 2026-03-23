import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const planFeatures = [
  "Briefing / Kick-off",
  "Modelo de Negócios: Ilimitados Canvas",
  "Diagnóstico Completo: SWOT por área com GUT + PESTAL",
  "Mapa Estratégico: BSC + Perspectivas + OKR",
  "Indicadores KPI: Indicadores + FCA",
  "Projetos Completo: Ágil + 5W2H + Ações + Custos + Gantt",
  "Listagem de Ações por Processos",
  "Relatórios",
  "Relatórios diários por e-mail",
];

export default function PricingSection() {
  return (
    <section id="planos" className="py-32">
      <div className="section-padding max-w-[1400px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto space-y-4">
            <p className="text-sm font-semibold tracking-widest uppercase text-accent">
              Plano
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
              Para Consultores
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="max-w-2xl mx-auto rounded-2xl border-2 border-accent/30 bg-card p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 space-y-8">
              <h3 className="font-heading text-2xl font-bold text-foreground">
                Sistema completo para montar o planejamento estratégico
              </h3>

              <ul className="space-y-3">
                {planFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-6">
                <p>*Consultar o valor adicional por usuário</p>
                <p>**Consultar os tipos de planos</p>
              </div>

              <Button variant="cta" size="lg" className="rounded-full text-base px-10 h-13 w-full sm:w-auto" asChild>
                <a href="https://wa.me/5547999507669?text=Olá! Gostaria de solicitar mais informações sobre o Planest." target="_blank" rel="noopener noreferrer">
                  Solicite mais informações
                </a>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
