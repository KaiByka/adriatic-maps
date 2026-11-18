# AGENTS.md — Adriatic Then & Now agent contract

You are a coding agent working on "Adriatic Then & Now". Read this before every task. When a task conflicts with this file, this file wins.

## Mission

A static site showing five centuries of the Adriatic coast through old nautical charts, each compared to a modern satellite view with a draggable before/after slider. Published on GitHub Pages at `charts.marespot.com`. Purpose: earn backlinks for marespot.com. It is a visual showpiece, not a product.

## Non-negotiable hard rules

1. **Static output only.** No backend, no API keys at runtime, no auth. GitHub Actions deploys the built `site/` output; the repo root is never served.
2. **Public-domain / open-license images only.** Every image must be listed in `site/LICENSE-MANIFEST.json` with: title, author, year, source institution, source URL, license, and the date you verified it. Rules of thumb:
   - Maps published before 1900 are public domain (author died 70+ years ago) — verify the *scan's* license too, not just the original.
   - Wikimedia Commons: use the license stated on the file page; keep the per-file attribution text.
   - David Rumsey Map Collection: check each item; many are free to use with attribution, some are not — record what the item page says.
   - NASA satellite images are public domain; credit NASA (and the astronaut/mission where given).
   - **If you cannot verify a license, do not ship the image.** There is no shortage of public-domain Adriatic charts.
3. **Image budget.** Each chart image ≤ 400 KB after optimization (resize to ≤ 1800 px wide, JPEG/WebP, quality ~80). Total `site/img/` ≤ 40 MB. First load (HTML + CSS + JS + 2 images) ≤ 2 MB. Lazy-load every image after the first pair.
4. **Privacy-friendly analytics only.** GoatCounter, async, no cookies. Nothing else phones home. No popups, banners, or newsletter boxes.
5. **MareSpot linkage, exact and minimal.** Footer credit on all pages: "A MareSpot experiment — live Adriatic wind, shelter & sea temperature at marespot.com" (text link). One contextual bridge at most: in the caption of the most modern chart scene, one sentence linking old pilotage of the coast to MareSpot's live conditions. Nothing more without human approval.
6. **Deep-linkable scenes.** Every map pair reachable at `#chart=coronelli-1688` style hashes; scene state (which chart, slider position) serializes to the URL.
7. **Mobile-first, dark theme.** The slider must work with touch. Lighthouse mobile performance ≥ 85 (this project has no excuse to be heavy).
8. **Honest captions.** Each caption states what the chart is, who made it, when, and its known inaccuracies if interesting (e.g. fictional islands, distorted islands). Never present old charts as accurate geography.

## Tech stack (fixed, deliberately boring)

- Vanilla HTML + TypeScript + Vite. No framework. The slider is ~100 lines of JS (pointer events + clip-path), do not add a library for it.
- Images: sharp or squoosh CLI for optimization at build time; originals never enter the repo.
- Deploy: `.github/workflows/deploy.yml` building `site/` and deploying via actions/deploy-pages, Pages source = GitHub Actions.

## Definition of done

A visitor on a phone opens `charts.marespot.com`, sees a 17th-century chart of the Adriatic sliding into a satellite view under their finger, can step through five centuries via the timeline, share a direct link to any chart, and read a correct license-credited caption for every image. The site loads in under 2 seconds.
