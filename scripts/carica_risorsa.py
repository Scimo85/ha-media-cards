# Carica una card come risorsa Lovelace inline (data: URI base64), creandola o aggiornando quella esistente.
# Gira DENTRO il container home-assistant, con le variabili HA_TOKEN (token di lunga durata), CARD (nome della card) e CODE_B64 (file .js in base64):
#   HA_TOKEN=... CARD=radio-card CODE_B64="$(base64 -w0 cards/radio-card.js)" docker exec -i -e HA_TOKEN -e CARD -e CODE_B64 home-assistant python3 - < scripts/carica_risorsa.py
# La risorsa esistente si riconosce decodificando gli URL data: e cercando customElements.define("<nome>").
import asyncio
import base64
import os
import sys

import aiohttp

HA_WS = "http://127.0.0.1:8123/api/websocket"


async def main():
    name = os.environ["CARD"]
    code = base64.b64decode(os.environ["CODE_B64"])
    url = "data:text/javascript;base64," + base64.b64encode(code).decode()
    marker = f'customElements.define("{name}"'.encode()
    async with aiohttp.ClientSession() as s, s.ws_connect(HA_WS, max_msg_size=0) as ws:
        await ws.receive_json()
        await ws.send_json({"type": "auth", "access_token": os.environ["HA_TOKEN"]})
        if (await ws.receive_json()).get("type") != "auth_ok":
            raise SystemExit("autenticazione HA fallita")
        await ws.send_json({"id": 1, "type": "lovelace/resources"})
        res = (await ws.receive_json())["result"]
        found = None
        for r in res:
            u = r.get("url", "")
            if u.startswith("data:") and ";base64," in u:
                try:
                    if marker in base64.b64decode(u.split(",", 1)[1]):
                        found = r
                        break
                except Exception:
                    pass
        if found:
            await ws.send_json({"id": 2, "type": "lovelace/resources/update", "resource_id": found["id"], "res_type": "module", "url": url})
        else:
            await ws.send_json({"id": 2, "type": "lovelace/resources/create", "res_type": "module", "url": url})
        r = await ws.receive_json()
        if not r.get("success"):
            raise SystemExit(f"errore: {r.get('error')}")
        print(("aggiornata" if found else "creata"), "risorsa", r["result"]["id"], f"({len(code)} byte)")


asyncio.run(main())
