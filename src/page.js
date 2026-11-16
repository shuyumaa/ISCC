(function(){
'use strict';
var B=document.body,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{if(v==null){localStorage.removeItem(k)}else{localStorage.setItem(k,v)}}catch(e){}}};
var fx=[];

/* toast */
var toastEl=$('.toast'),toastT;
function toast(en,zh){toastEl.textContent=B.dataset.lang==='zh'?zh:en;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},1800)}
function copy(text,en,zh){
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast(en,zh)},function(){toast('Copy failed. Select the text and copy it.','复制失败，请手动选择')})}
  else{toast('Copy failed. Select the text and copy it.','复制失败，请手动选择')}}

/* arena + tongue */
function setTheme(t){B.dataset.theme=t;store.set('iscc-theme',t);$('meta[name=theme-color]').content=t==='light'?'#F2EEE3':'#0B0D10';fx.forEach(function(c){if(c&&c.theme)c.theme(t)})}
function setLang(l){B.dataset.lang=l;store.set('iscc-lang',l);document.documentElement.lang=l==='zh'?'zh-Hans':'en';document.title=l==='zh'?'ISCC — 视觉概念':'ISCC — Visual Concept'}
setLang(store.get('iscc-lang')==='zh'?'zh':'en');
B.dataset.theme=store.get('iscc-theme')==='light'?'light':'dark';
$('#t-theme').onclick=function(){setTheme(B.dataset.theme==='dark'?'light':'dark')};
$('#t-lang').onclick=function(){setLang(B.dataset.lang==='en'?'zh':'en')};

/* light, smoke, metal */
function norm(e,el){var r=el.getBoundingClientRect();return [(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
(function mount(){
  var th=B.dataset.theme,F=window.ISCCFX,C=window.ISCCCUP;
  if(F){
    fx.push(F.beams($('#fx-cover'),{target:[.5,.74],theme:th,intensity:1}));
    var rig=$('#rig'),rb=F.beams($('#fx-rig'),{target:[.5,.8],theme:th,intensity:1.1}),deg=$('#rig-deg');fx.push(rb);
    var read=function(v){deg.textContent=(v<0?'−':'+')+('0'+Math.abs(v).toFixed(1)).slice(-4)+'°'};
    rig.addEventListener('pointermove',function(e){var p=norm(e,rig);rb.pointer(p[0],p[1]);read((p[0]-.5)*26)});
    rig.addEventListener('pointerleave',function(){rb.release();read(0)});
    rig.addEventListener('click',function(){rb.flash()});
    F.beams($('#fx-poster'),{target:[.5,.6],theme:'dark',intensity:1.15});
    var sp=$('#smoke-plate'),sm=F.smoke($('#fx-smoke'),{theme:th,density:1}),n=0,pn=$('#punch-n');fx.push(sm);
    sp.addEventListener('pointermove',function(e){var p=norm(e,sp);sm.pointer(p[0],p[1])});
    sp.addEventListener('pointerleave',function(){sm.pointer(-1,-1)});
    sp.addEventListener('pointerdown',function(e){var p=norm(e,sp);sm.punch(p[0],p[1],.13);n=Math.min(8,n+1);pn.textContent=n;setTimeout(function(){n=Math.max(0,n-1);pn.textContent=n},5000)});
  }
  if(C){
    fx.push(C.mount($('#cup-cover'),{finish:'polished',theme:th}));
    var mc=C.mount($('#cup-metal'),{finish:'polished',theme:th}),mh=$('.metal-cup');fx.push(mc);
    mh.addEventListener('pointermove',function(e){var p=norm(e,mh);mc.pointer(p[0],p[1])});
    mh.addEventListener('pointerleave',function(){mc.release()});
    $$('.finishes button').forEach(function(b){b.onclick=function(){$$('.finishes button').forEach(function(o){o.setAttribute('aria-pressed',o===b)});mc.finish(b.dataset.finish)}});
  }
})();

/* tactical feed behind the HUD: authored map, never a real one */
var feed=$('.bc-feed');
if(feed){feed.innerHTML='<svg class="feed-map" viewBox="-190 -30 780 460" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#map" width="400" height="400"/>'
 +'<g class="feed-lbl"><text x="330" y="48">A · ATRIUM</text><text x="34" y="60">B · ARCHIVE</text><text x="212" y="214">QUAD</text><text x="352" y="250">CLOISTER</text><text x="18" y="300">STACKS</text><text x="166" y="394">GATE</text><text x="170" y="30">HALL</text></g>'
 +'<g class="feed-ct"><path d="M312 100h9v9h-9zM346 72h9v9h-9zM196 112h9v9h-9zM70 96h9v9h-9zM92 124h9v9h-9z"/></g>'
 +'<g class="feed-t"><circle cx="338" cy="262" r="5"/><circle cx="330" cy="300" r="5"/><circle cx="200" cy="262" r="5"/><circle cx="214" cy="300" r="5"/><circle cx="74" cy="316" r="5"/></g>'
 +'<path class="feed-arc" pathLength="1" d="M338 262Q372 150 326 104"/><circle class="feed-ring" cx="326" cy="104" r="20"/>'
 +'<path class="feed-arc" pathLength="1" d="M200 262Q150 190 196 150"/><circle class="feed-ring" cx="196" cy="150" r="14"/></svg>'}

/* the logo slot */
function setLogo(url){if(url){B.style.setProperty('--logo','url("'+url+'")');B.classList.add('has-logo')}else{B.style.removeProperty('--logo');B.classList.remove('has-logo')}$('#logo-reset').hidden=!url}
function readLogo(f){if(!f||!/^image\/(svg\+xml|png|webp)$/.test(f.type)){toast('Use an SVG or a transparent PNG','请使用 SVG 或透明 PNG');return}
  if(f.size>700000){toast('Keep the file under 700 KB','文件请小于 700 KB');return}
  var r=new FileReader();r.onload=function(){setLogo(r.result);store.set('iscc-logo',r.result);toast('Logo loaded','标志已载入')};r.readAsDataURL(f)}
var saved=store.get('iscc-logo');if(saved)setLogo(saved);
$('#logo-file').onchange=function(e){readLogo(e.target.files[0]);e.target.value=''};
$('#logo-reset').onclick=function(){setLogo(null);store.set('iscc-logo',null)};
var drop=$('#drop');
['dragenter','dragover'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.add('over')})});
['dragleave','drop'].forEach(function(t){drop.addEventListener(t,function(e){e.preventDefault();drop.classList.remove('over')})});
drop.addEventListener('drop',function(e){readLogo(e.dataTransfer.files[0])});

