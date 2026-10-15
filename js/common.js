// Общие части: шапка, подвал, мелкие утилиты.
import { PROFILE } from "../data/projects.js";

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function renderNav(base = "") {
  const el = document.getElementById("nav");
  if (!el) return;
  el.innerHTML = `
    <div class="wrap nav__in">
      <a class="nav__logo" href="${base || "./"}" aria-label="${esc(PROFILE.name)} — на главную">${esc(PROFILE.name)}</a>
      <nav class="nav__links" aria-label="Основная навигация">
        <a class="link" href="${base}#about">Обо мне</a>
        <a class="link" href="${base}#projects">Проекты</a>
        <a class="nav__cta" href="${base}#contact">Связаться</a>
      </nav>
    </div>`;
  const onScroll = () => el.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

export function renderFooter(base = "") {
  const el = document.getElementById("footer");
  if (!el) return;
  el.innerHTML = `
    <div class="wrap footer">
      <span>© ${new Date().getFullYear()} ${esc(PROFILE.name)}</span>
      <a class="link" href="#top" onclick="window.scrollTo({top:0});return false;">Наверх ↑</a>
    </div>`;
}

export function reveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) return;
  document.documentElement.classList.add("reveal-on");
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  items.forEach((i) => io.observe(i));
}
