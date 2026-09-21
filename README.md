# InterviewMaster.ai

InterviewMaster.ai is owned and operated by **Sameer**. It is an AI-powered interview preparation platform for mock interviews, resume building, aptitude practice, and career services.

## Setup

```bash
git clone <repository-url>
cd interviewmaster
npm i
cp .env.example .env.local
npm run dev
```

## Convex

From the project root:

```bash
npx convex dev
```

Create a new Convex project when prompted, then add the env values from `.env.example`.

## Auth

Convex Auth supports Google, GitHub, and email/password. Configure OAuth client IDs and secrets in the Convex dashboard.

## Stripe

Stripe checkout is optional. If you enable it, add `STRIPE_API_KEY` and related keys to Convex environment variables.

## Scripts

- `npm run dev` — start the Next.js app
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — lint

© Sameer. All rights reserved.
