# Vercel deployment

[Documentation index](../README.md)

## Live production URL

**[https://matjari-three.vercel.app/](https://matjari-three.vercel.app/)**

The deployed website is a frontend demo using mock data and browser localStorage. No backend or database is connected.

The frontend builds as static Vite assets. These settings follow the repository configuration and [Vercel's Vite SPA guidance](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

## Project setup

1. In Vercel, import the GitHub repository `MarahZaid/Matjari` and select the intended branch.
2. Set the following project options.
3. Deploy and inspect the build log, then complete the checks below.

| Setting | Value |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `apps/web` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Commands are relative to `apps/web` in Vercel. Use a Node version compatible with the [prerequisites](../../README.md#prerequisites). No environment variables, database, API process or credentials are required. The API skeleton is not part of this frontend deployment.

## Automatic redeployment

With the Vercel GitHub integration connected, pushes or merged changes to the configured production branch can trigger an automatic production redeployment. Vercel builds the new revision using the settings above and updates the live production URL after a successful deployment. Check the project’s Git settings in Vercel for the configured production branch.

## SPA routing and assets

[vercel.json](../../apps/web/vercel.json) contains:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

This enables React Router to handle direct visits and refreshes for client routes. Existing static assets should be served as files; verify the JavaScript/CSS content types after deployment. The fallback does not authorize users: the browser guard redirects guests to login and shows 403 UI for wrong-role sessions. Unknown routes show the app's 404 UI rather than a server-generated 404.

Vite uses the default `/` base, and generated assets use `/assets/` URLs. `public/favicon.svg` and `public/icons.svg` are copied to the output root. Deploy `dist`, without starting the development or preview server. Photos use Unsplash and Inter uses Google Fonts over HTTPS; fallback images/system fonts handle unavailable providers.

## Local build preview

From the repository root:

```bash
npm ci --prefix apps/web
npm run build --prefix apps/web
npm run preview --prefix apps/web -- --host 127.0.0.1
```

Open the printed URL. A local preview checks the build, but does not prove Vercel's hosted routing works.

## Hosted acceptance checks

- Directly open and refresh `/`, `/products/p1`, `/stores/form-and-function` and `/login`.
- As a guest, open `/cart`, `/checkout`, `/seller/dashboard` and `/admin/dashboard`: each should redirect to login with an intended destination.
- Sign in as a customer and refresh `/cart` and `/account/orders`; sign out and repeat `/seller/dashboard` as a seller, then `/admin/dashboard` as admin.
- Visit another role's branch while signed in and confirm Access denied; test an unknown path for the 404 UI.
- Verify `/assets/` JavaScript/CSS, favicon and icon requests return assets rather than HTML. Check the console for runtime/import errors.
- Place a demo order, reload to check persistence, change theme and reload, and confirm reset cancellation preserves data.

## Storage limits

Each browser origin has its own localStorage. Local development, Vercel preview URLs and the production domain do not share sessions or orders. Changing a port also changes origin. Data is intended for one active tab; there is no shared database, cross-device sync or concurrency control. Corrupt saves run a seed in memory until confirmed reset. Use fictional details only.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Build cannot find package.json | Root Directory must be `apps/web` |
| Unsupported Node/tool error | Match the documented Node requirement; reinstall with the lockfile |
| Deep-link refresh fails | Ensure this app's `vercel.json` is included under the selected root; redeploy and test directly |
| Blank page or script MIME error | Check output is `dist`, asset paths/content types and stale cached files |
| Redirect to login or Access denied | Select the correct demo role; admin does not inherit seller/customer access |
| Data differs between preview/production | localStorage is scoped to origin; sign in and create data on the current origin |
| Saved-data recovery notice | Confirm Reset Demo Data if replacing local edits is acceptable |
| Photos/fonts unavailable | Check external connectivity; inspect the existing fallbacks |

No deployment, account connection or publishing action was performed as part of this documentation update.
