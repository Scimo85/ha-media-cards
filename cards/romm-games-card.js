/* romm-games-card v1.2.1 — giochi di RomM in cartelle per console; legge /local/romm/giochi.json (scritto da ~/romm-ha/sync.py) */
const RGC_STYLE = `
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
input.q { flex: 1; min-width: 160px; background: color-mix(in srgb, var(--qa-shade, #000) 35%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 18%, transparent); border-radius: 999px;
  color: var(--qa-text, #C8F4FA); font-size: 14px; padding: 8px 14px; outline: none; }
input.q:focus { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 70%, transparent); box-shadow: 0 0 12px color-mix(in srgb, var(--qa-glow, #4DE8F4) 20%, transparent); }
input.q::placeholder { color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); }
button.back { display: flex; align-items: center; gap: 4px; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 4%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent);
  border-radius: 999px; color: var(--qa-acc, #7FF0FA); font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 7px 14px 7px 8px; cursor: pointer; box-shadow: 0 0 14px color-mix(in srgb, var(--qa-glow, #4DE8F4) 25%, transparent); max-width: 100%; }
button.back ha-icon { --mdc-icon-size: 18px; flex: none; }
button.back span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.grp { margin: 4px 0 10px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.grp:not(:first-child) { margin-top: 20px; }
.folders { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.fd { cursor: pointer; min-width: 0; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); border-radius: 10px; background: color-mix(in srgb, var(--qa-shade, #000) 25%, transparent);
  padding: 10px; display: flex; flex-direction: column; gap: 6px; transition: all 220ms ease; }
.fd:hover { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
.fd.empty { opacity: 0.55; }
.fd.empty:hover { opacity: 1; }
.fd .lg { position: relative; height: 64px; display: flex; align-items: center; justify-content: center; }
.fd .lg img { max-width: 100%; max-height: 64px; object-fit: contain; display: block; border-radius: 4px; }
.fd .lg ha-icon { --mdc-icon-size: 34px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.fd .cnt { position: absolute; top: -4px; right: -2px; min-width: 22px; padding: 1px 7px; border-radius: 999px; text-align: center;
  font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 14%, transparent); color: var(--qa-acc, #7FF0FA); }
.fd.empty .cnt { background: color-mix(in srgb, var(--qa-faint, #5F8794) 15%, transparent); color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); }
.fd .fn { font-size: 13px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.fd .fp { font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); font-family: monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status code { color: var(--qa-acc, #7FF0FA); font-size: 13px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 12px; }
.gm { cursor: pointer; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.cv { position: relative; aspect-ratio: 3 / 4; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 12%, transparent); border-radius: 10px; overflow: hidden;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); display: flex; align-items: center; justify-content: center; transition: all 220ms ease; }
.gm:hover .cv, .gm.sel .cv { border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 85%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 30%, transparent); }
.cv img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.cv .ph { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 8px; text-align: center; }
.cv .ph ha-icon { --mdc-icon-size: 30px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.cv .ph span { font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); letter-spacing: 0.05em; text-transform: uppercase; }
.gn { font-size: 13px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.gs { font-size: 11px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status { padding: 30px 0; text-align: center; color: color-mix(in srgb, var(--qa-faint, #5F8794) 90%, transparent); font-size: 14px; line-height: 1.5; }
.more { display: flex; justify-content: center; margin-top: 14px; }
.more button, .play a.go, .play button.dev { background: color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 60%, transparent); border-radius: 999px; color: var(--qa-acc, #7FF0FA);
  font-family: inherit; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; padding: 8px 18px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; text-decoration: none; }
.play { display: none; margin: 0 0 16px; padding: 14px; border: 1px solid color-mix(in srgb, var(--qa-glow, #4DE8F4) 40%, transparent); border-radius: 12px;
  background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent); box-shadow: 0 0 16px color-mix(in srgb, var(--qa-glow, #4DE8F4) 8%, transparent); }
.play.open { display: block; }
.play .top { display: flex; gap: 14px; align-items: flex-start; }
.play .mini { flex: none; width: 72px; aspect-ratio: 3 / 4; border-radius: 8px; overflow: hidden; background: color-mix(in srgb, var(--qa-shade, #000) 30%, transparent);
  display: flex; align-items: center; justify-content: center; }
.play .mini img { width: 100%; height: 100%; object-fit: cover; }
.play .mini ha-icon { --mdc-icon-size: 26px; color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 45%, transparent); }
.play .pt { font-size: 16px; font-weight: 600; color: var(--qa-text, #C8F4FA); line-height: 1.3; word-break: break-word; }
.play .pk { margin-top: 4px; font-size: 12px; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 75%, transparent); }
.play button.x { flex: none; background: none; border: none; color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 70%, transparent); cursor: pointer; padding: 2px; display: flex; }
.play .hint { margin-top: 12px; font-size: 12px; color: color-mix(in srgb, var(--qa-faint, #5F8794) 95%, transparent); line-height: 1.4; }
.play .acts { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.play a.go ha-icon, .play button.dev ha-icon { --mdc-icon-size: 18px; }
.play button.dev:disabled { opacity: 0.5; cursor: default; }
.play .msg { margin-top: 10px; font-size: 13px; color: var(--qa-acc, #7FF0FA); line-height: 1.4; }
.play .msg:empty { display: none; }
.play a.go.alt { background: none; border-color: color-mix(in srgb, var(--qa-glow, #4DE8F4) 22%, transparent); color: color-mix(in srgb, var(--qa-acc, #7FF0FA) 80%, transparent); }
`;

