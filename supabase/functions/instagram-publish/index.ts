import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getCorsHeaders } from "../_shared/cors.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function publishPost(post: any) {
  const token = Deno.env.get("IG_ACCESS_TOKEN");
  const igId = Deno.env.get("IG_BUSINESS_ID");
  if (!token || !igId) throw new Error("Configure IG_ACCESS_TOKEN e IG_BUSINESS_ID nos secrets para publicar de fato.");
  if (!post.media_url) throw new Error("Post sem media_url.");

  const captionFull = `${post.caption}\n\n${post.hashtags || ""}`.trim();
  // 1) Create container
  const createUrl = `https://graph.facebook.com/v20.0/${igId}/media?image_url=${encodeURIComponent(post.media_url)}&caption=${encodeURIComponent(captionFull)}&access_token=${token}`;
  const cRes = await fetch(createUrl, { method: "POST" });
  const cJson = await cRes.json();
  if (!cRes.ok || !cJson.id) throw new Error(`Container error: ${JSON.stringify(cJson)}`);
  // 2) Publish
  const pubUrl = `https://graph.facebook.com/v20.0/${igId}/media_publish?creation_id=${cJson.id}&access_token=${token}`;
  const pRes = await fetch(pubUrl, { method: "POST" });
  const pJson = await pRes.json();
  if (!pRes.ok || !pJson.id) throw new Error(`Publish error: ${JSON.stringify(pJson)}`);
  return pJson.id as string;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const body = await req.json().catch(() => ({}));
    // Manual trigger requires staff auth; cron trigger uses service role internally — skip auth if no body.post_id (run due posts)
    const auth = req.headers.get("authorization");
    let runDue = !body?.post_id;

    if (!runDue) {
      if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
      const { data: staffOk } = await supabase.rpc("is_staff", { _user_id: user.id });
      if (!staffOk) return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    }

    let posts: any[] = [];
    if (runDue) {
      const { data } = await supabase.from("instagram_posts").select("*").eq("status", "scheduled").lte("scheduled_for", new Date().toISOString()).limit(5);
      posts = data || [];
    } else {
      const { data } = await supabase.from("instagram_posts").select("*").eq("id", body.post_id).maybeSingle();
      if (data) posts = [data];
    }

    const results: any[] = [];
    for (const p of posts) {
      try {
        const igMediaId = await publishPost(p);
        await supabase.from("instagram_posts").update({ status: "published", published_at: new Date().toISOString(), ig_media_id: igMediaId, error_message: null }).eq("id", p.id);
        results.push({ id: p.id, ok: true, ig_media_id: igMediaId });
      } catch (e) {
        const msg = String((e as Error).message);
        await supabase.from("instagram_posts").update({ status: "failed", error_message: msg }).eq("id", p.id);
        results.push({ id: p.id, ok: false, error: msg });
      }
    }
    return new Response(JSON.stringify({ ok: true, results }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});