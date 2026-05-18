# Repository Cleanup Report

Generated: 2026-05-18

## Summary

| Category | Safe to remove | Keep (in use or operational) |
|----------|----------------|------------------------------|
| npm packages | 1 (`react-leaflet`) | All others referenced in source or config |
| React components | 5 unused section/admin components | 30+ used via pages/dynamic imports |
| lib modules | 1 (`date-utils.ts`) | All others imported by app/API |
| WebArchive tooling | 3 files | — |
| Deployment/VPS scripts | 0 | 6 scripts (documented ops) |
| API routes | 0 removed | All are HTTP endpoints (some debug-only) |

---

## 1. Unused npm dependencies

### Safe to remove

| Package | Evidence |
|---------|----------|
| `react-leaflet` | No imports in `*.ts`/`*.tsx`. Maps use raw `leaflet` in `PropertyMapDisplay.tsx` and `PropertyLocationPickerView.tsx`. Only appears in `package.json`, `package-lock.json`, and `next.config.js`. |

### In use (do not remove)

| Package | Used by |
|---------|---------|
| `leaflet` | Map components + `lib/leaflet-marker.ts` |
| `browser-image-compression` | `components/admin/PropertySettings.tsx` |
| `react-dropzone` | `app/admin/reviews/import/page.tsx` |
| `node-ical` | `lib/ical-parser.ts`, `scripts/sync-ical.mjs` |
| `@fontsource-variable/*` | `app/layout.tsx` |
| `clsx`, `tailwind-merge` | `lib/utils.ts` (`cn`) |
| `tailwindcss-animate` | `tailwind.config.ts` |
| All `@types/*` devDeps | Match runtime deps in use |

### Redundant npm scripts (not removed)

- `dev:quick` and `dev:webpack` duplicate `dev` (all call `scripts/dev-start.sh`). Harmless aliases; left in place unless you want a slimmer `package.json`.

---

## 2. Unused React components

Proven unused: **no import** from any `app/`, `components/`, or `lib/` file (only self-reference or migration docs).

| File | Notes |
|------|-------|
| `components/admin/MatrixBackground.tsx` | Never imported; admin login does not use it |
| `components/admin/ui/PageHeader.tsx` | Never imported |
| `components/sections/FeaturesSection.tsx` | Never imported; not on home or other pages |
| `components/sections/FAQSection.tsx` | Never imported |
| `components/sections/PricingSection.tsx` | **Public** marketing section; distinct from `components/admin/PricingSection.tsx` (used by PropertySettings) |

All other section/admin components are reached via `app/page.tsx`, `app/host-with-us`, `app/contact`, `app/admin/page.tsx` dynamic imports, or direct imports.

---

## 3. Dead lib files

| File | Evidence |
|------|----------|
| `lib/date-utils.ts` | Zero imports in `*.ts`/`*.tsx`. Date handling lives in `lib/pricing.ts` (`formatDateLocal`, etc.). |

---

## 4. WebArchive / extraction tooling (legacy)

Pre-Next.js Safari extraction workflow. **Not referenced** by `package.json` scripts, Next.js app, or CI.

| File | Evidence |
|------|----------|
| `extract_webarchive.py` | Standalone Python; only referenced by `extract.sh` and outdated root `README.md` |
| `extract.sh` | Wrapper for Python script only |
| `serve.sh` | Static server for `extracted_site/` only |

`.gitignore` already ignores `extracted_site/` and `*.webarchive`.

**Not removed:** Root `README.md` (still documents extraction; should be replaced with app README separately).

---

## 5. Deployment / VPS scripts (kept)

Operational scripts for DigitalOcean/nginx/PM2. Referenced by deployment docs; may still be run on the server.

| File | Referenced by |
|------|----------------|
| `apply-fixes.sh` | `QUICK_FIX_INSTRUCTIONS.md`, `IMAGE_502_FIX.md` |
| `fix-502-errors.sh` | `apply-fixes.sh`, `IMAGE_502_FIX.md` |
| `deploy-server.sh` | VPS deployment flow |
| `check-server.sh` | Server diagnostics |
| `rollback-server.sh` | Rollback to legacy `RSA-SABBATICAL-V1` path |
| `ecosystem.config.example.js` | `apply-fixes.sh`, PM2 setup |

---

## 6. Dev scripts (kept)

| File | In `package.json`? | Usage |
|------|-------------------|--------|
| `scripts/dev-start.sh` | `dev`, `dev:quick`, `dev:webpack` | Active |
| `scripts/dev-fresh.sh` | `dev:clean`, `dev:fresh`, `dev:turbo` | Active |
| `scripts/build-clean.sh` | `build` | Active |
| `scripts/sync-ical.mjs` | `sync:ical`, `sync:ical:all` | Active |
| `scripts/migrate-supabase-data.mjs` | `migrate:supabase-data` | Active |
| `scripts/check-env.mjs` | No | Documented in `ENV_FIX_GUIDE.md` |
| `scripts/test-connection.mjs` | No | Documented in migration markdown |

---

## 7. API routes — debug / one-off (kept)

Not called from application code; used via `curl`, browser, or historical ops docs. Removing would break manual production debugging.

| Route | App code refs | Docs / ops |
|-------|---------------|------------|
| `/api/test-db` | None | Troubleshooting |
| `/api/test-env` | None | Env verification |
| `/api/test-uplisting` | None | Uplisting setup |
| `/api/test-uplisting-headers` | None | Auth experiments |
| `/api/check-cached-photos` | None | Photo migration |
| `/api/extract-cached-photos` | None | Photo migration |
| `/api/manual-add-photo` | None | Manual photo add |
| `/api/add-stock-photos` | None | Stock photo seeding |

### Production API routes (kept)

Used by UI, cron, or external iCal consumers: e.g. `sync-availability` (PropertySettings + Vercel cron), `export-ical`, `sync-photos`, `bookings/create`, `check-availability`, admin routes, etc.

`vercel.json` cron: `/api/cron/sync-calendars` → calls `sync-availability`.

---

## 8. Historical markdown under `supabase/migrations/Markdown /`

~40 setup/fix notes from initial build. Not imported by runtime. **Kept** (audit trail); optional future move to `docs/archive/`.

---

## 9. Actions taken in this cleanup

**Removed:**

- `react-leaflet` dependency + `next.config.js` references
- `extract_webarchive.py`, `extract.sh`, `serve.sh`
- Unused components (5 files)
- `lib/date-utils.ts`

**Not removed:**

- Deployment scripts, test API routes, migration markdown, root README, `scripts/check-env.mjs`, `scripts/test-connection.mjs`

---

## 10. Verification commands

```bash
npm install
npm run lint
npm run build
```
