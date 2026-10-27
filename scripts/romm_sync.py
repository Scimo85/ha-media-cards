# Copia l'elenco dei giochi di RomM e le copertine in /config/www/romm/,
# così romm-games-card li carica da /local/ anche via Nabu Casa (HTTPS, fuori casa).
# Gira DENTRO il container home-assistant (ha aiohttp e scrive in /config):
#   ROMM_TOKEN=... ROMM_URL=http://<ip>:8093 docker exec -i -e ROMM_TOKEN -e ROMM_URL home-assistant python3 - < romm_sync.py
# Il token è un client token RomM di sola lettura (roms.read, platforms.read, assets.read).
# Scrive giochi.json (versione compatta del catalogo, con tutte le console che hanno la cartella, anche vuote),
# scarica le copertine mancanti o cambiate e i loghi delle console (in console/), cancella quelli non più usati. Non riscrive giochi.json se non è cambiato niente.
import asyncio
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

import aiohttp

ROMM = os.environ.get("ROMM_URL", "http://192.168.1.10:8093")
OUT = "/config/www/romm"
COVERS = os.path.join(OUT, "cover")
LOGOS = os.path.join(OUT, "console")
PAGE = 500


def write_atomic(path, data):
    tmp = path + ".tmp"
    with open(tmp, "wb") as f:
        f.write(data)
    os.chmod(tmp, 0o644)
    os.replace(tmp, path)


def year(rom):
    t = (rom.get("metadatum") or {}).get("first_release_date")
    if not t:
        return None
    try:
        return datetime.fromtimestamp(t / 1000 if t > 1e11 else t, timezone.utc).year
    except (TypeError, ValueError, OSError):
        return None


async def main():
    token = os.environ.get("ROMM_TOKEN", "").strip()
    if not token:
        raise SystemExit("ROMM_TOKEN mancante")
    os.makedirs(COVERS, exist_ok=True)
    os.makedirs(LOGOS, exist_ok=True)
    headers = {"Authorization": "Bearer " + token}
    added = removed = failed = 0
    timeout = aiohttp.ClientTimeout(total=120)
    async with aiohttp.ClientSession(headers=headers, timeout=timeout) as session, \
            aiohttp.ClientSession(timeout=timeout) as plain:
        async with session.get(f"{ROMM}/api/platforms") as r:
            r.raise_for_status()
            platforms = await r.json()
        roms, offset = [], 0
        while True:
            params = {"limit": PAGE, "offset": offset, "order_by": "name", "order_dir": "asc", "with_total": "true"}
            async with session.get(f"{ROMM}/api/roms", params=params) as r:
                r.raise_for_status()
                page = await r.json()
            roms += page["items"]
            offset += PAGE
            if not page["items"] or offset >= (page.get("total") or 0):
                break

        games, keep = [], set()
        for rom in roms:
            if rom.get("missing_from_fs"):
                continue
            cover = None
            src = rom.get("path_cover_small") or rom.get("path_cover_large") or ""
            if src:
                # il nome del file cambia quando cambia la copertina (ts nel percorso di RomM)
                h = hashlib.sha1(src.encode()).hexdigest()[:10]
                ext = os.path.splitext(src.split("?")[0])[1] or ".png"
                cover = f"{rom['id']}-{h}{ext}"
                keep.add(cover)
                path = os.path.join(COVERS, cover)
                if not os.path.exists(path):
                    try:
                        async with session.get(ROMM + src) as r:
                            data = await r.read()
                            if r.status != 200 or not r.headers.get("Content-Type", "").startswith("image/"):
                                raise RuntimeError(f"HTTP {r.status}")
                        write_atomic(path, data)
                        added += 1
                    except Exception as e:  # una copertina che non si scarica non blocca le altre
                        failed += 1
                        keep.discard(cover)
                        cover = None
                        print(f"copertina {rom['id']} non scaricata: {e}", file=sys.stderr)
            games.append({
                "id": rom["id"],
                "name": rom.get("name") or rom.get("fs_name_no_tags") or rom.get("fs_name"),
                "platform": rom.get("platform_id"),
                "slug": rom.get("platform_slug"),
                "year": year(rom),
                "regions": rom.get("regions") or [],
                "cover": cover,
            })

        counts = {}
        for g in games:
            counts[g["platform"]] = counts.get(g["platform"], 0) + 1
        # tutte le console con la cartella in roms/, anche vuote (la card le mostra come cartelle)
        plats, logos = [], set()
        for p in platforms:
            if p.get("missing_from_fs"):
                continue
            logo = None
            # versione piccola del logo: IGDB t_logo_med al posto di t_1080p, TheGamesDB thumb al posto di original
            src = (p.get("url_logo") or "").replace("/t_1080p/", "/t_logo_med/").replace("/images/original/", "/images/thumb/")
            if src.startswith("http"):
                ext = os.path.splitext(src.split("?")[0])[1].lower()
                logo = p["fs_slug"] + (ext if ext in (".jpg", ".jpeg", ".png", ".webp", ".svg") else ".png")
                path = os.path.join(LOGOS, logo)
                if not os.path.exists(path):
                    try:
                        # sessione senza token: i loghi stanno su siti esterni (IGDB, TheGamesDB)
                        async with plain.get(src) as r:
                            data = await r.read()
                            if r.status != 200 or not r.headers.get("Content-Type", "").startswith("image/"):
                                raise RuntimeError(f"HTTP {r.status}")
                        write_atomic(path, data)
                        added += 1
                    except Exception as e:
                        failed += 1
                        logo = None
                        print(f"logo {p['fs_slug']} non scaricato: {e}", file=sys.stderr)
            if logo:
                logos.add(logo)
            plats.append({"id": p["id"], "slug": p["slug"], "fs_slug": p["fs_slug"],
                          "name": p.get("custom_name") or p.get("display_name") or p["name"],
                          "family": p.get("family_name") or "", "count": counts.get(p["id"], 0), "logo": logo})
        plats.sort(key=lambda p: p["name"].lower())

        for name in os.listdir(LOGOS):
            if name not in logos and not name.endswith(".tmp"):
                os.remove(os.path.join(LOGOS, name))
        for name in os.listdir(COVERS):
            if name not in keep and not name.endswith(".tmp"):
                os.remove(os.path.join(COVERS, name))
                removed += 1

    catalog = {"platforms": plats, "games": games}
    body = json.dumps(catalog, ensure_ascii=False, sort_keys=True)
    path = os.path.join(OUT, "giochi.json")
    try:
        with open(path) as f:
            old = json.load(f)
        old.pop("updated", None)
        same = json.dumps(old, ensure_ascii=False, sort_keys=True) == body
    except (OSError, ValueError):
        same = False
    if not same:
        catalog["updated"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        write_atomic(path, json.dumps(catalog, ensure_ascii=False).encode())
    if not same or added or removed or failed:
        print(f"{datetime.now():%Y-%m-%d %H:%M} giochi {len(games)}, console {len(plats)}, "
              f"immagini aggiunte {added}, copertine tolte {removed}, errori {failed}")


asyncio.run(main())
