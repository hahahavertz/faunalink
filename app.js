'use strict';
const items=[...window.OPPORTUNITIES].sort((a,b)=>(b.postedDate||'').localeCompare(a.postedDate||'')||Number(a.id)-Number(b.id));
const list=document.querySelector('#list'), detail=document.querySelector('#detail');
const keyword=document.querySelector('#keyword-search'), platform=document.querySelector('#platform-filter');
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const formatDate=value=>new Date(value.length===10?`${value}T12:00:00Z`:value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
const locationLabel=item=>item.place===item.country?item.country:`${item.place}, ${item.country}`;
const detailRow=(label,value)=>`<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`;
const sourcePlatform=source=>source.platform||Object.entries({'workaway.info':'Workaway','worldpackers.com':'Worldpackers','helpstay.com':'HelpStay','helpx.net':'HelpX','volunteerworld.com':'Volunteer World','goeco.org':'GoEco','goabroad.com':'GoAbroad'}).find(([domain])=>new URL(source.url).hostname.endsWith(domain))?.[1]||'Host website';
const platformsFor=item=>[item.platform,...(item.alternateSources||[]).map(sourcePlatform)];
const postingLabel=item=>item.postedDateSource?.includes('sanctuaryfederation.org/')?'GFAS board':item.postedDateNote?.includes('estimate')?'Estimated post':item.postedDateNote?.includes('metadata')?'Reported page date':'Posted';
const isSeasonClosed=item=>item.availabilityStatus==='closed_for_season';
let selected=null,selectedPlace=null,placeFilter=null,cardOpener=null,map=null,clusters=null;
let visibleItems=items,refreshMapMarkers=()=>{};
const markers=new Map();
const continents=window.SEARCH_CONTINENTS;
document.querySelector('#total').textContent=items.length;
document.querySelector('#continent-count').textContent=new Set(items.map(window.continentFor)).size;
for(const name of [...new Set(items.flatMap(platformsFor))].sort()){
  const option=document.createElement('option');option.value=name;option.textContent=name;platform.append(option);
}
for(const name of continents){
  const button=document.createElement('button');button.type='button';button.textContent=name;
  button.dataset.continent=name;button.addEventListener('click',()=>showPlace({name,kind:'continent'},button));
  document.querySelector('.continent-nav').append(button);
}
function matchesPlace(item,place){return !place||(place.kind==='continent'?window.continentFor(item)===place.name:window.countryName(item.country)===window.countryName(place.name));}
function renderList(){
  const terms=normalize(keyword.value).trim().split(/\s+/).filter(Boolean);
  visibleItems=items.filter(item=>{
    const text=normalize([item.title,item.country,item.place,window.continentFor(item),...platformsFor(item),item.organization||'',item.platformHost||'',item.summary||'',item.opportunityType||'',item.wildlifeCategory||'',...(item.species||[]),isSeasonClosed(item)?'closed paused seasonal':''].join(' ')).replace(/equine/g,'equine horse').replace(/canine/g,'canine dog').replace(/feline/g,'feline cat').replace(/united states/g,'united states usa');
    return terms.every(term=>text.includes(term))&&(!platform.value||platformsFor(item).includes(platform.value))&&matchesPlace(item,placeFilter);
  });
  if(selected&&!visibleItems.includes(selected))closeCard(false);
  list.replaceChildren();let number=0;
  for(const continent of continents){
    const group=visibleItems.filter(item=>window.continentFor(item)===continent);if(!group.length)continue;
    const heading=document.createElement('div');heading.className='region-title';
    const regionButton=document.createElement('button');regionButton.type='button';regionButton.textContent=continent;
    regionButton.addEventListener('click',()=>showPlace({name:continent,kind:'continent'},regionButton));
    const count=document.createElement('span');count.textContent=`${group.length} opportunities`;heading.append(regionButton,count);list.append(heading);
    for(const item of group){
      const button=document.createElement('button');button.type='button';button.className='list-item';button.id=`opportunity-${item.id}`;
      button.setAttribute('aria-pressed',String(selected===item));if(selected===item)button.classList.add('active');
      button.innerHTML=`<span class="number">${String(++number).padStart(2,'0')}</span><span><span class="item-title">${escapeHTML(item.title)}</span><span class="item-location">${escapeHTML(locationLabel(item))}</span><span class="item-platform">${escapeHTML(item.platform)}</span>${item.postedDate?`<span class="posted-date">${postingLabel(item)} ${formatDate(item.postedDate)}</span>`:''}${isSeasonClosed(item)?'<span class="listing-badge needs-review availability-badge">Closed / paused</span>':''}${item.sourceStatus==='needs_recheck'?'<span class="listing-badge needs-review">Needs recheck</span>':''}</span>`;
      button.addEventListener('click',()=>selectItem(item,true,button));list.append(button);
    }
  }
  if(!visibleItems.length){const empty=document.createElement('p');empty.className='empty-results';empty.textContent='No matching opportunities. Try another keyword or platform.';list.append(empty);}
  document.querySelector('#list-count').textContent=`${visibleItems.length} of ${items.length}`;
  const active=document.querySelector('#active-place');active.hidden=!placeFilter;active.textContent=placeFilter?.name||'';
  document.querySelector('#clear-filters').hidden=!(keyword.value||platform.value||placeFilter);
  refreshMapMarkers();
}
keyword.addEventListener('input',renderList);platform.addEventListener('change',renderList);
document.querySelector('#clear-filters').addEventListener('click',()=>{keyword.value='';platform.value='';placeFilter=null;renderList();keyword.focus();});
function clearSelection(){
  if(selected){const button=document.getElementById(`opportunity-${selected.id}`);button?.classList.remove('active');button?.setAttribute('aria-pressed','false');for(const marker of markers.get(selected.id)||[])marker.getElement()?.classList.remove('selected');}
  selected=null;
}
function openCard(html,opener){detail.innerHTML=`<div class="detail-top"></div><button class="close" type="button" aria-label="Close card">×</button><div class="detail-body">${html}</div>`;detail.hidden=false;cardOpener=opener||document.activeElement;detail.scrollTop=0;detail.querySelector('.close').addEventListener('click',()=>closeCard());detail.querySelector('#detail-title').focus({preventScroll:true});}
function selectItem(item,navigate=false,opener=null){
  if(!visibleItems.includes(item)){keyword.value='';platform.value='';placeFilter=null;renderList();}
  clearSelection();selectedPlace=null;selected=item;
  const button=document.getElementById(`opportunity-${item.id}`);button.classList.add('active');button.setAttribute('aria-pressed','true');if(!navigate)button.scrollIntoView({block:'nearest'});
  const rows=[detailRow('Location',locationLabel(item)),detailRow('Type',item.opportunityType||'Volunteering'),...(item.wildlifeCategory?[detailRow('Focus',item.wildlifeCategory)]:[]),...(item.species?.length?[detailRow('Species',item.species.join(', '))]:[]),detailRow(item.postedDateNote?.includes('metadata')?'Page date':'Posted',item.postedDate?`${formatDate(item.postedDate)}${item.postedDateNote?' · '+item.postedDateNote:''}`:'Not provided'),...(item.minimumStay?[detailRow('Stay',item.minimumStay)]:[]),...(item.fees?[detailRow('Fees',item.fees)]:[]),...(item.compensation&&item.compensation!=='None'?[detailRow('Pay / perks',[item.compensation,item.stipend].filter(Boolean).join(' · '))]:[]),...(item.accommodation?[detailRow('Includes',item.accommodation)]:[]),...(item.eligibility?[detailRow('Eligibility',item.eligibility)]:[]),...(item.languages?.length?[detailRow('Languages',item.languages.join(', '))]:[]),...(item.applicationDeadline?[detailRow(isSeasonClosed(item)?'Previous deadline':'Apply by',item.applicationDeadline)]:[]),...(item.availabilityNote?[detailRow('Availability',item.availabilityNote)]:[])].join('');
  const alternatives=(item.alternateSources||[]).map(source=>`<a class="alternate-source" href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(source.label)}</a>${source.termsNote?`<p class="detail-note">${escapeHTML(source.termsNote)}</p>`:''}`).join('');
  openCard(`<div class="eyebrow">${escapeHTML(window.continentFor(item))} · ${escapeHTML(item.platform)}</div><h2 id="detail-title" tabindex="-1">${escapeHTML(item.title)}</h2>${isSeasonClosed(item)?'<p class="availability-banner"><strong>Closed / paused</strong><br>Retained for future intake reference. Check the programme source for updates.</p>':''}${item.summary?`<p class="listing-summary">${escapeHTML(item.summary)}</p>`:''}<dl>${rows}</dl><a class="source-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener noreferrer">View ${isSeasonClosed(item)?'programme / next intake':item.platform==='Host website'?'host website':escapeHTML(item.platform)+' listing'} ↗</a>${item.postedDateSource?`<a class="alternate-source" href="${escapeHTML(item.postedDateSource)}" target="_blank" rel="noopener noreferrer">Posting date source ↗</a>`:''}${alternatives}${item.alternateTermsNote?`<p class="detail-note">${escapeHTML(item.alternateTermsNote)}</p>`:''}${window.hkTravelCard(item.country)}`,opener||button);
  if(navigate&&map){const lng=item.lng+360*Math.round((map.getCenter().lng-item.lng)/360);map.setView([item.lat,lng],7,{animate:false});const copies=markers.get(item.id)||[];const marker=copies.length?copies.reduce((best,m)=>Math.abs(m.getLatLng().lng-lng)<Math.abs(best.getLatLng().lng-lng)?m:best):null;if(marker)clusters.zoomToShowLayer(marker,()=>marker.getElement()?.classList.add('selected'));if(matchMedia('(max-width:700px)').matches)document.querySelector('.map-area').scrollIntoView({block:'start'});}
  for(const marker of markers.get(item.id)||[])marker.getElement()?.classList.add('selected');
}
function showPlace(place,opener=null){
  clearSelection();selectedPlace=place;
  const count=items.filter(item=>matchesPlace(item,place)).length;
  const links=window.platformSearchLinks(place).map(link=>`<div class="platform-row"><a class="platform-shortcut" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHTML(link.name)} <span aria-hidden="true">↗</span></span><small>${escapeHTML(link.note)}</small></a>${link.alternate?`<a class="shortcut-alternate" href="${escapeHTML(link.alternate.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.alternate.label)} ↗</a>`:''}</div>`).join('');
  openCard(`<div class="eyebrow">${place.kind==='continent'?'Continent':'Country'}</div><h2 id="detail-title" tabindex="-1">${escapeHTML(window.countryName(place.name))}</h2><p class="place-caption">Find more animal opportunities</p><div class="platform-shortcuts">${links}</div><button class="local-results" type="button">Show ${count} FaunaLink ${count===1?'listing':'listings'}</button>${place.kind==='country'?window.hkTravelCard(place.name):''}`,opener);
  detail.querySelector('.local-results').addEventListener('click',()=>{keyword.value='';platform.value='';placeFilter=place;closeCard(false);renderList();if(matchMedia('(max-width:700px)').matches)document.querySelector('aside').scrollIntoView({block:'start'});});
  for(const button of document.querySelectorAll('.continent-nav button'))button.setAttribute('aria-pressed',String(place.kind==='continent'&&button.dataset.continent===place.name));
}
function closeCard(restoreFocus=true){detail.hidden=true;clearSelection();selectedPlace=null;for(const button of document.querySelectorAll('.continent-nav button'))button.setAttribute('aria-pressed','false');if(restoreFocus&&cardOpener?.isConnected)cardOpener.focus({preventScroll:true});cardOpener=null;}
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!detail.hidden)closeCard();});
renderList();

