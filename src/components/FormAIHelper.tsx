import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Sparkles, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAutoCollapse } from "@/hooks/useAutoCollapse";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STEP_CONTEXTS: Record<number, string> = {
  0: "O usuário está preenchendo nome, e-mail e telefone. Ajude-o a entender por que pedimos esses dados.",
  1: "O usuário está escolhendo seu perfil (consultor independente, empresa de consultoria, gestor ou outro).",
  2: "O usuário está informando o tamanho da equipe.",
  3: "O usuário está selecionando suas maiores dores no planejamento estratégico.",
  4: "O usuário está informando suas ferramentas atuais e frequência de planejamento estratégico.",
  5: "O usuário está descrevendo seu maior desafio com planejamento estratégico.",
};

export default function FormAIHelper({ currentStep }: { currentStep: number }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { expanded, expand, collapseNow } = useAutoCollapse(4000, 4000);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const contextNote = STEP_CONTEXTS[currentStep] || "";
      const systemContext = `O usuário está preenchendo um formulário de qualificação do Planest. ${contextNote} Ajude-o com dúvidas sobre o que responder ou sobre o Planest. Seja breve e amigável.`;

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            { role: "user", content: `[Contexto do sistema: ${systemContext}]` },
            ...newMessages,
          ],
        },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Desculpe, tente novamente." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao conectar. Tente novamente." },
      ]);
    }
    setLoading(false);
  }

  return (
    <>
      {/* Floating button — discreto, abaixo do header do modal */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => {
              collapseNow();
              setOpen(true);
            }}
            onMouseEnter={expand}
            onTouchStart={expand}
            onFocus={expand}
            aria-label="Preciso de ajuda"
            className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-95 group ${
              expanded
                ? "gap-1.5 pl-2 pr-3 py-1.5 opacity-100"
                : "w-8 h-8 sm:w-9 sm:h-9 justify-center opacity-50 hover:opacity-100"
            }`}
            style={{
              background: "hsl(var(--dark-bg-foreground) / 0.08)",
              border: "1px solid hsl(var(--dark-bg-foreground) / 0.12)",
              color: "hsl(var(--dark-bg-foreground))",
            }}
          >
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
              style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}
            >
              <Sparkles className="w-3 h-3 text-white" />
            </span>
            {expanded && (
              <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap">
                Ajuda da IA
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto z-50 w-full md:w-96 md:rounded-2xl rounded-t-2xl shadow-2xl border overflow-hidden flex flex-col"
            style={{
              background: "hsl(var(--dark-bg))",
              borderColor: "hsl(var(--dark-bg-foreground) / 0.1)",
              maxHeight: "85dvh",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "hsl(var(--dark-bg-foreground) / 0.1)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "hsl(var(--accent) / 0.15)" }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--accent))" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--dark-bg-foreground))" }}>
                    Assistente Planest
                  </p>
                  <p className="text-[10px]" style={{ color: "hsl(var(--dark-bg-foreground) / 0.5)" }}>
                    Tire suas dúvidas sobre o formulário
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: "hsl(var(--dark-bg-foreground) / 0.5)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "200px" }}>
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--dark-bg-foreground) / 0.2)" }} />
                  <p className="text-xs" style={{ color: "hsl(var(--dark-bg-foreground) / 0.4)" }}>
                    Tem alguma dúvida sobre o que responder? Pergunte aqui!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-xl text-sm"
                    style={{
                      background:
                        msg.role === "user"
                          ? "hsl(var(--accent))"
                          : "hsl(var(--dark-bg-foreground) / 0.08)",
                      color:
                        msg.role === "user"
                          ? "white"
                          : "hsl(var(--dark-bg-foreground) / 0.9)",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-3 py-2 rounded-xl"
                    style={{ background: "hsl(var(--dark-bg-foreground) / 0.08)" }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "hsl(var(--accent))" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t" style={{ borderColor: "hsl(var(--dark-bg-foreground) / 0.1)" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 bg-transparent border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1"
                  style={{
                    borderColor: "hsl(var(--dark-bg-foreground) / 0.1)",
                    color: "hsl(var(--dark-bg-foreground))",
                    // @ts-ignore
                    "--tw-ring-color": "hsl(var(--accent))",
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2 rounded-xl transition-colors disabled:opacity-30"
                  style={{ background: "hsl(var(--accent))", color: "white" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
