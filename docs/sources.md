# Where to find old Adriatic charts (and what you may legally ship)

## License rules (short version)

- Originals published **before 1900** by authors dead 70+ years are public domain. But always verify the **scan's** license too: the scan can carry its own terms.
- **Wikimedia Commons**: the license on the file page governs. Record per-file attribution. Commons API gives this metadata (the pipeline script in this repo already does it: `site/img/sources.json` was produced via the `imageinfo` + `extmetadata` API).
- **David Rumsey Map Collection**: per-item; many items are free to use with attribution, some are not. Record what the item page says, item by item.
- **NASA images**: public domain. Credit NASA (and astronaut/mission where given).
- **Gallica (BnF), Österreichische Nationalbibliothek (Austrian National Library map collection), Croatian national and university libraries**: check per-item reuse terms; many old charts are reusable.
- **If you cannot verify a license, do not ship the image.** Public-domain Adriatic charts are abundant; there is no reason to take risk.

## Every shipped image must appear in `site/LICENSE-MANIFEST.json`

Fields: `key`, `title`, `author`, `year`, `institution/source`, `source_url`, `license`, `verified_date`. The manifest is the source of truth for on-page captions.

## Already sourced and verified (in `site/img/`)

Twenty images, all public domain except one CC0, verified 2026-11-18 via the Commons `imageinfo`/`extmetadata` API (raw responses in `site/img/sources.json`, curated display data in `site/LICENSE-MANIFEST.json`). The collection now spans five centuries in chronological order:

| century | keys |
|---|---|
| 1500s | `zara1530` (Pagano isolario), `ragusa1560` (Scotti), `metellus1579` (Metellus), `bianco1600` (pilgrim guide) |
| 1600s | `mercator1609`, `blaeu1645`, `jansson1657`, `boschini`, `blaeu1663` (Illyricum), `cantelli1680`, `isole1697` (Coronelli) |
| 1700s | `quarnero1700` (BnF), `keulen1750` (Rijksmuseum, CC0), `bellin1764` (BnF) |
| 1800s | `zara1806` (BnF), `illyria1817`, `sduk1852`, `admiralty1877` (Kvarner), `zara1877` (Port Zara) |
| today | `nasa2003` (NASA satellite photograph) |

## Finding more (targets for the full site)

- A Venetian portolan chart of the Adriatic (13th–15th c.), e.g. from the Biblioteca Marciana or David Rumsey.
- An Ottoman or Habsburg view of the same coast (the borderland angle: same sea, rival maps).
- Early Croatian/Hydrographic Institute charts (20th c., HHI Split; check terms).
- A 19th-century Austro-Hungarian survey chart (mid-1800s; likely PD).
- A modern nautical chart for the "then" side is NOT usable (Hydrographic Institute charts are copyrighted). The satellite image is the "now" layer.

## Search tips

- Commons API: `generator=search&gsrsearch=Adriatic 17th century map&gsrnamespace=6`
- Gallica (gallica.bnf.fr): search "Carte marine Adriatique", filter "images", check "droits" per item.
- David Rumsey: search "Adriatic Sea", filter date < 1900, note the per-item rights line.

## Stretch goal (post-MVP): georeferenced overlay

MVP is a framed slider (no georeferencing). The upgrade: pick 8–12 ground control points per chart (prominent capes, island tips), warp the old chart onto modern coordinates (QGIS freehand georeferencing export, or a thin-plate-spline in JS), and let the old chart *sit on* the satellite with a transparency slider. That is the version most likely to be picked up by Maps Mania. Keep it as scene v2, not a launch blocker.
