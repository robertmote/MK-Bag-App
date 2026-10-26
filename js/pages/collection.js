// My collection page: bag list, search and brand filter, bag details, quick value edit.
import { S, saveBags, saveAlerts } from '../store.js';
import { $, fmt, fmtPct, esc, dateShort, dateLong, calcPct, pctColor, deltaBadge, emptyState, toast } from '../helpers.js';
import { go, render } from '../main.js';
import { refreshBtn } from './dashboard.js';

export function renderCollection(){
  const bags=S.bags;
  const brands=['All',...new Set(bags.map(b=>b.brand))];
  if(!brands.includes(S.colBrandFilter)) S.colBrandFilter='All'; // the filtered brand's last bag was deleted
  const q=S.colSearch.toLowerCase();
  const fil=bags.filter(b=>(S.colBrandFilter==='All'||b.brand===S.colBrandFilter)&&
    [b.name,b.brand,b.model,b.color].join(' ').toLowerCase().includes(q));
  if(!S.colSelected&&fil.length) S.colSelected=fil[0].id;
  const bag=bags.find(b=>b.id===S.colSelected);

  let detail='';
  if(!bag){
    detail=emptyState('briefcase','Select a bag','Choose a bag from the list to see its full details.');
  } else {
    const p=calcPct(bag.currentValue,bag.purchasePrice);
    const gain=bag.currentValue-bag.purchasePrice;
    detail=`
      <div class="flex justify-between items-center mb-18" style="flex-wrap:wrap;gap:10px">
        <div class="flex items-center gap-14">
          <div style="width:64px;height:64px;border-radius:10px;background:#F4C0D1;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="ti ti-briefcase" style="font-size:28px;color:#993556"></i></div>
          <div>
            <div class="text-17 f500 c-deepest">${esc(bag.name)}</div>
            <div class="text-12 c-dark" style="margin-top:2px">${esc(bag.brand)} · ${esc(bag.year)}</div>
            <div class="flex gap-6" style="margin-top:6px;flex-wrap:wrap">
              <span class="badge badge-pink">${esc(bag.condition)}</span>
              ${(bag.tags||[]).includes('With receipt')?'<span class="badge badge-green">With receipt</span>':''}
              ${(bag.tags||[]).includes('Investment piece')?'<span class="badge badge-amber">Investment piece</span>':''}
              ${(bag.tags||[]).includes('Limited edition')?'<span class="badge" style="background:#FBEAF0;color:#D4537E">Limited edition</span>':''}
            </div>
          </div>
        </div>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm" data-action="colEditBag" data-arg="${esc(bag.id)}"><i class="ti ti-edit"></i> Edit</button>
          <button class="btn btn-danger btn-sm" data-action="colDeleteBag" data-arg="${esc(bag.id)}" aria-label="Delete bag"><i class="ti ti-trash"></i></button>
        </div>
      </div>

      <div class="grid-3 mb-18">
        <div class="card">
          <div class="text-11 c-dark f500" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Purchase price</div>
          <div style="font-size:18px;font-weight:500;color:#4B1528">${fmt(bag.purchasePrice)}</div>
          <div class="text-11 c-dark" style="margin-top:4px">${dateShort(bag.purchaseDate)}</div>
        </div>
        <div class="card">
          <div class="text-11 c-dark f500" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Current market value</div>
          <div id="col-val-display" style="font-size:18px;font-weight:500;color:#4B1528">
            ${fmt(bag.currentValue)}
            <i class="ti ti-pencil" role="button" tabindex="0" aria-label="Update value" style="font-size:11px;color:#993556;cursor:pointer;margin-left:4px" data-action="colStartEdit" title="Update value"></i>
          </div>
          <div id="col-val-edit" style="display:none;margin-top:6px">
            <div class="flex gap-6">
              <input id="col-new-val" type="number" min="0" value="${bag.currentValue}" class="inp" style="width:110px" aria-label="New market value" data-enter="colSaveVal" data-arg="${esc(bag.id)}">
              <button class="btn btn-primary btn-sm" data-action="colSaveVal" data-arg="${esc(bag.id)}">Save</button>
              <button class="btn btn-ghost btn-sm" data-action="colCancelEdit" aria-label="Cancel">✕</button>
            </div>
          </div>
          <div style="margin-top:4px">${deltaBadge(p)}</div>
          ${bag.lastAiUpdate?`<div class="text-11 c-dark" style="margin-top:3px"><i class="ti ti-sparkles" style="font-size:10px;margin-right:3px;color:#D4537E"></i>AI updated ${dateShort(bag.lastAiUpdate)}</div>`:''}
        </div>
        <div class="card">
          <div class="text-11 c-dark f500" style="text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Gain / Loss</div>
          <div style="font-size:18px;font-weight:500;color:#4B1528">${fmt(gain)}</div>
          <div style="margin-top:4px;font-size:11px;color:${pctColor(p)}">${fmtPct(p)} vs. cost</div>
        </div>
      </div>

      <div class="card mb-12">
        <div class="section-lbl">Bag identity</div>
        <div class="field-grid" style="margin-bottom:0">
          ${[['Brand',bag.brand],['Model',bag.model],['Color',bag.color],['Material',bag.material],['Size',bag.size],['Hardware',bag.hardware],['Production year',bag.year],['Condition',bag.condition]]
            .map(([k,v])=>`<div><div class="text-11 c-dark">${k}</div><div class="text-12 f500 c-deepest">${esc(v)||'—'}</div></div>`).join('')}
        </div>
      </div>

      <div class="card mb-12">
        <div class="section-lbl">Purchase details</div>
        <div class="field-grid" style="margin-bottom:0">
          ${[['Purchase price',fmt(bag.purchasePrice)],['Purchase date',dateLong(bag.purchaseDate)],['Purchased from',bag.retailer]]
            .map(([k,v])=>`<div><div class="text-11 c-dark">${k}</div><div class="text-12 f500 c-deepest">${esc(v)||'—'}</div></div>`).join('')}
        </div>
      </div>

      ${(bag.tags||[]).length?`<div class="card mb-12">
        <div class="section-lbl">Tags</div>
        <div class="flex gap-6" style="flex-wrap:wrap">${bag.tags.map(t=>`<span class="tag-pill on">${esc(t)}</span>`).join('')}</div>
      </div>`:''}

      ${bag.notes?`<div class="card">
        <div class="section-lbl">Notes</div>
        <div style="background:#FBEAF0;border-radius:8px;padding:10px 12px;font-size:12px;color:#72243E;line-height:1.7">${esc(bag.notes)}</div>
      </div>`:''}`;
  }

  return `
  <div class="topbar">
    <div><div class="tb-title">My collection</div>
    <div class="tb-sub">${bags.length} bag${bags.length!==1?'s':''} tracked</div></div>
    <div class="flex gap-8">
      ${refreshBtn()}
      <button class="btn btn-primary" data-action="go" data-arg="add-bag"><i class="ti ti-plus"></i> Add bag</button>
    </div>
  </div>
  <div id="col-layout">
    <div class="col-list-panel">
      <div style="padding:14px 14px 10px;border-bottom:.5px solid #F4C0D1">
        <div class="search-box">
          <i class="ti ti-search" style="font-size:15px;color:#993556"></i>
          <input type="search" aria-label="Search bags" value="${esc(S.colSearch)}" data-input="colSearch" placeholder="Search bags…">
        </div>
        <div class="flex gap-6" style="flex-wrap:wrap">
          ${brands.map(br=>`<button class="chip ${S.colBrandFilter===br?'active':''}" data-action="colFilter" data-arg="${esc(br)}">${esc(br)}</button>`).join('')}
        </div>
      </div>
      <div class="col-list-scroll">
        ${fil.length===0?`<div style="padding:20px;text-align:center;font-size:12px;color:#993556">No bags match.</div>`:
          fil.map(b=>{const p=calcPct(b.currentValue,b.purchasePrice);return`
            <div class="bag-item ${b.id===S.colSelected?'active':''}" role="button" tabindex="0" aria-current="${b.id===S.colSelected}" data-action="colSelect" data-arg="${esc(b.id)}">
              <div class="bag-thumb"><i class="ti ti-briefcase" style="font-size:20px;color:#993556"></i></div>
              <div class="flex-1 min-w-0">
                <div class="text-12 f500 c-deepest nowrap">${esc(b.name)}</div>
                <div class="text-11 c-dark">${esc(b.brand)} · ${esc(b.year)}</div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div class="text-12 f500 c-deepest">${fmt(b.currentValue)}</div>
                <div style="font-size:10px;color:${pctColor(p)}">${fmtPct(p)}</div>
              </div>
            </div>`;}).join('')}
      </div>
    </div>
    <div class="col-detail-panel">${detail}</div>
  </div>`;
}

