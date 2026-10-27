/* livetv-card v1.0.0 — canali Live TV di Jellyfin (hdhriptv) divisi per gruppi di numerazione, programma in onda, avvio sulla TV */
const LTC_STYLE = `
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
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.ch { cursor: pointer; min-width: 0; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--qa-shade, #000) 25%, transparent);
  padding: 10px; display: flex; flex-direction: column; gap: 8px; transition: all 220ms ease; }
.ch:hover, .ch.sel { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
.logo { position: relative; height: 54px; display: flex; align-items: center; justify-content: center; }
.logo img { max-width: 100%; max-height: 54px; object-fit: contain; display: block; }
.logo ha-icon { --mdc-icon-size: 30px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.num { position: absolute; top: -4px; left: -2px; font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
.cn { font-size: 13px; font-weight: 600; color: var(--qa-text, #C8F4FA); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pg { font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); line-height: 1.3; min-height: 31px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pg.none { color: color-mix(in srgb, var(--qa-faint, #5F8794) 80%, transparent); }
.prog { height: 3px; border-radius: 2px; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); overflow: hidden; }
.prog div { height: 100%; background: var(--qa-glow, #4DE8F4); box-shadow: 0 0 6px color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); }
.status { padding: 30px 0; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); font-size: 14px; line-height: 1.5; }
.play { display: none; margin: 0 0 16px; padding: 14px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.play.open { display: block; }
.play .top { display: flex; gap: 12px; align-items: center; }
.play .mini { flex: none; width: 64px; height: 40px; display: flex; align-items: center; justify-content: center; }
.play .mini img { max-width: 100%; max-height: 100%; object-fit: contain; }
.play .pt { flex: 1; min-width: 0; font-size: 15px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; word-break: break-word; }
.play .pk { margin-top: 3px; font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); }
.play button.x { flex: none; background: none; border: none; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 70%, transparent); cursor: pointer; padding: 2px; display: flex; }
.play label { display: block; margin: 14px 0 6px; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.play .devs { display: flex; gap: 8px; flex-wrap: wrap; }
.play button.dev { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); border-radius: 999px;
  color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); font-family: inherit; font-size: 13px; padding: 7px 14px; cursor: pointer; transition: all 150ms ease; }
.play button.dev ha-icon { --mdc-icon-size: 16px; }
.play button.dev.on { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); color: var(--qa-text, #C8F4FA); }
.play .hint { font-size: 13px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); line-height: 1.4; }
.play .msg { margin-top: 12px; font-size: 13px; color: var(--qa-acc, #7FF0FA); }
.play .msg.err { color: #FF9E1B; }
.play .acts { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.play button.go { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA);
  font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 18px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; }
.play button.go ha-icon { --mdc-icon-size: 18px; }
.play button.go[disabled] { opacity: 0.45; cursor: default; }
`;

// Ultimo dispositivo e ultima scheda usati; solo comodità locale del browser
const LTC_LAST_DEV = "livetv-card.last-device";
const LTC_LAST_TAB = "livetv-card.last-tab";

class LiveTvCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign(
      {
        title: "TV in diretta",
        service: "rest_command.jellyfin_livetv_canali",
        refresh_minutes: 5,
        groups: [{ name: "Tutti", from: 0, to: 99999 }],
        empty_text: "Nessun canale",
      },
      config || {}
    );
    if (this._tab === undefined) {
      let t = 0;
      try { t = Number(localStorage.getItem(LTC_LAST_TAB)) || 0; } catch (e) { /* storage non disponibile */ }
      this._tab = t < this._config.groups.length ? t : 0;
    }
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
    if (this._tick) { clearInterval(this._tick); this._tick = null; }
  }

  _period() {
    return Math.max(1, Number(this._config.refresh_minutes) || 5) * 60000;
  }

  _stale() {
    if (!this._updated) return true;
    if (Date.now() - this._updated.getTime() > this._period()) return true;
    // un programma è finito: la guida va riletta
    return (this._data || []).some((c) => c.end && c.end < Date.now());
  }

  _startTimer() {
    if (!this._timer) this._timer = setInterval(() => this._load(), this._period());
    // ogni minuto: barre di avanzamento e cambio programma
    if (!this._tick) this._tick = setInterval(() => { if (this._stale()) this._load(); else this._renderList(); }, 60000);
  }

  _build() {
    if (this._root) return;
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${LTC_STYLE}</style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:television-classic"></ha-icon><span class="t"></span></div>
          <div class="meta">
            <div><div class="n"></div><div class="u"></div></div>
            <button class="ref" title="Aggiorna ora"><ha-icon icon="mdi:refresh"></ha-icon></button>
          </div>
        </div>
        <div class="bar"><span class="tabs" style="display:contents"></span>
          <input class="q" type="search" placeholder="Cerca canale o programma…" />
        </div>
        <div class="play"></div>
        <div class="body"></div>
      </ha-card>`;
    this._root = sr;
    const q = sr.querySelector("input.q");
    q.value = this._query;
    q.addEventListener("input", () => { this._query = q.value; this._renderList(); });
    sr.querySelector("button.ref").addEventListener("click", () => this._load());
    this._renderAll();
  }

  async _load() {
    if (this._loading || !this._hass) return;
    this._loading = true;
    this._error = null;
    this._renderMeta();
    try {
      const [domain, service] = this._config.service.split(".");
      const res = await this._hass.callWS({
        type: "call_service", domain, service, service_data: {}, return_response: true,
      });
      const r = res && res.response;
      if (!r || r.status !== 200 || !r.content || !Array.isArray(r.content.Items)) {
        throw new Error(r ? "Jellyfin ha risposto " + r.status : "nessuna risposta");
      }
      this._data = r.content.Items.map((c) => {
        const p = c.CurrentProgram || null;
        const start = p && p.StartDate ? Date.parse(p.StartDate) : 0;
        const end = p && p.EndDate ? Date.parse(p.EndDate) : 0;
        return {
          id: c.Id,
          name: c.Name || "",
          num: parseFloat(c.ChannelNumber || c.Number) || 0,
          numText: c.ChannelNumber || c.Number || "",
          program: p && p.Name && p.Name !== "No Data" ? p.Name : "",
          start, end,
        };
      }).sort((a, b) => a.num - b.num || a.name.localeCompare(b.name, "it"));
      this._updated = new Date();
    } catch (e) {
      this._error = (e && (e.message || e.code)) || String(e);
    } finally {
      this._loading = false;
      this._renderAll();
      if (this._sel) this._refreshPlayHead();
    }
  }

  _group(i) {
    const g = this._config.groups[i] || {};
    const from = Number(g.from ?? 0);
    const to = Number(g.to ?? 99999);
    return (this._data || []).filter((c) => c.num >= from && c.num <= to);
  }

  _renderAll() {
    if (!this._root) return;
    this._root.querySelector(".t").textContent = this._config.title;
    const tabs = this._root.querySelector(".tabs");
    tabs.innerHTML = "";
    if (this._config.groups.length > 1) {
      this._config.groups.forEach((g, i) => {
        const b = document.createElement("button");
        b.className = "tab" + (i === this._tab ? " on" : "");
        b.textContent = g.name || "Canali";
        const c = document.createElement("span");
        c.className = "c";
        c.textContent = this._data ? this._group(i).length : "";
        b.appendChild(c);
        b.addEventListener("click", () => {
          this._tab = i;
          try { localStorage.setItem(LTC_LAST_TAB, String(i)); } catch (e) { /* storage non disponibile */ }
          this._closePlay();
          this._renderAll();
        });
        tabs.appendChild(b);
      });
    }
    this._renderMeta();
    this._renderList();
  }

  _renderMeta() {
    if (!this._root) return;
    this._root.querySelector("button.ref").classList.toggle("spin", !!this._loading);
    this._root.querySelector(".n").textContent = this._data ? `${this._data.length} canali` : "";
    this._root.querySelector(".u").textContent = this._loading
      ? "Aggiornamento…"
      : this._updated
        ? "Guida delle " + this._updated.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })
        : "";
  }

  _logo(c) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    img.src = `/local/jellyfin-tv/${c.id}.png`;
    return img;
  }

  _when(c) {
    if (!c.start || !c.end) return "";
    const f = (t) => new Date(t).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    return `${f(c.start)} – ${f(c.end)}`;
  }

  _renderList() {
    if (!this._root) return;
    const body = this._root.querySelector(".body");
    body.innerHTML = "";
    const status = (txt) => { const d = document.createElement("div"); d.className = "status"; d.textContent = txt; body.appendChild(d); };
    if (this._error && !this._data) { status("Impossibile leggere i canali: " + this._error); return; }
    if (!this._data) { status("Caricamento canali…"); return; }
    const q = (this._query || "").trim().toLowerCase();
    const g = this._config.groups[this._tab] || {};
    const list = this._group(this._tab).filter((c) =>
      !q || c.name.toLowerCase().includes(q) || c.program.toLowerCase().includes(q) || c.numText === q);
    if (!list.length) { status(q ? "Nessun canale trovato" : g.empty_text || this._config.empty_text); return; }
    const now = Date.now();
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const c of list) {
      const el = document.createElement("div");
      el.className = "ch" + (this._sel && this._sel.id === c.id ? " sel" : "");
      el.title = c.program ? `${c.name} · ${c.program} (${this._when(c)})` : c.name;
      const logo = document.createElement("div");
      logo.className = "logo";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = c.numText;
      const ic = document.createElement("ha-icon");
      ic.setAttribute("icon", "mdi:television-classic");
      const img = this._logo(c);
      img.addEventListener("load", () => ic.remove());
      img.addEventListener("error", () => img.remove());
      logo.append(num, ic, img);
      const name = document.createElement("div");
      name.className = "cn";
      name.textContent = c.name;
      const pg = document.createElement("div");
      pg.className = "pg" + (c.program ? "" : " none");
      pg.textContent = c.program || "Guida non disponibile";
      const prog = document.createElement("div");
      prog.className = "prog";
      if (c.start && c.end && c.end > c.start) {
        const pct = Math.max(0, Math.min(100, ((now - c.start) / (c.end - c.start)) * 100));
        const bar = document.createElement("div");
        bar.style.width = pct.toFixed(1) + "%";
        prog.appendChild(bar);
      }
      el.append(logo, name, pg, prog);
      el.addEventListener("click", () => this._openPlay(c));
      grid.appendChild(el);
    }
    body.appendChild(grid);
  }

  // Stessa logica di media-catalog-card: dispositivi in config `devices` (avviati da uno script)
  // più i lettori Jellyfin accesi che accettano play_media; stesso nome = stesso dispositivo.
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

  _openPlay(c) {
    this._sel = c;
    const p = this._root.querySelector(".play");
    p.innerHTML = `
      <div class="top">
        <div class="mini"></div>
        <div style="flex:1;min-width:0"><div class="pt"></div><div class="pk"></div></div>
        <button class="x" title="Chiudi"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <label>Guarda su</label>
      <div class="devs"></div>
      <div class="msg" hidden></div>
      <div class="acts"><button class="go" disabled><ha-icon icon="mdi:play"></ha-icon><span>Guarda</span></button></div>`;
    const img = this._logo(c);
    img.addEventListener("error", () => img.remove());
    p.querySelector(".mini").appendChild(img);
    p.querySelector("button.x").addEventListener("click", () => this._closePlay());
    p.querySelector("button.go").addEventListener("click", () => this._play());
    this._refreshPlayHead();
    p.classList.add("open");
    this._renderDevices();
    this._renderList();
    p.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  _refreshPlayHead() {
    const p = this._root && this._root.querySelector(".play");
    if (!p || !this._sel) return;
    const c = (this._data || []).find((x) => x.id === this._sel.id) || this._sel;
    p.querySelector(".pt").textContent = `${c.numText} · ${c.name}`;
    p.querySelector(".pk").textContent = c.program ? `Ora: ${c.program} (${this._when(c)})` : "Guida non disponibile";
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
      try { last = localStorage.getItem(LTC_LAST_DEV) || ""; } catch (e) { /* storage non disponibile */ }
      this._dev = (devs.find((d) => d.entity_id === last) || devs[0] || {}).entity_id;
    }
    box.innerHTML = "";
    if (!devs.length) {
      const h = document.createElement("div");
      h.className = "hint";
      h.textContent = "Nessun dispositivo Jellyfin acceso: apri l'app Jellyfin sulla TV e riprova.";
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

  _updateGo() {
    const go = this._root && this._root.querySelector(".play button.go");
    if (go) go.disabled = !this._dev || !this._sel || !!this._playing;
  }

  _showMsg(txt, err) {
    const m = this._root && this._root.querySelector(".play .msg");
    if (!m) return;
    m.hidden = !txt;
    m.className = "msg" + (err ? " err" : "");
    m.textContent = txt || "";
  }

  async _play() {
    const c = this._sel;
    const dev = this._devices().find((d) => d.entity_id === this._dev);
    if (!c || !dev) return;
    this._playing = true;
    this._updateGo();
    this._showMsg("Avvio…");
    try {
      const name = dev.attributes.friendly_name || this._dev;
      if (dev.script) {
        await this._hass.callService("script", "turn_on", {
          entity_id: dev.script,
          variables: { media_id: c.id, media_type: "channel" },
        });
        this._showMsg(`▶ ${c.name}: avvio su ${name}. Apro Jellyfin (e se serve accendo il dispositivo), può volerci fino a mezzo minuto.`);
      } else {
        await this._hass.callService("media_player", "play_media", {
          entity_id: this._dev,
          media_content_id: c.id,
          media_content_type: "channel",
        });
        this._showMsg(`▶ ${c.name} avviato su ${name}`);
      }
      try { localStorage.setItem(LTC_LAST_DEV, this._dev); } catch (e) { /* storage non disponibile */ }
      this._closeTimer = setTimeout(() => { if (this._sel === c) this._closePlay(); }, dev.script ? 5000 : 2500);
    } catch (e) {
      this._showMsg("Non riesco ad avviarlo: " + ((e && (e.message || e.code)) || e), true);
    } finally {
      this._playing = false;
      this._updateGo();
    }
  }

  getCardSize() { return 10; }

  getGridOptions() { return { columns: "full", rows: "auto" }; }
}

if (!customElements.get("livetv-card")) {
  customElements.define("livetv-card", LiveTvCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "livetv-card")) {
  window.customCards.push({
    type: "livetv-card",
    name: "TV in diretta",
    description: "Canali Live TV di Jellyfin con programma in onda e avvio sulla TV",
  });
}
