# Deploying awitav (and avoiding CORS)

CORS errors appear when the browser loads the app from **origin A** (e.g. `https://app.example.com`) and the API lives on **origin B** (e.g. `https://api.example.com`) without the backend allowing A.

You have **three approaches**. Option A is the most reliable for production.

---

## Option A — Same domain with Nginx (recommended, no CORS)

Serve the Vue build and **proxy** `/api` (or all non-static paths) to the Nest/Lambda backend. The browser only talks to one origin.

```
https://awita.example.com/          → static files (awitav dist/)
https://awita.example.com/sensors → proxy → backend
```

### 1. Build the frontend

```bash
cd awitav
# Same host as the site — API under reverse proxy path is NOT used; use full public API URL OR proxy (see nginx)
VITE_API_BASE_URL=https://awita.example.com npm run build
```

If Nginx proxies API routes on the **same host** without a path prefix, set:

```env
VITE_API_BASE_URL=https://awita.example.com
```

If the API is on a subdomain, use Option B instead.

### 2. Copy `dist/` to the server

```bash
scp -r dist/* user@server:/var/www/awita/
```

### 3. Nginx example

See `nginx.example.conf` in this folder. Reload Nginx after editing.

### 4. Backend CORS (still set for direct API access)

In `awita-back/.env`:

```env
CORS_ORIGINS=https://awita.example.com
```

---

## Option B — Separate domains (configure CORS on the API)

Typical setup:

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | `https://app.awita.com`      |
| API       | `https://api.awita.com`      |

### 1. Build with the public API URL

```bash
cd awitav
VITE_API_BASE_URL=https://api.awita.com npm run build
```

Vite bakes this into the bundle at **build time** — rebuild after changing the API URL.

### 2. Allow the frontend origin on the backend

**Local / VPS Nest** (`awita-back/.env`):

```env
CORS_ORIGINS=https://app.awita.com,http://localhost:5173
```

`bootstrap.ts` already reads `CORS_ORIGINS` (comma-separated).

**AWS Lambda** (`awita-back/.env` before deploy):

```env
CORS_ORIGINS=https://app.awita.com
```

Update `serverless.yml` `cors.origin` and API Gateway `gatewayResponses` to the **same** URL (not only `localhost:5173`), then:

```bash
cd awita-back
npm run deploy
```

### 3. Clerk Dashboard

**Paths → Allowed origins** (and redirect URLs):

- `https://app.awita.com`
- `http://localhost:5173` (dev)

**API → Authorized redirect URLs:**

- `https://app.awita.com/dashboard`

---

## Option C — Static host + serverless API (Netlify, Vercel, Cloudflare Pages, S3)

### Frontend hosts

| Platform | Build command | Output | Env |
|----------|---------------|--------|-----|
| Netlify / Vercel / Cloudflare | `npm run build` | `dist` | `VITE_API_BASE_URL`, `VITE_CLERK_PUBLISHABLE_KEY` |
| S3 + CloudFront | upload `dist/` | — | set env in CI before build |

Enable **SPA fallback**: all routes → `index.html` (Vue Router history mode).

### API

Use your deployed Lambda URL:

```env
VITE_API_BASE_URL=https://xxxxx.execute-api.us-west-1.amazonaws.com/dev
```

Set `CORS_ORIGINS` to your Netlify/Vercel URL, e.g. `https://awita.netlify.app`.

---

## Checklist before going live

- [ ] `VITE_API_BASE_URL` is `https://...` HTTP(S) API URL, **not** `mysql://` or DB hostnames
- [ ] `VITE_USE_MOCK=false`
- [ ] `CORS_ORIGINS` on backend includes the exact frontend origin (scheme + host + port, no trailing slash)
- [ ] Clerk allowed origins / redirect URLs include production domain
- [ ] Rebuild frontend after any `.env` change (`npm run build`)
- [ ] Test: DevTools → Network → API request → response headers include `Access-Control-Allow-Origin`

---

## Quick test after deploy

```bash
curl -I -X OPTIONS "https://api.awita.com/sensors" \
  -H "Origin: https://app.awita.com" \
  -H "Access-Control-Request-Method: GET"
```

Expect `Access-Control-Allow-Origin: https://app.awita.com` (or your configured origin).

---

## Common mistakes

| Mistake | Symptom |
|---------|---------|
| `VITE_API_BASE_URL=mysql.haroware.com` | HTML/JSON parse error (`<!doctype`) |
| Forgot to rebuild after changing `.env` | App still calls `localhost:3000` |
| CORS only set in Nest but not API Gateway | OPTIONS works locally, fails on Lambda |
| `http` vs `https` mismatch | CORS blocked |
| Trailing slash on API URL | Double slashes or wrong paths |
