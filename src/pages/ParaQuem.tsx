import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  Brain,
  CalendarCheck,
  TrendingUp,
  LayoutGrid,
  Target,
  MessageSquare,
  Palette,
  GraduationCap,
  Layers,
} from "lucide-react";
import logo from "@/assets/logo.jpg";
import WhatsAppButton from "@/components/WhatsAppButton";

const SAAS_URL = "https://saas.planest.com.br/";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const benefits = [
  {
    Icon: TrendingUp,
    title: "Aumento de produtividade",
    desc: "Organize seu planejamento e melhore a produtividade da sua equipe com metodologias eficientes.",
  },
  {
    Icon: LayoutGrid,
    title: "Organização completa",
    desc: "Centralize todas as informações estratégicas e elimine planilhas desatualizadas.",
  },
  {
    Icon: Target,
    title: "Melhores resultados",
    desc: "Acompanhe indicadores e execute ações para alcançar os objetivos estabelecidos no planejamento.",
  },
  {
    Icon: MessageSquare,
    title: "Atendimento por chat",
    desc: "Atendimento via chat ou suporte de forma online de seu cliente, você implanta o Chat nos clientes que deseja.",
  },
  {
    Icon: Palette,
    title: "Ferramenta Whitelabel",
    desc: "Ferramenta pensada especialmente para os consultores utilizarem em suas consultorias com seu próprio logotipo, cores, informações e controle de clientes.",
  },
  {
    Icon: GraduationCap,
    title: "Treinamento",
    desc: "Treinamento gravado da nossa metodologia feito de forma EAD usando o Planest na sua empresa.",
  },
  {
    Icon: Layers,
    title: "Diversos tipos de consultorias",
    desc: "Metodologia para você aplicar mais de 18 tipos de consultorias em seus clientes. A ferramenta não é engessada e permite cadastro de múltiplas empresas em seu painel de controle.",
  },
];

export default function ParaQuem() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="section-padding flex items-center justify-between h-16 max-w-[1400px] mx-auto">
          <Link to="/">
            <img src={logo} alt="Planest" className="h-10 w-10 rounded-lg object-cover" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <Link to="/#funcionalidades" className="hover:text-foreground transition-colors">Funcionalidades</Link>
          </div>
          <Button variant="cta" size="sm" className="rounded-full px-6" asChild>
            <a href={SAAS_URL} target="_blank" rel="noopener noreferrer">Acessar o sistema</a>
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold tracking-widest uppercase text-accent">
              Para quem é
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1} className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Para quem é o planejamento estratégico?
            </motion.h1>
          </motion.div>
        </div>
      </section>

      {/* FEITO PARA CONSULTORES */}
      <section className="py-20 bg-muted/50">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <Users size={32} />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Feito para Consultores
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                O Planest é ideal para pequenas e médias empresas que precisam organizar seu planejamento estratégico e para consultores que desejam oferecer mais valor aos seus clientes.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                <Brain size={32} />
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
                Tenha ajuda da nossa Inteligência Artificial
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Inteligência artificial integrada ao modelo de negócios, diagnóstico, mapa estratégico, indicadores, projetos e análise do negócio.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AGENDE DEMONSTRAÇÃO */}
      <section className="py-20 bg-dark text-dark-foreground">
        <div className="section-padding max-w-[1400px] mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.div variants={fadeUp} custom={0} className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <CalendarCheck size={32} />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-heading text-3xl md:text-4xl font-bold">
              Agende uma demonstração
            </motion.h2>
            <motion.div variants={fadeUp} custom={2}>
              <Button variant="cta" size="lg" className="rounded-full text-base px-10 h-13" asChild>
                <a href="https://wa.me/5547999507669?text=Olá! Gostaria de agendar uma demonstração do Planest." target="_blank" rel="noopener noreferrer">
                  Agendar demonstração
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-32">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="space-y-16"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
                O que o Planest oferece para você
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="group p-8 rounded-2xl border border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    <b.Icon size={24} />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-border">
        <div className="section-padding max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <img src={logo} alt="Planest" className="h-10 w-10 rounded-lg object-cover" />
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <a href="tel:+5547999507669" className="hover:text-foreground transition-colors">
              (47) 99950-7669
            </a>
            <span className="hidden md:inline">·</span>
            <Link to="/privacidade" className="hover:text-foreground transition-colors">
              Política de Privacidade
            </Link>
            <span className="hidden md:inline">·</span>
            <p>© 2026 Planest. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
