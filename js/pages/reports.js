// Reports page: portfolio numbers and the AI report.
import { S } from '../store.js';
import { cur, fmt, fmtPct, esc, calcPct, pctColor, arr, totals, byGain, brandTotals, askClaude, deltaBadge } from '../helpers.js';
import { render } from '../main.js';

export function renderReports(){
  const bags=S.bags;
  const {v:tv,c:tc,pct:gainPct}=totals(),gain=tv-tc;
  const topBag=byGain()[0];
  const r=S.reportsReport;

  return `
  <div class="topbar">
    <div><div class="tb-title">Reports</div><div class="tb-sub">Portfolio analysis & AI-generated insights</div></div>
    <button class="btn btn-primary" data-action="reportsGenerate" ${S.reportsLoading||!bags.length?'disabled':''}>
      <i class="ti ti-${S.reportsLoading?'loader-2 spin':'sparkles'}"></i> ${S.reportsLoading?'Generating…':'Generate AI report'}
    </button>
  </div>
  <div class="content">
    <div class="grid-4 mb-20">
      ${[
        {l:'Portfolio value',v:fmt(tv),col:''},
        {l:'Total cost basis',v:fmt(tc),col:''},
        {l:'Total gain / loss',v:fmt(gain),col:pctColor(gain)},
        {l:'Overall appreciation',v:fmtPct(gainPct),col:pctColor(gainPct)}
      ].map(s=>`<div class="stat-card"><div class="stat-lbl">${s.l}</div><div class="stat-val" style="${s.col?'color:'+s.col:''}">${s.v}</div></div>`).join('')}
    </div>
    <div class="grid-2 mb-14">
      <div class="card">
        <div class="section-lbl">Collection breakdown</div>
        ${bags.map(b=>{const p=calcPct(b.currentValue,b.purchasePrice);return`
          <div class="flex items-center gap-10 mb-10">
            <div class="flex-1 min-w-0">
              <div class="text-12 f500 c-deepest nowrap">${esc(b.name)}</div>
              <div class="text-11 c-dark">${esc(b.brand)}</div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div class="text-12 f500 c-deepest">${fmt(b.currentValue)}</div>
              <div style="font-size:11px;color:${pctColor(p)}">${fmtPct(p)}</div>
            </div>
          </div>`;}).join('')}
      </div>
      <div class="card">
        <div class="section-lbl">By brand</div>
        ${brandTotals().map(([br,val])=>{const p=tv>0?(val/tv)*100:0;return`
          <div class="flex items-center gap-8 text-12 mb-10">
            <span style="width:90px;color:#993556;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(br)}</span>
            <div style="flex:1;height:6px;background:#FBEAF0;border-radius:3px"><div style="width:${p.toFixed(0)}%;height:100%;background:#D4537E;border-radius:3px"></div></div>
            <span class="f500 c-deepest" style="min-width:50px;text-align:right">${fmt(val)}</span>
          </div>`;}).join('')}
        ${topBag?`<div class="divider"></div>
          <div class="text-11 c-dark mb-6">Top performer</div>
          <div class="text-13 f500 c-deepest">${esc(topBag.name)}</div>
          <div style="margin-top:4px">${deltaBadge(calcPct(topBag.currentValue,topBag.purchasePrice))}</div>`:''}
      </div>
    </div>
    ${S.reportsLoading?`<div class="card flex items-center gap-12 c-dark"><i class="ti ti-loader-2 spin" style="font-size:20px"></i> Analysing your portfolio and fetching market data…</div>`:''}
    ${r?`<div class="card">
      <div class="flex items-center gap-8 mb-14">
        <i class="ti ti-sparkles" style="font-size:18px;color:#D4537E"></i>
        <span class="text-14 f500 c-deepest">AI Portfolio Analysis</span>
      </div>
      <p style="font-size:13px;color:#4B1528;line-height:1.7;margin-bottom:14px">${esc(r.executiveSummary||'')}</p>
      <div class="grid-2 mb-14">
        <div>
          <div style="font-size:11px;font-weight:500;color:#3B6D11;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Strengths</div>
          ${arr(r.strengths).map(s=>`<div class="flex gap-8 mb-6"><i class="ti ti-circle-check" style="font-size:14px;color:#3B6D11;flex-shrink:0;margin-top:1px"></i><span class="text-12 c-deepest">${esc(s)}</span></div>`).join('')}
        </div>
        <div>
          <div style="font-size:11px;font-weight:500;color:#A32D2D;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Risks</div>
          ${arr(r.risks).map(s=>`<div class="flex gap-8 mb-6"><i class="ti ti-alert-triangle" style="font-size:14px;color:#A32D2D;flex-shrink:0;margin-top:1px"></i><span class="text-12 c-deepest">${esc(s)}</span></div>`).join('')}
        </div>
      </div>
      <div class="section-lbl">Recommendations</div>
      ${arr(r.recommendations).map(s=>`<div class="flex gap-8 mb-6"><i class="ti ti-arrow-right" style="font-size:14px;color:#D4537E;flex-shrink:0;margin-top:1px"></i><span class="text-12 c-deepest">${esc(s)}</span></div>`).join('')}
      ${r.marketNote?`<div style="margin-top:12px;padding:10px 12px;background:#FBEAF0;border-radius:8px;font-size:12px;color:#72243E"><i class="ti ti-globe" style="font-size:13px;margin-right:6px"></i>${esc(r.marketNote)}</div>`:''}
    </div>`:''}
    ${!S.reportsLoading&&!r&&bags.length?`<div class="card" style="text-align:center;padding:32px">
      <i class="ti ti-sparkles" style="font-size:28px;color:#D4537E;display:block;margin-bottom:10px"></i>
      <div class="text-13 c-dark">Click "Generate AI report" to get an AI-powered analysis of your portfolio with live market context.</div>
    </div>`:''}
  </div>`;
}

export async function reportsGenerate(){
  if(!S.bags.length||S.reportsLoading)return;
  S.reportsLoading=true;render();
  try{
    const summary=S.bags.map(b=>({name:b.name,brand:b.brand,purchasePrice:b.purchasePrice,currentValue:b.currentValue,year:b.year,condition:b.condition}));
    const {v:tv,c:tc}=totals();
    S.reportsReport=await askClaude(`Generate a luxury bag portfolio analysis. All prices are in ${cur()}. Collection: ${JSON.stringify(summary)}. Total value: ${fmt(tv)}. Cost: ${fmt(tc)}. Search for current market conditions. Respond ONLY with a valid JSON object (no markdown, no backticks): { "executiveSummary":"...", "strengths":["...","...","..."], "risks":["...","..."], "recommendations":["...","...","..."], "marketNote":"..." }`);
  }catch(e){S.reportsReport={executiveSummary:'Report generation failed: '+e.message,strengths:[],risks:[],recommendations:[],marketNote:''};}
  S.reportsLoading=false;render();
}
