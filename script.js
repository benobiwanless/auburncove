const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menu?.setAttribute('aria-expanded', 'false');
}));
const pages = [...document.querySelectorAll('.site-page')];
const validPages = new Set(pages.map(page => page.id));
function showPage() {
  const requested = location.hash.slice(1);
  const current = validPages.has(requested) ? requested : 'home';
  pages.forEach(page => { page.hidden = page.id !== current; });
  nav?.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('href') === '#' + current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', showPage);
showPage();
