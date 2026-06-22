# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo contains two self-contained static HTML artifacts and nothing else — no build system, package manager, server, or test suite.

- **`index.html`** — the customer-facing marketing site for **Sqavy**, an AI missed-call text-back / lead-recovery service for home service businesses (general repair/remodel, HVAC/plumbing/electrical, recurring services like lawn/cleaning). One-page layout: hero → "how it works" steps → target-audience cards → an embedded interactive demo → a contact/CTA section → footer. This is the file to point people at to explain/sell the product.
- **`Sqavy_Demo.html`** — the original standalone demo, kept as-is. Same simulated missed-call-to-booked-job flow, different (drywall-repair) scripted scenario and older visual style.

Both files simulate the same idea: a side-by-side phone comparison —

- **Left phone**: the customer's phone, showing an SMS conversation with the business (powered by Sqavy).
- **Right phone**: the business owner's phone, showing the call going unanswered.

Clicking "Simulate Missed Call" plays a scripted sequence: an inbound call is missed, Sqavy auto-texts the customer, a conversation unfolds (intent capture → job details → photos/description → quote → scheduling → booking → confirmation), and a "Lead Recovered" summary panel appears at the end. A system log panel mirrors each step as a structured event (e.g. `missed_call_auto_text`, intent detection, quote generation, calendar entry creation) to make the backend automation legible to a viewer.

## PLACEHOLDER content in index.html

`index.html` ships with content that is **not final** and is marked with `PLACEHOLDER` comments in the source:

- **Brand colors**: CSS variables in `:root` (`--navy`, `--blue`, etc.) are copied from `Sqavy_Demo.html`'s existing palette, not an official brand kit. Swap the variable values once real hex codes/logo are provided — the rest of the page reads from these variables, so no other changes should be needed.
- **Contact info / CTAs**: the `#contact` section and the nav/hero "Get Started" links are placeholders (fake phone/email, `href="#contact"`). Replace with the real contact method, signup link, or form before this goes live anywhere.

## Working with these files

- Both HTML files are meant to remain **single, self-contained files** — no external JS/CSS dependencies, no build step, no shared/imported code between them (the demo engine is duplicated, not factored out, on purpose). Keep new work inline within a file unless explicitly asked to split it up.
- `Sqavy_Demo.html` uses a minified, single-line style for `<style>`/`<script>` — match that if editing it, rather than reformatting.
- `index.html` is written in a normal, multi-line/indented style (it's expected to be hand-edited more often, e.g. swapping copy or brand colors) — keep that readable formatting rather than minifying it.
- The demo engine (same shape in both files) lives in the inline `<script>`:
  - `run()` is the entire scripted timeline of the demo (driven by `await z(ms)` delays between steps). Editing the demo's story/pacing means editing the sequence of calls inside `run()`.
  - `log(level, text, cssClass)` appends a line to the system log panel (`#lb`). Use `'ok'`/`'er'` as the class for green/red highlighting.
  - `am(text, side, opts)` appends a chat bubble to the customer's SMS thread (`side` is `'f'` for the business/"from" or `'m'` for the customer/"me"); `opts.tp` adds a typing-indicator delay first. (`Sqavy_Demo.html` also mirrors every `am`/`ap`/`ab` call into a separate transcript panel via `te()`; `index.html` does not have a transcript panel.)
  - `ap(side)` appends a photo-attachment bubble; `ab()` appends the calendar/booking-slot card.
  - `reset()` restores both phones and panels to their idle state.
- CSS classes use a terse, single-purpose naming convention (`.cv`/`.chv`/`.hv` for the call/chat/missed-call views, etc.) — view toggling is done by adding/removing the `.on` class, not by editing `display` directly.
- There is no linter or formatter configured.

## Development workflow

- To preview changes, open the HTML file directly in a browser (no server required).
- There are no automated tests or CI. Verify changes by manually clicking "Simulate Missed Call" and "Reset" and watching the full timeline play out, including the final "Lead Recovered" summary panel.
