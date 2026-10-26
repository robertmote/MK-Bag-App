// Price alerts page.
import { S, saveAlerts } from '../store.js';
import { ROSE, BLUSH, BLUSH_MID, GREEN, GREEN_BG, GREEN_MID, cur, fmt, todayStr, esc, alertFiring, emptyState, toast } from '../helpers.js';
import { render } from '../main.js';

export function renderAlerts(){
  const bags=S.bags;
  const enriched=S.alerts.map(a=>{
    const bag=bags.find(b=>b.id===a.bagId);
    return bag&&{...a,bag,triggered:alertFiring(a)};
  }).filter(Boolean);
  const f=S.alertForm;

  const addForm=S.alertAdding?`<div class="card mb-16">
    <div class="text-14 f500 c-deepest mb-14">Create price alert</div>
    <div class="field-grid-3">
      <div class="field"><label>Bag</label><div class="sel-wrap"><select class="inp" data-change="alertSet" data-arg="bagId">
        <option value="">Select bag</option>
        ${bags.map(b=>`<option value="${esc(b.id)}" ${f.bagId===b.id?'selected':''}>${esc(b.name)}</option>`).join('')}
      </select></div></div>
      <div class="field"><label>Alert when value is</label><div class="sel-wrap"><select class="inp" data-change="alertSet" data-arg="type">
        <option value="above" ${f.type==='above'?'selected':''}>Above target</option>
        <option value="below" ${f.type==='below'?'selected':''}>Below target</option>
      </select></div></div>
      <div class="field"><label>Target price (${cur()})</label><input class="inp" type="number" min="0" value="${esc(f.targetPrice)}" data-input="alertSet" data-arg="targetPrice" placeholder="e.g. 30000"></div>
    </div>
    ${f.bagId?`<div class="text-12 c-dark mb-14">Current value: ${fmt(bags.find(b=>b.id===f.bagId)?.currentValue||0)}</div>`:''}
    <div class="flex gap-8">
      <button class="btn btn-primary" data-action="alertAdd"><i class="ti ti-bell"></i> Create alert</button>
      <button class="btn btn-ghost" data-action="alertClose">Cancel</button>
    </div>
  </div>`:'';

  const list=enriched.length===0
    ?emptyState('bell','No alerts yet','Set a price target for any bag to get notified when the value crosses your threshold.',`<button class="btn btn-primary" data-action="alertOpen"><i class="ti ti-plus"></i> Create alert</button>`)
    :enriched.map(a=>`
      <div class="card flex items-center gap-14 mb-10" style="border-color:${a.triggered?GREEN_MID:BLUSH_MID};background:${a.triggered?GREEN_BG:'#fff'}">
        <div style="width:40px;height:40px;border-radius:8px;background:${a.triggered?GREEN_MID:BLUSH};display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <i class="ti ti-bell${a.triggered?'-ringing':''}" style="font-size:20px;color:${a.triggered?GREEN:ROSE}"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-13 f500 c-deepest">${esc(a.bag.name)}</div>
          <div class="text-12 c-dark" style="margin-top:2px">Alert when value is <strong>${a.type}</strong> ${fmt(a.targetPrice)} · Current: ${fmt(a.bag.currentValue)}</div>
        </div>
        ${a.triggered?`<span class="badge badge-green-mid"><i class="ti ti-circle-check" style="font-size:10px;margin-right:4px"></i>Triggered</span>`:''}
        <div class="flex gap-6 flex-shrink-0">
          ${a.triggered?`<button class="btn btn-ghost btn-sm" data-action="alertDismiss" data-arg="${esc(a.id)}">Dismiss</button>`:''}
          <button class="btn btn-danger btn-sm" data-action="alertDelete" data-arg="${esc(a.id)}" aria-label="Delete alert"><i class="ti ti-trash"></i></button>
        </div>
      </div>`).join('');

  return `
  <div class="topbar">
    <div><div class="tb-title">Price alerts</div>
    <div class="tb-sub">${enriched.filter(a=>a.triggered).length} triggered · ${enriched.length} total</div></div>
    <button class="btn btn-primary" data-action="alertOpen"><i class="ti ti-plus"></i> New alert</button>
  </div>
  <div class="content">${addForm}${list}</div>`;
}

export function alertSet(k,v){S.alertForm={...S.alertForm,[k]:v};render();}
export function alertAdd(){
  const f=S.alertForm,target=Number(f.targetPrice);
  if(!f.bagId||f.targetPrice===''||!(target>=0)){toast('Pick a bag and a target price');return;}
  S.alerts=[...S.alerts,{...f,id:'a'+Date.now(),targetPrice:target,createdAt:todayStr()}];
  saveAlerts();S.alertAdding=false;S.alertForm={bagId:'',type:'above',targetPrice:''};
  toast('Price alert created');render();
}
export function alertDismiss(id){S.alerts=S.alerts.map(a=>a.id===id?{...a,dismissedValue:S.bags.find(b=>b.id===a.bagId)?.currentValue}:a);saveAlerts();render();}
export function alertDelete(id){S.alerts=S.alerts.filter(a=>a.id!==id);saveAlerts();toast('Alert removed');render();}
export function alertOpen(){S.alertAdding=true;render();}
export function alertClose(){S.alertAdding=false;render();}
