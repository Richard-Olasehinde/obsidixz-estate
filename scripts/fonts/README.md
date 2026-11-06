# Measurement fonts

These four small TrueType files exist **only** so `scripts/check-layout-metrics.mjs` can
measure real glyph widths without a browser and without a font-parsing dependency.

They are static instances cut from the same `@fontsource-variable` files the site itself
serves, so the metrics are identical to what the browser renders:

| File | Source | Instance |
| --- | --- | --- |
| `Montserrat-SemiBold.ttf` | `@fontsource-variable/montserrat` latin, `wght` axis | 600 |
| `Montserrat-Bold.ttf` | same | 700 |
| `OpenSans-Regular.ttf` | `@fontsource-variable/open-sans` latin, `wght` axis | 400 |
| `OpenSans-SemiBold.ttf` | same | 600 |

Both families are licensed under the **SIL Open Font License 1.1**; the licence text is in
`OFL-LICENSE.txt`. Redistribution here is compliant: the files are unmodified instances for
measurement only, they are not sold, and the licence is included.

## Regenerating

If the brand typography changes, regenerate with `fonttools`:

```bash
pip install fonttools brotli
python3 - <<'PY'
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

jobs = [
    ("node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2", 700, "scripts/fonts/Montserrat-Bold.ttf"),
    ("node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2", 600, "scripts/fonts/Montserrat-SemiBold.ttf"),
    ("node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2", 400, "scripts/fonts/OpenSans-Regular.ttf"),
    ("node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2", 600, "scripts/fonts/OpenSans-SemiBold.ttf"),
]
for src, weight, out in jobs:
    font = TTFont(src)
    pins = {axis.axisTag: (weight if axis.axisTag == "wght" else 100) for axis in font["fvar"].axes}
    inst = instantiateVariableFont(font, pins)
    inst.flavor = None   # write plain TrueType, not woff2
    inst.save(out)
PY
```

Note `inst.flavor = None` — without it, fontTools preserves the `woff2` container and the
JavaScript reader (which expects a plain sfnt) cannot parse it. That mistake was made once and
caught by running the check.
