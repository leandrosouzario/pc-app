# PC App — Painel de Controle · Agent Guide

Dashboard de monitoramento do servidor, acessado em `https://pc.leandrosouza.info`.

**Acesso restrito:** somente usuários com `profiles.role = 'admin'` entram. Outros são redirecionados para `hub.leandrosouza.info`.

## Escopo

- Dashboard com métricas em tempo real do servidor: CPU, memória, uptime, containers Docker (`/dashboard`)
- API interna de métricas (`/api/metrics`) — autenticada + role admin
- Header session-aware com links para perfil e logout

**Fora de escopo:** autenticação própria (login, cadastro, reset), perfil de usuário, lógica de outras apps.

## Stack

Next.js 16 · React 18 · Tailwind · **JavaScript** (JSX) · Supabase SSR · porta **3000** · Docker `3000:3000`

## Estrutura

```
app/
  layout.jsx              # root layout (fundo escuro)
  page.jsx                # redirect → /dashboard
  dashboard/page.jsx      # cards de métricas com polling
  api/metrics/route.js    # GET métricas OS + Docker (protegido)
components/
  Header.jsx              # session-aware: email, Perfil, Sair
lib/
  modules.js              # links de módulos (se houver)
  supabase/
    client.js / server.js / middleware.js / cookie-options.js
middleware.js             # updateSession + verificação de role admin
```

## Autenticação e controle de acesso

O middleware em `lib/supabase/middleware.js` faz duas verificações:

1. **Sessão:** se não há usuário autenticado → redirect para `AUTH_LOGIN_URL?next=<URL>`.
2. **Role admin:** lê `profiles.role` do Supabase. Se não for `'admin'` → redirect para `https://hub.leandrosouza.info`.

Para promover um usuário a admin:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'usuario@exemplo.com';
```

## API de métricas (`GET /api/metrics`)

Retorna JSON com:
- CPU: load average (1, 5, 15 min) e número de CPUs
- Memória: total, usada, livre, swap (`/proc/meminfo`)
- Temperatura: CPU/NVMe via `/sys/class/thermal` (`thermal.cpuC`, `thermal.nvmeC`, `thermal.maxC`)
- Disco: uso de `/` do host (`/host` + `statfs`)
- Servidor: hostname, uptime, platform/arch
- Containers Docker: nome, imagem, status, estado e RAM (stats API)

Requer cookie de sessão válido com role `admin`. Volumes no container:
```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
  - /sys/class/thermal:/sys/class/thermal:ro
  - /:/host:ro
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Sim | `https://pc.leandrosouza.info` |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do Supabase self-hosted |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon do Supabase |
| `NEXT_PUBLIC_AUTH_LOGIN_URL` | Sim | `https://auth.leandrosouza.info/login` |
| `NEXT_PUBLIC_AUTH_PROFILE_URL` | Sim | `https://auth.leandrosouza.info/perfil` |

## Convenções de código

- JavaScript + JSX. Sem TypeScript sem pedido explícito.
- Não duplicar lógica de auth — login e perfil vivem no `auth-app`.
- Imports com alias `@/` (jsconfig.json).
- Server Components por padrão; `'use client'` no Header e componentes interativos.

## Deploy

```bash
docker compose build --no-cache
docker compose up -d
```

Cloudflare Tunnel: `pc.leandrosouza.info` → host `:3000`

## Apps do ecossistema

| App | URL | Relação |
|---|---|---|
| Hub | `https://hub.leandrosouza.info` | Não-admins são redirecionados para cá |
| Auth | `https://auth.leandrosouza.info` | Provedor de auth; perfil do usuário |
| Gym | `https://gym.leandrosouza.info` | App irmã, mesmo Supabase |
| Balcão | `https://balcao.leandrosouza.info` | App irmã, mesmo Supabase |
| Supabase | `https://supabase.leandrosouza.info` | Backend compartilhado |

## Git

`git@github.com:leandrosouzario/pc-app.git` · branch `main`
