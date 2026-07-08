# Setup — PC App (Painel de Controle)

## Pré-requisito

- Docker e Docker Compose instalados no host

## Configuração

```bash
cp .env.example .env
```

Preencha as variáveis no `.env`:

| Variável | Descrição | Exemplo |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL canônica desta app | `https://pc.leandrosouza.info` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase self-hosted | `https://supabase.leandrosouza.info` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase | `eyJ...` |
| `NEXT_PUBLIC_AUTH_LOGIN_URL` | URL de login do auth-app | `https://auth.leandrosouza.info/login` |
| `NEXT_PUBLIC_AUTH_PROFILE_URL` | URL de perfil do auth-app | `https://auth.leandrosouza.info/perfil` |

## Build e execução

```bash
docker compose build --no-cache
docker compose up -d
```

Aplicação disponível em `http://localhost:3000`.

## Estrutura

```
app/
  layout.jsx              # root layout (fundo escuro)
  page.jsx                # redirect → /dashboard
  dashboard/page.jsx      # cards de métricas com polling automático
  api/metrics/route.js    # GET métricas OS + Docker (requer sessão admin)
components/
  Header.jsx              # session-aware: email, Perfil, Sair
lib/
  supabase/
    client.js             # cliente browser
    server.js             # cliente server-side
    middleware.js         # updateSession + verificação de role admin
    cookie-options.js     # opções de cookie cross-subdomínio
middleware.js             # entry point do Next.js middleware
```

## Controle de acesso

Somente usuários com `profiles.role = 'admin'` acessam o painel.

Para promover um usuário, execute no **Supabase Studio → SQL Editor**:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'usuario@exemplo.com';
```
