// ============================================================
//  ДАННЫЕ ПРОЕКТОВ — единственное место, где нужно менять тексты.
//  Чтобы добавить презентацию к проекту-заглушке:
//   1. положите PDF в assets/pdf/
//   2. укажите путь в поле pdf (например "../../assets/pdf/x-mall.pdf")
//   3. положите обложку в assets/img/ и укажите её в поле cover
//   4. поменяйте status на "ready"
//  Подробнее — в файле ИНСТРУКЦИЯ.md
// ============================================================

export const PROJECTS = [
  {
    slug: "praybible",
    status: "ready",              // "ready" | "soon"
    title: "PrayBible",
    caption: "AI-продукт для верующих: спокойные цифровые ритуалы, которым доверяют люди из разных поколений",
    category: "Мобильное приложение",
    platform: "iOS, Android",
    cover: "assets/img/praybible-cover.webp",
    coverBg: "#f5f8fe",
    coverAlt: "Главный экран приложения PrayBible на смартфоне",
    summary:
      "Заказной проект в рамках брендбука и ТЗ клиента: AI-приложение на стыке веры и технологий. Айдентика, пользовательские потоки, hi-fi макеты и передача в разработку. Приложение опубликовано в App Store и Google Play.",
    meta: [
      ["Роль", "UX/UI Designer"],
      ["Команда", "6 человек"],
      ["Платформа", "iOS, Android"],
      ["Срок", "3 месяца"],
    ],
    // Оригинальная презентация (PDF). Пути указаны от корня сайта.
    pdf: "assets/pdf/praybible.pdf",
    pdfTitle: "PrayBible — презентация кейса",
    // Ссылка на макет в Figma (необязательно). Убедитесь, что доступ «по ссылке» включён.
    figma: "https://www.figma.com/design/LskfXsxGEBkCY7iabL6jDj/Untitled?node-id=0-1",
    figmaLabel: "Открыть макет в Figma",
    // Видео демонстрации. Место в презентации: серый прямоугольник в разделе 10.
    // Координаты — доли от размера страницы PDF (страница 1), поэтому видео
    // масштабируется вместе с презентацией.
    // Когда видео будет готово — положите файл в assets/video/ и укажите src.
    video: {
      src: "",                    // например "assets/video/praybible-demo.mp4"
      poster: "",                 // необязательно: "assets/img/praybible-video-poster.jpg"
      page: 1,
      x: 0.634286, y: 0.852601, w: 0.234286, h: 0.048671,
      label: "Демонстрация взаимодействий в приложении PrayBible",
    },
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
    meta: [],
    pdf: "",
    pdfTitle: "",
    figma: "",
    video: null,
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
    meta: [],
    pdf: "",
    pdfTitle: "",
    figma: "",
    video: null,
  },
];

// ============================================================
//  ДАННЫЕ ИЗ CV — раздел «Обо мне»
// ============================================================
export const PROFILE = {
  name: "Данил Сафин",
  role: "UX/UI Designer",
  email: "wnbp.123@gmail.com",
  phone: "+7 922 711 46 91",
  telegram: "EverSeven",
  cv: "assets/pdf/cv-danil-safin.pdf",
};
