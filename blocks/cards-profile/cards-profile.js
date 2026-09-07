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

  // Contributor social links are authored as plain text ("Facebook", "Twitter",
  // "Instagram") in their own <p>. Tag each with the platform so the CSS can
  // render a dark icon button, and mark the row so the <p>s lay out inline.
  ul.querySelectorAll('.cards-profile-card-body').forEach((body) => {
    const socialLinks = [...body.querySelectorAll(':scope > p > a')]
      .filter((a) => /^(facebook|twitter|instagram)$/i.test(a.textContent.trim()));
    socialLinks.forEach((a) => {
      const platform = a.textContent.trim().toLowerCase();
      a.dataset.social = platform;
      a.setAttribute('aria-label', a.textContent.trim());
      a.closest('p').classList.add('cards-profile-social-item');
    });
  });

  block.textContent = '';
  block.append(ul);
}
