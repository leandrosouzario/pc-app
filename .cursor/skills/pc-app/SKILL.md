---
name: pc-app
description: >-
  Desenvolve o pc-app — Painel de Controle do servidor (pc.leandrosouza.info):
  dashboard de métricas em tempo real, API de métricas, controle de acesso admin. JavaScript.
---

# PC App (Painel de Controle)

## Adicionar ou modificar uma métrica no dashboard

1. Expor o dado na API: `app/api/metrics/route.js`
   - Adicionar campo no objeto retornado pelo `GET`
2. Consumir no cliente: `app/dashboard/page.jsx`
   - Ler o campo em `metrics?.novoGrupo`
   - Adicionar um `<Card>` com os valores desejados
   - Usar `<Skeleton />` enquanto o dado é `null`/`undefined`

## Ajustar estilo do dashboard

- Cards: componente `<Card title="...">` em `app/dashboard/page.jsx`
- Cores de status: funções `pct()` e `barColor()` (thresholds: 60% amarelo, 85% vermelho)
- Barra de progresso: componente `<ProgressBar value={n} />`
- Intervalo de polling: constante `INTERVALS` (sistema: 5 s, containers: 10 s)

## Alterar o Header

- Arquivo: `components/Header.jsx`
- Links de navegação: array `NAV_LINKS` (vazio por padrão — adicionar `{ href, label }` se necessário)
- Link de perfil: `AUTH_PROFILE_URL` → `auth.leandrosouza.info/perfil`
- Logout: chama `supabase.auth.signOut()` e redireciona para `/`

## Ajustar controle de acesso

- Arquivo: `lib/supabase/middleware.js`
- Fluxo: sem sessão → redirect para `AUTH_LOGIN_URL?next=<URL absoluta>`; autenticado mas não admin → redirect para `hub.leandrosouza.info`
- Verificação de role: lê `profiles.role` via Supabase (`maybeSingle()`)
- Para promover usuário a admin:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'usuario@exemplo.com';
  ```

## Deploy

```bash
docker compose build --no-cache
docker compose up -d
```

Ver [AGENTS.md](../../AGENTS.md).
