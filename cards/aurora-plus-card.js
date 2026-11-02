/* aurora-plus-card v1.1.0 — la plancia Aurora (aurora-v3-card, non modificata) con in più pagine nuove nella barra in basso
   ("Media", "Rete"…): sotto-schede con le card che volete, vestite con lo stile di Aurora (variabili --qa-* delle card di ~/ha-cards
   e variabili del tema di HA per le card native), colori compresi: seguono l'ora del giorno e il tema chiaro/scuro di Aurora.
   Config:
     type: custom:aurora-plus-card
     aurora: { ...config di aurora-v3-card... }
     media:                     # la pagina Media (come nella v1.0)
       label: Media
       icon: mdi:play-box-multiple
       pages: [ { name: "Film e serie", icon: "mdi:movie-open", cards: [ {type: ...}, ... ] }, ... ]
     views:                     # altre pagine, dopo Media e nello stesso formato; con una sola sotto-scheda la riga delle schede non si vede
       - { id: rete, label: Rete, icon: mdi:lan, pages: [ { name: Rete, cards: [ { type: custom:network-map-card } ] } ] }
*/
const APC_STYLE = `
.apc-view { display: flex; flex-direction: column; gap: 16px;
  /* card di ~/ha-cards (tema-variabili.py) */
  --qa-card-bg: var(--surface);
  --qa-card-border: 1px solid var(--border);
  --qa-card-shadow: var(--shadow), inset 0 1px 0 var(--hi);
  --qa-radius: 28px;
  --qa-blur: blur(14px) saturate(1.3);
  --qa-font: var(--font-ui);
  --qa-text: var(--text);
  --qa-acc: var(--acc-text);
  --qa-glow: var(--b1);
  --qa-faint: var(--dim);
  --qa-shade: var(--bg);
  --qa-solid: var(--surface-solid);
  /* card native di HA (tile, button-card) */
  --ha-card-background: var(--surface);
  --card-background-color: var(--surface-solid);
  --ha-card-border-radius: 28px;
  --ha-card-border-color: var(--border);
  --ha-card-border-width: 1px;
  --ha-card-box-shadow: var(--shadow);
  --primary-text-color: var(--text);
  --secondary-text-color: var(--dim);
  --primary-color: var(--a1);
  --accent-color: var(--a2);
  --state-icon-color: var(--acc-text);
  --divider-color: var(--border);
}
.apc-view[hidden] { display: none; }
/* nelle pagine aggiunte non servono i suggerimenti di Aurora ("Tocca scene e luci"…) */
:host([data-apc-media]) .hints { display: none; }
.apc-view .mtabs { display: flex; gap: 8px; flex-wrap: wrap; }
.apc-view .mtabs button { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px 10px 12px; border-radius: 99px;
  font-family: var(--font-ui); font-size: .86rem; font-weight: 700; color: var(--dim); cursor: pointer;
  background: color-mix(in srgb, var(--bg) 45%, transparent); border: 1px solid var(--border); backdrop-filter: blur(8px);
  transition: color .2s, background .3s, transform .3s var(--spring); -webkit-tap-highlight-color: transparent; }
.apc-view .mtabs button ha-icon { --mdc-icon-size: 18px; color: var(--acc-text); }
.apc-view .mtabs button:hover { color: var(--text); transform: translateY(-2px); }
.apc-view .mtabs button[aria-current="page"] { color: #fff; border-color: transparent;
  background: linear-gradient(135deg, var(--a1), var(--a2)); box-shadow: 0 10px 24px -8px var(--a1); }
.apc-view .mtabs button[aria-current="page"] ha-icon { color: #fff; }
.apc-view .mpage { display: flex; flex-direction: column; gap: 16px; }
.apc-view .mpage[hidden] { display: none; }
.apc-view .mpage > * { display: block; }
.apc-view .mtabs:empty, .apc-view .mtabs.single { display: none; }
/* con più di una pagina aggiunta la barra sul telefono si stringe un po', così ci stanno tutti i pulsanti */
:host([data-apc-many]) .dock { max-width: calc(100vw - 12px); }
@media (max-width: 560px) {
  :host([data-apc-many]) .dock { gap: 2px; padding: 6px; }
  :host([data-apc-many]) .dock button { min-width: 0; flex: 1 1 0; padding: 9px 3px 7px; }
  :host([data-apc-many]) .dock button span { font-size: .56rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
  :host([data-apc-many]) .dock .sep { margin: 8px 1px; }
}
`;

