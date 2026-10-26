// Wishlist page.
import { BRANDS, MATERIALS, HARDWARE, S, saveWish } from '../store.js';
import { cur, fmt, todayStr, esc, dateShort, emptyState, toast, selOpts } from '../helpers.js';
import { render } from '../main.js';

export function renderWishlist(){
  const f=S.wishForm;
  const addForm=S.wishAdding?`<div class="card mb-16">
    <div class="text-14 f500 c-deepest mb-14">Add to wishlist</div>
    <div class="field-grid">
      <div class="field"><label>Brand</label><div class="sel-wrap"><select class="inp" data-change="wishSet" data-arg="brand">
        ${selOpts(BRANDS,f.brand,'Select brand')}
      </select></div></div>
      <div class="field"><label>Model</label><input class="inp" value="${esc(f.model)}" data-input="wishSet" data-arg="model" placeholder="e.g. Kelly 28"></div>
    </div>
    <div class="field-grid">
      <div class="field"><label>Color</label><input class="inp" value="${esc(f.color)}" data-input="wishSet" data-arg="color" placeholder="e.g. Rouge Casaque"></div>
      <div class="field"><label>Max budget (${cur()})</label><input class="inp" type="number" min="0" value="${esc(f.maxBudget)}" data-input="wishSet" data-arg="maxBudget" placeholder="0"></div>
    </div>
    <div class="field-grid">
      <div class="field"><label>Material</label><div class="sel-wrap"><select class="inp" data-change="wishSet" data-arg="material">${selOpts(MATERIALS,f.material,'Any material')}</select></div></div>
      <div class="field"><label>Hardware</label><div class="sel-wrap"><select class="inp" data-change="wishSet" data-arg="hardware">${selOpts(HARDWARE,f.hardware,'Any hardware')}</select></div></div>
    </div>
    <div class="field"><label>Notes</label><textarea class="inp" rows="2" data-input="wishSet" data-arg="notes" placeholder="Preferred condition, year, any other details…">${esc(f.notes)}</textarea></div>
    <div class="flex gap-8" style="margin-top:14px">
      <button class="btn btn-primary" data-action="wishAdd"><i class="ti ti-bookmark"></i> Save to wishlist</button>
      <button class="btn btn-ghost" data-action="wishClose">Cancel</button>
    </div>
  </div>`:'';

  const grid=S.wishlist.length===0
    ?emptyState('bookmark','Wishlist is empty','Save bags you\'re dreaming of — track your budget and notes for future purchases.',`<button class="btn btn-primary" data-action="wishOpen"><i class="ti ti-plus"></i> Add a bag</button>`)
    :`<div class="wish-grid">${S.wishlist.map(w=>`
      <div class="card">
        <div class="flex justify-between items-start mb-12">
          <div style="width:44px;height:44px;border-radius:8px;background:#FBEAF0;display:flex;align-items:center;justify-content:center">
            <i class="ti ti-heart" style="font-size:20px;color:#D4537E"></i></div>
          <button class="btn btn-danger btn-sm" data-action="wishDelete" data-arg="${esc(w.id)}" aria-label="Remove from wishlist"><i class="ti ti-x"></i></button>
        </div>
        <div style="font-size:10px;font-weight:500;color:#993556;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">${esc(w.brand)}</div>
        <div style="font-size:14px;font-weight:500;color:#4B1528;margin-bottom:8px">${esc(w.model)}</div>
        ${[['Color',w.color],['Material',w.material],['Hardware',w.hardware]].filter(([,v])=>v).map(([k,v])=>`
          <div class="flex justify-between mb-6">
            <span class="text-11 c-dark">${k}</span>
            <span class="text-11 f500 c-deepest">${esc(v)}</span>
          </div>`).join('')}
        ${w.maxBudget>0?`<div style="margin-top:10px;padding:6px 10px;background:#FBEAF0;border-radius:8px;display:flex;justify-content:space-between">
          <span class="text-11 c-dark">Max budget</span>
          <span class="text-12 f500 c-deepest">${fmt(w.maxBudget)}</span></div>`:''}
        ${w.notes?`<div class="text-11 c-dark" style="margin-top:8px;line-height:1.5">${esc(w.notes)}</div>`:''}
        <div style="margin-top:10px;font-size:10px;color:#ED93B1">Added ${dateShort(w.addedAt)}</div>
      </div>`).join('')}</div>`;

  return `
  <div class="topbar">
    <div><div class="tb-title">Wishlist</div>
    <div class="tb-sub">${S.wishlist.length} bag${S.wishlist.length!==1?'s':''} saved</div></div>
    <button class="btn btn-primary" data-action="wishOpen"><i class="ti ti-plus"></i> Add to wishlist</button>
  </div>
  <div class="content">${addForm}${grid}</div>`;
}

export function wishSet(k,v){S.wishForm={...S.wishForm,[k]:v};render();}
export function wishAdd(){
  const f=S.wishForm;if(!f.brand||!f.model.trim()){toast('Pick a brand and enter a model');return;}
  S.wishlist=[...S.wishlist,{...f,id:'w'+Date.now(),maxBudget:Number(f.maxBudget)||0,addedAt:todayStr()}];
  saveWish();S.wishAdding=false;S.wishForm={brand:'',model:'',color:'',material:'',hardware:'',maxBudget:'',notes:''};
  toast('Added to wishlist');render();
}
export function wishDelete(id){S.wishlist=S.wishlist.filter(w=>w.id!==id);saveWish();toast('Removed from wishlist');render();}
export function wishOpen(){S.wishAdding=true;render();}
export function wishClose(){S.wishAdding=false;render();}
