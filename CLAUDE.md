# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This repo currently contains a single self-contained artifact: `Sqavy_Demo.html`. There is no build system, package manager, server, or test suite — it's a static HTML/CSS/JS file meant to be opened directly in a browser.

It is an animated, scripted demo of **Sqavy**, an AI missed-call text-back / lead-recovery service for home service businesses. The demo simulates a side-by-side comparison:

- **Left phone**: the customer's phone, showing an SMS conversation with the business (powered by Sqavy).
- **Right phone**: the business owner's phone ("Sam"), showing the call going unanswered.

Clicking "Simulate Missed Call" plays a scripted sequence: an inbound call is missed, Sqavy auto-texts the customer, a conversation unfolds (intent capture → job details → photos → quote → scheduling → booking → confirmation), and a "Lead Recovered" summary panel appears at the end. A system log panel at the bottom mirrors each step as a structured event (e.g. `missed_call_auto_text`, intent detection, quote generation, calendar entry creation) to make the backend automation legible to a viewer.

## Working with this file

- `Sqavy_Demo.html` is meant to remain a **single, self-contained file** — no external JS/CSS dependencies, no build step. Keep new work inline within the file unless explicitly asked to split it up.
- All behavior lives in the inline `<script>` at the bottom of the file:
  - `run()` is the entire scripted timeline of the demo (driven by `await z(ms)` delays between steps). Editing the demo's story/pacing means editing the sequence of calls inside `run()`.
  - `log(level, text, cssClass)` appends a line to the system log panel (`#lb`). Use `'ok'`/`'er'` as the class for green/red highighting.
  - `am(text, side, opts)` appends a chat bubble to the customer's SMS thread (`side` is `'f'` for the business/"from" or `'m'` for the customer/"me"); `opts.tp` adds a typing-indicator delay first. Every call to `am`/`ap`/`ab` also mirrors the message into the transcript panel via `te()`.
  - `ap(side)` appends a photo-attachment bubble; `ab()` appends the calendar/booking-slot card.
  - `reset()` restores both phones and panels to their idle state.
- CSS classes use a terse, single-purpose naming convention (`.cv`/`.chv`/`.hv` for the call/chat/missed-call views, `.tm.s`/`.tm.c` for transcript "sent"/"customer" rows, etc.) — view toggling is done by adding/removing the `.on` class, not by editing `display` directly.
- There is no linter or formatter configured; match the existing minified, single-line style if editing the `<style>` or `<script>` blocks rather than reformatting them.

## Development workflow

- To preview changes, open `Sqavy_Demo.html` directly in a browser (no server required).
- There are no automated tests or CI. Verify changes by manually clicking "Simulate Missed Call" and "Reset" and watching the full timeline play out, including the final "Lead Recovered" summary panel.
