/* radio-card v1.0.1 — radio italiane (radio-browser.info, elenco in /local/radio/radio.json), preferite col cuore, ascolto su Echo / Wall Display / browser */
const RC_STYLE = `
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
.now { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.now:empty { display: none; }
.np { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); flex-wrap: wrap; }
.np .eq { flex: none; color: var(--qa-glow, #4DE8F4); --mdc-icon-size: 22px; }
.np .tx { flex: 1; min-width: 140px; }
.np .d { font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.np .s { font-size: 14px; font-weight: 600; color: var(--qa-text, #C8F4FA); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.np .s.err { color: #FF9E1B; font-weight: 400; white-space: normal; }
.np input[type=range] { width: 110px; accent-color: var(--qa-glow, #4DE8F4); }
.np button { background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA); cursor: pointer; padding: 5px; display: flex; }
.np button:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); }
.np button ha-icon { --mdc-icon-size: 18px; }
.bar { display: flex; gap: 8px; margin: 16px 0 14px; flex-wrap: wrap; }
.tab { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-text, #C8F4FA) 75%, transparent);
  font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 14px; cursor: pointer; transition: all 200ms ease;
  display: flex; align-items: center; gap: 6px; }
.tab ha-icon { --mdc-icon-size: 16px; }
.tab.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); color: var(--qa-acc, #7FF0FA); box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 25%, transparent), inset 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.tab .c { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
.tab.on .c { color: var(--qa-glow, #4DE8F4); }
input.q { flex: 1; min-width: 160px; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px;
  color: var(--qa-text, #C8F4FA); font-size: 14px; padding: 8px 14px; outline: none; }
input.q:focus { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 70%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 20%, transparent); }
input.q::placeholder { color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.st { position: relative; cursor: pointer; min-width: 0; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--qa-shade, #000) 25%, transparent);
  padding: 10px; display: flex; flex-direction: column; gap: 8px; transition: all 220ms ease; }
.st:hover, .st.sel { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
.st.live { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); }
.logo { height: 64px; display: flex; align-items: center; justify-content: center; }
.logo img { max-width: 100%; max-height: 64px; object-fit: contain; display: block; border-radius: 6px; }
.logo ha-icon { --mdc-icon-size: 34px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.sn { font-size: 13px; font-weight: 600; color: var(--qa-text, #C8F4FA); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 4px; }
.tg { font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-height: 14px; }
button.fav { position: absolute; top: 4px; right: 4px; background: color-mix(in srgb, var(--qa-shade, #000) 45%, transparent); border: none; border-radius: 999px; padding: 4px; cursor: pointer;
  color: color-mix(in srgb, var(--qa-text, #C8F4FA) 45%, transparent); display: flex; z-index: 1; }
button.fav ha-icon { --mdc-icon-size: 20px; }
button.fav.on { color: #FF4F7B; filter: drop-shadow(0 0 5px rgba(255,79,123,0.7)); }
button.fav:hover { color: #FF4F7B; }
.more { display: flex; justify-content: center; margin-top: 14px; }
.more button, .play button.go { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA);
  font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 18px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; }
.status { padding: 30px 0; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); font-size: 14px; line-height: 1.5; }
.play { display: none; margin: 0 0 16px; padding: 14px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.play.open { display: block; }
.play .top { display: flex; gap: 12px; align-items: center; }
.play .mini { flex: none; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
.play .mini img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; }
.play .mini ha-icon { --mdc-icon-size: 30px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.play .pt { flex: 1; min-width: 0; font-size: 15px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; word-break: break-word; }
.play .pk { margin-top: 3px; font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); }
.play button.x { flex: none; background: none; border: none; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 70%, transparent); cursor: pointer; padding: 2px; display: flex; }
.play label { display: block; margin: 14px 0 6px; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.play .devs { display: flex; gap: 8px; flex-wrap: wrap; }
.play button.dev { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 999px;
  color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); font-family: inherit; font-size: 13px; padding: 7px 14px; cursor: pointer; transition: all 150ms ease; }
.play button.dev ha-icon { --mdc-icon-size: 16px; }
.play button.dev.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); color: var(--qa-text, #C8F4FA); }
.play button.dev[disabled] { opacity: 0.4; cursor: default; }
.play .msg { margin-top: 12px; font-size: 13px; color: var(--qa-acc, #7FF0FA); }
.play .msg.err { color: #FF9E1B; }
.play .acts { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.play button.go ha-icon { --mdc-icon-size: 18px; }
.play button.go[disabled] { opacity: 0.45; cursor: default; }
`;

