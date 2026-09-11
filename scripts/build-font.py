"""Subset the local Google Sans Flex variable font for self-hosting.

Keeps the wght + opsz axes (300-700 weights, optical sizing) and pins the
decorative axes (GRAD, ROND, slnt, wdth) to their defaults so browsers render
the intended cut. Latin, Latin-Extended (transliteration), punctuation and the
special symbols used across the guide are retained; Arabic is served by Amiri.
Run: python scripts/build-font.py
"""

import os

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "google font", "GoogleSansFlex-VariableFont_GRAD,ROND,opsz,slnt,wdth,wght.ttf")
OUTPUT = os.path.join(ROOT, "app", "fonts", "google-sans-flex.woff2")

# Ranges: basic latin, latin-1 (copyright, middle dot, multiplication),
# latin extended A/B (a-macron, i-macron, u-macron, h-line-below, etc.),
# IPA/modifier letters (right single quote 02BC, glottal marks),
# combining diacriticals, general punctuation (dashes, quotes, ellipsis),
# arrows, command key symbol, four-pointed star.
UNICODES = ",".join(
    [
        "U+0020-007E",  # basic latin
        "U+00A0-00FF",  # latin-1 supplement
        "U+0100-024F",  # latin extended A + B
        "U+0250-02AF",  # IPA extensions
        "U+02B0-02FF",  # spacing modifier letters (02BC apostrophe, glottal)
        "U+0300-036F",  # combining diacritical marks
        "U+1E00-1EFF",  # latin additional (ḥ ṣ ṭ ẓ …)
        "U+2000-206F",  # general punctuation (— ‘ ’ “ ” …)
        "U+2190-21BB",  # arrows
        "U+2318",       # ⌘
        "U+2726",       # ✦ memory tip star
        "U+00D7",       # multiplication sign
    ]
)

OPTIONS = {
    "flavor": "woff2",
    "desubroutinize": True,
    "drop_tables": ["+DSIG"],
    "layout_features": ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"],
    "no_hinting": True,
    "notdef_outline": True,
    "recalc_bounds": True,
    "retain_gids": False,
    "name_IDs": [1, 2, 3, 4, 6],
    "passthrough_tables": False,
    "normalize_design_units": False,
    "updateNameTable": False,
}


def codepoints() -> list[int]:
    ranges = []
    for entry in UNICODES.split(","):
        entry = entry.strip().replace("U+", "")
        if "-" in entry:
            start, end = entry.split("-")
            ranges.extend(range(int(start, 16), int(end, 16) + 1))
        else:
            ranges.append(int(entry, 16))
    return ranges


def build() -> None:
    from fontTools.varLib.instancer import instantiateVariableFont

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    options = subset.Options()
    for key, value in OPTIONS.items():
        setattr(options, key, value)
    options.flavor = "woff2"

    # Subset first (works on the full variable font), then pin the decorative
    # axes to their defaults and clamp wght to the 300-700 range the site uses.
    # Only the weight axis ships variable, keeping the file small.
    font = TTFont(SOURCE, lazy=False)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=codepoints())
    subsetter.subset(font)

    if "fvar" in font:
        defaults = {axis.axisTag: axis.defaultValue for axis in font["fvar"].axes}
        axes = {tag: value for tag, value in defaults.items() if tag != "wght"}
        axes["wght"] = (300, 700)
        instantiateVariableFont(font, axes, inplace=True, updateFontNames=True)
    font.flavor = "woff2"
    font.save(OUTPUT)

    check = TTFont(OUTPUT)
    cmap = check.getBestCmap()

    # Every needed codepoint must be present, unless the source font never
    # contained it (arrows, ⌘, ✦ and some dot-below letters fall back to the
    # system font stack — acceptable for isolated icon-like glyphs).
    needed = [
        0x0101, 0x012B, 0x016B, 0x02BC, 0x1E63, 0x1E62, 0x2014, 0x2019,
        0x201C, 0x201D, 0x2026, 0x00A9, 0x00B7, 0x00D7,
    ]
    source_cmap = TTFont(SOURCE).getBestCmap()
    missing = [hex(code) for code in needed if code not in cmap and code in source_cmap]
    if missing:
        raise SystemExit(f"Subset is missing required codepoints: {missing}")

    print(f"axes kept: {[(a.axisTag, a.minValue, a.maxValue) for a in check['fvar'].axes]}")
    print(f"glyphs: {len(cmap)}")
    print(f"size: {round(os.path.getsize(OUTPUT) / 1024, 1)} KB -> {OUTPUT}")


if __name__ == "__main__":
    build()
