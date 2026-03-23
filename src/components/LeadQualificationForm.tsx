import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, CheckCircle2, User, Building2, Target, Wrench, BarChart3, MessageSquare } from "lucide-react";
import logo from "@/assets/logo.jpg";
import { supabase } from "@/integrations/supabase/client";
import FormAIHelper from "@/components/FormAIHelper";

interface FormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  company_size: string;
  pain_points: string[];
  current_tools: string;
  strategic_planning_frequency: string;
  biggest_challenge: string;
}

const PAIN_OPTIONS = [
  { id: "planilhas", label: "Perco muito tempo com planilhas", icon: "📊" },
  { id: "execucao", label: "Dificuldade em acompanhar a execução", icon: "🎯" },
  { id: "escalar", label: "Não consigo escalar meus clientes", icon: "📈" },
  { id: "manual", label: "Preciso adaptar tudo manualmente", icon: "✏️" },
  { id: "indicadores", label: "Falta controle de indicadores", icon: "📉" },
  { id: "relatorios", label: "Gerar relatórios é trabalhoso", icon: "📄" },
];

const ROLE_OPTIONS = [
  { value: "consultor_independente", label: "Consultor independente" },
  { value: "empresa_consultoria", label: "Empresa de consultoria" },
  { value: "gestor", label: "Gestor / Diretor" },
  { value: "outro", label: "Outro" },
];

const SIZE_OPTIONS = [
  { value: "1", label: "Só eu" },
  { value: "2-5", label: "2 a 5 pessoas" },
  { value: "6-20", label: "6 a 20 pessoas" },
  { value: "20+", label: "Mais de 20 pessoas" },
];

const FREQUENCY_OPTIONS = [
  { value: "nao_faz", label: "Ainda não faço planejamento estratégico" },
  { value: "raramente", label: "Raramente / quando preciso" },
  { value: "anual", label: "Anualmente" },
  { value: "continuo", label: "Continuamente com meus clientes" },
];

