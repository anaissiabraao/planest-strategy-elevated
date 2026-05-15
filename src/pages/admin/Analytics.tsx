import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type View = { path: string; referrer: string | null; utm_source: string | null; country: string | null; created_at: string; session_hash: string | null };

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [views, setViews] = useState<View[]>([]);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    (async () => {
      const since = subDays(new Date(), 30).toISOString();
      const [v, l] = await Promise.all([
        supabase.from("page_views").select("path, referrer, utm_source, country, created_at, session_hash").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
        supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since),
      ]);
      setViews((v.data as any) || []);
      setLeadsCount(l.count || 0);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today0 = startOfDay(now).getTime();
    const d7 = subDays(now, 7).getTime();
    const today = views.filter(v => new Date(v.created_at).getTime() >= today0).length;
    const last7 = views.filter(v => new Date(v.created_at).getTime() >= d7).length;
    const last30 = views.length;
    const unique = new Set(views.map(v => v.session_hash || "")).size;
    const conv = last30 ? ((leadsCount / last30) * 100).toFixed(1) : "0";
    return { today, last7, last30, unique, conv };
  }, [views, leadsCount]);

  const series = useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const k = format(subDays(new Date(), i), "dd/MM");
      map[k] = 0;
    }
    views.forEach(v => {
      const k = format(new Date(v.created_at), "dd/MM");
      if (k in map) map[k]++;
    });
    return Object.entries(map).map(([date, value]) => ({ date, value }));
  }, [views]);

  const topBy = (key: keyof View) => {
    const m: Record<string, number> = {};
    views.forEach(v => {
      const k = (v[key] as string) || "(direto)";
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).sort((a,b) => b[1]-a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  };

  const topRef = useMemo(() => topBy("referrer"), [views]);
  const topPath = useMemo(() => topBy("path"), [views]);
  const topUtm = useMemo(() => topBy("utm_source"), [views]);
  const topCountry = useMemo(() => topBy("country"), [views]);

  const ga4 = import.meta.env.VITE_GA4_ID;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Analítico</h1>
          <p className="text-sm text-muted-foreground">Tráfego da landing nos últimos 30 dias</p>
        </div>
        {ga4 && (
          <Button variant="outline" asChild>
            <a href={`https://analytics.google.com/`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Abrir GA4</a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Hoje", value: stats.today },
          { label: "7 dias", value: stats.last7 },
          { label: "30 dias", value: stats.last30 },
          { label: "Únicos (30d)", value: stats.unique },
          { label: "Conversão", value: `${stats.conv}%` },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Visitas por dia</CardTitle></CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Top páginas", data: topPath },
          { title: "Top referrers", data: topRef },
          { title: "Top UTM source", data: topUtm },
          { title: "Top países", data: topCountry },
        ].map(({ title, data }) => (
          <Card key={title}>
            <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}