// Ultima cartella (console) aperta; solo comodità locale del browser
const RGC_LAST_PLAT = "romm-games-card.last-platform";

// Gruppi di cartelle, in quest'ordine; la marca viene da family_name di RomM (o dallo slug se manca)
const RGC_GROUPS = ["Nintendo", "Sony", "Sega", "NEC", "Arcade e SNK", "Atari", "Altre console", "Computer"];
const RGC_GROUP_OF = {
  Nintendo: "Nintendo", Sony: "Sony", Sega: "Sega", NEC: "NEC", SNK: "Arcade e SNK", Atari: "Atari",
  Commodore: "Computer", Amiga: "Computer", Amstrad: "Computer", Sinclair: "Computer", Microsoft: "Computer",
  arcade: "Arcade e SNK", doom: "Computer",
};

// Console che vogliono anche i file BIOS (cartelle create in ~/romm/library/bios/)
const RGC_BIOS = new Set(["psx", "segacd", "saturn", "3do", "turbografx-cd", "pc-fx", "lynx", "fds", "neogeoaes", "neogeomvs", "nds", "gba"]);

// Piattaforme che RomM fa giocare nel browser (EmulatorJS), dal frontend di RomM 5.4.0
const RGC_EJS = new Set(("3do acpc amiga amiga-cd32 arcade neogeoaes neogeomvs atari2600 atari-2600-plus atari5200 atari7800 c-plus-4 c64 "
  + "cpet commodore-64c c128 commmodore-128 colecovision doom dos jaguar lynx atari-lynx-mkii neo-geo-pocket neo-geo-pocket-color nes "
  + "famicom fds game-televisison new-style-nes n64 ique-player nds nintendo-ds-lite nintendo-dsi nintendo-dsi-xl gb game-boy-pocket "
  + "game-boy-light gba game-boy-adavance-sp game-boy-micro gbc pc-fx psx philips-cd-i psp segacd sega32 gamegear sms sega-mark-iii "
  + "sega-game-box-9 sega-master-system-ii master-system-super-compact master-system-girl genesis sega-mega-drive-2-slash-genesis "
  + "sega-mega-jet mega-pc tera-drive sega-nomad saturn snes sfam super-nintendo-original-european-version super-famicom-shvc-001 "
  + "super-famicom-jr-model-shvc-101 new-style-super-nes-model-sns-101 tg16 turbografx-cd supergrafx vic-20 virtualboy wonderswan "
  + "swancrystal wonderswan-color zxs").split(" "));

