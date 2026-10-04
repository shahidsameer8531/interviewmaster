# Navy UI redesign

Date: 2026-10-04. Approved in chat: dark navy theme, keep the gold `#fcba28` accent, include the crash fix and the missing section index pages.

## Goal

Give InterviewMaster.ai a distinctive dark navy identity, make the shared shell and landing page interactive, and fix the UI defects found in review, without touching the 97 feature pages one by one.

## Token system

| Token | Hex | Use |
|---|---|---|
| navy-950 | `#060d1f` | deepest bands, footer |
| navy-900 | `#0a1628` | page background |
| navy-800 | `#0f1f3a` | cards, popovers |
| navy-700 | `#16294d` | hover surfaces |
| navy-600 | `#1f3458` | borders |
| ink | `#eef2fa` | foreground |
| ink-muted | `#8fa3c7` | secondary text |
| gold | `#fcba28` | accent, CTAs, focus ring |

The shadcn CSS variables (`--background`, `--card`, `--border`, `--primary`, ...) map onto these so the 125 files using `bg-background`, `bg-card`, `border-border` shift automatically. `--primary` becomes gold.

Type: Bricolage Grotesque for display, Manrope for body, JetBrains Mono for eyebrows, timers and transcript labels. Loaded with `next/font/google` and exposed as `font-display`, `font-sans`, `font-mono`.

Signature element: the hero's live interview console. A navy panel that plays a simulated mock interview (typed question, streamed answer, animated clarity/structure/confidence meters, AI tip) and lets the visitor switch tracks.

## Work items

1. `globals.css` and `tailwind.config.ts`: new tokens, fonts, keyframes, glow shadow, scrollbar, selection, reduced motion. Delete `tailwind.config.js` and `next.config.mjs` (merge `HOSTING_URL` into `next.config.js`).
2. Root layout loads the fonts and sets `class="dark"`.
3. The five section layouts (`products`, `services`, `resources`, `community`, `company`) become plain wrappers. They currently render a second `<html>`/`<body>`, which breaks the shell.
4. Shared `navigation-data.ts` feeds Header, MobileMenu, Footer and the index pages. `MobileMenu.new.tsx` is removed.
5. Header, MobileMenu, Footer, `ui/button`, `ui/card`, `ChipBanner` rebuilt in the navy language.
6. Hero rebuilt (`Hero`, `LeftHero`, `RightHero`).
7. Scripted replacement of hardcoded dark greys (`#1a1a1a`, `#0a0a0a`, `bg-gray-900`, `bg-zinc-900`, `bg-neutral-900`, solid `bg-black`, slate gradients, `text-purple-400`) with navy tokens.
8. `SectionIndex` component plus five `page.tsx` files so `/products`, `/services`, `/resources`, `/community`, `/company` stop returning 404.
9. `speech.ts` initialises lazily so the AI coaching page stops crashing during server rendering.

## Verification

`next build` passes, and curl returns 200 for `/`, `/auth`, the five section indexes, three product pages and `/services/interview-coaching/ai`. The rendered HTML for a product page contains exactly one `<html>` and one `<footer>`.
