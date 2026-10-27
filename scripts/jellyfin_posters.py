# Copia le copertine di film e serie da Jellyfin in /config/www/jellyfin/<id>.jpg,
# così media-catalog-card le carica da /local/ anche via Nabu Casa (HTTPS, fuori casa).
# Gira DENTRO il container home-assistant (ha aiohttp e scrive in /config):
#   HA_TOKEN=... docker exec -i -e HA_TOKEN home-assistant python3 - < jellyfin_posters.py
# Legge il catalogo come la card (media_source/browse_media), scarica solo le copertine mancanti
# e cancella quelle di titoli non più presenti.
import asyncio
import os
import re
import sys

import aiohttp

HA_WS = "http://127.0.0.1:8123/api/websocket"
SOURCE = "media-source://jellyfin"
OUT = "/config/www/jellyfin"
ID_RE = re.compile(r"/Items/([0-9a-fA-F]{32})/Images/")


async def catalog(session, token):
    """Ritorna {jellyfin_id: thumbnail_url} per film e serie, come media-catalog-card."""
    items = {}
    async with session.ws_connect(HA_WS) as ws:
        await ws.receive_json()
        await ws.send_json({"type": "auth", "access_token": token})
        if (await ws.receive_json()).get("type") != "auth_ok":
            raise SystemExit("autenticazione HA fallita")
        msg_id = 0

        async def browse(cid):
            nonlocal msg_id
            msg_id += 1
            await ws.send_json({"id": msg_id, "type": "media_source/browse_media", "media_content_id": cid})
            r = await ws.receive_json()
            if not r.get("success"):
                raise RuntimeError(f"browse {cid}: {r.get('error')}")
            return r["result"]

        def add_all(children):
            for it in children or []:
                if it.get("media_class") in ("movie", "tv_show") and it.get("thumbnail"):
                    m = ID_RE.search(it["thumbnail"])
                    if m:
                        items[m.group(1).lower()] = it["thumbnail"]

        root = await browse(SOURCE)
        add_all(root.get("children"))
        for lib in root.get("children") or []:
            if not lib.get("can_expand") or lib.get("media_class") in ("movie", "tv_show"):
                continue
            if lib.get("children_media_class") not in (None, "movie", "tv_show", "directory"):
                continue
            try:
                add_all((await browse(lib["media_content_id"])).get("children"))
            except RuntimeError as e:
                print("libreria saltata:", e, file=sys.stderr)
    return items


async def main():
    token = os.environ.get("HA_TOKEN", "").strip()
    if not token:
        raise SystemExit("manca HA_TOKEN")
    os.makedirs(OUT, exist_ok=True)
    added = removed = failed = 0
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=60)) as session:
        items = await catalog(session, token)
        for jid, url in items.items():
            path = os.path.join(OUT, jid + ".jpg")
            if os.path.exists(path):
                continue
            try:
                async with session.get(url) as r:
                    data = await r.read()
                    if r.status != 200 or not r.headers.get("Content-Type", "").startswith("image/"):
                        raise RuntimeError(f"HTTP {r.status}")
                tmp = path + ".tmp"
                with open(tmp, "wb") as f:
                    f.write(data)
                os.chmod(tmp, 0o644)
                os.replace(tmp, path)
                added += 1
            except Exception as e:  # una copertina che non arriva non deve fermare le altre
                failed += 1
                print(f"copertina {jid} non scaricata: {e}", file=sys.stderr)
    # Pulizia solo se il catalogo non è vuoto (evita di cancellare tutto se Jellyfin è giù)
    if items:
        for name in os.listdir(OUT):
            if name.endswith(".jpg") and name[:-4] not in items:
                os.remove(os.path.join(OUT, name))
                removed += 1
    print(f"titoli {len(items)}, copertine nuove {added}, rimosse {removed}, errori {failed}")


asyncio.run(main())
