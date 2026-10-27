/* music-card v1.1.0 — musica della libreria Jellyfin "Musica" (elenco in /local/musica/musica.json da ~/musica-ha/sync.py): album, artisti, ricerca, ascolto nel browser o sui dispositivi con Jellyfin, elimina album */
const MC_STYLE = `
:host { display: block; }
ha-card {
  background: var(--qa-card-bg, linear-gradient(158deg, #0D1720 0%, #070D13 100%));
  border: var(--qa-card-border, 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent));
  border-radius: var(--qa-radius, 14px);
  box-shadow: var(--qa-card-shadow, inset 0 0 24px color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent), 0 4px 20px color-mix(in srgb, var(--qa-shade, #000) 70%, transparent));
  padding: 18px 20px 20px;
  color: var(--qa-text, #C8F4FA);
  backdrop-filter: var(--qa-blur, none);
  -webkit-backdrop-filter: var(--qa-blur, none);
  font-family: var(--qa-font, inherit);
}
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.title { display: flex; align-items: center; gap: 10px; }
.title ha-icon { color: var(--qa-glow, #4DE8F4); --mdc-icon-size: 24px; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--qa-glow, #4DE8F4) 80%, transparent)); }
.title span { font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.meta { text-align: right; }
.meta .n { color: var(--qa-acc, #7FF0FA); font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.meta .u { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; }
.np { display: none; align-items: center; gap: 12px; margin-top: 14px; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); flex-wrap: wrap; }
.np.open { display: flex; }
.np .art { flex: none; width: 48px; height: 48px; border-radius: 6px; overflow: hidden; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 6%, transparent); display: flex; align-items: center; justify-content: center; }
.np .art img { width: 100%; height: 100%; object-fit: cover; display: block; }
.np .art ha-icon { --mdc-icon-size: 26px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.np .tx { flex: 1; min-width: 140px; }
.np .d { font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.np .s { font-size: 14px; font-weight: 600; color: var(--qa-text, #C8F4FA); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.np .a { font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.np .s.err { color: #FF9E1B; font-weight: 400; white-space: normal; }
.np .ctl { display: flex; align-items: center; gap: 6px; }
.np button { background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA); cursor: pointer; padding: 6px; display: flex; }
.np button:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); }
.np button ha-icon { --mdc-icon-size: 20px; }
.np button.pp ha-icon { --mdc-icon-size: 24px; }
.np .prog { flex-basis: 100%; display: flex; align-items: center; gap: 8px; font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
.np .prog input { flex: 1; accent-color: var(--qa-glow, #4DE8F4); }
.devs { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 14px; }
.devs .l { font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); margin-right: 2px; }
button.dev { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 999px;
  color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); font-family: inherit; font-size: 13px; padding: 6px 12px; cursor: pointer; transition: all 150ms ease; }
button.dev ha-icon { --mdc-icon-size: 16px; }
button.dev.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); color: var(--qa-text, #C8F4FA); }
.msg { margin-top: 10px; font-size: 13px; color: var(--qa-acc, #7FF0FA); }
.msg:empty { display: none; }
.msg.err { color: #FF9E1B; }
.bar { display: flex; gap: 8px; margin: 16px 0 14px; flex-wrap: wrap; }
.tab { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-text, #C8F4FA) 75%, transparent);
  font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; cursor: pointer; transition: all 200ms ease;
  display: flex; align-items: center; gap: 6px; font-family: inherit; }
.tab ha-icon { --mdc-icon-size: 16px; }
.tab.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); color: var(--qa-acc, #7FF0FA); box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 25%, transparent), inset 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.tab .c { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
.tab.on .c { color: var(--qa-glow, #4DE8F4); }
input.q { flex: 1; min-width: 160px; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px;
  color: var(--qa-text, #C8F4FA); font-size: 14px; padding: 8px 14px; outline: none; }
input.q:focus { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 70%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 20%, transparent); }
input.q::placeholder { color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 14px; }
.al { cursor: pointer; min-width: 0; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--qa-shade, #000) 25%, transparent);
  padding: 8px; display: flex; flex-direction: column; gap: 6px; transition: all 220ms ease; }
.al:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
.al.live { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); }
.cv { aspect-ratio: 1; border-radius: 6px; overflow: hidden; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 5%, transparent); display: flex; align-items: center; justify-content: center; }
.cv img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cv ha-icon { --mdc-icon-size: 42px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 35%, transparent); }
.an { font-size: 13px; font-weight: 600; color: var(--qa-text, #C8F4FA); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.3; }
.aa { font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.list { display: flex; flex-direction: column; gap: 2px; }
.ar { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; border: 1px solid transparent; }
.ar:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent); }
.ar ha-icon { color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); --mdc-icon-size: 22px; }
.ar .nm { flex: 1; min-width: 0; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ar .ct { font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
button.back { background: none; border: none; color: var(--qa-acc, #7FF0FA); font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer; padding: 4px 0; margin-bottom: 12px; }
.ah { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 14px; }
.ah .cv { width: 150px; flex: none; }
.ah .inf { flex: 1; min-width: 180px; }
.ah .t1 { font-size: 18px; font-weight: 600; line-height: 1.3; word-break: break-word; }
.ah .t2 { font-size: 14px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 85%, transparent); margin-top: 4px; }
.ah .t3 { font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); margin-top: 6px; }
.acts { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
button.go { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA);
  font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 16px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; }
button.go.ghost { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); }
button.go ha-icon { --mdc-icon-size: 18px; }
.tr { display: flex; align-items: center; gap: 12px; padding: 9px 10px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; }
.tr:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 35%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent); }
.tr.live { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 7%, transparent); }
.tr .no { width: 24px; flex: none; text-align: right; font-size: 13px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
.tr.live .no { color: var(--qa-glow, #4DE8F4); }
.tr .tt { flex: 1; min-width: 0; }
.tr .tn { font-size: 14px; color: var(--qa-text, #C8F4FA); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tr .ta { font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tr .du { flex: none; font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
h4 { margin: 18px 0 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.status { padding: 30px 0; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); font-size: 14px; line-height: 1.5; }
.status code { color: var(--qa-acc, #7FF0FA); }
button.del { background: none; border: 1px solid rgba(255,158,27,0.35); border-radius: 999px; color: rgba(255,158,27,0.85);
  font-family: inherit; font-size: 12px; letter-spacing: 0.04em; padding: 7px 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
button.del ha-icon { --mdc-icon-size: 16px; }
button.del:hover { border-color: rgba(255,158,27,0.85); }
button.del[disabled] { opacity: 0.45; cursor: default; }
.confirm { margin: 0 0 14px; padding: 12px; border: 1px solid rgba(255,158,27,0.5); border-radius: 10px; background: rgba(255,158,27,0.05);
  font-size: 13px; line-height: 1.45; color: var(--qa-text, #C8F4FA); }
.confirm[hidden] { display: none; }
.confirm b { color: #FF9E1B; }
.confirm ul { margin: 6px 0 0; padding-left: 18px; }
.confirm li { word-break: break-word; }
.confirm .k { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.confirm .acts { justify-content: flex-end; }
button.no { background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent);
  font-family: inherit; font-size: 13px; padding: 8px 16px; cursor: pointer; }
button.yes { background: rgba(255,158,27,0.12); border: 1px solid rgba(255,158,27,0.8); border-radius: 999px; color: #FF9E1B;
  font-family: inherit; font-size: 13px; font-weight: 600; padding: 8px 16px; cursor: pointer; }
button.yes[disabled], button.no[disabled] { opacity: 0.45; cursor: default; }
`;

