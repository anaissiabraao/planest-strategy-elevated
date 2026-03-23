import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const testimonials = [
  {
    quote:
      "Usamos nas nossas consultorias de Planejamento Estratégico no lançamento do diagnóstico dos ambientes internos e externos, definição dos objetivos estratégicos, projetos e ações. Além de acompanhamento dos planos de ações e gestão dos indicadores.",
    name: "Alyne Barros",
    role: "Consultora",
  },
  {
    quote:
      "Quando apresentei a nossa plataforma de trabalho causou uma boa repercussão, até aquele momento nenhuma consultoria tinha apresentado tamanha tecnologia para esse tipo de trabalho. Sem sombra de dúvida o Planest além de suas funcionalidades, é um diferencial para sua imagem.",
    name: "Júnior Teixeira",
    role: "Consultor",
  },
  {
    quote:
      "O Planest se mostra inteligente, intuitivo e com ótimo custo benefício. Na minha opinião é, sem sombra de dúvidas, a melhor plataforma para quem tem o planejamento estratégico no core do seu trabalho e busca um sistema extremamente fácil de operar e muito confiável.",
    name: "Vitor Ozem",
    role: "Consultor",
  },
];

export default function Testimonials() {
  return (
    <section className="py-32 bg-muted/50">
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
              Depoimentos
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
              O que nossos clientes dizem
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="relative p-8 rounded-2xl border border-border bg-card group hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
              >
                <span className="absolute -top-4 left-8 text-6xl font-heading text-accent/20 leading-none select-none">
                  "
                </span>
                <blockquote className="text-muted-foreground leading-relaxed mb-8 relative z-10">
                  {t.quote}
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
