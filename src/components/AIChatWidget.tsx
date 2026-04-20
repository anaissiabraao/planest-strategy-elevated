import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAutoCollapse } from "@/hooks/useAutoCollapse";
import ChatMarkdown from "@/components/ChatMarkdown";

type Msg = { role: "user" | "assistant"; content: string };

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! 👋 Eu sou a **IA do Planest**.\n\nPosso te explicar:\n\n- 📊 Módulos de planejamento (SWOT, BSC, OKR, Canvas)\n- 🎯 Como aplicar em consultorias e PMEs\n- 🤝 Como agendar uma demonstração\n\nO que você gostaria de saber primeiro?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { expanded, expand, collapseNow } = useAutoCollapse(4000, 4000);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: allMessages },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Desculpe, não consegui processar sua mensagem." },
      ]);
    } catch (e) {
      console.error("AI chat error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Desculpe, houve um erro. Tente novamente em alguns instantes." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button - positioned above WhatsApp */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              collapseNow();
              setOpen(true);
            }}
            onMouseEnter={expand}
            onTouchStart={expand}
            onFocus={expand}
            style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
            className={`fixed right-5 z-50 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-all duration-300 ${
              expanded ? "w-14 h-14 opacity-100" : "w-10 h-10 opacity-60 hover:opacity-100"
            }`}
            aria-label="Abrir chat com IA"
          >
            <Bot size={expanded ? 24 : 18} className="transition-all duration-300" />
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
            transition={{ duration: 0.25 }}
            style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
            className="fixed right-5 z-50 w-[400px] max-w-[calc(100vw-2.5rem)] h-[560px] max-h-[calc(100dvh-8rem)] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-br from-primary to-primary/85 text-primary-foreground rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-primary-foreground/15 flex items-center justify-center backdrop-blur-sm">
                    <Bot size={18} />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm leading-tight">IA Planest</p>
                  <p className="text-[11px] opacity-80 leading-tight">Online · responde em segundos</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-primary-foreground/15 transition-colors"
                aria-label="Fechar chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-background to-muted/40"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mb-0.5">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-card border border-border/60 text-foreground rounded-bl-md"
                    }`}
                  >
                    <ChatMarkdown content={msg.content} variant={msg.role} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mb-0.5">
                    <Bot size={14} />
                  </div>
                  <div className="bg-card border border-border/60 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 px-3 py-3 border-t border-border bg-card"
            >
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-muted/60 border border-border/60 focus-within:border-accent/60 transition-colors">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua pergunta..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                variant="cta"
                size="icon"
                className="rounded-full w-10 h-10 flex-shrink-0 shadow-sm"
                disabled={loading || !input.trim()}
                aria-label="Enviar mensagem"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
