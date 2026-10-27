/* jellyfin-now-card v1.2.0 — cosa si sta guardando su Jellyfin e su quale dispositivo (sparisce se non c'è niente) */
const JNC_STYLE = `
:host { display: block; }
:host([hidden]) { display: none; }
ha-card {
  background: var(--qa-card-bg, linear-gradient(158deg, #0D1720 0%, #070D13 100%));
  border: var(--qa-card-border, 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent));
  border-radius: var(--qa-radius, 14px);
  box-shadow: var(--qa-card-shadow, inset 0 0 24px color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent), 0 4px 20px color-mix(in srgb, var(--qa-shade, #000) 70%, transparent));
  padding: 14px 16px;
  color: var(--qa-text, #C8F4FA);
  backdrop-filter: var(--qa-blur, none);
  -webkit-backdrop-filter: var(--qa-blur, none);
  font-family: var(--qa-font, inherit);
}
.row { display: flex; align-items: center; gap: 14px; }
.row + .row { margin-top: 12px; padding-top: 12px; border-top: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 10%, transparent); }
.pic { flex: none; width: 54px; aspect-ratio: 2 / 3; border-radius: 8px; overflow: hidden; background: var(--qa-solid, #0A141B);
  border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); display: flex; align-items: center; justify-content: center; }
.pic img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pic ha-icon { color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 50%, transparent); --mdc-icon-size: 24px; }
.info { flex: 1; min-width: 0; }
.dev { display: flex; align-items: center; gap: 6px; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--qa-glow, #4DE8F4); }
.dev ha-icon { --mdc-icon-size: 14px; }
.dev.paused { color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.t { margin-top: 3px; font-size: 15px; font-weight: 600; color: var(--qa-text, #C8F4FA); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s { margin-top: 1px; font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar { margin-top: 8px; height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 10%, transparent); overflow: hidden; }
.bar div { height: 100%; background: var(--qa-glow, #4DE8F4); box-shadow: 0 0 8px color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); }
.time { margin-top: 4px; font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-variant-numeric: tabular-nums; }
.ctl { flex: none; display: flex; gap: 6px; }
button { font-family: inherit; background: none; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 35%, transparent); border-radius: 10px; color: var(--qa-glow, #4DE8F4);
  padding: 7px; cursor: pointer; display: flex; transition: all 150ms ease; }
button:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 90%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
button ha-icon { --mdc-icon-size: 20px; }
`;

class JellyfinNowCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign({ platform: "jellyfin" }, config || {});
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._root) this._build();
    this._refresh();
  }

  _refresh() {
    if (!this._hass || !this._root) return;
    const sig = this._players().map((p) => [p.entity_id, p.state, p.attributes.media_title, p.attributes.entity_picture,
      p.attributes.media_position, p.attributes.media_position_updated_at].join("|")).join(";");
    if (sig !== this._sig) { this._sig = sig; this._render(); }
  }

  connectedCallback() {
    // ogni secondo il tempo; ogni 15 s si ricontrolla se una sessione è diventata "appesa"
    if (!this._tick) this._tick = setInterval(() => {
      this._updateTimes();
      if (!this._lastCheck || Date.now() - this._lastCheck > 15000) { this._lastCheck = Date.now(); this._refresh(); }
    }, 1000);
  }

  disconnectedCallback() {
    if (this._tick) { clearInterval(this._tick); this._tick = null; }
  }

  _build() {
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${JNC_STYLE}</style><ha-card></ha-card>`;
    this._root = sr;
  }

  // Lettori dell'integrazione Jellyfin che stanno riproducendo o sono in pausa.
  // Se un dispositivo si spegne a metà film, il server Jellyfin tiene la sessione "appesa" in playing/paused:
  // - con `devices` (players + power) la sessione si nasconde quando il dispositivo risulta spento;
  // - un playing la cui posizione non avanza da più di stale_seconds è considerato appeso.
  _players() {
    const h = this._hass;
    if (!h) return [];
    const devOf = (id) => (this._config.devices || []).find((d) => (d.players || []).includes(id));
    const staleMs = (Number(this._config.stale_seconds) || 90) * 1000;
    return Object.keys(h.states)
      .filter((id) => id.startsWith("media_player.") && h.entities && h.entities[id] && h.entities[id].platform === this._config.platform)
      .map((id) => h.states[id])
      .filter((s) => (s.state === "playing" || s.state === "paused") && s.attributes.media_title)
      .filter((s) => {
        const d = devOf(s.entity_id);
        if (d && d.power && ["off", "unavailable", "unknown", undefined].includes((h.states[d.power] || {}).state)) return false;
        const upd = s.attributes.media_position_updated_at;
        if (s.state === "playing" && upd && Date.now() - new Date(upd).getTime() > staleMs) return false;
        return true;
      })
      .sort((a, b) => (a.state === "playing" ? 0 : 1) - (b.state === "playing" ? 0 : 1));
  }

  _name(s) {
    const d = (this._config.devices || []).find((x) => (x.players || []).includes(s.entity_id));
    return (d && d.name) || s.attributes.friendly_name || s.entity_id;
  }

  _pos(s) {
    const a = s.attributes;
    let p = Number(a.media_position) || 0;
    if (s.state === "playing" && a.media_position_updated_at) {
      p += (Date.now() - new Date(a.media_position_updated_at).getTime()) / 1000;
    }
    const d = Number(a.media_duration) || 0;
    return { p: d ? Math.min(p, d) : p, d };
  }

  _fmt(sec) {
    sec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(s).padStart(2, "0");
  }

  _render() {
    const card = this._root.querySelector("ha-card");
    const list = this._players();
    this.hidden = !list.length;
    card.innerHTML = "";
    for (const s of list) {
      const a = s.attributes;
      const row = document.createElement("div");
      row.className = "row";
      row.dataset.entity = s.entity_id;
      const isEp = a.media_content_type === "episode" || a.media_series_title;
      row.innerHTML = `
        <div class="pic"></div>
        <div class="info">
          <div class="dev ${s.state === "paused" ? "paused" : ""}"><ha-icon></ha-icon><span></span></div>
          <div class="t"></div>
          <div class="s"></div>
          <div class="bar"><div></div></div>
          <div class="time"></div>
        </div>
        <div class="ctl">
          <button class="pp"><ha-icon></ha-icon></button>
          <button class="stop" title="Ferma"><ha-icon icon="mdi:stop"></ha-icon></button>
        </div>`;
      const pic = row.querySelector(".pic");
      if (a.entity_picture) {
        const img = document.createElement("img");
        img.alt = "";
        img.src = a.entity_picture;
        img.addEventListener("error", () => { img.remove(); pic.innerHTML = '<ha-icon icon="mdi:filmstrip"></ha-icon>'; });
        pic.appendChild(img);
      } else {
        pic.innerHTML = '<ha-icon icon="mdi:filmstrip"></ha-icon>';
      }
      row.querySelector(".dev ha-icon").setAttribute("icon", s.state === "paused" ? "mdi:pause" : "mdi:play");
      row.querySelector(".dev span").textContent = (s.state === "paused" ? "In pausa · " : "") + this._name(s);
      if (isEp) {
        const se = a.media_season != null && a.media_episode != null
          ? `S${String(a.media_season).padStart(2, "0")}E${String(a.media_episode).padStart(2, "0")} · ` : "";
        row.querySelector(".t").textContent = a.media_series_title || a.media_title;
        row.querySelector(".s").textContent = se + (a.media_series_title ? a.media_title : "");
      } else {
        row.querySelector(".t").textContent = a.media_title;
        row.querySelector(".s").remove();
      }
      const pp = row.querySelector("button.pp");
      pp.title = s.state === "playing" ? "Pausa" : "Riprendi";
      pp.querySelector("ha-icon").setAttribute("icon", s.state === "playing" ? "mdi:pause" : "mdi:play");
      pp.addEventListener("click", () => this._command(s, s.state === "playing" ? "Pause" : "Unpause", "media_play_pause"));
      row.querySelector("button.stop").addEventListener("click", () => this._command(s, "Stop", "media_stop"));
      card.appendChild(row);
    }
    this._updateTimes();
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

  // Stop/pausa a TUTTE le sessioni Jellyfin dello stesso dispositivo: sulla TV LG l'app ha due sessioni
  // (guscio "Jellyfin for WebOS" e "Jellyfin Web") e il comando arriva solo a quella che in quel momento tiene
  // il WebSocket, non per forza quella che mostra il titolo. media_stop di HA andava solo a una e veniva scartato.
  // Se il server non risponde o la sessione non si trova, si ripiega sul servizio di HA.
  async _command(s, command, fallback) {
    try {
      const sessions = (await this._rest("jellyfin_sessioni", { secondi: 86400 })) || [];
      const title = s.attributes.media_title;
      const devices = new Set(sessions.filter((x) => x.NowPlayingItem && x.NowPlayingItem.Name === title).map((x) => x.DeviceName));
      const targets = sessions.filter((x) => devices.has(x.DeviceName));
      if (!targets.length) throw new Error("sessione non trovata");
      const res = await Promise.allSettled(targets.map((x) => this._rest("jellyfin_comando", { sessione: x.Id, comando: command })));
      if (!res.some((r) => r.status === "fulfilled")) throw new Error("nessuna sessione ha accettato il comando");
    } catch (e) {
      await this._hass.callService("media_player", fallback, { entity_id: s.entity_id });
    }
  }

  _updateTimes() {
    if (!this._root || !this._hass) return;
    for (const row of this._root.querySelectorAll(".row")) {
      const s = this._hass.states[row.dataset.entity];
      if (!s) continue;
      const { p, d } = this._pos(s);
      const bar = row.querySelector(".bar");
      const time = row.querySelector(".time");
      if (d) {
        bar.firstElementChild.style.width = Math.min(100, (p / d) * 100).toFixed(1) + "%";
        time.textContent = `${this._fmt(p)} / ${this._fmt(d)} · mancano ${this._fmt(d - p)}`;
      } else {
        bar.style.display = "none";
        time.textContent = "";
      }
    }
  }

  getCardSize() { return 2; }

  getGridOptions() { return { columns: 12, rows: "auto" }; }
}

if (!customElements.get("jellyfin-now-card")) {
  customElements.define("jellyfin-now-card", JellyfinNowCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "jellyfin-now-card")) {
  window.customCards.push({
    type: "jellyfin-now-card",
    name: "Jellyfin in riproduzione",
    description: "Cosa si sta guardando su Jellyfin e su quale dispositivo, con pausa e stop",
  });
}
