/* ISCC championship cup - WebGL1 raymarched lathe form, transparent background.
   window.ISCCCUP.mount(canvas, {finish, theme, spin, fov, scale}) -> {finish, theme, pointer, release, destroy} */
(function () {
  'use strict';

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  var FS = [
'precision highp float;',
'uniform vec2 uRes,uCam,uEnv;',
'uniform float uLight,uTheme,uDist,uTanH,uRough,uAniso,uGrain,uFP;',
'uniform vec3 uF0,uFe,uGain;',
'const vec3 BLUE_L=vec3(0.0648,0.1384,0.3712),BLUE_D=vec3(0.0075,0.0222,0.0762);',
'const vec3 GOLD=vec3(0.584,0.371,0.0723),GOLDL=vec3(0.776,0.624,0.323);',
'const vec3 PARCH=vec3(0.863,0.815,0.701),PORC=vec3(0.815,0.753,0.610);',
'const vec3 BLACK=vec3(0.0033,0.004,0.0052);',
'const vec2 FN=vec2(0.9785,-0.2038);',
'float smin(float a,float b,float k){float h=max(k-abs(a-b),0.)/k;return min(a,b)-h*h*k*0.25;}',
'float smax(float a,float b,float k){return -smin(-a,-b,k);}',
'float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
'float sdEll(vec2 p,vec2 r){float k0=length(p/r);float k1=length(p/(r*r))+1e-6;return k0*(k0-1.)/k1;}',
'float sdSeg(vec2 p,vec2 a,vec2 b,float ra,float rb){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-mix(ra,rb,h);}',
'float lower(vec2 q){',
'  float pl1=sdBox(q-vec2(0.,3.5),vec2(48.8,2.3))-1.2;',
'  float pl2=sdBox(q-vec2(0.,10.),vec2(38.8,1.8))-1.2;',
'  float disc=sdBox(q-vec2(0.,16.),vec2(28.5,1.5))-1.5;',
'  float cone=sdSeg(q,vec2(0.,17.),vec2(0.,36.),17.,4.8)*0.85;',
'  float stem=sdSeg(q,vec2(0.,22.),vec2(0.,60.),5.6,4.3);',
'  float knop=sdEll(q-vec2(0.,42.),vec2(8.6,5.8));',
'  float ring1=sdEll(q-vec2(0.,30.),vec2(7.4,1.5));',
'  float ring2=sdEll(q-vec2(0.,52.),vec2(6.6,1.6));',
'  float neck=sdSeg(q,vec2(0.,56.),vec2(0.,70.),4.6,12.)*0.65;',
'  float d=smin(pl1,pl2,0.8);',
'  d=smin(d,disc,1.2);',
'  d=smin(d,cone,7.);',
'  d=smin(d,stem,5.);',
'  d=smin(d,knop,3.2);',
'  d=smin(d,ring1,1.4);',
'  d=smin(d,ring2,1.4);',
'  d=smin(d,neck,5.);',
'  return d;}',
'float bowlOuter(vec2 q){',
'  float eo=sdEll(q-vec2(0.,112.),vec2(41.,50.))*0.9;',
'  float fo=dot(q-vec2(41.,112.),FN);',
'  float O=mix(eo,fo,smoothstep(98.,126.,q.y));',
'  return smax(O,q.y-136.,0.4);}',
'float cavity(vec2 q){',
'  float ei=sdEll(q-vec2(0.,112.),vec2(38.6,47.6))*0.9;',
'  float fi=dot(q-vec2(38.6,112.),FN);',
'  return mix(ei,fi,smoothstep(98.,126.,q.y));}',
'float map(vec3 p){',
'  vec2 q=vec2(length(p.xz),p.y);',
'  float d=1e5;',
'  if(q.y<78.)d=lower(q);',
'  if(q.y>46.){d=smin(d,bowlOuter(q),4.);}',
'  if(q.y>52.&&q.y<150.){d=smax(d,-cavity(q),0.9);}',
'  if(q.y>118.){d=smin(d,length(q-vec2(44.9,136.))-2.4,1.6);}',
'  return d;}',
'vec3 calcNormal(vec3 p,float e){vec2 k=vec2(1.,-1.);',
'  return normalize(k.xyy*map(p+k.xyy*e)+k.yyx*map(p+k.yyx*e)+k.yxy*map(p+k.yxy*e)+k.xxx*map(p+k.xxx*e));}',
'float calcAO(vec3 p,vec3 n){float o=0.,w=0.,s=1.;',
'  for(int i=0;i<5;i++){float h=0.5+float(i)*float(i)*0.6;float d=map(p+n*h);o+=(h-d)*s;w+=h*s;s*=0.75;}',
'  return clamp(1.-o/w,0.,1.);}',
'vec3 rotY(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(c*v.x+s*v.z,v.y,-s*v.x+c*v.z);}',
'vec3 rotX(vec3 v,float a){float c=cos(a),s=sin(a);return vec3(v.x,c*v.y-s*v.z,s*v.y+c*v.z);}',
'float gSoft=0.;',
'vec3 sbox(vec3 d,vec3 c,vec3 r,vec2 hs,float soft,vec3 cc,vec3 ce){',
'  float z=dot(d,c);if(z<0.08)return vec3(0.);',
'  vec3 u=normalize(cross(c,r));vec3 rr=normalize(cross(u,c));',
'  vec2 q=vec2(dot(d,rr),dot(d,u))/z/hs;',
'  float sf=max(max(soft,gSoft),0.025);',
'  float m=(1.-smoothstep(1.-sf,1.+sf,abs(q.x)))*(1.-smoothstep(1.-sf,1.+sf,abs(q.y)));',
'  float g=clamp(dot(q,q)*0.5,0.,1.);',
'  return mix(cc,ce,g)*m/(1.+2.5*soft);}',
'vec3 env(vec3 d,float s){',
'  vec3 base=mix(BLACK*5.,PORC*0.46,uTheme);',
'  vec3 col=base*(0.5+0.9*smoothstep(-0.6,1.,d.y));',
'  col+=sbox(d,normalize(vec3(-0.93,0.14,0.34)),vec3(0.34,0.,0.93),vec2(0.55,1.0),s,BLUE_L*3.4,BLUE_D*8.);',
'  col+=sbox(d,normalize(vec3(0.84,0.12,0.50)),vec3(0.5,0.,-0.84),vec2(0.6,1.0),s,mix(GOLDL,PARCH,0.4)*3.0,GOLD*3.6);',
'  col+=sbox(d,normalize(vec3(0.1,0.55,0.83)),vec3(1.,0.,0.),vec2(1.7,1.2),0.7,PARCH*0.30,GOLD*0.16);',
'  col+=sbox(d,vec3(0.,0.96,0.28),vec3(1.,0.,0.),vec2(1.7,0.075),s,PARCH*16.,GOLDL*12.);',
'  col+=sbox(d,normalize(vec3(-0.9,0.25,0.15)),vec3(0.15,0.,0.9),vec2(1.5,1.8),0.9,BLUE_L*0.22,BLUE_D*0.30);',
'  col+=sbox(d,normalize(vec3(0.9,0.3,0.15)),vec3(0.15,0.,-0.9),vec2(1.5,1.6),0.9,GOLD*0.16,GOLD*0.05);',
'  float fl=smoothstep(0.02,-0.7,d.y);',
'  col+=mix(GOLD,PARCH,0.3)*mix(0.09,0.55,uTheme)*fl*(1.0+0.5*smoothstep(0.35,0.,abs(d.y+0.02)));',
'  return col;}',
'vec3 look(vec3 R){',
'  float k=smoothstep(0.,0.7,uRough);',
'  if(uAniso>0.01){vec3 s=vec3(0.);float w=0.;',
'    for(int i=-3;i<=3;i++){float fi=float(i);float wt=exp(-fi*fi*0.2);',
'      s+=wt*env(rotY(R,fi*0.19*uAniso),mix(0.05,0.32,k));w+=wt;}',
'    return s/w;}',
'  return mix(env(R,0.03),env(R,0.55),k);}',
'float hash(float n){return fract(sin(n*127.1)*43758.5453);}',
'float vn(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(hash(i),hash(i+1.),f);}',
'vec3 envRot(vec3 v){return rotX(rotY(v,uLight+uEnv.x),uEnv.y);}',
'vec3 shade(vec3 p,vec3 rd,float pw){',
'  vec3 n=calcNormal(p,max(0.03,pw*0.6));',
'  if(uGrain>0.){',
'    float f=min(2.2,0.34/pw);',
'    float g=vn(p.y*f)+0.5*vn(p.y*f*2.37+7.)+0.25*vn(p.y*f*0.41+3.);',
'    g=(g/1.75-0.5);',
'    vec3 up=vec3(0.,1.,0.);up-=n*dot(n,up);',
'    n=normalize(n+up*g*0.16*uGrain);}',
'  {vec3 ta=normalize(vec3(-n.z,0.,n.x)+vec3(1e-4,0.,0.));vec3 tm=cross(n,ta);float e=0.6,d0=map(p);',
'   float ka=abs(map(p+ta*e)-d0)*2./(e*e),km=abs(map(p+tm*e)-d0)*2./(e*e);',
'   gSoft=clamp(2.4*max(ka,km)*pw,0.,0.5);}',
'  vec3 R=reflect(rd,n);',
'  float NV=clamp(dot(n,-rd),0.,1.);',
'  vec3 F=uF0+(uFe-uF0)*pow(1.-NV,uFP);',
'  vec3 L=look(envRot(R));',
'  float k=smoothstep(0.,0.7,uRough);',
'  // secondary reflection: other parts of the cup seen in the surface',
'  vec3 o2=p+n*0.3;float t2=0.4;bool hit2=false;float mc=1e9,tcl=0.4;',
'  for(int i=0;i<28;i++){vec3 q=o2+R*t2;float d=map(q);float cc=d/t2;if(cc<mc){mc=cc;tcl=t2;}',
'    if(d<0.04+0.004*t2){hit2=true;break;}',
'    t2+=d*0.9;',
'    if((q.y>144.&&R.y>0.)||(t2>130.)||(length(q.xz)>60.&&dot(q.xz,R.xz)>0.))break;}',
'  float w2=hit2?1.:(1.-smoothstep(0.,0.03,mc));',
'  if(w2>0.002){vec3 q=o2+R*(hit2?t2:tcl);vec3 nh=calcNormal(q,0.06);vec3 R2=reflect(R,nh);',
'    float nv2=clamp(dot(nh,-R),0.,1.);vec3 F2=uF0+(uFe-uF0)*pow(1.-nv2,uFP);',
'    vec3 L2=look(envRot(R2))*F2*0.85;',
'    L=mix(L,L2,w2*(1.-0.55*k));}',
'  float ao=calcAO(p,n);',
'  vec3 col=F*L*uGain*mix(1.,ao,0.85);',
'  return col;}',
'vec3 tone(vec3 x){x*=0.9;return pow(clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.),vec3(1./2.2));}',
'bool bound(vec3 ro,vec3 rd,float y0,float y1,out float t0,out float t1){',
'  float a=dot(rd.xz,rd.xz),b=dot(ro.xz,rd.xz),c=dot(ro.xz,ro.xz)-56.*56.;',
'  float h=b*b-a*c;if(h<0.)return false;h=sqrt(h);',
'  float ta=(-b-h)/a,tb=(-b+h)/a;',
'  float ry=abs(rd.y)<1e-5?1e-5:rd.y;',
'  float ty0=(y0-ro.y)/ry,ty1=(y1-ro.y)/ry;',
'  t0=max(ta,min(ty0,ty1));t1=min(tb,max(ty0,ty1));',
'  return t1>max(t0,0.);}',
'float march(vec3 ro,vec3 rd,float t,float t1,float pa,out float cm,out float tc){',
'  cm=1e9;tc=t;',
'  for(int i=0;i<72;i++){',
'    float d=map(ro+rd*t);',
'    float px=pa*t;',
'    float c=d/px;if(c<cm){cm=c;tc=t;}',
'    if(d<0.3*px)return t;',
'    t+=d*0.72;',
'    if(t>t1)break;}',
'  return -1.;}',
'void main(){',
'  vec2 uv=(gl_FragCoord.xy-0.5*uRes)/(0.5*uRes.y);',
'  vec3 T=vec3(0.,69.4,0.);',
'  float ce=cos(uCam.y),se=sin(uCam.y);',
'  vec3 dir=vec3(sin(uCam.x)*ce,se,cos(uCam.x)*ce);',
'  vec3 ro=T+dir*uDist;vec3 fw=-dir;',
'  vec3 rt=normalize(cross(fw,vec3(0.,1.,0.)));vec3 up=cross(rt,fw);',
'  vec3 rd=normalize(fw+(uv.x*rt+uv.y*up)*uTanH);',
'  float pa=2.*uTanH/uRes.y;',
'  vec4 outc=vec4(0.);',
'  float t0,t1,cm,tc;',
'  bool inb=bound(ro,rd,-2.,142.,t0,t1);',
'  float t=-1.;',
'  if(inb){t0=max(t0,0.);t=march(ro,rd,t0,t1,pa,cm,tc);}',
'  if(t>0.){outc=vec4(tone(shade(ro+rd*t,rd,pa*t)),1.);}',
'  else {',
'    float a=0.;',
'    if(inb){a=clamp(1.-(cm-0.3),0.,1.);',
'      if(a>0.002){vec3 p=ro+rd*tc;outc=vec4(tone(shade(p,rd,pa*tc))*a,a);}}',
'    if(a<0.5&&rd.y<-0.001){',
'      float tf=-ro.y/rd.y;vec3 q=ro+rd*tf;',
'      if(length(q.xz)<190.){',
'        vec3 rr=vec3(rd.x,-rd.y,rd.z);vec3 ro2=q+vec3(0.,0.02,0.);',
'        float u0,u1;',
'        if(bound(ro2,rr,0.,17.,u0,u1)){',
'          float c2,tc2;float t2=march(ro2,rr,max(u0,0.),u1+2.,0.0009,c2,tc2);',
'          if(t2>0.){vec3 hp=ro2+rr*t2;',
'            float w=1.-smoothstep(1.5,15.,hp.y);w=w*w*0.5;',
'            vec3 sc=tone(shade(hp,rr,0.0009*t2));',
'            outc+=vec4(sc*w,w)*(1.-outc.a);}}}}',
'  }',
'  gl_FragColor=outc;}'
  ].join('\n');

  function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }

  var FIN = {
    polished: { f0: [0.70, 0.50, 0.26], fe: [0.92, 0.82, 0.58], gain: [1, 1, 1], rough: 0.03, aniso: 0, grain: 0, fp: 5 },
    brushed:  { f0: [0.62, 0.43, 0.22], fe: [0.82, 0.70, 0.46], gain: [1, 1, 1], rough: 0.36, aniso: 1, grain: 1, fp: 5 },
    chrome:   { f0: [0.15, 0.16, 0.19], fe: [0.80, 0.82, 0.88], gain: [1.9, 1.9, 1.9], rough: 0.01, aniso: 0, grain: 0, fp: 3 },
    steel:    { f0: [0.20, 0.28, 0.46], fe: [0.42, 0.47, 0.57], gain: [1.1, 1.1, 1.15], rough: 0.30, aniso: 0.35, grain: 0.35, fp: 4 }
  };

  function noopCtl() {
    return { finish: function () {}, theme: function () {}, pointer: function () {}, release: function () {}, destroy: function () {} };
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function mount(canvas, opts) {
    opts = opts || {};
    var parent = canvas.parentElement;
    function fail() {
      if (parent) parent.classList.add('fx-off');
      canvas.style.display = 'none';
      return noopCtl();
    }
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var spin = opts.spin !== false && !reduce;
    var fovDeg = opts.fov || 20;
    var scale = opts.scale || 1;

    var gl = null, prog = null, U = {}, buf = null;
    function init() {
      gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' });
      if (!gl) return false;
      function sh(type, src) {
        var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { if (window.console) console.warn('ISCCCUP shader:', gl.getShaderInfoLog(s)); return null; }
        return s;
      }
      var v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
      if (!v || !f) return false;
      prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      gl.useProgram(prog);
      buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uCam', 'uEnv', 'uLight', 'uTheme', 'uDist', 'uTanH', 'uRough', 'uAniso', 'uGrain', 'uFP', 'uF0', 'uFe', 'uGain'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
      gl.clearColor(0, 0, 0, 0);
      return true;
    }
    var ok = false;
    try { ok = init(); } catch (e) { ok = false; }
    if (!ok) return fail();

    // state
    var finName = FIN[opts.finish] ? opts.finish : 'polished';
    var cur = clone(FIN[finName]), from = clone(cur), to = clone(cur);
    var themeV = opts.theme === 'light' ? 1 : 0, themeFrom = themeV, themeTo = themeV;
    var trans = 1, transStart = 0;
    var ptr = { x: 0, y: 0 }, ptrT = { x: 0, y: 0 };
    var W = 2, H = 2, rafId = 0, running = false, visible = true, destroyed = false, lastNow = 0, t0 = 0;
    var hasFrame = false;

    function clone(o) { return JSON.parse(JSON.stringify(o)); }
    function mixP(a, b, t, out) {
      ['f0', 'fe', 'gain'].forEach(function (k) { for (var i = 0; i < 3; i++) out[k][i] = lerp(a[k][i], b[k][i], t); });
      ['rough', 'aniso', 'grain', 'fp'].forEach(function (k) { out[k] = lerp(a[k], b[k], t); });
    }

    function resize() {
      var cw = canvas.clientWidth || 300, ch = canvas.clientHeight || 300;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = cw * dpr, h = ch * dpr;
      var s = Math.min(1, 900 / Math.max(w, h));
      W = Math.max(2, Math.round(w * s)); H = Math.max(2, Math.round(h * s));
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      gl.viewport(0, 0, W, H);
    }

    function draw(now) {
      if (destroyed || !gl || gl.isContextLost()) return;
      var t = (now - t0) / 1000;
      var light = spin ? 12 * Math.PI / 180 * Math.sin(2 * Math.PI * t / 14) : 0;
      var aspect = W / H;
      var halfH = Math.max(101 / scale, 62 / aspect);
      var tanH = Math.tan(fovDeg * Math.PI / 360);
      var dist = halfH / tanH;
      var az = ptr.x * 4 * Math.PI / 180, el = (15 + ptr.y * 3) * Math.PI / 180;
      gl.uniform2f(U.uRes, W, H);
      gl.uniform2f(U.uCam, az, el);
      gl.uniform2f(U.uEnv, ptr.x * 10 * Math.PI / 180, -ptr.y * 6 * Math.PI / 180);
      gl.uniform1f(U.uLight, light);
      gl.uniform1f(U.uTheme, lerp(themeFrom, themeTo, trans < 1 ? ease(trans) : 1));
      gl.uniform1f(U.uDist, dist);
      gl.uniform1f(U.uTanH, tanH);
      gl.uniform1f(U.uRough, cur.rough);
      gl.uniform1f(U.uAniso, cur.aniso);
      gl.uniform1f(U.uGrain, cur.grain);
      gl.uniform1f(U.uFP, cur.fp);
      gl.uniform3fv(U.uF0, cur.f0);
      gl.uniform3fv(U.uFe, cur.fe);
      gl.uniform3fv(U.uGain, cur.gain);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      hasFrame = true;
    }

    function needsLoop() {
      if (reduce) return false;
      return spin || trans < 1 || Math.abs(ptr.x - ptrT.x) > 1e-3 || Math.abs(ptr.y - ptrT.y) > 1e-3;
    }

    function tick(now) {
      rafId = 0;
      if (destroyed || !visible || document.hidden) { running = false; return; }
      var dt = lastNow ? Math.min(0.1, (now - lastNow) / 1000) : 0.016;
      lastNow = now;
      if (trans < 1) {
        trans = Math.min(1, (now - transStart) / 600);
        mixP(from, to, ease(trans), cur);
      }
      var k = 1 - Math.exp(-dt / 0.2);
      ptr.x += (ptrT.x - ptr.x) * k; ptr.y += (ptrT.y - ptr.y) * k;
      if (Math.abs(ptr.x - ptrT.x) < 1e-3) ptr.x = ptrT.x;
      if (Math.abs(ptr.y - ptrT.y) < 1e-3) ptr.y = ptrT.y;
      draw(now);
      if (needsLoop()) rafId = requestAnimationFrame(tick); else running = false;
    }
    function start() {
      if (running || destroyed || !visible || document.hidden) return;
      if (!needsLoop()) return;
      running = true; lastNow = 0;
      rafId = requestAnimationFrame(tick);
    }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; }
    function renderStatic() { if (!destroyed && gl && !gl.isContextLost()) draw(performance.now()); }
    function refresh() { if (reduce || !running) { if (reduce || visible) renderStatic(); } start(); }

    t0 = performance.now();
    resize();
    renderStatic();
    start();

    var ro = null, io = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { resize(); renderStatic(); }); ro.observe(canvas); }
    else window.addEventListener('resize', onWinResize);
    function onWinResize() { resize(); renderStatic(); }
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(function (es) {
        visible = es[es.length - 1].isIntersecting;
        if (visible) { renderStatic(); start(); } else stop();
      });
      io.observe(canvas);
    }
    function onVis() { if (document.hidden) stop(); else { renderStatic(); start(); } }
    document.addEventListener('visibilitychange', onVis);
    function onLost(e) { e.preventDefault(); stop(); }
    function onRestored() { try { if (init()) { resize(); renderStatic(); start(); } else fail(); } catch (e) { fail(); } }
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    return {
      finish: function (name) {
        if (!FIN[name] || destroyed) return;
        finName = name;
        if (reduce) { cur = clone(FIN[name]); from = clone(cur); to = clone(cur); renderStatic(); return; }
        from = clone(cur); to = clone(FIN[name]);
        themeFrom = lerp(themeFrom, themeTo, trans < 1 ? ease(trans) : 1); themeTo = themeTo;
        trans = 0; transStart = performance.now(); start();
      },
      theme: function (name) {
        if (destroyed) return;
        var v = name === 'light' ? 1 : 0;
        if (reduce) { themeV = themeFrom = themeTo = v; trans = 1; renderStatic(); return; }
        themeFrom = lerp(themeFrom, themeTo, trans < 1 ? ease(trans) : 1);
        themeTo = v; from = clone(cur); to = clone(cur === null ? FIN[finName] : FIN[finName]);
        trans = 0; transStart = performance.now(); start();
      },
      pointer: function (nx, ny) {
        if (destroyed || reduce) return;
        ptrT.x = Math.max(-1, Math.min(1, +nx || 0)); ptrT.y = Math.max(-1, Math.min(1, +ny || 0)); start();
      },
      release: function () { ptrT.x = 0; ptrT.y = 0; start(); },
      destroy: function () {
        destroyed = true; stop();
        if (ro) ro.disconnect(); else window.removeEventListener('resize', onWinResize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        canvas.removeEventListener('webglcontextlost', onLost);
        canvas.removeEventListener('webglcontextrestored', onRestored);
        try { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) {}
      }
    };
  }

  window.ISCCCUP = { mount: mount };
})();
