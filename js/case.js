// Шаблон страницы кейса: один код — любая страница проекта.
// Данные берутся из data/projects.js по атрибуту <body data-slug="...">.
import { PROJECTS } from "../data/projects.js";
import { esc, renderNav, renderFooter, reveal } from "./common.js";
import { mountPdfViewer } from "./pdf-viewer.js";

const base = "../../";
renderNav(base);
renderFooter(base);

const slug = document.body.dataset.slug;
const idx = PROJECTS.findIndex((p) => p.slug === slug);
const root = document.getElementById("case");

if (idx < 0) {
  root.innerHTML = `<div class="wrap case-hero"><h1>Проект не найден</h1><p><a class="link" href="${base}#projects">К списку проектов</a></p></div>`;
} else {
  const p = PROJECTS[idx];
  const soon = p.status !== "ready";
  document.title = `${p.title} — Данил Сафин`;
  const md = document.querySelector('meta[name="description"]');
  if (md) md.content = `${p.title}: ${p.summary}`;

  const meta = (p.meta || []).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  const prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];

  root.innerHTML = `
    <section class="wrap case-hero">
      <a class="link case-hero__back" href="${base}#projects">← Все проекты</a>
      <p class="label" style="margin-bottom:14px">${esc(p.category)}${p.platform ? " · " + esc(p.platform) : ""}</p>
      <h1>${esc(p.title)}</h1>
      <div class="case-hero__grid">
        <div class="case-hero__sum">
          <p>${esc(p.summary)}</p>
          <div class="btn-row">
            ${p.pdf ? `<a class="btn btn--solid" href="#deck">Смотреть презентацию <span class="arr" aria-hidden="true">↓</span></a>` : ""}
            ${p.figma ? `<a class="btn" href="${esc(p.figma)}" target="_blank" rel="noopener">${esc(p.figmaLabel || "Открыть в Figma")} <span class="arr" aria-hidden="true">↗</span></a>` : ""}
          </div>
        </div>
        ${meta ? `<dl class="meta">${meta}</dl>` : ""}
      </div>
      ${p.cover
        ? `<div class="case-cover" style="background:${esc(p.coverBg || "var(--bg-2)")}"><img src="${base}${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" width="2629" height="1479"></div>`
        : ""}
      ${!p.pdf ? `<div class="case-soon"><p class="h2">Скоро здесь</p><p>Оригинальная презентация проекта появится на этой странице.</p></div>` : ""}
    </section>

    ${p.pdf ? `<section class="wrap deck" id="deck" aria-label="Презентация проекта"><div class="section__head"><h2 class="label">Презентация</h2><span class="label">Оригинальный PDF</span></div><div id="viewer-root"></div></section>` : ""}

    <section class="wrap also" aria-label="Другие проекты">
      <div class="section__head"><h2 class="label">Другие проекты</h2><a class="link label" href="${base || "./"}">На главную</a></div>
      <div class="also__grid">
        <a href="${base}projects/${esc(prev.slug)}/"><span class="label">← Предыдущий</span><div class="also__t">${esc(prev.title)}</div></a>
        <a href="${base}projects/${esc(next.slug)}/"><span class="label">Следующий →</span><div class="also__t">${esc(next.title)}</div></a>
      </div>
    </section>`;

  if (p.pdf) {
    mountPdfViewer(document.getElementById("viewer-root"), { src: p.pdf, title: p.pdfTitle || p.title, video: p.video, base });
  }
  reveal();
}
