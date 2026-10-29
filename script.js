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

// Edit newsletters.json to publish newsletter posts without changing page layout.
fetch('newsletters.json', {cache:'no-store'}).then(r => {if(!r.ok) throw new Error('Not found');return r.json()}).then(items => {
 const target=document.getElementById('newsletter-list');if(!target || !Array.isArray(items) || !items.length)return;
 target.replaceChildren();
 items.forEach(item=>{
  const article=document.createElement('article');article.className='newsletter-entry';
  const heading=document.createElement('h3');heading.textContent=item.title || 'Community newsletter';article.append(heading);
  if(item.date){const time=document.createElement('time');time.textContent=item.date;article.append(time)}
  if(item.summary){const para=document.createElement('p');para.textContent=item.summary;article.append(para)}
  if(item.url && /^(https:\/\/|[a-zA-Z0-9_./-]+\.pdf$)/.test(item.url)){const link=document.createElement('a');link.href=item.url;link.textContent='Read newsletter →';link.rel='noopener noreferrer';if(item.url.startsWith('https://'))link.target='_blank';article.append(link)}
  target.append(article);
 });
}).catch(()=>{});
