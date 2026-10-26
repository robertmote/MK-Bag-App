// Add a bag / Edit bag form.
import { BRANDS, MATERIALS, HARDWARE, RETAILERS, CONDITIONS, ALL_TAGS, S, saveBags } from '../store.js';
import { cur, fmt, todayStr, esc, calcPct, deltaBadge, toast, selOpts } from '../helpers.js';
import { go, render } from '../main.js';

export function renderAddBag(){
  const f=S.addForm||{};
  const isEdit=!!S.editBag;
  const previewPct=f.purchasePrice&&f.currentValue?calcPct(Number(f.currentValue),Number(f.purchasePrice)):null;

  return `
  <div class="topbar">
    <div class="flex items-center gap-14">
      <div style="width:38px;height:38px;background:#D4537E;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="ti ti-briefcase" style="color:#FBEAF0;font-size:18px"></i></div>
      <div>
        <div style="font-size:15px;font-weight:500;color:#4B1528">${isEdit?'Edit bag':'Add a bag to collection'}</div>
        <div class="text-12 c-dark">Fill in the details to ${isEdit?'update':'start'} tracking value</div>
      </div>
    </div>
    <button class="btn btn-ghost" data-action="addCancel"><i class="ti ti-arrow-left" style="font-size:13px"></i> Back</button>
  </div>
  <div id="add-layout">
    <div class="add-form">
      <div class="section-lbl">Bag identity</div>
      <div class="field-grid">
        <div class="field"><label>Brand</label><div class="sel-wrap"><select class="inp" data-change="addSet" data-arg="brand">${selOpts(BRANDS,f.brand||'','Select brand')}</select></div></div>
        <div class="field"><label>Model name</label><input class="inp" value="${esc(f.model||'')}" data-input="addSet" data-arg="model" placeholder="e.g. Birkin 25"></div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Display name (optional)</label><input class="inp" value="${esc(f.name||'')}" data-input="addSet" data-arg="name" placeholder="Auto-generated if blank"></div>
        <div class="field"><label>Color</label><input class="inp" value="${esc(f.color||'')}" data-input="addSet" data-arg="color" placeholder="e.g. Noir, Rose Sakura"></div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Material</label><div class="sel-wrap"><select class="inp" data-change="addSet" data-arg="material">${selOpts(MATERIALS,f.material||'','Select material')}</select></div></div>
        <div class="field"><label>Size</label><input class="inp" value="${esc(f.size||'')}" data-input="addSet" data-arg="size" placeholder="e.g. 25cm, Small"></div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Hardware</label><div class="sel-wrap"><select class="inp" data-change="addSet" data-arg="hardware">${selOpts(HARDWARE,f.hardware||'','Select hardware')}</select></div></div>
        <div class="field"><label>Production year</label><input class="inp" inputmode="numeric" value="${esc(f.year||'')}" data-input="addSet" data-arg="year" placeholder="e.g. 2022"></div>
      </div>
      <div class="divider"></div>
      <div class="section-lbl">Purchase details</div>
      <div class="field-grid">
        <div class="field"><label>Purchase price (${cur()})</label><input class="inp" type="number" value="${esc(f.purchasePrice||'')}" data-input="addSet" data-arg="purchasePrice" placeholder="0"></div>
        <div class="field"><label>Purchase date</label><input class="inp" type="date" value="${esc(f.purchaseDate||todayStr())}" data-input="addSet" data-arg="purchaseDate"></div>
      </div>
      <div class="field-grid">
        <div class="field"><label>Purchased from</label><div class="sel-wrap"><select class="inp" data-change="addSet" data-arg="retailer">${selOpts(RETAILERS,f.retailer||'','Select retailer')}</select></div></div>
        <div class="field"><label>Current market value (${cur()})</label><input class="inp" type="number" value="${esc(f.currentValue||'')}" data-input="addSet" data-arg="currentValue" placeholder="Leave blank to use purchase price"></div>
      </div>
      <div class="divider"></div>
      <div class="section-lbl">Condition</div>
      <div class="flex gap-8 mb-16">
        ${CONDITIONS.map(c=>`<button class="cond-btn ${(f.condition||'Excellent')===c?'active':''}" aria-pressed="${(f.condition||'Excellent')===c}" data-action="addSetCond" data-arg="${esc(c)}">${esc(c)}</button>`).join('')}
      </div>
      <div class="divider"></div>
      <div class="section-lbl">Tags</div>
      <div class="flex gap-6 mb-16" style="flex-wrap:wrap">
        ${ALL_TAGS.map(t=>`<button class="tag-pill ${(f.tags||[]).includes(t)?'on':''}" aria-pressed="${(f.tags||[]).includes(t)}" data-action="addToggleTag" data-arg="${esc(t)}">${esc(t)}</button>`).join('')}
      </div>
      <div class="divider"></div>
      <div class="field"><label>Notes</label>
        <textarea class="inp" rows="3" data-input="addSet" data-arg="notes" placeholder="Serial number, authenticity card, provenance, special story…">${esc(f.notes||'')}</textarea>
      </div>
    </div>
    <div class="add-preview">
      <div class="section-lbl">Live preview</div>
      <div class="preview-card">
        <div class="preview-img"><i class="ti ti-briefcase" style="font-size:32px;color:#993556"></i></div>
        <div class="preview-info">
          <div style="font-size:10px;font-weight:500;color:#993556;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">${esc(f.brand||'Brand')}</div>
          <div style="font-size:13px;font-weight:500;color:#4B1528;margin-bottom:8px">${esc(f.name||f.model||'Model name')}</div>
          ${[['Color',f.color],['Material',f.material],['Hardware',f.hardware],['Size',f.size],['Year',f.year]].map(([k,v])=>`
            <div class="flex justify-between" style="margin-bottom:3px">
              <span class="text-11 c-dark">${k}</span>
              <span class="text-11 f500 c-deepest">${esc(v)||'—'}</span>
            </div>`).join('')}
          <span class="badge badge-pink" style="margin-top:8px">${esc(f.condition||'Excellent')}</span>
        </div>
      </div>
      <div style="background:#fff;border:.5px solid #F4C0D1;border-radius:8px;padding:12px;margin-bottom:12px">
        <div class="text-11 c-dark mb-6">Purchase price</div>
        <div style="font-size:18px;font-weight:500;color:#4B1528">${f.purchasePrice?fmt(Number(f.purchasePrice)):'—'}</div>
        ${previewPct!==null?deltaBadge(previewPct):''}
      </div>
      <div class="text-11 c-dark" style="line-height:1.6">
        <i class="ti ti-info-circle" style="font-size:13px;vertical-align:-2px;margin-right:4px"></i>
        Update market values any time with "Refresh values with AI" or the pencil next to a bag's value.
      </div>
    </div>
  </div>
  <div class="add-footer">
    <span class="text-11 c-dark"><i class="ti ti-circle-check" style="font-size:13px;vertical-align:-2px;color:#D4537E;margin-right:4px"></i>${isEdit?'Editing existing bag':'New bag'}</span>
    <div class="flex gap-8">
      <button class="btn btn-ghost" data-action="addCancel">Cancel</button>
      <button class="btn btn-primary" data-action="addSave"><i class="ti ti-check"></i> ${isEdit?'Save changes':'Add to collection'}</button>
    </div>
  </div>`;
}

