# Plano: Analytics, Funil de Leads, CRM e Instagram no Admin

Vou entregar em 4 módulos integrados ao painel `/admin` existente, todos protegidos por RLS (`is_staff`).

## 1. Analytics da Landing Page
- **Tabela `page_views`**: rota, referrer, utm_source/medium/campaign, país (via header `cf-ipcountry` na edge), user-agent, session_hash, created_at.
- **Edge function `track-pageview`** (público, rate-limited): recebe POST e insere. CORS aberto.
- **Hook `usePageTracking`** chamado no `Index.tsx`, `ParaQuem`, `Blog` etc — 1 ping por sessão/rota.
- **GA4 paralelo**: snippet `gtag` no `index.html` com `VITE_GA4_ID` (pedirei o ID; se não tiver, deixo placeholder comentado).
- **Página `/admin/analitico`** com:
  - Cards: Visitas hoje / 7d / 30d, Visitantes únicos, Taxa de conversão (leads/visitas).
  - Gráfico de linha (Recharts) — visitas por dia.
  - Top referrers, top UTM source, top páginas, distribuição por país.
  - Botão "Abrir GA4" se ID configurado.

## 2. Funil de Captura de Telefone
- **Tabela `leads`** (separada de `lead_responses` que é o WhatsApp form):
  - name, phone, email?, source ('modal_exit' | 'section_inline' | 'whatsapp_form'), utm_*, status (kanban), notes, ai_score, ai_goal, owner_id, created_at, updated_at.
- **Componente `<LeadFunnelSection />`**: bloco fixo entre "Solução" e "Transformação" — headline forte, input nome+telefone, CTA "Quero falar com um especialista". Validação Zod.
- **Componente `<ExitIntentModal />`**: dispara em mouseleave (desktop) ou após 45s + 50% scroll (mobile). LocalStorage flag para não repetir.
- **Edge function `capture-lead`**: valida (Zod), insere em `leads`, retorna ok. Rate limit por IP.

## 3. CRM Kanban
- **Página `/admin/crm`**:
  - 5 colunas: Novo → Contato → Qualificado → Proposta → Fechado (+ Perdido como coluna lateral).
  - Cards drag-and-drop com `@dnd-kit/core` (já no stack? senão instalo).
  - Cada card: nome, telefone (link wa.me), source, score IA, badge UTM.
  - Click abre Drawer com: dados completos, timeline de notas, campo para nova nota, botão "Analisar com IA".
- **Tabela `lead_notes`**: lead_id, body, author_id, created_at.
- **IA de Conversão (edge `crm-ai-coach`)**: recebe lead_id, busca dados+notas, usa `google/gemini-3-flash-preview` via Lovable AI Gateway. Retorna:
  - `score` (0-100), `intent`, `next_best_action`, `suggested_message` (pt-BR, tom Planest), `objectives` (3 metas SMART para conversão).
  - Salva em `leads.ai_score`, `leads.ai_goal`, `leads.ai_suggestion`.

## 4. Estratégia Instagram
- **Tabela `instagram_posts`**: caption, hashtags, media_url?, scheduled_for, status ('idea'|'scheduled'|'published'), pillar (educacional/case/social_proof/CTA), goal_metric, ai_generated bool.
- **Página `/admin/instagram`**:
  - Calendário mensal com posts agendados (grid simples).
  - Botão "Gerar plano semanal com IA" → edge `instagram-strategist` (Gemini) gera 7 posts focados em conversão de SaaS de planejamento estratégico.
  - Editor de post com preview (foto + caption).
- **Agendamento real**: requer Meta Graph API + conta Instagram Business + Facebook Page + token de longa duração + App Review da Meta (semanas). 
  - **Vou entregar a infraestrutura**: edge `instagram-publish` que aceita `IG_ACCESS_TOKEN` + `IG_BUSINESS_ID` (secrets) e chama Graph API. Cron pg_cron a cada 5min publica posts com `scheduled_for <= now()`.
  - **Você precisa**, depois: criar app Meta, conectar página, gerar token, e me passar via secret. Sem isso o botão "Publicar agora" mostra aviso de configuração pendente.

## Migrations (uma só)
- Cria tabelas `page_views`, `leads`, `lead_notes`, `instagram_posts`.
- Enums `lead_status`, `ig_post_status`, `lead_source`, `ig_pillar`.
- RLS: `page_views` (insert público, select staff), `leads` (insert público, CRUD staff), `lead_notes` (CRUD staff), `instagram_posts` (CRUD staff).
- Triggers `updated_at`.

## Sidebar do Admin
Adiciono 3 itens novos: **Analítico** (BarChart3), **CRM** (Users), **Instagram** (Instagram icon).

## Observações
- Não vou tocar nas tabelas existentes.
- IA usa Lovable AI (sem custo de API key).
- Instagram real publishing fica funcional após você fornecer credenciais Meta — código pronto.
- GA4 fica opcional (se não passar ID, só o tracking próprio funciona).

Posso começar?
