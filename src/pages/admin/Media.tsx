import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Copy, Trash2, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileItem { name: string; url: string; }

export default function Media() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function load() {
    const folders = ["covers", "posts"];
    const all: FileItem[] = [];
    for (const folder of folders) {
      const { data } = await supabase.storage.from("blog-media").list(folder, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      for (const f of data ?? []) {
        const path = `${folder}/${f.name}`;
        all.push({ name: path, url: supabase.storage.from("blog-media").getPublicUrl(path).data.publicUrl });
      }
    }
    setItems(all);
  }
  useEffect(() => { load(); }, []);

  async function upload(file: File) {
    setBusy(true);
    const path = `posts/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("blog-media").upload(path, file);
    setBusy(false);
    if (error) return toast({ title: "Erro", description: error.message, variant: "destructive" });
    load();
  }

  async function remove(name: string) {
    if (!confirm("Excluir arquivo?")) return;
    await supabase.storage.from("blog-media").remove([name]);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-heading font-bold">Mídia</h1>
        <Button onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Enviar
        </Button>
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((f) => (
          <Card key={f.name} className="overflow-hidden group relative">
            <img src={f.url} alt={f.name} className="aspect-square object-cover w-full" loading="lazy" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <Button size="icon" variant="secondary" onClick={() => { navigator.clipboard.writeText(f.url); toast({ title: "URL copiada" }); }}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => remove(f.name)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">Nenhuma mídia ainda.</div>}
      </div>
    </div>
  );
}