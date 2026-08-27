/**
 * Оборачивает таблицы статей в контейнер с горизонтальной прокруткой.
 *
 * Прежде скролл держала сама таблица (display: block), но это ломает табличную
 * раскладку: ячейки теряют общий контекст колонок, и узкие таблицы схлопываются
 * по содержимому, оставляя половину меры пустой. Обёртка возвращает таблице
 * display: table и width: 100%, а прокрутку отдаёт контейнеру.
 */
import { visit } from 'unist-util-visit';

export function rehypeTableScroll() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === null) return;
      if (parent.type === 'element' && parent.properties?.className?.includes?.('table-scroll')) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [node],
      };
    });
  };
}
