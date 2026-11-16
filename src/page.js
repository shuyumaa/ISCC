(function(){
'use strict';
var B=document.body,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{if(v==null){localStorage.removeItem(k)}else{localStorage.setItem(k,v)}}catch(e){}}};
var fx=[],smokeCtl=null;

/* toast */
var toastEl=$('.toast'),toastT;
function toast(en,zh){toastEl.textContent=B.dataset.lang==='zh'?zh:en;toastEl.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){toastEl.classList.remove('on')},1800)}
function copy(text,en,zh){
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){toast(en,zh)},function(){toast('Copy failed. Select the text and copy it.','复制失败，请手动选择')})}
  else{toast('Copy failed. Select the text and copy it.','复制失败，请手动选择')}}

/* arena + tongue */
function setTheme(t){B.dataset.theme=t;store.set('iscc-theme',t);$('meta[name=theme-color]').content=t==='light'?'#F2EEE3':'#0B0D10';fx.forEach(function(c){if(c&&c.theme)c.theme(t)})}
function setLang(l){B.dataset.lang=l;store.set('iscc-lang',l);document.documentElement.lang=l==='zh'?'zh-Hans':'en';document.title=l==='zh'?'ISCC — 视觉概念':'ISCC — Visual Concept'}
setLang(B.dataset.lang==='zh'?'zh':'en');
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
    rig.addEventListener('pointermove',function(e){if(RM)return;var p=norm(e,rig);rb.pointer(p[0],p[1]);read((p[0]-.5)*26)});
    rig.addEventListener('pointerleave',function(){rb.release();read(0)});
    rig.addEventListener('click',function(){rb.flash()});
    F.beams($('#fx-poster'),{target:[.5,.6],theme:'dark',intensity:1.15});
    var sm=F.smoke($('#fx-smoke'),{theme:th,density:1});fx.push(sm);smokeCtl=sm;
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
if(feed){feed.innerHTML='<svg class="feed-map" viewBox="-330 -160 1060 596" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#map" width="400" height="400"/>'
 +'<g class="feed-lbl"><text x="330" y="48">A · ATRIUM</text><text x="34" y="60">B · ARCHIVE</text><text x="212" y="214">QUAD</text><text x="352" y="250">CLOISTER</text><text x="18" y="300">STACKS</text><text x="166" y="394">GATE</text><text x="170" y="30">HALL</text></g>'
 +'<g class="feed-ct"><path d="M312 100h9v9h-9zM346 72h9v9h-9zM196 112h9v9h-9zM70 96h9v9h-9zM92 124h9v9h-9z"/></g>'
 +'<g class="feed-t"><circle cx="338" cy="262" r="5"/><circle cx="330" cy="300" r="5"/><circle cx="200" cy="262" r="5"/><circle cx="214" cy="300" r="5"/><circle cx="74" cy="316" r="5"/></g>'
 +'<path class="feed-arc" pathLength="1" d="M338 262Q372 150 326 104"/><circle class="feed-ring" cx="326" cy="104" r="20"/>'
 +'<path class="feed-arc" pathLength="1" d="M200 262Q150 190 196 150"/><circle class="feed-ring" cx="196" cy="150" r="14"/></svg>'}

var rslot=$('.bc-radar-slot');
if(rslot){rslot.innerHTML='<svg viewBox="0 0 400 400" aria-hidden="true" style="display:block;width:100%;height:100%"><use href="#map" width="400" height="400"/><g class="feed-ct"><path d="M310 98h13v13h-13zM344 70h13v13h-13zM194 110h13v13h-13zM68 94h13v13H68zM90 122h13v13H90z"/></g><g class="feed-t"><circle cx="338" cy="262" r="7"/><circle cx="330" cy="300" r="7"/><circle cx="200" cy="262" r="7"/><circle cx="214" cy="300" r="7"/><circle cx="74" cy="316" r="7"/></g></svg>'}
/* the logo slot */
function setLogo(url){if(url){B.style.setProperty('--logo','url("'+url+'")');B.classList.add('has-logo')}else{B.style.removeProperty('--logo');B.classList.remove('has-logo')}$('#logo-reset').hidden=!url}
/* An image model returns an opaque picture; the slot is an alpha mask. So every file is
   redrawn: background keyed out when the corners are opaque, trimmed, scaled to 512. */
