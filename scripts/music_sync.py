#!/usr/bin/env python3
"""Musica di Jellyfin per music-card. Gira sull'host (cron o watch), python3 senza librerie esterne.

- Legge dalla libreria "Musica" di Jellyfin album e brani (chiave API di Jellyfin nel file JELLYFIN_KEY_FILE)
  e scrive <config HA>/www/musica/musica.json (servito da HA come /local/musica/musica.json).
- Copertine degli album in www/musica/cover/<id album>-<tag>.jpg (/local/..., funzionano anche via Nabu Casa).
- Specchio dei file audio in <config HA>/media/musica con hard link (stesso disco, niente spazio in più):
  è la cartella media "musica" di HA (media_dirs), da cui la card fa suonare i brani nel browser con URL firmati di HA.
Scrive solo se cambia qualcosa. --prova = mostra cosa farebbe senza scrivere niente.
--attendi = da lanciare quando cambia qualcosa nella cartella della musica: chiede a Jellyfin di indicizzare la libreria
e ripete l'aggiornamento ogni 15 s finché Jellyfin non ha tutti i brani della cartella (al massimo 10 minuti).
Album senza copertina (es. mp3 senza tag): artista, anno e titolo dal nome della cartella ("Artista - 1973 - Titolo"),
ricerca su MusicBrainz e "Identifica" di Jellyfin solo se il titolo trovato corrisponde; Jellyfin poi scarica la copertina
(TheAudioDB). Se TheAudioDB non ha l'immagine: copertina da Cover Art Archive (disco MusicBrainz con lo stesso titolo e artista,
cercato dal nome della cartella), caricata in Jellyfin. Tentativi in MUSIC_STATE_FILE (un album non trovato si
riprova dopo 7 giorni).
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

JELLYFIN = os.environ.get("JELLYFIN_URL", "http://192.168.1.10:8096")
LIBRERIA = os.environ.get("JELLYFIN_MUSIC_LIBRARY", "Musica")
KEY_FILE = os.environ.get("JELLYFIN_KEY_FILE", os.path.expanduser("~/musica-ha/jellyfin.key"))
SORGENTE = os.environ.get("MUSIC_DIR", "/srv/media/musica")      # cartella della musica vista dall'host
PREFISSO_JF = os.environ.get("MUSIC_DIR_JELLYFIN", "/data/musica/")  # la stessa cartella vista da Jellyfin
SPECCHIO = os.environ.get("HA_MEDIA_DIR", "/srv/homeassistant/media/musica")  # = /config/media/musica in HA
WWW = os.environ.get("HA_WWW_DIR", "/srv/homeassistant/www/musica")
AUDIO = {".mp3", ".flac", ".m4a", ".aac", ".ogg", ".oga", ".opus", ".wav", ".wma", ".alac", ".ape", ".wv", ".mka"}
PROVA = "--prova" in sys.argv
ATTENDI = "--attendi" in sys.argv
TENTATIVI = os.environ.get("MUSIC_STATE_FILE", os.path.expanduser("~/musica-ha/identificati.json"))


def log(msg):
    from datetime import datetime
    print(f"{datetime.now():%Y-%m-%d %H:%M:%S} {msg}", flush=True)


def api(path, method="GET", data=None, **params):
    url = JELLYFIN + path + ("?" + urllib.parse.urlencode(params) if params else "")
    headers = {"Authorization": f'MediaBrowser Token="{KEY}"'}
    if data is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(data).encode()
    req = urllib.request.Request(url, method=method, headers=headers, data=data)
    with urllib.request.urlopen(req, timeout=60) as r:
        body = r.read()
    return json.loads(body) if body else None


def libreria():
    lib = next((f["ItemId"] for f in api("/Library/VirtualFolders") if f["Name"] == LIBRERIA), None)
    if not lib:
        raise RuntimeError(f'libreria "{LIBRERIA}" non trovata in Jellyfin')
    return lib


def scarica(path, dest, **params):
    url = JELLYFIN + path + ("?" + urllib.parse.urlencode(params) if params else "")
    req = urllib.request.Request(url, headers={"Authorization": f'MediaBrowser Token="{KEY}"'})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    tmp = dest + ".tmp"
    with open(tmp, "wb") as f:
        f.write(data)
    os.replace(tmp, dest)


def da_cartella(path):
    """("Bob Marley", 1973, "Burnin'") da ".../Bob Marley - 1973 - Burnin'" o ".../Artista - Titolo (1973) [Mp3 320]"."""
    nome = re.sub(r"\s*[\[(][^\])]*(mp3|flac|kbps|320|256|192|web|cd|deluxe edition|remaster)[^\])]*[\])]", "", os.path.basename(path), flags=re.I).strip()
    m = re.match(r"^(.+?)\s+-\s+(\d{4})\s+-\s+(.+)$", nome)
    if m:
        return m.group(1).strip(), int(m.group(2)), m.group(3).strip()
    m = re.match(r"^(.+?)\s+-\s+(.+?)\s*\((\d{4})\)", nome)
    if m:
        return m.group(1).strip(), int(m.group(3)), m.group(2).strip()
    return None


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", (s or "").lower().replace("&", "and"))


def identifica():
    """Album senza copertina né identificazione: cerca su MusicBrainz dal nome della cartella e applica il risultato giusto."""
    try:
        with open(TENTATIVI) as f:
            tentati = json.load(f)
    except (FileNotFoundError, ValueError):
        tentati = {}
    utente = next(u for u in api("/Users") if u.get("Policy", {}).get("IsAdministrator"))["Id"]
    albums = api("/Items", userId=utente, ParentId=libreria(), Recursive="true", IncludeItemTypes="MusicAlbum",
                 Fields="Path,ProviderIds", EnableTotalRecordCount="false")["Items"]
    fatti = 0
    for a in albums:
        if (a.get("ImageTags") or {}).get("Primary") or (a.get("ProviderIds") or {}).get("MusicBrainzReleaseGroup"):
            continue
        t = tentati.get(a["Id"])
        if t and time.time() - t.get("quando", 0) < 7 * 86400:
            continue
        info = da_cartella(a.get("Path") or "")
        if not info:
            continue
        artista, anno, titolo = info
        esito = "nessun risultato con lo stesso titolo"
        try:
            ris = api("/Items/RemoteSearch/MusicAlbum", method="POST",
                      data={"ItemId": a["Id"], "SearchInfo": {"Name": titolo, "AlbumArtists": [artista], "Year": anno}}) or []
            uguali = [r for r in ris if norm(r.get("Name")) == norm(titolo)]
            # stesso titolo: prima quello dell'anno giusto, poi il primo (MusicBrainz li ordina per pertinenza)
            scelto = next((r for r in uguali if r.get("ProductionYear") == anno), uguali[0] if uguali else None)
            if scelto:
                log(f"identifico {artista} - {titolo} ({anno})")
                if not PROVA:
                    api(f"/Items/RemoteSearch/Apply/{a['Id']}", method="POST", data=scelto, replaceAllImages="true")
                esito = "ok"
                fatti += 1
            else:
                log(f"non trovato su MusicBrainz: {artista} - {titolo} ({anno})")
        except Exception as e:
            esito = f"errore: {e}"
            log(f"identificazione di {titolo} non riuscita: {e}")
        tentati[a["Id"]] = {"cartella": os.path.basename(a.get("Path") or ""), "esito": esito, "quando": int(time.time())}
    if not PROVA:
        with open(TENTATIVI, "w") as f:
            json.dump(tentati, f, ensure_ascii=False, indent=1)
    return fatti


MB_UA = "ha-media-cards-music/1.0"


def web(url):
    req = urllib.request.Request(url, headers={"User-Agent": MB_UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read(), r.headers.get("Content-Type", "")


def copertine_mancanti():
    """Album ancora senza immagine in Jellyfin: copertina da Cover Art Archive del disco MusicBrainz con lo stesso titolo."""
    import base64
    try:
        with open(TENTATIVI) as f:
            tentati = json.load(f)
    except (FileNotFoundError, ValueError):
        tentati = {}
    utente = next(u for u in api("/Users") if u.get("Policy", {}).get("IsAdministrator"))["Id"]
    albums = api("/Items", userId=utente, ParentId=libreria(), Recursive="true", IncludeItemTypes="MusicAlbum",
                 Fields="Path", EnableTotalRecordCount="false")["Items"]
    for a in albums:
        if (a.get("ImageTags") or {}).get("Primary"):
            continue
        chiave = "caa:" + a["Id"]
        t = tentati.get(chiave)
        if t and time.time() - t.get("quando", 0) < 7 * 86400:
            continue
        info = da_cartella(a.get("Path") or "")
        if not info:
            continue
        artista, anno, titolo = info
        esito = "nessun disco con lo stesso titolo"
        try:
            q = urllib.parse.quote(f'releasegroup:"{titolo}" AND artist:"{artista}"')
            time.sleep(2)  # MusicBrainz: al massimo una richiesta al secondo (con margine)
            gruppi = json.loads(web(f"https://musicbrainz.org/ws/2/release-group/?query={q}&fmt=json&limit=25")[0]).get("release-groups", [])
            uguali = [g for g in gruppi if norm(g.get("title")) == norm(titolo)]
            # prima gli album dell'anno giusto, poi gli altri album, poi il resto
            uguali.sort(key=lambda g: (str(anno) != (g.get("first-release-date") or "")[:4], g.get("primary-type") != "Album", -int(g.get("score") or 0)))
            for g in uguali[:4]:
                try:
                    img, tipo = web(f"https://coverartarchive.org/release-group/{g['id']}/front-500")
                except urllib.error.HTTPError:
                    continue  # quel disco non ha la copertina: si prova il successivo
                log(f"copertina da Cover Art Archive: {artista} - {titolo}")
                if not PROVA:
                    req = urllib.request.Request(f"{JELLYFIN}/Items/{a['Id']}/Images/Primary", method="POST", data=base64.b64encode(img),
                                                 headers={"Authorization": f'MediaBrowser Token="{KEY}"', "Content-Type": tipo.split(";")[0] or "image/jpeg"})
                    urllib.request.urlopen(req, timeout=60).read()
                esito = "ok " + g["id"]
                break
        except Exception as e:
            esito = f"errore: {e}"
            log(f"copertina di {titolo} non trovata: {e}")
        if esito.startswith("nessun"):
            log(f"nessuna copertina per {artista} - {titolo}")
        if esito.startswith("errore"):
            continue  # es. MusicBrainz occupato (503): si riprova al giro dopo
        tentati[chiave] = {"cartella": os.path.basename(a.get("Path") or ""), "esito": esito, "quando": int(time.time())}
    if not PROVA:
        with open(TENTATIVI, "w") as f:
            json.dump(tentati, f, ensure_ascii=False, indent=1)


def catalogo():
    utente = next(u for u in api("/Users") if u.get("Policy", {}).get("IsAdministrator"))["Id"]
    lib = libreria()
    comuni = dict(userId=utente, ParentId=lib, Recursive="true", EnableTotalRecordCount="false")
    album_jf = api("/Items", IncludeItemTypes="MusicAlbum", Fields="DateCreated,Genres,Path", **comuni)["Items"]
    brani = api("/Items", IncludeItemTypes="Audio", Fields="Path,DateCreated", **comuni)["Items"]

    info = {a["Id"]: a for a in album_jf}
    album = {}
    for b in brani:
        path = b.get("Path") or ""
        rel = path[len(PREFISSO_JF):] if path.startswith(PREFISSO_JF) else ""
        aid = b.get("AlbumId") or ("cartella:" + os.path.dirname(rel))
        a = album.get(aid)
        if a is None:
            ja = info.get(aid, {})
            # mp3 senza tag: Jellyfin usa il nome della cartella ("Artista - 1973 - Titolo"); si mostra solo il titolo
            cart = da_cartella(ja.get("Path") or os.path.dirname(rel)) or ("", None, "")
            nome = ja.get("Name") or b.get("Album") or ""
            if cart[2] and (not nome or nome == os.path.basename(ja.get("Path") or os.path.dirname(rel))):
                nome = cart[2]
            artista = ja.get("AlbumArtist") or b.get("AlbumArtist") or ", ".join(b.get("Artists") or []) or cart[0]
            if artista.lower() == "various artists":
                artista = "Artisti vari"
            a = album[aid] = {
                "id": aid,
                "name": nome or os.path.basename(os.path.dirname(rel)) or "Senza album",
                "artist": artista,
                "year": ja.get("ProductionYear") or b.get("ProductionYear") or cart[1] or None,
                "genres": ja.get("Genres") or [],
                "added": (ja.get("DateCreated") or b.get("DateCreated") or "")[:19],
                "path": ja.get("Path") or "",  # cartella dell'album in Jellyfin (/data/downloads/musica/...), per Elimina
                "tag": (ja.get("ImageTags") or {}).get("Primary") or "",
                "tracks": [],
            }
        # senza tag il titolo è il nome del file: "03 - Get Up, Stand Up" → numero 3, "Get Up, Stand Up"
        tnome = b.get("Name") or os.path.splitext(os.path.basename(rel))[0]
        m = re.match(r"^(\d{1,3})\s*[-.]\s+(.+)$", tnome)
        if m:
            tnome = m.group(2)
            if b.get("IndexNumber") is None:
                b["IndexNumber"] = int(m.group(1))
        a["tracks"].append({
            "id": b["Id"],
            "name": tnome,
            "artist": ", ".join(b.get("Artists") or []) or b.get("AlbumArtist") or "",
            "n": b.get("IndexNumber"),
            "disc": b.get("ParentIndexNumber"),
            "dur": round((b.get("RunTimeTicks") or 0) / 10_000_000),
            "file": rel,
        })
    for a in album.values():
        a["tracks"].sort(key=lambda t: (t["disc"] or 0, t["n"] if t["n"] is not None else 9999, t["name"].lower()))
    return sorted(album.values(), key=lambda a: (a["artist"].lower(), a["name"].lower()))


def copertine(albums):
    cartella = os.path.join(WWW, "cover")
    usati = set()
    for a in albums:
        tag = a.pop("tag")
        if not tag or a["id"].startswith("cartella:"):
            a["cover"] = ""
            continue
        nome = f"{a['id']}-{tag[:8]}.jpg"
        usati.add(nome)
        a["cover"] = "/local/musica/cover/" + nome
        dest = os.path.join(cartella, nome)
        if os.path.exists(dest):
            continue
        log(f"copertina {a['name']}")
        if not PROVA:
            try:
                scarica(f"/Items/{a['id']}/Images/Primary", dest, maxWidth=400, quality=85, format="Jpg")
            except Exception as e:
                log(f"  copertina non scaricata: {e}")
                a["cover"] = ""
                usati.discard(nome)
    for nome in os.listdir(cartella):
        if nome not in usati:
            log(f"tolgo copertina {nome}")
            if not PROVA:
                os.remove(os.path.join(cartella, nome))


def specchio():
    """Hard link dei file audio di SORGENTE in SPECCHIO, stessi percorsi relativi; toglie quelli che non ci sono più.
    Restituisce i percorsi relativi dei file audio trovati."""
    voluti = set()
    for radice, _dirs, files in os.walk(SORGENTE):
        for f in files:
            if os.path.splitext(f)[1].lower() not in AUDIO:
                continue
            src = os.path.join(radice, f)
            rel = os.path.relpath(src, SORGENTE)
            voluti.add(rel)
            dst = os.path.join(SPECCHIO, rel)
            try:
                if os.stat(dst).st_ino == os.stat(src).st_ino:
                    continue
            except FileNotFoundError:
                pass
            log(f"collego {rel}")
            if PROVA:
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            tmp = dst + ".link-tmp"
            if os.path.lexists(tmp):
                os.remove(tmp)
            os.link(src, tmp)
            os.replace(tmp, dst)
    for radice, dirs, files in os.walk(SPECCHIO, topdown=False):
        for f in files:
            p = os.path.join(radice, f)
            if os.path.relpath(p, SPECCHIO) not in voluti:
                log(f"tolgo collegamento {os.path.relpath(p, SPECCHIO)}")
                if not PROVA:
                    os.remove(p)
        if radice != SPECCHIO and not PROVA and not os.listdir(radice):
            os.rmdir(radice)
    return voluti


def aggiorna():
    """Un giro completo; True se Jellyfin ha già indicizzato tutti i file audio della cartella."""
    file_audio = specchio()
    albums = catalogo()
    in_jellyfin = {t["file"] for a in albums for t in a["tracks"]}
    scrivi(albums)
    return file_audio <= in_jellyfin


def main():
    global KEY
    with open(KEY_FILE) as f:
        KEY = f.read().strip()
    if not ATTENDI:
        if identifica():
            time.sleep(60)  # tempo per scaricare le copertine
        copertine_mancanti()
        aggiorna()
        return
    log("cambiato qualcosa in downloads/musica: chiedo a Jellyfin di indicizzare")
    if not PROVA:
        api(f"/Items/{libreria()}/Refresh", method="POST", Recursive="true",
            MetadataRefreshMode="Default", ImageRefreshMode="Default")
    fine = time.time() + 600
    while True:
        time.sleep(15)
        if aggiorna():
            log("Jellyfin ha tutti i brani")
            # Jellyfin completa album e copertine poco dopo i brani: identificazione degli album senza copertina e un ultimo giro
            time.sleep(60)
            identifica()
            time.sleep(90)
            copertine_mancanti()
            aggiorna()
            return
        if time.time() > fine:
            log("dopo 10 minuti Jellyfin non ha ancora tutti i brani: riprova il giro notturno")
            return


def scrivi(albums):
    copertine(albums)
    dati = {"albums": albums}
    dest = os.path.join(WWW, "musica.json")
    try:
        with open(dest) as f:
            vecchio = json.load(f)
        vecchio.pop("updated", None)
    except (FileNotFoundError, ValueError):
        vecchio = None
    if vecchio == dati:
        return
    n = sum(len(a["tracks"]) for a in albums)
    log(f"musica.json: {len(albums)} album, {n} brani")
    if PROVA:
        return
    from datetime import datetime, timezone
    dati["updated"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    tmp = dest + ".tmp"
    with open(tmp, "w") as f:
        json.dump(dati, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, dest)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"ERRORE: {e}")
        sys.exit(1)
