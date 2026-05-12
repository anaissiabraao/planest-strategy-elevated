## Módulo de Blog — Plano de Implementação

Vou construir um módulo de Blog completo integrado ao Planest, mantendo a identidade visual atual (Space Grotesk, paleta dark blue + laranja) e usando o Lovable Cloud como backend.

> Observação técnica: o projeto roda em **React + Vite + React Router** (não Next.js). Não é possível usar SSR/SSG nem `next/image`. Vou entregar um equivalente performático com lazy loading, code-splitting por rota, meta tags dinâmicas via `react-helmet-async` e sitemap estático gerado no build. As tabelas e o auth ficam no Lovable Cloud (Supabase gerenciado).

---

### 1. Banco de Dados (Lovable Cloud)

Tabelas novas no schema `public`:

- **profiles** — `id (uuid → auth.users)`, `name`, `avatar_url`, `bio`. Auto-criada via trigger no signup.
- **user_roles** — `id`, `user_id`, `role` (enum `app_role`: `admin`, `editor`). Tabela separada (segurança).
- **categories** — `id`, `name`, `slug` (único), `description`.
- **tags** — `id`, `name`, `slug` (único).
- **blog_posts** — `id`, `title`, `slug` (único), `subtitle`, `content` (markdown/JSON), `excerpt`, `thumbnail_url`, `banner_url`, `author_id`, `category_id`, `status` (enum `post_status`: `draft|published|archived`), `seo_title`, `seo_description`, `views`, `reading_time`, `featured`, `published_at`, `scheduled_for`, `created_at`, `updated_at`.
- **post_tags** — `post_id`, `tag_id` (PK composta).
- **post_views** — `id`, `post_id`, `viewed_at`, `session_hash` — para analytics.

Função `has_role(uuid, app_role)` SECURITY DEFINER + função `increment_post_view(slug)`.

Bucket de Storage: **blog-media** (público para leitura, escrita apenas para admins/editors).

### 2. RLS

- `blog_posts`: leitura pública somente onde `status='published' AND published_at <= now()`. Insert/update/delete restrito a `has_role(auth.uid(),'admin'|'editor')`.
- `categories`/`tags`: leitura pública, escrita admin.
- `post_views`: insert público (anônimo), select admin.
- `user_roles`: select próprio + admin; escrita só admin.
- `profiles`: select público de campos básicos, update próprio.

### 3. Autenticação

- Email + senha (sem auto-confirm, conforme padrão).
- Página `/auth` com login/signup (signup desabilitado por padrão — apenas admins criam contas via dashboard, ou primeiro usuário vira admin via seed).
- Hook `useAuth` + `ProtectedRoute` para `/admin/*`.
- Listener `onAuthStateChange` configurado antes de `getSession`.

### 4. Rotas Públicas

- `/blog` — Hero com busca, post em destaque, grid de cards, filtros (categoria, ordenação: recentes/mais lidos/destaques), paginação.
- `/blog/:slug` — Post individual: banner, título, metadata (autor, data, tempo leitura, categoria), conteúdo renderizado (ChatMarkdown reaproveitado/expandido), tags, compartilhamento social (Twitter/LinkedIn/WhatsApp/copy link), posts relacionados (mesma categoria), incremento de view.
- `/blog/categoria/:slug` — Listagem por categoria.
- Link "Blog" adicionado ao header da Landing Page.

### 5. Painel Admin (`/admin/*`)

Layout com Sidebar (shadcn) — itens: Dashboard, Posts, Categorias, Tags, Mídia, Configurações.

- `/admin` → redireciona para dashboard.
- `/admin/dashboard` — métricas: total posts, publicados, drafts, views totais, top 5 posts, gráfico de views (recharts).
- `/admin/posts` — tabela com filtros (status, categoria, busca), ações (editar, duplicar, excluir, mudar status).
- `/admin/posts/novo` e `/admin/posts/:id/editar` — Editor com:
  - Campos: título (slug auto), subtítulo, excerpt, categoria, tags (multi-select com criação inline), thumbnail, banner, SEO title/description, status, scheduled_for.
  - Editor rich-text **TipTap** (StarterKit + Image + Link + CodeBlock + Placeholder + Typography).
  - Upload de imagens drag-and-drop direto no editor → Storage bucket.
  - Preview em tempo real (split view).
  - Autosave a cada 30s em draft.
- `/admin/categorias` e `/admin/tags` — CRUDs simples.
- `/admin/midia` — Biblioteca: grid de imagens do bucket, upload, delete, copiar URL.
- `/admin/configuracoes` — Perfil do usuário.

### 6. SEO

- `react-helmet-async` para meta tags dinâmicas por rota (title, description, canonical, OG, Twitter Card, JSON-LD `Article` em posts).
- `public/sitemap.xml` gerado em build via script que consulta posts publicados.
- `public/robots.txt` já existe — adicionar referência ao sitemap.

### 7. Performance e UX

- `React.lazy` + `Suspense` para todas as rotas admin e `/blog/:slug`.
- Lazy loading de imagens (`loading="lazy"`, `decoding="async"`).
- Skeletons (shadcn) em listas e detalhes.
- Empty states em todas as listagens.
- Toasts (sonner) em ações admin.
- Framer Motion em cards e transições de página.
- React Query com cache para reduzir requests.

### 8. Segurança

- Validação Zod em todos os formulários (client) e via constraints/RLS (server).
- Sanitização do HTML do TipTap com DOMPurify antes de renderizar no público.
- Upload validado: tipo (image/*), tamanho máx 5MB.
- Rate limiting de views por session_hash (1 view/post/hora).

### 9. Estrutura de arquivos

```
src/
  pages/
    Blog.tsx
    BlogPost.tsx
    BlogCategory.tsx
    Auth.tsx
    admin/
      AdminLayout.tsx
      Dashboard.tsx
      PostsList.tsx
      PostEditor.tsx
      Categories.tsx
      Tags.tsx
      Media.tsx
      Settings.tsx
  components/
    blog/
      BlogHero.tsx
      PostCard.tsx
      PostFilters.tsx
      ShareButtons.tsx
      RelatedPosts.tsx
      PostContent.tsx
    admin/
      AdminSidebar.tsx
      ProtectedRoute.tsx
      TipTapEditor.tsx
      MediaPicker.tsx
      StatusBadge.tsx
  hooks/
    useAuth.ts
    useRole.ts
    usePosts.ts
  lib/
    blog.ts
    slugify.ts
    seo.ts
scripts/
  generate-sitemap.ts
```

### 10. Dependências a adicionar

`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `react-helmet-async`, `dompurify`, `@types/dompurify`, `recharts` (já presente provavelmente).

### 11. Ordem de execução

1. Migration: enums, tabelas, RLS, função `has_role`, trigger profile, bucket storage, seed de categorias.
2. Auth (página + hook + ProtectedRoute).
3. Layout admin + sidebar + dashboard básico.
4. CRUD Posts + Categorias + Tags + Mídia.
5. Editor TipTap.
6. Área pública `/blog` + `/blog/:slug` + filtros + share + related.
7. Link "Blog" no header da landing.
8. SEO (helmet + sitemap script).
9. Skeletons, empty states, animações.
10. QA visual e testes manuais.

### O que **não** será incluído nesta entrega (fora de escopo deste plano)

- Comentários de usuários finais.
- Newsletter (integração com provedor externo).
- Editor colaborativo em tempo real.

Posso adicioná-los em iterações futuras.

---

**Confirma que posso prosseguir com este plano?** Após aprovação, executo a migration primeiro (vai pedir sua confirmação) e sigo com o código.
