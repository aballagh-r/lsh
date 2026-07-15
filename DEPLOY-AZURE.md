# Deploying WebLSH to Azure App Service

This app now runs as **one Node process**: `server/index.js` serves the built
React frontend (`dist/`) *and* handles `POST /api/contact`. That means one
Azure App Service, no separate static hosting, no CORS headaches.

## 1. Create the App Service

- Runtime stack: **Node 20 LTS**
- OS: **Linux** (cheapest, and matches this codebase)
- Plan: **B1 (Basic)** is plenty for a marketing site with a contact form —
  around $13/month. **F1 (Free)** also works for early testing, but sleeps
  after inactivity and has a 60 CPU-min/day cap.

## 2. Tell Azure to build the app on deploy

In the App Service → **Configuration → Application settings**, add:

| Name | Value |
|---|---|
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |

This makes Azure's build system (Oryx) run `npm install` + `npm run build`
automatically after every deploy, using the `build` script already in
`package.json`. It then starts the app with `npm start`, which runs
`node server/index.js` — already set up for you.

## 3. Add your real environment variables

Same **Application settings** screen — add whichever of these you're using
(see `.env.example` for the full list and how to get each value):

- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — recommended, free, instant
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEAD_TO_EMAIL` — optional, in addition
- `ALLOWED_ORIGIN` — set to your real domain once you have one, e.g. `https://weblsh.com`

Don't set `VITE_CONTACT_API_URL` — leave it unset. Since the frontend and API
are the same app here, the form already posts to the relative path
`/api/contact`, which just works.

Don't set `PORT` — Azure injects its own and the server already reads
`process.env.PORT`.

## 4. Deploy

Pick whichever you're already comfortable with:

- **GitHub Actions** (recommended): in the Azure Portal, App Service →
  **Deployment Center** → connect your `aballagh-r/weblsh` repo → branch
  `main`. Azure generates the workflow file and commits it for you — every
  push to `main` redeploys automatically.
- **VS Code**: install the *Azure App Service* extension, right-click the
  project, *Deploy to Web App*.
- **CLI**: `az webapp up --name <your-app-name> --resource-group <rg> --runtime "NODE:20-lts"`
  from the repo root.

## 5. Verify

- `https://<your-app>.azurewebsites.net/` → the site loads
- Submit the contact form → check your Telegram chat (or inbox) for the lead
- `server/leads.json` is written to the App Service's local disk as a
  backup — note this resets on restarts/scaling on Linux App Service, so
  treat Telegram/email as the source of truth, not that file, once live.

## Cost note

Telegram notifications are free (no message limits for this volume). The
only recurring cost is the App Service plan itself — B1 Linux is the
cheapest tier that stays awake and handles real traffic reliably.
