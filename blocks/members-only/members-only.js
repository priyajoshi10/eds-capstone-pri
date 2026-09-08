/**
 * members-only — gated "Members Only" teasers on the magazine page.
 * Each row is one locked teaser: a text cell (heading + short description +
 * Read More) and an image cell. We render them as <li> cards laid out in a
 * grid; the locked visual treatment (yellow corner ribbon + lock badge) lives
 * in members-only.css. Authored order in the source is text-then-image, but the
 * image is displayed BELOW the text — the CSS handles ordering.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'members-only-card';

    const cells = [...row.children];
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic) {
        cell.className = 'members-only-card-image';
      } else {
        cell.className = 'members-only-card-body';
      }
      li.append(cell);
    });

    ul.append(li);
  });
  block.replaceChildren(ul);
}
