// ============================================================
//  ДАННЫЕ ПРОЕКТОВ ДЛЯ ГЛАВНОЙ И ШАПОК КЕЙСОВ
//  (содержимое самих презентаций лежит в data/cases/<slug>.js)
//
//  Чтобы подключить кейс-презентацию к проекту-заглушке:
//   1. создайте data/cases/<slug>.js по образцу data/cases/praybible.js
//   2. положите картинки в assets/projects/<slug>/img/, обложку — assets/projects/<slug>/cover.webp
//   3. здесь поменяйте status на "ready", впишите cover, caption, category
//  Подробно — в файле CASE_AUTHORING_GUIDE.md
// ============================================================

export const PROJECTS = [
  {
    slug: "praybible",
    status: "ready",              // "ready" — кейс опубликован | "soon" — заглушка «Скоро»
    title: "PrayBible",
    caption: "AI-продукт для верующих: спокойные цифровые ритуалы, которым доверяют люди из разных поколений",
    category: "Мобильное приложение",
    platform: "iOS, Android",
    cover: "assets/projects/praybible/cover.webp",   // обложка карточки, 16:9
    coverW: 3000, coverH: 1691,
    coverBg: "#f5f8fe",
    coverAlt: "Обложка кейса PrayBible: название, роль, команда и экран приложения на смартфоне",
    summary:
      "Заказная разработка в рамках брендбука и ТЗ клиента: AI-приложение на стыке веры и технологий.",
    // Ссылка на макет в Figma (необязательно). У файла должен быть доступ «просмотр по ссылке».
    figma: "https://www.figma.com/design/LskfXsxGEBkCY7iabL6jDj/Untitled?node-id=0-1",
    figmaLabel: "Открыть макет в Figma",
    hasCase: true,                // true — страница строится из data/cases/<slug>.js
  },
  {
    slug: "x-mall",
    status: "soon",
    title: "X-Mall",
    caption: "Кейс в подготовке — презентация появится здесь",
    category: "Кейс в подготовке",
    platform: "",
    cover: "",
    coverBg: "#e7e3da",
    summary: "Кейс находится в работе.",
    figma: "",
    hasCase: false,
  },
  {
    slug: "barberbook",
    status: "soon",
    title: "BarberBook",
    caption: "Кейс в подготовке — презентация появится здесь",
    category: "Кейс в подготовке",
    platform: "",
    cover: "",
    coverBg: "#dfe3e6",
    summary: "Кейс находится в работе.",
    figma: "",
    hasCase: false,
  },
];

// ============================================================
//  ДАННЫЕ ИЗ CV — раздел «Обо мне» и контакты
// ============================================================
export const PROFILE = {
  name: "Данил Сафин",
  role: "UX/UI Designer",
  email: "wnbp.123@gmail.com",
  phone: "+7 922 711 46 91",
  telegram: "EverSeven",
  cv: "assets/pdf/cv-danil-safin.pdf",
};
