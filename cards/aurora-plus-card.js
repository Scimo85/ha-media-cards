/* aurora-plus-card v1.0.0 — la plancia Aurora (aurora-v3-card, non modificata) con in più la pagina "Media" nella barra in basso:
   sotto-schede con le card della dashboard Media, vestite con lo stile di Aurora (variabili --qa-* delle card di ~/ha-cards
   e variabili del tema di HA per le card native), colori compresi: seguono l'ora del giorno e il tema chiaro/scuro di Aurora.
   Config:
     type: custom:aurora-plus-card
     aurora: { ...config di aurora-v3-card... }
     media:
       label: Media
       icon: mdi:play-box-multiple
       pages: [ { name: "Film e serie", icon: "mdi:movie-open", cards: [ {type: ...}, ... ] }, ... ]
*/
const APC_STYLE = `
#view-media { display: flex; flex-direction: column; gap: 16px;
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
#view-media[hidden] { display: none; }
/* nella pagina Media non servono i suggerimenti di Aurora ("Tocca scene e luci"…) */
:host([data-apc-media]) .hints { display: none; }
#view-media .mtabs { display: flex; gap: 8px; flex-wrap: wrap; }
#view-media .mtabs button { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px 10px 12px; border-radius: 99px;
  font-family: var(--font-ui); font-size: .86rem; font-weight: 700; color: var(--dim); cursor: pointer;
  background: color-mix(in srgb, var(--bg) 45%, transparent); border: 1px solid var(--border); backdrop-filter: blur(8px);
  transition: color .2s, background .3s, transform .3s var(--spring); -webkit-tap-highlight-color: transparent; }
#view-media .mtabs button ha-icon { --mdc-icon-size: 18px; color: var(--acc-text); }
#view-media .mtabs button:hover { color: var(--text); transform: translateY(-2px); }
#view-media .mtabs button[aria-current="page"] { color: #fff; border-color: transparent;
  background: linear-gradient(135deg, var(--a1), var(--a2)); box-shadow: 0 10px 24px -8px var(--a1); }
#view-media .mtabs button[aria-current="page"] ha-icon { color: #fff; }
#view-media .mpage { display: flex; flex-direction: column; gap: 16px; }
#view-media .mpage[hidden] { display: none; }
#view-media .mpage > * { display: block; }
`;

class AuroraPlusCard extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._pages = [];      // { conf, el, cards: [elementi], built }
    this._page = 0;
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
    for (const p of this._pages) for (const c of p.cards) c.hass = hass;
  }

  // La pagina Media va dentro lo shadow DOM di Aurora: così eredita le sue variabili (colori dell'ora, tema, caratteri)
  _inject() {
    const ar = this._aurora && this._aurora.shadowRoot;
    const dock = ar && ar.querySelector(".dock");
    const main = ar && ar.querySelector("main");
    if (!dock || !main) {
      // aurora-v3-card non ancora definita o non ancora montata: si riprova
      if (!this._retry) this._retry = setTimeout(() => { this._retry = null; this._inject(); }, 300);
      return;
    }
    const media = this._config.media || {};
    if (!ar.querySelector("#apc-style")) {
      const st = document.createElement("style");
      st.id = "apc-style";
      st.textContent = APC_STYLE;
      ar.appendChild(st);
    }
    let btn = dock.querySelector('[data-view="media"]');
    if (!btn) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.view = "media";
      btn.innerHTML = '<i class="mdi"><ha-icon></ha-icon></i><span></span>';
      const after = dock.querySelector('[data-view="en"]') || dock.querySelector("[data-view]:last-of-type");
      after.after(btn);
      btn.addEventListener("click", () => this._show());
      // gli altri pulsanti della barra li gestisce Aurora: basta nascondere la pagina Media
      for (const b of dock.querySelectorAll("[data-view]:not([data-view=media]), #dock-scenes")) {
        b.addEventListener("click", () => this._hide());
      }
    }
    btn.querySelector("ha-icon").setAttribute("icon", media.icon || "mdi:play-box-multiple");
    btn.querySelector("span").textContent = media.label || "Media";

    let sec = ar.querySelector("#view-media");
    if (!sec) {
      sec = document.createElement("section");
      sec.id = "view-media";
      sec.className = "enter";
      sec.hidden = true;
      sec.setAttribute("aria-label", media.label || "Media");
      sec.innerHTML = '<div class="mtabs" role="group"></div><div class="mpages"></div>';
      const foot = main.querySelector("footer");
      main.insertBefore(sec, foot || null);
    }
    this._sec = sec;
    this._btn = btn;
    this._dock = dock;
    this._buildTabs();
  }

  _buildTabs() {
    const pages = (this._config.media && this._config.media.pages) || [];
    const tabs = this._sec.querySelector(".mtabs");
    const box = this._sec.querySelector(".mpages");
    tabs.innerHTML = "";
    box.innerHTML = "";
    for (const p of this._pages) for (const c of p.cards) c.remove();
    this._pages = pages.map((conf, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<ha-icon></ha-icon><span></span>';
      b.querySelector("ha-icon").setAttribute("icon", conf.icon || "mdi:play");
      b.querySelector("span").textContent = conf.name || `Pagina ${i + 1}`;
      b.addEventListener("click", () => this._open(i));
      tabs.appendChild(b);
      const el = document.createElement("div");
      el.className = "mpage";
      el.hidden = true;
      box.appendChild(el);
      return { conf, el, tab: b, cards: [], built: false };
    });
    if (this._page >= this._pages.length) this._page = 0;
    if (!this._sec.hidden) this._open(this._page);
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

  _open(i) {
    this._page = i;
    this._pages.forEach((p, k) => {
      const on = k === i;
      p.el.hidden = !on;
      if (on) p.tab.setAttribute("aria-current", "page"); else p.tab.removeAttribute("aria-current");
      if (on && !p.built) this._build(p);
    });
  }

  _show() {
    const ar = this._aurora.shadowRoot;
    // prima si torna a Casa con il pulsante di Aurora (così ferma le telecamere della pagina Sicurezza), poi si nasconde
    const home = this._dock.querySelector('[data-view="home"]');
    if (home && home.getAttribute("aria-current") !== "page") home.click();
    for (const v of ar.querySelectorAll("main > section:not(#view-media)")) v.hidden = true;
    for (const b of this._dock.querySelectorAll("[data-view]")) b.removeAttribute("aria-current");
    this._btn.setAttribute("aria-current", "page");
    this._aurora.setAttribute("data-apc-media", "");
    this._sec.hidden = false;
    this._sec.classList.remove("enter");
    void this._sec.offsetWidth;
    this._sec.classList.add("enter");
    this._open(this._page);
    const sc = ar.querySelector("#scroll");
    if (sc) sc.scrollTo({ top: 0, behavior: "smooth" });
  }

  _hide() {
    if (!this._sec || this._sec.hidden) return;
    this._sec.hidden = true;
    this._btn.removeAttribute("aria-current");
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
    name: "Aurora + Media",
    description: "Plancia Aurora con la pagina Media (card della dashboard Media nello stile di Aurora)",
  });
}
