---
name: CloudLift Architecture
description: Key architectural decisions and patterns for the CloudLift SaaS app
---

# CloudLift Architecture

## Stack
- Frontend: React + Vite (`artifacts/cloudlift`) at previewPath `/`
- Backend: Express API server (`artifacts/api-server`) on port 8080
- DB: PostgreSQL via Drizzle ORM (`lib/db`)
- Auth: Clerk (via Replit-managed Clerk tenant)
- API codegen: orval → `lib/api-client-react`

## Clerk Setup
- `clerkPubKey` = `publishableKeyFromHost(window.location.hostname, import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)` from `@clerk/react/internal`
- `clerkProxyUrl` = `import.meta.env.VITE_CLERK_PROXY_URL` — empty in dev (intentional), auto-set in prod
- Do NOT set `clerkJSUrl` as a prop (causes 404 in dev)
- `@clerk/themes` installed; use `baseTheme: dark` in appearance
- `@layer theme, base, clerk, components, utilities;` must be first line in index.css
- `tailwindcss({ optimize: false })` in vite.config.ts required for Clerk CSS in prod

**Why:** The proxyUrl must come from the env var — hardcoding `/api/__clerk` breaks dev mode. The `clerkJSUrl` is only for production proxy and not needed as a hardcoded prop.

## Auth Middleware
- `requireAuth` in `artifacts/api-server/src/middlewares/requireAuth.ts`
- JIT-provisions user from Clerk userId into `usersTable`
- Sets `(req as any).dbUser` for downstream handlers

## DB Schema Tables
- usersTable, repositoriesTable, repositoryAnalysesTable, deploymentsTable
- serviceRequestsTable, subscriptionsTable, activityTable
- All in `lib/db/src/schema/` (one file each)

## Routes (all under /api/)
- `/users` — profile
- `/repositories` — CRUD + `/analyze` + `/analysis`
- `/deployments` — CRUD
- `/services` — service requests CRUD
- `/subscriptions` — plan info, checkout placeholder
- `/dashboard` — summary + activity
- `/admin` — admin-only stats, users, repos, services

## Frontend Pages
- `/` → Landing (public) or redirect to /dashboard if signed in
- `/sign-in/*?`, `/sign-up/*?` → Clerk auth pages
- `/dashboard`, `/repositories`, `/repositories/:id` → protected
- `/launch`, `/services`, `/settings`, `/admin` → protected
- `/pricing` → public

## Wouter Routing Pattern
- `<WouterRouter base={basePath}>` wraps everything
- `<Protected component={X} />` = Show when signed-in else Redirect to "/"
- `Redirect` imported from `wouter`, not `@clerk/react`
