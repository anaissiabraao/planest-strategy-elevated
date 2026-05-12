import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function ImageUploadField({ label, value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(file: File) {
    if (!file.type.startsWith("image/")) return toast({ title: "Apenas imagens", variant: "destructive" });
    if (file.size > 5 * 1024 * 1024) return toast({ title: "Máx. 5MB", variant: "destructive" });
    setBusy(true);
    const path = `covers/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("blog-media").upload(path, file, { cacheControl: "3600" });
    setBusy(false);
    if (error) return toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    onChange(supabase.storage.from("blog-media").getPublicUrl(path).data.publicUrl);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden border">
          <img src={value} alt="" className="w-full h-40 object-cover" />
          <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7" onClick={() => onChange(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={busy}
          className="w-full h-40 rounded-lg border-2 border-dashed border-border hover:border-primary/60 flex flex-col items-center justify-center text-sm text-muted-foreground gap-2 transition-colors">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          {busy ? "Enviando…" : "Clique ou arraste para enviar"}
        </button>
      )}
      <Input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); e.target.value = ""; }}
      />
    </div>
  );
}