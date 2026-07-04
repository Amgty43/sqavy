# Homeroom

An assignment reminder app for high school students: add what's due, see it
grouped by urgency, get a daily reminder by email and push notification, and
build a streak for staying on top of things.

Note: this repo also contains `Sqavy_Demo.html`, an unrelated static demo for
a different product. Homeroom lives entirely in `server/` and `client/`.

## What's here

- **`server/`** — Node/Express API + SQLite database. Handles accounts,
  assignments, subjects, and a daily cron job that emails and push-notifies
  each student about what's overdue or due today.
- **`client/`** — React PWA (installable on a phone home screen). Dashboard
  groups assignments into Overdue / Due Today / Due Soon / Upcoming, with
  color-coded subjects, a completion streak, and mark-complete checkboxes.

## Features

- Accounts (signup/login) so each student's assignments are private and
  reachable from any device.
- Manual assignment entry: title, subject, due date, optional notes.
- Automatic priority: overdue (red), due today (orange), due soon — next 2
  days — (amber), upcoming (neutral).
- Color-coded subjects (a fixed, accessible 8-color palette to keep things
  legible — not a free-for-all picker).
- Mark complete + a streak counter (consecutive days where everything due
  that day got checked off).
- Installable PWA with browser push notifications.
- Daily email digest of what's overdue/due today.

## Setup

Requires Node 18+.

### 1. Server

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- `JWT_SECRET` — any long random string (e.g. `openssl rand -hex 32`).
- `SMTP_*` / `EMAIL_FROM` — optional. Leave blank to skip email; the app
  logs a warning and keeps working without it. Any SMTP provider works
  (Gmail app password, Resend, Mailgun, etc).
- `VAPID_*` — optional, for push notifications. Generate a keypair with:
  ```bash
  npm run generate-vapid-keys
  ```
  and paste the printed values in. Leave blank to skip push.
- `DIGEST_HOUR` / `DIGEST_MINUTE` — what time (server local time) the daily
  digest cron fires. Defaults to 7:00 AM.

Run it:

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start
```

API listens on `http://localhost:4000` by default.

You can trigger the daily digest manually at any time (useful for testing)
with `POST http://localhost:4000/api/admin/run-digest`.

### 2. Client

```bash
cd client
npm install
npm run dev
```

Opens on `http://localhost:5173` and proxies `/api` requests to the server.
Sign up for an account, add a subject or two (four defaults are created for
you: Math, English, Science, History), then add assignments.

To install it as an app: open the dev/build URL on a phone, then
"Add to Home Screen" (iOS Safari) or use the install prompt (Android
Chrome).

For a production build: `npm run build`, then serve the `client/dist`
folder from any static host, with the API reachable at whatever `/api`
proxies to (update `vite.config.js`'s proxy or serve both under the same
domain/reverse proxy).

## Notes on scope

- **Storage**: SQLite file at `server/data.sqlite`. Fine for a single small
  deployment; swap the `better-sqlite3` calls in `server/src/` for a hosted
  Postgres/MySQL client if you outgrow it.
- **Email/push are best-effort**: both silently no-op (with a console
  warning) if their env vars aren't configured, so the core app works with
  zero external services.
- **LMS import (Google Classroom/Canvas)**: not built. The data model
  (`assignments` table: title, subject, due date, notes, completed) is
  intentionally simple so an import job could populate it later — that's a
  separate, bigger integration (OAuth + per-provider API calls) and was left
  out of this pass.
