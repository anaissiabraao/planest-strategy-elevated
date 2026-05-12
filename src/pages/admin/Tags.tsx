import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { toast } from "@/hooks/use-toast";

interface Tag { id: string; name: string; slug: string; }

export default function Tags() {
  const [items, setItems] = useState<Tag[]>([]);
  const [name, setName] = useState("");

  async function load() {
    const { data } = await supabase.from("tags").select("id,name,slug").order("name");
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    const n = name.trim(); if (!n) return;
    const { error } = await supabase.from("tags").insert({ name: n, slug: slugify(n) });
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    setName(""); load();
  }
  async function remove(id: string) {
    if (!confirm("Excluir tag?")) return;
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    load();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-heading font-bold">Tags</h1>
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nova tag" onKeyDown={(e) => e.key === "Enter" && add()} />
        <Button onClick={add}><Plus className="h-4 w-4" /> Adicionar</Button>
      </div>
      <Card>
        <ul className="divide-y">
          {items.map((c) => (
            <li key={c.id} className="p-3 flex items-center justify-between">
              <div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">#{c.slug}</div></div>
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </li>
          ))}
          {items.length === 0 && <li className="p-6 text-center text-sm text-muted-foreground">Sem tags.</li>}
        </ul>
      </Card>
    </div>
  );
}