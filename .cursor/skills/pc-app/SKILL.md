---
name: pc-app
description: >-
  Desenvolve o pc-app / nextjs-landing (pc.leandrosouza.info): provedor de
  auth Supabase, perfil de usuário, portal de módulos corporativos. JavaScript.
---

# PC App (Painel Corporativo)

## Novo módulo no portal

1. Adicionar entrada em `MODULES` em `lib/modules.js`:
   - `id`, `name`, `shortDescription`, `icon`, `status`, `statusLabel`, `featured`, `href`
   - Status: `active` | `available` | `coming_soon`
2. Se tiver link ativo, definir `href` (rota interna ou URL externa)
3. Conferir `components/ModulePortal.jsx` e `components/ModuleCard.jsx`

## Ajuste no fluxo de auth

- Login/cadastro/magic link/reset: `components/auth/AuthPanel.jsx`
- Reset de senha: `components/auth/ResetPasswordForm.jsx`
- Callback cross-app: `app/auth/callback/route.js`
  - Aceita `next=` com URL absoluta de `*.leandrosouza.info`
- Rotas protegidas: listar em `lib/supabase/middleware.js` → `protectedPaths`

## Novo campo no perfil de usuário

1. Adicionar coluna em `public.profiles` via migration SQL em `supabase/migrations/`
2. Atualizar `PROFILE_FIELDS` em `lib/profile.js`
3. Ajustar `components/profile/ProfileForm.jsx`
4. Atualizar trigger `handle_new_user()` se campo deve ser populado no cadastro

## Nova migration Supabase

1. Criar `supabase/migrations/<próximo_número>_<descricao>.sql`
2. Executar no Supabase Studio → SQL Editor na ordem numérica
3. Documentar no README na seção "Migrations"

## Verificar status dos serviços no portal

Editar `SERVICE_STATUS` em `lib/modules.js`:
```js
{ id: 'novo', name: 'Serviço X', status: 'online' | 'degraded' | 'offline' }
```

Ver [AGENTS.md](../../AGENTS.md).