/* copy */
$('#brief-copy').onclick=function(){copy($('#brief-text').textContent,'Brief copied','简报已复制')};
$$('.sw').forEach(function(s){s.onclick=function(){copy(s.dataset.hex,s.dataset.hex+' copied',s.dataset.hex+' 已复制')}});
$('#tok-copy').onclick=function(){copy(':root{\n  --cup-gold:#C9A44C;\n  --gold-light:#E4CF9A;\n  --legacy-blue:#15294E;\n  --arena-black:#0B0D10;\n  --parchment:#EFE9DA;\n  --engraving-silver:#9AA3B2;\n  --side-ct:var(--legacy-blue);\n  --side-t:var(--cup-gold);\n  --ease:cubic-bezier(.16,1,.3,1);\n}','Tokens copied','变量已复制')};

/* spray: seven up, then the sway. Authored, not traced. */
var SPRAY=[[0,0],[1,-9],[-1,-19],[2,-30],[0,-42],[3,-54],[1,-66],[-4,-76],[-12,-83],[-21,-88],[-30,-91],[-38,-92],[-30,-96],[-18,-98],[-4,-99],[10,-98],[23,-99],[35,-97],[45,-99],[38,-102],[27,-103],[15,-102],[3,-104],[-9,-103],[-20,-105],[-12,-107],[0,-106],[12,-108],[22,-107],[30,-109]];
var sprays=$$('.spray');
sprays.forEach(function(el){SPRAY.forEach(function(p){var d=document.createElement('i');d.style.left='calc(50% + '+(p[0]*2.2)+'px)';d.style.top=(118+p[1])+'px';el.appendChild(d)})});
var ps=$('.po-spray');if(ps){ps.innerHTML=SPRAY.map(function(p,i){return '<circle cx="'+(60+p[0])+'" cy="'+(290+p[1]*2.5)+'" r="'+(i<7?3.6:2.8)+'"/>'}).join('')}

/* scroll: arcs draw, spray fires, type slides, radar tracks */
var arc=$('#arc-smoke'),la=arc?$$('.arc-mask',arc):[],tya=$('.ty-a'),tyb=$('.ty-b'),secs=$$('main>section'),dots=$$('.radar button'),ratio=$('.ratio');
function prog(el,a,b){var r=el.getBoundingClientRect(),vh=innerHeight;return Math.max(0,Math.min(1,(vh*a-r.top)/(vh*(a-b))))}
function onScroll(){
  if(arc){var p=RM?1:prog(arc,1,.3),p1=Math.min(1,p/.78),p2=Math.max(0,(p-.78)/.22);
    la[0].style.strokeDashoffset=1-p1;la[1].style.strokeDashoffset=1-p2;
    arc.classList.toggle('b1',p1>=1);arc.classList.toggle('landed',p2>=1)}
  sprays.forEach(function(el){var k=RM?30:Math.round(prog(el,.95,.4)*30);[].forEach.call(el.children,function(d,i){d.classList.toggle('on',i<k)})});
  if(!RM&&tya){var q=prog(tya,1,-.2);tya.style.transform='translateX('+(-q*9)+'%)';tyb.style.transform='translateX('+(q*9-4)+'%)'}
  if(ratio&&(RM||prog(ratio,.8,.5)>0))ratio.classList.add('in');
  var cur=secs[0];secs.forEach(function(s){if(s.getBoundingClientRect().top<innerHeight*.45)cur=s});
  dots.forEach(function(d){d.setAttribute('aria-current',d.dataset.go===cur.id)});
}
var tick=false;addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){tick=false;onScroll()})}},{passive:true});
addEventListener('resize',onScroll);onScroll();

/* stinger between plates */
var st=$('.stinger');
function go(id){var t=document.getElementById(id);if(!t)return;var y=t.getBoundingClientRect().top+scrollY-(id==='cover'?0:20);
  if(RM){scrollTo(0,y);return}
  st.classList.remove('go');void st.offsetWidth;st.classList.add('go');
  setTimeout(function(){scrollTo(0,y)},430);setTimeout(function(){st.classList.remove('go')},1300)}
$$('[data-go]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();go(b.dataset.go)})});
})();
