(() => {
  const grid = document.getElementById('ac-calendar-grid');
  if (!grid) return;
  const title = document.getElementById('ac-month-title');
  const details = document.getElementById('ac-calendar-details');
  const today = new Date();
  let shown = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = null;
  let events = [];
  let loadError = false;
  const fmtDay = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const escapeText = (v) => String(v ?? '');
  const eventDay = (e) => e.date || (e.start || '').slice(0,10);
  const byDay = (day) => events.filter(e => eventDay(e) <= day && (e.endDate || eventDay(e)) >= day);
  function renderDetails(day) {
    details.replaceChildren();
    const h = document.createElement('h3');
    h.textContent = day ? `Events for ${new Date(day+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}` : 'Upcoming Events';
    details.append(h);
    const upcoming = day ? byDay(day) : events.filter(e => (e.endDate || eventDay(e)) >= fmtDay(today)).slice(0,8);
    if (!upcoming.length) {
      const p = document.createElement('p');
      p.textContent = loadError ? 'Events could not be loaded. Check calendar publishing settings.' : 'No events listed yet.';
      details.append(p);
      return;
    }
    upcoming.forEach(e => {
      const item = document.createElement('div'); item.className = 'ac-event-detail';
      const strong = document.createElement('strong'); strong.textContent = escapeText(e.title || 'Community event');
      item.append(strong);
      const meta = document.createElement('small');
      meta.textContent = [e.displayDate, e.location].filter(Boolean).join(' · ');
      item.append(meta);
      if (e.description) {
        const p = document.createElement('p'); p.textContent = escapeText(e.description); item.append(p);
      }
      details.append(item);
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
      if (d.getMonth() !== shown.getMonth()) b.classList.add('is-other-month');
      if (key === fmtDay(today)) b.classList.add('is-today');
      if (key === selected) b.classList.add('is-selected');
      const number = document.createElement('span'); number.className='ac-day-number'; number.textContent=d.getDate(); b.append(number);
      matches.slice(0,2).forEach(e => {const chip=document.createElement('span');chip.className='ac-event-chip';chip.textContent=e.title;b.append(chip);});
      if (matches.length > 2) {const more=document.createElement('span');more.className='ac-more';more.textContent=`+${matches.length-2} more`;b.append(more);}
      b.addEventListener('click',()=>{selected=key;render();});
      grid.append(b);
    }
    renderDetails(selected);
  }
  document.getElementById('ac-prev').addEventListener('click',()=>{shown=new Date(shown.getFullYear(),shown.getMonth()-1,1);selected=null;render();});
  document.getElementById('ac-next').addEventListener('click',()=>{shown=new Date(shown.getFullYear(),shown.getMonth()+1,1);selected=null;render();});
  render();
  fetch('calendar-events.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Not available');return r.json();}).then(data=>{
    events=Array.isArray(data)?data:[];loadError=false;render();
  }).catch(()=>{loadError=true;render();});
})();
