#!/usr/bin/env bash
# =============================================================================
# Regenerates public/og-image.png — the 1200x630 social sharing card.
# =============================================================================
# The generated PNG is COMMITTED, so the founder never has to run this script.
# It is documented here so the card can be reproduced or restyled later.
#
# Requirements (developer machine only, not part of the site build):
#   - ImageMagick 6+ (`convert`)
#   - Python + fonttools (`pip install fonttools brotli`) to cut static
#     Montserrat / Open Sans instances from the @fontsource-variable packages.
#
# The card deliberately contains NO logo: the approved Obsidixz logo asset has
# not been supplied. It uses the brand palette and the restrained interlock
# motif only. Replace with the approved logo lockup once supplied.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

FONTDIR="${TMPDIR:-/tmp}/obsidixz-fonts"
mkdir -p "$FONTDIR"

python3 - "$FONTDIR" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

out = sys.argv[1]
jobs = [
    ("node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2", 700, "Montserrat-Bold.ttf"),
    ("node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2", 600, "Montserrat-SemiBold.ttf"),
    ("node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2", 400, "OpenSans-Regular.ttf"),
    ("node_modules/@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2", 600, "OpenSans-SemiBold.ttf"),
]
for src, wght, name in jobs:
    font = TTFont(src)
    pins = {axis.axisTag: (wght if axis.axisTag == "wght" else 100) for axis in font["fvar"].axes}
    instantiateVariableFont(font, pins).save(f"{out}/{name}")
PY

convert -size 1200x630 xc:'#111111' \
  -fill '#315C9B' -draw "rectangle 0,0 420,630" \
  -fill none -stroke '#FFFFFF' -strokewidth 4 -draw "rectangle 60,132 178,250" \
  -fill '#B47745' -stroke none -draw "rectangle 178,250 296,368" \
  -fill '#B47745' -draw "rectangle 60,470 130,477" \
  -font "$FONTDIR/Montserrat-Bold.ttf" -pointsize 44 -kerning 6 -fill '#FFFFFF' -annotate +58+540 "OBSIDIXZ" \
  -font "$FONTDIR/OpenSans-SemiBold.ttf" -pointsize 17 -kerning 5 -fill '#C9D6EA' -annotate +60+576 "REAL ESTATE" \
  -fill '#B47745' -stroke none -draw "rectangle 486,120 560,127" \
  -font "$FONTDIR/OpenSans-SemiBold.ttf" -pointsize 17 -kerning 4 -fill '#8FA3BF' -annotate +486+106 "PROPERTY LEAD RESEARCH" \
  -font "$FONTDIR/Montserrat-Bold.ttf" -pointsize 62 -kerning -1 -fill '#FFFFFF' -annotate +484+238 "Smarter Research." \
  -annotate +484+312 "Better Real Estate" \
  -fill '#B47745' -annotate +484+386 "Opportunities." \
  -font "$FONTDIR/OpenSans-Regular.ttf" -pointsize 22 -fill '#A9B4C1' -annotate +486+462 "Structured, criteria-based property" \
  -annotate +486+496 "research for US residential investors." \
  public/og-image.png

echo "Wrote public/og-image.png"
