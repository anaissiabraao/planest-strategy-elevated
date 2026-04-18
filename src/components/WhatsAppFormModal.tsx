import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, CheckCircle2, User, Building2, Target, Wrench, BarChart3, MessageSquare, X, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import FormAIHelper from "@/components/FormAIHelper";
import { setFormCompleted, hasCompletedForm, setUserSessionData, getUserSessionData, getConsent } from "@/lib/cookies";

const WHATSAPP_NUMBER = "5547999507669";

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

const ROLE_LABELS: Record<string, string> = {
  consultor_independente: "Consultor independente",
  empresa_consultoria: "Empresa de consultoria",
  gestor: "Gestor / Diretor",
  outro: "Outro",
};

const TOOL_LABELS: Record<string, string> = {
  planilhas: "Planilhas (Excel, Google Sheets)",
  documentos: "Documentos e apresentações",
  outra_ferramenta: "Outra ferramenta / software",
  nenhuma: "Nenhuma ferramenta específica",
};

const FREQ_LABELS: Record<string, string> = {
  nao_faz: "Ainda não faz",
  raramente: "Raramente",
  anual: "Anualmente",
  continuo: "Continuamente",
};

const PAIN_LABELS: Record<string, string> = {
  planilhas: "Perde tempo com planilhas",
  execucao: "Dificuldade no acompanhamento",
  escalar: "Não consegue escalar clientes",
  manual: "Adapta tudo manualmente",
  indicadores: "Falta controle de indicadores",
  relatorios: "Relatórios trabalhosos",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

function buildWhatsAppMessage(data: FormData): string {
  const painLabels = data.pain_points.map((p) => PAIN_LABELS[p] || p).join(", ");
  const lines = [
    `Olá! Gostaria de saber mais sobre o Planest.`,
    ``,
    `📋 *Dados do lead:*`,
    `👤 Nome: ${data.name}`,
    `📧 E-mail: ${data.email}`,
    data.phone ? `📱 Telefone: ${data.phone}` : null,
    `🏢 Perfil: ${ROLE_LABELS[data.role] || data.role}`,
    `👥 Equipe: ${data.company_size} pessoa(s)`,
    `🔧 Ferramenta atual: ${TOOL_LABELS[data.current_tools] || data.current_tools}`,
    `📊 Frequência de PE: ${FREQ_LABELS[data.strategic_planning_frequency] || data.strategic_planning_frequency}`,
    painLabels ? `⚠️ Dores: ${painLabels}` : null,
    data.biggest_challenge ? `💬 Maior desafio: ${data.biggest_challenge}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WhatsAppFormModal({ open, onOpenChange }: Props) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
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

  // Pre-fill from cookies on mount
  useEffect(() => {
    if (getConsent()) {
      const savedName = getUserSessionData("name");
      const savedEmail = getUserSessionData("email");
      const savedPhone = getUserSessionData("phone");
      if (savedName || savedEmail || savedPhone) {
        setFormData((prev) => ({
          ...prev,
          name: savedName || prev.name,
          email: savedEmail || prev.email,
          phone: savedPhone || prev.phone,
        }));
      }
    }
  }, []);

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

    const message = buildWhatsAppMessage(formData);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    if (typeof (window as any).gtag_report_conversion === "function") {
      (window as any).gtag_report_conversion();
    }
    window.open(url, "_blank", "noopener,noreferrer");

    // Save session data in cookies
    setFormCompleted(true);
    setUserSessionData("name", formData.name);
    setUserSessionData("email", formData.email);
    if (formData.phone) setUserSessionData("phone", formData.phone);

    setSubmitting(false);
    onOpenChange(false);
    // Reset form
    setStep(0);
    setFormData({
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

  function handleSkip() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá! Gostaria de saber mais sobre o Planest.")}`;
    if (typeof (window as any).gtag_report_conversion === "function") {
      (window as any).gtag_report_conversion();
    }
    window.open(url, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  }

  const stepIcons = [User, Building2, Building2, Target, Wrench, MessageSquare];
  const StepIcon = stepIcons[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 border-0 bg-transparent shadow-none [&>button]:hidden gap-0 grid-rows-[1fr]
          left-1/2 -translate-x-1/2
          ${
            fullscreen
              ? "w-screen max-w-full h-[100dvh] top-0 bottom-0 translate-y-0 rounded-none"
              : "w-screen max-w-full h-[100dvh] sm:h-auto sm:max-h-[92dvh] sm:max-w-xl sm:w-auto top-auto bottom-0 translate-y-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 rounded-none sm:rounded-2xl"
          }
          overflow-hidden`}
      >
        <div className={`relative flex flex-col h-full overflow-hidden ${fullscreen ? "rounded-none" : "rounded-t-3xl sm:rounded-2xl"}`} style={{ background: "hsl(var(--dark-bg))" }}>
          {/* Drag handle (mobile, only when not fullscreen) */}
          {!fullscreen && (
            <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
              <div className="w-10 h-1.5 rounded-full" style={{ background: "hsl(var(--dark-bg-foreground) / 0.2)" }} />
            </div>
          )}

          {/* Header - sticky */}
          <div
            className="flex-shrink-0 px-5 pt-3 pb-4 sm:px-8 sm:pt-6 border-b sm:border-0 relative"
            style={{ borderColor: "hsl(var(--dark-bg-foreground) / 0.08)" }}
          >
            {/* Action buttons (top right) */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
              <button
                onClick={() => setFullscreen((f) => !f)}
                aria-label={fullscreen ? "Sair de tela cheia" : "Expandir para tela cheia"}
                className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center transition-all active:scale-95 hover:bg-white/15"
                style={{ background: "hsl(var(--dark-bg-foreground) / 0.1)", color: "hsl(var(--dark-bg-foreground) / 0.7)" }}
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Fechar"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 hover:bg-white/15"
                style={{ background: "hsl(var(--dark-bg-foreground) / 0.1)", color: "hsl(var(--dark-bg-foreground) / 0.7)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center pr-24">
              <div className="hidden sm:flex w-12 h-12 rounded-full bg-[#25D366]/20 items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-[#25D366]" />
              </div>
              <div className="flex sm:hidden items-center justify-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#25D366]/20 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                </div>
                <h2 className="text-base font-bold" style={{ color: "hsl(var(--dark-bg-foreground))" }}>
                  Falar com nosso time
                </h2>
              </div>
              <h2 className="hidden sm:block text-xl font-bold" style={{ color: "hsl(var(--dark-bg-foreground))" }}>
                Fale com nosso time pelo WhatsApp
              </h2>
              <p className="hidden sm:block mt-1 text-sm" style={{ color: "hsl(var(--dark-bg-foreground) / 0.5)" }}>
                Responda rapidamente para que nosso atendente já tenha suas informações em mãos.
              </p>
            </div>

            {/* Progress */}
            <div className="mt-3 sm:mt-4">
              <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5" style={{ color: "hsl(var(--dark-bg-foreground) / 0.6)" }}>
                <span className="font-medium">Etapa {step + 1} de {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "hsl(var(--dark-bg-foreground) / 0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "hsl(var(--accent))" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Scrollable form area */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6" style={{ WebkitOverflowScrolling: "touch" }}>
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
                {/* Step Icon + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(var(--accent) / 0.15)" }}>
                    <StepIcon className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold leading-tight" style={{ color: "hsl(var(--dark-bg-foreground))" }}>
                    {step === 0 && "Vamos nos conhecer"}
                    {step === 1 && "Qual é o seu perfil?"}
                    {step === 2 && "Tamanho da sua equipe"}
                    {step === 3 && "Quais são suas dores?"}
                    {step === 4 && "Suas ferramentas e rotina"}
                    {step === 5 && "Seu maior desafio"}
                  </h3>
                </div>

                {/* Step 0 */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>Seu nome</label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Digite seu nome completo" autoComplete="name" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent text-base h-12 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>Seu e-mail</label>
                      <Input type="email" inputMode="email" autoComplete="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent text-base h-12 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>Telefone <span className="text-white/40">(opcional)</span></label>
                      <Input type="tel" inputMode="tel" autoComplete="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(00) 00000-0000" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-accent text-base h-12 rounded-xl" />
                    </div>
                  </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                  <div className="grid gap-2.5">
                    {ROLE_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => setFormData({ ...formData, role: opt.value })} className="flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] min-h-[56px]" style={{ borderColor: formData.role === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.1)", background: formData.role === opt.value ? "hsl(var(--accent) / 0.1)" : "hsl(var(--dark-bg-foreground) / 0.02)", color: "hsl(var(--dark-bg-foreground))" }}>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: formData.role === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.25)" }}>
                          {formData.role === opt.value && <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(var(--accent))" }} />}
                        </div>
                        <span className="text-sm sm:text-base font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {SIZE_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => setFormData({ ...formData, company_size: opt.value })} className="p-4 rounded-xl border text-center transition-all duration-200 active:scale-[0.98] min-h-[64px] flex items-center justify-center" style={{ borderColor: formData.company_size === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.1)", background: formData.company_size === opt.value ? "hsl(var(--accent) / 0.1)" : "hsl(var(--dark-bg-foreground) / 0.02)", color: "hsl(var(--dark-bg-foreground))" }}>
                        <span className="text-sm sm:text-base font-medium">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-xs" style={{ color: "hsl(var(--dark-bg-foreground) / 0.55)" }}>Selecione todas que se aplicam</p>
                    <div className="grid gap-2.5">
                      {PAIN_OPTIONS.map((opt) => (
                        <button key={opt.id} onClick={() => togglePain(opt.id)} className="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] min-h-[52px]" style={{ borderColor: formData.pain_points.includes(opt.id) ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.1)", background: formData.pain_points.includes(opt.id) ? "hsl(var(--accent) / 0.1)" : "hsl(var(--dark-bg-foreground) / 0.02)", color: "hsl(var(--dark-bg-foreground))" }}>
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2" style={{ borderColor: formData.pain_points.includes(opt.id) ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.25)", background: formData.pain_points.includes(opt.id) ? "hsl(var(--accent))" : "transparent" }}>
                            {formData.pain_points.includes(opt.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="text-sm sm:text-base">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <p className="text-sm font-semibold mb-2.5" style={{ color: "hsl(var(--dark-bg-foreground) / 0.85)" }}>O que você usa hoje para planejar?</p>
                      <div className="grid gap-2.5">
                        {TOOL_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => setFormData({ ...formData, current_tools: opt.value })} className="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] min-h-[52px]" style={{ borderColor: formData.current_tools === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.1)", background: formData.current_tools === opt.value ? "hsl(var(--accent) / 0.1)" : "hsl(var(--dark-bg-foreground) / 0.02)", color: "hsl(var(--dark-bg-foreground))" }}>
                            <Wrench className="w-4 h-4 flex-shrink-0" style={{ color: formData.current_tools === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.4)" }} />
                            <span className="text-sm sm:text-base">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2.5" style={{ color: "hsl(var(--dark-bg-foreground) / 0.85)" }}>Com que frequência faz planejamento?</p>
                      <div className="grid gap-2.5">
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => setFormData({ ...formData, strategic_planning_frequency: opt.value })} className="flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] min-h-[52px]" style={{ borderColor: formData.strategic_planning_frequency === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.1)", background: formData.strategic_planning_frequency === opt.value ? "hsl(var(--accent) / 0.1)" : "hsl(var(--dark-bg-foreground) / 0.02)", color: "hsl(var(--dark-bg-foreground))" }}>
                            <BarChart3 className="w-4 h-4 flex-shrink-0" style={{ color: formData.strategic_planning_frequency === opt.value ? "hsl(var(--accent))" : "hsl(var(--dark-bg-foreground) / 0.4)" }} />
                            <span className="text-sm sm:text-base">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                  <div>
                    <p className="text-sm mb-3" style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}>
                      Em uma frase, qual o maior desafio que você enfrenta hoje com planejamento estratégico?
                    </p>
                    <textarea
                      value={formData.biggest_challenge}
                      onChange={(e) => setFormData({ ...formData, biggest_challenge: e.target.value })}
                      placeholder="Ex: Não consigo acompanhar a execução dos planos de ação dos meus clientes..."
                      rows={5}
                      className="w-full rounded-xl p-4 text-base bg-white/5 border resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                      style={{ borderColor: "hsl(var(--dark-bg-foreground) / 0.1)", color: "hsl(var(--dark-bg-foreground))" }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky footer nav */}
          <div
            className="flex-shrink-0 border-t px-5 py-3 sm:px-8 sm:py-4 safe-bottom"
            style={{
              borderColor: "hsl(var(--dark-bg-foreground) / 0.08)",
              background: "hsl(var(--dark-bg))",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={prev}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:bg-white/5 active:scale-95"
                  style={{ color: "hsl(var(--dark-bg-foreground) / 0.7)" }}
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
              ) : (
                <button
                  onClick={handleSkip}
                  className="text-xs sm:text-sm transition-colors px-2 py-2 underline-offset-4 hover:underline"
                  style={{ color: "hsl(var(--dark-bg-foreground) / 0.45)" }}
                >
                  Pular e ir direto
                </button>
              )}

              {step < totalSteps - 1 ? (
                <Button variant="cta" onClick={next} disabled={!canAdvance()} className="rounded-full px-6 h-12 gap-2 text-sm sm:text-base font-semibold flex-shrink-0">
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="cta" onClick={handleSubmit} disabled={!canAdvance() || submitting} className="rounded-full px-5 sm:px-6 h-12 gap-2 text-sm sm:text-base font-semibold bg-[#25D366] hover:bg-[#20bd5a] flex-shrink-0">
                  {submitting ? "Enviando..." : "Enviar pelo WhatsApp"} <MessageSquare className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Hide AI helper on small screens (avoid overlap with sticky nav) */}
          <div className="hidden sm:block">
            <FormAIHelper currentStep={step} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