class RommGamesCard extends HTMLElement {
  setConfig(config) {
    this._config = Object.assign(
      {
        title: "Giochi",
        catalog: "/local/romm/giochi.json",
        covers: "/local/romm/cover/",
        logos: "/local/romm/console/",
        romm_url: "http://192.168.1.10:8093",
        romm_url_remote: "",
        refresh_minutes: 5,
        page_size: 60,
        library_path: "~/romm/library",
        hide_empty: false,
        // Dispositivi su cui avviare il gioco: [{ name, script, icon }]; lo script riceve `url` (pagina di gioco, rete di casa)
        devices: [],
      },
      config || {}
    );
    if (this._plat === undefined) {
      let t = "";
      try { t = localStorage.getItem(RGC_LAST_PLAT) || ""; } catch (e) { /* storage non disponibile */ }
      this._plat = t;
    }
    if (this._query === undefined) this._query = "";
    this._shown = this._config.page_size;
    if (this._root) this._renderAll();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      this._build();
      this._load();
      this._startTimer();
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

  _period() {
    return Math.max(1, Number(this._config.refresh_minutes) || 5) * 60000;
  }

  _stale() {
    return !this._fetched || Date.now() - this._fetched > this._period();
  }

  _startTimer() {
    if (!this._timer) this._timer = setInterval(() => this._load(), this._period());
  }

  _build() {
    if (this._root) return;
    const sr = this.shadowRoot || this.attachShadow({ mode: "open" });
    sr.innerHTML = `<style>${RGC_STYLE}</style>
      <ha-card>
        <div class="head">
          <div class="title"><ha-icon icon="mdi:gamepad-variant"></ha-icon><span class="t"></span></div>
          <div class="meta">
            <div><div class="n"></div><div class="u"></div></div>
            <button class="ref" title="Aggiorna ora"><ha-icon icon="mdi:refresh"></ha-icon></button>
          </div>
        </div>
        <div class="bar"><span class="tabs" style="display:contents"></span>
          <input class="q" type="search" placeholder="Cerca gioco…" />
        </div>
        <div class="play"></div>
        <div class="body"></div>
      </ha-card>`;
    this._root = sr;
    const q = sr.querySelector("input.q");
    q.value = this._query;
    q.addEventListener("input", () => { this._query = q.value; this._shown = this._config.page_size; this._renderList(); });
    sr.querySelector("button.ref").addEventListener("click", () => this._load());
    this._renderAll();
  }

  async _load() {
    if (this._loading) return;
    this._loading = true;
    this._error = null;
    this._renderMeta();
    try {
      const r = await fetch(this._config.catalog + "?t=" + Date.now(), { cache: "no-store" });
      if (r.status === 404) {
        this._data = { platforms: [], games: [] };
      } else if (!r.ok) {
        throw new Error("HTTP " + r.status);
      } else {
        const d = await r.json();
        this._data = { platforms: d.platforms || [], games: d.games || [], updated: d.updated };
      }
      this._fetched = Date.now();
      if (this._plat && !this._data.platforms.some((p) => String(p.id) === this._plat)) this._plat = "";
    } catch (e) {
      this._error = (e && e.message) || String(e);
    } finally {
      this._loading = false;
      this._renderAll();
    }
  }

  _platform(id) {
    return ((this._data && this._data.platforms) || []).find((p) => p.id === id);
  }

  _renderAll() {
    if (!this._root) return;
    this._root.querySelector(".t").textContent = this._config.title;
    const tabs = this._root.querySelector(".tabs");
    tabs.innerHTML = "";
    const p = this._plat && this._platform(Number(this._plat));
    if (p) {
      const b = document.createElement("button");
      b.className = "back";
      b.title = "Torna alle console";
      b.innerHTML = `<ha-icon icon="mdi:chevron-left"></ha-icon><span></span>`;
      b.querySelector("span").textContent = p.name;
      b.addEventListener("click", () => this._openFolder(""));
      tabs.appendChild(b);
    }
    this._root.querySelector("input.q").placeholder = p ? `Cerca in ${p.name}…` : "Cerca gioco in tutte le console…";
    this._renderMeta();
    this._renderList();
  }

  _openFolder(id) {
    this._plat = id;
    this._shown = this._config.page_size;
    try { localStorage.setItem(RGC_LAST_PLAT, id); } catch (e) { /* storage non disponibile */ }
    this._closePlay();
    this._renderAll();
    this._root.querySelector("ha-card").scrollIntoView({ block: "nearest" });
  }

  _renderMeta() {
    if (!this._root) return;
    this._root.querySelector("button.ref").classList.toggle("spin", !!this._loading);
    const d = this._data;
    this._root.querySelector(".n").textContent = d ? `${d.games.length} giochi` : "";
    this._root.querySelector(".u").textContent = this._loading
      ? "Aggiornamento…"
      : d && d.platforms.length
        ? `${d.platforms.length} console`
        : "";
  }

  _cover(g, box, icon) {
    const ph = document.createElement("div");
    ph.className = "ph";
    ph.innerHTML = `<ha-icon icon="${icon}"></ha-icon><span></span>`;
    const p = this._platform(g.platform);
    ph.querySelector("span").textContent = p ? p.name : g.slug || "";
    box.appendChild(ph);
    if (!g.cover) return;
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = "";
    img.src = this._config.covers + g.cover;
    img.addEventListener("load", () => ph.remove());
    img.addEventListener("error", () => img.remove());
    box.appendChild(img);
  }

  _list() {
    const q = (this._query || "").trim().toLowerCase();
    return ((this._data && this._data.games) || []).filter((g) =>
      (!this._plat || String(g.platform) === this._plat) && (!q || (g.name || "").toLowerCase().includes(q)));
  }

  _renderFolders(body) {
    const plats = this._data.platforms.filter((p) => p.count || !this._config.hide_empty);
    const groups = new Map(RGC_GROUPS.map((g) => [g, []]));
    for (const p of plats) groups.get(RGC_GROUP_OF[p.family] || RGC_GROUP_OF[p.slug] || "Altre console").push(p);
    for (const [name, list] of groups) {
      if (!list.length) continue;
      const h = document.createElement("div");
      h.className = "grp";
      h.textContent = name;
      const grid = document.createElement("div");
      grid.className = "folders";
      for (const p of list) {
        const el = document.createElement("div");
        el.className = "fd" + (p.count ? "" : " empty");
        el.title = `${p.name}: cartella roms/${p.fs_slug}/`;
        el.innerHTML = `<div class="lg"><ha-icon icon="mdi:folder-outline"></ha-icon><span class="cnt"></span></div><div class="fn"></div><div class="fp"></div>`;
        el.querySelector(".cnt").textContent = p.count;
        el.querySelector(".fn").textContent = p.name;
        el.querySelector(".fp").textContent = `roms/${p.fs_slug}/`;
        if (p.logo) {
          const ic = el.querySelector(".lg ha-icon");
          const img = document.createElement("img");
          img.loading = "lazy";
          img.alt = "";
          img.src = this._config.logos + p.logo;
          img.addEventListener("load", () => ic.remove());
          img.addEventListener("error", () => img.remove());
          el.querySelector(".lg").prepend(img);
        }
        el.addEventListener("click", () => this._openFolder(String(p.id)));
        grid.appendChild(el);
      }
      body.append(h, grid);
    }
  }

  _renderList() {
    if (!this._root) return;
    const body = this._root.querySelector(".body");
    body.innerHTML = "";
    const status = (txt) => { const d = document.createElement("div"); d.className = "status"; d.textContent = txt; body.appendChild(d); return d; };
    if (this._error && !this._data) { status("Impossibile leggere i giochi: " + this._error); return; }
    if (!this._data) { status("Caricamento giochi…"); return; }
    const q = this._query.trim();
    if (!this._plat && !q) {
      if (!this._data.platforms.length) status("Nessuna cartella console in RomM.");
      else this._renderFolders(body);
      return;
    }
    const list = this._list();
    if (!list.length) {
      const p = this._platform(Number(this._plat));
      if (q || !p) { status("Nessun gioco trovato"); return; }
      const lib = this._config.library_path.replace(/\/$/, "");
      const d = status("");
      d.append("Cartella vuota. Metti le ROM di questa console in ");
      const c = document.createElement("code");
      c.textContent = `${lib}/roms/${p.fs_slug}/`;
      d.append(c, " e avvia la scansione in RomM.");
      if (RGC_BIOS.has(p.fs_slug)) {
        const b = document.createElement("code");
        b.textContent = `${lib}/bios/${p.fs_slug}/`;
        d.append(document.createElement("br"), "Questa console vuole anche il BIOS in ", b, ".");
      }
      return;
    }
    const grid = document.createElement("div");
    grid.className = "grid";
    for (const g of list.slice(0, this._shown)) {
      const el = document.createElement("div");
      el.className = "gm" + (this._sel && this._sel.id === g.id ? " sel" : "");
      el.title = g.name;
      const cv = document.createElement("div");
      cv.className = "cv";
      this._cover(g, cv, "mdi:gamepad-variant-outline");
      const n = document.createElement("div");
      n.className = "gn";
      n.textContent = g.name;
      const s = document.createElement("div");
      s.className = "gs";
      const p = this._platform(g.platform);
      s.textContent = [!this._plat && p ? p.name : "", g.year || ""].filter(Boolean).join(" · ");
      el.append(cv, n, s);
      el.addEventListener("click", () => this._openPlay(g));
      grid.appendChild(el);
    }
    body.appendChild(grid);
    if (list.length > this._shown) {
      const more = document.createElement("div");
      more.className = "more";
      const b = document.createElement("button");
      b.textContent = `Mostra altri (${list.length - this._shown})`;
      b.addEventListener("click", () => { this._shown += this._config.page_size; this._renderList(); });
      more.appendChild(b);
      body.appendChild(more);
    }
  }

  // Da casa RomM si apre con l'indirizzo di rete locale; da fuori (Nabu Casa) con romm_url_remote (Tailscale), se impostato
  _base() {
    const host = location.hostname;
    const local = /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.|127\.)/.test(host) || host === "localhost" || host.endsWith(".local");
    const remote = (this._config.romm_url_remote || "").replace(/\/$/, "");
    return { url: (!local && remote ? remote : this._config.romm_url).replace(/\/$/, ""), remote: !local };
  }

