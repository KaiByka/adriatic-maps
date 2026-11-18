# scripts

## press-stills.js

Generates the press kit for charts.marespot.com (deterministic: rerunning
produces byte-identical output).

    cd scripts
    npm install        # installs sharp (^0.33, see package.json)
    node press-stills.js

Reads `site/img/*_sm.jpg`, `site/LICENSE-MANIFEST.json` and the SCENES/NOW_POS
data in `site/index.html`. Writes `site/press/`: one 1920x1080 side-by-side
still per chart scene (`{key}-then-now.jpg`, q82, <=450 KB), `hero-adriatic.jpg`
and `hero-islands.jpg` (hard copies), `og.jpg` (1200x630) and `index.html`.

System requirements: fontconfig with Liberation Sans (used for the overlay
text). `node_modules/` is gitignored; only the script and package files are
committed.
