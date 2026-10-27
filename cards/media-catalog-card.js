/* media-catalog-card v1.6.0 — catalogo film/serie da Jellyfin via media source di Home Assistant */
const MCC_STYLE = `
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
.meta { display: flex; align-items: center; gap: 10px; text-align: right; }
.meta .n { color: var(--qa-acc, #7FF0FA); font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.meta .u { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; }
button.ref { background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 10px; color: var(--qa-glow, #4DE8F4); cursor: pointer; padding: 6px; display: flex; }
button.ref:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 28%, transparent); }
button.ref.spin ha-icon { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.bar { display: flex; gap: 8px; margin: 16px 0 14px; flex-wrap: wrap; }
.tab { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-text, #C8F4FA) 75%, transparent);
  font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; cursor: pointer; transition: all 200ms ease; }
.tab.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); color: var(--qa-acc, #7FF0FA); box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 25%, transparent), inset 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.tab .c { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); margin-left: 6px; font-variant-numeric: tabular-nums; }
.tab.on .c { color: var(--qa-glow, #4DE8F4); }
input.q { flex: 1; min-width: 160px; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px;
  color: var(--qa-text, #C8F4FA); font-size: 14px; padding: 8px 14px; outline: none; }
input.q:focus { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 70%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 20%, transparent); }
input.q::placeholder { color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 14px; }
.item { cursor: default; min-width: 0; }
.item.link { cursor: pointer; }
.poster { position: relative; aspect-ratio: 2 / 3; border-radius: 10px; overflow: hidden; background: var(--qa-solid, #0A141B);
  border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); transition: all 220ms ease; }
.item.link:hover .poster { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); transform: translateY(-2px); }
.poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ph { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  padding: 10px; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-size: 12px; }
.ph ha-icon { --mdc-icon-size: 34px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.name { margin-top: 7px; font-size: 13px; line-height: 1.3; color: var(--qa-text, #C8F4FA); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.status { padding: 30px 0; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); font-size: 14px; }
.item.sel .poster { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 95%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 35%, transparent); }
.play { display: none; margin: 0 0 16px; padding: 14px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.play.open { display: block; }
.grid > .play { grid-column: 1 / -1; margin: 0; }
.play .top { display: flex; gap: 12px; align-items: flex-start; }
.play .mini { flex: none; width: 52px; aspect-ratio: 2 / 3; border-radius: 8px; overflow: hidden; background: var(--qa-solid, #0A141B); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); }
.play .mini img { width: 100%; height: 100%; object-fit: cover; display: block; }
.play .pt { flex: 1; min-width: 0; font-size: 15px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; word-break: break-word; }
.play .pk { margin-top: 3px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.play .facts { margin-top: 6px; font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); line-height: 1.4; }
.play .ov { margin-top: 12px; font-size: 13px; line-height: 1.5; color: color-mix(in srgb, var(--qa-text, #C8F4FA) 88%, transparent); white-space: pre-line; }
.play .ov.cut { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
.play button.more { background: none; border: none; padding: 2px 0 0; color: var(--qa-glow, #4DE8F4); font-family: inherit; font-size: 12px; cursor: pointer; }
.play .epov { margin-top: 8px; font-size: 12px; line-height: 1.45; color: color-mix(in srgb, var(--qa-text, #C8F4FA) 75%, transparent); }
.play .epov:empty { display: none; }
.play button.x { flex: none; background: none; border: none; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 70%, transparent); cursor: pointer; padding: 2px; display: flex; }
.play label { display: block; margin: 14px 0 6px; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.play .eps { display: flex; gap: 8px; flex-wrap: wrap; }
.play select { flex: 1 1 140px; min-width: 0; box-sizing: border-box; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent);
  border-radius: 10px; color: var(--qa-text, #C8F4FA); font-family: inherit; font-size: 14px; padding: 9px 12px; outline: none; }
.play select.ep { flex: 3 1 200px; }
.play select option { background: var(--qa-solid, #0D1720); color: var(--qa-text, #C8F4FA); }
.play .devs { display: flex; gap: 8px; flex-wrap: wrap; }
.play button.dev { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 999px;
  color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); font-family: inherit; font-size: 13px; padding: 7px 14px; cursor: pointer; transition: all 150ms ease; }
.play button.dev ha-icon { --mdc-icon-size: 16px; }
.play button.dev.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); color: var(--qa-text, #C8F4FA); }
.play .hint { font-size: 13px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); line-height: 1.4; }
.play .msg { margin-top: 12px; font-size: 13px; color: var(--qa-acc, #7FF0FA); }
.play .msg.err { color: #FF9E1B; }
.play .acts { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.play a.open { margin-right: auto; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); font-size: 12px; text-decoration: none; letter-spacing: 0.03em; }
.play a.open:hover { text-decoration: underline; }
.play button.go { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA);
  font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 18px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; }
.play button.go ha-icon { --mdc-icon-size: 18px; }
.play button.go[disabled] { opacity: 0.45; cursor: default; }
.play button.del { background: none; border: 1px solid rgba(255,158,27,0.35); border-radius: 999px; color: rgba(255,158,27,0.85);
  font-family: inherit; font-size: 12px; letter-spacing: 0.04em; padding: 7px 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.play button.del ha-icon { --mdc-icon-size: 16px; }
.play button.del:hover { border-color: rgba(255,158,27,0.85); }
.play button.del[disabled] { opacity: 0.45; cursor: default; }
.play .confirm { margin-top: 14px; padding: 12px; border: 1px solid rgba(255,158,27,0.5); border-radius: 10px; background: rgba(255,158,27,0.05);
  font-size: 13px; line-height: 1.45; color: var(--qa-text, #C8F4FA); }
.play .confirm b { color: #FF9E1B; }
.play .confirm ul { margin: 6px 0 0; padding-left: 18px; }
.play .confirm li { word-break: break-word; }
.play .confirm .k { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.play .confirm .acts { margin-top: 12px; }
.play button.no { background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent);
  font-family: inherit; font-size: 13px; padding: 8px 16px; cursor: pointer; }
.play button.yes { background: rgba(255,158,27,0.12); border: 1px solid rgba(255,158,27,0.8); border-radius: 999px; color: #FF9E1B;
  font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; padding: 8px 16px; cursor: pointer; }
.play button.yes[disabled] { opacity: 0.45; cursor: default; }
`;

