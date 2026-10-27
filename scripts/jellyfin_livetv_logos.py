# Copia i loghi dei canali Live TV di Jellyfin in /config/www/jellyfin-tv/<id>.png,
# così livetv-card li carica da /local/ anche via Nabu Casa (HTTPS, fuori casa).
# Gira DENTRO il container home-assistant (ha aiohttp e scrive in /config):
#   docker exec -i -e JELLYFIN_URL=http://<ip>:8096 home-assistant python3 - < jellyfin_livetv_logos.py
# Usa la chiave API di Jellyfin `jellyfin_auth` di secrets.yaml (la stessa di rest_command.jellyfin_livetv_canali, vedi examples/rest_commands.yaml).
# Scarica i loghi mancanti e cancella quelli di canali non più presenti.
import asyncio
import os
import re
import sys

import aiohttp

JF = os.environ.get("JELLYFIN_URL", "http://192.168.1.10:8096")
OUT = "/config/www/jellyfin-tv"
SECRETS = "/config/secrets.yaml"


def auth_header():
    with open(SECRETS) as f:
        for line in f:
            m = re.match(r"\s*jellyfin_auth:\s*'(.*)'\s*$", line)
            if m:
                return m.group(1)
    raise SystemExit("jellyfin_auth non trovato in secrets.yaml")


async def main():
    os.makedirs(OUT, exist_ok=True)
    headers = {"Authorization": auth_header()}
    added = removed = failed = 0
    async with aiohttp.ClientSession(headers=headers, timeout=aiohttp.ClientTimeout(total=60)) as session:
        async with session.get(f"{JF}/LiveTv/Channels", params={"enableImages": "true", "enableUserData": "false"}) as r:
            r.raise_for_status()
            channels = (await r.json())["Items"]
        ids = {c["Id"] for c in channels if (c.get("ImageTags") or {}).get("Primary")}
        for cid in ids:
            path = os.path.join(OUT, cid + ".png")
            if os.path.exists(path):
                continue
            try:
                url = f"{JF}/Items/{cid}/Images/Primary"
                async with session.get(url, params={"format": "Png", "maxHeight": "180"}) as r:
                    data = await r.read()
                    if r.status != 200 or not r.headers.get("Content-Type", "").startswith("image/"):
                        raise RuntimeError(f"HTTP {r.status}")
                tmp = path + ".tmp"
                with open(tmp, "wb") as f:
                    f.write(data)
                os.chmod(tmp, 0o644)
                os.replace(tmp, path)
                added += 1
            except Exception as e:  # un logo che non si scarica non blocca gli altri
                failed += 1
                print(f"logo {cid} non scaricato: {e}", file=sys.stderr)
        for name in os.listdir(OUT):
            if name.endswith(".png") and name[:-4] not in ids:
                os.remove(os.path.join(OUT, name))
                removed += 1
    print(f"canali {len(channels)}, loghi aggiunti {added}, tolti {removed}, errori {failed}")


asyncio.run(main())
