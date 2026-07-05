# WhatsOmm

**Observational perception reports for Extended Avatar conversations.**
A ONIOKO product, built on the Onioko Perception Models (OPM).

Software remembers what was said. WhatsOmm perceives whether it held together.

---

## What it is

WhatsOmm is the installable companion app to WhatsAnima. When an Extended Avatar
finishes a conversation (a sales brief, an intake, a coaching call), WhatsOmm turns
the raw OPM output into a single, readable **Perception Report** and pushes it to
your devices the moment it is ready.

Each report reads a call on two layers:

- **What was said** — the answers the avatar gathered, plus the full transcript.
- **Whether it held together** — the signal congruence OPM observed while the words
  were spoken (LUCID's interpretation, CYGNUS's signals, ORACLE's cross-modal patterns).

The centerpiece is **congruence**, not emotion. WhatsOmm never labels an emotional
state. It shows whether the verbal layer and the signal layer lined up, and flags the
moments where they didn't. That framing is deliberate and matches OPM's positioning
under the EU AI Act: signal congruence, processed on EU servers.

---

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript strict**
- **Tailwind v4**
- **PWA**: official Next.js approach — `app/manifest.ts` + a hand-written service
  worker (`public/sw.js`). No plugin.
- **Web Push**: the `web-push` library with VAPID, reusing WhatsAnima's keys and the
  shared `wa_push_subscriptions` table.
- **Data**: no own database. Reads the shared WhatsAnima Supabase
  (`wofklmwbokdjoqlstjmy`); perception reports live in `wa_perception_reports`.

This mirrors the AnimaCura / AnimaPay family stack, so patterns, PWA conventions and
deployment stay consistent across the Anima products.

---

## Project structure

```
app/
  layout.tsx                     Root layout, PWA metadata, SW registration
  page.tsx                       Home: enable notifications + open the sample report
  manifest.ts                    Web app manifest (installable)
  globals.css                    Tailwind v4 + dark base
  report/[conversationId]/
    page.tsx                     A single perception report (server component)
  api/
    subscribe/route.ts           Store a push subscription (source: whatsomm)
    notify/route.ts              Send a push to whatsomm subscribers (shared VAPID)
components/
  PerceptionReport.tsx           The report UI (1:1 from the approved design)
  PwaRegister.tsx                Registers the service worker
  PushOptIn.tsx                  Notification opt-in flow
lib/
  perception-report.ts          Typed model (PerceptionReportData) + fixture
  supabase.ts                    Browser Supabase client
public/
  sw.js                          Service worker (push + notification click)
  icons/                         App icons (192, 512, 512-maskable) — see below
```

---

## How push works

WhatsOmm and WhatsAnima share **one** VAPID key pair. VAPID identifies the sending
server, not the site, so the same keys sign pushes for both apps.

1. On its own origin (`whatsomm.onioko.com`), WhatsOmm registers `public/sw.js` and,
   after you tap **Benachrichtigungen aktivieren**, creates a push subscription with
   the public VAPID key.
2. The subscription is stored in the shared `wa_push_subscriptions` table, tagged
   `source: whatsomm`.
3. When a brief call ends, the backend sends a push signed with the shared VAPID
   private key. The notification reads *"Ein Gespräch ist beendet, die Auswertung ist
   da"* and, on tap, opens the matching report.

Each app keeps its own subscriptions (they're bound to the origin), but both are sent
to with the same key pair. No new keys are needed.

---

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Read reports client-side |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | Server-side writes (subscribe route) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push subscription (client) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_EMAIL` | Push send (server) |

Use the **same** VAPID values as WhatsAnima.

---

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Push and installation require HTTPS, so those features
only work locally on `localhost` (allowed) or on the deployed HTTPS origin.

---

## Deployment

Deploy on Vercel, custom domain `whatsomm.onioko.com`. Set all environment variables
in the Vercel project. HTTPS (required for service workers and push) is automatic.

---

## Status (MVP)

Working now:

- The Perception Report UI, 1:1 with the approved design.
- Installable PWA (manifest + service worker).
- Push opt-in and the subscribe / notify routes.

Wired next (shared backend, lives in WhatsAnima):

- `wa_perception_reports`: persist LUCID / CYGNUS / ORACLE + brief answers + transcript
  + recording link on call end (OPM output is otherwise ephemeral).
- Replace the report fixture with a real Supabase read for `:conversationId`.
- Fire the push from the call-end handler.

Still to add:

- App icons in `public/icons/` (`icon-192.png`, `icon-512.png`,
  `icon-512-maskable.png`). Until then the manifest references them but they 404.
- Optional offline caching (Serwist) if we want the shell to open offline.

---

ONIOKO · EXIDEUS LLC
