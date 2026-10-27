# ha-media-cards

🇬🇧 **English** · 🇮🇹 [Italiano](README.it.md)

**Home Assistant** cards that turn a dashboard into a home media center:
movies and TV shows, live TV, radio, music and retro games, from your phone, PC or wall display.

These are "homemade" cards (plain JavaScript, no dependencies), built for my home server and
shared as they are. **The user interface is in Italian.**

<p align="center">
  <img src="docs/screenshots/film.jpg" width="240" alt="Movie catalog and now playing">
  <img src="docs/screenshots/film-scheda.jpg" width="240" alt="TV show details">
  <img src="docs/screenshots/tv.jpg" width="240" alt="Live TV">
</p>
<p align="center">
  <img src="docs/screenshots/giochi.jpg" width="240" alt="Games (RomM)">
  <img src="docs/screenshots/ricerca.jpg" width="240" alt="Torrent search">
  <img src="docs/screenshots/download-attivo.jpg" width="240" alt="Active download">
</p>
<p align="center">
  <img src="docs/screenshots/radio.jpg" width="240" alt="Radio">
  <img src="docs/screenshots/musica.jpg" width="240" alt="Music">
</p>

<sub>Shown inside the Aurora Glass v3 dashboard (with <code>aurora-plus-card</code>); titles, covers and device names are blurred.</sub>

| Card | What it does | Requires |
|---|---|---|
| `media-catalog-card` | Movie/TV show catalog with posters, plot, rating; season/episode picker; **Play** on a device; **Delete** (optional) | Jellyfin + HA Jellyfin integration |
| `jellyfin-now-card` | What's playing and where, progress, pause/stop | Jellyfin |
| `livetv-card` | TV channels with logo and current program, play on a device | Jellyfin Live TV |
| `radio-card` | ~1,500 Italian radio stations, search, per-user favorites; plays in the browser, on Alexa or other players | `scripts/radio_sync.py` |
| `music-card` | Albums and artists with covers; listen in the browser (even with the screen locked) or on a device | Jellyfin + `scripts/music_sync.py` |
| `romm-games-card` | Consoles grouped by brand, games with covers; "Play" in the browser | [RomM](https://github.com/rommapp/romm) + `scripts/romm_sync.py` |
| `qbit-search-card` | Search with qBittorrent's search plugins, category and "Italian only" filters, destination folder (Movies, TV shows › show, Music, Games) and download | qBittorrent with WebUI and search plugins |
| `aurora-plus-card` | Adds a **Media** page to the bottom bar of the [Aurora Glass v3](https://github.com/lucalux00/aurora-glass-v3) card, containing the cards above | Aurora Glass v3 (not included) |

## Installation

1. Copy the files in `cards/` to `/config/www/ha-media-cards/` in Home Assistant.
2. Settings › Dashboards › ⋮ › **Resources** › Add: `/local/ha-media-cards/<name>-card.js`, type *JavaScript module*.
   (Alternatively, `scripts/carica_risorsa.py` uploads the card as an "inline" resource, with no file in `www`.)
3. Add the REST commands from [`examples/rest_commands.yaml`](examples/rest_commands.yaml) to `configuration.yaml`
   and your Jellyfin API key to `secrets.yaml`.
4. Add the cards to your dashboard: see [`examples/dashboard.yaml`](examples/dashboard.yaml).
5. Reload the page (Ctrl+Shift+R; on a phone, close and reopen the app).

### Why covers are served from `/local`

When you open HA from outside your home (Nabu Casa, HTTPS), the browser won't load images from `http://<local-ip>`.
The scripts in `scripts/` copy covers and logos to `/config/www/...`, so HA serves them itself and they show up everywhere:

| Script | Runs | For card |
|---|---|---|
| `jellyfin_posters.py` | inside the HA container (`docker exec`) | media-catalog-card |
| `jellyfin_livetv_logos.py` | inside the HA container | livetv-card |
| `radio_sync.py` | inside the HA container | radio-card |
| `romm_sync.py` | inside the HA container | romm-games-card |
| `music_sync.py` | on the host (python3, standard library only) | music-card |

Instructions are at the top of each file; settings (addresses, folders) are passed as environment variables.
Run them with `cron` (e.g. once a day for radio, every few minutes for games and music).

### Playing a movie on the TV

The cards send the title to any Jellyfin player that is on. For a TV that first has to turn on and open the app,
set a **script** in the card (`devices: [{ name, script }]`) that receives `media_id` and `media_type`:
an example for LG webOS TVs is in [`examples/script_tv.yaml`](examples/script_tv.yaml).

Note for LG TVs: the webOS Jellyfin app opens **two** sessions and commands only reach one of them,
not always the same one. That's why the script and `jellyfin-now-card` send commands to every session of the device.

### Delete button

`media-catalog-card` and `music-card` can delete a title **from disk** (through Jellyfin) and remove the torrent
from qBittorrent. Library folders are set at the top of `media-catalog-card.js`
(`MCC_JF_ROOT`, `MCC_QB_ROOT`, `MCC_LIB_DIRS`; for music, `MC_JF_ROOT`, `MC_QB_ROOT` in `music-card.js`): adapt them to your paths before using it.
If you don't need it, don't add the `jellyfin_elimina` / `qbittorrent_*` REST commands.

## Content use

These tools are meant for content you have the rights to: personal copies of your own movies and discs,
purchased music, free and official TV channels, ROMs of games you own, or free (homebrew) games.

## License

[MIT](LICENSE) © 2026 scimokitazawa. Aurora Glass v3 is by another author (GPL-3.0) and is not included.
The cards were written with the help of an AI (Claude).
