// Settings page.
import { S, saveBags, saveAlerts, saveSettings } from '../store.js';
import { ROSE, BLUSH_MID, $, esc, toast } from '../helpers.js';
import { render } from '../main.js';

export function renderSettings(){
  const s=S.settings;
  const tog=(key,label)=>`<button type="button" role="switch" aria-checked="${!!s[key]}" aria-label="${label}" data-action="settingsTog" data-arg="${key}" class="toggle" style="background:${s[key]?ROSE:BLUSH_MID}">
    <span class="toggle-knob" style="left:${s[key]?20:2}px"></span></button>`;

  return `
  <div class="topbar">
    <div><div class="tb-title">Settings</div><div class="tb-sub">Manage your account and preferences</div></div>
    <button class="btn btn-primary" data-action="settingsSave"><i class="ti ti-check"></i> Save changes</button>
  </div>
  <div class="content">
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="card">
        <div class="section-lbl">Profile</div>
        <div class="field-grid">
          <div class="field"><label>Display name</label><input id="s-name" class="inp" value="${esc(s.name||'')}" placeholder="Your name"></div>
          <div class="field"><label>Email</label><input id="s-email" type="email" class="inp" value="${esc(s.email||'')}" placeholder="you@example.com"></div>
        </div>
        <div class="field" style="max-width:260px"><label>App name (shown in sidebar)</label>
          <input id="s-appname" class="inp" value="${esc(s.appName||'')}" placeholder="Mary Katherine"></div>
      </div>
      <div class="card">
        <div class="section-lbl">Display preferences</div>
        <div class="field-grid">
          <div class="field"><label>Currency</label><div class="sel-wrap"><select id="s-currency" class="inp">
            ${['USD','EUR','GBP','JPY'].map(c=>`<option ${s.currency===c?'selected':''}>${c}</option>`).join('')}
          </select></div></div>
          <div class="field"><label>Plan</label><div class="sel-wrap"><select id="s-plan" class="inp">
            ${['Free plan','Pro plan','Enterprise'].map(p=>`<option ${s.plan===p?'selected':''}>${p}</option>`).join('')}
          </select></div></div>
        </div>
      </div>
      <div class="card">
        <div class="section-lbl">Notifications</div>
        ${[
          {k:'notifyAlerts',l:'Price alert notifications',s:'Get notified when a bag hits your target price'},
          {k:'notifyMarket',l:'Weekly market digest',s:'Weekly summary of luxury resale market trends'},
          {k:'notifyReports',l:'Monthly portfolio report',s:'Auto-generate a portfolio report at month end'}
        ].map(({k,l,s:sub})=>`
          <div class="flex justify-between items-center mb-14">
            <div><div class="text-13 f500 c-deepest">${l}</div><div class="text-11 c-dark">${sub}</div></div>
            ${tog(k,l)}
          </div>`).join('')}
      </div>
      <div class="card" style="border-color:#F7C1C1">
        <div class="section-lbl" style="color:#A32D2D">Danger zone</div>
        <div class="text-13 c-deepest mb-12">These actions cannot be undone. Please be certain before proceeding.</div>
        <button class="btn btn-danger" data-action="settingsClear"><i class="ti ti-trash"></i> Clear all bags</button>
      </div>
    </div>
  </div>`;
}

// Reads the form into settings. Toggles call this too, so their re-render doesn't wipe unsaved typing.
export function settingsRead(){
  const v=id=>$(id)?.value;
  return{...S.settings,name:v('s-name')||S.settings.name,email:v('s-email')??S.settings.email,
    appName:v('s-appname')||S.settings.appName,currency:v('s-currency')||S.settings.currency,plan:v('s-plan')||S.settings.plan};
}
export function settingsTog(k){S.settings=settingsRead();S.settings[k]=!S.settings[k];render();}
export function settingsSave(){S.settings=settingsRead();saveSettings();toast('Settings saved');render();}
export function settingsClear(){
  if(!confirm('Clear all collection data? This cannot be undone.'))return;
  S.bags=[];S.alerts=[];saveBags();saveAlerts();toast('Collection cleared');render();
}