function prepLogo(img){
  var S=512,k=Math.min(1,S/Math.max(img.naturalWidth||S,img.naturalHeight||S)),w=Math.max(1,Math.round((img.naturalWidth||S)*k)),h=Math.max(1,Math.round((img.naturalHeight||S)*k));
  var c=document.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');x.drawImage(img,0,0,w,h);
  var d=x.getImageData(0,0,w,h),q=d.data,i,cs=[0,(w-1)*4,(h-1)*w*4,(h*w-1)*4],opaque=cs.every(function(o){return q[o+3]>250});
  if(opaque){var br=0,bg=0,bb=0;cs.forEach(function(o){br+=q[o]/4;bg+=q[o+1]/4;bb+=q[o+2]/4});
    for(i=0;i<q.length;i+=4){var dr=q[i]-br,dg=q[i+1]-bg,db=q[i+2]-bb,dist=Math.sqrt(dr*dr+dg*dg+db*db)/255;q[i+3]=Math.max(0,Math.min(1,(dist-.1)/.22))*255}}
  var x0=w,y0=h,x1=-1,y1=-1,px,py;
  for(py=0;py<h;py++)for(px=0;px<w;px++){if(q[(py*w+px)*4+3]>24){if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py}}
  if(x1<0)return null;
  x.putImageData(d,0,0);
  var bw=x1-x0+1,bh=y1-y0+1,m=Math.max(bw,bh),o=document.createElement('canvas');o.width=o.height=m;
  o.getContext('2d').drawImage(c,x0,y0,bw,bh,(m-bw)/2,(m-bh)/2,bw,bh);
  return o.toDataURL('image/png');
}
function readLogo(f){if(!f||!/^image\/(svg\+xml|png|webp|jpeg)$/.test(f.type)){toast('Use an SVG, PNG, WebP or JPEG','请使用 SVG、PNG、WebP 或 JPEG');return}
  var r=new FileReader();r.onload=function(){var img=new Image();
    img.onload=function(){var url=null;try{url=prepLogo(img)}catch(e){}
      if(!url){toast('That file has no visible shape','文件中没有可见图形');return}
      setLogo(url);store.set('iscc-logo',url);toast('Logo loaded','标志已载入')};
    img.onerror=function(){toast('That file could not be read','文件无法读取')};img.src=r.result};
  r.readAsDataURL(f)}
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

B.classList.add('js');
/* shoot the smoke: tracers ride the authored spray, each round opens the volume */
(function(){
  var sp=$('#smoke-plate'),cv=$('#tracers'),pn=$('#punch-n');if(!sp||!cv)return;
  var cx=cv.getContext('2d'),shots=[],ammo=30,idx=0,timer=null,reload=null,aim=[.5,.5],raf=0,W=0,H=0,dpr=1;
  function size(){var r=sp.getBoundingClientRect();dpr=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
  function ink(){return B.dataset.theme==='light'?'20,22,28':'239,233,218'}
  function fire(){
    if(ammo<=0){stop();return}
    var k=SPRAY[Math.min(idx,SPRAY.length-1)],x=aim[0]+k[0]*1.5/Math.max(W,1),y=aim[1]+k[1]*1.5/Math.max(H,1);
    idx++;ammo--;pn.textContent=ammo;
    if(smokeCtl)smokeCtl.punch(x,y,idx<4?.085:.06);
    if(!RM){shots.push({x:x*W,y:y*H,t:performance.now(),j:(idx%3-1)*6});if(!raf)raf=requestAnimationFrame(draw)}
  }
  function draw(now){
    raf=0;cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);
    var ox=-W*.06,oy=H*1.12,c=ink(),live=false;
    for(var i=shots.length-1;i>=0;i--){var s=shots[i],a=(now-s.t)/1000;
      if(a>.5){shots.splice(i,1);continue}live=true;
      var sx=ox+s.j,dx=s.x-sx,dy=s.y-oy,h=Math.min(1,a/.07),tl=Math.max(0,h-.34);
      if(a<.16){var g=cx.createLinearGradient(sx+dx*tl,oy+dy*tl,sx+dx*h,oy+dy*h),f=1-a/.16;
        g.addColorStop(0,'rgba(201,164,76,0)');g.addColorStop(.7,'rgba(228,207,154,'+(.55*f)+')');g.addColorStop(1,'rgba('+c+','+f+')');
        cx.strokeStyle=g;cx.lineWidth=1.4;cx.beginPath();cx.moveTo(sx+dx*tl,oy+dy*tl);cx.lineTo(sx+dx*h,oy+dy*h);cx.stroke()}
      if(a>.06){var q=(a-.06)/.44,e=1-Math.pow(1-q,3),r=4+e*15;
        cx.strokeStyle='rgba('+c+','+(.8*(1-q))+')';cx.lineWidth=1;cx.beginPath();cx.arc(s.x,s.y,r,0,6.2832);cx.stroke();
        for(var n=0;n<4;n++){var an=n*1.5708+.6+s.j,r0=r+2,r1=r+3+e*7;cx.beginPath();cx.moveTo(s.x+Math.cos(an)*r0,s.y+Math.sin(an)*r0);cx.lineTo(s.x+Math.cos(an)*r1,s.y+Math.sin(an)*r1);cx.stroke()}}
    }
    if(live)raf=requestAnimationFrame(draw)
  }
  function stop(){clearInterval(timer);timer=null;clearTimeout(reload);reload=setTimeout(function(){ammo=30;idx=0;pn.textContent=ammo},1400)}
  function at(e){var r=sp.getBoundingClientRect();aim=[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]}
  sp.addEventListener('pointerdown',function(e){at(e);size();clearTimeout(reload);idx=0;fire();if(!RM&&!timer)timer=setInterval(fire,96)});
  sp.addEventListener('pointermove',function(e){at(e);if(smokeCtl&&!timer)smokeCtl.pointer(aim[0],aim[1])});
  ['pointerup','pointerleave','pointercancel'].forEach(function(t){sp.addEventListener(t,function(){if(timer||t==='pointerup')stop();if(smokeCtl&&t!=='pointerup')smokeCtl.pointer(-1,-1)})});
})();

