// Market trends page (AI web search).
import { S } from '../store.js';
import { ROSE, ROSE_DARK, ROSE_DEEPEST, GREEN, RED, cur, esc, arr, askClaude, emptyState } from '../helpers.js';
import { render } from '../main.js';

export const QUICK_Q=['Hermès Birkin resale value','Chanel Classic Flap price trend','Louis Vuitton resale market','Luxury bag investment returns'];

export function renderTrends(){
  const r=S.trendsResults;
  return `
  <div class="topbar">
    <div><div class="tb-title">Market trends</div>
    <div class="tb-sub">Live luxury resale data powered by web search</div></div>
  </div>
  <div class="content">
    <div class="card mb-16">
      <div class="section-lbl">Search market data</div>
      <div class="flex gap-10 mb-12">
        <input id="trends-q" class="inp" value="${esc(S.trendsQuery)}" data-input="trendsSetQuery" data-enter="trendsSearch" style="flex:1" aria-label="Market search" placeholder="e.g. Hermès Birkin resale, Chanel price trend…">
        <button class="btn btn-primary" data-action="trendsSearch" ${S.trendsLoading?'disabled':''}>
          <i class="ti ti-${S.trendsLoading?'loader-2 spin':'search'}"></i> ${S.trendsLoading?'Searching…':'Search'}
        </button>
      </div>
      <div class="flex gap-6" style="flex-wrap:wrap">
        ${QUICK_Q.map(q=>`<button class="tag-pill" data-action="trendsQuick" data-arg="${esc(q)}">${esc(q)}</button>`).join('')}
      </div>
    </div>
    ${S.trendsLoading?`<div class="card flex items-center gap-12 c-dark"><i class="ti ti-loader-2 spin" style="font-size:20px"></i> Searching live resale market data…</div>`:''}
    ${S.trendsError?`<div class="card" style="color:#A32D2D"><i class="ti ti-alert-circle" style="font-size:16px;margin-right:8px"></i>${esc(S.trendsError)}</div>`:''}
    ${r?`
      <div class="grid-3 mb-14">
        ${[
          {l:'Price range',v:r.priceRange,ic:'currency-dollar',col:''},
          {l:'Price trend',v:r.trend,ic:'trending-up',col:String(r.trend??'').startsWith('-')?RED:GREEN},
          {l:'Market outlook',v:r.outlook,ic:'chart-bar',col:r.outlook==='bullish'?GREEN:r.outlook==='bearish'?RED:ROSE_DARK}
        ].map(s=>`<div class="stat-card">
          <div class="stat-lbl">${s.l}</div>
          <div class="flex items-center gap-8" style="margin-top:4px">
            <i class="ti ti-${s.ic}" style="font-size:20px;color:${s.col||ROSE}"></i>
            <span style="font-size:16px;font-weight:500;color:${s.col||ROSE_DEEPEST}">${esc(s.v||'—')}</span>
          </div></div>`).join('')}
      </div>
      <div class="card mb-14">
        <div class="section-lbl">Market summary</div>
        <p style="font-size:13px;color:#4B1528;line-height:1.7;margin-bottom:14px">${esc(r.summary||'')}</p>
        <div class="section-lbl">Key factors</div>
        ${arr(r.keyFactors).map(f=>`<div class="flex gap-10 items-start mb-8">
          <div style="width:6px;height:6px;border-radius:50%;background:#D4537E;flex-shrink:0;margin-top:5px"></div>
          <span class="text-13 c-deepest">${esc(f)}</span></div>`).join('')}
      </div>
      ${arr(r.sources).length?`<div class="card"><div class="section-lbl">Sources</div>
        ${arr(r.sources).map(s=>`<div class="text-12 c-dark mb-6"><i class="ti ti-link" style="font-size:12px;margin-right:6px"></i>${esc(s)}</div>`).join('')}
      </div>`:''}
    `:''}
    ${!S.trendsLoading&&!r&&!S.trendsError?emptyState('chart-line','Search for market data','Enter a bag model or brand above to get live resale price trends, market outlook, and key value drivers.'):''}
  </div>`;
}

export async function trendsSearch(){
  const q=S.trendsQuery.trim();if(!q||S.trendsLoading)return; // Enter in the box bypasses the disabled button
  S.trendsLoading=true;S.trendsError=null;S.trendsResults=null;render();
  try{
    S.trendsResults=await askClaude(`Search for current luxury handbag resale market data about: "${q}". Provide a concise market summary. Give prices in ${cur()}. Respond ONLY with a valid JSON object (no markdown, no backticks) with keys: summary (2-3 sentences), priceRange (string), trend (string like "+12% YoY"), outlook ("bullish"|"bearish"|"stable"), keyFactors (array of strings max 4), sources (array of strings).`);
  }catch(e){S.trendsError=e.message;}
  S.trendsLoading=false;render();
}
export function trendsQuick(q){S.trendsQuery=q;trendsSearch();}
export function trendsSetQuery(v){S.trendsQuery=v;} // no render: the Search button reads it
