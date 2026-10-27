/* qbit-search-card v1.5.0 — ricerca con i plugin di qBittorrent, filtro per categoria e per lingua (solo ITA) e scelta della cartella di download (Film, Serie TV, Musica, Giochi) */
const QSC_STYLE = `
:host { display: block; }
ha-card {
  background: var(--qa-card-bg, linear-gradient(158deg, #0D1720 0%, #070D13 100%));
  border: var(--qa-card-border, 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent));
  border-radius: var(--qa-radius, 14px);
  box-shadow: var(--qa-card-shadow, inset 0 0 24px color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent), 0 4px 20px color-mix(in srgb, var(--qa-shade, #000) 70%, transparent));
  padding: 18px 20px 14px;
  color: var(--qa-text, #C8F4FA);
  backdrop-filter: var(--qa-blur, none);
  -webkit-backdrop-filter: var(--qa-blur, none);
  font-family: var(--qa-font, inherit);
}
.head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.title { display: flex; align-items: center; gap: 10px; }
.title ha-icon { color: var(--qa-glow, #4DE8F4); --mdc-icon-size: 24px; filter: drop-shadow(0 0 6px color-mix(in srgb, var(--qa-glow, #4DE8F4) 80%, transparent)); }
.title span { font-size: 14px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.u { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; text-align: right; }
form { display: flex; gap: 8px; margin: 16px 0 6px; }
input.q { flex: 1; min-width: 0; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px;
  color: var(--qa-text, #C8F4FA); font-size: 15px; padding: 10px 16px; outline: none; }
input.q:focus { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 70%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 20%, transparent); }
input.q::placeholder { color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); }
button { font-family: inherit; }
button.go { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA);
  font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 0 18px; cursor: pointer; }
button.go:hover { box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
button.go[disabled] { opacity: 0.5; cursor: default; box-shadow: none; }
.cats { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 8px; scrollbar-width: none; }
.cats::-webkit-scrollbar { display: none; }
button.cat { flex: none; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent);
  font-size: 12px; letter-spacing: 0.03em; padding: 5px 12px; cursor: pointer; transition: all 150ms ease; }
button.cat:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 50%, transparent); }
button.cat.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); color: var(--qa-text, #C8F4FA); }
button.cat.lang { display: flex; align-items: center; gap: 4px; font-weight: 600; }
button.cat.lang ha-icon { --mdc-icon-size: 15px; }
.cats .sep { flex: none; width: 1px; margin: 3px 2px; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); }
.status button.more { margin-top: 10px; }
.pick { display: none; margin: 8px 0 6px; padding: 14px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.pick.open { display: block; }
.pick .pn { font-size: 13px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; word-break: break-word; margin-bottom: 12px; }
.pick label { display: block; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); margin-bottom: 6px; }
.pick select, .pick input { width: 100%; box-sizing: border-box; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent);
  border-radius: 10px; color: var(--qa-text, #C8F4FA); font-family: inherit; font-size: 14px; padding: 9px 12px; outline: none; }
.pick select:focus, .pick input:focus { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 70%, transparent); }
.pick select option { background: var(--qa-solid, #0D1720); color: var(--qa-text, #C8F4FA); }
.pick input { margin-top: 8px; }
.pick input[hidden] { display: none; }
.pick .path { margin-top: 8px; font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); word-break: break-all; }
.pick .acts { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
.pick button.go { padding: 8px 18px; }
button.ghost { background: none; border: 1px solid color-mix(in srgb, var(--qa-faint, #5F8794) 50%, transparent); border-radius: 999px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent);
  font-size: 13px; padding: 8px 16px; cursor: pointer; }
.row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 10%, transparent); }
.row:first-child { border-top: none; }
.row.sel .name { color: var(--qa-acc, #7FF0FA); }
.info { flex: 1; min-width: 0; }
.name { font-size: 14px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; word-break: break-word;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.sub { margin-top: 5px; display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent);
  letter-spacing: 0.03em; font-variant-numeric: tabular-nums; }
.sub .s { color: var(--qa-glow, #4DE8F4); }
.sub a { color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); text-decoration: none; }
.sub a:hover { text-decoration: underline; }
.sub .dest { color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); }
button.dl { flex: none; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 35%, transparent); border-radius: 10px; color: var(--qa-glow, #4DE8F4);
  padding: 8px; cursor: pointer; display: flex; transition: all 200ms ease; }
button.dl:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
button.dl.ok { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); cursor: default; }
button.dl.err { border-color: rgba(255,158,27,0.85); color: #FF9E1B; }
button.dl[disabled] { cursor: default; }
.status { padding: 22px 0 12px; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); font-size: 14px; }
.status.err { color: #FF9E1B; }
.status.ok { color: var(--qa-acc, #7FF0FA); }
.status.ok b { color: var(--qa-text, #C8F4FA); font-weight: 600; word-break: break-word; }
.more { display: block; margin: 6px auto 4px; background: none; border: none; color: var(--qa-acc, #7FF0FA); font-size: 12px;
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer; }
`;

