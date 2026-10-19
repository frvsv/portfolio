import { PROJECTS, PROFILE } from "../data/projects.js";
import { esc, renderNav, renderFooter, reveal } from "./common.js";
import { initHero3D } from "./hero3d.js";

renderNav("");
renderFooter("");

// Карточки проектов — из data/projects.js
const list = document.getElementById("project-list");
list.innerHTML = PROJECTS.map((p, i) => {
  const soon = p.status !== "ready";
  const media = p.cover
    ? `<img src="${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" width="${p.coverW || 3000}" height="${p.coverH || 1691}" loading="lazy" decoding="async">`
    : `<span class="card__soon" aria-hidden="true">${esc(p.title)}</span>`;
  return `
  <a class="card reveal ${soon ? "card--soon" : ""}" href="projects/${esc(p.slug)}/" aria-label="${esc(p.title)}: ${soon ? "кейс в подготовке" : "открыть кейс"}">
    <div class="card__media" style="background:${esc(p.coverBg || "var(--bg-2)")}">
      ${media}
      ${soon ? `<span class="card__badge">Скоро</span>` : ""}
    </div>
    <div class="card__foot">
      <div>
        <div class="card__no">${String(i + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")} · ${esc(p.category)}${p.platform ? " · " + esc(p.platform) : ""}</div>
        <h3 class="card__title">${esc(p.title)}</h3>
      </div>
      <p class="card__cap">${esc(p.caption)}</p>
      <span class="card__go">${soon ? "Страница проекта" : "Открыть кейс"}<i aria-hidden="true">→</i></span>
    </div>
  </a>`;
}).join("");

// Контакты
document.querySelectorAll("[data-email]").forEach((a) => { a.href = "mailto:" + PROFILE.email; if (a.dataset.email === "text") a.textContent = PROFILE.email; });
document.querySelectorAll("[data-tel]").forEach((a) => { a.href = "tel:" + PROFILE.phone.replace(/[^+\d]/g, ""); a.textContent = PROFILE.phone; });
document.querySelectorAll("[data-tg]").forEach((a) => { a.href = "https://t.me/" + PROFILE.telegram; a.textContent = "@" + PROFILE.telegram; });
document.querySelectorAll("[data-cv]").forEach((a) => { a.href = PROFILE.cv; });

reveal();

const hero = document.querySelector(".hero");
const canvas = document.getElementById("hero-canvas");
if (hero && canvas) initHero3D(hero, canvas);