const RC_LAST_DEV = "radio-card.last-device";   // comodità locale del browser
const RC_FAV_KEY = "radio-card.favorites";      // preferite: dati utente di HA (frontend/set_user_data), uguali su tutti i dispositivi dello stesso utente
const RC_PAGE = 60;
const RC_HLS_JS = "https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js";
const RC_BROWSER = "browser";

// Lettore del browser condiviso a livello di pagina: continua a suonare cambiando vista della dashboard
const RC_PLAYER = window.__radioCardPlayer || (window.__radioCardPlayer = {
  audio: new Audio(), hls: null, station: null, error: "", listeners: new Set(),
  notify() { for (const f of this.listeners) f(); },
});
if (!RC_PLAYER.bound) {
  RC_PLAYER.bound = true;
  for (const ev of ["playing", "pause", "volumechange", "waiting"]) RC_PLAYER.audio.addEventListener(ev, () => RC_PLAYER.notify());
  RC_PLAYER.audio.addEventListener("error", () => {
    if (RC_PLAYER.station) RC_PLAYER.error = "Il flusso non risponde o il browser non lo supporta.";
    RC_PLAYER.notify();
  });
}

function rcLoadHls() {
  if (window.Hls) return Promise.resolve(window.Hls);
  if (!rcLoadHls.p) {
    rcLoadHls.p = new Promise((ok, ko) => {
      const s = document.createElement("script");
      s.src = RC_HLS_JS;
      s.onload = () => ok(window.Hls);
      s.onerror = () => { rcLoadHls.p = null; ko(new Error("hls.js non caricato")); };
      document.head.appendChild(s);
    });
  }
  return rcLoadHls.p;
}

class RadioCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign(
      {
        title: "Radio",
        source: "/local/radio/radio.json",
        browser: true,                 // "Questo dispositivo": ascolto nel browser
        alexa_type: "TUNEIN",          // media_content_type per gli Echo (Alexa Media Player cerca la stazione per nome)
        devices: [],                   // [{ name, entity, icon, mode: alexa | url | shelly }]
      },
      config || {}
    );
    if (this._query === undefined) this._query = "";
    if (this._limit === undefined) this._limit = RC_PAGE;
    if (this._root) this._renderAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._build();
      this._load();
      this._loadFavs();
    } else {
      const sig = this._devices().map((d) => `${d.id}:${d.state}:${d.title}:${d.volume}`).join("|");
      if (sig !== this._nowSig) { this._renderNow(); if (this._sel) this._renderDevices(); }
    }
  }

  connectedCallback() {
    this._onPlayer = this._onPlayer || (() => { this._renderNow(); this._markLive(); });
    RC_PLAYER.listeners.add(this._onPlayer);
    if (this._root) this._renderNow();
  }

  disconnectedCallback() {
    RC_PLAYER.listeners.delete(this._onPlayer);
    if (this._closeTimer) { clearTimeout(this._closeTimer); this._closeTimer = null; }
  }

  _build() {
    if (this._root) return;
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${RC_STYLE}</style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:radio"></ha-icon><span class="t"></span></div>
          <div class="meta"><div class="n"></div><div class="u"></div></div>
        </div>
        <div class="now"></div>
        <div class="bar"><span class="tabs" style="display:contents"></span>
          <input class="q" type="search" placeholder="Cerca radio o genere…" />
        </div>
        <div class="play"></div>
        <div class="body"></div>
      </ha-card>`;
    this._root = sr;
    const q = sr.querySelector("input.q");
    q.value = this._query;
    q.addEventListener("input", () => { this._query = q.value; this._limit = RC_PAGE; this._renderList(); });
    this._renderAll();
  }

  async _load() {
    try {
      const r = await fetch(this._config.source, { cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const doc = await r.json();
      this._data = (doc.stations || []).map((s) => Object.assign(s, { _q: (s.n + " " + (s.t || []).join(" ")).toLowerCase() }));
      this._byKey = new Map(this._data.map((s) => [s.k, s]));
      this._updated = doc.updated ? new Date(doc.updated * 1000) : null;
      this._error = null;
    } catch (e) {
      this._error = (e && e.message) || String(e);
    }
    this._renderAll();
  }

  async _loadFavs() {
    try {
      const r = await this._hass.callWS({ type: "frontend/get_user_data", key: RC_FAV_KEY });
      this._favs = Array.isArray(r && r.value) ? r.value : [];
    } catch (e) {
      this._favs = [];
    }
    if (this._tab === undefined) this._tab = this._favs.length ? "fav" : "all";
    this._renderAll();
  }

  async _toggleFav(s) {
    const favs = (this._favs || []).slice();
    const i = favs.indexOf(s.k);
    if (i >= 0) favs.splice(i, 1); else favs.push(s.k);
    this._favs = favs;
    this._renderTabs();
    this._renderList();
    try {
      await this._hass.callWS({ type: "frontend/set_user_data", key: RC_FAV_KEY, value: favs });
    } catch (e) {
      console.warn("radio-card: preferite non salvate", e);
    }
  }

  _renderAll() {
    if (!this._root) return;
    this._root.querySelector(".t").textContent = this._config.title;
    this._root.querySelector(".n").textContent = this._data ? `${this._data.length} stazioni` : "";
    this._root.querySelector(".u").textContent = this._updated
      ? "Elenco del " + this._updated.toLocaleDateString("it-IT", { day: "numeric", month: "short" })
      : "";
    this._renderTabs();
    this._renderNow();
    this._renderList();
  }

  _renderTabs() {
    const tabs = this._root.querySelector(".tabs");
    tabs.innerHTML = "";
    const mk = (id, icon, label, count) => {
      const b = document.createElement("button");
      b.className = "tab" + (this._tab === id ? " on" : "");
      b.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span></span><span class="c"></span>`;
      b.querySelector("span").textContent = label;
      b.querySelector(".c").textContent = count;
      b.addEventListener("click", () => { this._tab = id; this._limit = RC_PAGE; this._renderTabs(); this._renderList(); });
      tabs.appendChild(b);
    };
    mk("fav", "mdi:heart", "Preferite", this._favs ? this._favs.length : "");
    mk("all", "mdi:radio-tower", "Tutte", this._data ? this._data.length : "");
  }

  _logo(s) {
    if (!s.l) return null;
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    img.src = `/local/radio/logo/${s.id}.png`;
    img.addEventListener("error", () => img.remove());
    return img;
  }

  _list() {
    if (!this._data) return [];
    const q = (this._query || "").trim().toLowerCase();
    let list = this._tab === "fav"
      ? (this._favs || []).map((k) => this._byKey.get(k)).filter(Boolean)
      : this._data;
    if (q) list = list.filter((s) => s._q.includes(q));
    return list;
  }

  _renderList() {
    if (!this._root || this._tab === undefined) return;
    const body = this._root.querySelector(".body");
    body.innerHTML = "";
    const status = (txt) => { const d = document.createElement("div"); d.className = "status"; d.textContent = txt; body.appendChild(d); };
    if (this._error && !this._data) { status("Impossibile leggere l'elenco delle radio: " + this._error); return; }
    if (!this._data) { status("Caricamento radio…"); return; }
    const list = this._list();
    if (!list.length) {
      status(this._query ? "Nessuna radio trovata"
        : "Nessuna preferita: tocca il cuore su una radio in \"Tutte\" per aggiungerla qui.");
      return;
    }
    const favs = new Set(this._favs || []);
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const s of list.slice(0, this._limit)) {
      const el = document.createElement("div");
      el.className = "st" + (this._sel && this._sel.k === s.k ? " sel" : "");
      el.dataset.k = s.k;
      el.title = s.n + (s.t && s.t.length ? " · " + s.t.join(", ") : "");
      const fav = document.createElement("button");
      fav.className = "fav" + (favs.has(s.k) ? " on" : "");
      fav.title = favs.has(s.k) ? "Togli dalle preferite" : "Aggiungi alle preferite";
      fav.innerHTML = `<ha-icon icon="${favs.has(s.k) ? "mdi:heart" : "mdi:heart-outline"}"></ha-icon>`;
      fav.addEventListener("click", (ev) => { ev.stopPropagation(); this._toggleFav(s); });
      const logo = document.createElement("div");
      logo.className = "logo";
      const img = this._logo(s);
      if (img) logo.appendChild(img);
      else { const ic = document.createElement("ha-icon"); ic.setAttribute("icon", "mdi:radio"); logo.appendChild(ic); }
      const name = document.createElement("div");
      name.className = "sn";
      name.textContent = s.n;
      const tg = document.createElement("div");
      tg.className = "tg";
      tg.textContent = (s.t || []).slice(0, 3).join(" · ");
      el.append(fav, logo, name, tg);
      el.addEventListener("click", () => this._openPlay(s));
      grid.appendChild(el);
    }
    body.appendChild(grid);
    if (list.length > this._limit) {
      const m = document.createElement("div");
      m.className = "more";
      const b = document.createElement("button");
      b.textContent = `Mostra altre (${list.length - this._limit})`;
      b.addEventListener("click", () => { this._limit += RC_PAGE * 2; this._renderList(); });
      m.appendChild(b);
      body.appendChild(m);
    }
    this._markLive();
  }

  _markLive() {
    if (!this._root) return;
    const live = RC_PLAYER.station && !RC_PLAYER.audio.paused ? RC_PLAYER.station.k : null;
    for (const el of this._root.querySelectorAll(".st")) el.classList.toggle("live", el.dataset.k === live);
  }

  // Dispositivi di config più "Questo dispositivo" (browser)
  _devices() {
    const h = this._hass;
    const out = [];
    for (const d of this._config.devices || []) {
      if (!d || !d.entity) continue;
      const s = h && h.states[d.entity];
      out.push({
        id: d.entity, entity: d.entity, mode: ["url", "shelly"].includes(d.mode) ? d.mode : "alexa",
        name: d.name || (s && s.attributes.friendly_name) || d.entity, icon: d.icon || "mdi:speaker",
        state: s ? s.state : "unavailable",
        title: s ? [s.attributes.media_title, s.attributes.media_artist].filter(Boolean).join(" · ") : "",
        volume: s && s.attributes.volume_level != null ? s.attributes.volume_level : null,
        features: s ? s.attributes.supported_features || 0 : 0,
      });
    }
    if (this._config.browser) {
      const a = RC_PLAYER.audio;
      out.push({
        id: RC_BROWSER, mode: RC_BROWSER, name: "Questo dispositivo", icon: "mdi:cellphone-sound",
        state: RC_PLAYER.station ? (a.paused ? "paused" : "playing") : "idle",
        title: RC_PLAYER.station ? RC_PLAYER.station.n : "", volume: a.volume, features: -1,
      });
    }
    return out;
  }

  _renderNow() {
    if (!this._root) return;
    const box = this._root.querySelector(".now");
    const devs = this._devices();
    this._nowSig = devs.map((d) => `${d.id}:${d.state}:${d.title}:${d.volume}`).join("|");
    const active = devs.filter((d) => d.state === "playing" || (d.state === "paused" && d.mode === RC_BROWSER));
    // non ricostruire mentre si trascina il volume
    if (box.contains(this._root.activeElement) && this._root.activeElement.type === "range") return;
    box.innerHTML = "";
    for (const d of active) {
      const row = document.createElement("div");
      row.className = "np";
      const err = d.mode === RC_BROWSER && RC_PLAYER.error;
      row.innerHTML = `<ha-icon class="eq" icon="${d.state === "playing" ? "mdi:waveform" : "mdi:pause-circle-outline"}"></ha-icon>
        <div class="tx"><div class="d"></div><div class="s${err ? " err" : ""}"></div></div>`;
      row.querySelector(".d").textContent = d.name;
      row.querySelector(".s").textContent = err || d.title || "In riproduzione";
      if (d.volume != null) {
        const v = document.createElement("input");
        v.type = "range"; v.min = 0; v.max = 100; v.step = 1; v.value = Math.round(d.volume * 100);
        v.title = "Volume";
        v.addEventListener("change", () => this._volume(d, v.value / 100));
        row.appendChild(v);
      }
      const btn = (icon, title, fn) => {
        const b = document.createElement("button");
        b.title = title;
        b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>`;
        b.addEventListener("click", fn);
        row.appendChild(b);
      };
      if (d.mode === RC_BROWSER) {
        btn(d.state === "playing" ? "mdi:pause" : "mdi:play", d.state === "playing" ? "Pausa" : "Riprendi",
          () => (RC_PLAYER.audio.paused ? RC_PLAYER.audio.play().catch(() => {}) : RC_PLAYER.audio.pause()));
      }
      btn("mdi:stop", "Ferma", () => this._stop(d));
      box.appendChild(row);
    }
  }

  async _volume(d, v) {
    if (d.mode === RC_BROWSER) { RC_PLAYER.audio.volume = v; return; }
    try { await this._hass.callService("media_player", "volume_set", { entity_id: d.entity, volume_level: v }); } catch (e) { /* ignorato */ }
  }

  async _stop(d) {
    if (d.mode === RC_BROWSER) {
      this._browserStop();
      return;
    }
    const STOP = 4096;
    try {
      await this._hass.callService("media_player", d.features & STOP ? "media_stop" : "media_pause", { entity_id: d.entity });
    } catch (e) { /* ignorato */ }
  }

  _browserStop() {
    const p = RC_PLAYER;
    if (p.hls) { p.hls.destroy(); p.hls = null; }
    p.audio.pause();
    p.audio.removeAttribute("src");
    p.audio.load();
    p.station = null;
    p.error = "";
    p.notify();
  }

  // Flussi del browser: in una pagina HTTPS (Nabu Casa) i flussi http sono bloccati dal browser
  _browserUrls(s) {
    const all = [s.u, ...(s.alt || [])];
    return location.protocol === "https:" ? all.filter((u) => u.startsWith("https://")) : all;
  }

  async _browserPlay(s) {
    const urls = this._browserUrls(s);
    if (!urls.length) throw new Error("questa radio ha solo flussi http: da fuori casa (Nabu Casa) il browser non li apre. Usa un Echo o il Wall Display.");
    this._browserStop();
    const p = RC_PLAYER;
    p.station = s;
    let last;
    for (const u of urls) {
      try {
        const isHls = /\.m3u8(\?|$)/i.test(u);
        if (isHls && !p.audio.canPlayType("application/vnd.apple.mpegurl")) {
          const Hls = await rcLoadHls();
          if (!Hls.isSupported()) throw new Error("HLS non supportato");
          p.hls = new Hls();
          p.hls.on(Hls.Events.ERROR, (ev, data) => {
            if (data && data.fatal) { p.error = "Il flusso si è interrotto."; p.notify(); }
          });
          p.hls.loadSource(u);
          p.hls.attachMedia(p.audio);
        } else {
          p.audio.src = u;
        }
        p.error = "";
        await p.audio.play();
        p.notify();
        return;
      } catch (e) {
        last = e;
        if (p.hls) { p.hls.destroy(); p.hls = null; }
      }
    }
    p.station = null;
    p.notify();
    throw new Error((last && last.name === "NotAllowedError") ? "il browser ha bloccato l'audio, tocca di nuovo Ascolta" : "nessun flusso funziona su questo dispositivo");
  }

  // Il Wall Display Shelly non accetta URL: suona solo le radio dei suoi preferiti (id numerico),
  // che si aggiungono dal display (Media › Radio). Si cerca quella con lo stesso nome.
  async _shellyPlay(dev, s) {
    const norm = (t) => (t || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const r = await this._hass.callWS({
      type: "media_player/browse_media", entity_id: dev.entity, media_content_id: "radio", media_content_type: "radio",
    });
    const list = (r && r.children) || [];
    const k = norm(s.n);
    const hit = list.find((c) => norm(c.title) === k)
      || list.find((c) => { const t = norm(c.title); return t && (t.includes(k) || k.includes(t)); });
    if (!hit) {
      throw new Error(`"${s.n}" non è tra le radio del ${dev.name}. Aggiungila dal display (Media › Radio, cuore) e riprova.`
        + (list.length ? ` Ora ha: ${list.map((c) => c.title).join(", ")}.` : ""));
    }
    await this._hass.callService("media_player", "play_media", {
      entity_id: dev.entity, media_content_id: hit.media_content_id, media_content_type: "radio",
    });
  }

  _openPlay(s) {
    this._sel = s;
    const p = this._root.querySelector(".play");
    p.innerHTML = `
      <div class="top">
        <div class="mini"></div>
        <div style="flex:1;min-width:0"><div class="pt"></div><div class="pk"></div></div>
        <button class="x" title="Chiudi"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <label>Ascolta su</label>
      <div class="devs"></div>
      <div class="msg" hidden></div>
      <div class="acts"><button class="go" disabled><ha-icon icon="mdi:play"></ha-icon><span>Ascolta</span></button></div>`;
    const img = this._logo(s);
    if (img) p.querySelector(".mini").appendChild(img);
    else p.querySelector(".mini").innerHTML = `<ha-icon icon="mdi:radio"></ha-icon>`;
    p.querySelector(".pt").textContent = s.n;
    p.querySelector(".pk").textContent = [(s.t || []).slice(0, 4).join(", "), s.c && s.b ? `${s.c} ${s.b} kbps` : s.c].filter(Boolean).join(" · ");
    p.querySelector("button.x").addEventListener("click", () => this._closePlay());
    p.querySelector("button.go").addEventListener("click", () => this._play());
    p.classList.add("open");
    this._renderDevices();
    this._renderList();
    p.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
    const usable = (d) => d.state !== "unavailable";
    if (!devs.some((d) => d.id === this._dev && usable(d))) {
      let last = "";
      try { last = localStorage.getItem(RC_LAST_DEV) || ""; } catch (e) { /* storage non disponibile */ }
      this._dev = (devs.find((d) => d.id === last && usable(d)) || devs.find(usable) || {}).id;
    }
    box.innerHTML = "";
    for (const d of devs) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "dev" + (d.id === this._dev ? " on" : "");
      b.disabled = !usable(d);
      b.title = !usable(d) ? "Non raggiungibile" : d.state === "playing" && d.title ? "Sta suonando: " + d.title : "";
      b.innerHTML = `<ha-icon icon="${d.state === "playing" ? "mdi:waveform" : d.icon}"></ha-icon><span></span>`;
      b.querySelector("span").textContent = d.name;
      b.addEventListener("click", () => { this._dev = d.id; this._renderDevices(); });
      box.appendChild(b);
    }
    const go = p.querySelector("button.go");
    if (go) go.disabled = !this._dev || !!this._playing;
  }

  _showMsg(txt, err) {
    const m = this._root && this._root.querySelector(".play .msg");
    if (!m) return;
    m.hidden = !txt;
    m.className = "msg" + (err ? " err" : "");
    m.textContent = txt || "";
  }

  async _play() {
    const s = this._sel;
    const dev = this._devices().find((d) => d.id === this._dev);
    if (!s || !dev) return;
    this._playing = true;
    this._renderDevices();
    this._showMsg("Avvio…");
    try {
      if (dev.mode === RC_BROWSER) {
        await this._browserPlay(s);
      } else if (dev.mode === "shelly") {
        await this._shellyPlay(dev, s);
      } else if (dev.mode === "url") {
        await this._hass.callService("media_player", "play_media", {
          entity_id: dev.entity, media_content_id: s.u, media_content_type: "music",
        });
      } else {
        await this._hass.callService("media_player", "play_media", {
          entity_id: dev.entity, media_content_id: s.n, media_content_type: this._config.alexa_type,
        });
      }
      this._showMsg(`▶ ${s.n} su ${dev.name}`);
      try { localStorage.setItem(RC_LAST_DEV, dev.id); } catch (e) { /* storage non disponibile */ }
      this._closeTimer = setTimeout(() => { if (this._sel === s) this._closePlay(); }, 2500);
    } catch (e) {
      this._showMsg("Non riesco ad avviarla: " + ((e && (e.message || e.code)) || e), true);
    } finally {
      this._playing = false;
      this._renderDevices();
    }
  }

  getCardSize() { return 10; }

  getGridOptions() { return { columns: "full", rows: "auto" }; }
}

if (!customElements.get("radio-card")) {
  customElements.define("radio-card", RadioCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "radio-card")) {
  window.customCards.push({
    type: "radio-card",
    name: "Radio",
    description: "Radio italiane con preferite e ascolto su Echo, Wall Display o nel browser",
  });
}