// Stessa cartella vista da Jellyfin e da qBittorrent (vedi CLAUDE.md, "Media")
const MCC_JF_ROOT = "/data/downloads";
const MCC_QB_ROOT = "/downloads";
// Si cancella solo dentro queste cartelle, mai le cartelle stesse
const MCC_LIB_DIRS = ["/data/downloads/film", "/data/downloads/serietv"];

// Ultimo dispositivo usato (per riproporlo); solo comodità locale del browser
const MCC_LAST_DEV = "media-catalog-card.last-device";

class MediaCatalogCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign(
      { title: "Catalogo", source: "media-source://jellyfin", refresh_minutes: 30, jellyfin_url: "" },
      config || {}
    );
    if (!this._tab) this._tab = "movie";
    if (this._query === undefined) this._query = "";
    if (this._root) this._renderAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._build();
      this._load();
      this._startTimer();
    } else if (this._sel) {
      // dispositivi accesi/spenti mentre il pannello è aperto
      const sig = this._devices().map((d) => d.entity_id).join(",");
      if (sig !== this._devSig) this._renderDevices();
    }
  }

  connectedCallback() {
    if (this._hass) {
      this._startTimer();
      if (!this._loading && this._stale()) this._load();
    }
  }

  disconnectedCallback() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
  }

  _stale() {
    if (!this._updated) return true;
    return Date.now() - this._updated.getTime() > this._period();
  }

  _period() {
    return Math.max(5, Number(this._config.refresh_minutes) || 30) * 60000;
  }

  _startTimer() {
    if (this._timer) return;
    this._timer = setInterval(() => this._load(), this._period());
  }

  _build() {
    if (this._root) return;
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${MCC_STYLE}</style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:filmstrip-box-multiple"></ha-icon><span class="t"></span></div>
          <div class="meta">
            <div><div class="n"></div><div class="u"></div></div>
            <button class="ref" title="Aggiorna ora"><ha-icon icon="mdi:refresh"></ha-icon></button>
          </div>
        </div>
        <div class="bar">
          <button class="tab" data-tab="movie">Film<span class="c"></span></button>
          <button class="tab" data-tab="tv">Serie TV<span class="c"></span></button>
          <input class="q" type="search" placeholder="Cerca titolo…" />
        </div>
        <div class="play"></div>
        <div class="body"></div>
      </ha-card>`;
    this._root = sr;
    this._playEl = sr.querySelector(".play");
    sr.querySelectorAll(".tab").forEach((b) =>
      b.addEventListener("click", () => { this._tab = b.dataset.tab; this._closePlay(); this._renderAll(); })
    );
    const q = sr.querySelector("input.q");
    q.value = this._query;
    q.addEventListener("input", () => { this._query = q.value; this._renderList(); });
    sr.querySelector("button.ref").addEventListener("click", () => this._load());
    this._renderAll();
  }

  async _browse(id) {
    return this._hass.callWS({ type: "media_source/browse_media", media_content_id: id });
  }

  async _load() {
    if (this._loading || !this._hass) return;
    this._loading = true;
    this._error = null;
    this._renderMeta();
    try {
      const root = await this._browse(this._config.source);
      const movies = new Map();
      const shows = new Map();
      const addAll = (list) => {
        for (const it of list || []) {
          if (it.media_class === "movie") movies.set(it.media_content_id, it);
          else if (it.media_class === "tv_show") shows.set(it.media_content_id, it);
        }
      };
      addAll(root.children);
      for (const lib of root.children || []) {
        if (!lib.can_expand || lib.media_class === "movie" || lib.media_class === "tv_show") continue;
        if (lib.children_media_class && !["movie", "tv_show", "directory"].includes(lib.children_media_class)) continue;
        try {
          const res = await this._browse(lib.media_content_id);
          addAll(res.children);
        } catch (e) { /* libreria non leggibile: la salto */ }
      }
      const sort = (m) => [...m.values()].sort((a, b) => (a.title || "").localeCompare(b.title || "", "it", { sensitivity: "base" }));
      this._data = { movie: sort(movies), tv: sort(shows) };
      this._updated = new Date();
    } catch (e) {
      this._error = (e && (e.message || e.code)) || String(e);
    } finally {
      this._loading = false;
      this._renderAll();
    }
  }

  _renderAll() {
    if (!this._root) return;
    this._root.querySelector(".t").textContent = this._config.title;
    this._root.querySelectorAll(".tab").forEach((b) => {
      b.classList.toggle("on", b.dataset.tab === this._tab);
      const n = this._data ? this._data[b.dataset.tab].length : "";
      b.querySelector(".c").textContent = n === "" ? "" : n;
    });
    this._renderMeta();
    this._renderList();
  }

  _renderMeta() {
    if (!this._root) return;
    const n = this._root.querySelector(".n");
    const u = this._root.querySelector(".u");
    const btn = this._root.querySelector("button.ref");
    btn.classList.toggle("spin", !!this._loading);
    if (this._data) {
      n.textContent = `${this._data.movie.length + this._data.tv.length} titoli`;
    } else {
      n.textContent = "";
    }
    u.textContent = this._loading
      ? "Aggiornamento…"
      : this._updated
        ? "Aggiornato alle " + this._updated.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
        : "";
  }

  _itemId(it) {
    const parts = (it.media_content_id || "").split("/");
    return parts[parts.length - 1];
  }

  _renderList() {
    if (!this._root) return;
    const body = this._root.querySelector(".body");
    // il pannello torna al suo posto (sopra la griglia) prima di ricostruirla
    if (this._playEl.parentNode !== body.parentNode) body.before(this._playEl);
    body.innerHTML = "";
    const status = (txt) => { const d = document.createElement("div"); d.className = "status"; d.textContent = txt; body.appendChild(d); };
    if (this._error && !this._data) { status("Impossibile leggere il catalogo: " + this._error); return; }
    if (!this._data) { status("Caricamento catalogo…"); return; }
    const q = (this._query || "").trim().toLowerCase();
    const list = this._data[this._tab].filter((it) => !q || (it.title || "").toLowerCase().includes(q));
    if (!list.length) {
      status(q ? "Nessun titolo trovato" : this._tab === "movie" ? "Nessun film nella libreria" : "Nessuna serie nella libreria");
      return;
    }
    const icon = this._tab === "movie" ? "mdi:movie-open-outline" : "mdi:television-classic";
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const it of list) {
      const card = document.createElement("div");
      card.className = "item link" + (this._sel && this._sel.media_content_id === it.media_content_id ? " sel" : "");
      card.title = it.title || "";
      const poster = document.createElement("div");
      poster.className = "poster";
      const ph = document.createElement("div");
      ph.className = "ph";
      const phi = document.createElement("ha-icon");
      phi.setAttribute("icon", icon);
      ph.appendChild(phi);
      poster.appendChild(ph);
      if (it.thumbnail) poster.appendChild(this._img(it.thumbnail));
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = it.title || "";
      card.appendChild(poster);
      card.appendChild(name);
      card.addEventListener("click", () => this._openPlay(it));
      grid.appendChild(card);
    }
    body.appendChild(grid);
    // Pannello subito sotto la riga del titolo toccato: in cima alla card, sul telefono, restava fuori schermo
    const idx = this._sel ? list.findIndex((it) => it.media_content_id === this._sel.media_content_id) : -1;
    if (idx >= 0) {
      const cols = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length);
      const end = (Math.floor(idx / cols) + 1) * cols;
      grid.insertBefore(this._playEl, grid.children[end] || null);
    }
  }

  // Copia servita da HA (/local, funziona anche via Nabu Casa); se manca, l'indirizzo diretto di Jellyfin
  _img(thumbnail) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    const m = thumbnail.match(/\/Items\/([0-9a-fA-F]{32})\/Images\//);
    const local = m ? `/local/jellyfin/${m[1].toLowerCase()}.jpg` : "";
    img.src = local || thumbnail;
    img.addEventListener("error", () => {
      if (local && img.src.indexOf(local) !== -1) img.src = thumbnail;
      else img.remove();
    });
    return img;
  }

  // Dispositivi a cui mandare il titolo:
  // - quelli in config `devices` (es. la TV): sempre presenti, avviati da uno script che accende la TV e apre Jellyfin;
  // - i lettori Jellyfin accesi che accettano comandi (play_media); stesso nome = stesso dispositivo.
  _devices() {
    const h = this._hass;
    if (!h || !h.entities) return [];
    const rank = { playing: 0, paused: 1, idle: 2, on: 3 };
    const configured = (this._config.devices || []).filter((d) => d && d.script).map((d) => {
      const players = (d.players || []).map((p) => h.states[p]).filter(Boolean);
      const busy = players.find((p) => p.state === "playing" || p.state === "paused");
      return {
        entity_id: "script:" + d.script,
        script: d.script,
        state: busy ? busy.state : "idle",
        attributes: { friendly_name: d.name || d.script, media_title: busy ? busy.attributes.media_title : undefined, icon: d.icon },
        players: d.players || [],
      };
    });
    const taken = new Set(configured.flatMap((d) => d.players));
    const byName = new Map();
    for (const id of Object.keys(h.states)) {
      if (!id.startsWith("media_player.") || taken.has(id) || !h.entities[id] || h.entities[id].platform !== "jellyfin") continue;
      const s = h.states[id];
      if (s.state === "unavailable" || s.state === "off" || !((s.attributes.supported_features || 0) & 512)) continue;
      const name = s.attributes.friendly_name || id;
      const prev = byName.get(name);
      if (!prev || (rank[s.state] ?? 9) < (rank[prev.state] ?? 9)) byName.set(name, s);
    }
    const byLabel = (a, b) => (a.attributes.friendly_name || "").localeCompare(b.attributes.friendly_name || "", "it");
    return [...configured.sort(byLabel), ...[...byName.values()].sort(byLabel)];
  }

  _openPlay(it) {
    const isShow = it.media_class === "tv_show";
    this._sel = it;
    this._playMsg = null;
    const p = this._root.querySelector(".play");
    const base = (this._config.jellyfin_url || "").replace(/\/+$/, "");
    p.innerHTML = `
      <div class="top">
        <div class="mini"></div>
        <div style="flex:1;min-width:0"><div class="pt"></div><div class="pk">${isShow ? "Serie TV" : "Film"}</div><div class="facts"></div></div>
        <button class="x" title="Chiudi"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="ov" hidden></div><button class="more" hidden>Mostra tutto</button>
      ${isShow ? `<label>Episodio</label><div class="eps">
        <select class="season" disabled><option>Carico…</option></select>
        <select class="ep" disabled><option>Carico…</option></select></div><div class="epov"></div>` : ""}
      <label>Riproduci su</label>
      <div class="devs"></div>
      <div class="msg" hidden></div>
      <div class="acts">
        ${base ? '<a class="open" target="_blank" rel="noopener noreferrer">Apri in Jellyfin ↗</a>' : ""}
        <button class="del" title="Elimina dal disco, da Jellyfin e da qBittorrent"><ha-icon icon="mdi:delete-outline"></ha-icon><span>Elimina</span></button>
        <button class="go" disabled><ha-icon icon="mdi:play"></ha-icon><span>Riproduci</span></button>
      </div>
      <div class="confirm" hidden></div>`;
    p.querySelector(".pt").textContent = it.title || "";
    if (it.thumbnail) p.querySelector(".mini").appendChild(this._img(it.thumbnail));
    if (base) p.querySelector("a.open").href = `${base}/web/#/details?id=${encodeURIComponent(this._itemId(it))}`;
    p.querySelector("button.x").addEventListener("click", () => this._closePlay());
    p.querySelector("button.go").addEventListener("click", () => this._play());
    p.querySelector("button.del").addEventListener("click", () => this._askDelete());
    p.classList.add("open");
    this._renderDevices();
    this._renderList();
    p.scrollIntoView({ block: "nearest", behavior: "smooth" });
    this._loadInfo(it);
    if (isShow) this._loadSeasons(it);
  }

  async _details(id) {
    const res = await this._rest("jellyfin_dettagli", { ids: id });
    return ((res && res.Items) || [])[0];
  }

  // Anno, generi, durata, voto e trama da Jellyfin (in italiano se la libreria lo è)
  async _loadInfo(it) {
    let d;
    try { d = await this._details(this._itemId(it)); } catch (e) { return; /* senza descrizione il pannello funziona lo stesso */ }
    const p = this._root && this._root.querySelector(".play");
    if (!d || this._sel !== it || !p) return;
    const facts = [];
    if (d.ProductionYear) {
      const end = d.EndDate ? new Date(d.EndDate).getFullYear() : null;
      facts.push(d.Type === "Series" && d.Status === "Ended" && end && end !== d.ProductionYear ? `${d.ProductionYear}–${end}` : String(d.ProductionYear));
    }
    if (d.Genres && d.Genres.length) facts.push(d.Genres.slice(0, 3).join(", "));
    const min = Math.round((d.RunTimeTicks || 0) / 600000000);
    if (d.Type !== "Series" && min) facts.push(min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`);
    if (d.CommunityRating) facts.push("★ " + d.CommunityRating.toLocaleString("it-IT", { maximumFractionDigits: 1 }));
    if (d.OfficialRating) facts.push(d.OfficialRating);
    p.querySelector(".facts").textContent = facts.join(" · ");
    const ov = p.querySelector(".ov");
    const more = p.querySelector("button.more");
    ov.textContent = d.Overview || "";
    ov.hidden = !d.Overview;
    if (!d.Overview) return;
    ov.classList.add("cut");
    // "Mostra tutto" solo se il testo è davvero tagliato
    requestAnimationFrame(() => {
      if (ov.scrollHeight <= ov.clientHeight + 2) { ov.classList.remove("cut"); return; }
      more.hidden = false;
      more.onclick = () => {
        const cut = ov.classList.toggle("cut");
        more.textContent = cut ? "Mostra tutto" : "Mostra meno";
      };
    });
  }

  async _loadEpInfo(ep) {
    const p = this._root && this._root.querySelector(".play");
    const box = p && p.querySelector(".epov");
    if (!box) return;
    box.textContent = "";
    if (!ep) return;
    let d;
    try { d = await this._details(this._itemId(ep)); } catch (e) { return; }
    if (this._ep !== ep || !d) return;
    box.textContent = d.Overview || "";
  }

  _closePlay() {
    this._sel = undefined;
    if (this._closeTimer) { clearTimeout(this._closeTimer); this._closeTimer = null; }
    if (!this._root) return;
    const p = this._root.querySelector(".play");
    p.classList.remove("open");
    p.innerHTML = "";
    this._renderList();
  }

  _renderDevices() {
    const p = this._root && this._root.querySelector(".play");
    if (!p || !this._sel) return;
    const box = p.querySelector(".devs");
    const devs = this._devices();
    this._devSig = devs.map((d) => d.entity_id).join(",");
    if (!devs.some((d) => d.entity_id === this._dev)) {
      let last = "";
      try { last = localStorage.getItem(MCC_LAST_DEV) || ""; } catch (e) { /* storage non disponibile */ }
      this._dev = (devs.find((d) => d.entity_id === last) || devs[0] || {}).entity_id;
    }
    box.innerHTML = "";
    if (!devs.length) {
      const h = document.createElement("div");
      h.className = "hint";
      h.textContent = "Nessun dispositivo Jellyfin acceso: apri l'app Jellyfin sulla TV o sul proiettore e riprova.";
      box.appendChild(h);
    }
    for (const d of devs) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dev" + (d.entity_id === this._dev ? " on" : "");
      const busy = d.state === "playing" || d.state === "paused";
      const icon = busy ? "mdi:play-circle-outline" : d.script ? d.attributes.icon || "mdi:television" : "mdi:cast";
      b.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span></span>`;
      b.querySelector("span").textContent = d.attributes.friendly_name || d.entity_id;
      if (busy && d.attributes.media_title) b.title = "Sta riproducendo: " + d.attributes.media_title;
      b.addEventListener("click", () => { this._dev = d.entity_id; this._renderDevices(); });
      box.appendChild(b);
    }
    this._updateGo();
  }

  async _loadSeasons(show) {
    const p = this._root.querySelector(".play");
    const sSel = p.querySelector("select.season");
    const eSel = p.querySelector("select.ep");
    try {
      const res = await this._browse(show.media_content_id);
      if (this._sel !== show) return;
      const seasons = (res.children || []).filter((c) => c.can_expand);
      sSel.innerHTML = "";
      seasons.forEach((s, i) => { const o = document.createElement("option"); o.value = i; o.textContent = s.title; sSel.appendChild(o); });
      sSel.disabled = !seasons.length;
      const loadEps = async () => {
        const season = seasons[Number(sSel.value)];
        eSel.disabled = true;
        eSel.innerHTML = "<option>Carico…</option>";
        this._ep = undefined;
        this._updateGo();
        const r = await this._browse(season.media_content_id);
        if (this._sel !== show || seasons[Number(sSel.value)] !== season) return;
        this._eps = (r.children || []).filter((c) => c.can_play);
        eSel.innerHTML = "";
        this._eps.forEach((e, i) => { const o = document.createElement("option"); o.value = i; o.textContent = `${i + 1}. ${e.title}`; eSel.appendChild(o); });
        eSel.disabled = !this._eps.length;
        this._ep = this._eps[0];
        this._updateGo();
        this._loadEpInfo(this._ep);
      };
      sSel.addEventListener("change", () => loadEps().catch((e) => this._showMsg("Episodi non leggibili: " + (e.message || e), true)));
      eSel.addEventListener("change", () => { this._ep = this._eps[Number(eSel.value)]; this._updateGo(); this._loadEpInfo(this._ep); });
      if (seasons.length) await loadEps();
      else this._showMsg("Nessuna stagione trovata in Jellyfin.", true);
    } catch (e) {
      this._showMsg("Stagioni non leggibili: " + ((e && (e.message || e.code)) || e), true);
    }
  }

  _target() {
    const it = this._sel;
    if (!it) return null;
    if (it.media_class === "tv_show") return this._ep ? { item: this._ep, type: "episode" } : null;
    return { item: it, type: "movie" };
  }

  _updateGo() {
    const go = this._root && this._root.querySelector(".play button.go");
    if (go) go.disabled = !this._dev || !this._target() || !!this._playing;
  }

  _showMsg(txt, err) {
    const m = this._root && this._root.querySelector(".play .msg");
    if (!m) return;
    m.hidden = !txt;
    m.className = "msg" + (err ? " err" : "");
    m.textContent = txt || "";
  }

  async _play() {
    const t = this._target();
    const dev = this._devices().find((d) => d.entity_id === this._dev);
    if (!t || !dev) return;
    const sel = this._sel;
    this._playing = true;
    this._updateGo();
    this._showMsg("Avvio…");
    try {
      const what = t.type === "episode" ? `${sel.title} · ${t.item.title}` : sel.title;
      const name = dev.attributes.friendly_name || this._dev;
      if (dev.script) {
        // lo script accende la TV e apre Jellyfin: script.turn_on non aspetta che finisca
        await this._hass.callService("script", "turn_on", {
          entity_id: dev.script,
          variables: { media_id: this._itemId(t.item), media_type: t.type },
        });
        this._showMsg(`▶ ${what}: avvio su ${name}. Apro Jellyfin (e se serve accendo il dispositivo), può volerci fino a mezzo minuto.`);
      } else {
        await this._hass.callService("media_player", "play_media", {
          entity_id: this._dev,
          media_content_id: this._itemId(t.item),
          media_content_type: t.type,
        });
        this._showMsg(`▶ ${what} avviato su ${name}`);
      }
      try { localStorage.setItem(MCC_LAST_DEV, this._dev); } catch (e) { /* storage non disponibile */ }
      this._closeTimer = setTimeout(() => { if (this._sel === sel) this._closePlay(); }, dev.script ? 5000 : 2500);
    } catch (e) {
      this._showMsg("Non riesco ad avviarlo: " + ((e && (e.message || e.code)) || e), true);
    } finally {
      this._playing = false;
      this._updateGo();
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

  // Cosa va cancellato: percorso del titolo in Jellyfin e torrent di qBittorrent che lo contengono.
  // Torrent tutto dentro il titolo → tolto con i file. Torrent che contiene il titolo ma anche altri
  // film/serie del catalogo (pacchetto) → tolto senza file, così gli altri titoli restano.
  async _deletePlan(it) {
    const id = this._itemId(it);
    const [items, torrents] = await Promise.all([this._rest("jellyfin_percorsi"), this._rest("qbittorrent_torrent")]);
    const all = (items && items.Items) || [];
    const me = all.find((x) => x.Id === id);
    if (!me || !me.Path) throw new Error("titolo non trovato in Jellyfin (forse è già stato eliminato)");
    const path = me.Path.replace(/\/+$/, "");
    if (!MCC_LIB_DIRS.some((d) => path.startsWith(d + "/"))) throw new Error("percorso fuori dalle cartelle Film/Serie TV: " + path);
    const toQb = (p) => MCC_QB_ROOT + p.slice(MCC_JF_ROOT.length);
    const inside = (p, dir) => p === dir || p.startsWith(dir + "/");
    const qPath = toQb(path);
    const others = all.filter((x) => x.Id !== id && x.Path).map((x) => toQb(x.Path.replace(/\/+$/, "")));
    const qLib = MCC_LIB_DIRS.map(toQb).concat(MCC_QB_ROOT);
    const full = [];
    const partial = [];
    for (const t of Array.isArray(torrents) ? torrents : []) {
      const cp = (t.content_path || "").replace(/\/+$/, "");
      if (!cp) continue;
      if (inside(cp, qPath)) full.push(t);
      else if (qPath.startsWith(cp + "/")) {
        if (qLib.includes(cp) || others.some((o) => inside(o, cp))) partial.push(t);
        else full.push(t);
      }
    }
    return { id, title: it.title || me.Name, path, full, partial };
  }

  _size(bytes) {
    const gb = (bytes || 0) / 1073741824;
    return gb >= 1 ? gb.toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " GB" : Math.round((bytes || 0) / 1048576) + " MB";
  }

  async _askDelete() {
    const it = this._sel;
    const p = this._root && this._root.querySelector(".play");
    if (!it || !p) return;
    const box = p.querySelector(".confirm");
    const del = p.querySelector("button.del");
    del.disabled = true;
    this._showMsg("Controllo cosa c'è da cancellare…");
    let plan;
    try {
      plan = await this._deletePlan(it);
    } catch (e) {
      this._showMsg("Non posso eliminarlo: " + ((e && (e.message || e.code)) || e), true);
      del.disabled = false;
      return;
    }
    if (this._sel !== it) return;
    this._showMsg("");
    const rel = plan.path.slice(MCC_JF_ROOT.length + 1);
    box.innerHTML = `<div>Eliminare <b></b> per sempre? Non si può annullare.</div>
      <ul>
        <li><span class="k">Disco:</span> <span class="pth"></span></li>
        <li><span class="k">Catalogo:</span> tolto da Jellyfin e da qui</li>
        <li class="tf"></li>
        ${plan.partial.length ? '<li class="tp"></li>' : ""}
      </ul>
      <div class="acts"><button class="no">Annulla</button><button class="yes">Elimina definitivamente</button></div>`;
    box.querySelector("b").textContent = plan.title;
    box.querySelector(".pth").textContent = rel + (it.media_class === "tv_show" ? "/ (tutta la cartella, tutte le stagioni)" : "");
    box.querySelector(".tf").textContent = plan.full.length
      ? `qBittorrent: ${plan.full.length === 1 ? "torrent tolto" : plan.full.length + " torrent tolti"} con i file (${plan.full.map((t) => `${t.name}, ${this._size(t.size)}`).join(" · ")})`
      : "qBittorrent: nessun torrent collegato";
    if (plan.partial.length) {
      box.querySelector(".tp").textContent = `Pacchetto con altri titoli, tolto da qBittorrent senza cancellare gli altri file: ${plan.partial.map((t) => t.name).join(" · ")}`;
    }
    box.querySelector("button.no").addEventListener("click", () => { box.hidden = true; box.innerHTML = ""; del.disabled = false; });
    box.querySelector("button.yes").addEventListener("click", () => this._doDelete(plan));
    box.hidden = false;
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async _doDelete(plan) {
    const p = this._root && this._root.querySelector(".play");
    if (!p) return;
    const box = p.querySelector(".confirm");
    box.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    this._showMsg("Elimino…");
    const done = [];
    try {
      // prima Jellyfin (catalogo + file): se fallisce non si tocca niente in qBittorrent
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
      if (done.length) this._load();
      else p.querySelector("button.del").disabled = false;
      return;
    }
    box.hidden = true;
    this._showMsg(`✓ ${plan.title} eliminato (${done.join(", ")}).`);
    if (this._data) {
      for (const k of Object.keys(this._data)) this._data[k] = this._data[k].filter((x) => this._itemId(x) !== plan.id);
    }
    this._renderAll();
    const sel = this._sel;
    this._closeTimer = setTimeout(() => { if (this._sel === sel) this._closePlay(); }, 3000);
    // Jellyfin aggiorna il catalogo subito, ma lo rileggo per sicurezza dopo qualche secondo
    setTimeout(() => this._load(), 5000);
  }

  getCardSize() { return 12; }

  getGridOptions() { return { columns: "full", rows: "auto" }; }
}

if (!customElements.get("media-catalog-card")) {
  customElements.define("media-catalog-card", MediaCatalogCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "media-catalog-card")) {
  window.customCards.push({
    type: "media-catalog-card",
    name: "Catalogo media",
    description: "Catalogo film e serie TV dalla libreria Jellyfin, aggiornato in automatico",
  });
}