export function addSet(k,v){S.addForm={...S.addForm,[k]:v};render();}
export function addSetCond(c){S.addForm={...S.addForm,condition:c};render();}
export function addToggleTag(t){const tags=S.addForm.tags||[];S.addForm={...S.addForm,tags:tags.includes(t)?tags.filter(x=>x!==t):[...tags,t]};render();}
export function addCancel(){S.editBag=null;S.addForm=null;go('collection');}
export function addSave(){
  const f=S.addForm;
  if(!f.brand||!f.model?.trim()||f.purchasePrice===''){alert('Please fill in brand, model, and purchase price.');return;}
  const price=Number(String(f.purchasePrice).replace(/[^0-9.]/g,''));
  const curVal=f.currentValue!==''?Number(String(f.currentValue).replace(/[^0-9.]/g,'')):price;
  if(isNaN(price)||isNaN(curVal)){alert('Prices must be numbers.');return;}
  const isEdit=!!S.editBag;
  const bag={...f,purchasePrice:price,currentValue:curVal,id:S.editBag?.id||'b'+Date.now(),name:f.name||(f.brand+' '+f.model)};
  if(isEdit){S.bags=S.bags.map(b=>b.id===bag.id?bag:b);}
  else{S.bags=[...S.bags,bag];}
  S.colSelected=bag.id;
  saveBags();S.editBag=null;S.addForm=null;
  toast(isEdit?'Bag updated':'Bag added to collection');
  go('collection');
}
