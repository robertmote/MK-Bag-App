// Dashboard page, plus the "Refresh values with AI" button and action (also used by My collection).
import { S, saveBags } from '../store.js';
import { cur, fmt, fmtPct, todayStr, esc, dateShort, dateLong, calcPct, pctColor, totals, byGain, brandTotals, alertFiring, askClaude, deltaBadge, emptyState, toast } from '../helpers.js';
import { go, render } from '../main.js';

export function renderDashboard(){
  const bags=S.bags;
  const {v:tv,c:tc,pct:ap}=totals();
  const trig=S.alerts.filter(alertFiring);
  const lastAi=bags.map(b=>b.lastAiUpdate).filter(Boolean).sort().pop();

  const banner=trig.length?`<div class="alert-banner">
    <i class="ti ti-bell-ringing" style="font-size:16px"></i>
    <strong>${trig.length} price alert${trig.length>1?'s':''}</strong> triggered —
    <span role="button" tabindex="0" style="cursor:pointer;text-decoration:underline" data-action="go" data-arg="alerts">view alerts</span>
  </div>`:'';

  if(!bags.length) return `
    <div class="topbar"><div><div class="tb-title">Portfolio overview</div><div class="tb-sub">Get started by adding your first bag</div></div>
      <button class="btn btn-primary" data-action="go" data-arg="add-bag"><i class="ti ti-plus"></i> Add bag</button></div>
    <div class="content">${banner}${emptyState('briefcase','No bags yet','Add your first bag to start tracking your collection\'s value.',`<button class="btn btn-primary" data-action="go" data-arg="add-bag"><i class="ti ti-plus"></i> Add a bag</button>`)}</div>`;

  return `
  <div class="topbar">
    <div><div class="tb-title">Portfolio overview</div>
    <div class="tb-sub">${lastAi?'Values last refreshed with AI '+dateLong(lastAi):'Values as entered'}</div></div>
    <div class="flex gap-8">
      ${refreshBtn()}
      <button class="btn btn-primary" data-action="go" data-arg="add-bag"><i class="ti ti-plus"></i> Add bag</button>
    </div>
  </div>
  <div class="content">
    ${banner}
    ${S.aiRefreshLog.length?`
    <div class="card mb-16" style="border-color:#C0DD97;background:#F6FBF0">
      <div class="flex justify-between items-center mb-10">
        <div class="flex items-center gap-8">
          <i class="ti ti-sparkles" style="font-size:16px;color:#3B6D11"></i>
          <span class="text-13 f500" style="color:#3B6D11">AI value update complete</span>
        </div>
        <button class="btn btn-ghost btn-sm" data-action="aiLogDismiss">Dismiss</button>
      </div>
      ${S.aiRefreshLog.map(l=>`
        <div class="flex items-center gap-10 mb-6">
          <i class="ti ti-${l.ok?'circle-check':'alert-circle'}" style="font-size:14px;color:${l.ok?'#3B6D11':'#A32D2D'};flex-shrink:0"></i>
          <span class="text-12 c-deepest nowrap" style="min-width:180px">${esc(l.name)}</span>
          ${l.ok?`<span class="text-12 f500 c-deepest">${fmt(l.oldVal)} → ${fmt(l.newVal)}</span>
            <span class="badge ${l.newVal>=l.oldVal?'badge-green':'badge-red'}" style="margin-left:4px">${fmtPct(calcPct(l.newVal,l.oldVal))}</span>
            <span class="text-11 c-dark" style="margin-left:8px;flex:1">${esc(l.source||'')}</span>`
          :`<span class="text-11" style="color:#A32D2D">${esc(l.error)}</span>`}
        </div>`).join('')}
    </div>`:''}
    <div class="grid-4 mb-20">
      ${[
        {l:'Total portfolio value',v:fmt(tv),x:deltaBadge(ap)},
        {l:'Total bags tracked',v:bags.length,x:`<span class="badge badge-blush">in collection</span>`},
        {l:'Overall appreciation',v:fmtPct(ap),x:`<span class="text-11 c-dark">vs. purchase</span>`},
        {l:'Total cost basis',v:fmt(tc),x:`<span class="text-11 c-dark">purchase prices</span>`}
      ].map(s=>`<div class="stat-card"><div class="stat-lbl">${s.l}</div><div class="stat-val">${s.v}</div><div style="margin-top:6px">${s.x}</div></div>`).join('')}
    </div>
    <div class="grid-2 mb-14">
      <div class="card">
        <div class="flex justify-between items-center mb-14">
          <span class="text-13 f500 c-deepest">Top performing bags</span>
          <span role="button" tabindex="0" class="text-11 c-rose" style="cursor:pointer" data-action="go" data-arg="collection">View all →</span>
        </div>
        ${byGain().slice(0,5).map(b=>{const p=calcPct(b.currentValue,b.purchasePrice);return`
          <div class="flex items-center gap-12 mb-10">
            <div class="bag-thumb" style="width:38px;height:38px"><i class="ti ti-briefcase" style="font-size:18px;color:#993556"></i></div>
            <div class="flex-1 min-w-0">
              <div class="text-12 f500 c-deepest nowrap">${esc(b.name)}</div>
              <div class="text-11 c-dark">${esc(b.brand)} · ${esc(b.year)}</div>
            </div>
            <div style="text-align:right">
              <div class="text-12 f500 c-deepest">${fmt(b.currentValue)}</div>
              <div class="text-11" style="color:${pctColor(p)}">${fmtPct(p)}</div>
            </div>
          </div>`;}).join('')}
      </div>
      <div class="card">
        <div class="text-13 f500 c-deepest mb-14">By brand</div>
        ${brandTotals().slice(0,5).map(([br,val])=>{const p=tv>0?(val/tv)*100:0;return`
          <div class="flex items-center gap-8 text-12 mb-10">
            <span style="width:80px;color:#993556;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(br)}</span>
            <div style="flex:1;height:6px;background:#FBEAF0;border-radius:3px"><div style="width:${p.toFixed(0)}%;height:100%;background:#D4537E;border-radius:3px"></div></div>
            <span class="f500 c-deepest" style="min-width:36px;text-align:right">${p.toFixed(0)}%</span>
          </div>`;}).join('')}
        <div class="divider" style="margin:14px 0"></div>
        <div class="text-13 f500 c-deepest mb-10">Recent activity</div>
        ${bags.slice(-3).reverse().map(b=>`
          <div class="flex items-center gap-10 mb-8">
            <div style="width:8px;height:8px;border-radius:50%;background:#D4537E;flex-shrink:0"></div>
            <div><div class="text-12 c-deepest">${esc(b.name)} added to collection</div>
            <div class="text-11 c-dark">${dateShort(b.purchaseDate)}</div></div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

export const refreshBtn=()=>`<button class="btn btn-ghost" data-action="aiRefreshValues" ${S.aiRefreshing||!S.bags.length?'disabled':''}>
  <i class="ti ti-${S.aiRefreshing?'loader-2 spin':'sparkles'}"></i> ${S.aiRefreshing?'Updating values…':'Refresh values with AI'}</button>`;

// ── AI VALUE REFRESH ──────────────────────────────────────────────────────────
export async function aiRefreshValues(){
  if(!S.bags.length||S.aiRefreshing)return;
  S.aiRefreshing=true;S.aiRefreshLog=[];render();
  // The search takes a while and the user can keep editing; match results to this snapshot by id, not by current position.
  const snapshot=S.bags,startPage=S.page;

  // Build a single prompt listing all bags so we make one API call
  const bagList=snapshot.map((b,i)=>`${i+1}. ${b.brand} ${b.model}${b.color?' in '+b.color:''}${b.size?', '+b.size:''}${b.year?', '+b.year:''} (condition: ${b.condition})`).join('\n');

  try{
    const results=await askClaude(`Search the web for current ${new Date().getFullYear()} resale market values, in ${cur()}, for each of these luxury handbags. For each bag, search authenticated resale platforms (Vestiaire Collective, The RealReal, Fashionphile, 1stDibs) to find realistic current resale price ranges.

Bags to research:
${bagList}

Respond ONLY with a valid JSON array (no markdown, no backticks, no explanation) where each element matches the bag order above:
[
  {"index":1,"estimatedValue":25000,"priceRange":"$23,000–$27,000","source":"Vestiaire Collective / Fashionphile","confidence":"high"},
  ...
]

Use realistic resale market prices (not retail). If you cannot find data for a bag, use null for estimatedValue and explain briefly in source.`);

    if(!Array.isArray(results))throw new Error('Claude returned an unexpected format. Please try again.');
    // Apply updates and build log (alerts re-evaluate themselves from the new values)
    const log=[];
    results.forEach(r=>{
      const bag=snapshot[r.index-1];
      if(!bag||!S.bags.some(b=>b.id===bag.id))return; // deleted while we waited
      const est=Number(r.estimatedValue);
      if(est>0){
        const oldVal=S.bags.find(b=>b.id===bag.id).currentValue;
        const newVal=Math.round(est);
        S.bags=S.bags.map(b=>b.id===bag.id?{...b,currentValue:newVal,lastAiUpdate:todayStr()}:b);
        log.push({name:bag.name,ok:true,oldVal,newVal,source:[r.priceRange,r.source].filter(Boolean).join(' · ')});
      } else {
        log.push({name:bag.name,ok:false,error:r.source||'No data found'});
      }
    });

    saveBags();
    S.aiRefreshLog=log;
    toast(`AI updated ${log.filter(l=>l.ok).length} of ${snapshot.length} bag values`);

  }catch(e){
    console.error(e);
    toast('AI value refresh failed: '+e.message);
  }

  S.aiRefreshing=false;
  // Show the log on the dashboard, unless the user has moved on to another page meanwhile
  if(S.page===startPage)S.page='dashboard';
  render();
}
export function aiLogDismiss(){S.aiRefreshLog=[];render();}
