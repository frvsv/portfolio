// ============================================================
//  БИБЛИОТЕКА БЛОКОВ КЕЙСА
//  Каждый блок — функция «данные → HTML». Данные кейса — data/cases/<slug>.js,
//  стили — css/case.css, правила — CASE_AUTHORING_GUIDE.md.
//
//  Соответствие компонентам из руководства:
//    PersonaCard → cards{variant:persona}      JourneyStep → journey
//    HypothesisBadge → hypBadge()              UserFlowDiagram / FlowNode → flow / fnode()
//    TypographySpecimen → specimen()           ProductScreenSection → feature
//    FeatureDescription → featureText()        MockupMedia → mockup() / videoSlot()
// ============================================================
import { esc } from "./common.js";

// --- Типографика русского текста --------------------------------------------
// Строки формируются браузером по ширине колонки. Здесь только «склеиваем» короткие слова
// с соседом неразрывным пробелом, чтобы предлог/союз не оставался в конце строки.
const NB = " ";
const GLUE = new Set(("в во к ко с со у о об от до из за на по не ни но да и а я же ли бы то ещё как что для при без над под про или").split(" "));
const typo = (s) => String(s)
  .replace(/(?<=^|[\s\u00a0(«"„*])([А-Яа-яЁё]{1,4})\s+(?=\S)/g, (m, w) => (w.length <= 2 || GLUE.has(w.toLowerCase()) ? w + NB : m))
  .replace(/(\d%?)\s+(?=[A-Za-zА-Яа-яЁё])/g, "$1" + NB)
  .replace(/\s+—/g, NB + "—");

// \n в данных — намеренный перенос (используйте редко: в обычных абзацах не нужен)
const plain = (s) => typo(esc(s)).replace(/\n/g, "<br>");
const rich = (s) => plain(s).replace(/\*(.+?)\*/g, "<em>$1</em>");
const raw = (s) => esc(s).replace(/\n/g, "<br>"); // без типографики — для английских подписей

// Пути в данных — от корня сайта; страница лежит в projects/<slug>/, поэтому добавляем префикс.
let BASE = "";
export const setBase = (b) => { BASE = b; };
const url = (s) => (s && !/^(https?:|data:|\/)/.test(s) ? BASE + s : s);

const img = (i, cls = "", extra = "") =>
  `<img${cls ? ` class="${cls}"` : ""} src="${esc(url(i.src))}" alt="${esc(i.alt ?? "")}" width="${i.w}" height="${i.h}" ${i.eager ? 'loading="eager"' : 'loading="lazy" decoding="async"'}${extra}>`;

// --- Мелкие компоненты ----------------------------------------------------------
const chip = (c) => `<span class="chip chip--${esc(c.tone || "plain")}">${plain(c.text)}</span>`;
// HypothesisBadge: единственная метка гипотезы на всём сайте
const hypBadge = (t) => `<span class="hyp">${plain(t)}</span>`;
const note = (t) => `<p class="note">${plain(t)}</p>`;

// Часть текста: чип / подпись + текст / список. Подраздел всегда собирается в один блок .pp
function part(p) {
  let h = "";
  if (p.hyp) h += hypBadge(p.hyp);
  if (p.chip) h += chip(p.chip);
  if (p.label) h += `<h4 class="plabel">${plain(p.label)}</h4>`;
  if (p.text) h += `<p>${plain(p.text)}</p>`;
  if (p.paras) h += p.paras.map((t) => `<p>${plain(t)}</p>`).join("");
  if (p.list) h += `<ul class="plist">${p.list.map((t) => `<li>${plain(t)}</li>`).join("")}</ul>`;
  if (p.ordered) h += `<ol class="plist plist--ol">${p.ordered.map((t) => `<li>${plain(t)}</li>`).join("")}</ol>`;
  return h;
}
const parts = (arr) => arr.map((p) => `<div class="pp">${part(p)}</div>`).join("");

// --- Шапка раздела ------------------------------------------------------------
const bar = (s) => `<div class="cs__bar"><span class="label">${esc(s.n)}</span><span class="label">${plain(s.label)}</span></div>`;

function sectionHead(s) {
  return `<header class="cs__head">${bar(s)}
    <h2 class="cs__title" id="${esc(s.id)}-t">${rich(s.title)}</h2>
    ${s.lead ? `<p class="cs__lead">${plain(s.lead)}</p>` : ""}
    ${s.leadNote ? note(s.leadNote) : ""}
  </header>`;
}

// =============================== БЛОКИ ========================================

// Карточки: обзор, персоны, гипотезы, рефлексия
function cards(b) {
  const v = b.variant || "plain";
  const items = b.items.map((it) => {
    const id = it.avatar
      ? `<header class="ccard__id">${img({ ...it.avatar, w: 256, h: 256, eager: true }, "avatar")}<h3 class="ccard__name">${plain(it.heading)}</h3></header>`
      : it.heading ? `<h3 class="ccard__h">${plain(it.heading)}</h3>` : "";
    const k = it.kicker ? `<h3 class="plabel ccard__k">${plain(it.kicker)}</h3>` : "";
    const body = parts(it.parts);
    return `<article class="ccard">${id}${k}${body}${it.note ? `<p class="ccard__note">${plain(it.note)}</p>` : ""}</article>`;
  }).join("");
  return `<div class="cards cards--${v} cols-${b.cols || 3}">${items}</div>`;
}

// Тёмный блок с изображением («Ниша»). Картинка — второстепенный акцент и не задаёт размер карточки.
function banner(b) {
  return `<aside class="banner">
    <div class="banner__text">
      <h3 class="label banner__k">${plain(b.kicker)}</h3>
      <p class="banner__t">${plain(b.title)}</p>
      <p class="banner__p">${plain(b.text)}</p>
    </div>
    ${b.image ? img(b.image, "banner__img") : ""}
  </aside>`;
}

const barBlock = (b) => `<p class="bar bar--key">${plain(b.text)}</p>`;
const noteBlock = (b) => note(b.text);
const statusBlock = (b) => `<aside class="status"><b>${plain(b.title)}.</b> <span>${plain(b.text)}</span></aside>`;

// --- Кольцевая диаграмма ----------------------------------------------------------
const TONE_VAR = { sun: "--tint-sun", mint: "--tint-mint", sky: "--tint-sky", ice: "--tint-ice", accent: "--accent" };

function donut(d) {
  const CX = 150, CY = 167, RM = 108, SW = 60, C = 2 * Math.PI * RM;
  let acc = 0;
  const total = d.items.reduce((s, i) => s + i.value, 0);
  // Подложка цвета последнего сектора + небольшое перекрытие секторов: на стыках нет щелей и «зубцов»
  const last = d.items[d.items.length - 1];
  const rings = `<circle cx="${CX}" cy="${CY}" r="${RM}" fill="none" stroke="var(${TONE_VAR[last.tone]})" stroke-width="${SW}"/>` + d.items.slice(0, -1).map((i) => {
    const len = (i.value / total) * C, draw = len + 1.2;
    const el = `<circle cx="${CX}" cy="${CY}" r="${RM}" fill="none" stroke="var(${TONE_VAR[i.tone]})" stroke-width="${SW}" stroke-dasharray="${draw.toFixed(2)} ${(C - draw).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}"/>`;
    acc += len;
    return el;
  }).join("");
  // Подписи: точка на кольце → луч наружу → горизонталь → текст (процент жирным, ниже подпись)
  let cum = 0;
  const labels = d.items.map((i) => {
    const mid = (d.start + ((cum + i.value / 2) / total) * 360) * Math.PI / 180;
    cum += i.value;
    const sx = Math.sin(mid), cy = -Math.cos(mid), right = sx >= 0;
    const dot = [CX + RM * sx, CY + RM * cy], knee = [CX + 158 * sx, CY + 158 * cy];
    const end = right ? 318 : -18, tx = right ? 328 : -28, anchor = right ? "start" : "end";
    const lines = i.label.split("\n");
    const ty = knee[1] - 6;
    const t = [`<tspan class="dn__pct" x="${tx}" y="${ty.toFixed(1)}">${esc(i.pct)}</tspan>`]
      .concat(lines.map((l, k) => `<tspan x="${tx}" y="${(ty + 22 * (k + 1)).toFixed(1)}">${esc(l)}</tspan>`)).join("");
    return `<path class="dn__lead" d="M${dot[0].toFixed(1)} ${dot[1].toFixed(1)} L${knee[0].toFixed(1)} ${knee[1].toFixed(1)} H${end}" fill="none"/>
      <circle class="dn__dot" cx="${dot[0].toFixed(1)}" cy="${dot[1].toFixed(1)}" r="3"/>
      <text class="dn__txt" text-anchor="${anchor}">${t}</text>`;
  }).join("");
  const legend = d.items.map((i) => `<li><i style="background:var(${TONE_VAR[i.tone]})"></i><b>${esc(i.pct)}</b> ${plain(i.label.replace(/\n/g, " "))}</li>`).join("");
  return `<figure class="dn">
    <svg class="dn__svg" viewBox="-190 0 880 334" aria-hidden="true">
      <g transform="rotate(${-90 + d.start} ${CX} ${CY})">${rings}</g>${labels}
    </svg>
    <svg class="dn__ring" viewBox="12 29 276 276" width="260" height="260" aria-hidden="true"><g transform="rotate(${-90 + d.start} ${CX} ${CY})">${rings}</g></svg>
    <ul class="dn__legend">${legend}</ul>
  </figure>`;
}

function method(b) {
  return `<div class="method">
    <div class="method__l">${chip(b.left.chip)}<p>${plain(b.left.text)}</p>${note(b.left.note)}</div>
    <div class="method__r">${chip(b.right.chip)}${donut(b.right.donut)}</div>
  </div>`;
}

// --- Таблица сравнения -----------------------------------------------------------------
function compare(b) {
  const head = b.head.map((h) => `<th scope="col">${plain(h)}</th>`).join("");
  const rows = b.rows.map((r) => `<tr><th scope="row">${plain(r[0])}</th>${r.slice(1).map((c, i) => `<td data-label="${esc(b.head[i])}">${plain(c)}</td>`).join("")}</tr>`).join("");
  // cols: [16, 42, 42] — фиксированные доли колонок в % (для десктопа); без него таблица ведёт себя как раньше
  const cg = b.cols ? `<colgroup>${b.cols.map((w) => `<col style="width:${Number(w)}%">`).join("")}</colgroup>` : "";
  return `${b.title ? `<h3 class="cmp__title">${plain(b.title)}</h3>` : ""}<table class="cmp${b.cols ? " cmp--fixed" : ""}">${cg}<thead><tr><td></td>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

// --- Путь пользователя: кривая над сеткой шагов (JourneyStep) ----------------------------
const JH = 140, JPAD = 28;   // высота области графика и отступ под эмодзи, px
function curve(pts) {        // Catmull-Rom → кубические Безье
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

function journey(b) {
  const N = b.points.length;
  const xy = b.points.map((p, i) => [((i + 0.5) / N) * 100, ((JPAD + p.level * (JH - 2 * JPAD)) / JH) * 100]);
  const marks = b.points.map((p, i) =>
    `<span class="jr__pt" style="left:${xy[i][0]}%;top:calc(${JPAD}px + ${p.level} * (100% - ${2 * JPAD}px))">${img({ src: p.emoji, w: 144, h: 144, alt: "" }, "jr__emoji")}</span>`).join("");
  const steps = b.steps.map((s, i) => `
    <li class="jstep${s.tone ? ` jstep--${s.tone}` : ""}" style="--lv:${b.points[i] ? b.points[i].level : 0.5}">
      ${b.points[i] ? img({ src: b.points[i].emoji, w: 144, h: 144, alt: "" }, "jstep__emoji") : ""}
      <h4 class="plabel">${plain(s.label)}</h4><p>${plain(s.text)}</p>
    </li>`).join("");
  return `<div class="journey">
    <h3 class="plabel journey__h">${plain(b.title)}</h3>
    <div class="jr" style="--jh:${JH}px" aria-hidden="true">
      <svg class="jr__line" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${curve(xy)}" vector-effect="non-scaling-stroke" fill="none"/></svg>${marks}
    </div>
    <ol class="jsteps" style="--n:${N}">${steps}<svg class="jv" aria-hidden="true"><path/></svg></ol>
    ${note(b.note)}
  </div>`;
}

// --- Инсайты ---------------------------------------------------------------------------------
function insights(b) {
  const hasSolution = b.items.some((i) => i.solution);
  const head = `<div class="ins__row ins__head" aria-hidden="true">
      <span></span>
      <span>${plain(b.labels.title ?? "Инсайт")}</span>
      <span>${plain(b.labels.from)}</span>
      ${hasSolution ? `<span>${plain(b.labels.solution)}</span>` : ""}
    </div>`;
  const rows = b.items.map((it) => `<li class="ins__row">
      <span class="ins__n">${esc(it.n)}</span>
      <h3 class="ins__t">${plain(it.title)}</h3>
      <div class="ins__c"><h4 class="plabel sr-only">${plain(b.labels.from)}</h4><p>${plain(it.from)}</p></div>
      ${it.solution ? `<div class="ins__c"><h4 class="plabel sr-only">${plain(b.labels.solution)}</h4><p>${plain(it.solution)}</p></div>` : ""}
    </li>`).join("");
  return `<div class="ins-wrap${hasSolution ? "" : " ins--one"}">${head}<ol class="ins">${rows}</ol></div>`;
}

// --- Айдентика: палитра и TypographySpecimen -------------------------------------------------------
const specimen = (f, sample) => `<div class="spec">
    <span class="spec__r">${plain(f.role)}</span>
    <b class="spec__n">${plain(f.name)}</b>
    <p class="spec__s" style="font-family:${f.family};font-weight:${f.weight}">${esc(sample)}</p>
  </div>`;

function palette(b) {
  const sw = (s, cls) => `<div class="sw ${cls}" style="background:${esc(s.hex)};color:${esc(s.fg)}"><b class="sw__hex">${esc(s.hex)}</b><span class="sw__d">${plain(s.desc)}</span></div>`;
  return `<div class="pal">
    <div class="pal__main">${b.main.map((s) => sw(s, `sw--${s.size}`)).join("")}</div>
    <div class="pal__aux">${b.aux.map((s) => sw(s, "sw--aux")).join("")}</div>
    <div class="pal__fonts">${b.fonts.map((f) => specimen(f, b.sample)).join("")}</div>
  </div>`;
}

// --- User flow: UserFlowDiagram / FlowNode ----------------------------------------------------------
// Одна колонка. Между узлами — одинаковая SVG-стрелка (.fa, 1px), каждая стрелка касается обоих узлов:
// ни обрывов, ни линий «в пустоту». Развилка — ряд из двух узлов, над каждым своя стрелка от узла выше.
const fnode = (t, tone, cls = "") => {
  const [a, ...rest] = String(t).split("\n");
  return `<div class="fn fn--${tone}${cls ? " " + cls : ""}"><b>${esc(a)}</b>${rest.length ? `<small>${esc(rest.join(" "))}</small>` : ""}</div>`;
};
const FA = `<svg class="fa" viewBox="0 0 9 22" width="9" height="22" aria-hidden="true"><path d="M4.5 0V21M1 17.5L4.5 21L8 17.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
const chain = (nodes) => nodes.join(FA);
const cell = (inner) => `<div class="fcell">${FA}${inner}</div>`;

function flow(b) {
  const a = b.auth, T = b.titles || {};
  const login = `${fnode(b.start[0].t, "sky")}${FA}${fnode(b.start[1].t, "sky")}
    <div class="frow">${cell(fnode(a.signIn, "sky") + FA + fnode(a.recover, "sky"))}${cell(fnode(a.signUp, "sky"))}</div>`;
  const onboarding = `${chain(b.onboarding.map((t) => fnode(t, "sun")))}`;
  const home = `${fnode(b.home, "key")}${FA}
    <p class="fnote">${plain(T.fan || "Доступно с главного экрана")}</p>
    <div class="fgrid">${b.key.map((t) => fnode(t, "key")).join("")}${fnode(b.menu.title, "white", "fn--wide")}</div>${FA}
    <div class="fn fn--white fn--list"><ul>${b.menu.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`;
  const legend = b.legend.map((l) => `<li><i class="lg lg--${esc(l.tone)}"></i>${plain(l.label)}</li>`).join("");
  return `<div class="flow">${login}${FA}${onboarding}${FA}${home}</div>
  <ul class="legend">${legend}</ul>`;
}

// --- MockupMedia: телефон (с выносками или без) -----------------------------------------------------
function callouts(p) {
  const c = p.callouts, W = c.box.w, H = c.box.h;
  const pct = (v, t) => `${((v / t) * 100).toFixed(3)}%`;
  const lines = c.lines.map((l) => {
    const [x, y, dir] = l.arrow;
    const head = dir === "l" ? `M${x + 6} ${y - 4}L${x} ${y}L${x + 6} ${y + 4}` : `M${x - 6} ${y - 4}L${x} ${y}L${x - 6} ${y + 4}`;
    return `<path d="${l.d}" fill="none"/><path d="${head}" fill="none"/><circle cx="${l.dot[0]}" cy="${l.dot[1]}" r="3" class="co__dot"/>`;
  }).join("");
  const chips = c.chips.map((k) => {
    const pos = k.side === "l" ? `right:${pct(W - k.x, W)}` : `left:${pct(k.x, W)}`;
    return `<span class="co__chip" style="${pos};top:${pct(k.y, H)};height:${pct(k.h, H)}">${plain(k.text)}</span>`;
  }).join("");
  const list = c.chips.map((k) => `<li>${plain(k.text).replace(/<br>/g, " ")}</li>`).join("");
  return `<div class="co">
    <div class="co__stage" style="aspect-ratio:${W} / ${H}">
      ${img(p, "co__phone", ` style="left:${pct(c.phone.x, W)};width:${pct(c.phone.w, W)}"`)}
      <svg class="co__lines" viewBox="0 0 ${W} ${H}" aria-hidden="true">${lines}</svg>
      ${chips}
    </div>
    <ul class="co__list">${list}</ul>
  </div>`;
}

const mockup = (p) => (p.callouts ? callouts(p) : `<figure class="phone">${img(p, "phone__img")}</figure>`);

// Слот под видео: пока src пустой — серая заглушка; впишите путь в data — разметка не меняется
function videoSlot(v) {
  const body = v.src
    ? `<video controls playsinline preload="metadata"${v.poster ? ` poster="${esc(url(v.poster))}"` : ""} aria-label="${esc(v.label || "Видео")}"><source src="${esc(url(v.src))}"></video>`
    : `<div class="vslot__ph" role="img" aria-label="${esc(v.label || "Видео")} — будет добавлено"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="none"/><path d="M19 15L34 24L19 33Z"/></svg></div>`;
  return `<figure class="vslot" style="aspect-ratio:${esc(v.ratio || "9 / 16")}" data-state="${v.src ? "ready" : "empty"}">${body}</figure>`;
}

// Произвольная картинка/композиция экранов (не «один телефон»): variant — plain | multiply (белый фон картинки) | dark (тёмная панель)
function figure(f) {
  const items = f.items || [f];
  const style = f.maxw ? ` style="max-width:${f.maxw}px"` : "";
  return `<figure class="fig fig--${esc(f.variant || "plain")}"${style}>${items.map((i) => img(i, "fig__img")).join("")}</figure>`;
}

// Сценарий: последовательность шагов со стрелками (горизонтально на десктопе, вертикально на мобильном)
const ARW_H = `<svg class="scn__a scn__a--h" viewBox="0 0 22 9" width="22" height="9" aria-hidden="true"><path d="M0 4.5H21M17.5 1L21 4.5L17.5 8" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
const ARW_V = `<svg class="scn__a scn__a--v" viewBox="0 0 9 22" width="9" height="22" aria-hidden="true"><path d="M4.5 0V21M1 17.5L4.5 21L8 17.5" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;
function scenario(b) {
  const li = b.items.map((s, i) => `<li class="scn__i"><span class="scn__n">${String(i + 1).padStart(2, "0")}</span><h4 class="scn__t">${plain(s.title)}</h4><p>${plain(s.text)}</p></li>`);
  return `<ol class="scn">${li.join(ARW_H + ARW_V)}</ol>${b.note ? note(b.note) : ""}`;
}

// --- ProductScreenSection: текст + экран. Один шаблон для всех экранов продукта ------------------------
// Порядок в текстовой колонке всегда один: заголовок → метка гипотезы (если есть) → части → заметка.
function featureText(b, sec) {
  const title = b.head
    ? `${bar(sec)}<h2 class="feat__title" id="${esc(sec.id)}-t">${rich(sec.title)}</h2>`
    : b.subtitle ? `<h3 class="feat__title">${rich(b.subtitle)}</h3>` : "";
  return `<div class="feat__text">${title}${b.hypothesis ? hypBadge(b.hypothesis) : ""}<div class="feat__parts">${parts(b.parts || [])}</div>${b.note ? note(b.note) : ""}</div>`;
}

function feature(b, sec) {
  const side = b.phoneSide || "right";
  const media = b.video ? videoSlot(b.video) : b.figure ? figure(b.figure) : mockup(b.phone);
  return `<div class="feat feat--${side}${b.phone && b.phone.callouts ? " feat--co" : ""}">
    ${featureText(b, sec)}
    <div class="feat__media">${media}</div>
  </div>`;
}

// --- Таймлайн ---------------------------------------------------------------------------------------------
function timeline(b) {
  return `<ol class="tl">${b.items.map((i) => `<li class="tl__i${i.tone ? ` tl__i--${i.tone}` : ""}" style="flex-grow:${i.grow || 1}"><h4 class="plabel">${plain(i.label)}</h4><p>${plain(i.value)}</p></li>`).join("")}</ol>`;
}

// Уникальный блок: произвольная вёрстка автора (доверенный HTML из data/cases/<slug>.js)
const htmlBlock = (b) => b.html;

const REGISTRY = { html: htmlBlock, cards, banner, bar: barBlock, note: noteBlock, status: statusBlock, method, compare, journey, insights, palette, flow, feature, timeline, scenario };

// Свой тип блока можно зарегистрировать из кода: registerBlock("мой-тип", (данные, раздел) => "<html>")
export const registerBlock = (type, fn) => { REGISTRY[type] = fn; };

export function renderBlock(b, sec) {
  const fn_ = REGISTRY[b.type];
  if (!fn_) { console.warn("Неизвестный тип блока:", b.type); return ""; }
  return `<div class="blk blk--${esc(b.type)}">${fn_(b, sec)}</div>`;
}

export function renderSection(sec) {
  return `<section class="cs${sec.inlineHead ? " cs--inline" : ""}" id="${esc(sec.id)}" aria-labelledby="${esc(sec.id)}-t">
    ${sec.inlineHead ? "" : sectionHead(sec)}
    <div class="cs__body">${sec.blocks.map((b) => renderBlock(b, sec)).join("")}</div>
  </section>`;
}

export function renderCover(c) {
  const meta = c.meta.map(([k, v, sub]) => `<div class="tile"><dt>${plain(k)}</dt><dd>${plain(v)}${sub ? `<small>${plain(sub)}</small>` : ""}</dd></div>`).join("");
  return `<header class="cover">
    <div class="cover__text">
      ${c.brand ? `<h1 class="cover__brand">${img({ ...c.brand.icon, alt: "" }, "cover__icon")}${img(c.brand.wordmark, "cover__word")}</h1>` : `<h1 class="cover__title">${plain(c.title)}</h1>`}
      <p class="cover__tag">${plain(c.tagline)}</p>
      <dl class="tiles">${meta}</dl>
      <p class="bar cover__result">${plain(c.result)}</p>
    </div>
    <div class="cover__media">${img(c.image, "cover__phone")}</div>
  </header>`;
}

// Мобильная кривая пути: рисуется по реальным позициям эмодзи (работает при любой высоте карточек)
export function initJourneys(root = document) {
  root.querySelectorAll(".jsteps").forEach((ol) => {
    const svg = ol.querySelector(".jv"); if (!svg) return;
    const draw = () => {
      const on = getComputedStyle(ol.querySelector(".jstep__emoji") || ol).display !== "none";
      svg.style.display = on ? "block" : "none"; if (!on) return;
      const o = ol.getBoundingClientRect();
      const pts = [...ol.querySelectorAll(".jstep__emoji")].map((e) => { const r = e.getBoundingClientRect(); return [r.left - o.left + r.width / 2, r.top - o.top + r.height / 2]; });
      svg.setAttribute("viewBox", `0 0 ${o.width} ${o.height}`); svg.setAttribute("width", o.width); svg.setAttribute("height", o.height);
      svg.firstElementChild.setAttribute("d", curve(pts));
    };
    draw();
    if ("ResizeObserver" in window) new ResizeObserver(draw).observe(ol);
    ol.querySelectorAll("img").forEach((i) => i.addEventListener("load", draw));
    window.addEventListener("resize", draw);
  });
}
