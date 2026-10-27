# Elenco delle radio italiane per radio-card, preso da radio-browser.info (la stessa fonte
# dell'integrazione Radio Browser di HA).
# Gira DENTRO il container home-assistant (ha aiohttp e Pillow e scrive in /config):
#   docker exec -i home-assistant python3 - < radio_sync.py
# Scrive /config/www/radio/radio.json e i loghi in /config/www/radio/logo/<id>.png
# (serviti come /local/radio/..., quindi funzionano anche via Nabu Casa).
# Le stazioni doppie (stesso nome) diventano una sola: flusso migliore + gli altri come riserva.
import asyncio
import hashlib
import io
import json
import os
import re
import sys
import time
import unicodedata

import aiohttp

API = "https://de1.api.radio-browser.info/json/stations/bycountrycodeexact/IT?hidebroken=true&limit=20000"
OUT = "/config/www/radio"
LOGO = OUT + "/logo"
FAIL = OUT + "/logo_falliti.json"   # loghi non scaricabili: riprova dopo una settimana
RETRY = 7 * 86400
UA = {"User-Agent": "ha-media-cards radio-card/1.0"}


def norm(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def stream_rank(s):
    # https prima (si sente anche via Nabu Casa), poi niente HLS, poi i più ascoltati
    u = s.get("url_resolved") or s.get("url") or ""
    return (u.startswith("https://"), not s.get("hls"), s.get("clickcount") or 0, s.get("votes") or 0)


def merge(raw):
    groups = {}
    for s in raw:
        name = re.sub(r"\s+", " ", (s.get("name") or "")).strip(" #\t")
        k = norm(name)
        if not k or not (s.get("url_resolved") or s.get("url")):
            continue
        s["_name"] = name
        groups.setdefault(k, []).append(s)
    out = []
    for k, ss in groups.items():
        ss.sort(key=stream_rank, reverse=True)
        best = ss[0]
        urls = []
        for s in ss:
            u = s.get("url_resolved") or s.get("url")
            if u not in urls:
                urls.append(u)
        with_logo = sorted((s for s in ss if s.get("favicon")), key=lambda s: (s.get("votes") or 0), reverse=True)
        tags = []
        for s in ss:
            for t in (s.get("tags") or "").split(","):
                t = t.strip().lower()
                if t and t not in tags:
                    tags.append(t)
        # nome più usato tra i doppioni, con le maiuscole del migliore
        names = {}
        for s in ss:
            names[s["_name"]] = names.get(s["_name"], 0) + 1
        out.append({
            "k": k,
            "n": max(names, key=lambda n: (names[n], n == best["_name"])),
            "u": urls[0],
            "alt": urls[1:4],
            "h": 1 if best.get("hls") else 0,
            "c": best.get("codec") or "",
            "b": best.get("bitrate") or 0,
            "t": tags[:6],
            "p": sum((s.get("clickcount") or 0) for s in ss) * 10 + max((s.get("votes") or 0) for s in ss) // 100,
            "_fav": [s["favicon"] for s in with_logo[:3]],
            "id": hashlib.sha1(k.encode()).hexdigest()[:12],
        })
    out.sort(key=lambda s: (-s["p"], s["n"].lower()))
    return out


async def fetch_logo(session, st, sem, fails):
    path = f"{LOGO}/{st['id']}.png"
    if os.path.exists(path):
        return True
    if time.time() - fails.get(st["id"], 0) < RETRY or not st["_fav"]:
        return False
    from PIL import Image
    async with sem:
        for url in st["_fav"]:
            try:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10), headers=UA, ssl=False) as r:
                    if r.status != 200:
                        continue
                    data = await r.content.read(3_000_000)
                im = Image.open(io.BytesIO(data))
                if getattr(im, "n_frames", 1) > 1 and im.format == "ICO":
                    im = max((im.ico.getimage(sz) for sz in im.ico.sizes()), key=lambda i: i.size[0])
                im = im.convert("RGBA")
                if min(im.size) < 16:
                    continue
                im.thumbnail((128, 128))
                buf = io.BytesIO()
                im.save(buf, "PNG", optimize=True)
                with open(path + ".tmp", "wb") as f:
                    f.write(buf.getvalue())
                os.replace(path + ".tmp", path)
                fails.pop(st["id"], None)
                return True
            except Exception:
                continue
    fails[st["id"]] = time.time()
    return False


async def main():
    os.makedirs(LOGO, exist_ok=True)
    try:
        with open(FAIL) as f:
            fails = json.load(f)
    except Exception:
        fails = {}
    async with aiohttp.ClientSession() as session:
        async with session.get(API, headers=UA, timeout=aiohttp.ClientTimeout(total=120)) as r:
            r.raise_for_status()
            raw = await r.json(content_type=None)
        stations = merge(raw)
        if len(stations) < 50:
            raise SystemExit(f"troppe poche stazioni ({len(stations)}), non sovrascrivo")
        sem = asyncio.Semaphore(16)
        ok = await asyncio.gather(*(fetch_logo(session, st, sem, fails) for st in stations))
    for st, has in zip(stations, ok):
        st["l"] = 1 if has else 0
        del st["_fav"], st["p"]
    keep = {st["id"] for st in stations}
    for fn in os.listdir(LOGO):
        if fn.endswith(".png") and fn[:-4] not in keep:
            os.remove(f"{LOGO}/{fn}")
    doc = {"updated": int(time.time()), "stations": stations}
    with open(OUT + "/radio.json.tmp", "w") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(OUT + "/radio.json.tmp", OUT + "/radio.json")
    with open(FAIL, "w") as f:
        json.dump({k: v for k, v in fails.items() if k in keep}, f)
    print(time.strftime("%Y-%m-%d %H:%M"), f"{len(raw)} voci, {len(stations)} stazioni, {sum(ok)} loghi")


asyncio.run(main())
