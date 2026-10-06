'use strict';
const items = [...window.OPPORTUNITIES].sort((a, b) =>
  (b.firstSeen || '').localeCompare(a.firstSeen || '') || Number(a.id) - Number(b.id));
const list = document.querySelector('#list');
const detail = document.querySelector('#detail');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let selected = null, map = null, clusters = null;
const markers = new Map();
const locationLabel = item => item.place === item.country ? item.country : `${item.place}, ${item.country}`;
const formatDate = value => new Date(`${value}T12:00:00Z`).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const detailRow = (label, value, note = '') => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}${note ? `<small>${escapeHTML(note)}</small>` : ''}</dd></div>`;
document.querySelector('#total').textContent = items.length;
document.querySelector('#list-count').textContent = `${items.length} listed`;
document.querySelector('#region-count').textContent = new Set(items.map(item => item.region)).size;
const refreshDate = items.map(item => item.lastCheckAttempt).filter(Boolean).sort().at(-1);
if (refreshDate) document.querySelector('#refresh-note').textContent = `Refreshed ${formatDate(refreshDate)}. Availability and terms must be confirmed with each host.`;
const displayNumbers = new Map();
let displayNumber = 0;
for (const region of ['Europe','Africa','Asia','Americas','Oceania']) {
  for (const item of items.filter(item => item.region === region)) displayNumbers.set(item.id, ++displayNumber);
}
for (const region of ['Europe','Africa','Asia','Americas','Oceania']) {
  const group = items.filter(item => item.region === region);
  const heading = document.createElement('div');
  heading.className = 'region-title';
  heading.innerHTML = `${region.toUpperCase()} <span>${group.length} opportunities</span>`;
  list.append(heading);
  for (const item of group) {
    const button = document.createElement('button');
    button.className = 'list-item';
    button.type = 'button';
    button.id = `opportunity-${item.id}`;
    button.setAttribute('aria-pressed','false');
    button.innerHTML = `<span class="number">${String(displayNumbers.get(item.id)).padStart(2,'0')}</span><span><span class="item-title">${escapeHTML(item.title)}</span><span class="item-location">${escapeHTML(locationLabel(item))}</span>${item.firstSeen ? `<span class="listing-badge">Added ${formatDate(item.firstSeen)}</span>` : ''}${item.sourceStatus === 'unverified' ? '<span class="listing-badge needs-review">Needs recheck</span>' : ''}</span>`;
    button.addEventListener('click', () => selectItem(item, true));
    list.append(button);
  }
}
function selectItem(item, navigate = false) {
  if (selected) {
    document.getElementById(`opportunity-${selected.id}`).classList.remove('active');
    document.getElementById(`opportunity-${selected.id}`).setAttribute('aria-pressed','false');
    markers.get(selected.id)?.getElement()?.classList.remove('selected');
  }
  selected = item;
  const button = document.getElementById(`opportunity-${item.id}`);
  button.classList.add('active');
  button.setAttribute('aria-pressed','true');
  if (!navigate) button.scrollIntoView({block:'nearest'});
  const sourceNote = item.sourceStatus === 'unverified'
    ? `${item.availabilityNote} Last attempt: ${formatDate(item.lastCheckAttempt)}.`
    : item.availabilityNote || 'Confirm current availability with the host.';
  const rows = [
    detailRow('Location', locationLabel(item), item.locationPrecision || 'Approximate town or region'),
    detailRow('Type', item.opportunityType || 'Volunteering'),
    detailRow('Source check', item.lastChecked ? formatDate(item.lastChecked) : 'Not verified', sourceNote),
    ...(item.minimumStay ? [detailRow('Stay', item.minimumStay)] : []),
    ...(item.fees ? [detailRow('Fees', item.fees)] : []),
    ...(item.accommodation ? [detailRow('Stay includes', item.accommodation)] : []),
    ...(item.postedDate ? [detailRow('Posted', formatDate(item.postedDate))] : [])
  ].join('');
  const alternateLinks = (item.alternateSources || []).map(source => `<a class="alternate-source" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)}</a>`).join('');
  detail.innerHTML = `<div class="detail-top"></div><button class="close" type="button" aria-label="Close opportunity card">×</button><div class="detail-body"><div class="eyebrow">${escapeHTML(item.region)} · ${escapeHTML(item.platform)}</div><h2 id="detail-title" tabindex="-1">${escapeHTML(item.title)}</h2>${item.summary ? `<p class="listing-summary">${escapeHTML(item.summary)}</p>` : ''}<dl>${rows}</dl><p class="detail-note">A source check does not guarantee a vacancy. Confirm dates, costs and requirements on the original listing.</p><a class="source-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">View ${item.platform === 'Host website' ? 'host website' : escapeHTML(item.platform) + ' listing'}</a>${alternateLinks}</div>`;
  detail.hidden = false;
  detail.querySelector('.close').addEventListener('click', closeCard);
  if (navigate && map) {
    map.setView([item.lat, item.lng], 7, {animate:false});
    clusters.zoomToShowLayer(markers.get(item.id), () => markers.get(item.id).getElement()?.classList.add('selected'));
    if (matchMedia('(max-width:700px)').matches) document.querySelector('.map-area').scrollIntoView({block:'start'});
  } else markers.get(item.id)?.getElement()?.classList.add('selected');
  detail.querySelector('#detail-title').focus({preventScroll:true});
}
function closeCard() {
  detail.hidden = true;
  if (selected) {
    const button = document.getElementById(`opportunity-${selected.id}`);
    button.classList.remove('active');
    button.setAttribute('aria-pressed','false');
    markers.get(selected.id)?.getElement()?.classList.remove('selected');
    button.focus({preventScroll:true});
  }
  selected = null;
}
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !detail.hidden) closeCard(); });
if (typeof L !== 'undefined' && L.markerClusterGroup) {
  map = L.map('map', {zoomControl:false,minZoom:1,maxZoom:9,worldCopyJump:false,maxBounds:[[-75,-190],[85,190]],maxBoundsViscosity:1});
  const bounds = L.latLngBounds(items.map(item => [item.lat,item.lng]));
  const worldView = () => map.fitBounds(bounds,{padding:[30,70],maxZoom:3,animate:false});
  worldView();
  L.geoJSON(window.WORLD,{style:{color:'#c3cfc2',weight:0.7,fillColor:'#f5f6ec',fillOpacity:1},interactive:false,attribution:'Map data: <a href="https://www.naturalearthdata.com/">Natural Earth</a>'}).addTo(map);
  map.createPane('countryLabels');map.getPane('countryLabels').style.zIndex=350;map.getPane('countryLabels').style.pointerEvents='none';
  const labels = L.layerGroup();
  for(const feature of window.WORLD.features){
    const p=feature.properties;
    if(p.POP_EST>4000000 && Number.isFinite(p.LABEL_Y) && Number.isFinite(p.LABEL_X)) L.marker([p.LABEL_Y,p.LABEL_X],{pane:'countryLabels',interactive:false,icon:L.divIcon({className:'country-label',html:escapeHTML(p.NAME_EN),iconSize:[100,20],iconAnchor:[50,10]})}).addTo(labels);
  }
  const updateLabels=()=>{if(map.getZoom()>=3)labels.addTo(map);else map.removeLayer(labels);};
  map.on('zoomend',updateLabels);updateLabels();
  L.control.zoom({position:'bottomright'}).addTo(map);
  clusters = L.markerClusterGroup({maxClusterRadius:38,spiderfyOnMaxZoom:true,showCoverageOnHover:false,zoomToBoundsOnClick:true,animate:!matchMedia('(prefers-reduced-motion:reduce)').matches,iconCreateFunction:cluster=>L.divIcon({html:String(cluster.getChildCount()),className:'cluster'+(cluster.getChildCount()>9?' large':''),iconSize:[40,40]})});
  for(const item of items){
    const marker=L.marker([item.lat,item.lng],{icon:L.divIcon({html:'<span class="pin-dot"></span>',className:'pin',iconSize:[28,34],iconAnchor:[14,30]}),title:`${item.title} — ${locationLabel(item)}`,alt:`${item.title} — ${locationLabel(item)}`,keyboard:true});
    marker.on('click',()=>selectItem(item));
    markers.set(item.id,marker);clusters.addLayer(marker);
  }
  map.addLayer(clusters);
  document.querySelector('#reset').addEventListener('click',()=>{closeCard();worldView();});
  new ResizeObserver(()=>map.invalidateSize()).observe(document.querySelector('#map'));
} else {
  document.querySelector('#map-error').hidden=false;
  document.querySelector('#reset').hidden=true;
}
