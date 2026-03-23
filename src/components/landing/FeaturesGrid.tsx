import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  {
    icon: "📋",
    title: "Modelo de Negócios (Canvas)",
    items: [
      "Modelo de Negócios (BMC)",
      "Modelo de Negócios Pessoal (BMY)",
      "Cliente ideal de um negócio (Persona)",
      "Lean Canvas (SLC)",
    ],
  },
  {
    icon: "🎯",
    title: "Alinhamento",
    items: [
      "Formulário de Kick-off",
      "Google Forms",
      "Inclusão de vídeos (Youtube)",
      "Página aberta",
    ],
  },
  {
    icon: "🔍",
    title: "Diagnóstico",
    items: [
      "Análise do negócio",
      "Análise SWOT",
      "Análise por setores",
      "Riscos do negócio",
    ],
  },
  {
    icon: "⚡",
    title: "Análise de cenário",
    items: [
      "GUT",
      "Semáforos com peso",
      "Setores",
      "Importância, Emergência e Tendência",
      "Vínculo com projetos",
    ],
  },
  {
    icon: "🗺️",
    title: "Mapa estratégico",
    items: [
      "Missão, Visão, Valores e Sucesso",
      "BSC (Balanced Scorecard)",
      "Objetivos, perspectivas e metas",
      "Personalizado por cor",
      "Objetivos e Perspectivas ilimitadas",
    ],
  },
  {
    icon: "📊",
    title: "Indicadores",
    items: [
      "Dashboard & Dashboard simplificado",
      "Dashboard de FCA",
      "Semanais, Mensais, Trimestrais",
      "Quadrimestrais, Quarter",
      "Semestrais, Anuais",
    ],
  },
  {
    icon: "🔬",
    title: "Fato, Causa e Ação (FCA)",
    items: [
      "Dashboard",
      "Fato",
      "Causa (5 porquês)",
      "Ação (5W2H)",
    ],
  },
  {
    icon: "🚀",
    title: "Projetos / Plano de Ações",
    items: [
      "Projetos Ágeis & 5W2H",
      "Reuniões, Custos, Receitas, Riscos",
      "GANTT & Processos",
      "PMBOK",
    ],
  },
  {
    icon: "👁️",
    title: "Acompanhamento",
    items: [
      "Dashboard de Ações",
      "Acompanhamento por processos",
      "Acompanhamento por FCA",
      "Filtros de ações pelo BSC",
    ],
  },
  {
    icon: "📄",
    title: "Relatórios",
    items: [
      "Projetos, Ações, Produtividade",
      "Indicadores, Custos, BSC",
      "Relatório Completo",
    ],
  },
  {
    icon: "🔒",
    title: "Controle de Acesso",
    items: [
      "Painel de configurações",
      "Convite de usuários",
      "Controle de acesso total por grupos",
      "Múltiplos grupos por usuário",
      "Dentro do padrão da LGPD",
    ],
  },
  {
    icon: "📈",
    title: "Análise do negócio",
    items: [
      "Distribuição de recursos",
      "Crescimento",
      "Rede de Prioridades",
      "16 análises por critérios do negócio",
    ],
  },
];

export default function FeaturesGrid() {
  return (
    <section id="funcionalidades" className="py-32">
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
              Funcionalidades
            </p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
              Tudo que o Planest oferece
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Um sistema completo para montar, executar e acompanhar o planejamento estratégico dos seus clientes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <ul className="space-y-1.5">
                  {feature.items.map((item, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
