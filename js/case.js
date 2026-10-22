// Загрузчик страницы кейса: берёт slug из <body data-slug>, собирает страницу из
// data/projects.js (шапка, соседние проекты) и data/cases/<slug>.js (содержимое).
import { PROJECTS } from "../data/projects.js";
import { esc, renderNav, renderFooter, reveal } from "./common.js";
import { renderCover, renderSection, setBase, initJourneys } from "./case-blocks.js";

const BASE = "../../";
setBase(BASE);
renderNav(BASE);
renderFooter(BASE);

const slug = document.body.dataset.slug;
const i = PROJECTS.findIndex((p) => p.slug === slug);
const p = PROJECTS[i];
const main = document.getElementById("main");

// Предыдущий / следующий проект (по кругу)
const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
const next = PROJECTS[(i + 1) % PROJECTS.length];
const also = `
  <nav class="wrap also" aria-label="Другие проекты">
    <div class="also__grid">
      <a href="${BASE}projects/${esc(prev.slug)}/"><span class="label">← Предыдущий проект</span><div class="also__t">${esc(prev.title)}</div></a>
      <a href="${BASE}projects/${esc(next.slug)}/"><span class="label">Следующий проект →</span><div class="also__t">${esc(next.title)}</div></a>
    </div>
  </nav>`;

async function build() {
  if (!p) { main.innerHTML = `<div class="wrap case-end"><p>Проект не найден.</p></div>${also}`; return; }
  document.title = `${p.title} — Данил Сафин`;
  if (p.hasCase) {
    try {
      const data = (await import(`../data/cases/${slug}.js`)).default;
      main.innerHTML = `<div class="case"><div class="wrap">
        ${renderCover(data.cover)}
        ${data.sections.map(renderSection).join("")}
      </div></div>${also}`;
      if (data.theme) { const el = main.querySelector(".case"); for (const [k, v] of Object.entries(data.theme)) el.style.setProperty("--" + k, v); }
      initJourneys();
      return;
    } catch (e) { console.error("Не удалось загрузить кейс:", e); }
  }
  // Заглушка «Скоро» — для проектов без презентации
  main.innerHTML = `<div class="wrap case-hero">
      <p class="label">${esc(p.category)}</p>
      <h1>${esc(p.title)}</h1>
      <div class="case-hero__grid"><div class="case-hero__sum"><p>${esc(p.summary)}</p></div></div>
      <div class="case-soon"><div class="h2">Скоро</div><p>Презентация этого кейса появится на этой странице.</p></div>
    </div>${also}`;
}
await build();
reveal();
