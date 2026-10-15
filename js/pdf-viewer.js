// Просмотрщик PDF на основе PDF.js.
// Показывает настоящие страницы оригинального PDF без изменений.
// Каждая страница режется на горизонтальные «полосы», которые рисуются лениво —
// поэтому очень длинная страница (как у PrayBible) не вешает браузер.

import { esc } from "./common.js";

const TILE_PT = 900;       // высота полосы в pt
const MAX_CANVAS_W = 8192; // ограничение ширины canvas

export async function mountPdfViewer(root, opts) {
  const { src, title = "Презентация", video = null, base = "" } = opts;
  const url = base + src;

  root.innerHTML = `
    <div class="viewer" role="region" aria-label="${esc(title)}">
      <div class="viewer__head">
      <div class="viewer__bar">
        <button class="vbtn" data-act="prev" title="Предыдущая страница / вверх" aria-label="Вверх">↑</button>
        <button class="vbtn" data-act="next" title="Следующая страница / вниз" aria-label="Вниз">↓</button>
        <span class="viewer__info" data-info aria-live="polite">Стр. – / –</span>
        <span class="grow"></span>
        <button class="vbtn" data-act="zoomout" title="Уменьшить" aria-label="Уменьшить">−</button>
        <span class="viewer__info" data-zoom style="min-width:56px">100%</span>
        <button class="vbtn" data-act="zoomin" title="Увеличить" aria-label="Увеличить">+</button>
        <button class="vbtn" data-act="fit" title="По ширине">По ширине</button>
        <button class="vbtn" data-act="full" title="Полный экран">⛶ <span class="t">Во весь экран</span></button>
        <a class="vbtn" href="${esc(url)}" target="_blank" rel="noopener" title="Открыть PDF в новой вкладке">↗ <span class="t">Открыть</span></a>
        <a class="vbtn" href="${esc(url)}" download title="Скачать исходный PDF">↓ <span class="t">Скачать PDF</span></a>
      </div>
      <div class="viewer__prog"><i data-prog></i></div>
      </div>
      <div class="viewer__scroll" data-scroll tabindex="0" aria-label="Страницы презентации. Прокручивайте стрелками или колесом мыши">
        <div class="viewer__status" data-status>Загружаю презентацию…</div>
        <div class="viewer__pages" data-pages hidden></div>
      </div>
    </div>`;

  const $ = (s) => root.querySelector(s);
  const viewer = $(".viewer");
  const scroller = $("[data-scroll]");
  const pagesEl = $("[data-pages]");
  const status = $("[data-status]");
  const info = $("[data-info]");
  const zoomLbl = $("[data-zoom]");
  const prog = $("[data-prog]");

  // ---- Fallback: встроенный просмотрщик браузера ----
  const fallback = (why) => {
    console.warn("PDF.js не запустился:", why);
    scroller.innerHTML = `<iframe class="viewer__fallback" src="${esc(url)}#view=FitH" title="${esc(title)}"></iframe>`;
    root.querySelectorAll('[data-act]:not([data-act="full"])').forEach((b) => (b.disabled = true));
    info.textContent = "Режим браузера";
  };

  let pdfjs;
  try {
    pdfjs = await import("../vendor/pdfjs/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;
  } catch (e) { return fallback(e); }

  let doc;
  try {
    const task = pdfjs.getDocument({ url, disableAutoFetch: true, disableStream: false });
    task.onProgress = ({ loaded, total }) => {
      if (total) status.textContent = `Загружаю презентацию… ${Math.round((loaded / total) * 100)}%`;
    };
    doc = await task.promise;
  } catch (e) { return fallback(e); }

  viewer.classList.toggle("is-single", doc.numPages === 1);
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const p = await doc.getPage(i);
    const v = p.getViewport({ scale: 1 });
    pages.push({ n: i, page: p, w: v.width, h: v.height, el: null, tiles: [] });
  }
  status.remove();
  pagesEl.hidden = false;

  // ---- Состояние ----
  let zoom = 1;                // 1 = по ширине контейнера
  let baseW = 0;               // ширина «по ширине» в css-пикселях
  let gen = 0;                 // поколение раскладки (для отмены устаревших рендеров)
  const queue = [];
  let busy = false;

  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      const t = en.target._tile;
      t.visible = en.isIntersecting;
      if (en.isIntersecting && !t.done && !t.queued) { t.queued = true; queue.push(t); }
    }
    pump();
  }, { root: scroller, rootMargin: "700px 0px" });

  async function pump() {
    if (busy) return;
    busy = true;
    while (queue.length) {
      const t = queue.shift();
      t.queued = false;
      if (t.gen !== gen || !t.visible || t.done) continue;
      try { await renderTile(t); } catch (e) { if (!(e && e.name === "RenderingCancelledException")) console.warn(e); }
    }
    busy = false;
  }

  async function renderTile(t) {
    const { pg, idx } = t;
    const cssW = pg.cssW;
    const scale = cssW / pg.w;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    dpr = Math.min(dpr, MAX_CANVAS_W / cssW);
    const tileHpt = Math.min(TILE_PT, pg.h - idx * TILE_PT);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cssW * dpr));
    canvas.height = Math.max(1, Math.round(tileHpt * scale * dpr));
    const ctx = canvas.getContext("2d");
    const viewport = pg.page.getViewport({ scale: scale * dpr });
    await pg.page.render({ canvasContext: ctx, viewport, transform: [1, 0, 0, 1, 0, -idx * TILE_PT * scale * dpr], background: "#ffffff" }).promise;
    if (t.gen !== gen) return;
    t.el.replaceChildren(canvas);
    t.done = true;
  }

  function layout(keepPos = true) {
    gen++;
    queue.length = 0;
    io.disconnect();
    const ratioY = keepPos && scroller.scrollHeight ? (scroller.scrollTop + scroller.clientHeight / 2) / scroller.scrollHeight : 0;
    const ratioX = keepPos && scroller.scrollWidth ? (scroller.scrollLeft + scroller.clientWidth / 2) / scroller.scrollWidth : 0.5;

    baseW = scroller.clientWidth;
    const w = Math.round(baseW * zoom);
    pagesEl.style.width = w + "px";
    pagesEl.replaceChildren();

    for (const pg of pages) {
      const scale = w / pg.w;
      pg.cssW = w;
      const el = document.createElement("div");
      el.className = "vpage";
      el.style.width = w + "px";
      el.style.height = Math.round(pg.h * scale) + "px";
      el.dataset.page = pg.n;
      pg.el = el;
      pg.tiles = [];
      const count = Math.ceil(pg.h / TILE_PT);
      for (let i = 0; i < count; i++) {
        const te = document.createElement("div");
        te.className = "vtile";
        te.style.top = Math.round(i * TILE_PT * scale) + "px";
        te.style.height = Math.ceil(Math.min(TILE_PT, pg.h - i * TILE_PT) * scale) + "px";
        const t = { pg, idx: i, el: te, gen, visible: false, done: false, queued: false };
        te._tile = t;
        pg.tiles.push(t);
        el.appendChild(te);
        io.observe(te);
      }
      // Видео поверх оригинальной страницы (координаты — доли страницы)
      if (video && video.src && Number(video.page || 1) === pg.n) {
        const vd = document.createElement("div");
        vd.className = "vvideo";
        vd.style.cssText = `left:${video.x * 100}%;top:${video.y * 100}%;width:${video.w * 100}%;height:${video.h * 100}%`;
        vd.innerHTML = `<video controls playsinline preload="metadata" ${video.poster ? `poster="${esc(base + video.poster)}"` : ""} aria-label="${esc(video.label || "Видео")}"><source src="${esc(base + video.src)}"></video>`;
        el.appendChild(vd);
      }
      pagesEl.appendChild(el);
    }
    scroller.scrollTop = ratioY * scroller.scrollHeight - scroller.clientHeight / 2;
    scroller.scrollLeft = ratioX * scroller.scrollWidth - scroller.clientWidth / 2;
    zoomLbl.textContent = Math.round(zoom * 100) + "%";
    update();
  }

  // ---- Индикатор положения ----
  function update() {
    const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
    const frac = Math.min(1, Math.max(0, scroller.scrollTop / max));
    prog.style.width = frac * 100 + "%";
    let cur = 1;
    const mid = scroller.scrollTop + scroller.clientHeight / 2;
    for (const pg of pages) if (pg.el && pg.el.offsetTop <= mid) cur = pg.n;
    info.textContent = `Стр. ${cur} / ${pages.length}` + (pages.length === 1 ? ` · ${Math.round(frac * 100)}%` : "");
  }
  scroller.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });

  // ---- Управление ----
  const single = pages.length === 1;
  const goPage = (d) => {
    if (single) { scroller.scrollBy({ top: d * scroller.clientHeight * 0.85, behavior: "smooth" }); return; }
    const mid = scroller.scrollTop + 4;
    let cur = 0;
    pages.forEach((pg, i) => { if (pg.el.offsetTop <= mid) cur = i; });
    const target = pages[Math.min(pages.length - 1, Math.max(0, cur + d))];
    scroller.scrollTo({ top: target.el.offsetTop, behavior: "smooth" });
  };
  const setZoom = (z) => { zoom = Math.min(3, Math.max(0.5, Math.round(z * 4) / 4)); layout(true); };
  const fsEl = viewer.requestFullscreen ? viewer : null;

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]");
    if (!b || b.tagName === "A") return;
    switch (b.dataset.act) {
      case "prev": goPage(-1); break;
      case "next": goPage(1); break;
      case "zoomin": setZoom(zoom + 0.25); break;
      case "zoomout": setZoom(zoom - 0.25); break;
      case "fit": setZoom(1); break;
      case "full":
        if (document.fullscreenElement) document.exitFullscreen();
        else if (fsEl) fsEl.requestFullscreen().catch(() => {});
        break;
    }
  });
  if (!fsEl) root.querySelector('[data-act="full"]').hidden = true; // iOS Safari: нет полноэкранного режима для блоков

  scroller.addEventListener("keydown", (e) => {
    if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(zoom + 0.25); }
    else if (e.key === "-") { e.preventDefault(); setZoom(zoom - 0.25); }
    else if (e.key === "0") { e.preventDefault(); setZoom(1); }
  });

  let rt;
  const relayout = () => { clearTimeout(rt); rt = setTimeout(() => { if (scroller.clientWidth !== baseW) layout(true); }, 150); };
  window.addEventListener("resize", relayout);
  document.addEventListener("fullscreenchange", () => setTimeout(() => layout(true), 60));

  layout(false);
  return { doc, setZoom };
}