class AuroraPlusCard extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._views = [];      // { id, conf, sec, btn, pages: [{ conf, el, tab, cards, built }], page }
  }

  setConfig(config) {
    if (!config || !config.aurora) throw new Error("aurora-plus-card: manca la sezione 'aurora'");
    const first = !this._config;
    this._config = config;
    if (first) {
      this._root.innerHTML = "<style>:host { display: block; }</style>";
      this._aurora = document.createElement("aurora-v3-card");
      this._root.appendChild(this._aurora);
    }
    // le risorse si caricano in ordine sparso: si aspetta che aurora-v3-card sia definita
    customElements.whenDefined("aurora-v3-card").then(() => {
      if (this._config !== config) return;
      // creato prima della definizione e non ancora nella pagina: va attivato a mano
      customElements.upgrade(this._aurora);
      this._aurora.setConfig(config.aurora);
      if (this._hass) this._aurora.hass = this._hass;
      this._inject();
    });
  }

  // Aurora si dà l'altezza "schermo meno barra di HA (56 px)": con Kiosk Mode la barra non c'è e resterebbe una fascia vuota
  // in fondo. Si misura lo spazio vero, da dove inizia la card al fondo della finestra.
  _fit() {
    if (!this._aurora || !this.isConnected) return;
    const top = Math.max(0, this.getBoundingClientRect().top);
    this._aurora.style.setProperty("--aurora-height", Math.max(520, Math.round(window.innerHeight - top)) + "px");
  }

  connectedCallback() {
    if (!this._onResize) this._onResize = () => this._fit();
    window.addEventListener("resize", this._onResize);
    // Kiosk Mode nasconde la barra qualche istante dopo il caricamento
    for (const ms of [0, 500, 1500, 4000]) setTimeout(() => this._fit(), ms);
  }

  disconnectedCallback() {
    if (this._onResize) window.removeEventListener("resize", this._onResize);
  }

  set hass(hass) {
    this._hass = hass;
    if (this._aurora && this._aurora.setConfig) this._aurora.hass = hass;
    for (const v of this._views) for (const p of v.pages) for (const c of p.cards) c.hass = hass;
  }

  // le pagine aggiunte: prima Media (chiave "media", come nella v1.0), poi quelle di "views"
  _viewConfs() {
    const out = [];
    if (this._config.media) out.push(Object.assign({ label: "Media", icon: "mdi:play-box-multiple" }, this._config.media, { id: "media" }));
    for (const v of this._config.views || []) {
      const id = String(v.id || v.label || "pagina").toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
      if (["home", "sic", "en", "media"].includes(id) || out.some((o) => o.id === id)) continue;
      out.push(Object.assign({ label: v.label || id, icon: "mdi:view-dashboard" }, v, { id }));
    }
    return out;
  }

  // Le pagine vanno dentro lo shadow DOM di Aurora: così ereditano le sue variabili (colori dell'ora, tema, caratteri)
  _inject() {
    const ar = this._aurora && this._aurora.shadowRoot;
    const dock = ar && ar.querySelector(".dock");
    const main = ar && ar.querySelector("main");
    if (!dock || !main) {
      // aurora-v3-card non ancora definita o non ancora montata: si riprova
      if (!this._retry) this._retry = setTimeout(() => { this._retry = null; this._inject(); }, 300);
      return;
    }
    this._dock = dock;
    if (!ar.querySelector("#apc-style")) {
      const st = document.createElement("style");
      st.id = "apc-style";
      st.textContent = APC_STYLE;
      ar.appendChild(st);
    }
    // gli altri pulsanti della barra li gestisce Aurora: basta nascondere le pagine aggiunte
    if (!this._hooked) {
      this._hooked = true;
      for (const b of dock.querySelectorAll("[data-view], #dock-scenes")) b.addEventListener("click", () => this._hideAll());
    }
    const confs = this._viewConfs();
    // pagine tolte dalla config
    for (const v of this._views) if (!confs.some((c) => c.id === v.id)) {
      for (const p of v.pages) for (const c of p.cards) c.remove();
      v.sec.remove(); v.btn.remove();
    }
    const old = this._views;
    let after = dock.querySelector('[data-view="en"]') || [...dock.querySelectorAll("[data-view]")].pop();
    this._views = confs.map((conf) => {
      let v = old.find((o) => o.id === conf.id);
      if (!v) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.dataset.apc = conf.id;
        btn.innerHTML = '<i class="mdi"><ha-icon></ha-icon></i><span></span>';
        btn.addEventListener("click", () => this._show(v));
        const sec = document.createElement("section");
        sec.id = "view-" + conf.id;
        sec.className = "apc-view enter";
        sec.hidden = true;
        sec.innerHTML = '<div class="mtabs" role="group"></div><div class="mpages"></div>';
        const foot = main.querySelector("footer");
        main.insertBefore(sec, foot || null);
        v = { id: conf.id, btn, sec, pages: [], page: 0 };
      }
      after.after(v.btn);
      after = v.btn;
      v.conf = conf;
      v.btn.querySelector("ha-icon").setAttribute("icon", conf.icon);
      v.btn.querySelector("span").textContent = conf.label;
      v.sec.setAttribute("aria-label", conf.label);
      this._buildTabs(v);
      return v;
    });
    if (this._views.length > 1) this._aurora.setAttribute("data-apc-many", "");
    else this._aurora.removeAttribute("data-apc-many");
  }

  _buildTabs(v) {
    const pages = v.conf.pages || (v.conf.cards ? [{ name: v.conf.label, cards: v.conf.cards }] : []);
    const tabs = v.sec.querySelector(".mtabs");
    const box = v.sec.querySelector(".mpages");
    tabs.innerHTML = "";
    box.innerHTML = "";
    tabs.classList.toggle("single", pages.length < 2);
    for (const p of v.pages) for (const c of p.cards) c.remove();
    v.pages = pages.map((conf, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<ha-icon></ha-icon><span></span>';
      b.querySelector("ha-icon").setAttribute("icon", conf.icon || "mdi:play");
      b.querySelector("span").textContent = conf.name || `Pagina ${i + 1}`;
      b.addEventListener("click", () => this._open(v, i));
      tabs.appendChild(b);
      const el = document.createElement("div");
      el.className = "mpage";
      el.hidden = true;
      box.appendChild(el);
      return { conf, el, tab: b, cards: [], built: false };
    });
    if (v.page >= v.pages.length) v.page = 0;
    if (!v.sec.hidden) this._open(v, v.page);
  }

  // Le card di una sotto-scheda si creano la prima volta che la si apre, poi restano (es. la radio continua a suonare)
  async _build(p) {
    p.built = true;
    const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
    for (const cc of p.conf.cards || []) {
      let el;
      try {
        if (helpers) el = await helpers.createCardElement(cc);
        else {
          el = document.createElement(String(cc.type).replace(/^custom:/, ""));
          el.setConfig(cc);
        }
      } catch (e) {
        el = document.createElement("div");
        el.textContent = "Card non caricata: " + ((e && e.message) || e);
      }
      if (this._hass) el.hass = this._hass;
      p.cards.push(el);
      p.el.appendChild(el);
    }
  }

  _open(v, i) {
    v.page = i;
    v.pages.forEach((p, k) => {
      const on = k === i;
      p.el.hidden = !on;
      if (on) p.tab.setAttribute("aria-current", "page"); else p.tab.removeAttribute("aria-current");
      if (on && !p.built) this._build(p);
    });
  }

  _show(v) {
    const ar = this._aurora.shadowRoot;
    // prima si torna a Casa con il pulsante di Aurora (così ferma le telecamere della pagina Sicurezza), poi si nasconde
    const home = this._dock.querySelector('[data-view="home"]');
    if (home && home.getAttribute("aria-current") !== "page") home.click();
    for (const s of ar.querySelectorAll("main > section")) s.hidden = s !== v.sec;
    for (const b of this._dock.querySelectorAll("[data-view], [data-apc]")) b.removeAttribute("aria-current");
    v.btn.setAttribute("aria-current", "page");
    this._aurora.setAttribute("data-apc-media", "");
    v.sec.hidden = false;
    v.sec.classList.remove("enter");
    void v.sec.offsetWidth;
    v.sec.classList.add("enter");
    this._open(v, v.page);
    const sc = ar.querySelector("#scroll");
    if (sc) sc.scrollTo({ top: 0, behavior: "smooth" });
  }

  _hideAll() {
    for (const v of this._views) {
      if (v.sec.hidden) continue;
      v.sec.hidden = true;
      v.btn.removeAttribute("aria-current");
    }
    this._aurora.removeAttribute("data-apc-media");
  }

  getCardSize() { return 20; }

  getLayoutOptions() { return { grid_columns: 12, grid_rows: 12 }; }
}

if (!customElements.get("aurora-plus-card")) {
  customElements.define("aurora-plus-card", AuroraPlusCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "aurora-plus-card")) {
  window.customCards.push({
    type: "aurora-plus-card",
    name: "Aurora + pagine",
    description: "Plancia Aurora con pagine in più nella barra (Media, Rete…), nello stile di Aurora",
  });
}
