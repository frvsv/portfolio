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
    coverM: "assets/projects/praybible/cover-m.webp",   // вертикальная версия для телефонов (4:5)
    coverMW: 1440, coverMH: 1800,
    coverBg: "#f5f8fe",
    coverAlt: "Обложка кейса PrayBible: название, роль, команда и экран приложения на смартфоне",
    summary:
      "Заказная разработка в рамках брендбука и ТЗ клиента: AI-приложение на стыке веры и технологий.",
    hasCase: true,                // true — страница строится из data/cases/<slug>.js
  },
  {
    slug: "barberbook",
    status: "ready",
    title: "BarberBook",
    caption: "Telegram Mini App для онлайн-записи в барбершопы: дизайн-концепт с клиентской базой у бизнеса",
    category: "Дизайн-концепт",
    platform: "Telegram Mini App",
    cover: "assets/projects/barberbook/cover.webp",   // обложка карточки, 16:9
    coverW: 3000, coverH: 1691,
    coverM: "assets/projects/barberbook/cover-m.webp",
    coverMW: 1440, coverMH: 1800,
    coverBg: "#f6efe7",
    coverAlt: "Обложка кейса BarberBook: название, роль и экран записи в Telegram Mini App на смартфоне",
    summary: "Продуктовый дизайн-концепт сервиса онлайн-записи: архитектура, сценарий записи и интерфейс MVP.",
    hasCase: true,
  },
  {
    slug: "barberbook-new",
    status: "ready",
    title: "BarberBook (новая версия)",
    caption: "Сервис онлайн-записи в барбершопы внутри Telegram: дизайн-концепт",
    category: "Дизайн-концепт",
    platform: "Telegram Mini App",
    cover: "assets/projects/barberbook/cover.webp",   // обложка карточки, 16:9
    coverW: 3000, coverH: 1691,
    coverM: "assets/projects/barberbook/cover-m.webp",
    coverMW: 1440, coverMH: 1800,
    coverBg: "#f6efe7",
    coverAlt: "Обложка кейса BarberBook: название, роль и экран записи в Telegram Mini App на смартфоне",
    summary: "Продуктовый дизайн-концепт сервиса онлайн-записи: архитектура, сценарий записи и интерфейс MVP.",
    hasCase: true,
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
