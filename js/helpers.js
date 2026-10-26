// Shared helpers: formatting, calculations, small UI pieces, toast, and askClaude().
import { S } from './store.js';

export const ROSE='#D4537E',ROSE_DARK='#993556',ROSE_DARKEST='#72243E',ROSE_DEEPEST='#4B1528';
export const BLUSH='#FBEAF0',BLUSH_MID='#F4C0D1',BLUSH_BRIGHT='#ED93B1';
export const GREEN='#3B6D11',GREEN_BG='#EAF3DE',GREEN_MID='#C0DD97';
export const RED='#A32D2D',RED_BG='#FCEBEB';
export const AMBER='#633806',AMBER_BG='#FAC775';
// ── Helpers ────────────────────────────────────────────────────────────────────
export const $=id=>document.getElementById(id);
export const cur=()=>S.settings.currency||'USD';
export const fmt=n=>Number(n).toLocaleString('en-US',{style:'currency',currency:cur(),minimumFractionDigits:0,maximumFractionDigits:0});
export const fmtPct=n=>(n>=0?'+':'')+n.toFixed(1)+'%';
export const todayStr=()=>new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD (toISOString is UTC, i.e. tomorrow on US evenings)
export const esc=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
export const fmtDate=(d,month)=>{const t=new Date(d+'T12:00:00');return d&&!isNaN(t)?t.toLocaleDateString('en-US',{month,day:'numeric',year:'numeric'}):'—';};
export const dateShort=d=>fmtDate(d,'short');
export const dateLong=d=>fmtDate(d,'long');
export const calcPct=(cur,cost)=>cost>0?((cur-cost)/cost)*100:0;
export const pctColor=p=>p>=0?GREEN:RED;
export const arr=x=>Array.isArray(x)?x:[]; // AI replies are untrusted JSON; lists may be missing or the wrong type
export const totals=()=>{const v=S.bags.reduce((a,b)=>a+(b.currentValue||0),0),c=S.bags.reduce((a,b)=>a+(b.purchasePrice||0),0);return{v,c,pct:calcPct(v,c)};};
export const byGain=()=>[...S.bags].sort((a,b)=>calcPct(b.currentValue,b.purchasePrice)-calcPct(a.currentValue,a.purchasePrice));
export const brandTotals=()=>Object.entries(S.bags.reduce((a,b)=>{a[b.brand]=(a[b.brand]||0)+(b.currentValue||0);return a;},{})).sort((a,b)=>b[1]-a[1]);
// An alert fires while its bag's value is past the target. Dismiss silences it until the value changes again.
export function alertFiring(a){
  const b=S.bags.find(x=>x.id===a.bagId);
  return !!b&&(a.type==='above'?b.currentValue>=a.targetPrice:b.currentValue<=a.targetPrice)&&b.currentValue!==a.dismissedValue;
}
// Calls Claude (with web search) through server.mjs, which holds the API key. Returns the JSON in Claude's reply.
export async function askClaude(prompt){
  // Hosted copies (e.g. GitHub Pages) have no server.mjs, so there is nothing to call.
  if(!['localhost','127.0.0.1'].includes(location.hostname))throw new Error('AI features only work when the app is running on your computer with "npm start".');
  let res;
  try{res=await fetch('/api/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});}
  catch{throw new Error('Cannot reach the app server. Run "npm start" and open http://localhost:3000');}
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||'Request failed ('+res.status+')');
  const t=data.text||'',i=t.search(/[\[{]/),j=Math.max(t.lastIndexOf('}'),t.lastIndexOf(']'));
  if(i<0||j<i)throw new Error('Claude did not return any data. Please try again.');
  return JSON.parse(t.slice(i,j+1));
}

export function deltaBadge(p){
  return p>=0
    ?`<span class="badge badge-green"><i class="ti ti-trending-up" style="font-size:10px;margin-right:3px"></i>${fmtPct(p)}</span>`
    :`<span class="badge badge-red"><i class="ti ti-trending-down" style="font-size:10px;margin-right:3px"></i>${fmtPct(p)}</span>`;
}

export function emptyState(icon,title,sub,btn=''){
  return `<div class="empty-wrap">
    <div class="empty-icon"><i class="ti ti-${icon}" style="font-size:26px;color:#D4537E"></i></div>
    <div class="text-14 f500 c-deepest mb-6">${esc(title)}</div>
    <div class="text-13 c-dark mb-16" style="max-width:260px">${esc(sub)}</div>
    ${btn}
  </div>`;
}

export let toastTid;
export function toast(msg){
  const t=$('toast');
  t.style.display='flex';
  $('toast-msg').textContent=msg; // set after showing, so screen readers announce the change
  clearTimeout(toastTid);
  toastTid=setTimeout(()=>t.style.display='none',3000);
}

export function selOpts(arr,val,ph){
  return `<option value="">${ph}</option>`+arr.map(v=>`<option ${v===val?'selected':''}>${esc(v)}</option>`).join('');
}