const MC_LAST_DEV = "music-card.last-device";   // comodità locale del browser
const MC_BROWSER = "browser";
// stessa cartella vista da Jellyfin e da qBittorrent (per Elimina)
const MC_JF_ROOT = "/data/downloads/musica";
const MC_QB_ROOT = "/downloads/musica";

// Lettore del browser condiviso a livello di pagina: continua a suonare cambiando vista della dashboard
const MC_PLAYER = window.__musicCardPlayer || (window.__musicCardPlayer = {
  audio: new Audio(), queue: [], index: -1, error: "", hass: null, mediaDir: "musica", listeners: new Set(),
  notify() { for (const f of this.listeners) f(); },
  current() { return this.queue[this.index] || null; },
  async start(queue, index) {
    this.queue = queue;
    await this.go(index);
  },
  async go(index) {
    if (index < 0 || index >= this.queue.length) return;
    this.index = index;
    this.error = "";
    const { track, album } = this.queue[index];
    this.notify();
    // la radio (radio-card) usa un altro lettore: si ferma per non sovrapporre
    if (window.__radioCardPlayer && !window.__radioCardPlayer.audio.paused) window.__radioCardPlayer.audio.pause();
    try {
      const r = await this.hass.callWS({
        type: "media_source/resolve_media",
        media_content_id: `media-source://media_source/${this.mediaDir}/${track.file}`,
        expires: 6 * 3600,
      });
      if (this.index !== index || this.queue[index].track !== track) return;
      this.audio.src = this.hass.hassUrl ? this.hass.hassUrl(r.url) : r.url;
      await this.audio.play();
    } catch (e) {
      if (this.index !== index) return;
      const msg = (e && (e.message || e.code)) || String(e);
      this.error = /unknown source|not found|unknown_source|resolve/i.test(msg)
        ? "Ascolto nel browser non ancora attivo: in Home Assistant manca la cartella media \"musica\"."
        : /NotAllowed/i.test(msg) ? "Il browser ha bloccato l'audio: tocca ▶ per farlo partire." : "Brano non riproducibile: " + msg;
      this.notify();
    }
    this.session();
  },
  stop() {
    this.audio.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.queue = []; this.index = -1; this.error = "";
    if ("mediaSession" in navigator) navigator.mediaSession.metadata = null;
    this.notify();
  },
  // comandi dalla schermata di blocco / cuffie
  session() {
    const c = this.current();
    if (!c || !("mediaSession" in navigator) || !window.MediaMetadata) return;
    const art = c.album.cover ? [{ src: new URL(c.album.cover, location.href).href, sizes: "400x400", type: "image/jpeg" }] : [];
    navigator.mediaSession.metadata = new MediaMetadata({ title: c.track.name, artist: c.track.artist || c.album.artist, album: c.album.name, artwork: art });
  },
});
if (!MC_PLAYER.bound) {
  MC_PLAYER.bound = true;
  const a = MC_PLAYER.audio;
  a.preload = "auto";
  for (const ev of ["playing", "pause", "waiting", "loadedmetadata"]) a.addEventListener(ev, () => MC_PLAYER.notify());
  a.addEventListener("ended", () => {
    if (MC_PLAYER.index + 1 < MC_PLAYER.queue.length) MC_PLAYER.go(MC_PLAYER.index + 1);
    else MC_PLAYER.notify();
  });
  a.addEventListener("error", () => {
    if (MC_PLAYER.current() && a.getAttribute("src")) { MC_PLAYER.error = "Il file non si apre o il browser non supporta il formato."; MC_PLAYER.notify(); }
  });
  if ("mediaSession" in navigator) {
    const ms = navigator.mediaSession;
    try {
      ms.setActionHandler("play", () => a.play().catch(() => {}));
      ms.setActionHandler("pause", () => a.pause());
      ms.setActionHandler("previoustrack", () => MC_PLAYER.go(MC_PLAYER.index - 1));
      ms.setActionHandler("nexttrack", () => MC_PLAYER.go(MC_PLAYER.index + 1));
    } catch (e) { /* azioni non supportate */ }
  }
}