// Filtro "Solo ITA": scelta ricordata nel browser
const QSC_ONLY_ITA = "qbit-search-card.only-ita";
const QSC_ITA_WORDS = ["ita", "italian", "italiano"];
const QSC_SUB_WORDS = ["sub", "subs", "subbed", "sottotitoli", "sottotitolato"];

const QSC_SVC = {
  start: "qbittorrent_cerca_avvia",
  results: "qbittorrent_cerca_risultati",
  remove: "qbittorrent_cerca_elimina",
  add: "qbittorrent_aggiungi",
  plugins: "qbittorrent_cerca_plugin",
  dirs: "qbittorrent_cartelle",
  page: "qbittorrent_pagina",
};

// Usate finché non arriva l'elenco dai plugin attivi
const QSC_CATS = [
  { id: "all", name: "Tutte" },
  { id: "movies", name: "Film" },
  { id: "tv", name: "Serie TV" },
];

const qscNorm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");

class QbitSearchCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign(
      {
        title: "Cerca e scarica",
        max_results: 40,
        timeout_seconds: 40,
        film_path: "/downloads/film",
        series_path: "/downloads/serietv",
        games_path: "/downloads/giochi",
        music_path: "/downloads/musica",
      },
      config || {}
    );
    if (!this._state) this._state = { phase: "idle", results: [], shown: 0, added: {}, dest: {}, error: "" };
    if (!this._cats) this._cats = QSC_CATS.slice();
    if (!this._cat) this._cat = "all";
    if (this._onlyIta === undefined) {
      this._onlyIta = true;
      try { this._onlyIta = localStorage.getItem(QSC_ONLY_ITA) !== "0"; } catch (e) { /* storage non disponibile */ }
    }
    if (this._root) this._render();
  }

  // Nome con audio italiano: ITA / iTALiAN / Italiano come parola, ma non "SUB ITA" (solo sottotitoli)
  _isIta(name) {
    const w = String(name || "").toLowerCase().split(/[^a-z0-9]+/);
    return w.some((t, i) => QSC_ITA_WORDS.includes(t) && !QSC_SUB_WORDS.includes(w[i - 1]));
  }

  // Le ROM non dicono quasi mai la lingua: con la categoria giochi il filtro non si applica
  _itaActive() {
    return this._onlyIta && this._state.cat !== "games";
  }

  _visible() {
    const res = this._state.results;
    return this._itaActive() ? res.filter((r) => this._isIta(r.fileName)) : res;
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) this._build();
  }

  // HA stacca e riattacca le card quando ridisegna la plancia (es. sul telefono quando si chiude la tastiera):
  // la ricerca in corso riprende; solo se la card resta staccata a lungo la ricerca viene chiusa
  connectedCallback() {
    if (this._detachTimer) { clearTimeout(this._detachTimer); this._detachTimer = null; }
    const st = this._state;
    if (st && st.phase === "searching" && this._searchId !== undefined && !this._timer && !this._polling) this._poll(this._token);
  }

  disconnectedCallback() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (this._detachTimer) clearTimeout(this._detachTimer);
    this._detachTimer = setTimeout(() => {
      this._detachTimer = null;
      this._stopPolling(true);
      this._token = (this._token || 0) + 1;
      const st = this._state;
      if (st && st.phase === "searching") st.phase = st.results.length ? "done" : "idle";
      this._render();
    }, 30000);
  }

  _build() {
    if (this._root) return;
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${QSC_STYLE}</style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:magnify-scan"></ha-icon><span class="t"></span></div>
          <div class="u"></div>
        </div>
        <form>
          <input class="q" type="search" placeholder="Film, serie o gioco…" enterkeyhint="search" />
          <button class="go" type="submit">Cerca</button>
        </form>
        <div class="cats"></div>
        <div class="pick"></div>
        <div class="body"></div>
      </ha-card>`;
    this._root = sr;
    sr.querySelector("form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      const q = sr.querySelector("input.q").value.trim();
      if (q) this._search(q);
    });
    this._renderCats();
    this._render();
    this._loadCats();
  }

  async _call(service, data, meta) {
    const res = await this._hass.callService("rest_command", service, data, undefined, false, true);
    const r = (res && res.response) || {};
    if (meta) {
      // qBittorrent 5 lega la ricerca alla sessione: serve il cookie per results/delete
      const h = r.headers || {};
      const m = String(h["Set-Cookie"] || h["set-cookie"] || "").match(/QBT_SID_\d+=[^;]+/);
      meta.sid = m ? m[0] : "";
    }
    let content = r.content;
    if (typeof content === "string") {
      try { content = JSON.parse(content); } catch (e) { /* testo semplice */ }
    }
    if (r.status && (r.status < 200 || r.status >= 300)) {
      const err = new Error(`qBittorrent ha risposto ${r.status}`);
      err.status = r.status;
      throw err;
    }
    return content;
  }

  // Come _call, ma se HA non risponde entro ms (es. connessione persa) dà errore invece di restare in attesa
  _callT(service, data, meta, ms) {
    let t;
    const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error("qBittorrent non risponde, riprova")), ms || 15000); });
    return Promise.race([this._call(service, data, meta), timeout]).finally(() => clearTimeout(t));
  }

  _errText(e) {
    const msg = (e && (e.message || e.code)) || String(e);
    if (/not found|unknown service|service_not_found|not_found/i.test(msg)) {
      return "Ricerca non ancora configurata sul server (mancano i comandi rest_command per qBittorrent).";
    }
    if (e && (e.status === 401 || e.status === 403)) {
      return "qBittorrent ha rifiutato la richiesta: va abilitato l'accesso da Home Assistant.";
    }
    if (e && e.status === 409) {
      return "qBittorrent ha già troppe ricerche in corso: riprova tra poco.";
    }
    return "Errore: " + msg;
  }

  // Categorie supportate dai plugin di ricerca attivi in qBittorrent
  async _loadCats() {
    try {
      const plugins = await this._call(QSC_SVC.plugins, {});
      const seen = new Map();
      for (const p of plugins || []) {
        if (!p.enabled) continue;
        for (const c of p.supportedCategories || []) {
          if (c && c.id && !seen.has(c.id)) seen.set(c.id, c.id === "all" ? "Tutte" : c.name || c.id);
        }
      }
      if (!seen.size) return;
      if (!seen.has("all")) seen.set("all", "Tutte");
      const cats = [...seen].map(([id, name]) => ({ id, name }));
      cats.sort((a, b) => (a.id === "all" ? -1 : b.id === "all" ? 1 : a.name.localeCompare(b.name, "it")));
      this._cats = cats;
      if (!cats.some((c) => c.id === this._cat)) this._cat = "all";
      this._renderCats();
    } catch (e) { /* restano quelle predefinite */ }
  }

  _renderCats() {
    if (!this._root) return;
    const box = this._root.querySelector(".cats");
    box.innerHTML = "";
    const ita = document.createElement("button");
    ita.type = "button";
    ita.className = "cat lang" + (this._onlyIta ? " on" : "");
    ita.title = this._onlyIta ? "Mostra solo i risultati con audio italiano (tocca per vederli tutti)" : "Mostra tutti i risultati (tocca per vedere solo quelli in italiano)";
    ita.innerHTML = `<ha-icon icon="${this._onlyIta ? "mdi:checkbox-marked-circle-outline" : "mdi:checkbox-blank-circle-outline"}"></ha-icon><span>Solo ITA</span>`;
    ita.addEventListener("click", () => this._setOnlyIta(!this._onlyIta));
    box.appendChild(ita);
    const sep = document.createElement("div");
    sep.className = "sep";
    box.appendChild(sep);
    for (const c of this._cats) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cat" + (c.id === this._cat ? " on" : "");
      b.textContent = c.name;
      b.addEventListener("click", () => {
        if (this._cat === c.id) return;
        this._cat = c.id;
        this._renderCats();
        const st = this._state;
        if (st.query && st.phase !== "idle") this._search(st.query);
      });
      box.appendChild(b);
    }
  }

  _setOnlyIta(on) {
    this._onlyIta = on;
    try { localStorage.setItem(QSC_ONLY_ITA, on ? "1" : "0"); } catch (e) { /* storage non disponibile */ }
    this._state.shown = this._config.max_results;
    this._renderCats();
    this._render();
  }

  async _search(query) {
    this._stopPolling(true);
    this._closePicker();
    const token = (this._token = (this._token || 0) + 1);
    this._state = { phase: "searching", query, cat: this._cat, results: [], shown: this._config.max_results, added: {}, dest: {}, error: "" };
    this._render();
    try {
      const meta = {};
      const started = await this._callT(QSC_SVC.start, { testo: query, categoria: this._cat || "all" }, meta, 20000);
      const id = started && started.id;
      if (id === undefined || id === null) throw new Error("risposta inattesa da qBittorrent");
      if (token !== this._token) { this._remove(id, meta.sid); return; }
      this._searchId = id;
      this._sid = meta.sid;
      this._deadline = Date.now() + Math.max(10, Number(this._config.timeout_seconds) || 40) * 1000;
      this._poll(token);
    } catch (e) {
      if (token !== this._token) return;
      this._state.phase = "error";
      this._state.error = this._errText(e);
      this._render();
    }
  }

  async _poll(token) {
    if (token !== this._token || this._searchId === undefined) return;
    let finished = false;
    this._polling = true;
    try {
      let data;
      try { data = await this._callT(QSC_SVC.results, { id: this._searchId, sid: this._sid || "" }); }
      finally { this._polling = false; }
      if (token !== this._token) return;
      const list = (data && data.results) || [];
      const seen = new Set();
      const clean = [];
      for (const r of list) {
        const key = r.fileUrl || r.descrLink || r.fileName;
        if (!key || seen.has(key) || this._isPlaceholder(r)) continue;
        seen.add(key);
        clean.push(r);
      }
      clean.sort((a, b) => (Number(b.nbSeeders) || 0) - (Number(a.nbSeeders) || 0));
      this._state.results = clean;
      finished = (data && data.status === "Stopped") || Date.now() > this._deadline;
    } catch (e) {
      if (token !== this._token) return;
      if (!this._state.results.length) {
        this._state.phase = "error";
        this._state.error = this._errText(e);
        this._render();
        this._stopPolling(true);
        return;
      }
      finished = true;
    }
    if (finished) {
      this._state.phase = "done";
      this._render();
      this._stopPolling(true);
    } else {
      this._render();
      // card staccata: riprende connectedCallback
      if (this.isConnected) this._timer = setTimeout(() => this._poll(token), 1500);
    }
  }

  _remove(id, sid) {
    if (id === undefined || id === null || !this._hass) return;
    this._call(QSC_SVC.remove, { id, sid: sid || "" }).catch(() => {});
  }

  _stopPolling(cleanup) {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    if (cleanup && this._searchId !== undefined) {
      this._remove(this._searchId, this._sid);
      this._searchId = undefined;
      this._sid = undefined;
    }
  }

  // Sottocartelle delle serie, lette da qBittorrent (percorsi visti dal suo container)
  async _loadSeries() {
    const base = this._config.series_path.replace(/\/+$/, "");
    try {
      const list = await this._call(QSC_SVC.dirs, { percorso: base });
      this._series = (Array.isArray(list) ? list : [])
        .map((p) => String(p).split("/").pop())
        .filter((n) => n && !n.startsWith("."))
        .sort((a, b) => a.localeCompare(b, "it"));
    } catch (e) {
      if (!this._series) this._series = [];
    }
    return this._series;
  }

  _cleanName(s) {
    return String(s || "").replace(/[\/\\:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().replace(/^\.+/, "").trim();
  }

  // Nome della serie dal nome del torrent, es. "Stranger.Things.S05E08..." -> "Stranger Things"
  _seriesFromName(fileName) {
    const m = String(fileName || "").match(/^(.+?)[\s._-]+(?:S\d{1,2}(?:E\d{1,3})?|\d{1,2}x\d{2}|Stagione|Season)\b/i);
    if (!m) return "";
    return this._cleanName(m[1].replace(/[._]+/g, " ").replace(/\s*[\[(].*$/, ""));
  }

  _guessDest(item, series) {
    const fromName = this._seriesFromName(item.fileName);
    const findSeries = (txt) => {
      const n = qscNorm(txt);
      if (!n) return null;
      return series.find((s) => qscNorm(s) === n) || series.find((s) => { const k = qscNorm(s); return k.length > 3 && (n.includes(k) || k.includes(n)); }) || null;
    };
    if (fromName) {
      const s = findSeries(fromName);
      return s ? { value: "s:" + s, name: "" } : { value: "new", name: fromName };
    }
    const cat = this._state.cat;
    // ROM e giochi: categoria "games" del plugin o parole tipiche nel nome/ricerca (importati poi in RomM da ~/romm-ha/importa.py)
    const gameRx = /\b(roms?|nes|snes|n64|gba|gbc|nds|psx|ps1|ps2|psp|mame|neo ?geo|sega|mega ?drive|nintendo|playstation|game ?boy|famicom|emulat\w*)\b/i;
    if (cat === "games" || gameRx.test(item.fileName || "") || gameRx.test(this._state.query || "")) return { value: "giochi", name: "" };
    // Musica: categoria "music" del plugin o formati/parole tipiche nel nome
    const musicRx = /\b(mp3|flac|aac|alac|m4a|ogg|opus|320 ?kbps|discograf\w*|discography|album)\b/i;
    if (cat === "music" || musicRx.test(item.fileName || "")) return { value: "musica", name: "" };
    const s = findSeries(this._state.query);
    if (s && cat !== "movies") return { value: "s:" + s, name: "" };
    if (cat === "tv" || cat === "anime") return { value: "new", name: this._cleanName(this._state.query) };
    return { value: "film", name: "" };
  }

  _destPath(value, name) {
    if (value === "film") return this._config.film_path;
    if (value === "giochi") return this._config.games_path;
    if (value === "musica") return this._config.music_path;
    const base = this._config.series_path.replace(/\/+$/, "");
    if (value && value.startsWith("s:")) return base + "/" + value.slice(2);
    const n = this._cleanName(name);
    return n ? base + "/" + n : "";
  }

  _destLabel(path) {
    const film = this._config.film_path.replace(/\/+$/, "");
    const base = this._config.series_path.replace(/\/+$/, "");
    if (path === film) return "Film";
    if (path === this._config.games_path.replace(/\/+$/, "")) return "Giochi";
    if (path === this._config.music_path.replace(/\/+$/, "")) return "Musica";
    if (path.startsWith(base + "/")) return "Serie TV › " + path.slice(base.length + 1);
    return path;
  }

  async _openPicker(item) {
    const p = this._root.querySelector(".pick");
    this._pickKey = item.fileUrl;
    p.innerHTML = `
      <div class="pn"></div>
      <label>Scarica in</label>
      <select class="dest" disabled><option>Carico le cartelle…</option></select>
      <input class="nuova" type="text" placeholder="Nome della serie" hidden />
      <div class="path"></div>
      <div class="acts">
        <button class="ghost" type="button">Annulla</button>
        <button class="go ok" type="button" disabled>Scarica</button>
      </div>`;
    p.querySelector(".pn").textContent = item.fileName || "";
    p.classList.add("open");
    this._render();
    p.scrollIntoView({ block: "nearest", behavior: "smooth" });

    const sel = p.querySelector("select.dest");
    const inp = p.querySelector("input.nuova");
    const path = p.querySelector(".path");
    const ok = p.querySelector("button.ok");
    p.querySelector("button.ghost").addEventListener("click", () => this._closePicker());

    const series = await this._loadSeries();
    if (this._pickKey !== item.fileUrl) return;
    sel.innerHTML = "";
    const opt = (value, text) => { const o = document.createElement("option"); o.value = value; o.textContent = text; sel.appendChild(o); };
    opt("film", "Film");
    for (const s of series) opt("s:" + s, "Serie TV › " + s);
    opt("new", "Serie TV › nuova serie…");
    opt("musica", "Musica");
    opt("giochi", "Giochi (ROM)");
    sel.disabled = false;

    const guess = this._guessDest(item, series);
    sel.value = guess.value;
    inp.value = guess.name;

    const update = () => {
      inp.hidden = sel.value !== "new";
      const dest = this._destPath(sel.value, inp.value);
      path.textContent = dest ? "→ " + dest : "Scrivi il nome della serie";
      ok.disabled = !dest;
      return dest;
    };
    sel.addEventListener("change", () => { update(); if (sel.value === "new") inp.focus(); });
    inp.addEventListener("input", update);
    inp.addEventListener("keydown", (ev) => { if (ev.key === "Enter" && !ok.disabled) ok.click(); });
    ok.addEventListener("click", () => {
      const dest = update();
      if (!dest) return;
      this._closePicker();
      this._download(item, dest);
    });
    update();
  }

  // Righe d'errore dei plugin (es. Jackett non raggiungibile): link senza percorso
  _isPlaceholder(r) {
    const u = String(r.fileUrl || "");
    if (!/^https?:/i.test(u)) return false;
    try { const x = new URL(u); return (x.pathname === "/" || x.pathname === "") && !x.search; } catch (e) { return true; }
  }

  // Alcuni plugin (limetorrents, ilcorsaronero, torrentproject) danno la pagina del torrent, non il file:
  // come fa il plugin, si legge la pagina e se ne estrae il magnet
  async _resolve(url) {
    let u = String(url || "");
    if (/^https?%3A/i.test(u)) { try { u = decodeURIComponent(u); } catch (e) { /* lascia com'è */ } }
    if (/^magnet:/i.test(u) || !/^https?:/i.test(u)) return u;
    let path = "";
    try { path = new URL(u).pathname; } catch (e) { return u; }
    // .torrent diretti e link di Jackett (/dl/...) li scarica qBittorrent da solo
    if (/\.torrent$/i.test(path) || /\/download\//i.test(path) || /^\/dl\//i.test(path)) return u;
    let html;
    try { html = await this._call(QSC_SVC.page, { url: u }); } catch (e) { return u; }
    if (typeof html !== "string") return u;
    let m = html.match(/magnet:\?xt=urn:btih:[^"'<>\s]+/i);
    if (m) return m[0].replace(/&amp;/g, "&");
    m = html.match(/magnet%3A%3Fxt%3Durn%3Abtih%3A[^"'<>\s&]+/i);
    if (m) { try { return decodeURIComponent(m[0]); } catch (e) { /* niente */ } }
    return u;
  }

  _closePicker() {
    this._pickKey = undefined;
    if (!this._root) return;
    const p = this._root.querySelector(".pick");
    p.classList.remove("open");
    p.innerHTML = "";
    this._render();
  }

  async _download(item, dest) {
    const key = item.fileUrl;
    const st = this._state;
    if (!key || st.added[key] === "ok" || st.added[key] === "wait") return;
    st.added[key] = "wait";
    st.dest[key] = dest;
    this._render();
    try {
      const url = await this._resolve(key);
      const res = await this._call(QSC_SVC.add, { url, cartella: dest });
      if ((typeof res === "string" && /fails/i.test(res)) || (res && Number(res.failure_count) > 0)) {
        throw new Error("qBittorrent non ha accettato il torrent");
      }
      if (st !== this._state) return;
      if (this._series && dest.startsWith(this._config.series_path.replace(/\/+$/, "") + "/")) {
        const n = dest.split("/").pop();
        if (!this._series.includes(n)) this._series = [...this._series, n].sort((a, b) => a.localeCompare(b, "it"));
      }
      // Download avviato: si chiude la lista dei risultati
      this._stopPolling(true);
      this._token = (this._token || 0) + 1;
      this._state = { phase: "added", query: st.query, cat: st.cat, results: [], shown: 0, added: {}, dest: {}, error: "",
        addedName: item.fileName || "", addedDest: dest };
      const q = this._root && this._root.querySelector("input.q");
      if (q) q.blur();
    } catch (e) {
      if (st !== this._state) return;
      st.added[key] = "err";
      st.lastAddError = this._errText(e);
    }
    this._render();
  }

  _size(bytes) {
    const b = Number(bytes);
    if (!b || b < 0) return "";
    if (b >= 1073741824) return (b / 1073741824).toFixed(b >= 10737418240 ? 0 : 1).replace(".", ",") + " GB";
    return Math.round(b / 1048576) + " MB";
  }

  _site(r) {
    const src = r.siteUrl || r.descrLink || "";
    try { return new URL(src).hostname.replace(/^www\./, ""); } catch (e) { return r.engineName || ""; }
  }

  _render() {
    if (!this._root) return;
    const st = this._state;
    this._root.querySelector(".t").textContent = this._config.title;
    const go = this._root.querySelector("form button.go");
    go.disabled = st.phase === "searching";
    go.textContent = st.phase === "searching" ? "Cerco…" : "Cerca";
    const vis = this._visible();
    const count = this._itaActive() ? `${vis.length} in italiano su ${st.results.length}` : `${st.results.length} risultati`;
    const u = this._root.querySelector(".u");
    u.textContent = st.phase === "searching" ? `${count}…` : st.phase === "done" ? count : "";

    const body = this._root.querySelector(".body");
    body.innerHTML = "";
    const status = (txt, err) => {
      const d = document.createElement("div");
      d.className = "status" + (err ? " err" : "");
      d.textContent = txt;
      body.appendChild(d);
    };
    if (st.phase === "idle") { status("Scrivi un titolo: i risultati arrivano dai plugin di ricerca attivi in qBittorrent."); return; }
    if (st.phase === "error") { status(st.error, true); return; }
    if (st.phase === "added") {
      const d = document.createElement("div");
      d.className = "status ok";
      d.innerHTML = 'Download avviato: <b></b><br><span></span>';
      d.querySelector("b").textContent = st.addedName;
      d.querySelector("span").textContent = "→ " + this._destLabel(st.addedDest);
      body.appendChild(d);
      return;
    }
    if (!st.results.length) {
      const cat = this._cats.find((c) => c.id === st.cat);
      const inCat = cat && cat.id !== "all" ? ` in ${cat.name}` : "";
      status(st.phase === "searching" ? `Cerco "${st.query}"${inCat}…` : `Nessun risultato per "${st.query}"${inCat}`);
      return;
    }
    if (!vis.length) {
      status(st.phase === "searching"
        ? `Cerco "${st.query}"… finora nessun risultato in italiano.`
        : `Nessuno dei ${st.results.length} risultati è in italiano. Prova ad aggiungere "ITA" alla ricerca (es. "${st.query} ITA").`);
      if (st.phase !== "searching") {
        const all = document.createElement("button");
        all.className = "more";
        all.textContent = "Mostra tutti i risultati";
        all.addEventListener("click", () => this._setOnlyIta(false));
        body.lastChild.appendChild(all);
      }
      return;
    }
    if (st.lastAddError && Object.values(st.added).includes("err")) status(st.lastAddError, true);

    const list = document.createElement("div");
    for (const r of vis.slice(0, st.shown)) {
      const row = document.createElement("div");
      row.className = "row" + (this._pickKey && this._pickKey === r.fileUrl ? " sel" : "");
      const info = document.createElement("div");
      info.className = "info";
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = r.fileName || "";
      name.title = r.fileName || "";
      const sub = document.createElement("div");
      sub.className = "sub";
      const size = this._size(r.fileSize);
      if (size) { const s = document.createElement("span"); s.textContent = size; sub.appendChild(s); }
      const seeds = document.createElement("span");
      seeds.innerHTML = '<span class="s"></span> fonti · <span class="l"></span> peer';
      seeds.querySelector(".s").textContent = Number(r.nbSeeders) >= 0 ? r.nbSeeders : "?";
      seeds.querySelector(".l").textContent = Number(r.nbLeechers) >= 0 ? r.nbLeechers : "?";
      sub.appendChild(seeds);
      const site = this._site(r);
      if (site) {
        if (r.descrLink && /^https?:/i.test(r.descrLink)) {
          const a = document.createElement("a");
          a.href = r.descrLink; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = site;
          sub.appendChild(a);
        } else {
          const s = document.createElement("span"); s.textContent = site; sub.appendChild(s);
        }
      }
      const stAdd = st.added[r.fileUrl];
      if (stAdd === "ok" && st.dest[r.fileUrl]) {
        const d = document.createElement("span");
        d.className = "dest";
        d.textContent = "→ " + this._destLabel(st.dest[r.fileUrl]);
        sub.appendChild(d);
      }
      info.appendChild(name);
      info.appendChild(sub);
      const btn = document.createElement("button");
      btn.className = "dl";
      if (stAdd === "ok") {
        btn.classList.add("ok"); btn.disabled = true; btn.title = "Aggiunto a qBittorrent";
        btn.innerHTML = '<ha-icon icon="mdi:check"></ha-icon>';
      } else if (stAdd === "wait") {
        btn.disabled = true;
        btn.innerHTML = '<ha-icon icon="mdi:timer-sand"></ha-icon>';
      } else {
        if (stAdd === "err") btn.classList.add("err");
        btn.title = "Scarica con qBittorrent";
        btn.innerHTML = '<ha-icon icon="mdi:download"></ha-icon>';
        if (r.fileUrl) btn.addEventListener("click", () => this._openPicker(r));
        else btn.disabled = true;
      }
      row.appendChild(info);
      row.appendChild(btn);
      list.appendChild(row);
    }
    body.appendChild(list);
    if (vis.length > st.shown) {
      const more = document.createElement("button");
      more.className = "more";
      more.textContent = `Mostra altri (${vis.length - st.shown})`;
      more.addEventListener("click", () => { st.shown += this._config.max_results; this._render(); });
      body.appendChild(more);
    }
  }

  getCardSize() { return 6; }

  getGridOptions() { return { columns: "full", rows: "auto" }; }
}

if (!customElements.get("qbit-search-card")) {
  customElements.define("qbit-search-card", QbitSearchCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "qbit-search-card")) {
  window.customCards.push({
    type: "qbit-search-card",
    name: "Ricerca qBittorrent",
    description: "Cerca con i plugin di qBittorrent, filtra per categoria e scegli la cartella di download",
  });
}
