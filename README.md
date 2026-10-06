# PC App — Painel de Controle

Dashboard de monitoramento do servidor em tempo real.

**URL de produção:** `https://pc.leandrosouza.info`  
**Porta local:** 3000  
**Acesso:** restrito a usuários com `profiles.role = 'admin'`

## Stack

Next.js 16 · React 18 · Tailwind · JavaScript · Supabase SSR

## O que monitora

- **CPU:** load average (1, 5, 15 min)
- **Memória:** total, usada, livre e swap
- **Temperatura:** CPU (e NVMe quando disponível)
- **Disco:** uso do `/` do host
- **Uptime** do servidor
- **Docker containers:** nome, status e uso de RAM por container

Os dados são atualizados automaticamente a cada 10 segundos via polling do cliente.

## Pré-requisitos

- Docker e Docker Compose

## Build e execução (Docker)

```bash
cp .env.example .env   # preencha as variáveis
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
| `NEXT_PUBLIC_AUTH_LOGIN_URL` | URL de login do provedor central | `https://auth.leandrosouza.info/login` |
| `NEXT_PUBLIC_AUTH_PROFILE_URL` | URL de perfil do provedor central | `https://auth.leandrosouza.info/perfil` |

## Controle de acesso (admin)

O middleware verifica `profiles.role = 'admin'` após a autenticação. Para promover um usuário:

```sql
-- Execute no Supabase Studio → SQL Editor
UPDATE public.profiles SET role = 'admin' WHERE email = 'usuario@exemplo.com';
```

## Estrutura

```
app/
  layout.jsx              # root layout
  page.jsx                # redirect → /dashboard
  dashboard/page.jsx      # cards de métricas com auto-refresh
  api/metrics/route.js    # GET métricas (OS + Docker)
components/
  Header.jsx
lib/
  supabase/               # client, server, middleware, cookie-options
middleware.js
```

## Cloudflare Tunnel

```yaml
- hostname: pc.leandrosouza.info
  service: http://localhost:3000
```

## Git

`git@github.com:leandrosouzario/pc-app.git` · branch `main`