const TOOL_OPTIONS = [
  { value: "planilhas", label: "Planilhas (Excel, Google Sheets)" },
  { value: "documentos", label: "Documentos e apresentações" },
  { value: "outra_ferramenta", label: "Outra ferramenta / software" },
  { value: "nenhuma", label: "Nenhuma ferramenta específica" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function LeadQualificationForm({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    role: "",
    company_size: "",
    pain_points: [],
    current_tools: "",
    strategic_planning_frequency: "",
    biggest_challenge: "",
  });

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  function next() {
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }
  function prev() {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }

  function togglePain(id: string) {
    setFormData((d) => ({
      ...d,
      pain_points: d.pain_points.includes(id)
        ? d.pain_points.filter((p) => p !== id)
        : [...d.pain_points, id],
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await supabase.from("lead_responses").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        company_size: formData.company_size,
        pain_points: formData.pain_points,
        current_tools: formData.current_tools,
        strategic_planning_frequency: formData.strategic_planning_frequency,
        biggest_challenge: formData.biggest_challenge,
      });
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
    onComplete();
  }

  function canAdvance() {
    switch (step) {
      case 0: return formData.name.trim().length > 1 && formData.email.trim().includes("@");
      case 1: return !!formData.role;
      case 2: return !!formData.company_size;
      case 3: return formData.pain_points.length > 0;
      case 4: return !!formData.current_tools && !!formData.strategic_planning_frequency;
      case 5: return formData.biggest_challenge.trim().length > 3;
      default: return true;
    }
  }

  const stepIcons = [User, Building2, Building2, Target, Wrench, MessageSquare];
  const StepIcon = stepIcons[step];

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 py-6 md:py-0" style={{ background: "hsl(var(--dark-bg))" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent)" }} />
        <div className="absolute bottom-1/4 -right-32 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-8" style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <img src={logo} alt="Planest" className="h-10 w-10 md:h-14 md:w-14 rounded-xl mx-auto mb-3 md:mb-4 shadow-lg" />
          <h1 className="text-xl md:text-3xl font-bold leading-tight" style={{ color: "hsl(var(--dark-bg-foreground))" }}>
            Descubra como o Planest pode te ajudar
          </h1>
          <p className="mt-1.5 md:mt-2 text-xs md:text-sm" style={{ color: "hsl(var(--dark-bg-foreground) / 0.6)" }}>
            Responda algumas perguntas rápidas para personalizarmos sua experiência.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between text-[10px] md:text-xs mb-1.5 md:mb-2" style={{ color: "hsl(var(--dark-bg-foreground) / 0.5)" }}>
            <span>Etapa {step + 1} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 rounded-full" style={{ background: "hsl(var(--dark-bg-foreground) / 0.1)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: "hsl(var(--accent))" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-5 md:p-10 border" style={{
          background: "hsl(var(--dark-bg-foreground) / 0.03)",
          borderColor: "hsl(var(--dark-bg-foreground) / 0.08)",
          backdropFilter: "blur(20px)",
        }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Step Icon */}
              <div className="flex items-center gap-2.5 md:gap-3 mb-4 md:mb-6">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center" style={{ background: "hsl(var(--accent) / 0.15)" }}>
                  <StepIcon className="w-4 h-4 md:w-5 md:h-5" style={{ color: "hsl(var(--accent))" }} />
                </div>
                <h2 className="text-base md:text-lg font-semibold" style={{ color: "hsl(var(--dark-bg-foreground))" }}>
                  {step === 0 && "Vamos nos conhecer"}
                  {step === 1 && "Qual é o seu perfil?"}
                  {step === 2 && "Tamanho da sua equipe"}
                  {step === 3 && "Quais são suas dores?"}
                  {step === 4 && "Suas ferramentas e rotina"}
                  {step === 5 && "Seu maior desafio"}
                </h2>
              </div>

              {/* Step 0 - Contact Info */}
              {step === 0 && (
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-1 md:mb-1.5 block" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                      Seu nome
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Digite seu nome completo"
                      className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent text-base md:text-sm h-11 md:h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-1 md:mb-1.5 block" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                      Seu e-mail
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent text-base md:text-sm h-11 md:h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs md:text-sm font-medium mb-1 md:mb-1.5 block" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                      Telefone <span className="text-white/40">(opcional)</span>
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="bg-transparent border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent text-base md:text-sm h-11 md:h-10"
                    />
                  </div>
                </div>
              )}

              {/* Step 1 - Role */}
              {step === 1 && (
                <div className="grid gap-2 md:gap-3">
                  {ROLE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, role: opt.value })}
                      className="flex items-center gap-3 p-3 md:p-4 rounded-xl border text-left transition-all duration-200"
                      style={{
                        borderColor: formData.role === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.08)",
                        background: formData.role === opt.value ? "hsl(var(--accent) / 0.1)" : "transparent",
                        color: "hsl(var(--dark-bg-foreground))",
                      }}
                    >
                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{
                        borderColor: formData.role === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.2)",
                      }}>
                        {formData.role === opt.value && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--accent))" }} />
                        )}
                      </div>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2 - Company Size */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  {SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, company_size: opt.value })}
                      className="p-3 md:p-4 rounded-xl border text-center transition-all duration-200"
                      style={{
                        borderColor: formData.company_size === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.08)",
                        background: formData.company_size === opt.value ? "hsl(var(--accent) / 0.1)" : "transparent",
                        color: "hsl(var(--dark-bg-foreground))",
                      }}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 3 - Pain Points */}
              {step === 3 && (
                <div className="space-y-2">
                  <p className="text-xs mb-3" style={{ color: "hsl(var(--dark-bg-foreground) / 0.5)" }}>
                    Selecione todas as opções que se aplicam
                  </p>
                  <div className="grid gap-2">
                    {PAIN_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => togglePain(opt.id)}
                        className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 rounded-xl border text-left transition-all duration-200"
                        style={{
                          borderColor: formData.pain_points.includes(opt.id) ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.08)",
                          background: formData.pain_points.includes(opt.id) ? "hsl(var(--accent) / 0.1)" : "transparent",
                          color: "hsl(var(--dark-bg-foreground))",
                        }}
                      >
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border" style={{
                          borderColor: formData.pain_points.includes(opt.id) ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.2)",
                          background: formData.pain_points.includes(opt.id) ? "hsl(var(--accent))" : "transparent",
                        }}>
                          {formData.pain_points.includes(opt.id) && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4 - Tools & Frequency */}
              {step === 4 && (
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <p className="text-sm font-medium mb-3" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                      O que você usa hoje para planejar?
                    </p>
                    <div className="grid gap-2">
                      {TOOL_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, current_tools: opt.value })}
                          className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 rounded-xl border text-left transition-all duration-200"
                          style={{
                            borderColor: formData.current_tools === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.08)",
                            background: formData.current_tools === opt.value ? "hsl(var(--accent) / 0.1)" : "transparent",
                            color: "hsl(var(--dark-bg-foreground))",
                          }}
                        >
                          <Wrench className="w-4 h-4 flex-shrink-0" style={{ color: formData.current_tools === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.3)" }} />
                          <span className="text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-3" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                      Com que frequência faz planejamento estratégico?
                    </p>
                    <div className="grid gap-2">
                      {FREQUENCY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFormData({ ...formData, strategic_planning_frequency: opt.value })}
                          className="flex items-center gap-2.5 md:gap-3 p-3 md:p-3.5 rounded-xl border text-left transition-all duration-200"
                          style={{
                            borderColor: formData.strategic_planning_frequency === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.08)",
                            background: formData.strategic_planning_frequency === opt.value ? "hsl(var(--accent) / 0.1)" : "transparent",
                            color: "hsl(var(--dark-bg-foreground))",
                          }}
                        >
                          <BarChart3 className="w-4 h-4 flex-shrink-0" style={{ color: formData.strategic_planning_frequency === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.3)" }} />
                          <span className="text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5 - Biggest Challenge */}
              {step === 5 && (
                <div>
                  <p className="text-sm mb-3" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                    Em uma frase, qual o maior desafio que você enfrenta hoje com planejamento estratégico?
                  </p>
                  <textarea
                    value={formData.biggest_challenge}
                    onChange={(e) => setFormData({ ...formData, biggest_challenge: e.target.value })}
                    placeholder="Ex: Não consigo acompanhar a execução dos planos de ação dos meus clientes..."
                    rows={4}
                    className="w-full rounded-xl p-4 text-sm bg-transparent border resize-none focus:outline-none focus:ring-2"
                    style={{
                      borderColor: "hsl(var(--dark-bg-foreground) / 0.1)",
                      color: "hsl(var(--dark-bg-foreground))",
                    }}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                onClick={prev}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: "hsl(var(--dark-bg-foreground) / 0.5)" }}
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="text-sm transition-colors"
                style={{ color: "hsl(var(--dark-bg-foreground) / 0.3)" }}
              >
                Pular
              </button>
            )}

            {step < totalSteps - 1 ? (
              <Button
                variant="cta"
                onClick={next}
                disabled={!canAdvance()}
                className="rounded-full px-6 gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="cta"
                onClick={handleSubmit}
                disabled={!canAdvance() || submitting}
                className="rounded-full px-6 gap-2"
              >
                {submitting ? "Enviando..." : "Ver soluções"} <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip link */}
        <div className="text-center mt-6">
          <button
            onClick={onComplete}
            className="text-xs underline transition-colors"
            style={{ color: "hsl(var(--dark-bg-foreground) / 0.3)" }}
          >
            Ir direto para o site
          </button>
        </div>
      </motion.div>
      <FormAIHelper currentStep={step} />
    </div>
  );
}
