/**
 * members-only — gated "Members Only" teasers on the magazine page.
 * Each row is one locked teaser (heading + short description + Read More).
 * Decorates rows into <li> cards so they lay out as a grid; the locked visual
 * treatment (dimmed panel + lock badge) lives in members-only.css.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'members-only-card';
    while (row.firstElementChild) {
      const cell = row.firstElementChild;
      cell.className = 'members-only-card-body';
      li.append(cell);
    }
    ul.append(li);
  });
  block.replaceChildren(ul);
}
