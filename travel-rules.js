'use strict';
// Entry permission and permission to perform a placement are separate questions.
(function(){
  const data=window.HK_TRAVEL_RULES;
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const unknown={status:'unverified',entry:'Visa rules need confirmation',stay:'Permitted stay not verified',note:'No HKSAR passport rule has been verified here. Confirm with the destination consulate.',sources:[{label:'HK Immigration — passport entry reference',url:'https://www.immd.gov.hk/eng/service/travel_document/visa_free_access.html'}],placement:{label:'Placement permission needs confirmation',note:'Ask the host and immigration authority about the exact duties. Visitor entry does not establish permission for volunteering, work exchange or an internship.',sources:[]}};
  window.hkTravelRule=(country,today=new Date().toISOString().slice(0,10))=>{
    const rule=data.countries[window.countryName(country)]||unknown;
    return rule.validUntil&&today>rule.validUntil?{...rule,...rule.expired,status:'unverified',stayLimit:null}:rule;
  };
  window.hkTravelCard=country=>{
    if(window.countryName(country)==='Hong Kong')return '<section class="travel-info" aria-label="Hong Kong placement eligibility"><h3>Hong Kong placement</h3><p>Check any local resident, student or professional requirements, training and registration with the host.</p></section>';
    const rule=window.hkTravelRule(country),work=rule.placement;
    const sources=[...rule.sources,...work.sources].filter((source,index,array)=>array.findIndex(item=>item.url===source.url)===index);
    const sourceLinks=sources.map(source=>`<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.label)} ↗</a>`).join('');
    return `<section class="travel-info" aria-label="HKSAR passport entry and placement permits"><h3>HKSAR passport <span lang="zh-Hant">香港特區護照</span></h3><div class="travel-entry"><span class="travel-status ${rule.status}">${escape(rule.status==='reference'?'Entry route needs checking':rule.status==='unverified'?'Needs confirmation':'Visitor entry')}</span><strong>${escape(rule.stay)}</strong><p class="travel-route">${escape(rule.entry)}</p><p>${escape(rule.note)}</p></div><div class="placement-info"><h4>${escape(work.label)}</h4><p>${escape(work.note)}</p></div><details class="travel-sources"><summary>Official sources & travel conditions</summary><p>Reviewed ${escape(data.reviewedOn)}. HK entry reference snapshot: ${escape(data.referenceSnapshot)}. These are visitor-entry references, not a guarantee of admission or placement permission. Confirm current rules before committing to travel; the period granted at entry controls your stay.</p>${sourceLinks}</details></section>`;
  };
})();
