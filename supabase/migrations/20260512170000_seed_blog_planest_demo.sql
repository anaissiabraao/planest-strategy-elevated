-- Seed opcional: artigos de demonstração (blog Planest / estratégia).
-- Executa após as tabelas blog_* existirem. Idempotente por slug (ON CONFLICT).

INSERT INTO public.tags (name, slug) VALUES
  ('Estratégia', 'estrategia-tag'),
  ('Operações', 'operacoes'),
  ('B2B', 'b2b')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.blog_posts (
  title,
  slug,
  subtitle,
  content,
  excerpt,
  author_id,
  category_id,
  status,
  seo_title,
  seo_description,
  reading_time,
  featured,
  published_at
) VALUES
  (
    'Alinhar estratégia à operação (sem perder o prazo)',
    'alinhar-estrategia-operacao',
    'Da meta à execução: um guia curto para times de logística e serviços.',
    E'# Alinhar estratégia à operação\n\n'
    E'Quando a operação "vive no apagar incêndios", a estratégia parece distante. '
    E'O caminho é **traduzir prioridades em rituais semanais**, métricas simples e donos claros.\n\n'
    E'## O que fazer na prática\n\n'
    E'- **Uma página de prioridades** (3–5 temas) visível para todos.\n'
    E'- **Revisão semanal curta** (30 min): o que avançou, o que bloqueou, próximo passo.\n'
    E'- **Indicador único por tema** — evita painel que ninguém abre.\n\n'
    E'> Este conteúdo é *seed* de demonstração; substitua pelo texto real do WordPress quando exportar.\n',
    'Prioridades visíveis, rituais curtos e um indicador por tema para ligar estratégia ao dia a dia.',
    NULL,
    (SELECT id FROM public.categories WHERE slug = 'estrategia' LIMIT 1),
    'published',
    'Alinhar estratégia à operação | Planest',
    'Guia curto para alinhar planejamento e execução em operações B2B.',
    5,
    true,
    now() - interval '3 days'
  ),
  (
    'Indicadores que a equipe realmente usa',
    'indicadores-equipe-uso',
    'Menos métricas, mais decisão: escolha o mínimo necessário para aprender rápido.',
    E'# Indicadores que a equipe usa\n\n'
    E'Métricas boas respondem a uma pergunta de decisão. Se não mudam comportamento em 48h, '
    E'provavelmente são ruído.\n\n'
    E'## Checklist\n\n'
    E'1. Qual decisão esta métrica habilita?\n'
    E'2. Quem é o dono e com que frequência revisamos?\n'
    E'3. Qual é o "bom o suficiente" e o "precisamos agir"?\n',
    'Métricas mínimas, dono claro e limiares de ação — para o painel não virar enfeite.',
    NULL,
    (SELECT id FROM public.categories WHERE slug = 'gestao' LIMIT 1),
    'published',
    'Indicadores úteis para a equipe | Planest',
    'Como escolher poucas métricas que geram ação na operação.',
    4,
    false,
    now() - interval '7 days'
  ),
  (
    'Tecnologia a serviço do processo, e não o contrário',
    'tecnologia-servico-processo',
    'Ferramentas só geram ROI quando o fluxo de trabalho está claro.',
    E'# Tecnologia a serviço do processo\n\n'
    E'Automatizar um processo ruim acelera o erro. Primeiro **simplifique e documente o fluxo**, '
    E'depois escolha integrações com critério de manutenção e suporte.\n\n'
    E'## Perguntas úteis\n\n'
    E'- Onde nasce o dado e quem valida?\n'
    E'- O que acontece quando a API cai?\n'
    E'- Qual é o plano B em papel?\n',
    'Ordem sugerida: fluxo claro, menos exceções manuais, depois ferramentas.',
    NULL,
    (SELECT id FROM public.categories WHERE slug = 'tecnologia' LIMIT 1),
    'published',
    'Tecnologia e processo | Planest',
    'Por que mapear o processo antes de escalar com ferramentas.',
    3,
    false,
    now() - interval '14 days'
  )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.post_tags (post_id, tag_id)
SELECT b.id, t.id
FROM public.blog_posts b
JOIN public.tags t ON t.slug = 'estrategia-tag'
WHERE b.slug = 'alinhar-estrategia-operacao'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_tags (post_id, tag_id)
SELECT b.id, t.id
FROM public.blog_posts b
JOIN public.tags t ON t.slug = 'operacoes'
WHERE b.slug = 'alinhar-estrategia-operacao'
ON CONFLICT DO NOTHING;

INSERT INTO public.post_tags (post_id, tag_id)
SELECT b.id, t.id
FROM public.blog_posts b
JOIN public.tags t ON t.slug = 'b2b'
WHERE b.slug = 'indicadores-equipe-uso'
ON CONFLICT DO NOTHING;
