# Adriatic Then & Now — Five Centuries of the Adriatic Coast

Twenty public-domain nautical charts of the Adriatic, from Venetian isolari of the 1500s to British Admiralty surveys of 1877, each in a draggable then/now slider against a satellite view of the same coastline. A weekend-scale static site for GitHub Pages, built to earn backlinks for marespot.com.

## Why this project

1. **Cheapest link magnet in the portfolio** — public-domain images, no pipeline, ships in days.
2. **Curator candy** — r/MapPorn, Maps Mania and history pages link to old-map comparisons readily and forever.
3. **Starts the backlink age clock** for the marespot.com subdomain ecosystem while Baltic Lanes is still building.

## Live at

`https://charts.marespot.com` (GitHub Pages + custom domain; same Porkbun CNAME setup as Baltic Lanes: CNAME `charts` → `<username>.github.io`).

## Repo layout

```
adriatic-maps/
├── README.md            ← this file
├── AGENTS.md            ← agent contract (licenses are the hard part — read it)
├── CNAME                ← created at deploy time (charts.marespot.com)
├── site/                ← the static site (vanilla HTML/TS, no framework)
│   ├── index.html
│   ├── fonts/           ← self-hosted Fraunces variable font (OFL 1.1)
│   ├── img/             ← optimized chart images (committed)
│   └── LICENSE-MANIFEST.json  ← every image + license + source URL
└── docs/
    └── sources.md       ← where to find charts, license rules, candidate list
```

## Working method

Agents do all the coding; read `AGENTS.md` first. Sprints are small: (1) slider + one map pair live, (2) full timeline of 5+ centuries, (3) share kit (scenes, embed, press stills).

## Attribution (footer, all pages)

- Each chart credited on-screen in its caption: author, year, source institution, license.
- Display typeface: Fraunces (SIL Open Font License 1.1), self-hosted latin subsets in `site/fonts/` — https://github.com/undercasetype/Fraunces
- "A MareSpot experiment — live Adriatic wind, shelter & sea temperature at [marespot.com](https://marespot.com)"
