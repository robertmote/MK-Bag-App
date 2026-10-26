// App data: option lists, sample data, the state object S, and saving/loading to localStorage.
export const BRANDS=['Hermès','Chanel','Louis Vuitton','Dior','Bottega Veneta','Gucci','Prada','Saint Laurent','Celine','Other'];
export const MATERIALS=['Togo leather','Epsom leather','Caviar leather','Lambskin','Canvas','Exotic skin','Other'];
export const HARDWARE=['Gold (GHW)','Palladium (PHW)','Ruthenium (RHW)','Rose gold','Silver'];
export const RETAILERS=['Boutique (retail)','Department store','Resale — authenticated','Private seller','Auction house','Other'];
export const CONDITIONS=['Never worn','Excellent','Very good','Good','Fair'];
export const ALL_TAGS=['Investment piece','Everyday use','With receipt','With dustbag','With box','Limited edition','Vintage','Gift'];

export const SEED_BAGS=[
  {id:'b1',name:'Birkin 25 Togo Noir',brand:'Hermès',model:'Birkin 25',color:'Noir',material:'Togo leather',size:'25 cm',hardware:'Gold (GHW)',year:'2021',condition:'Excellent',retailer:'Boutique (retail)',purchaseDate:'2021-03-14',purchasePrice:21700,notes:'Serial: X·ABCD1234. Full set — orange box, dustbag, raincoat, lock and keys.',tags:['Investment piece','With receipt','With dustbag','With box'],currentValue:28500},
  {id:'b2',name:'Classic Flap Medium Beige',brand:'Chanel',model:'Classic Flap',color:'Beige Clair',material:'Caviar leather',size:'Medium',hardware:'Gold (GHW)',year:'2020',condition:'Very good',retailer:'Boutique (retail)',purchaseDate:'2020-11-05',purchasePrice:9000,notes:'Auth card included. Minor scuff on bottom corner — professionally touched up.',tags:['Investment piece','With receipt','Everyday use'],currentValue:11200},
  {id:'b3',name:'Lady Dior Small Blush',brand:'Dior',model:'Lady Dior',color:'Blush Pink',material:'Lambskin',size:'Small',hardware:'Rose gold',year:'2022',condition:'Never worn',retailer:'Department store',purchaseDate:'2022-06-22',purchasePrice:5900,notes:'Spring/Summer 2022 runway colour. Never removed from box.',tags:['With receipt','With dustbag','With box','Limited edition'],currentValue:6400},
  {id:'b4',name:'Speedy 30 Monogram',brand:'Louis Vuitton',model:'Speedy 30',color:'Monogram Canvas',material:'Canvas',size:'30 cm',hardware:'Palladium (PHW)',year:'2019',condition:'Good',retailer:'Resale — authenticated',purchaseDate:'2019-08-10',purchasePrice:1870,notes:'Purchased from Vestiaire Collective. Authentication tag included.',tags:['Everyday use','Vintage'],currentValue:1800},
  {id:'b5',name:'Constance 24 Étoupe',brand:'Hermès',model:'Constance 24',color:'Étoupe',material:'Epsom leather',size:'24 cm',hardware:'Palladium (PHW)',year:'2020',condition:'Excellent',retailer:'Boutique (retail)',purchaseDate:'2020-02-02',purchasePrice:17200,notes:'Full set. H clasp in perfect condition. Comes with strap.',tags:['Investment piece','With receipt','With dustbag','With box'],currentValue:22000}
];
export const SEED_ALERTS=[
  {id:'a1',bagId:'b1',type:'above',targetPrice:30000,createdAt:'2024-01-01'},
  {id:'a2',bagId:'b2',type:'above',targetPrice:11000,createdAt:'2024-01-01'}
];
export const SEED_WISHLIST=[
  {id:'w1',brand:'Hermès',model:'Kelly 28',color:'Rouge Casaque',material:'Epsom leather',hardware:'Gold (GHW)',maxBudget:25000,notes:'Dream bag — any year.',addedAt:'2024-03-01'},
  {id:'w2',brand:'Chanel',model:'19 Bag Large',color:'Black',material:'Lambskin',hardware:'Mixed',maxBudget:9000,notes:'Prefer 2021 or newer.',addedAt:'2024-04-15'}
];
export const DEF_SETTINGS={name:'Mary Katherine',email:'',appName:'Mary Katherine',currency:'USD',plan:'Pro plan',notifyAlerts:true,notifyMarket:false,notifyReports:true};

export const S={
  page:'dashboard',
  bags:[],alerts:[],wishlist:[],
  settings:{...DEF_SETTINGS},
  editBag:null,
  colSelected:null,colSearch:'',colBrandFilter:'All',
  addForm:null,
  trendsQuery:'',trendsLoading:false,trendsResults:null,trendsError:null,
  reportsReport:null,reportsLoading:false,
  alertAdding:false,alertForm:{bagId:'',type:'above',targetPrice:''},
  wishAdding:false,wishForm:{brand:'',model:'',color:'',material:'',hardware:'',maxBudget:'',notes:''},
  aiRefreshing:false,
  aiRefreshLog:[]
};

// ── Storage ────────────────────────────────────────────────────────────────────
export function lsGet(k,fb){try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;}}
export function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
export function loadAll(){
  S.bags=lsGet('Mary Katherine_bags',SEED_BAGS);
  S.alerts=lsGet('Mary Katherine_alerts',SEED_ALERTS);
  S.wishlist=lsGet('Mary Katherine_wishlist',SEED_WISHLIST);
  const sv=lsGet('Mary Katherine_settings',null);
  if(sv) S.settings={...DEF_SETTINGS,...sv};
  if(S.bags.length) S.colSelected=S.bags[0].id;
}
export const saveBags=()=>lsSet('Mary Katherine_bags',S.bags);
export const saveAlerts=()=>lsSet('Mary Katherine_alerts',S.alerts);
export const saveWish=()=>lsSet('Mary Katherine_wishlist',S.wishlist);
export const saveSettings=()=>lsSet('Mary Katherine_settings',S.settings);
