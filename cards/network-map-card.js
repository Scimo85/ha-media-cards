/* network-map-card v1.0.0 — mappa della rete di casa: luce verde (connesso) / rossa (non connesso), indirizzo IP, batteria.
   Su schermi larghi un'"orbita" a cascata (tocchi un nodo e si apre il livello sotto), su quelli stretti pannelli annidati.
   I dispositivi arrivano dal registro di Home Assistant; i rami (server, Wi‑Fi, telefoni…) si decidono per integrazione.
   Con Zigbee2MQTT si può leggere la mesh vera (chi passa da quale ripetitore). Colori e caratteri: quelli di Aurora.
   Config (tutto facoltativo):
     type: custom:network-map-card
     title: Rete
     view: auto                 # auto | orbit | list
     breakpoint: 720            # larghezza della card (px) sopra la quale si vede l'orbita
     low_battery: 20            # soglia "batteria bassa" (%)
     group_over: 12             # oltre questi figli, un livello si divide per tipo (Luci, Prese, Sensori…)
     root: { name: Router, ip: 192.168.1.1, entity: binary_sensor.router }   # entity: facoltativa (es. un ping)
     branches:
       - { id: server, name: Server di casa, icon: mdi:server, ip: 192.168.1.34, integrations: [jellyfin, nut] }
     devices:                   # per nome (o id) del dispositivo
       "Camera ingresso": { ip: 192.168.1.22, parent: wifi, icon: mdi:cctv, entity: binary_sensor.x, name: "…" }
       "Lavatrice": { status: availability }   # stato dalle entità e non dal sensore "connectivity"
       "Ospite": { hide: true }
     exclude_devices: [ "Ovunque" ]
     exclude_integrations: [ homekit ]
     zigbee2mqtt: { base_topic: zigbee2mqtt }    # false per non mostrare il pulsante "Leggi la mesh"
*/
const NMC_STYLE = `
:host { display: block; --nmc-ok: var(--ok, #34D399); --nmc-bad: var(--danger, #FB7185); --nmc-warn: var(--warn, #FBBF24);
  --nmc-text: var(--text, #F5F7FF); --nmc-dim: var(--dim, #A3AED0); --nmc-border: var(--border, rgba(255,255,255,.10));
  --nmc-solid: var(--surface-solid, #12172D); --nmc-bg: var(--bg, #070A16); --nmc-a1: var(--a1, #7C5CFF); --nmc-a2: var(--a2, #D946EF);
  --nmc-acc: var(--acc-text, #B9A8FF); --nmc-line: color-mix(in srgb, var(--nmc-dim) 32%, transparent);
  --nmc-ui: var(--font-ui, 'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif);
  --nmc-disp: var(--font-display, 'Sora', 'Manrope', system-ui, sans-serif); }
* { box-sizing: border-box; }
ha-card, .card { display: flex; flex-direction: column; gap: 16px; padding: 20px; border-radius: var(--qa-radius, 28px);
  background: var(--qa-card-bg, var(--surface, rgba(255,255,255,.06))); border: var(--qa-card-border, 1px solid var(--nmc-border));
  box-shadow: var(--qa-card-shadow, 0 24px 60px -26px rgba(0,0,0,.75)); backdrop-filter: var(--qa-blur, blur(14px) saturate(1.3));
  -webkit-backdrop-filter: var(--qa-blur, blur(14px) saturate(1.3)); color: var(--nmc-text); font-family: var(--nmc-ui); min-width: 0; }
button { font: inherit; color: inherit; -webkit-tap-highlight-color: transparent; }
button:focus-visible, summary:focus-visible { outline: 2px solid var(--nmc-acc); outline-offset: 3px; }
.head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.head h2 { margin: 0; font-family: var(--nmc-disp); font-size: 1.05rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; display: flex; align-items: center; gap: 10px; }
.head h2 ha-icon { color: var(--nmc-acc); --mdc-icon-size: 22px; }
.seg { margin-left: auto; display: inline-flex; padding: 4px; gap: 4px; border-radius: 99px; border: 1px solid var(--nmc-border);
  background: color-mix(in srgb, var(--nmc-bg) 45%, transparent); }
.seg button { border: 0; background: none; cursor: pointer; padding: 6px 14px; border-radius: 99px; font-size: .8rem; font-weight: 700; color: var(--nmc-dim); }
.seg button[aria-pressed="true"] { color: #fff; background: linear-gradient(135deg, var(--nmc-a1), var(--nmc-a2)); box-shadow: 0 8px 20px -8px var(--nmc-a1); }
.sum { display: flex; gap: 8px; flex-wrap: wrap; }
.stat { display: inline-flex; align-items: center; gap: 9px; padding: 7px 14px; border-radius: 99px; border: 1px solid var(--nmc-border);
  background: color-mix(in srgb, var(--nmc-bg) 45%, transparent); font-weight: 700; font-size: .82rem; font-variant-numeric: tabular-nums; cursor: pointer; }
.stat b { font-family: var(--nmc-disp); font-size: 1rem; }
.stat[aria-pressed="true"] { border-color: var(--nmc-acc); }
.led { width: 10px; height: 10px; border-radius: 50%; flex: none; display: inline-block; background: var(--nmc-dim); }
.led.on { background: var(--nmc-ok); box-shadow: 0 0 0 3px color-mix(in srgb, var(--nmc-ok) 22%, transparent), 0 0 10px var(--nmc-ok); }
.led.off { background: var(--nmc-bad); box-shadow: 0 0 0 3px color-mix(in srgb, var(--nmc-bad) 22%, transparent), 0 0 10px var(--nmc-bad); }
.led.warn { background: var(--nmc-warn); box-shadow: 0 0 0 3px color-mix(in srgb, var(--nmc-warn) 22%, transparent); }
.led.away { background: color-mix(in srgb, var(--nmc-dim) 70%, transparent); }
@media (prefers-reduced-motion: no-preference) { .led.on { animation: nmc-pulse 2.6s ease-in-out infinite; } }
@keyframes nmc-pulse { 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--nmc-ok) 0%, transparent), 0 0 14px var(--nmc-ok); } }

/* ---- orbita ---- */
.olay { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; align-items: start; }
.olay.wide { grid-template-columns: minmax(0, 1fr) 290px; }
.ostage { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.crumbs button { border: 1px solid var(--nmc-border); background: color-mix(in srgb, var(--nmc-bg) 45%, transparent); border-radius: 99px;
  padding: 5px 13px; font-size: .8rem; font-weight: 700; color: var(--nmc-dim); cursor: pointer; transition: color .2s, transform .3s var(--spring, ease); }
.crumbs button:hover { color: var(--nmc-text); transform: translateY(-2px); }
.crumbs button[aria-current="true"] { color: #fff; border-color: transparent; background: linear-gradient(135deg, var(--nmc-a1), var(--nmc-a2)); cursor: default; transform: none; }
.crumbs .sep { color: var(--nmc-dim); font-size: .75rem; }
.orbit { position: relative; width: 100%; max-width: 640px; aspect-ratio: 1; align-self: center; margin-block: 18px 26px; }
.orbit svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.lvl { position: absolute; inset: 0; }
@media (prefers-reduced-motion: no-preference) {
  .lvl.down { animation: nmc-in .55s var(--spring, cubic-bezier(.34,1.56,.64,1)) both; }
  .lvl.up { animation: nmc-out .5s var(--spring, cubic-bezier(.34,1.56,.64,1)) both; } }
@keyframes nmc-in { from { opacity: 0; transform: scale(.7); } to { opacity: 1; transform: none; } }
@keyframes nmc-out { from { opacity: 0; transform: scale(1.25); } to { opacity: 1; transform: none; } }
.halo { fill: url(#nmc-halo); }
.ring { fill: none; stroke: var(--nmc-line); stroke-dasharray: 2 6; }
.ln { stroke: var(--nmc-line); stroke-width: 2; }
.ln.off { stroke: var(--nmc-bad); stroke-width: 1.6; stroke-dasharray: 5 5; opacity: .75; }
.ln.away { stroke-dasharray: 2 5; }
.nd { position: absolute; width: 0; height: 0; border: 0; padding: 0; background: none; cursor: pointer; }
.disc { position: absolute; left: 0; top: 0; width: 46px; height: 46px; margin: -23px 0 0 -23px; border-radius: 50%; display: grid; place-items: center;
  background: var(--nmc-solid); border: 1.5px solid var(--nmc-border); transition: transform .35s var(--spring, ease), border-color .2s; }
.disc ha-icon { --mdc-icon-size: 21px; color: var(--nmc-acc); }
.nd.k .disc { width: 56px; height: 56px; margin: -28px 0 0 -28px; box-shadow: 0 0 0 6px color-mix(in srgb, var(--nmc-solid) 70%, transparent), 0 0 0 7px color-mix(in srgb, var(--nmc-acc) 35%, transparent); }
.nd.k .disc ha-icon { --mdc-icon-size: 25px; }
.nd.on .disc { border-color: color-mix(in srgb, var(--nmc-ok) 55%, transparent); }
.nd.off .disc { border-color: var(--nmc-bad); }
.nd.off .disc ha-icon { color: var(--nmc-dim); }
.nd:hover .disc, .nd:focus-visible .disc { transform: scale(1.12); border-color: var(--nmc-acc); }
.nd:focus-visible { outline: none; }
.nd .led { position: absolute; right: -1px; bottom: -1px; width: 12px; height: 12px; border: 2px solid var(--nmc-solid); }
.nd .cnt { position: absolute; left: 50%; bottom: -9px; transform: translateX(-50%); font-size: .62rem; font-weight: 800; color: var(--nmc-dim);
  background: var(--nmc-solid); border: 1px solid var(--nmc-border); border-radius: 99px; padding: 0 6px; line-height: 15px; }
.nd .bad { position: absolute; right: -6px; top: -6px; min-width: 19px; height: 19px; padding: 0 5px; border-radius: 99px; background: var(--nmc-bad);
  color: #fff; font-size: .66rem; font-weight: 800; line-height: 19px; text-align: center; border: 2px solid var(--nmc-solid); }
.nd .lowb { position: absolute; left: -2px; top: -2px; width: 11px; height: 11px; border-radius: 50%; background: var(--nmc-warn); border: 2px solid var(--nmc-solid); }
.lbl { position: absolute; display: flex; flex-direction: column; width: max-content; max-width: 132px; pointer-events: none; line-height: 1.25; }
.lbl b { font-size: .76rem; font-weight: 700; color: var(--nmc-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lbl small { font-size: .66rem; color: var(--nmc-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.nd.off .lbl b { color: var(--nmc-dim); }
.lbl.r { left: 36px; top: -15px; text-align: left; }
.lbl.l { right: 36px; top: -15px; text-align: right; align-items: flex-end; }
.lbl.t { bottom: 38px; left: 0; transform: translateX(-50%); text-align: center; align-items: center; }
.lbl.b { top: 38px; left: 0; transform: translateX(-50%); text-align: center; align-items: center; }
.dense .lbl { display: none; max-width: 120px; }
.dense .nd.flag .lbl, .dense .nd:hover .lbl, .dense .nd:focus-visible .lbl { display: flex; z-index: 2; }
.dense .nd:hover, .dense .nd:focus-visible { z-index: 3; }
.dense .nd:hover .lbl, .dense .nd:focus-visible .lbl { background: var(--nmc-solid); border: 1px solid var(--nmc-border); border-radius: 10px; padding: 4px 8px; }
.dense .disc { width: 40px; height: 40px; margin: -20px 0 0 -20px; }
.dense .disc ha-icon { --mdc-icon-size: 18px; }
.core { position: absolute; left: 50%; top: 50%; width: 108px; height: 108px; margin: -54px 0 0 -54px; border-radius: 50%; border: 0; padding: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; color: #fff; cursor: pointer; text-align: center;
  background: radial-gradient(circle at 35% 30%, var(--nmc-a2), var(--nmc-a1)); box-shadow: 0 16px 40px -10px var(--nmc-a1); }
.core.off { box-shadow: 0 0 0 4px var(--nmc-bad), 0 16px 40px -10px var(--nmc-a1); }
.core ha-icon { --mdc-icon-size: 24px; }
.core b { font-family: var(--nmc-disp); font-size: .8rem; font-weight: 600; line-height: 1.15; max-width: 92px; overflow: hidden; text-overflow: ellipsis;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.core small { font-size: .62rem; opacity: .9; font-variant-numeric: tabular-nums; }
.core em { font-style: normal; font-size: .6rem; font-weight: 800; letter-spacing: .06em; opacity: .85; }
.legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: .74rem; color: var(--nmc-dim); }
.legend span { display: inline-flex; align-items: center; gap: 6px; }
.side { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.panel { border: 1px solid var(--nmc-border); border-radius: 22px; padding: 16px; background: color-mix(in srgb, var(--nmc-bg) 40%, transparent);
  display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.eyebrow { font-size: .66rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--nmc-acc); }
.panel h3 { margin: 0; font-family: var(--nmc-disp); font-size: .98rem; font-weight: 600; display: flex; align-items: center; gap: 10px; min-width: 0; }
.panel h3 span:last-child { min-width: 0; overflow-wrap: anywhere; }
.kv { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; font-size: .82rem; margin: 0; }
.kv dt { color: var(--nmc-dim); } .kv dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; min-width: 0; overflow-wrap: anywhere; }
.acts { display: flex; gap: 8px; flex-wrap: wrap; }
.btn { border: 1px solid var(--nmc-border); background: color-mix(in srgb, var(--nmc-bg) 45%, transparent); border-radius: 99px; padding: 8px 14px;
  font-size: .8rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; color: var(--nmc-text); }
.btn ha-icon { --mdc-icon-size: 16px; color: var(--nmc-acc); }
.btn.pri { color: #fff; border-color: transparent; background: linear-gradient(135deg, var(--nmc-a1), var(--nmc-a2)); box-shadow: 0 10px 22px -8px var(--nmc-a1); }
.btn.pri ha-icon { color: #fff; }
.btn[disabled] { opacity: .6; cursor: progress; }
.issues { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; max-height: 320px; overflow-y: auto; }
.issues button { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 10px; align-items: center; width: 100%; padding: 7px 8px; border-radius: 12px; font-size: .82rem; font-weight: 600; }
.issues button:hover, .issues button:focus-visible { background: var(--surface, rgba(255,255,255,.06)); }
.issues .nm { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.issues small { margin-left: auto; color: var(--nmc-dim); font-weight: 500; font-size: .72rem; text-align: right; white-space: nowrap; }
.none { color: var(--nmc-dim); font-size: .82rem; }

/* ---- elenco (telefono) ---- */
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filters button { cursor: pointer; padding: 7px 14px; border-radius: 99px; border: 1px solid var(--nmc-border); font-size: .8rem; font-weight: 700;
  color: var(--nmc-dim); background: color-mix(in srgb, var(--nmc-bg) 45%, transparent); }
.filters button[aria-pressed="true"] { color: #fff; border-color: transparent; background: linear-gradient(135deg, var(--nmc-a1), var(--nmc-a2)); box-shadow: 0 8px 20px -8px var(--nmc-a1); }
.groups { display: flex; flex-direction: column; gap: 10px; }
details.g { border: 1px solid var(--nmc-border); border-radius: 20px; background: color-mix(in srgb, var(--nmc-bg) 30%, transparent); overflow: hidden; }
details.g details.g { border-radius: 16px; margin: 6px 0 2px; background: color-mix(in srgb, var(--nmc-bg) 35%, transparent); }
details.g > summary { list-style: none; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 12px 14px; }
details.g > summary::-webkit-details-marker { display: none; }
details.g > summary ha-icon { --mdc-icon-size: 20px; color: var(--nmc-acc); flex: none; }
.gn { font-family: var(--nmc-disp); font-weight: 600; font-size: .88rem; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.gs { margin-left: auto; font-size: .72rem; color: var(--nmc-dim); font-variant-numeric: tabular-nums; white-space: nowrap; display: flex; gap: 6px; align-items: center; }
.badge { font-size: .66rem; font-weight: 800; padding: 2px 8px; border-radius: 99px; color: var(--nmc-bad); background: color-mix(in srgb, var(--nmc-bad) 16%, transparent); }
.chev { width: 8px; height: 8px; border-right: 2px solid var(--nmc-dim); border-bottom: 2px solid var(--nmc-dim); transform: rotate(-45deg); transition: transform .25s; flex: none; margin-left: 4px; }
details[open] > summary .chev { transform: rotate(45deg); }
.gb { padding: 0 10px 10px; display: flex; flex-direction: column; }
.row { display: grid; grid-template-columns: auto auto 1fr auto; gap: 1px 10px; align-items: center; padding: 9px 6px; border-top: 1px solid var(--nmc-border);
  cursor: pointer; border-radius: 4px; }
.row > ha-icon { --mdc-icon-size: 18px; color: var(--nmc-acc); grid-row: 1 / span 2; grid-column: 2; }
.row > .led { grid-row: 1 / span 2; }
.row.off > ha-icon { color: var(--nmc-dim); }
.rn { grid-column: 3; font-weight: 700; font-size: .86rem; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row.off .rn { color: var(--nmc-dim); }
.ri { grid-column: 3; font-size: .72rem; color: var(--nmc-dim); font-variant-numeric: tabular-nums; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rs { grid-column: 4; grid-row: 1 / span 2; text-align: right; font-size: .66rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
.rs.on { color: var(--nmc-ok); } .rs.off { color: var(--nmc-bad); } .rs.away { color: var(--nmc-dim); }
.bat { display: inline-flex; align-items: center; gap: 6px; font-size: .7rem; font-weight: 700; color: var(--nmc-dim); font-variant-numeric: tabular-nums; letter-spacing: 0; }
.bat i { display: block; width: 28px; height: 8px; border-radius: 3px; border: 1px solid var(--nmc-line); position: relative; overflow: hidden; }
.bat i::after { content: ""; position: absolute; top: 1px; bottom: 1px; left: 1px; width: calc(var(--p) * 1% - 2px); border-radius: 2px; background: var(--c); }
.empty { color: var(--nmc-dim); font-size: .84rem; padding: 10px; }
.zb { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: .76rem; color: var(--nmc-dim); padding-top: 4px; border-top: 1px solid var(--nmc-border); }
.zb ha-icon { --mdc-icon-size: 18px; color: var(--nmc-acc); }
.zb .btn { margin-left: auto; }
`;

