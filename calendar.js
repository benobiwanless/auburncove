(() => {
  const grid = document.getElementById('ac-calendar-grid');
  // Google Calendar is embedded on its own page; the homepage cards load independently.
  const title = document.getElementById('ac-month-title');
  const today = new Date();
  const shown = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = null;
  let events = [];
  let loadError = false;
  const fmtDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const eventDay = (e) => e.date || (e.start || '').slice(0,10);
  const monthStart = fmtDay(shown);
  const monthEnd = fmtDay(new Date(shown.getFullYear(), shown.getMonth()+1, 0));
  const byDay = (day) => events.filter(e => eventDay(e) <= day && (e.endDate || eventDay(e)) >= day);
  const homeEvents = document.getElementById('home-upcoming-list');
  // Accessible event details dialog shared by calendar and homepage.
  const overlay = document.createElement('div');
  overlay.className = 'ac-event-overlay'; overlay.hidden = true;
  overlay.innerHTML = `<section class="ac-event-dialog" role="dialog" aria-modal="true" aria-labelledby="ac-dialog-title" tabindex="-1"><button type="button" class="ac-event-close" aria-label="Close event details">×</button><div id="ac-dialog-content"></div></section>`;
  document.body.append(overlay);
  const dialog = overlay.querySelector('.ac-event-dialog');
  const content = overlay.querySelector('#ac-dialog-content');
  const closeButton = overlay.querySelector('.ac-event-close');
  let previousFocus = null;
  function closeDialog() {
    overlay.hidden = true; document.body.classList.remove('ac-modal-open');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  closeButton.addEventListener('click', closeDialog);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDialog(); });
  document.addEventListener('keydown', (e) => {
    if (overlay.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
    if (e.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button, a[href]')].filter(x => !x.disabled);
      const first = focusable[0], last = focusable[focusable.length-1];
      if (!first) return;
      if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last.focus();}
      else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first.focus();}
    }
  });
  function addDetail(tag, className, value, parent = content) {
    if (!value) return;
    const el = document.createElement(tag); el.className = className; el.textContent = value;
    parent.append(el); return el;
  }
  function showEvent(event) {
    previousFocus = document.activeElement;
    content.replaceChildren();
    addDetail('p','ac-event-kicker','AUBURN COVE EVENT');
    addDetail('h2','ac-event-title',event.title || 'Community event').id = 'ac-dialog-title';
    addDetail('p','ac-event-meta','📅  ' + (event.displayDate || event.date || 'Date to be announced'));
    if (event.location) {
      const locationLine = document.createElement('p');
      locationLine.className = 'ac-event-meta';
      const pin = document.createElement('span');
      pin.textContent = '📍  ';
      const directions = document.createElement('a');
      directions.textContent = event.location;
      directions.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(event.location) + '&travelmode=driving';
      directions.target = '_blank';
      directions.rel = 'noopener noreferrer';
      directions.title = 'Get driving directions in Google Maps';
      directions.style.cssText = 'color:#315b46;text-decoration:underline;text-underline-offset:3px;font-weight:600;';
      locationLine.append(pin, directions);
      content.append(locationLine);
    }
    if (event.description) addDetail('p','ac-event-description',event.description);
    overlay.hidden = false; document.body.classList.add('ac-modal-open'); closeButton.focus();
  }
  function showDay(day) {
    const matches = byDay(day);
    if (!matches.length) return;
    if (matches.length === 1) { showEvent(matches[0]); return; }
    previousFocus = document.activeElement;
    content.replaceChildren();
    addDetail('p','ac-event-kicker','AUBURN COVE EVENTS');
    addDetail('h2','ac-event-title',new Date(day+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})).id = 'ac-dialog-title';
    matches.forEach(e => {
      const b=document.createElement('button'); b.type='button'; b.className='ac-event-choice';
      const name=document.createElement('strong');name.textContent=e.title || 'Community event';
      const date=document.createElement('small');date.textContent=e.displayDate || '';
      b.append(name,date);b.addEventListener('click',()=>showEvent(e));content.append(b);
    });
    overlay.hidden=false;document.body.classList.add('ac-modal-open');closeButton.focus();
  }
  function renderHomeEvents() {
    if (!homeEvents) return;
    homeEvents.replaceChildren();
    const now = new Date();
    const todayKey = fmtDay(now);
    const endOfMonth = fmtDay(new Date(now.getFullYear(), now.getMonth()+1, 0));
    const upcoming = events.filter(e => eventDay(e) <= endOfMonth && (e.endDate || eventDay(e)) >= todayKey).sort((a,b) => eventDay(a).localeCompare(eventDay(b))).slice(0, 4);
    if (!upcoming.length) {
      const p = document.createElement('p'); p.className = 'home-events-empty';
      p.textContent = loadError ? 'Events are temporarily unavailable.' : 'No more events scheduled this month. Check back for updates.';
      homeEvents.append(p); return;
    }
    upcoming.forEach(e => {
      const item = document.createElement('article'); item.className = 'home-event';
      const d = new Date(eventDay(e)+'T12:00:00');
      const dateBox = document.createElement('div'); dateBox.className = 'home-event-date';
      const mon = document.createElement('span'); mon.className='home-event-month'; mon.textContent=d.toLocaleDateString('en-US',{month:'short'});
      const num = document.createElement('strong'); num.textContent=d.getDate();
      dateBox.append(mon,num);
      const body = document.createElement('div'); body.className='home-event-body';
      const h = document.createElement('h3'); h.textContent=e.title || 'Community event'; body.append(h);
      const meta = document.createElement('p'); meta.textContent=[e.displayDate,e.location].filter(Boolean).join(' · '); body.append(meta);
      item.classList.add('ac-clickable-event'); item.tabIndex=0; item.setAttribute('role','button');
      item.setAttribute('aria-label','View details for ' + (e.title || 'community event'));
      item.addEventListener('click',()=>showEvent(e));
      item.addEventListener('keydown',(ev)=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();showEvent(e);}});
      item.append(dateBox,body); homeEvents.append(item);
    });
  }
  function render() {
    if (!grid || !title) { renderHomeEvents(); return; }
    title.textContent = shown.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    grid.replaceChildren();
    const start = new Date(shown.getFullYear(),shown.getMonth(),1);
    const offset = start.getDay();
    const count = Math.ceil((offset + new Date(shown.getFullYear(),shown.getMonth()+1,0).getDate())/7)*7;
    for (let i=0; i<count; i++) {
      const d = new Date(shown.getFullYear(),shown.getMonth(),i-offset+1);
      const key = fmtDay(d);
      const matches = byDay(key);
      const b = document.createElement('button');
      b.type='button'; b.className='ac-calendar-day';
      b.setAttribute('role','gridcell');
      b.setAttribute('aria-label',d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) + (matches.length ? `, ${matches.length} events` : ''));
      if (d.getMonth() !== shown.getMonth()) { b.classList.add('is-other-month'); b.disabled = true; b.setAttribute('aria-hidden','true'); }
      if (key === fmtDay(today)) b.classList.add('is-today');
      if (key === selected) b.classList.add('is-selected');
      const number = document.createElement('span'); number.className='ac-day-number'; number.textContent=d.getMonth() === shown.getMonth() ? d.getDate() : ''; b.append(number);
      (d.getMonth() === shown.getMonth() ? matches : []).slice(0,2).forEach(e => {const chip=document.createElement('span');chip.className='ac-event-chip';const timeMatch = (e.displayDate || '').match(/(?:^|\s·\s)(\d{1,2}:\d{2}\s*[AP]M)(?:$|\s·\s)/i);
        chip.textContent = (timeMatch ? timeMatch[1] + ' · ' : '') + (e.title || 'Community event');
        chip.title = [e.displayDate, e.title, e.location].filter(Boolean).join(' · ');
        b.append(chip);});
      if (d.getMonth() === shown.getMonth() && matches.length > 2) {const more=document.createElement('span');more.className='ac-more';more.textContent=`+${matches.length-2} more`;b.append(more);}
      if (d.getMonth() === shown.getMonth()) b.addEventListener('click',()=>showDay(key));
      grid.append(b);
    }
    renderHomeEvents();
  }
  render();
  // Paste your deployed Apps Script Web App /exec URL here (not the /dev URL).
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz32slb6RWVXbJ89Xq0jUc013vQy0JO3vfrdKR6tmE4qFyvrMpYg7GRQtOydZJesPq2/exec';
  let requestId = 0;
  let liveLoaded = false;
  function loadEvents() {
    if (!APPS_SCRIPT_URL.startsWith('https://script.google.com/macros/s/')) {
      console.warn('Auburn Cove: paste the Google Apps Script deployment URL into calendar.js');
      return;
    }
    const id = ++requestId;
    const previous = document.getElementById('ac-live-feed-script');
    if (previous) previous.remove();
    const script = document.createElement('script');
    script.id = 'ac-live-feed-script';
    script.src = APPS_SCRIPT_URL + (APPS_SCRIPT_URL.includes('?') ? '&' : '?') + 't=' + Date.now();
    script.onerror = () => { if (id === requestId) console.warn('Auburn Cove: live calendar request failed; showing saved events.'); };
    document.head.append(script);
  }
  window.auburnCoveReceiveEvents = (data) => {
    if (!Array.isArray(data)) {
      console.warn('Auburn Cove: live feed error', data);
      return;
    }
    liveLoaded = true; events = data; loadError = false; render();
  };
  // Display saved events immediately while live data loads.
  fetch('calendar-events.json', {cache:'no-store'})
    .then(r => { if (!r.ok) throw Error('Not available'); return r.json(); })
    .then(data => { if (Array.isArray(data) && !liveLoaded) { events=data; loadError=false; render(); } })
    .catch(() => { if (!liveLoaded) { loadError=true; render(); } });
  loadEvents();
  // Refresh live feed every 2 minutes while the page is open.
  setInterval(() => { if (!document.hidden) loadEvents(); }, 120000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) loadEvents(); });
})();
