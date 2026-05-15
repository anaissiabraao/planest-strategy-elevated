import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { Loader2, Sparkles, Phone, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";

type LeadStatus = "novo" | "contato" | "qualificado" | "proposta" | "fechado" | "perdido";
type Lead = {
  id: string; name: string; phone: string; email: string | null; source: string; status: LeadStatus;
  utm_source: string | null; page: string | null; created_at: string;
  ai_score: number | null; ai_intent: string | null; ai_next_action: string | null; ai_suggested_message: string | null; ai_objectives: string[] | null;
};
type Note = { id: string; body: string; kind: string; created_at: string };

const COLUMNS: { id: LeadStatus; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "contato", label: "Contato" },
  { id: "qualificado", label: "Qualificado" },
  { id: "proposta", label: "Proposta" },
  { id: "fechado", label: "Fechado" },
  { id: "perdido", label: "Perdido" },
];

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-3 cursor-grab hover:shadow-md transition-shadow" onClick={onClick}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{lead.name}</p>
            <p className="text-xs text-muted-foreground truncate">{lead.phone}</p>
          </div>
          {lead.ai_score != null && (
            <Badge variant={lead.ai_score >= 70 ? "default" : "secondary"} className="text-xs shrink-0">{lead.ai_score}</Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
          {lead.utm_source && <Badge variant="outline" className="text-[10px]">{lead.utm_source}</Badge>}
        </div>
      </Card>
    </div>
  );
}

function Column({ id, label, leads, onCardClick }: { id: LeadStatus; label: string; leads: Lead[]; onCardClick: (l: Lead) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`rounded-xl border bg-muted/30 p-3 min-h-[400px] flex flex-col ${isOver ? "ring-2 ring-primary" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <Badge variant="secondary" className="text-xs">{leads.length}</Badge>
      </div>
      <div className="space-y-2 flex-1">
        {leads.map(l => <LeadCard key={l.id} lead={l} onClick={() => onCardClick(l)} />)}
      </div>
    </div>
  );
}

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Lead | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads((data as any) || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const m: Record<LeadStatus, Lead[]> = { novo: [], contato: [], qualificado: [], proposta: [], fechado: [], perdido: [] };
    leads.forEach(l => m[l.status].push(l));
    return m;
  }, [leads]);

  async function onDragEnd(e: DragEndEvent) {
    const id = String(e.active.id);
    const over = e.over?.id as LeadStatus | undefined;
    if (!over) return;
    const lead = leads.find(l => l.id === id);
    if (!lead || lead.status === over) return;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: over } : l));
    const { error } = await supabase.from("leads").update({ status: over }).eq("id", id);
    if (error) { toast.error("Falha ao mover"); load(); }
  }

  async function openLead(l: Lead) {
    setActive(l);
    const { data } = await supabase.from("lead_notes").select("*").eq("lead_id", l.id).order("created_at");
    setNotes((data as any) || []);
  }

  async function addNote() {
    if (!newNote.trim() || !active) return;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("lead_notes").insert({ lead_id: active.id, body: newNote.trim(), author_id: u.user?.id, kind: "note" });
    if (error) return toast.error("Falha ao salvar nota");
    setNewNote("");
    const { data } = await supabase.from("lead_notes").select("*").eq("lead_id", active.id).order("created_at");
    setNotes((data as any) || []);
  }

  async function runAI() {
    if (!active) return;
    setAiBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crm-ai-coach`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ lead_id: active.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Falha");
      toast.success("Análise IA atualizada");
      const { data } = await supabase.from("leads").select("*").eq("id", active.id).single();
      setActive(data as any);
      const { data: ns } = await supabase.from("lead_notes").select("*").eq("lead_id", active.id).order("created_at");
      setNotes((ns as any) || []);
      load();
    } catch (e) {
      toast.error(String((e as Error).message));
    } finally {
      setAiBusy(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">CRM</h1>
        <p className="text-sm text-muted-foreground">{leads.length} leads · Arraste para mover entre estágios</p>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {COLUMNS.map(c => <Column key={c.id} id={c.id} label={c.label} leads={grouped[c.id]} onCardClick={openLead} />)}
        </div>
        <DragOverlay />
      </DndContext>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild><a href={`https://wa.me/${active.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageSquare className="h-3.5 w-3.5" /> WhatsApp</a></Button>
                  <Button size="sm" variant="outline" asChild><a href={`tel:${active.phone}`}><Phone className="h-3.5 w-3.5" /> Ligar</a></Button>
                  {active.email && <Button size="sm" variant="outline" asChild><a href={`mailto:${active.email}`}><Mail className="h-3.5 w-3.5" /> E-mail</a></Button>}
                </div>

                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><span className="font-medium text-foreground">Telefone:</span> {active.phone}</p>
                  {active.email && <p><span className="font-medium text-foreground">E-mail:</span> {active.email}</p>}
                  <p><span className="font-medium text-foreground">Origem:</span> {active.source}</p>
                  {active.utm_source && <p><span className="font-medium text-foreground">UTM:</span> {active.utm_source}</p>}
                  {active.page && <p><span className="font-medium text-foreground">Página:</span> {active.page}</p>}
                  <p><span className="font-medium text-foreground">Recebido:</span> {format(new Date(active.created_at), "dd/MM/yyyy HH:mm")}</p>
                </div>

                <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Coach IA de conversão</h4>
                    <Button size="sm" onClick={runAI} disabled={aiBusy}>{aiBusy ? "Analisando..." : "Analisar com IA"}</Button>
                  </div>
                  {active.ai_score != null ? (
                    <div className="space-y-2 text-sm">
                      <p><Badge>{active.ai_score}/100</Badge> <span className="text-muted-foreground">{active.ai_intent}</span></p>
                      {active.ai_next_action && <p><span className="font-medium">Próxima ação:</span> {active.ai_next_action}</p>}
                      {active.ai_objectives && active.ai_objectives.length > 0 && (
                        <div>
                          <p className="font-medium mb-1">Objetivos:</p>
                          <ul className="list-disc list-inside text-xs space-y-1 text-muted-foreground">
                            {active.ai_objectives.map((o, i) => <li key={i}>{o}</li>)}
                          </ul>
                        </div>
                      )}
                      {active.ai_suggested_message && (
                        <div className="rounded-md bg-background p-3 border mt-2">
                          <p className="text-xs font-medium mb-1 text-muted-foreground">Mensagem sugerida:</p>
                          <p className="text-sm whitespace-pre-wrap">{active.ai_suggested_message}</p>
                          <Button size="sm" variant="link" className="px-0 mt-1" onClick={() => { navigator.clipboard.writeText(active.ai_suggested_message!); toast.success("Copiado!"); }}>Copiar</Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Clique em "Analisar com IA" para gerar score, intenção, próxima ação e mensagem pronta.</p>
                  )}
                </Card>

                <div>
                  <h4 className="font-semibold mb-2">Histórico</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notes.map(n => (
                      <div key={n.id} className={`text-sm rounded-md p-2 border ${n.kind === "ai" ? "bg-accent/5" : "bg-muted/30"}`}>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{n.kind === "ai" ? "IA" : "Nota"} · {format(new Date(n.created_at), "dd/MM HH:mm")}</p>
                        <p className="whitespace-pre-wrap">{n.body}</p>
                      </div>
                    ))}
                    {notes.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma nota ainda.</p>}
                  </div>
                  <Textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Nova nota..." className="mt-2" />
                  <Button size="sm" onClick={addNote} className="mt-2">Salvar nota</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}