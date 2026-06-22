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

## PLACEHOLDER content in index.html

Sections that are intentionally not final, marked with `PLACEHOLDER` comments in the source — do not invent real-looking data to fill these in:

- **Pricing** (`#pricing`): no tiers/numbers have been confirmed. Currently a single "coming soon" card instead of fabricated Starter/Pro/Business prices.
- **Testimonials** (`#testimonials`): no real customer quotes exist yet. Cards are explicitly labeled as placeholders rather than invented names/quotes.
- **Contact info / booking link** (`#demo-cta`): fake phone/email, CTA links point at `#demo-cta` itself. Replace with the real booking flow, phone, and email before launch.

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