if(typeof L!=='undefined'&&L.markerClusterGroup){
  map=L.map('map',{zoomControl:false,minZoom:0,maxZoom:9,zoomSnap:0.25,zoomDelta:0.5,worldCopyJump:true,renderer:L.svg({padding:1})});
  const worldView=()=>{map.setMinZoom(0);map.fitBounds([[-57,-160],[80,200]],{paddingTopLeft:[15,20],paddingBottomRight:[15,80],animate:false});map.setMinZoom(Math.max(0,map.getZoom()));};worldView();
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

  const land=L.layerGroup().addTo(map), grid=L.layerGroup().addTo(map);
  map.createPane('graticule');map.getPane('graticule').style.zIndex=250;map.getPane('graticule').style.pointerEvents='none';
  map.createPane('countryLabels');map.getPane('countryLabels').style.zIndex=450;map.getPane('countryLabels').style.pointerEvents='none';
  const labels=L.layerGroup().addTo(map);
  const shiftedCoordinates=(coordinates,offset)=>typeof coordinates[0]==='number'?[coordinates[0]+offset,coordinates[1]]:coordinates.map(child=>shiftedCoordinates(child,offset));
  let copyStart=null;let copyOffsets=[];
  function updateWorldCopies(){
    const bounds=map.getBounds(), first=Math.floor((bounds.getWest()+180)/360)-1, last=Math.floor((bounds.getEast()+180)/360)+1;
    const key=first+':'+last;if(copyStart===key)return false;copyStart=key;copyOffsets=[];land.clearLayers();grid.clearLayers();
    for(let world=first;world<=last;world++){
      const offset=world*360;copyOffsets.push(offset);
      L.geoJSON(countries.map(feature=>({...feature,geometry:{...feature.geometry,coordinates:shiftedCoordinates(feature.geometry.coordinates,offset)}})),{
        style:feature=>({color:'#698b83',weight:.85,fillColor:colourByName.get(feature.properties.NAME_EN),fillOpacity:1}),
        onEachFeature:(feature,layer)=>{
          const name=feature.properties.NAME_EN;
          layer.on('click',()=>showPlace({name,kind:'country'},layer.getElement()));
          layer.on('add',()=>{const element=layer.getElement();if(element){element.setAttribute('role','button');element.setAttribute('aria-label','Search animal opportunities in '+window.countryName(name));element.setAttribute('tabindex','-1');element.classList.add('country-shape');}});
        },attribution:'Map data: <a href="https://www.naturalearthdata.com/">Natural Earth</a>'
      }).addTo(land);
      for(let lng=-180;lng<180;lng+=30)L.polyline([[-70,lng+offset],[84,lng+offset]],{pane:'graticule',color:'#78b6c3',weight:.7,opacity:.35,interactive:false}).addTo(grid);
      for(let lat=-60;lat<=80;lat+=20)L.polyline([[lat,-180+offset],[lat,180+offset]],{pane:'graticule',color:'#78b6c3',weight:.7,opacity:.35,interactive:false}).addTo(grid);
    }
    return true;
  }
  const shortNames={'United States of America':'United States',"People's Republic of China":'China','Democratic Republic of the Congo':'DR Congo','Republic of the Congo':'Congo','Central African Republic':'Central African Rep.','Bosnia and Herzegovina':'Bosnia & Herzegovina'};
  const labelLocations={'Russia':[62,96],'Canada':[60,-106],'United States of America':[39,-100]};
  const ringArea=ring=>Math.abs(ring.reduce((sum,point,i)=>{const next=ring[(i+1)%ring.length];return sum+point[0]*next[1]-next[0]*point[1];},0));
  const labelData=countries.map(feature=>{const p=feature.properties,ring=ringsOf(feature).reduce((largest,ring)=>ringArea(ring)>ringArea(largest)?ring:largest,[]);return{name:p.NAME_EN,text:shortNames[p.NAME_EN]||p.NAME_EN,location:labelLocations[p.NAME_EN]||[p.LABEL_Y,p.LABEL_X],area:ringArea(ring)};}).filter(item=>item.location.every(Number.isFinite)).sort((a,b)=>b.area-a.area);
  const oceans=[['North Atlantic Ocean',29,-39],['South Atlantic Ocean',-30,-18],['North Pacific Ocean',28,-145],['South Pacific Ocean',-28,-125],['Indian Ocean',-25,79],['Arctic Ocean',80,-25]];
  function updateLabels(){
    labels.clearLayers();const occupied=[],size=map.getSize(),zoom=map.getZoom();
    for(const item of labelData){
      if(zoom<5&&item.area*Math.pow(4,zoom-2)<10)continue;
      for(const offset of copyOffsets){
        const location=[item.location[0],item.location[1]+offset],point=map.latLngToContainerPoint(location);
        if(point.x<0||point.y<0||point.x>size.x||point.y>size.y)continue;
        const fontSize=zoom<2?10:zoom<4?11:12,width=Math.min(135,Math.max(42,item.text.length*fontSize*.7)),height=item.text.length*fontSize*.7>135?30:16;
        const box={left:point.x-width/2-4,right:point.x+width/2+4,top:point.y-height/2-3,bottom:point.y+height/2+3};
        if(occupied.some(other=>box.left<other.right&&box.right>other.left&&box.top<other.bottom&&box.bottom>other.top))continue;occupied.push(box);
        L.marker(location,{pane:'countryLabels',interactive:false,keyboard:false,icon:L.divIcon({className:'country-label',html:`<span style="font-size:${fontSize}px">${escapeHTML(item.text)}</span>`,iconSize:[width,height],iconAnchor:[width/2,height/2]})}).addTo(labels);
      }
    }
    if(zoom<4&&size.x>=600)for(const[name,lat,lng]of oceans)for(const offset of copyOffsets){const point=map.latLngToContainerPoint([lat,lng+offset]);if(point.x<0||point.x>size.x)continue;L.marker([lat,lng+offset],{pane:'countryLabels',interactive:false,keyboard:false,icon:L.divIcon({className:'ocean-label',html:escapeHTML(name),iconSize:[120,36],iconAnchor:[60,18]})}).addTo(labels);}
  }
  clusters=L.markerClusterGroup({maxClusterRadius:38,spiderfyOnMaxZoom:true,showCoverageOnHover:false,zoomToBoundsOnClick:true,animate:false,iconCreateFunction:cluster=>L.divIcon({html:String(cluster.getChildCount()),className:'cluster'+(cluster.getChildCount()>9?' large':''),iconSize:[32,32]})});map.addLayer(clusters);
  refreshMapMarkers=()=>{
    clusters.clearLayers();markers.clear();
    // Only pin copies near the viewport enter the cluster tree. The saved list
    // remains unique, while pins stay usable on either side of the date line.
    const bounds=map.getBounds().pad(.1),center=map.getCenter().lng,offset=360*Math.round(center/360);
    const range=[offset-360,offset,offset+360];
    for(const item of visibleItems){const copies=[];for(const shift of range){const latlng=L.latLng(item.lat,item.lng+shift);if(!bounds.contains(latlng))continue;const marker=L.marker(latlng,{icon:L.divIcon({html:'<span class="pin-dot"></span>',className:'pin',iconSize:[28,34],iconAnchor:[14,30]}),title:`${item.title} — ${locationLabel(item)}`,alt:`${item.title} — ${locationLabel(item)}`,keyboard:true});marker.on('click',()=>selectItem(item,false,marker.getElement()));copies.push(marker);clusters.addLayer(marker);}if(copies.length)markers.set(item.id,copies);}
    if(selected)for(const marker of markers.get(selected.id)||[])marker.getElement()?.classList.add('selected');
  };
  const syncMap=()=>{updateWorldCopies();updateLabels();refreshMapMarkers();};map.on('moveend zoomend resize',syncMap);syncMap();
  L.control.zoom({position:'bottomright'}).addTo(map);
  document.querySelector('#reset').addEventListener('click',()=>{closeCard(false);worldView();});
  let previousWidth=map.getSize().x;
  new ResizeObserver(()=>{const showingWorld=map.getZoom()===map.getMinZoom();map.invalidateSize();if(previousWidth!==map.getSize().x&&showingWorld)worldView();previousWidth=map.getSize().x;}).observe(document.querySelector('#map'));
}else{document.querySelector('#map-error').hidden=false;document.querySelector('#reset').hidden=true;}
