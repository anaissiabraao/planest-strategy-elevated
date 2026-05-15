import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  phone: z.string().trim().min(8, "Telefone inválido").max(40),
  email: z.string().trim().email("E-mail inválido").max(200).optional().or(z.literal("")),
});

export type LeadInput = z.infer<typeof leadSchema> & {
  source?: "section_inline" | "modal_exit" | "whatsapp_form" | "blog" | "outro";
};

export async function submitLead(input: LeadInput) {
  const params = new URLSearchParams(window.location.search);
  const payload = {
    ...input,
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
  };
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-lead`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) throw new Error(typeof json.error === "string" ? json.error : "Falha ao enviar");
  return json;
}