const mcNorm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const mcTime = (sec) => {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
};

class MusicCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign(
      { title: "Musica", data_url: "/local/musica/musica.json", media_dir: "musica", browser: true, refresh_minutes: 5, devices: [] },
      config || {}
    );
    if (!this._view) this._view = { tab: "albums" };
    if (this._query === undefined) this._query = "";
    if (this._root) this._render();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    MC_PLAYER.hass = hass;
    MC_PLAYER.mediaDir = this._config.media_dir;
    if (first) this._build();
  }

  connectedCallback() {
    if (!this._onPlayer) {
      this._onPlayer = () => { this._renderPlayer(); this._markLive(); };
    }
    MC_PLAYER.listeners.add(this._onPlayer);
    if (this._root) { this._load(); this._renderPlayer(); }
    const min = Number(this._config && this._config.refresh_minutes) || 0;
    if (min > 0 && !this._refresh) this._refresh = setInterval(() => this._load(), min * 60000);
  }

  disconnectedCallback() {
    MC_PLAYER.listeners.delete(this._onPlayer);
    if (this._refresh) { clearInterval(this._refresh); this._refresh = null; }
    if (this._tick) { clearInterval(this._tick); this._tick = null; }
  }

  _devices() {
    const list = [];
    if (this._config.browser) list.push({ id: MC_BROWSER, name: "Questo dispositivo", icon: "mdi:cellphone-sound" });
    for (const d of this._config.devices || []) {
      if (d && d.script) list.push({ id: d.script, name: d.name || d.script, icon: d.icon || "mdi:play-network", script: d.script, queue: d.queue !== false });
    }
    return list;
  }

  _build() {
    if (this._root) return;
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${MC_STYLE}</style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:music-box-multiple"></ha-icon><span class="t"></span></div>
          <div class="meta"><div class="n"></div><div class="u"></div></div>
        </div>
        <div class="np"></div>
        <div class="devs"></div>
        <div class="msg"></div>
        <div class="bar">
          <button class="tab" data-tab="albums" type="button"><ha-icon icon="mdi:album"></ha-icon>Album <span class="c"></span></button>
          <button class="tab" data-tab="artists" type="button"><ha-icon icon="mdi:account-music"></ha-icon>Artisti <span class="c"></span></button>
          <input class="q" type="search" placeholder="Cerca album, artista o brano…" />
        </div>
        <div class="body"></div>
      </ha-card>`;
    this._root = sr;
    sr.querySelector(".t").textContent = this._config.title;
    for (const b of sr.querySelectorAll(".tab")) {
      b.addEventListener("click", () => { this._view = { tab: b.dataset.tab }; this._render(); });
    }
    const q = sr.querySelector("input.q");
    q.value = this._query;
    q.addEventListener("input", () => {
      this._query = q.value;
      clearTimeout(this._qTimer);
      this._qTimer = setTimeout(() => this._render(), 150);
    });
    let last = "";
    try { last = localStorage.getItem(MC_LAST_DEV) || ""; } catch (e) { /* storage non disponibile */ }
    const devs = this._devices();
    this._dev = (devs.find((d) => d.id === last) || devs[0] || {}).id;
    this._renderDevs();
    this._renderPlayer();
    this._render();
    this._load();
  }

  async _load() {
    try {
      const r = await fetch(this._config.data_url + "?t=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const d = await r.json();
      if (this._data && this._data.updated === d.updated) return;
      this._data = d;
      this._error = "";
    } catch (e) {
      if (!this._data) this._error = "Elenco della musica non disponibile (" + ((e && e.message) || e) + ").";
    }
    this._render();
  }

  _artists() {
    const m = new Map();
    for (const a of (this._data && this._data.albums) || []) {
      const k = a.artist || "Sconosciuto";
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(a);
    }
    return [...m].map(([name, albums]) => ({ name, albums })).sort((x, y) => x.name.localeCompare(y.name, "it", { sensitivity: "base" }));
  }

  _album(id) {
    return ((this._data && this._data.albums) || []).find((a) => a.id === id);
  }

  _renderDevs() {
    const box = this._root.querySelector(".devs");
    box.innerHTML = "";
    const devs = this._devices();
    if (devs.length < 2) return;
    const l = document.createElement("span");
    l.className = "l";
    l.textContent = "Suona su";
    box.appendChild(l);
    for (const d of devs) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dev" + (d.id === this._dev ? " on" : "");
      b.innerHTML = `<ha-icon icon="${d.icon}"></ha-icon><span></span>`;
      b.querySelector("span").textContent = d.name;
      b.addEventListener("click", () => {
        this._dev = d.id;
        try { localStorage.setItem(MC_LAST_DEV, d.id); } catch (e) { /* storage non disponibile */ }
        this._renderDevs();
      });
      box.appendChild(b);
    }
  }

  _showMsg(txt, err) {
    const m = this._root.querySelector(".msg");
    m.className = "msg" + (err ? " err" : "");
    m.textContent = txt;
    clearTimeout(this._msgTimer);
    if (txt) this._msgTimer = setTimeout(() => { m.textContent = ""; }, err ? 12000 : 8000);
  }

  // Avvia l'album dal brano `start` (o in ordine casuale) sul dispositivo scelto
  async _play(album, start, shuffle) {
    let tracks = album.tracks.slice(start || 0);
    if (shuffle) {
      tracks = album.tracks.slice();
      for (let i = tracks.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [tracks[i], tracks[j]] = [tracks[j], tracks[i]]; }
    }
    if (!tracks.length) return;
    const dev = this._devices().find((d) => d.id === this._dev);
    if (!dev) return;
    if (dev.id === MC_BROWSER) {
      this._showMsg("");
      await MC_PLAYER.start(tracks.map((track) => ({ track, album })), 0);
      return;
    }
    // Dispositivi con l'app Jellyfin: lo script apre l'app (e se serve accende) e manda i brani con PlayNow.
    // queue: false = lo script accetta un solo id (es. Echo Show): l'album intero o il singolo brano
    const real = !String(album.id).startsWith("cartella:");
    const mediaId = dev.queue ? tracks.map((t) => t.id).join(",")
      : (!start && !shuffle && real ? album.id : tracks[0].id);
    try {
      await this._hass.callService("script", "turn_on", { entity_id: dev.script, variables: { media_id: mediaId, media_type: "music" } });
      const what = start ? tracks[0].name : album.name;
      this._showMsg(`▶ ${what}: avvio su ${dev.name}. Apro Jellyfin (e se serve accendo il dispositivo), può volerci fino a mezzo minuto.`);
    } catch (e) {
      this._showMsg("Non riesco ad avviare: " + ((e && e.message) || e), true);
    }
  }

  async _rest(service, data) {
    const res = await this._hass.callService("rest_command", service, data || {}, undefined, false, true);
    const r = (res && res.response) || {};
    if (r.status && (r.status < 200 || r.status >= 300)) throw new Error(`${service} ha risposto ${r.status}`);
    let content = r.content;
    if (typeof content === "string") {
      try { content = JSON.parse(content); } catch (e) { /* testo semplice */ }
    }
    return content;
  }

  _size(bytes) {
    const gb = (bytes || 0) / 1073741824;
    return gb >= 1 ? gb.toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " GB" : Math.round((bytes || 0) / 1048576) + " MB";
  }

  // Cosa va cancellato: cartella dell'album (Jellyfin la cancella col DELETE dell'album) e torrent che la contengono.
  // Torrent tutto dentro l'album → tolto con i file. Torrent che contiene l'album ma anche altri album (es. discografia)
  // → tolto senza file, così gli altri album restano. Come media-catalog-card per film e serie.
  async _deletePlan(album) {
    const path = String(album.path || "").replace(/\/+$/, "");
    if (!path.startsWith(MC_JF_ROOT + "/")) throw new Error("cartella fuori dalla libreria Musica: " + (path || "sconosciuta"));
    const rel = path.slice(MC_JF_ROOT.length + 1);
    const inside = (p, dir) => p === dir || p.startsWith(dir + "/");
    // la cartella deve contenere solo questo album: altrimenti si cancellerebbero anche gli altri
    const others = ((this._data && this._data.albums) || []).filter((x) => x.id !== album.id);
    const mixed = others.filter((x) => x.tracks.some((t) => inside(t.file, rel)));
    if (mixed.length) throw new Error(`la cartella contiene anche altri album (${mixed.map((x) => x.name).slice(0, 3).join(", ")})`);
    if (album.tracks.some((t) => !inside(t.file, rel))) throw new Error("alcuni brani dell'album stanno in un'altra cartella");
    const qPath = MC_QB_ROOT + "/" + rel;
    const otherQ = others.flatMap((x) => x.tracks.map((t) => MC_QB_ROOT + "/" + t.file));
    const torrents = await this._rest("qbittorrent_torrent");
    const full = [], partial = [];
    for (const t of Array.isArray(torrents) ? torrents : []) {
      const cp = (t.content_path || "").replace(/\/+$/, "");
      if (!cp) continue;
      if (inside(cp, qPath)) full.push(t);
      else if (qPath.startsWith(cp + "/")) {
        if (cp === MC_QB_ROOT || otherQ.some((o) => inside(o, cp))) partial.push(t);
        else full.push(t);
      }
    }
    return { album, id: album.id, rel, full, partial };
  }

  async _askDelete(album, del) {
    const box = this._root.querySelector(".confirm");
    if (!box) return;
    del.disabled = true;
    this._showMsg("Controllo cosa c'è da cancellare…");
    let plan;
    try {
      plan = await this._deletePlan(album);
    } catch (e) {
      this._showMsg("Non posso eliminarlo: " + ((e && (e.message || e.code)) || e), true);
      del.disabled = false;
      return;
    }
    if (this._view.album !== album.id) return;
    this._showMsg("");
    box.innerHTML = `<div>Eliminare l'album <b></b> per sempre? Non si può annullare.</div>
      <ul>
        <li><span class="k">Disco:</span> <span class="pth"></span></li>
        <li><span class="k">Catalogo:</span> tolto da Jellyfin e da qui</li>
        <li class="tf"></li>
        ${plan.partial.length ? '<li class="tp"></li>' : ""}
      </ul>
      <div class="acts"><button class="no" type="button">Annulla</button><button class="yes" type="button">Elimina definitivamente</button></div>`;
    box.querySelector("b").textContent = album.name;
    box.querySelector(".pth").textContent = `${plan.rel}/ (tutta la cartella, ${album.tracks.length} brani)`;
    box.querySelector(".tf").textContent = plan.full.length
      ? `qBittorrent: ${plan.full.length === 1 ? "torrent tolto" : plan.full.length + " torrent tolti"} con i file (${plan.full.map((t) => `${t.name}, ${this._size(t.size)}`).join(" · ")})`
      : "qBittorrent: nessun torrent collegato";
    if (plan.partial.length) {
      box.querySelector(".tp").textContent = `Pacchetto con altri album, tolto da qBittorrent senza cancellare gli altri file (non si condivide più): ${plan.partial.map((t) => t.name).join(" · ")}`;
    }
    box.querySelector("button.no").addEventListener("click", () => { box.hidden = true; box.innerHTML = ""; del.disabled = false; });
    box.querySelector("button.yes").addEventListener("click", () => this._doDelete(plan, box, del));
    box.hidden = false;
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async _doDelete(plan, box, del) {
    box.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    this._showMsg("Elimino…");
    const done = [];
    try {
      // prima Jellyfin (catalogo + cartella): se fallisce non si tocca niente in qBittorrent
      await this._rest("jellyfin_elimina", { media_id: plan.id });
      done.push("file e catalogo");
      if (plan.full.length) {
        await this._rest("qbittorrent_elimina", { hashes: plan.full.map((t) => t.hash).join("|"), file: true });
        done.push(plan.full.length === 1 ? "torrent" : plan.full.length + " torrent");
      }
      if (plan.partial.length) {
        await this._rest("qbittorrent_elimina", { hashes: plan.partial.map((t) => t.hash).join("|"), file: false });
        done.push("pacchetto da qBittorrent");
      }
    } catch (e) {
      const msg = (e && (e.message || e.code)) || e;
      this._showMsg((done.length ? `Eliminato solo in parte (${done.join(", ")}): ` : "Non eliminato: ") + msg, true);
      box.hidden = true;
      if (!done.length) del.disabled = false;
      return;
    }
    const c = MC_PLAYER.current();
    if (c && c.album.id === plan.id) MC_PLAYER.stop();
    // l'elenco sul server lo aggiorna musica-ha.service appena vede sparire i file
    if (this._data) this._data.albums = this._data.albums.filter((x) => x.id !== plan.id);
    this._view = this._view.from || { tab: "albums" };
    this._render();
    this._showMsg(`✓ ${plan.album.name} eliminato (${done.join(", ")}).`);
  }

  _renderPlayer() {
    if (!this._root) return;
    const box = this._root.querySelector(".np");
    const c = MC_PLAYER.current();
    if (!c) {
      box.classList.remove("open");
      box.innerHTML = "";
      if (this._tick) { clearInterval(this._tick); this._tick = null; }
      return;
    }
    const a = MC_PLAYER.audio;
    if (!box.classList.contains("open") || box.dataset.key !== c.track.id) {
      box.dataset.key = c.track.id;
      box.innerHTML = `
        <div class="art"></div>
        <div class="tx"><div class="d"></div><div class="s"></div><div class="a"></div></div>
        <div class="ctl">
          <button class="pv" type="button" title="Precedente"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
          <button class="pp" type="button" title="Play/pausa"><ha-icon></ha-icon></button>
          <button class="nx" type="button" title="Successivo"><ha-icon icon="mdi:skip-next"></ha-icon></button>
          <button class="x" type="button" title="Ferma"><ha-icon icon="mdi:stop"></ha-icon></button>
        </div>
        <div class="prog"><span class="cur">0:00</span><input type="range" min="0" max="100" step="1" value="0" /><span class="tot"></span></div>`;
      box.classList.add("open");
      const art = box.querySelector(".art");
      if (c.album.cover) { const img = document.createElement("img"); img.src = c.album.cover; img.alt = ""; art.appendChild(img); }
      else art.innerHTML = '<ha-icon icon="mdi:music"></ha-icon>';
      box.querySelector(".pv").addEventListener("click", () => {
        if (a.currentTime > 5 || MC_PLAYER.index === 0) a.currentTime = 0; else MC_PLAYER.go(MC_PLAYER.index - 1);
      });
      box.querySelector(".pp").addEventListener("click", () => (a.paused ? a.play().catch(() => {}) : a.pause()));
      box.querySelector(".nx").addEventListener("click", () => MC_PLAYER.go(MC_PLAYER.index + 1));
      box.querySelector(".x").addEventListener("click", () => MC_PLAYER.stop());
      const rng = box.querySelector(".prog input");
      rng.addEventListener("input", () => { this._seeking = true; box.querySelector(".cur").textContent = mcTime(rng.value); });
      rng.addEventListener("change", () => { a.currentTime = Number(rng.value); this._seeking = false; });
    }
    box.querySelector(".d").textContent = `Questo dispositivo · ${MC_PLAYER.index + 1} di ${MC_PLAYER.queue.length}`;
    const s = box.querySelector(".s");
    s.className = "s" + (MC_PLAYER.error ? " err" : "");
    s.textContent = MC_PLAYER.error || c.track.name;
    box.querySelector(".a").textContent = MC_PLAYER.error ? "" : [c.track.artist || c.album.artist, c.album.name].filter(Boolean).join(" · ");
    box.querySelector(".pp ha-icon").setAttribute("icon", a.paused ? "mdi:play-circle" : "mdi:pause-circle");
    const update = () => {
      if (this._seeking) return;
      const dur = isFinite(a.duration) && a.duration > 0 ? a.duration : c.track.dur || 0;
      const rng = box.querySelector(".prog input");
      if (!rng) return;
      rng.max = String(Math.max(1, Math.round(dur)));
      rng.value = String(Math.round(a.currentTime || 0));
      box.querySelector(".cur").textContent = mcTime(a.currentTime);
      box.querySelector(".tot").textContent = mcTime(dur);
    };
    update();
    if (!this._tick) this._tick = setInterval(update, 1000);
  }

  // Evidenzia album e brano in ascolto senza ridisegnare tutto
  _markLive() {
    if (!this._root) return;
    const c = MC_PLAYER.current();
    for (const el of this._root.querySelectorAll("[data-track]")) el.classList.toggle("live", !!c && el.dataset.track === c.track.id);
    for (const el of this._root.querySelectorAll("[data-album]")) el.classList.toggle("live", !!c && el.dataset.album === c.album.id);
  }

  _cover(album) {
    const d = document.createElement("div");
    d.className = "cv";
    if (album.cover) {
      const img = document.createElement("img");
      img.loading = "lazy"; img.alt = ""; img.src = album.cover;
      img.addEventListener("error", () => { d.innerHTML = '<ha-icon icon="mdi:album"></ha-icon>'; });
      d.appendChild(img);
    } else d.innerHTML = '<ha-icon icon="mdi:album"></ha-icon>';
    return d;
  }

  _albumGrid(albums, sub) {
    const g = document.createElement("div");
    g.className = "grid";
    for (const a of albums) {
      const el = document.createElement("div");
      el.className = "al";
      el.dataset.album = a.id;
      el.appendChild(this._cover(a));
      const n = document.createElement("div"); n.className = "an"; n.textContent = a.name; n.title = a.name;
      const s = document.createElement("div"); s.className = "aa"; s.textContent = sub ? sub(a) : [a.artist, a.year].filter(Boolean).join(" · ");
      el.appendChild(n); el.appendChild(s);
      el.addEventListener("click", () => {
        this._view = { tab: this._view.tab, album: a.id, from: this._view };
        this._render();
        this._root.querySelector(".body").scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
      g.appendChild(el);
    }
    return g;
  }

  _trackRow(album, i, showAlbum) {
    const t = album.tracks[i];
    const row = document.createElement("div");
    row.className = "tr";
    row.dataset.track = t.id;
    const no = document.createElement("div"); no.className = "no"; no.textContent = t.n != null ? t.n : i + 1;
    const tt = document.createElement("div"); tt.className = "tt";
    const tn = document.createElement("div"); tn.className = "tn"; tn.textContent = t.name; tn.title = t.name;
    tt.appendChild(tn);
    const sub = [t.artist && t.artist !== album.artist ? t.artist : "", showAlbum ? album.name : ""].filter(Boolean).join(" · ");
    if (sub) { const ta = document.createElement("div"); ta.className = "ta"; ta.textContent = sub; tt.appendChild(ta); }
    const du = document.createElement("div"); du.className = "du"; du.textContent = t.dur ? mcTime(t.dur) : "";
    row.appendChild(no); row.appendChild(tt); row.appendChild(du);
    row.addEventListener("click", () => this._play(album, i));
    return row;
  }

  _render() {
    if (!this._root) return;
    const albums = (this._data && this._data.albums) || [];
    const ntr = albums.reduce((s, a) => s + a.tracks.length, 0);
    this._root.querySelector(".meta .n").textContent = this._data ? `${albums.length}` : "";
    this._root.querySelector(".meta .u").textContent = this._data ? `album · ${ntr} brani` : "";
    const artists = this._artists();
    const [tA, tR] = this._root.querySelectorAll(".tab");
    tA.querySelector(".c").textContent = albums.length || "";
    tR.querySelector(".c").textContent = artists.length || "";
    const q = mcNorm(this._query.trim());
    tA.classList.toggle("on", !q && this._view.tab === "albums");
    tR.classList.toggle("on", !q && this._view.tab === "artists");

    const body = this._root.querySelector(".body");
    body.innerHTML = "";
    const status = (html) => { const d = document.createElement("div"); d.className = "status"; d.innerHTML = html; body.appendChild(d); };
    if (this._error) { status(""); body.lastChild.textContent = this._error; return; }
    if (!this._data) { status("Carico la musica…"); return; }
    if (!albums.length) {
      status("Ancora nessuna canzone. Metti la musica in <code>downloads/musica/</code> (meglio in cartelle Artista/Album, oppure scaricala con \"Cerca e scarica\" → Musica): compare qui dopo qualche minuto.");
      return;
    }

    if (q) {
      const hitA = albums.filter((a) => mcNorm(a.name).includes(q) || mcNorm(a.artist).includes(q));
      const hitT = [];
      for (const a of albums) a.tracks.forEach((t, i) => { if (mcNorm(t.name).includes(q) || mcNorm(t.artist).includes(q)) hitT.push([a, i]); });
      if (!hitA.length && !hitT.length) { status("Nessun risultato."); return; }
      if (hitA.length) { const h = document.createElement("h4"); h.textContent = `Album (${hitA.length})`; body.appendChild(h); body.appendChild(this._albumGrid(hitA)); }
      if (hitT.length) {
        const h = document.createElement("h4"); h.textContent = `Brani (${hitT.length})`; body.appendChild(h);
        const l = document.createElement("div"); l.className = "list";
        for (const [a, i] of hitT.slice(0, 200)) l.appendChild(this._trackRow(a, i, true));
        body.appendChild(l);
      }
      this._markLive();
      return;
    }

    const v = this._view;
    const back = (label, to) => {
      const b = document.createElement("button");
      b.className = "back"; b.type = "button"; b.textContent = "‹ " + label;
      b.addEventListener("click", () => { this._view = to; this._render(); });
      body.appendChild(b);
    };

    if (v.album) {
      const a = this._album(v.album);
      if (!a) { this._view = v.from || { tab: "albums" }; this._render(); return; }
      back(v.from && v.from.artist ? v.from.artist : v.tab === "artists" ? "Artisti" : "Album", v.from || { tab: v.tab });
      const h = document.createElement("div"); h.className = "ah";
      h.appendChild(this._cover(a));
      const inf = document.createElement("div"); inf.className = "inf";
      const tot = a.tracks.reduce((s, t) => s + (t.dur || 0), 0);
      inf.innerHTML = '<div class="t1"></div><div class="t2"></div><div class="t3"></div><div class="acts"></div>';
      inf.querySelector(".t1").textContent = a.name;
      inf.querySelector(".t2").textContent = a.artist || "";
      inf.querySelector(".t3").textContent = [a.year, (a.genres || []).slice(0, 3).join(", "), `${a.tracks.length} brani`, tot ? mcTime(tot) : ""].filter(Boolean).join(" · ");
      const acts = inf.querySelector(".acts");
      const btn = (icon, txt, cls, fn) => {
        const b = document.createElement("button"); b.type = "button"; b.className = "go" + (cls ? " " + cls : "");
        b.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span></span>`; b.querySelector("span").textContent = txt;
        b.addEventListener("click", fn); acts.appendChild(b);
      };
      btn("mdi:play", "Riproduci", "", () => this._play(a, 0));
      btn("mdi:shuffle-variant", "Casuale", "ghost", () => this._play(a, 0, true));
      if (a.path) {
        const del = document.createElement("button");
        del.type = "button"; del.className = "del"; del.title = "Elimina dal disco, da Jellyfin e da qBittorrent";
        del.innerHTML = '<ha-icon icon="mdi:delete-outline"></ha-icon><span>Elimina</span>';
        del.addEventListener("click", () => this._askDelete(a, del));
        acts.appendChild(del);
      }
      h.appendChild(inf);
      body.appendChild(h);
      const cf = document.createElement("div"); cf.className = "confirm"; cf.hidden = true;
      body.appendChild(cf);
      const l = document.createElement("div"); l.className = "list";
      a.tracks.forEach((_t, i) => l.appendChild(this._trackRow(a, i, false)));
      body.appendChild(l);
      this._markLive();
      return;
    }

    if (v.tab === "artists") {
      if (v.artist) {
        const ar = artists.find((x) => x.name === v.artist);
        if (!ar) { this._view = { tab: "artists" }; this._render(); return; }
        back("Artisti", { tab: "artists" });
        const h = document.createElement("h4"); h.textContent = `${ar.name} · ${ar.albums.length} album`; body.appendChild(h);
        body.appendChild(this._albumGrid(ar.albums, (a) => [a.year, `${a.tracks.length} brani`].filter(Boolean).join(" · ")));
        this._markLive();
        return;
      }
      const l = document.createElement("div"); l.className = "list";
      for (const ar of artists) {
        const r = document.createElement("div"); r.className = "ar";
        r.innerHTML = '<ha-icon icon="mdi:account-music"></ha-icon><div class="nm"></div><div class="ct"></div>';
        r.querySelector(".nm").textContent = ar.name;
        r.querySelector(".ct").textContent = ar.albums.length === 1 ? "1 album" : `${ar.albums.length} album`;
        r.addEventListener("click", () => { this._view = { tab: "artists", artist: ar.name }; this._render(); });
        l.appendChild(r);
      }
      body.appendChild(l);
      return;
    }

    // Album: prima gli ultimi aggiunti
    const sorted = albums.slice().sort((x, y) => String(y.added || "").localeCompare(String(x.added || "")));
    body.appendChild(this._albumGrid(sorted));
    this._markLive();
  }

  getCardSize() { return 8; }

  getGridOptions() { return { columns: "full", rows: "auto" }; }
}

if (!customElements.get("music-card")) {
  customElements.define("music-card", MusicCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "music-card")) {
  window.customCards.push({
    type: "music-card",
    name: "Musica (Jellyfin)",
    description: "Album e brani della libreria Musica di Jellyfin, ascolto nel browser o sui dispositivi con l'app Jellyfin",
  });
}
