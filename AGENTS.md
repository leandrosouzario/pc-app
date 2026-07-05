# PC App (Painel Corporativo) — Agent Guide

Aplicação em `https://pc.leandrosouza.info` com duplo papel no ecossistema:

1. **Provedor de autenticação central** — login, cadastro, magic link, reset de senha, callback OAuth, perfil de usuário
2. **Painel Corporativo** — portal de módulos internos (maioria ainda placeholder)

> **Situação de transição:** decidido arquiteturalmente que auth + perfil migrarão futuramente para o hub-app (`hub.leandrosouza.info/login`). Até lá, este repo é o provedor ativo. O Painel Corporativo (módulos) pode ser ressignificado como Painel de Controle/Admin.

> **Nome do repositório desatualizado:** o diretório e repo ainda se chamam `nextjs-landing`, refletindo a origem como landing page que evoluiu. Renomeação está pendente.

## Escopo atual

- Auth: login, cadastro, magic link, reset de senha (`/login`, `/auth/redefinir-senha`, `/auth/callback`)
- Perfil de usuário: nome, avatar, telefone, senha (`/perfil`)
- Portal de módulos: cards de módulos internos com status (`/`)
- Supabase: único repo com migrations de `public.profiles` e dados de localização

**Fora de escopo:** lógica de negócio de outras apps (treinos, anúncios), duplicar auth.

## Stack

Next.js 16 · React 18 · Tailwind · **JavaScript** (JSX) · Supabase SSR · porta **3000** · Docker `3000:3000`

## Estrutura

```
app/
  layout.jsx                  # root layout
  page.jsx                    # portal de módulos (ModulePortal, ServiceStatus, Roadmap)
  login/page.jsx              # AuthPanel — login/cadastro/magic link
  perfil/page.jsx             # ProfileForm — dados cadastrais
  auth/
    callback/route.js         # troca code por sessão; suporta next= absoluto cross-app
    redefinir-senha/page.jsx  # ResetPasswordForm
components/
  auth/
    AuthPanel.jsx             # tabs: Entrar / Criar conta / Entrar sem senha / Recuperar
    ResetPasswordForm.jsx
  profile/
    ProfileForm.jsx           # nome, avatar, telefone, senha
    AvatarUpload.jsx
    ChangePasswordForm.jsx
    PhoneInput.jsx
    BrazilLocationSelect.jsx / SearchableCombobox.jsx
  Header.jsx / Footer.jsx
  ModulePortal.jsx / ModuleCard.jsx
  ServiceStatus.jsx / Roadmap.jsx
lib/
  supabase/
    client.js / server.js / middleware.js / cookie-options.js / auth-redirect.js
  modules.js    # MODULES, ROADMAP_ITEMS, SERVICE_STATUS
  profile.js / password.js / phone.js / countries.js / location*.js
middleware.js   # updateSession — protege /perfil e /auth/redefinir-senha
supabase/
  migrations/   # SQLs de profiles e localização (executar na ordem numérica)
```

## Modelo de dados (Supabase — dono)

Este repo é o **dono** da tabela `public.profiles`:

| Tabela | Descrição |
|---|---|
| `public.profiles` | Perfil de usuário: `display_name`, `avatar_url`, `phone`, `country_code` |

### Migrations (ordem obrigatória)

```
001_profiles.sql               # tabela profiles, trigger em auth.users, RLS, bucket avatars
002_brazil_locations_schema.sql
003_seed_brazil_locations.sql
004_backfill_profile_locations.sql
```

## Autenticação cross-app

O callback em `/auth/callback` aceita `next=` com URL absoluta de outros subdomínios de `.leandrosouza.info`, permitindo o fluxo:

```
gym.leandrosouza.info → sem sessão
  → redirect para pc.leandrosouza.info/login?next=https://gym.leandrosouza.info/dashboard
  → login OK → /auth/callback?next=https://gym.leandrosouza.info/dashboard
  → redirect de volta ao gym já autenticado (cookie .leandrosouza.info)
```

Apps consumidoras configuram: `NEXT_PUBLIC_AUTH_LOGIN_URL=https://pc.leandrosouza.info/login`

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sim | `https://pc.leandrosouza.info` |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do Supabase self-hosted |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon do Supabase |

Arquivo usado no docker-compose: `.env.local`

## Convenções de código

- JavaScript + JSX. Sem TypeScript sem pedido explícito.
- Não duplicar lógica de auth em outras apps — toda UI de login/cadastro vive aqui.
- Migrations SQL em `supabase/migrations/`. Nunca alterar tabelas `bc_*` ou `gym_*`.
- Imports com alias `@/` (jsconfig.json).
- Server Components por padrão; `'use client'` em `Header.jsx` e componentes de form.

## Deploy

```bash
docker compose build --no-cache
docker compose up -d
```

Cloudflare Tunnel: `pc.leandrosouza.info` → host `:3000`

## Apps do ecossistema

| App | URL | Relação |
|---|---|---|
| Hub | `https://hub.leandrosouza.info` | Catálogo público; lista o PC como app |
| Gym | `https://gym.leandrosouza.info` | Consumidor de auth; redirect para `/login` |
| Balcão | `https://balcao.leandrosouza.info` | Consumidor de auth; redirect para `/login` e `/perfil` |
| Supabase | `https://supabase.leandrosouza.info` | Backend compartilhado |

## Git

`git@github.com:leandrosouzario/nextjs-landing.git` · branch `main`