  _openPlay(g) {
    this._sel = g;
    const p = this._root.querySelector(".play");
    const plat = this._platform(g.platform);
    const base = this._base();
    const playable = RGC_EJS.has(g.slug);
    p.innerHTML = `
      <div class="top">
        <div class="mini"></div>
        <div style="flex:1;min-width:0"><div class="pt"></div><div class="pk"></div></div>
        <button class="x" title="Chiudi"><ha-icon icon="mdi:close"></ha-icon></button>
      </div>
      <div class="hint"></div>
      <div class="msg"></div>
      <div class="acts">
        <a class="go alt info" target="_blank" rel="noopener"><ha-icon icon="mdi:information-outline"></ha-icon><span>Scheda</span></a>
        <a class="go play" target="_blank" rel="noopener"><ha-icon icon="mdi:play"></ha-icon><span>Gioca</span></a>
      </div>`;
    const acts = p.querySelector(".acts");
    const devs = playable ? (this._config.devices || []).filter((d) => d && d.script) : [];
    for (const d of devs) {
      const b = document.createElement("button");
      b.className = "dev";
      b.title = `Gioca su ${d.name || d.script}`;
      b.innerHTML = `<ha-icon></ha-icon><span></span>`;
      b.querySelector("ha-icon").setAttribute("icon", d.icon || "mdi:television");
      b.querySelector("span").textContent = d.name || d.script;
      b.addEventListener("click", () => this._playOn(g, d, b));
      acts.appendChild(b);
    }
    this._cover(g, p.querySelector(".mini"), "mdi:gamepad-variant-outline");
    p.querySelector(".mini .ph span").remove();
    p.querySelector(".pt").textContent = g.name;
    p.querySelector(".pk").textContent = [plat ? plat.name : g.slug, g.year, (g.regions || []).join(", ")].filter(Boolean).join(" · ");
    p.querySelector("a.info").href = `${base.url}/rom/${g.id}`;
    const play = p.querySelector("a.play");
    if (playable) play.href = `${base.url}/rom/${g.id}/ejs`;
    else play.remove();
    const hints = [];
    if (!playable) hints.push("Questa console non si gioca nel browser: dalla scheda di RomM puoi scaricare la ROM.");
    hints.push(devs.length
      ? "\"Gioca\" apre RomM in una nuova scheda (al primo accesso chiede il login). Con la TV si apre Moonlight: scegli RetroArch e cerca il gioco col joypad."
      : "Si apre RomM in una nuova scheda (al primo accesso chiede il login).");
    if (base.remote) hints.push(this._config.romm_url_remote ? "Fuori casa serve Tailscale attivo sul dispositivo." : "Funziona solo dalla rete di casa.");
    p.querySelector(".hint").textContent = hints.join(" ");
    p.querySelector("button.x").addEventListener("click", () => this._closePlay());
    p.classList.add("open");
    this._renderList();
    p.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  // Avvio su un dispositivo (es. la TV): lo script accende la TV se serve e apre la pagina di gioco col suo browser.
  // La TV è in casa, quindi sempre l'indirizzo di rete locale di RomM.
  async _playOn(g, d, btn) {
    const msg = this._root.querySelector(".play .msg");
    const name = d.name || d.script;
    btn.disabled = true;
    msg.textContent = "Avvio…";
    try {
      await this._hass.callService("script", "turn_on", {
        entity_id: d.script,
        variables: { url: `${this._config.romm_url.replace(/\/$/, "")}/rom/${g.id}/ejs` },
      });
      if (this._sel === g) msg.textContent = `▶ Apro Moonlight su ${name} (e se serve accendo la TV). Poi scegli RetroArch e cerca "${g.name}" col joypad.`;
    } catch (e) {
      if (this._sel === g) msg.textContent = `Errore: ${(e && e.message) || e}`;
    } finally {
      setTimeout(() => { btn.disabled = false; }, 3000);
    }
  }

  _closePlay() {
    this._sel = undefined;
    if (!this._root) return;
    const p = this._root.querySelector(".play");
    p.classList.remove("open");
    p.innerHTML = "";
    this._renderList();
  }

  getCardSize() { return 10; }

  getGridOptions() { return { columns: "full", rows: "auto" }; }
}

if (!customElements.get("romm-games-card")) {
  customElements.define("romm-games-card", RommGamesCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "romm-games-card")) {
  window.customCards.push({
    type: "romm-games-card",
    name: "Giochi (RomM)",
    description: "Giochi della libreria RomM divisi per console, con avvio nel browser",
  });
}
