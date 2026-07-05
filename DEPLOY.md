# Deployment

Lamadrid Labs is hosted on Hostinger Premium Web Hosting (shared hosting, no
Node server available). Next.js builds as a fully static export — no API
routes, server actions, ISR, or `next/image` optimization API.

## Hosting facts

- **Target:** Hostinger Premium Web Hosting, FTPS upload.
- **Build output:** `next build` produces static HTML/CSS/JS in `out/`
  (`output: "export"` in `next.config.ts`).
- **Server directory:** `./` — the FTP account for `lamadridlabs.com` is
  already jailed to `public_html/` as its home directory, confirmed via
  hPanel File Manager. Using `public_html/` here would nest a duplicate
  `public_html/public_html/` and leave the real doc root serving Hostinger's
  `default.php` placeholder instead of the site.
- **Secrets:** `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` must exist as
  GitHub Actions repo secrets before the deploy workflow can run.

## Automated flow

1. **`.github/workflows/ci.yml`** — runs on every pull request into `main`:
   `npm ci`, `npm run lint`, `npm run build`. This confirms the static
   export builds cleanly before merge; it does not deploy anywhere.
2. **`.github/workflows/deploy.yml`** — runs on push to `main`:
   - `npm ci` + `npm run build` → produces `out/`.
   - Copies `deploy/.htaccess` into `out/.htaccess`.
   - Uploads `out/` to Hostinger via `SamKirkland/FTP-Deploy-Action@v4.4.0`
     over FTPS, wrapped in `Wandalen/wretry.action` (3 attempts, 30s backoff)
     since Hostinger occasionally drops GitHub-runner IPs on port 21.
   - `state-name` is scoped per commit SHA
     (`.ftp-deploy-sync-state-<sha>.json`). This forces a full re-upload
     every deploy instead of a delta-delete — a fixed state-name drifts once
     Next's build id changes and the action tries to delete an
     already-gone `_next/<hash>` folder, which fails with a fatal 550.
     Orphaned old `_next/<hash>` chunks are harmless; prune manually if it
     matters.
   - `.well-known/**` is excluded from the sync so SSL/domain verification
     files survive redeploys.

`deploy/.htaccess` (version-controlled, copied in at deploy time — edit it
there, not on the live server) handles:

- Custom 404 page (`ErrorDocument 404 /404.html`).
- Force HTTPS and canonicalize to the apex domain (redirect `www` → apex).
- `application/manifest+json` MIME type for `.webmanifest`.
- Long-lived immutable caching for hashed `_next/static/` assets;
  no-cache/must-revalidate for HTML.

## Manual fallback

If the FTP workflow is failing and a deploy is needed immediately:

1. `npm run build` locally.
2. `cp deploy/.htaccess out/.htaccess`
3. Zip the contents of `out/` (the files inside, not the `out` folder
   itself) into `site.zip`.
4. In hPanel → File Manager, upload `site.zip` to the web root and extract
   it there, overwriting existing files.
5. Delete `site.zip` from the server afterward.

## Verifying a deploy

```bash
curl -sI https://lamadridlabs.com | head -n 1
curl -s https://lamadridlabs.com | grep -o "<title>[^<]*</title>"
```

The first command should return `HTTP/2 200`; the second should show the
current page title, confirming the live export matches the latest build.

## Known constraints

- No preview URLs — a merged PR's CI check only confirms the export builds;
  there is no per-branch live preview.
- No staging environment — Hostinger shared hosting only supports the one
  production target configured here.
- DNS/nameserver configuration for `lamadridlabs.com` is out of scope for
  this setup; see `context/features/23-domain-and-launch-checklist.md`.
