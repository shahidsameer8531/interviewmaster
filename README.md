# InterviewMaster.ai

AI interview preparation by **Sameer**: a public marketing site plus a signed-in app, Prep Room, with AI mock interviews, scored reports, a resume builder, aptitude practice, coaching requests and progress tracking.

- Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- Convex for the database and Convex Auth for sign-in
- Google Gemini for questions, scoring and resume help, called only from server routes

## 1. Requirements

- Node.js 22 and npm 9 or newer
- A Convex account (free) for the backend
- A Gemini API key for the AI features
- Git

No system packages are needed. Camera and microphone features only work in a browser on `localhost` or over HTTPS.

## 2. Install

```bash
git clone https://github.com/shahidsameer8531/interviewmaster.git
cd interviewmaster
npm install --ignore-scripts
cp .env.example .env.local
```

`--ignore-scripts` is required. The `canvas` package tries to compile native code and fails without system libraries; nothing in the app imports it.

## 3. Create the Convex backend

```bash
npx convex login          # opens a browser link to approve this machine
npx convex dev --once     # creates a project, pushes the schema and functions
```

The second command writes `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` into `.env.local`. To push to an existing project instead, set `CONVEX_DEPLOYMENT=dev:<name>` in `.env.local` first.

### Sign-in keys (required once per deployment)

Convex Auth needs a signing key pair and the site URL on the deployment:

```bash
node scripts/convex-auth-keys.mjs       # prints two `npx convex env set` commands
# run the two printed commands, then:
npx convex env set SITE_URL http://localhost:3000
```

`SITE_URL` must be the exact address you open the app on, including the port. Change it whenever that address changes, for example `https://192.168.1.20:3000` or `https://your-domain.com`.

Email and password sign-in now works. Google and GitHub are optional, see section 6.

## 4. App settings in `.env.local`

| Variable | Needed for | Notes |
|---|---|---|
| `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL` | everything | written by `npx convex dev --once` |
| `GEMINI_API_KEY` | interview questions, reports, resume rewrites, aptitude generation | from Google AI Studio |
| `GEMINI_MODEL` | optional | defaults to `gemini-3.6-flash` |
| `ADMIN_EMAIL`, `EMAIL_USER`, `EMAIL_PASS` | coaching request emails | Gmail address and app password. When empty, requests are recorded in the app and not emailed. |
| `NEXT_PUBLIC_AUTH_GOOGLE`, `NEXT_PUBLIC_AUTH_GITHUB` | OAuth buttons | set to `1` only after section 6 |

Without `GEMINI_API_KEY` the app runs, and every AI feature shows a clear "not configured" error instead of fake data.

## 5. Run

**On this machine only**

```bash
npm run dev
```

Open `http://localhost:3000`.

**From other devices on your network** (also required for camera and microphone from another device)

Create a certificate once per machine, replacing the IP with the machine's address:

```bash
mkdir -p .certs
openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
  -keyout .certs/dev-key.pem -out .certs/dev-cert.pem \
  -subj "/CN=interviewmaster-dev" \
  -addext "subjectAltName=IP:192.168.1.20,IP:127.0.0.1,DNS:localhost"
npx convex env set SITE_URL https://192.168.1.20:3000
npm run dev:https
```

Open `https://192.168.1.20:3000` and accept the browser's certificate warning once. The `.certs/` folder is ignored by git.

Sign-in sets `Secure` cookies on any address other than `localhost`, so plain `http://` on a LAN address will never keep you signed in. Use `dev:https` there.

**Production build**

```bash
npm run build
npm start
```

## 6. Google and GitHub sign-in (optional)

1. In each provider's console, register the callback URL `https://<your-deployment>.convex.site/api/auth/callback/google` or `/github`. The deployment name is in `CONVEX_DEPLOYMENT`.
2. Set the credentials on the deployment:
   ```bash
   npx convex env set AUTH_GOOGLE_ID <id>
   npx convex env set AUTH_GOOGLE_SECRET <secret>
   npx convex env set AUTH_GITHUB_ID <id>
   npx convex env set AUTH_GITHUB_SECRET <secret>
   ```
3. Put `NEXT_PUBLIC_AUTH_GOOGLE=1` and `NEXT_PUBLIC_AUTH_GITHUB=1` in `.env.local` and restart the dev server. The buttons stay hidden until these flags are set.

## 7. Deploying to production

1. Create the production deployment and push the functions: `npx convex deploy`.
2. On the production deployment, set `JWT_PRIVATE_KEY`, `JWKS` (generate a fresh pair with `scripts/convex-auth-keys.mjs`), `SITE_URL` (the public HTTPS URL of the site), and the `AUTH_*` values if you use OAuth. Use `npx convex env set --prod NAME value`.
3. Host the Next.js app (Vercel or any Node host) with the production values of `NEXT_PUBLIC_CONVEX_URL`, `GEMINI_API_KEY`, the email variables and the OAuth flags.
4. Serve it over HTTPS. Sign-in cookies and the interview room's camera and microphone both require it.

## 8. Project layout

```
convex/                 Backend: schema, auth, sessions, resumes, aptitude, coaching
src/app/(marketing)/    Public pages
src/app/(app)/          Prep Room: /dashboard, /settings
src/app/api/            Server routes, including the Gemini-backed interview, report and resume routes
src/components/app/     App shell and shared components
src/features/           Screens: today, interview, resume, aptitude, coaching, progress, auth
src/data/aptitude/      Typed index over the aptitude question banks
```

## 9. Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Next.js on `http://localhost:3000` |
| `npm run dev:https` | Next.js over HTTPS on all interfaces, port 3000 |
| `npx convex dev --once` | push backend changes to the dev deployment |
| `npx convex logs` | tail backend logs |
| `npx convex env list` | show deployment variables |
| `npm run build` | production build |
| `npm run lint` | lint |

## Troubleshooting

- **`npm install` fails on `canvas`**: use `npm install --ignore-scripts`.
- **Sign in or sign up does nothing on a LAN address**: you are on `http://`. Use `npm run dev:https` and the `https://` address, and set `SITE_URL` to match.
- **"The AI interviewer is not configured"**: add `GEMINI_API_KEY` to `.env.local` and restart.
- **Google or GitHub returns 500**: the `AUTH_*` values are missing on the deployment, see section 6.
- **Guest practice**: "Continue as a guest" on `/auth` keeps data in the browser. After signing in, the app offers to move that data into the account.

© Sameer. All rights reserved.