const NMC_EXCLUDE = ["sun", "met", "backup", "google_translate", "hacs", "ha_mcp_tools", "cloud", "radio_browser", "shopping_list",
  "analytics", "go2rtc", "thread", "group", "homekit", "template", "derivative", "utility_meter", "min_max", "threshold", "input_boolean"];
// integrazioni i cui dispositivi "figli" sono sessioni (app aperte), non apparecchi
const NMC_SESSIONS = ["jellyfin"];
const NMC_OFF = ["unavailable", "unknown"];

const NMC_CATS = [
  { k: "cover", n: "Tapparelle", i: "mdi:window-shutter" },
  { k: "light", n: "Luci e interruttori", i: "mdi:lightbulb-group" },
  { k: "plug", n: "Prese", i: "mdi:power-socket-eu" },
  { k: "lock", n: "Serrature", i: "mdi:lock" },
  { k: "camera", n: "Telecamere", i: "mdi:cctv" },
  { k: "media", n: "TV e altoparlanti", i: "mdi:television-speaker" },
  { k: "climate", n: "Clima e aria", i: "mdi:air-filter" },
  { k: "door", n: "Porte e finestre", i: "mdi:door-open" },
  { k: "motion", n: "Movimento", i: "mdi:motion-sensor" },
  { k: "safety", n: "Fumo e allagamento", i: "mdi:smoke-detector-variant" },
  { k: "plant", n: "Piante", i: "mdi:sprout" },
  { k: "sensor", n: "Sensori", i: "mdi:thermometer" },
  { k: "phone", n: "Telefoni", i: "mdi:cellphone" },
  { k: "other", n: "Altro", i: "mdi:devices" },
];

