import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.jpg";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Testimonials from "@/components/landing/Testimonials";
import PricingSection from "@/components/landing/PricingSection";
import VideoSection from "@/components/landing/VideoSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import HeroModel from "@/components/landing/HeroModel";
import { SAAS_URL, openSaas } from "@/lib/openSaas";
import strategyNetwork from "@/assets/strategy-network.jpg";
import growthChart from "@/assets/growth-chart.jpg";
import heroAnim from "@/assets/hero-anim.gif";

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

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="section-padding flex items-center justify-between h-16 max-w-[1400px] mx-auto">
          <a href="/">
            <img src={logo} alt="Planest" className="h-10 w-10 rounded-lg object-cover" />
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <a href="#solucao" className="hover:text-foreground transition-colors">Solução</a>
            <a href="#produto" className="hover:text-foreground transition-colors">Produto</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como funciona</a>
            <Link to="/para-quem" className="hover:text-foreground transition-colors">Para quem</Link>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-4 hidden sm:inline-flex gap-2"
              asChild
            >
              <Link to="/blog" aria-label="Ir para o Blog">
                <BookOpen className="h-4 w-4" />
                Blog
              </Link>
            </Button>
            <Button variant="cta" size="sm" className="rounded-full px-6" onClick={openSaas}>
              Acessar o sistema
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 pb-12 md:pb-0 bg-white overflow-hidden">
        {/* Animated wireframe background — inverted + multiply makes white transparent on white bg */}
        <img
          src={heroAnim}
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0 m-auto w-[120%] max-w-none h-auto opacity-[0.18] sm:opacity-[0.22] object-cover"
          style={{ filter: "invert(1) contrast(1.1)", mixBlendMode: "multiply" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white pointer-events-none" />
        <div className="relative section-padding max-w-[1400px] mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6 md:space-y-8 order-2 lg:order-1"
            >
              <motion.div variants={fadeUp} custom={0}>
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:border-accent/60 transition-colors"
                >
                  <span className="inline-flex items-center gap-1.5 font-semibold text-accent">
                    <BookOpen className="h-3.5 w-3.5" />
                    Novo
                  </span>
                  <span className="hidden sm:inline">Blog Planest no ar — conteúdos sobre estratégia</span>
                  <span className="sm:hidden">Conheça nosso Blog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
              <motion.h1
                variants={fadeUp}
                custom={0}
                className="font-heading text-[2.25rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground"
              >
                Pare de organizar estratégia em{" "}
                <span className="text-accent">planilhas.</span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                custom={1}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed"
              >
                Crie, gerencie e acompanhe o planejamento estratégico dos seus
                clientes em um só lugar.
              </motion.p>
              <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="cta" size="lg" className="rounded-full text-base px-8 h-12 sm:h-13 w-full sm:w-auto" onClick={openSaas}>
                  Acessar o sistema
                </Button>
                <Button variant="cta-outline" size="lg" className="rounded-full text-base px-8 h-12 sm:h-13 w-full sm:w-auto" asChild>
                  <a href="#video">Ver como funciona</a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative order-1 lg:order-2"
            >
              <div className="rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-muted/40 to-background aspect-square max-h-[260px] sm:max-h-[320px] mx-auto w-full max-w-[280px] sm:max-w-none">
                <HeroModel className="w-full h-full" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 sm:w-32 sm:h-32 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-6 -right-6 w-28 h-28 sm:w-40 sm:h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="py-20 md:py-32">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-20 items-start"
          >
            <motion.div variants={fadeUp} custom={0}>
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-accent mb-4">
                O problema
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
                Se você é consultor, provavelmente…
              </h2>
            </motion.div>

            <div className="space-y-5 md:space-y-6">
              {[
                "Perde tempo organizando estratégias em planilhas",
                "Tem dificuldade de acompanhar a execução dos clientes",
                "Precisa adaptar tudo manualmente a cada projeto",
                "Não consegue escalar sua base de clientes",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-start gap-4 sm:gap-5 group"
                >
                  <span className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs sm:text-sm mt-0.5 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed pt-1">
                    {text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section id="solucao" className="py-20 md:py-32 bg-dark text-dark-foreground">
        <div className="section-padding max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative order-2 lg:order-1"
            >
              <motion.img
                src={strategyNetwork}
                alt="Rede de objetivos estratégicos conectados"
                width={1280}
                height={960}
                loading="lazy"
                className="w-full h-auto rounded-2xl border border-border/20 shadow-2xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
            <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="space-y-6 md:space-y-8 order-1 lg:order-2"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-accent"
            >
              A solução
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Foi por isso que criamos o{" "}
              <span className="text-accent">Planest</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-base sm:text-lg md:text-xl text-dark-foreground/70 leading-relaxed"
            >
              Transformar o caos do planejamento estratégico em um processo
              estruturado, escalável e profissional.
            </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRODUTO */}
      <section id="produto" className="py-20 md:py-32">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="space-y-12 md:space-y-16"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-accent mb-4">
                O produto
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Tudo que você precisa, em um só painel
              </h2>
            </motion.div>

            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-12 items-center">
              <motion.div
                variants={fadeUp}
                custom={1}
                className="relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-muted/40 to-background aspect-square max-h-[280px] sm:max-h-[360px] mx-auto w-full max-w-[300px] lg:max-w-none"
              >
                <HeroModel className="w-full h-full" />
              </motion.div>

              <motion.div variants={fadeUp} custom={2} className="space-y-5 md:space-y-6">
                {[
                  { label: "Planejamento estruturado", desc: "Configure o planejamento estratégico do seu cliente em minutos." },
                  { label: "Gestão de clientes", desc: "Todos os seus clientes organizados em um único painel." },
                  { label: "Acompanhamento de execução", desc: "Monitore o progresso em tempo real com indicadores visuais." },
                  { label: "Centralização de dados", desc: "Todas as informações estratégicas em um só lugar." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-2.5" />
                    <div>
                      <h3 className="font-heading text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors">{item.label}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 md:py-32 bg-muted/50">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="space-y-14 md:space-y-20"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto">
              <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-accent mb-4">
                Simples assim
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                Como funciona
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-10 sm:gap-8 relative">
              <div className="hidden sm:block absolute top-12 left-[20%] right-[20%] h-px bg-border" />

              {[
                {
                  step: "01",
                  title: "Crie o planejamento",
                  desc: "Configure o planejamento estratégico do seu cliente em minutos, com templates prontos.",
                },
                {
                  step: "02",
                  title: "Defina metas e ações",
                  desc: "Estruture objetivos, indicadores e planos de ação de forma clara e visual.",
                },
                {
                  step: "03",
                  title: "Acompanhe a execução",
                  desc: "Monitore o progresso em tempo real e garanta que a estratégia saia do papel.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="relative text-center space-y-4 sm:space-y-5"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center mx-auto relative z-10">
                    <span className="font-heading text-2xl sm:text-3xl font-bold text-accent">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* VIDEO */}
      <VideoSection />

      {/* FUNCIONALIDADES */}
      <FeaturesGrid />

      {/* PLANO */}
      <PricingSection />

      {/* DIFERENCIAL */}
      <section className="py-20 md:py-32">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-20 items-center"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-6 md:space-y-8">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
                Não é mais uma ferramenta.
                <br />
                <span className="text-accent">
                  É um sistema de gestão estratégica.
                </span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg">
                O Planest foi construído desde o dia um para consultores que
                precisam de estrutura, agilidade e resultados reais.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="space-y-5 md:space-y-6">
              {[
                {
                  title: "Feito para consultores",
                  desc: "Cada detalhe pensado para quem vive de planejamento estratégico.",
                },
                {
                  title: "Não começa do zero",
                  desc: "Templates e frameworks prontos para você aplicar imediatamente.",
                },
                {
                  title: "Foco em execução real",
                  desc: "Acompanhe indicadores e garanta que a estratégia aconteça de verdade.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="p-5 sm:p-6 rounded-xl border border-border hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
                >
                  <h3 className="font-heading text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRANSFORMAÇÃO */}
      <section className="py-20 md:py-32 bg-dark text-dark-foreground">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center space-y-12 md:space-y-16"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold"
            >
              O que muda na sua consultoria
            </motion.h2>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="relative max-w-md mx-auto"
            >
              <motion.img
                src={growthChart}
                alt="Gráfico de crescimento estratégico"
                width={1280}
                height={960}
                loading="lazy"
                className="w-full h-auto rounded-2xl border border-border/20 shadow-2xl"
                animate={{ y: [0, -10, 0], rotate: [0, 1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="absolute -inset-6 bg-accent/20 rounded-full blur-3xl pointer-events-none -z-10" />
            </motion.div>

            <div className="grid sm:grid-cols-3 gap-10 sm:gap-12">
              {[
                { metric: "Mais", highlight: "organização", desc: "Todos os clientes e projetos em um único lugar estruturado." },
                { metric: "Mais", highlight: "controle", desc: "Visibilidade total sobre metas, ações e resultados." },
                { metric: "Mais", highlight: "clientes", desc: "Escale sua operação sem aumentar complexidade." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="space-y-3 sm:space-y-4"
                >
                  <p className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold">
                    {item.metric}{" "}
                    <span className="text-accent">{item.highlight}</span>
                  </p>
                  <p className="text-sm sm:text-base text-dark-foreground/60 leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <Testimonials />

      {/* CTA FINAL */}
      <section className="py-20 md:py-32">
        <div className="section-padding max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center space-y-6 md:space-y-8 max-w-3xl mx-auto"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
            >
              Transforme sua consultoria em um processo{" "}
              <span className="text-accent">escalável</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-base sm:text-lg text-muted-foreground"
            >
              Sem planilhas. Sem complexidade.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button variant="cta" size="lg" className="rounded-full text-base sm:text-lg px-8 sm:px-10 h-12 sm:h-14 w-full sm:w-auto" onClick={openSaas}>
                Começar agora
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 md:py-12 border-t border-border">
        <div className="section-padding max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <img src={logo} alt="Planest" className="h-10 w-10 rounded-lg object-cover" />
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-xs sm:text-sm text-muted-foreground">
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

      {/* WhatsApp floating button */}
      <WhatsAppButton />
    </div>
  );
}