/* utility arc: tick the flight path, fly a marker along it */
(function(){var p1=$('#arc-p1'),t1=$('#arc-t1');if(!p1||!t1||!p1.getTotalLength)return;
  var L=p1.getTotalLength(),d='';for(var i=1;i<10;i++){var a=p1.getPointAtLength(L*i/10),b=p1.getPointAtLength(L*i/10+1),nx=-(b.y-a.y),ny=b.x-a.x,m=Math.sqrt(nx*nx+ny*ny)||1;nx=nx/m*5;ny=ny/m*5;
    d+='M'+(a.x-nx).toFixed(1)+' '+(a.y-ny).toFixed(1)+'L'+(a.x+nx).toFixed(1)+' '+(a.y+ny).toFixed(1)}
  var el=document.createElementNS('http://www.w3.org/2000/svg','path');el.setAttribute('d',d);t1.appendChild(el)})();

/* scroll: arcs draw, spray fires, type slides, radar tracks */
var ah=$('#arc-head'),ap1=$('#arc-p1'),ap2=$('#arc-p2'),arc=$('#arc-smoke'),la=arc?$$('.arc-mask',arc):[],tya=$('.ty-a'),tyb=$('.ty-b'),secs=$$('main>section'),dots=$$('.radar button'),ratio=$('.ratio');
function prog(el,a,b){var r=el.getBoundingClientRect(),vh=innerHeight;return Math.max(0,Math.min(1,(vh*a-r.top)/(vh*(a-b))))}
function onScroll(){
  if(arc){var p=RM?1:prog(arc,1,.3),p1=Math.min(1,p/.78),p2=Math.max(0,(p-.78)/.22);
    la[0].style.strokeDashoffset=1-p1;la[1].style.strokeDashoffset=1-p2;
    if(ah&&ap1.getTotalLength){var seg=p2>0?ap2:ap1,q=p2>0?p2:p1,pt=seg.getPointAtLength(seg.getTotalLength()*q);
      ah.setAttribute('transform','translate('+pt.x.toFixed(1)+' '+pt.y.toFixed(1)+') rotate('+(p*540).toFixed(0)+')');ah.style.opacity=(p>0&&p<1)?1:0}
    arc.classList.toggle('b1',p1>=1);arc.classList.toggle('landed',p2>=1)}
  sprays.forEach(function(el){var k=RM?30:Math.round(prog(el,.95,.4)*30);[].forEach.call(el.children,function(d,i){d.classList.toggle('on',i<k)})});
  if(!RM&&tya){var q=prog(tya,1,-.2);tya.style.transform='translateX('+(-q*9)+'%)';tyb.style.transform='translateX('+(q*9-4)+'%)'}
  if(ratio&&(RM||prog(ratio,.8,.5)>0))ratio.classList.add('in');
  var cur=secs[0];secs.forEach(function(s){if(s.getBoundingClientRect().top<innerHeight*.45)cur=s});
  dots.forEach(function(d){d.setAttribute('aria-current',d.dataset.go===cur.id)});
}
var tick=false;addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(function(){tick=false;onScroll()})}},{passive:true});
addEventListener('resize',onScroll);onScroll();

/* radar */
var tmap=$('#t-map');
function radar(open){B.classList.toggle('radar-open',open);tmap.setAttribute('aria-expanded',open)}
tmap.onclick=function(e){e.stopPropagation();radar(!B.classList.contains('radar-open'))};
document.addEventListener('click',function(e){if(B.classList.contains('radar-open')&&!e.target.closest('.radar'))radar(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&B.classList.contains('radar-open')){radar(false);tmap.focus()}});

/* stinger between plates */
var st=$('.stinger'),stA,stB;
function go(id){var t=document.getElementById(id);if(!t)return;radar(false);var y=t.getBoundingClientRect().top+scrollY;
  if(RM){scrollTo(0,y);return}
  clearTimeout(stA);clearTimeout(stB);
  st.classList.remove('go');void st.offsetWidth;st.classList.add('go');
  stA=setTimeout(function(){scrollTo(0,y)},260);stB=setTimeout(function(){st.classList.remove('go')},1300)}
$$('[data-go]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();go(b.dataset.go)})});
})();
