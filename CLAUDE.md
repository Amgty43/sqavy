# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo contains two self-contained static HTML artifacts and nothing else — no build system, package manager, server, or test suite.

- **`index.html`** — the real, production-bound marketing site for **Sqavy**, an AI missed-call text-back / lead-recovery service for home service businesses (solo owner-operators and small teams of 1–10, e.g. general repair/remodel, HVAC/plumbing/electrical, recurring services like lawn/cleaning). This is the file to keep building toward launch.
- **`Sqavy_Demo.html`** — the original standalone demo, kept as-is. Same simulated missed-call-to-booked-job flow, different (drywall-repair) scripted scenario and older visual style. Not part of the production site.

## Sqavy brand kit

- **Colors**: orange `#FF6B01` (primary CTA/accent) and navy `#0A4D8C` (secondary/dark sections), exposed as CSS variables `--orange` / `--navy` (plus `--orange-dark` / `--navy-dark`) in `index.html`'s `:root`. Change the variables, not individual rules.
- **Logo**: `logo.png` — a square orange (`#FF6B01`) badge with a dark wordmark, used in `index.html`'s nav (`.logo img`) and as the favicon. Sourced from a vendor-supplied PDF and rasterized to a 512×512 PNG; treat it as the canonical asset rather than re-deriving it.
- **Brand personality**: professional, modern/AI-forward, trustworthy, results-focused, simple/easy to use. Design direction is clean modern SaaS (think HubSpot / GoHighLevel / Zapier) — light backgrounds, generous whitespace, strong CTAs — not a dark "command-center" or rustic blue-collar look.
- **Target market**: solo owner-operators and small service businesses (1–10 employees) that rely on phone calls and appointments to win work.
- **Core message**: "missed call = missed job, we fix that." Headline: "Never Miss Another Lead." Primary CTA: "Book a Demo." Secondary CTA: "See How It Works."

## Business context

- **Entity**: Sqavy LLC — Florida, EIN obtained. Tampa, FL.
- **Founder**: Tyrell (sole operator — sales, onboarding, and ops).
- **Live production site**: [www.sqavy.com](https://www.sqavy.com) — hosted on Wix, separate from this repo. This repo's `index.html` is a parallel marketing/demo asset.
- **Contact**: info@sqavy.com (public-facing) · tyrell@sqavy.com (founder) · +1 (813) 421-0279 (Twilio service line).
- **Tech stack**: Twilio + Zapier + Zoho Mail (Path B). ~$45–62/mo burn. Five Zapier workflows: missed-call text-back, appointment reminders, review requests, voicemail-to-text, lead qualification.
- **Pitch**: "I help small businesses stop missing jobs and save time using AI automation." Lead with money saved and jobs recovered, not tech.

## Pricing (confirmed — do not alter without explicit instruction)

| Tier | Monthly | Setup fee | Key additions |
|---|---|---|---|
| Starter | $299/mo | $499 | Missed-call text-back, 5-branch SMS, booking link, dedicated number |
| Growth | $599/mo | $799 | + Appointment reminders, review automation |
| Pro | $999/mo | $1,499 | + Voicemail transcription, AI lead qualification, custom follow-up, multi-location |

Annual prepay: pay 10 months, get 12 (~17% off). **Do not suggest discounts** unless explicitly asked.

**Exception — do not use as a template**: Customer #1 (Sam Napoles / Napolez Home Services) was grandfathered at $100 setup + $50/mo as a loss-leader — now inactive (see Customer Log below).

## Customer Log

| # | Name / Business | Status | Notes | Last updated |
|---|---|---|---|---|
| 1 | Sam Napoles / Napolez Home Services | INACTIVE | Tyrell offered full refund July 2026; Sam declined to accept full amount back. Not using the service. Relationship intact — wants help building his business down the road. Backburner. Legacy pricing was a loss-leader; no material revenue impact. | 2026-07-05 |
| 2 | Cedrick Sanders | ACTIVE | Closed and onboarded June 2026. | 2026-06-xx |
| — | Mobile detailing lead (Drew Park) | WARM — follow up | Highest-priority pipeline lead as of last field session. | 2026-07-05 |
| — | Fix Roofing LLC | FOLLOW UP | Card collected, call pending. | 2026-07-05 |
| — | Sunbrite Auto Works | FOLLOW UP | Card collected, call pending. | 2026-07-05 |

## PLACEHOLDER content in index.html

Sections that are not yet final, marked with `PLACEHOLDER` comments in the source:

- **Testimonials** (`#testimonials`): no real customer quotes captured yet. Cards are explicitly labeled as placeholders. Do not invent quotes or names — replace the whole block when real quotes are provided.
- **"Book a Demo" links**: currently point to `mailto:info@sqavy.com`. Replace with a real calendar/booking link when one is set up.

When adding real content for any of these, remove the corresponding `PLACEHOLDER` comment and replace the whole block — don't leave placeholder copy mixed in with real data.

## Working with these files

- Both HTML files are meant to remain **single, self-contained files** — no external JS/CSS dependencies, no build step, no shared/imported code between them (the demo engine is duplicated, not factored out, on purpose). Keep new work inline within a file unless explicitly asked to split it up.
- `Sqavy_Demo.html` uses a minified, single-line style for `<style>`/`<script>` — match that if editing it, rather than reformatting.
- `index.html` is written in a normal, multi-line/indented style (it's expected to be hand-edited more often, e.g. swapping copy, pricing, or testimonials) — keep that readable formatting rather than minifying it.
- `index.html`'s section order matches the agreed site structure: Hero → How It Works → Features → Industries We Serve → interactive demo (`#demo`) → Pricing → Testimonials → FAQ → Book a Demo/Contact (`#demo-cta`) → footer. Preserve this order unless explicitly asked to change it.
- The interactive demo embedded in `#demo` (and the standalone `Sqavy_Demo.html`) shares the same engine shape, living in the inline `<script>`:
  - `run()` is the entire scripted timeline of the demo (driven by `await z(ms)` delays between steps). Editing the demo's story/pacing means editing the sequence of calls inside `run()`.
  - `log(level, text, cssClass)` appends a line to the system log panel (`#lb`). Use `'ok'`/`'er'` as the class for green/red highlighting.
  - `am(text, side, opts)` appends a chat bubble to the customer's SMS thread (`side` is `'f'` for the business/"from" or `'m'` for the customer/"me"); `opts.tp` adds a typing-indicator delay first.
  - `ap(side)` appends a photo-attachment bubble; `ab()` appends the calendar/booking-slot card.
  - `reset()` restores both phones and panels to their idle state.
- CSS classes use a terse, single-purpose naming convention (`.cv`/`.chv`/`.hv` for the call/chat/missed-call views, etc.) — view toggling is done by adding/removing the `.on` class, not by editing `display` directly.
- There is no linter or formatter configured.

## Development workflow

- To preview changes, open the HTML file directly in a browser (no server required).
- There are no automated tests or CI. A headless Playwright check is available in this environment (`/opt/node22/lib/node_modules/playwright`, browsers at `/opt/pw-browsers`) and is the preferred way to verify the interactive demo still runs end-to-end without console errors after edits — script it to click `#sb`, wait for `#sp.on`, then click `#rb`. Otherwise verify manually by clicking "Book a Demo" / "Simulate Missed Call" / "Reset" in a real browser and watching the full timeline play out.
