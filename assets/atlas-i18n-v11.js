/* Shared language layer: UI text, native plot labels, images and frame messages. */
(() => {
'use strict';
const dict=window.ATLAS_TRANSLATIONS||{},figures=window.ATLAS_TRANSLATED_FIGURES||{};
const textRecords=new WeakMap(),attributeRecords=new WeakMap(),plots=new Map(),missing=new Set();
const normal=s=>String(s).replace(/\s+/g,' ').trim(),lower=new Map(Object.entries(dict).map(([k,v])=>[normal(k).toLocaleLowerCase('en'),v]));
const escaped=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const subKeys=Object.keys(dict).filter(k=>k.length>=10&&/[A-Za-z]/.test(k)&&!k.startsWith('http')&&!k.startsWith('outputs/')).sort((a,b)=>b.length-a.length);
const subRegex=new RegExp(subKeys.map(escaped).join('|'),'gi');
let language='en',plotlyValue,applying=false;
try{const fromParent=window.parent!==window?window.parent.ATLAS_I18N?.lang:null;language=fromParent||new URLSearchParams(location.search).get('lang')||localStorage.getItem('alanya-atlas-language')||'en';}catch(e){}
if(!['en','tr'].includes(language))language='en';
const validCode=s=>/^(?:[\d\W]+|[A-Z0-9_:/.-]+|RCP[\d.]+|SSP[\d.\-]+|SUBID \d+|CHELSA|ECLIPS|MODIS|CORINE|CLIMAAX|Alanya|Gazipaşa|Antalya|MPI.*|IPSL.*|MRI.*|CSC.*|SMHI.*|Historical_.*)$/u.test(s);
function translateWords(s){
 const phrases=window.ATLAS_PHRASES||[];let result=s;
 for(const [a,b] of phrases)result=result.replace(new RegExp(a,'gi'),b);
 return result;
}
function t(input){
 if(typeof input!=='string'||language==='en')return input;
 const trimmed=normal(input);if(!trimmed)return input;
 if(/^(?:https?:\/\/|doi:|10\.\d{4,9}\/|[A-Z]:[\\/])/.test(trimmed))return input;
 if(/^(?:RCP\d\.\d(?:\s*\/\s*(?:RCP)?\d\.\d)*|SSP\d-\d\.\d)$/.test(trimmed))return input;
 const file=/^([A-Za-z0-9_.\/-]+\.(?:csv|json|tif|gpkg|ipynb|py|md|html))(\s+\(.+\))?$/.exec(trimmed);
 if(file)return file[1]+(file[2]?' '+t(file[2].trim()):'');
 let out=dict[trimmed]??lower.get(trimmed.toLocaleLowerCase('en'));const exact=out!==undefined;
 if(!exact&&/^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+$/.test(trimmed))return input;
 if(out===undefined){
  const rules=window.ATLAS_TRANSLATION_RULES||[];
  for(const [pattern,replacement] of rules){const re=new RegExp(pattern,'u');if(re.test(trimmed)){const backrefs=replacement.replace(/\\(\d+)/g,(_,n)=>'$'+n);out=trimmed.replace(re,backrefs);out=out.replace(/(?<!SSP\d-)(?<![.\p{L}\d])(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)(?![.\p{L}])/gu,n=>n.replaceAll(',','\u0001').replaceAll('.',',').replaceAll('\u0001','.'));break;}}
 }
 if(out===undefined){
  const protectedParts=[];
  out=trimmed.replace(subRegex,match=>{protectedParts.push(lower.get(normal(match).toLocaleLowerCase('en')));return '\uE000'+(protectedParts.length-1)+'\uE001';});
  out=translateWords(out);
  out=out.replace(/(?<!SSP\d-)(?<![.\p{L}\d])(?:\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+)(?![.\p{L}])/gu,n=>n.replaceAll(',','\u0001').replaceAll('.',',').replaceAll('\u0001','.'));
  out=out.replace(/\uE000(\d+)\uE001/g,(_,index)=>protectedParts[Number(index)]);
  if(out===trimmed&&/[A-Za-z]{4}/.test(trimmed)&&!validCode(trimmed))missing.add(trimmed);
 }
 if(trimmed===trimmed.toLocaleUpperCase('en')&&/[A-Z]{4}/.test(trimmed))out=out.toLocaleUpperCase('tr-TR');
 // Numeric values keep their source precision; only presentation separators change.
 const lead=input.match(/^\s*/)[0],tail=input.match(/\s*$/)[0];return lead+out+tail;
}
function figurePath(value){
 if(language==='en')return value;
 try{const u=new URL(value,location.href);for(const [suffix,path] of Object.entries(figures)){if(u.pathname.endsWith(suffix)){u.pathname=u.pathname.slice(0,-suffix.length)+path;return u.href;}}}catch(e){}return value;
}
function processText(node){
 const parent=node.parentElement;if(!parent||/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|PRE|CODE)$/.test(parent.tagName)||parent.closest('[data-no-translate],.js-plotly-plot,.plotly-graph-div'))return;
 const value=node.nodeValue;let record=textRecords.get(node);
 if(!record||value!==record.rendered)record={source:value,rendered:value};
 const next=t(record.source);record.rendered=next;textRecords.set(node,record);if(value!==next)node.nodeValue=next;
}
function processElement(el){
 if(!el?.getAttribute||el.closest('[data-no-translate]'))return;
 let records=attributeRecords.get(el);if(!records){records={};attributeRecords.set(el,records);}
 for(const name of ['title','aria-label','placeholder','alt','data-title']){
  if(!el.hasAttribute(name))continue;
  let record=records[name],value=el.getAttribute(name);if(!record||value!==record.rendered)record={source:value,rendered:value};
  const next=t(record.source);record.rendered=next;records[name]=record;if(next!==value)el.setAttribute(name,next);
 }
 if(el.tagName==='IMG'||el.tagName==='A'){
  const attr=el.tagName==='IMG'?'src':'href';let record=records[attr],value=el.getAttribute(attr);if(!value)return;
  if(!record||value!==record.rendered)record={source:value,rendered:value};
  let next=figurePath(record.source);
  if(el.tagName==='A'&&!el.hasAttribute('download')&&!record.source.startsWith('#')){
   try{const u=new URL(next,location.href);if(u.origin===location.origin&&/\.html$|\/$/.test(u.pathname)){u.searchParams.set('lang',language);next=u.href;}}catch(e){}
  }
  record.rendered=next;records[attr]=record;if(next!==value)el.setAttribute(attr,next);
 }
}
function apply(root=document.body){
 if(!root)return;
 if(root.nodeType===Node.TEXT_NODE){processText(root);return;}
 if(root.nodeType!==Node.ELEMENT_NODE&&root.nodeType!==Node.DOCUMENT_NODE)return;
 if(root.nodeType===Node.ELEMENT_NODE)processElement(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode()))processText(n);
 root.querySelectorAll?.('[title],[aria-label],[placeholder],[alt],[data-title],img,a[href]').forEach(processElement);
}
const clone=v=>Array.isArray(v)?v.map(clone):v&&typeof v==='object'?ArrayBuffer.isView(v)?v.slice():Object.fromEntries(Object.entries(v).map(([k,x])=>[k,clone(x)])):v;
function localize(v,key=''){
 if(Array.isArray(v))return v.map(x=>localize(x,key));
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,localize(x,k)]));
 if(typeof v==='string'&&['text','name','title','hovertemplate','hovertext','ticktext','x','y'].includes(key))return t(v);
 return v;
}
function hookPlotly(P){
 if(!P||P.__atlasI18n)return P;P.__atlasI18n=true;
 if(P.register)P.register({moduleType:'locale',name:'tr',dictionary:{'Download plot as a png':'Grafiği PNG olarak indir','Download plot as a PNG':'Grafiği PNG olarak indir','Zoom':'Yakınlaştır','Pan':'Kaydır','Zoom in':'Yakınlaştır','Zoom out':'Uzaklaştır','Autoscale':'Otomatik ölçek','Reset axes':'Eksenleri sıfırla','Box Select':'Dikdörtgen seçimi','Lasso Select':'Serbest seçim','Toggle Spike Lines':'Kılavuz çizgileri','Compare data on hover':'Üzerine gelince karşılaştır','Show closest data on hover':'En yakın veriyi göster','Double-click to zoom back out':'Geri dönmek için çift tıklayın'},format:{days:['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],shortDays:['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'],months:['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],shortMonths:['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'],date:'%d.%m.%Y',decimal:',',thousands:'.',grouping:[3]}});
 for(const name of ['newPlot','react']){
  const original=P[name];if(typeof original!=='function')continue;
  P[name]=function(target,data,layout,config){
   const element=typeof target==='string'?document.getElementById(target):target;
   if(element)plots.set(element,{original,data:clone(data),layout:clone(layout||{}),config:clone(config||{})});
   const l=localize(clone(layout||{}));l.separators=language==='tr'?',.':'.,';
   return original.call(P,target,localize(clone(data)),l,{...config,locale:language,displaylogo:false});
  };
 }
 return P;
}
try{const descriptor=Object.getOwnPropertyDescriptor(window,'Plotly');if(!descriptor||descriptor.configurable){plotlyValue=window.Plotly;Object.defineProperty(window,'Plotly',{configurable:true,get:()=>plotlyValue,set:v=>{plotlyValue=hookPlotly(v);}});if(plotlyValue)hookPlotly(plotlyValue);}}catch(e){}
function drawPlots(){
 const P=window.Plotly;if(!P)return;
 for(const [el,record] of plots){if(!el.isConnected){plots.delete(el);continue;}const l=localize(clone(record.layout));l.separators=language==='tr'?',.':'.,';record.original.call(P,el,localize(clone(record.data)),l,{...record.config,locale:language,displaylogo:false});}
}
function setLanguage(value,broadcast=true){
 if(!['en','tr'].includes(value))return;language=value;missing.clear();document.documentElement.lang=value;try{const u=new URL(location.href);u.searchParams.set('lang',value);history.replaceState(null,'',u);}catch(e){}
 try{localStorage.setItem('alanya-atlas-language',value);}catch(e){}
 document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===value)));
 applying=true;apply(document.documentElement);applying=false;drawPlots();
 if(broadcast)document.querySelectorAll('iframe').forEach(frame=>{try{frame.contentWindow.postMessage({type:'alanya-atlas-language',language:value},location.origin==='null'?'*':location.origin);}catch(e){}});
 window.dispatchEvent(new CustomEvent('atlas-language-change',{detail:{language:value}}));
}
const nativeAlert=window.alert.bind(window);window.alert=message=>nativeAlert(t(String(message)));
const api={t,setLanguage,apply,get lang(){return language;},get locale(){return language==='tr'?'tr-TR':'en-GB';},missing:()=>[...missing]};window.ATLAS_I18N=api;
document.documentElement.lang=language;
document.addEventListener('DOMContentLoaded',()=>{
 if(!document.querySelector('.language-switch')&&window===window.top){const switcher=document.createElement('div');switcher.className='language-switch embedded-language';switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Language');switcher.innerHTML='<button type="button" data-language="en" lang="en">EN</button><button type="button" data-language="tr" lang="tr">TR</button>';document.body.append(switcher);if(!document.querySelector('link[href*="atlas-shell-v11"]')){const s=document.createElement('link');s.rel='stylesheet';s.href=new URL('atlas-shell-v11.css?v=11.0.0',document.querySelector('script[src*="atlas-i18n-v11"]').src).href;document.head.append(s);}}
 document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.language)));
 setLanguage(language);
 const observer=new MutationObserver(changes=>{
  if(applying)return;applying=true;
  for(const change of changes){if(change.type==='characterData')processText(change.target);else if(change.type==='attributes')processElement(change.target);else change.addedNodes.forEach(apply);}
  applying=false;
 });observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt','data-title','href','src']});
});
window.addEventListener('message',event=>{if(event.source===window.parent&&event.origin===location.origin&&event.data?.type==='alanya-atlas-language')setLanguage(event.data.language,false);});
window.addEventListener('storage',event=>{if(event.key==='alanya-atlas-language'&&event.newValue!==language)setLanguage(event.newValue,false);});
})();