class NetworkMapCard extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
    this._focus = "root";
    this._sel = null;
    this._dir = "";
    this._filter = "all";
    this._open = new Set();
    this._closed = new Set();
    this._width = 0;
    this._zb = this._loadZb();
  }

  setConfig(config) {
    this._config = Object.assign({ title: "Rete", view: "auto", breakpoint: 720, low_battery: 20, group_over: 12 }, config || {});
    try { this._mode = localStorage.getItem("nmc-view") || null; } catch (e) { this._mode = null; }
    this._sig = null;
    if (this._hass) this._update(true);
  }

  set hass(hass) {
    this._hass = hass;
    const now = Date.now();
    if (!this._tree || now - (this._last || 0) > 1500) { this._last = now; this._update(); }
    else if (!this._pending) this._pending = setTimeout(() => { this._pending = null; this._last = Date.now(); this._update(); }, 1600);
  }

  connectedCallback() {
    if (!this._ro) this._ro = new ResizeObserver((e) => {
      const w = Math.round(e[0].contentRect.width);
      if (Math.abs(w - this._width) > 8) { this._width = w; this._render(); }
    });
    this._ro.observe(this);
  }

  disconnectedCallback() { if (this._ro) this._ro.disconnect(); }

  getCardSize() { return 12; }

  // ---------------------------------------------------------------- dati
  _loadZb() { try { return JSON.parse(localStorage.getItem("nmc-zigbee") || "null"); } catch (e) { return null; } }

  _update(force) {
    if (!this._hass || !this._config) return;
    const t = this._buildTree();
    if (!force && t.sig === this._sig) return;
    this._sig = t.sig;
    this._tree = t;
    if (!t.byId[this._focus]) this._focus = "root";
    if (this._sel && !t.byId[this._sel]) this._sel = null;
    this._dir = "";
    this._render();
  }

  _buildTree() {
    const H = this._hass, C = this._config;
    const devs = H.devices || {}, ents = H.entities || {}, areas = H.areas || {};
    const lowB = Number(C.low_battery) || 20;
    const exclInt = new Set([...NMC_EXCLUDE, ...(C.exclude_integrations || [])]);
    const exclDev = new Set(C.exclude_devices || []);
    const ov = C.devices || {};
    const byDev = {};
    for (const e of Object.values(ents)) if (e.device_id) (byDev[e.device_id] = byDev[e.device_id] || []).push(e);

    const byId = {};
    const sigParts = [];
    const nodes = [];
    const ieeeToId = {};
    for (const d of Object.values(devs)) {
      if (d.entry_type === "service" || d.disabled_by) continue;
      const rawName = d.name_by_user || d.name;
      if (!rawName || exclDev.has(rawName) || exclDev.has(d.id)) continue;
      const o = ov[rawName] || ov[d.id] || {};
      if (o.hide) continue;
      const list = (byDev[d.id] || []).filter((e) => !e.disabled_by);
      if (!list.length && !o.parent) continue;
      const ids = (d.identifiers || []).map((x) => String(x[1] || ""));
      const isZ2M = ids.some((x) => x.startsWith("zigbee2mqtt_"));
      let integ = this._mainPlatform(list);
      if (isZ2M) integ = "zigbee2mqtt";
      if (!integ || exclInt.has(integ)) continue;
      if (NMC_SESSIONS.includes(integ) && d.via_device_id) continue;
      const states = list.map((e) => H.states[e.entity_id]).filter(Boolean);
      const n = {
        id: d.id, deviceId: d.id, name: o.name || rawName, rawName, integ, model: d.model || "", manufacturer: d.manufacturer || "",
        area: (d.area_id && areas[d.area_id] && areas[d.area_id].name) || "", via: d.via_device_id, o, children: [],
        bridge: ids.some((x) => x.startsWith("zigbee2mqtt_bridge_")),
      };
      for (const x of ids) { const m = x.match(/0x[0-9a-f]{16}/i); if (m && isZ2M) ieeeToId[m[0].toLowerCase()] = d.id; }
      n.cat = this._category(list, states, integ, (rawName + " " + (d.model || "")).toLowerCase());
      this._status(n, list, states, o, lowB);
      n.ip = o.ip || this._ip(d, states, rawName);
      n.icon = o.icon || this._icon(n, states);
      n.kind = this._kind(n);
      byId[n.id] = n;
      nodes.push(n);
      sigParts.push(n.id + n.status + (n.bat == null ? "" : n.bat) + (n.batLow ? "L" : ""));
    }

    // radice e rami
    const rootC = C.root || {};
    const root = this._virtual("root", rootC.name || "Router", rootC.icon || "mdi:router-wireless", rootC.ip);
    root.kind = "Router";
    if (rootC.entity) this._statusFromEntity(root, rootC.entity);
    byId.root = root;
    const branches = (C.branches && C.branches.length) ? C.branches : this._autoBranches(nodes);
    const branchOf = {};
    for (const b of branches) {
      const bn = this._virtual("b:" + b.id, b.name || b.id, b.icon || "mdi:lan", b.ip);
      bn.kind = b.kind || "Ramo della rete";
      if (b.entity) this._statusFromEntity(bn, b.entity);
      bn.parentKey = b.parent || "root";
      byId[bn.id] = bn;
      for (const i of b.integrations || []) branchOf[i] = bn.id;
      for (const nm of b.devices || []) branchOf["dev:" + nm] = bn.id;
    }
    const other = this._virtual("b:altri", "Altri dispositivi", "mdi:devices");
    other.kind = "Ramo della rete";
    byId[other.id] = other;

    // collegamenti: impostazione manuale > mesh Zigbee > via_device > ramo dell'integrazione
    const byName = {};
    for (const n of nodes) for (const k of [n.rawName, n.name]) if (!byName[k]) byName[k] = n.id;
    const mesh = this._zb && this._zb.parents;
    const resolve = (key) => {
      if (!key) return null;
      if (key === "root") return "root";
      if (byId["b:" + key]) return "b:" + key;
      if (byId[key]) return key;
      if (byName[key]) return byName[key];
      return null;
    };
    for (const n of nodes) {
      let p = resolve(n.o.parent);
      if (!p && mesh && n.integ === "zigbee2mqtt" && !n.bridge) {
        const ieee = Object.keys(ieeeToId).find((k) => ieeeToId[k] === n.id);
        const pi = ieee && mesh[ieee];
        if (pi && ieeeToId[pi] && ieeeToId[pi] !== n.id) p = ieeeToId[pi];
        if (ieee && this._zb.lqi && this._zb.lqi[ieee] != null) n.lqi = this._zb.lqi[ieee];
      }
      if (!p && n.via && byId[n.via]) p = n.via;
      if (!p) p = branchOf["dev:" + n.rawName] || branchOf["dev:" + n.name] || branchOf[n.integ] || other.id;
      n.parentKey = p;
    }
    for (const id of Object.keys(byId)) {
      const n = byId[id];
      if (id === "root") continue;
      let p = n.parentKey && byId[n.parentKey] ? n.parentKey : "root";
      // niente anelli (A sotto B sotto A): in quel caso si attacca alla radice
      let q = p, guard = 0;
      while (q && q !== "root" && guard++ < 50) { if (q === id) { p = "root"; break; } q = byId[q].parentKey; }
      n.parent = byId[p];
      n.parent.children.push(n);
    }
    // rami vuoti via
    for (const id of Object.keys(byId)) {
      const n = byId[id];
      if (n.virtual && id !== "root" && !n.children.length && n.parent) {
        n.parent.children = n.parent.children.filter((c) => c !== n);
        delete byId[id];
      }
    }
    // livelli troppo affollati: si dividono per tipo
    const over = Number(C.group_over) || 12;
    const groupLevel = (n) => {
      // un gruppo non si ridivide (tutti i figli hanno già lo stesso tipo)
      if (n.children.length > over && !n.group) {
        const by = {};
        for (const c of n.children) if (!c.children.length && !c.virtual) (by[c.cat] = by[c.cat] || []).push(c);
        const keep = n.children.filter((c) => c.children.length || c.virtual);
        for (const cat of NMC_CATS) {
          const arr = by[cat.k];
          if (!arr) continue;
          if (arr.length < 2) { keep.push(...arr); continue; }
          const g = this._virtual(n.id + "/" + cat.k, cat.n, cat.i);
          g.kind = "Gruppo di " + n.name;
          g.group = true;
          g.parent = n;
          g.children = arr;
          for (const c of arr) c.parent = g;
          byId[g.id] = g;
          keep.push(g);
        }
        n.children = keep;
      }
      n.children.sort((a, b) => (b.children.length ? 1 : 0) - (a.children.length ? 1 : 0) || a.name.localeCompare(b.name, "it"));
      for (const c of n.children) groupLevel(c);
    };
    groupLevel(root);
    // stato dei nodi senza entità propria: dai figli
    const agg = (n) => {
      let on = 0, off = 0, tot = 0, low = 0, away = 0;
      for (const c of n.children) {
        agg(c);
        if (!c.virtual) { tot++; if (c.status === "on") on++; else if (c.status === "off") off++; else if (c.status === "away") away++; if (c.batLow) low++; }
        on += c.dOn; off += c.dOff; tot += c.dTot; low += c.dLow; away += c.dAway;
      }
      Object.assign(n, { dOn: on, dOff: off, dTot: tot, dLow: low, dAway: away });
      if (n.virtual && !n.ownEntity) n.status = on ? "on" : (off ? "off" : (away ? "away" : "unknown"));
      // un ramo spento spegne tutto quello che ci sta sotto (dal punto di vista della rete)
    };
    agg(root);
    if (!rootC.entity && root.status !== "off") root.status = "on";
    const zbBridge = nodes.find((n) => n.bridge);
    return { root, byId, nodes, sig: sigParts.join(",") + "|" + (this._zb ? this._zb.time : ""), bridge: zbBridge ? zbBridge.id : null, ieeeToId };
  }

  _virtual(id, name, icon, ip) {
    return { id, name, icon, ip: ip || "", virtual: true, children: [], status: "unknown", cat: "other", o: {} };
  }

  _mainPlatform(list) {
    const c = {};
    for (const e of list) if (e.platform) c[e.platform] = (c[e.platform] || 0) + 1;
    let best = null;
    for (const k of Object.keys(c)) if (!best || c[k] > c[best]) best = k;
    return best;
  }

  _statusFromEntity(n, eid) {
    const s = this._hass.states[eid];
    n.ownEntity = true;
    if (!s) { n.status = "unknown"; return; }
    const off = ["off", "unavailable", "unknown", "not_home", "offline", "disconnected", "false", "dead"].includes(String(s.state).toLowerCase());
    n.status = off ? "off" : "on";
    if (off) n.seen = s.last_changed;
  }

  _status(n, list, states, o, lowB) {
    const H = this._hass;
    if (o.entity) this._statusFromEntity(n, o.entity);
    else {
      // status: availability → si ignora un eventuale sensore "connectivity" (alcune integrazioni lo usano per altro)
      const conn = o.status !== "availability" && states.find((s) => s.attributes.device_class === "connectivity" && s.entity_id.startsWith("binary_sensor."));
      const trk = states.find((s) => s.entity_id.startsWith("device_tracker.") && s.attributes.source_type !== "bluetooth_le");
      if (conn) this._statusFromEntity(n, conn.entity_id);
      else if (n.integ === "mobile_app" && trk) {
        n.status = trk.state === "home" ? "on" : (NMC_OFF.includes(trk.state) ? "unknown" : "away");
        n.where = trk.state === "home" ? "A casa" : (trk.state === "not_home" ? "Fuori casa" : trk.state);
      } else {
        // spento = tutte le entità principali (non diagnostiche) non disponibili
        const prim = list.filter((e) => !e.entity_category).map((e) => H.states[e.entity_id]).filter(Boolean);
        const pool = prim.length ? prim : states;
        const avail = pool.filter((s) => !NMC_OFF.includes(s.state));
        n.status = !pool.length ? "unknown" : (avail.length ? "on" : "off");
        if (n.status === "off") n.seen = pool.map((s) => s.last_changed).sort().pop();
        else if (pool.every((s) => s.state === "unknown")) n.status = "unknown";
      }
    }
    const bs = states.find((s) => s.attributes.device_class === "battery" && s.entity_id.startsWith("sensor.") && !isNaN(parseFloat(s.state)));
    if (bs) { n.bat = Math.round(parseFloat(bs.state)); n.batLow = n.bat <= lowB; }
    else {
      const bl = states.find((s) => s.attributes.device_class === "battery" && s.entity_id.startsWith("binary_sensor."));
      if (bl && !NMC_OFF.includes(bl.state)) n.batLow = bl.state === "on";
    }
  }

  _ip(d, states, name) {
    const ipre = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipre.test(name)) return name;
    if (d.configuration_url) {
      const m = String(d.configuration_url).match(/^[a-z]+:\/\/((\d{1,3}\.){3}\d{1,3})/i);
      if (m) return m[1];
    }
    for (const s of states) {
      const a = s.attributes;
      for (const k of ["ip_address", "ip", "host", "local_ip"]) if (a[k] && ipre.test(String(a[k]))) return String(a[k]);
    }
    return "";
  }

  _category(list, states, integ, text) {
    if (integ === "mobile_app") return "phone";
    const dom = new Set(list.filter((e) => !e.entity_category).map((e) => e.entity_id.split(".")[0]));
    const dc = new Set(states.map((s) => s.attributes.device_class).filter(Boolean));
    if (dom.has("cover")) return "cover";
    if (dom.has("lock")) return "lock";
    if (dom.has("camera")) return "camera";
    if (dom.has("media_player")) return "media";
    if (dom.has("climate") || dom.has("fan") || dom.has("humidifier")) return "climate";
    if (dom.has("switch") && (dc.has("power") || dc.has("energy") || /plug|presa|socket|outlet/.test(text || ""))) return "plug";
    if (dom.has("light") || dom.has("switch")) return "light";
    if (dc.has("door") || dc.has("window") || dc.has("opening") || dc.has("garage_door")) return "door";
    if (dc.has("motion") || dc.has("occupancy") || dc.has("presence")) return "motion";
    if (dc.has("smoke") || dc.has("gas") || dc.has("carbon_monoxide") || (dc.has("moisture") && dom.has("binary_sensor") && !dom.has("sensor"))) return "safety";
    if (dc.has("moisture") && dom.has("sensor")) return "plant";
    if (dom.has("sensor") || dom.has("binary_sensor") || dom.has("weather")) return "sensor";
    return "other";
  }

  _icon(n, states) {
    const t = (n.name + " " + n.model + " " + n.manufacturer).toLowerCase();
    if (n.bridge) return "mdi:zigbee";
    const byInt = { mobile_app: "mdi:cellphone", webostv: "mdi:television", dlna_dmr: "mdi:television", playstation_network: "mdi:sony-playstation",
      reolink: "mdi:cctv", bticino_intercom: "mdi:doorbell-video", nut: "mdi:power-plug-battery", zwave_js: "mdi:usb-flash-drive",
      jellyfin: "mdi:server-network", qbittorrent: "mdi:download-network", hon: "mdi:washing-machine", ibeacon: "mdi:bluetooth", ping: "mdi:lan-connect",
      open_pico: "mdi:air-filter", netatmo: "mdi:home-thermometer", shelly: t.includes("display") ? "mdi:tablet" : "mdi:chip" };
    if (t.includes("echo show") || t.includes("media_display")) return "mdi:tablet-dashboard";
    if (t.includes("echo")) return "mdi:speaker";
    if (t.includes("fire tv")) return "mdi:television-play";
    if (n.integ === "alexa_media") return "mdi:speaker-wireless";
    if (t.includes("forno") || t.includes("oven")) return "mdi:stove";
    if (t.includes("frigo") || t.includes("ref")) return "mdi:fridge";
    if (t.includes("gateway")) return "mdi:router-network";
    if (t.includes("fingerbot")) return "mdi:gesture-tap-button";
    if (t.includes("valve") || t.includes("rubinetto")) return "mdi:valve";
    if (t.includes("meteo") || t.includes("weather")) return "mdi:weather-partly-cloudy";
    if (byInt[n.integ]) return byInt[n.integ];
    if (n.cat === "safety" && t.includes("acqua")) return "mdi:water-alert";
    const c = NMC_CATS.find((x) => x.k === n.cat);
    const own = states.find((s) => s.attributes.icon && !s.entity_id.startsWith("sensor."));
    return (own && own.attributes.icon) || (c ? c.i.replace("-group", "") : "mdi:devices");
  }

  _kind(n) {
    const names = { zigbee2mqtt: "Zigbee", mobile_app: "Telefono", alexa_media: "Alexa", webostv: "LG webOS", tuya: "Tuya", smartthings: "SmartThings",
      zwave_js: "Z-Wave", shelly: "Shelly", reolink: "Reolink", playstation_network: "PlayStation", dlna_dmr: "DLNA", hon: "hOn", nut: "UPS",
      ibeacon: "Bluetooth", ping: "Ping", jellyfin: "Jellyfin", qbittorrent: "qBittorrent", bticino_intercom: "BTicino", open_pico: "Tecnosystemi" };
    const via = names[n.integ] || n.integ;
    const m = n.bridge ? "Coordinatore" : (n.model || n.manufacturer || "");
    return m ? `${via} · ${m}` : via;
  }

  // senza "branches" nella config: un ramo per integrazione
  _autoBranches(nodes) {
    const seen = {};
    for (const n of nodes) if (!(n.via && nodes.some((x) => x.id === n.via))) seen[n.integ] = (seen[n.integ] || 0) + 1;
    return Object.keys(seen).sort().map((i) => ({ id: i, name: this._kind({ integ: i }), integrations: [i], icon: "mdi:lan" }));
  }

  // ---------------------------------------------------------------- mesh Zigbee2MQTT
  async _scanZigbee() {
    if (this._zbBusy || !this._hass) return;
    const base = (this._config.zigbee2mqtt && this._config.zigbee2mqtt.base_topic) || "zigbee2mqtt";
    this._zbBusy = true; this._zbErr = ""; this._render();
    let unsub = null, timer = null;
    try {
      const got = new Promise((resolve, reject) => {
        timer = setTimeout(() => reject(new Error("Zigbee2MQTT non ha risposto entro 3 minuti.")), 180000);
        this._hass.connection.subscribeMessage((msg) => {
          try {
            const p = typeof msg.payload === "string" ? JSON.parse(msg.payload) : msg.payload;
            if (p && p.status === "ok" && p.data && p.data.value) resolve(p.data.value);
            else if (p && p.status === "error") reject(new Error(p.error || "Zigbee2MQTT ha risposto con un errore."));
          } catch (e) { /* messaggio non nostro */ }
        }, { type: "mqtt/subscribe", topic: `${base}/bridge/response/networkmap` }).then((u) => { unsub = u; }, reject);
      });
      await new Promise((r) => setTimeout(r, 400));
      await this._hass.callService("mqtt", "publish", { topic: `${base}/bridge/request/networkmap`, payload: JSON.stringify({ type: "raw", routes: false }) });
      const map = await got;
      this._zb = this._parseMesh(map);
      try { localStorage.setItem("nmc-zigbee", JSON.stringify(this._zb)); } catch (e) { /* spazio pieno o vietato */ }
    } catch (e) {
      const m = (e && e.message) || String(e);
      this._zbErr = /unauthorized|admin/i.test(m) ? "Serve un utente amministratore per leggere la mesh." : m;
    } finally {
      clearTimeout(timer);
      if (unsub) try { unsub(); } catch (e) { /* già chiusa */ }
      this._zbBusy = false;
      this._update(true);
    }
  }

  // dai vicini che ogni router riporta si ricava il "padre" di ogni dispositivo
  _parseMesh(v) {
    const ie = (x) => String((x && (x.ieeeAddr || x.ieee_address)) || x || "").toLowerCase();
    const nodes = v.nodes || [], links = v.links || [];
    const coord = ie(nodes.find((n) => n.type === "Coordinator") || {});
    const type = {}, depth = {}, best = {}, lqi = {};
    for (const n of nodes) type[ie(n)] = n.type;
    const cand = (child, parent, q) => {
      if (!child || !parent || child === parent) return;
      if (!best[child] || q > best[child].q) best[child] = { p: parent, q };
    };
    for (const l of links) {
      const s = ie(l.source || l.sourceIeeeAddr), t = ie(l.target || l.targetIeeeAddr);
      const q = Number(l.lqi != null ? l.lqi : l.linkquality) || 0;
      if (l.depth != null && l.depth < 255) depth[s] = Math.min(depth[s] == null ? 99 : depth[s], l.depth);
      if (l.relationship === 1) cand(s, t, q + 1000);        // s è figlio di t
      else if (l.relationship === 0) cand(t, s, q + 1000);   // s è padre di t
      lqi[s] = Math.max(lqi[s] || 0, q);
    }
    // router senza padre dichiarato: il vicino meno profondo con il segnale migliore
    for (const l of links) {
      const s = ie(l.source || l.sourceIeeeAddr), t = ie(l.target || l.targetIeeeAddr);
      const q = Number(l.lqi != null ? l.lqi : l.linkquality) || 0;
      for (const [a, b] of [[s, t], [t, s]]) {
        if (a === coord || (best[a] && best[a].q >= 1000)) continue;
        const da = depth[a] == null ? 99 : depth[a], db = b === coord ? 0 : (depth[b] == null ? 99 : depth[b]);
        if (db < da) cand(a, b, q);
      }
    }
    const parents = {};
    for (const n of nodes) {
      const id = ie(n);
      if (id === coord) continue;
      parents[id] = best[id] ? best[id].p : coord;
    }
    return { time: Date.now(), parents, lqi, coord, count: nodes.length };
  }

  // ---------------------------------------------------------------- disegno
  _view() {
    const v = this._mode || this._config.view;
    if (v === "orbit" || v === "list") return v;
    return (this._width || this.clientWidth || 800) >= (Number(this._config.breakpoint) || 720) ? "orbit" : "list";
  }

  _render() {
    if (!this._tree) return;
    const view = this._view();
    const t = this._tree;
    const r = t.root;
    const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    this._esc = esc;
    const st = this._filter;
    const seg = `<div class="seg" role="group" aria-label="Vista">
      <button type="button" data-mode="orbit" aria-pressed="${view === "orbit"}">Mappa</button>
      <button type="button" data-mode="list" aria-pressed="${view === "list"}">Elenco</button></div>`;
    const sum = `<div class="sum">
      <button type="button" class="stat" data-f="all" aria-pressed="${view === "list" && st === "all"}"><span class="led on"></span><b>${r.dOn}</b> connessi</button>
      <button type="button" class="stat" data-f="off" aria-pressed="${view === "list" && st === "off"}"><span class="led off"></span><b>${r.dOff}</b> non connessi</button>
      <button type="button" class="stat" data-f="bat" aria-pressed="${view === "list" && st === "bat"}"><span class="led warn"></span><b>${r.dLow}</b> batteria bassa</button>
      ${r.dAway ? `<span class="stat" style="cursor:default"><span class="led away"></span><b>${r.dAway}</b> fuori casa</span>` : ""}</div>`;
    const body = view === "orbit" ? this._orbitHTML() : this._listHTML();
    const zb = this._zbHTML();
    // si conserva lo scroll dell'elenco "da controllare"
    const old = this._root.querySelector(".issues");
    const sc = old ? old.scrollTop : 0;
    this._root.innerHTML = `<style>${NMC_STYLE}</style><div class="card">
      <div class="head"><h2><ha-icon icon="${esc(this._config.icon || "mdi:lan")}"></ha-icon>${esc(this._config.title)}</h2>${seg}</div>
      ${sum}${body}${zb}</div>`;
    const ni = this._root.querySelector(".issues");
    if (ni) ni.scrollTop = sc;
    this._bind();
  }

  _batHTML(n) {
    if (n.bat == null) return n.batLow ? '<span class="bat" style="color:var(--nmc-warn)">batteria bassa</span>' : "";
    const c = n.bat <= (Number(this._config.low_battery) || 20) ? "var(--nmc-bad)" : n.bat <= 40 ? "var(--nmc-warn)" : "var(--nmc-ok)";
    return `<span class="bat"><i style="--p:${Math.max(4, Math.min(100, n.bat))};--c:${c}"></i>${n.bat}%</span>`;
  }

  _ago(iso) {
    if (!iso) return "";
    const s = (new Date(iso).getTime() - Date.now()) / 1000;
    const rtf = new Intl.RelativeTimeFormat("it", { numeric: "auto" });
    const a = Math.abs(s);
    if (a < 60) return "adesso";
    if (a < 3600) return rtf.format(Math.round(s / 60), "minute");
    if (a < 86400) return rtf.format(Math.round(s / 3600), "hour");
    return rtf.format(Math.round(s / 86400), "day");
  }

  _sub(n) {
    if (n.virtual || n.children.length) {
      const tot = n.dTot || 0;
      const away = n.dAway ? ` · ${n.dAway} fuori` : "";
      return `${n.dOn}/${tot} online${away}`;
    }
    if (n.status === "off") return "offline" + (n.seen ? " " + this._ago(n.seen) : "");
    if (n.status === "away") return n.where || "fuori casa";
    const bits = [];
    if (n.ip) bits.push(n.ip);
    if (n.bat != null) bits.push(n.bat + "%");
    if (!bits.length) bits.push(n.area || n.kind.split(" · ")[0]);
    return bits.join(" · ");
  }

  _path(n) { const p = []; while (n) { p.unshift(n); n = n.parent; } return p; }

  _orbitHTML() {
    const esc = this._esc, t = this._tree;
    const f = t.byId[this._focus] || t.root;
    const kids = f.children;
    const W = 620, C = W / 2;
    const dense = kids.length > 12;
    const R1 = dense ? 255 : (kids.length > 8 ? 225 : 205), R2 = 170;
    const crumbs = this._path(f).map((n, i, a) => `${i ? '<span class="sep">›</span>' : ""}<button type="button" data-go="${esc(n.id)}" ${i === a.length - 1 ? 'aria-current="true"' : ""}>${esc(n.name)}</button>`).join("");
    let lines = "", nodes = "";
    const step = 360 / Math.max(1, kids.length);
    kids.forEach((n, i) => {
      const R = dense ? (i % 2 ? R2 : R1) : R1;
      const a = (-90 + i * step) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
      const x = C + R * ca, y = C + R * sa;
      const cls = n.status === "off" ? "off" : (n.status === "away" ? "away" : "");
      lines += `<line class="ln ${cls}" x1="${(C + 60 * ca).toFixed(1)}" y1="${(C + 60 * sa).toFixed(1)}" x2="${(x - 30 * ca).toFixed(1)}" y2="${(y - 30 * sa).toFixed(1)}"/>`;
      const side = Math.abs(ca) < 0.3 ? (sa > 0 ? "b" : "t") : (ca > 0 ? "r" : "l");
      const k = n.children.length > 0;
      const bad = k && n.dOff ? `<b class="bad">${n.dOff}</b>` : "";
      const low = (n.batLow || (k && n.dLow)) ? '<i class="lowb"></i>' : "";
      const cnt = k ? `<b class="cnt">${n.children.length}</b>` : "";
      const flag = n.status === "off" || n.batLow || (k && (n.dOff || n.dLow)) ? "flag" : "";
      nodes += `<button type="button" class="nd ${k ? "k" : ""} ${n.status} ${flag}" data-n="${esc(n.id)}" style="left:${(x / W * 100).toFixed(2)}%;top:${(y / W * 100).toFixed(2)}%"
        aria-label="${esc(n.name)}, ${n.status === "on" ? "connesso" : n.status === "off" ? "non connesso" : n.status === "away" ? "fuori casa" : "stato sconosciuto"}${k ? ", apri" : ""}">
        <span class="disc"><ha-icon icon="${esc(n.icon)}"></ha-icon><i class="led ${n.status}"></i>${cnt}${bad}${low}</span>
        <span class="lbl ${side}"><b>${esc(n.name)}</b><small>${esc(this._sub(n))}</small></span></button>`;
    });
    const rings = dense ? `<circle class="ring" cx="${C}" cy="${C}" r="${R1}"/><circle class="ring" cx="${C}" cy="${C}" r="${R2}"/>` : `<circle class="ring" cx="${C}" cy="${C}" r="${R1}"/>`;
    const svg = `<svg viewBox="0 0 ${W} ${W}" aria-hidden="true"><defs><radialGradient id="nmc-halo"><stop offset="0" stop-color="var(--nmc-a1)" stop-opacity=".42"/><stop offset="1" stop-color="var(--nmc-a1)" stop-opacity="0"/></radialGradient></defs>
      <circle class="halo" cx="${C}" cy="${C}" r="150"/>${rings}${lines}</svg>`;
    const core = `<button type="button" class="core ${f.status === "off" ? "off" : ""}" data-core="1" aria-label="${f.parent ? "Torna a " + esc(f.parent.name) : esc(f.name)}">
      <ha-icon icon="${esc(f.icon)}"></ha-icon><b>${esc(f.name)}</b><small>${esc(f.ip || (f.virtual ? `${f.dOn}/${f.dTot} online` : f.kind.split(" · ")[0]))}</small>${f.parent ? "<em>‹ indietro</em>" : ""}</button>`;
    const empty = kids.length ? "" : `<div class="none" style="position:absolute;left:0;right:0;top:70%;text-align:center">Nessun dispositivo collegato qui.</div>`;
    const wide = (this._width || 900) >= 900;
    return `<div class="olay ${wide ? "wide" : ""}"><div class="ostage"><nav class="crumbs" aria-label="Percorso">${crumbs}</nav>
      <div class="orbit ${dense ? "dense" : ""}"><div class="lvl ${this._dir}">${svg}${nodes}${core}${empty}</div></div>
      <div class="legend"><span><span class="led on"></span>connesso</span><span><span class="led off"></span>non connesso</span>
        <span><span class="led warn"></span>batteria ≤ ${Number(this._config.low_battery) || 20}%</span><span><span class="led away"></span>fuori casa</span>
        <span>numero sotto il cerchio = dispositivi dentro, bollino rosso = offline dentro</span></div></div>
      <aside class="side">${this._detailHTML()}${dense ? this._levelHTML(f) : ""}${this._issuesHTML()}</aside></div>`;
  }

  _detailHTML() {
    const esc = this._esc, t = this._tree;
    const n = t.byId[this._sel] || t.byId[this._focus] || t.root;
    const k = n.children.length > 0;
    const stTxt = { on: "Connesso", off: "Non connesso", away: "Fuori casa", unknown: "Sconosciuto" }[n.status];
    const rows = [["Tipo", n.kind || (n.virtual ? "Gruppo" : "")]];
    rows.push(["Stato", stTxt + (n.status === "off" && n.seen ? " · " + this._ago(n.seen) : "") + (n.status === "away" && n.where ? "" : "")]);
    if (n.ip) rows.push(["Indirizzo", n.ip]);
    else if (n.integ === "zigbee2mqtt") rows.push(["Rete", "Zigbee, senza IP"]);
    if (n.area) rows.push(["Stanza", n.area]);
    if (n.parent) rows.push(["Collegato a", n.parent.name]);
    if (n.lqi != null) rows.push(["Segnale Zigbee", `${n.lqi} / 255`]);
    if (k) rows.push(["Dentro", `${n.dOn}/${n.dTot} online` + (n.dOff ? ` · ${n.dOff} offline` : "") + (n.dLow ? ` · ${n.dLow} batteria bassa` : "")]);
    const bat = (n.bat != null || n.batLow) ? `<dt>Batteria</dt><dd>${this._batHTML(n)}</dd>` : "";
    const acts = [];
    if (k && n.id !== this._focus) acts.push(`<button type="button" class="btn pri" data-go="${esc(n.id)}"><ha-icon icon="mdi:arrow-expand-all"></ha-icon>Apri</button>`);
    if (n.deviceId) acts.push(`<button type="button" class="btn" data-dev="${esc(n.deviceId)}"><ha-icon icon="mdi:open-in-new"></ha-icon>Scheda dispositivo</button>`);
    return `<div class="panel" aria-live="polite"><span class="eyebrow">${n.id === this._focus ? "Al centro" : (k ? "Nodo" : "Dispositivo")}</span>
      <h3><span class="led ${n.status}"></span><span>${esc(n.name)}</span></h3>
      <dl class="kv">${rows.map((r) => `<dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd>`).join("")}${bat}</dl>
      ${acts.length ? `<div class="acts">${acts.join("")}</div>` : ""}</div>`;
  }

  // nei livelli affollati i nomi stanno qui accanto, non sulla mappa
  _levelHTML(f) {
    const esc = this._esc;
    const kids = [...f.children].sort((a, b) => (a.status === "off" ? 0 : 1) - (b.status === "off" ? 0 : 1) || a.name.localeCompare(b.name, "it"));
    const items = kids.map((n) => `<li><button type="button" data-pick="${esc(n.id)}"><span class="led ${n.status}"></span>
      <span class="nm">${esc(n.name)}</span><small>${esc(this._sub(n))}</small></button></li>`).join("");
    return `<div class="panel"><span class="eyebrow">In questo livello · ${kids.length}</span><ul class="issues">${items}</ul></div>`;
  }

  _issues() {
    return this._tree.nodes.filter((n) => this._tree.byId[n.id] && (n.status === "off" || n.batLow))
      .sort((a, b) => (a.status === "off" ? 0 : 1) - (b.status === "off" ? 0 : 1) || a.name.localeCompare(b.name, "it"));
  }

  _issuesHTML() {
    const esc = this._esc, list = this._issues();
    const items = list.map((n) => `<li><button type="button" data-jump="${esc(n.id)}"><span class="led ${n.status === "off" ? "off" : "warn"}"></span>
      <span class="nm">${esc(n.name)}</span><small>${n.status === "off" ? "offline" + (n.seen ? " " + esc(this._ago(n.seen)) : "") : "batteria " + (n.bat != null ? n.bat + "%" : "bassa")}</small></button></li>`).join("");
    return `<div class="panel"><span class="eyebrow">Da controllare · ${list.length}</span>${list.length ? `<ul class="issues">${items}</ul>` : '<span class="none">Tutto connesso, batterie a posto.</span>'}</div>`;
  }

  _listHTML() {
    const esc = this._esc, t = this._tree, F = this._filter;
    const match = (n) => F === "all" || (F === "off" && n.status === "off") || (F === "bat" && n.batLow);
    const vis = (n) => (!n.virtual && match(n)) || n.children.some(vis);
    const onPath = new Set(this._path(t.byId[this._focus] || t.root).map((n) => n.id));
    const row = (n) => `<div class="row ${n.status}" data-sel="${esc(n.id)}" role="button" tabindex="0"><span class="led ${n.status}"></span><ha-icon icon="${esc(n.icon)}"></ha-icon>
      <span class="rn">${esc(n.name)}</span>
      <span class="ri">${esc(n.status === "off" ? ("visto " + (this._ago(n.seen) || "—")) + (n.ip ? " · " + n.ip : "") : (n.status === "away" ? (n.where || "fuori casa") : (n.ip || n.kind)))}</span>
      <span class="rs ${n.status}">${{ on: "Online", off: "Offline", away: "Fuori", unknown: "?" }[n.status]}${this._batHTML(n)}</span></div>`;
    const grp = (n) => {
      const kids = n.children.filter((c) => F === "all" || vis(c));
      const open = F !== "all" || this._open.has(n.id) || (onPath.has(n.id) && !this._closed.has(n.id));
      const self = n.virtual ? "" : row(n);
      return `<details class="g" data-g="${esc(n.id)}" ${open ? "open" : ""}><summary><span class="led ${n.status}"></span><ha-icon icon="${esc(n.icon)}"></ha-icon>
        <span class="gn">${esc(n.name)}</span><span class="gs">${n.dOff ? `<span class="badge">${n.dOff} offline</span>` : ""}${n.dOn}/${n.dTot}<span class="chev"></span></span></summary>
        <div class="gb">${self}${kids.map((c) => (c.children.length ? grp(c) : row(c))).join("") || '<div class="empty">Niente da segnalare qui.</div>'}</div></details>`;
    };
    const top = t.root.children.filter((c) => F === "all" || vis(c));
    return `<div class="groups">${top.length ? top.map((c) => (c.children.length ? grp(c) : row(c))).join("") : '<div class="empty">Nessun dispositivo con questo filtro.</div>'}</div>
      ${this._sel && t.byId[this._sel] ? `<div class="side">${this._detailHTML()}</div>` : ""}`;
  }

  _zbHTML() {
    const C = this._config;
    if (C.zigbee2mqtt === false || !this._tree.bridge) return "";
    const z = this._zb;
    const when = z ? new Date(z.time).toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "";
    const txt = this._zbBusy ? "Lettura della mesh Zigbee in corso: può servire un minuto."
      : (this._zbErr ? this._zbErr : (z ? `Mesh Zigbee letta il ${when}: ogni dispositivo sta sotto il ripetitore da cui passa.` : "Mesh Zigbee non letta: i dispositivi Zigbee sono raggruppati per tipo sotto il coordinatore."));
    return `<div class="zb"><ha-icon icon="mdi:zigbee"></ha-icon><span>${this._esc(txt)}</span>
      <button type="button" class="btn" data-zb="1" ${this._zbBusy ? "disabled" : ""}><ha-icon icon="mdi:radar"></ha-icon>${z ? "Aggiorna la mesh" : "Leggi la mesh"}</button></div>`;
  }

  _bind() {
    const R = this._root, t = this._tree;
    const go = (id, dir) => {
      const n = t.byId[id];
      if (!n) return;
      const tgt = n.children.length ? n : (n.parent || t.root);
      const was = t.byId[this._focus] || t.root;
      this._dir = dir || (this._path(tgt).includes(was) ? "down" : "up");
      this._focus = tgt.id;
      this._sel = n.children.length ? null : n.id;
      this._render();
    };
    R.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => {
      this._mode = b.dataset.mode;
      try { localStorage.setItem("nmc-view", this._mode); } catch (e) { /* niente */ }
      this._dir = ""; this._render();
    }));
    R.querySelectorAll(".stat[data-f]").forEach((b) => b.addEventListener("click", () => {
      if (this._view() === "orbit") { const l = R.querySelector(".issues"); if (l) l.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
      this._filter = b.dataset.f; this._render();
    }));
    R.querySelectorAll(".crumbs [data-go]").forEach((b) => b.addEventListener("click", () => { if (b.getAttribute("aria-current") !== "true") go(b.dataset.go, "up"); }));
    R.querySelectorAll(".nd[data-n]").forEach((b) => b.addEventListener("click", () => {
      const n = t.byId[b.dataset.n];
      if (n.children.length) go(n.id, "down");
      else { this._sel = n.id; this._dir = ""; const p = R.querySelector(".side .panel"); if (p) p.outerHTML = this._detailHTML(); this._bindDetail(); }
    }));
    const core = R.querySelector(".core");
    if (core) core.addEventListener("click", () => {
      const f = t.byId[this._focus] || t.root;
      if (f.parent) go(f.parent.id, "up");
      else { this._sel = null; this._dir = ""; this._render(); }
    });
    R.querySelectorAll("[data-jump]").forEach((b) => b.addEventListener("click", () => go(b.dataset.jump)));
    R.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
      const nd = R.querySelector(`.nd[data-n="${CSS.escape(b.dataset.pick)}"]`);
      if (nd) { nd.click(); nd.focus({ preventScroll: true }); }
    }));
    R.querySelectorAll("details.g").forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) { this._open.add(d.dataset.g); this._closed.delete(d.dataset.g); }
      else { this._open.delete(d.dataset.g); this._closed.add(d.dataset.g); }
    }));
    R.querySelectorAll(".row[data-sel]").forEach((r) => {
      const act = () => { this._sel = this._sel === r.dataset.sel ? null : r.dataset.sel; this._render();
        const p = this._root.querySelector(".groups + .side"); if (p) p.scrollIntoView({ behavior: "smooth", block: "nearest" }); };
      r.addEventListener("click", act);
      r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
    });
    const zb = R.querySelector("[data-zb]");
    if (zb) zb.addEventListener("click", () => this._scanZigbee());
    this._bindDetail();
  }

  _bindDetail() {
    const R = this._root, t = this._tree;
    R.querySelectorAll(".side [data-go]").forEach((b) => {
      if (b._b) return; b._b = 1;
      b.addEventListener("click", () => { const n = t.byId[b.dataset.go]; if (n) { this._dir = "down"; this._focus = n.id; this._sel = null; this._render(); } });
    });
    R.querySelectorAll("[data-dev]").forEach((b) => {
      if (b._b) return; b._b = 1;
      b.addEventListener("click", () => {
        history.pushState(null, "", "/config/devices/device/" + b.dataset.dev);
        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
      });
    });
  }
}

if (!customElements.get("network-map-card")) {
  customElements.define("network-map-card", NetworkMapCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "network-map-card")) {
  window.customCards.push({
    type: "network-map-card",
    name: "Mappa della rete",
    description: "Dispositivi connessi e non connessi, IP e batteria: orbita a cascata su PC/tablet, pannelli sul telefono",
  });
}