export function colSelect(id){S.colSelected=id;render();}
export function colSearch(v){S.colSearch=v;render();}
export function colFilter(v){S.colBrandFilter=v;render();}
export function colDeleteBag(id){
  if(!confirm('Remove this bag from your collection?'))return;
  S.bags=S.bags.filter(b=>b.id!==id);
  S.alerts=S.alerts.filter(a=>a.bagId!==id); // its alerts can never fire again
  if(S.colSelected===id)S.colSelected=S.bags[0]?.id||null;
  saveBags();saveAlerts();toast('Bag removed');render();
}
export function colEditBag(id){const b=S.bags.find(b=>b.id===id);S.editBag=b;S.addForm={...b,purchasePrice:String(b.purchasePrice),currentValue:String(b.currentValue)};S.page='add-bag';render();}
export function colStartEdit(){$('col-val-display').style.display='none';$('col-val-edit').style.display='block';$('col-new-val').focus();}
export function colCancelEdit(){$('col-val-edit').style.display='none';$('col-val-display').style.display='block';}
export function colSaveVal(id){
  const raw=$('col-new-val').value,v=Number(raw);
  if(raw===''||!(v>=0)){toast('Enter a value of 0 or more');return;} // Number('') is 0 and Number('-') is NaN
  S.bags=S.bags.map(b=>b.id===id?{...b,currentValue:v}:b);saveBags();toast('Value updated');render();
}

// ── ADD BAG ────────────────────────────────────────────────────────────────────
