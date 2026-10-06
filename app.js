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
  map = L.map('map', {zoomControl:false, minZoom:1, maxZoom:9, zoomSnap:0.25,
    zoomDelta:0.5, worldCopyJump:false, maxBounds:[[-65,-195],[85,195]], maxBoundsViscosity:1});
  const worldBounds = L.latLngBounds([[-57,-178],[81,178]]);
  const worldView = () => {
    const smallScreen = matchMedia('(max-width:700px)').matches;
    map.setMinZoom(0);
    map.fitBounds(worldBounds, {paddingTopLeft:[20,smallScreen ? 70 : 90], paddingBottomRight:[20,50], animate:false});
    map.setMinZoom(map.getZoom());
  };
  worldView();

  // Shared boundary vertices build a neighbour graph, so touching countries
  // receive different atlas colours without an external tile service.
  const countries = window.WORLD.features.filter(feature => feature.properties.NAME_EN !== 'Antarctica');
  const palette = ['#f3db80','#97c994','#edb39c','#a7d6ce','#c7cf89','#b7cedf','#e7c7d8','#dac59c'];
  const neighbours = countries.map(() => new Set());
  const vertices = new Map();
  const ringsOf = feature => feature.geometry.type === 'Polygon'
    ? feature.geometry.coordinates : feature.geometry.coordinates.flat();
  countries.forEach((feature,index) => {
    for (const ring of ringsOf(feature)) for (const point of ring) {
      const key = point.map(value => value.toFixed(3)).join(',');
      if (!vertices.has(key)) vertices.set(key,new Set());
      const owners = vertices.get(key);
      for (const owner of owners) if (owner !== index) {
        neighbours[index].add(owner); neighbours[owner].add(index);
      }
      owners.add(index);
    }
  });
  const colours = new Map(), colourUse = palette.map(() => 0);
  while (colours.size < countries.length) {
    const remaining = countries.map((_,index) => index).filter(index => !colours.has(index));
    const saturation = index => new Set([...neighbours[index]].filter(n => colours.has(n)).map(n => colours.get(n))).size;
    remaining.sort((a,b) => saturation(b)-saturation(a) || neighbours[b].size-neighbours[a].size || a-b);
    const index = remaining[0], taken = new Set([...neighbours[index]].map(n => colours.get(n)));
    const choices = palette.map((_,i) => i).filter(i => !taken.has(i)).sort((a,b) => colourUse[a]-colourUse[b] || a-b);
    const colour = choices[0] ?? 0;
    colours.set(index,colour); colourUse[colour]++;
  }
  const colourByName = new Map(countries.map((feature,index) => [feature.properties.NAME_EN,palette[colours.get(index)]]));
  map.createPane('graticule'); map.getPane('graticule').style.zIndex=250;
  map.getPane('graticule').style.pointerEvents='none';
  for (let lng=-180;lng<=180;lng+=30) L.polyline([[-65,lng],[84,lng]], {pane:'graticule',color:'#78b6c3',weight:0.7,opacity:0.35,interactive:false}).addTo(map);
  for (let lat=-60;lat<=80;lat+=20) L.polyline([[lat,-180],[lat,180]], {pane:'graticule',color:'#78b6c3',weight:0.7,opacity:0.35,interactive:false}).addTo(map);
  L.geoJSON(countries, {
    style:feature => ({color:'#698b83',weight:0.85,fillColor:colourByName.get(feature.properties.NAME_EN),fillOpacity:1}),
    onEachFeature:(feature,layer) => layer.bindTooltip(escapeHTML(feature.properties.NAME_EN), {sticky:true,className:'country-tooltip'}),
    attribution:'Map data: <a href="https://www.naturalearthdata.com/">Natural Earth</a>'
  }).addTo(map);
  map.createPane('countryLabels'); map.getPane('countryLabels').style.zIndex=450;
  map.getPane('countryLabels').style.pointerEvents='none';
  const labels = L.layerGroup().addTo(map);
  const shortNames = {'United States of America':'United States',"People’s Republic of China":'China',"People's Republic of China":'China','Democratic Republic of the Congo':'DR Congo','Republic of the Congo':'Congo','Central African Republic':'Central African Rep.','Bosnia and Herzegovina':'Bosnia & Herzegovina'};
  const labelLocations = {'Russia':[62,96],'Canada':[60,-106],'United States of America':[39,-100]};
  const ringArea = ring => Math.abs(ring.reduce((sum,point,i) => {const next=ring[(i+1)%ring.length]; return sum+point[0]*next[1]-next[0]*point[1];},0));
  const labelData = countries.map(feature => {
    const p=feature.properties, ring=ringsOf(feature).reduce((largest,ring) => ringArea(ring)>ringArea(largest) ? ring : largest,[]);
    return {name:p.NAME_EN, text:shortNames[p.NAME_EN] || p.NAME_EN, location:labelLocations[p.NAME_EN] || [p.LABEL_Y,p.LABEL_X], area:ringArea(ring)};
  }).filter(item => item.location.every(Number.isFinite)).sort((a,b) => b.area-a.area);
  const oceans = [ ['North Atlantic Ocean',29,-39],['South Atlantic Ocean',-30,-18],['North Pacific Ocean',28,-145],['South Pacific Ocean',-28,-125],['Indian Ocean',-25,79],['Arctic Ocean',80,-25] ];
  const updateLabels = () => {
    labels.clearLayers();
    const occupied=[], size=map.getSize(), zoom=map.getZoom();
    for (const item of labelData) {
      // Large countries read at world scale; smaller names appear on zoom.
      if (zoom < 5 && item.area * Math.pow(4,zoom-2) < 10) continue;
      const point=map.latLngToContainerPoint(item.location);
      if (point.x<0 || point.y<0 || point.x>size.x || point.y>size.y) continue;
      const fontSize=zoom<2 ? 10 : zoom<4 ? 11 : 12;
      const width=Math.min(135, Math.max(42,item.text.length*fontSize*0.61));
      const height=item.text.length*fontSize*0.61>135 ? 30 : 16;
      const box={left:point.x-width/2-4,right:point.x+width/2+4,top:point.y-height/2-3,bottom:point.y+height/2+3};
      if (occupied.some(other => box.left<other.right && box.right>other.left && box.top<other.bottom && box.bottom>other.top)) continue;
      occupied.push(box);
      L.marker(item.location,{pane:'countryLabels',interactive:false,keyboard:false,icon:L.divIcon({className:'country-label',html:`<span style="font-size:${fontSize}px">${escapeHTML(item.text)}</span>`,iconSize:[width,height],iconAnchor:[width/2,height/2]})}).addTo(labels);
    }
    if (zoom<4 && (size.x>=600 || zoom>=2)) for (const [name,lat,lng] of oceans) {
      L.marker([lat,lng],{pane:'countryLabels',interactive:false,keyboard:false,icon:L.divIcon({className:'ocean-label',html:escapeHTML(name),iconSize:[120,36],iconAnchor:[60,18]})}).addTo(labels);
    }
  };
  map.on('zoomend moveend resize',updateLabels); updateLabels();
  L.control.zoom({position:'bottomright'}).addTo(map);
  clusters = L.markerClusterGroup({maxClusterRadius:38,spiderfyOnMaxZoom:true,showCoverageOnHover:false,zoomToBoundsOnClick:true,animate:!matchMedia('(prefers-reduced-motion:reduce)').matches,iconCreateFunction:cluster=>L.divIcon({html:String(cluster.getChildCount()),className:'cluster'+(cluster.getChildCount()>9?' large':''),iconSize:[32,32]})});
  for(const item of items){
    const marker=L.marker([item.lat,item.lng],{icon:L.divIcon({html:'<span class="pin-dot"></span>',className:'pin',iconSize:[28,34],iconAnchor:[14,30]}),title:`${item.title} — ${locationLabel(item)}`,alt:`${item.title} — ${locationLabel(item)}`,keyboard:true});
    marker.on('click',()=>selectItem(item));
    markers.set(item.id,marker);clusters.addLayer(marker);
  }
  map.addLayer(clusters);
  document.querySelector('#reset').addEventListener('click',()=>{closeCard();worldView();});
  new ResizeObserver(() => {
    const showingWorld = map.getZoom() === map.getMinZoom();
    map.invalidateSize();
    if (showingWorld) worldView();
  }).observe(document.querySelector('#map'));
} else {
  document.querySelector('#map-error').hidden=false;
  document.querySelector('#reset').hidden=true;
}
