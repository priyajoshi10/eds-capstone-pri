import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-profile-card-image';
      else div.className = 'cards-profile-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Profile-specific decoration: treat any list of social/profile links as an
  // icon row so authors only need to drop a bullet list of links per card.
  ul.querySelectorAll('.cards-profile-card-body ul').forEach((list) => {
    list.classList.add('cards-profile-social');
    list.querySelectorAll('a').forEach((a) => a.classList.add('cards-profile-social-link'));
  });

  block.textContent = '';
  block.append(ul);
}
