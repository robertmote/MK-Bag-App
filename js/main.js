// Entry point: page switching, rendering, and the one set of event listeners every page uses.
import { S, loadAll } from './store.js';
import { $, todayStr } from './helpers.js';
import * as dashboard from './pages/dashboard.js';
import * as collection from './pages/collection.js';
import * as addBag from './pages/add-bag.js';
import * as trends from './pages/trends.js';
import * as reports from './pages/reports.js';
import * as alerts from './pages/alerts.js';
import * as wishlist from './pages/wishlist.js';
import * as settings from './pages/settings.js';

const PAGES={
  dashboard:dashboard.renderDashboard,
  collection:collection.renderCollection,
  'add-bag':addBag.renderAddBag,
  trends:trends.renderTrends,
  reports:reports.renderReports,
  alerts:alerts.renderAlerts,
  wishlist:wishlist.renderWishlist,
  settings:settings.renderSettings
};
// Anything a page exports can be named in its HTML: data-action (click), data-input, data-change, data-enter.
const actions={go,...dashboard,...collection,...addBag,...trends,...reports,...alerts,...wishlist,...settings};

// Opening "Add a bag" always starts a fresh form; colEditBag() opens it in edit mode without going through here.
export function go(page){
  S.page=page;
  if(page==='add-bag'){
    S.editBag=null;
    S.addForm={name:'',brand:'',model:'',color:'',material:'',size:'',hardware:'',year:'',condition:'Excellent',retailer:'',purchaseDate:todayStr(),purchasePrice:'',notes:'',tags:[],currentValue:''};
  }
  render();
}

function syncSidebar(){
  document.querySelectorAll('.nav-item').forEach(el=>{
    const active=el.dataset.page===S.page;
    el.classList.toggle('active',active);
    active?el.setAttribute('aria-current','page'):el.removeAttribute('aria-current');
    const ic=el.querySelector('i');
    if(ic) ic.style.color=active?'#FBEAF0':'#993556';
    if(active) el.scrollIntoView({block:'nearest',inline:'nearest'}); // keeps the active tab visible in the phone tab bar
  });
  const init=(S.settings.name||'SC').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  $('sb-avatar').textContent=init;
  $('sb-name').textContent=S.settings.name||'Mary Katherine';
  $('sb-plan').textContent=S.settings.plan||'Pro plan';
  $('sb-appname').textContent=S.settings.appName||'Mary Katherine';
}

const inputKey=el=>el?.dataset?.input?el.dataset.input+'|'+(el.dataset.arg??''):null;

export function render(){
  syncSidebar();
  // Rebuilding #main destroys the focused field; remember it (by its data-input + data-arg) and restore focus + caret.
  const a=document.activeElement,key=$('main').contains(a)?inputKey(a):null;
  let pos=null;try{pos=a.selectionStart;}catch{}
  $('main').innerHTML=(PAGES[S.page]||PAGES.dashboard)();
  const el=key&&[...$('main').querySelectorAll('[data-input]')].find(e=>inputKey(e)===key);
  if(el){el.focus();try{if(pos!==null)el.setSelectionRange(pos,pos);}catch{}}
  // Link each form label to its control so tapping the label focuses it and screen readers read it
  $('main').querySelectorAll('.field').forEach((f,i)=>{
    const l=f.querySelector('label'),c=f.querySelector('input,select,textarea');
    if(l&&c){c.id||=('fld'+i);l.htmlFor=c.id;}
  });
}

// Calls actions[name](data-arg?, ...extra). Inputs and selects pass their value as the last argument.
function run(name,el,extra){
  const fn=actions[name];
  if(!fn){console.error('No action named',name);return;}
  fn(...(el.dataset.arg!==undefined?[el.dataset.arg]:[]),...extra);
}
document.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el)run(el.dataset.action,el,[]);});
document.addEventListener('input',e=>{const el=e.target.closest('[data-input]');if(el)run(el.dataset.input,el,[el.value]);});
document.addEventListener('change',e=>{const el=e.target.closest('[data-change]');if(el)run(el.dataset.change,el,[el.value]);});
document.addEventListener('keydown',e=>{
  const el=e.key==='Enter'&&e.target.closest('[data-enter]');
  if(el){run(el.dataset.enter,el,[]);return;}
  // Enter/Space activate non-button elements marked role="button" (bag list rows, links in text)
  if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"]')){e.preventDefault();e.target.click();}
});
document.querySelectorAll('.nav-item').forEach(el=>el.addEventListener('click',()=>go(el.dataset.page)));

loadAll();
render();
