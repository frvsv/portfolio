// Типографика для всей страницы: предлоги, союзы и короткие слова (до 2 букв + список) склеиваются
// со следующим словом неразрывным пробелом — не остаются в конце строки. Тире и «число + слово» тоже.
const NB = " ";
const GLUE = new Set(("в во к ко с со у о об от до из за на по не ни но да и а я же ли бы то ещё как что для при без над под про или").split(" "));
export const typo = (s) => s
  .replace(/(?<=^|[\s («"„*])([А-Яа-яЁё]{1,4})\s+(?=\S)/g, (m, w) => (w.length <= 2 || GLUE.has(w.toLowerCase()) ? w + NB : m))
  .replace(/(\d%?)\s+(?=[A-Za-zА-Яа-яЁё])/g, "$1" + NB)
  .replace(/\s+—/g, NB + "—");

export function glueDom(root = document.body) {
  const skip = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "NOSCRIPT"]);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (skip.has(n.parentElement?.tagName) || !n.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
  nodes.forEach((n) => { const t = typo(n.nodeValue); if (t !== n.nodeValue) n.nodeValue = t; });
}
