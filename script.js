// Auburn Cove page navigation: switch views without browser anchor jumps.
const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
const pages = [...document.querySelectorAll('.site-page')];
const validPages = new Set(pages.map(page => page.id));

function currentPage() {
  const name = decodeURIComponent(window.location.hash.slice(1));
  return validPages.has(name) ? name : 'home';
}

function showPage(pageName, resetScroll = false) {
  const selected = validPages.has(pageName) ? pageName : 'home';
  pages.forEach(page => { page.hidden = page.id !== selected; });
  if (resetScroll) {
    // Disable smooth scrolling temporarily so navigation feels like an app.
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previous;
  }
}

if (menu && nav) {
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
}

// Intercept internal page links, including the logo and Home button.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = link.getAttribute('href').slice(1);
    if (!validPages.has(target)) return;
    event.preventDefault();
    if (nav && menu) {
      nav.classList.remove('open');
      menu.setAttribute('aria-expanded', 'false');
    }
    const changed = currentPage() !== target;
    if (changed) {
      history.pushState({ page: target }, '', '#' + target);
      showPage(target, true);
    } else {
      // Clicking the active tab again does nothing: no anchor jump.
      showPage(target, false);
    }
  });
});

window.addEventListener('popstate', () => showPage(currentPage(), true));
window.addEventListener('hashchange', () => showPage(currentPage(), true));
showPage(currentPage());
