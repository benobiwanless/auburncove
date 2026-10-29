(() => {
  const grid = document.getElementById('ac-calendar-grid');
  if (!grid) return;
  const title = document.getElementById('ac-month-title');
  const details = document.getElementById('ac-calendar-details');
  const today = new Date();
  const shown = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = null;
  let events = [];
  let loadError = false;
  const fmtDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const escapeText = (v) => String(v ?? '');
  const eventDay = (e) => e.date || (e.start || '').slice(0,10);
  const monthStart = fmtDay(shown);
  const monthEnd = fmtDay(new Date(shown.getFullYear(), shown.getMonth()+1, 0));
  const byDay = (day) => events.filter(e => eventDay(e) <= day && (e.endDate || eventDay(e)) >= day);
  const homeEvents = document.getElementById('home-upcoming-list');
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
      item.append(dateBox,body); homeEvents.append(item);
    });
  }
  function render() {
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
      if (d.getMonth() === shown.getMonth()) b.addEventListener('click',()=>{selected=key;render();});
      grid.append(b);
    }
    renderHomeEvents();
  }
  render();
  fetch('calendar-events.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Not available');return r.json();}).then(data=>{
    events=Array.isArray(data)?data:[];loadError=false;render();
  }).catch(()=>{loadError=true;render();});
})();
