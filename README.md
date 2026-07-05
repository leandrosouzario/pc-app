# PC App — Painel Corporativo

Provedor de autenticação central e portal de módulos do ecossistema `leandrosouza.info`.

**URL de produção:** `https://pc.leandrosouza.info`  
**Porta local:** 3000

> **Nota sobre o nome:** o repositório e diretório ainda se chamam `nextjs-landing` por razões históricas (origem como landing page). Renomeação está pendente. O nome real da aplicação é Painel Corporativo / PC App.

## Stack

Next.js 16 · React 18 · Tailwind · JavaScript · Supabase SSR

## Papel no ecossistema

1. **Provedor de autenticação:** login, cadastro, magic link, reset de senha e perfil de usuário para todo o ecossistema.
2. **Portal de módulos:** painel corporativo com cards de acesso a módulos internos.

Outros apps (gym, balcão) redirecionam para `pc.leandrosouza.info/login` quando precisam de autenticação.

## Pré-requisitos

- Docker e Docker Compose

## Build e execução (Docker)

```bash
cp .env.example .env.local   # preencha as variáveis
docker compose build --no-cache
docker compose up -d
```

Aplicação disponível em `http://localhost:3000`.

## Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canônica desta app | `https://pc.leandrosouza.info` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase self-hosted | `https://supabase.leandrosouza.info` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase | `eyJ...` |

## Migrations Supabase

Execute no Supabase Studio → SQL Editor, nesta ordem:

1. `supabase/migrations/001_profiles.sql` — tabela `public.profiles`, trigger, RLS, bucket avatars
2. `supabase/migrations/002_brazil_locations_schema.sql`
3. `supabase/migrations/003_seed_brazil_locations.sql`
4. `supabase/migrations/004_backfill_profile_locations.sql`

## Estrutura

```
app/
  layout.jsx
  page.jsx                    # portal de módulos
  login/page.jsx              # AuthPanel
  perfil/page.jsx             # ProfileForm
  auth/
    callback/route.js         # troca code por sessão (suporta next= cross-app)
    redefinir-senha/page.jsx
components/
  auth/                       # AuthPanel, ResetPasswordForm
  profile/                    # ProfileForm, AvatarUpload, ChangePasswordForm, PhoneInput
  Header.jsx / Footer.jsx
  ModulePortal.jsx / ModuleCard.jsx
  ServiceStatus.jsx / Roadmap.jsx
lib/
  supabase/                   # client, server, middleware, cookie-options, auth-redirect
  modules.js                  # MODULES, ROADMAP_ITEMS, SERVICE_STATUS
  profile.js / password.js / phone.js / countries.js / location*.js
middleware.js
supabase/
  migrations/
```

## Escopo

- Toda UI de autenticação do ecossistema vive aqui.
- `public.profiles` é de responsabilidade deste repo.
- Não duplicar lógica de auth em gym-app, balcao-app ou outras apps.

## Desenvolvimento local (opcional)

Requer Node.js 18+ na máquina:

```bash
npm install
npm run dev
```

## Cloudflare Tunnel

```yaml
- hostname: pc.leandrosouza.info
  service: http://192.168.68.245:3000
```

## Git

`git@github.com:leandrosouzario/nextjs-landing.git` · branch `main`
