# Store Web

A full-stack e-commerce demo store: React/Vite storefront + Express/Prisma API, running behind Docker Compose with separate dev and production configurations.

## Stack

**Frontend** (`store-frontend/`)
- React 19 + TypeScript + Vite
- MUI (Material UI) for components/theming
- Tailwind CSS (utility classes alongside MUI)
- React Router for client-side routing
- Zustand for client state (cart, auth status), with `persist` for the cart
- Axios as the API client

**Backend** (`store-backend/`)
- Node.js + Express + TypeScript (run via `tsx`, no separate build step)
- Prisma ORM + PostgreSQL
- Cookie-based session auth (httpOnly cookies, not localStorage)
- Stripe Checkout for payment
- `zod` for request validation, `helmet` + `express-rate-limit` for hardening

**Infrastructure**
- PostgreSQL 15 (Docker)
- Nginx serving the production frontend build
- Docker Compose, split into base + dev override + prod override

## Features

- Product catalog with category filtering, sorting, and search
- Product detail page: image gallery, size selection (with live availability checks), shipping/pickup calculator, related products
- Cart (persisted client-side) with quantity controls, remove confirmation, and size-availability re-validation at checkout
- Auth: register/login/logout (httpOnly cookie sessions), address book
- Checkout: saves a delivery address, then hands off to Stripe Checkout via `/cart/finish`
- Security: input sanitization against XSS on all free-text fields, rate limiting (global + stricter on auth routes), `helmet` security headers

## Project structure

```
store-web/
├── docker-compose.yml            # base: services, network, volumes (shared by dev & prod)
├── docker-compose.override.yml   # dev: hot-reload, exposed DB port, source bind mounts
├── docker-compose.prod.yml       # prod: nginx build, prisma migrate deploy, no exposed DB/volumes
├── store-backend/
│   ├── src/
│   │   ├── controllers/          # request handlers
│   │   ├── services/             # business logic / Prisma queries
│   │   ├── schemas/              # zod validation schemas
│   │   ├── middleware/           # auth, rate limiting
│   │   ├── routes/main.ts        # route table
│   │   └── server.ts             # Express app entrypoint
│   ├── prisma/                   # schema, migrations, seed script
│   └── README.md                 # full API route reference
└── store-frontend/
    ├── src/
    │   ├── pages/                # route-level screens (Home, Product, Cart, Login, ...)
    │   ├── components/           # shared UI (Header, Footer, ShippingCalculator, ...)
    │   ├── store/                # zustand stores (cart, auth)
    │   └── services/api.ts       # axios instance
    └── Dockerfile.prod           # multi-stage build -> nginx
```

## Running in development

```bash
docker compose up -d --build
```

This automatically merges `docker-compose.yml` + `docker-compose.override.yml`. You get:
- Frontend (Vite dev server, hot reload): http://localhost:5173
- Backend (Express, `tsx watch`): http://localhost:8080
- Postgres exposed on `localhost:5432` (for DBeaver/Postico/etc.)

The backend container runs `prisma generate && prisma migrate deploy && npm run dev` on start. To seed sample data:

```bash
docker compose exec backend npm run db:seed
```

### Environment files

- `store-backend/.env` — copy from `store-backend/.env.example`. Holds `DATABASE_URL`, `PORT`, `FRONT_END_URL`, `BASE_URL`, and Stripe keys. (`DATABASE_URL`/`PORT` are overridden by Compose at runtime; the others are read directly.)
- `store-frontend/.env` — copy from `store-frontend/.env.example`. Holds `VITE_API_URL` for local (non-Docker) `npm run dev` usage.
- `.env` (repo root) — copy from `.env.example`. Read automatically by `docker compose` to fill in `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${POSTGRES_DB}`, and (for prod builds) `VITE_API_URL`. Dev falls back to built-in defaults if this file doesn't exist.

## Running in production

```bash
cp .env.example .env   # set a real POSTGRES_PASSWORD and your public VITE_API_URL
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Differences from dev:
- Frontend is built statically (`npm run build`, with `VITE_API_URL` baked in at build time) and served by Nginx on port `80`.
- Backend runs `prisma migrate deploy && npm start` — no watch mode, no source bind mounts.
- Postgres has no published port — reachable only from the `backend` service on the internal Docker network.
- DB credentials come from the root `.env` instead of hardcoded defaults.

## API reference

See [`store-backend/README.md`](store-backend/README.md) for the full list of routes, request/response shapes, and auth requirements.

## Notes

- Auth uses httpOnly cookies (`SameSite=Lax`), not `Authorization` headers or `localStorage` — deliberate, to keep session tokens out of reach of JS/XSS.
- There's no dedicated "am I logged in" endpoint; the frontend infers auth state from a `GET /user/addresses` call (200 = logged in, 401 = not).
- Cart contents are stored in `localStorage` (via zustand `persist`) and are **not** tied to a user account or cleared on logout — they're treated as device-level state, consistent with how most storefronts handle carts.
