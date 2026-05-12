import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const email = "admin@planest.com.br";
  const password = "A7r8O+X!Z!d9";

  // Try create
  let userId: string | null = null;
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Admin Planest" },
  });

  if (createErr) {
    // Likely already exists — fetch
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const existing = list?.users.find((u) => u.email === email);
    if (!existing) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    userId = existing.id;
    // Ensure password is set to the requested one
    await admin.auth.admin.updateUserById(userId, { password, email_confirm: true });
  } else {
    userId = created.user!.id;
  }

  // Assign admin role
  const { error: roleErr } = await admin
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  if (roleErr) {
    return new Response(JSON.stringify({ userId, roleError: roleErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, userId, email }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});