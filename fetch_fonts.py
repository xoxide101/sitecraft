"""Downloads SiteCraft's interface fonts from Google Fonts into fonts/ so the app works offline.

Writes fonts/*.woff2 and fonts/fonts.css (local @font-face rules). Only the Latin and
Latin Extended character sets are kept, which cover English and most European languages.

Run:  python fetch_fonts.py
"""
import pathlib
import re
import urllib.request

CSS_URL = ("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700"
           "&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap")
KEEP = {"latin", "latin-ext"}
# A modern browser user agent makes Google serve woff2 files.
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

root = pathlib.Path(__file__).parent
out = root / "fonts"
out.mkdir(exist_ok=True)


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA})).read()


css = get(CSS_URL).decode("utf-8")
# Google's CSS is a list of "/* subset */ @font-face { ... }" blocks.
blocks = re.findall(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S)
local_css, downloaded = [], {}
for subset, block in blocks:
    if subset not in KEEP:
        continue
    family = re.search(r"font-family: '([^']+)'", block).group(1)
    weight = re.search(r"font-weight: ([\d ]+);", block).group(1).replace(" ", "-")
    url = re.search(r"url\((https://[^)]+)\)", block).group(1)
    name = f"{family.replace(' ', '')}-{weight}-{subset}.woff2"
    if url not in downloaded:
        (out / name).write_bytes(get(url))
        downloaded[url] = name
    local_css.append(f"/* {family} {weight} {subset} */\n" + block.replace(url, downloaded[url]))

(out / "fonts.css").write_text("\n".join(local_css) + "\n", encoding="utf-8")
print(f"Wrote {len(local_css)} @font-face rules and {len(downloaded)} font files to fonts/")
