/* ISCC FX - rendered light and smoke. WebGL1, no dependencies.
   window.ISCCFX = { beams(canvas, opts), smoke(canvas, opts) }            */
(function () {
  'use strict';

  var VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

  var NOISE = [
    'float hash(vec2 p){p=fract(p*vec2(443.897,441.423));p+=dot(p,p.yx+19.19);return fract((p.x+p.y)*p.x);}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*f*(f*(f*6.-15.)+10.);',
    ' float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));',
    ' return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}',
    'const mat2 RM=mat2(0.8,-0.6,0.6,0.8);',
    'float fbm3(vec2 p){float v=0.,a=.5;for(int i=0;i<3;i++){v+=a*vn(p);p=RM*p*2.03+vec2(17.1,9.7);a*=.5;}return v/.875;}',
    'float fbm4(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*vn(p);p=RM*p*2.03+vec2(17.1,9.7);a*=.5;}return v/.9375;}',
    'float fbm5(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*vn(p);p=RM*p*2.03+vec2(17.1,9.7);a*=.5;}return v/.96875;}'
  ].join('\n');

  var HEAD = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';

  /* ---------------------------------------------------------------- beams */
  var BEAMS_FRAG = HEAD + NOISE + [
    'uniform vec2 uRes;uniform float uT,uAspect,uIntensity,uL,uFlash;uniform vec2 uTarget;',
    'uniform vec4 uS[6];uniform vec2 uK[6];',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;uv.y=1.-uv.y;',
    ' vec2 p=vec2(uv.x*uAspect,uv.y);',
    ' vec2 T=uTarget;',
    ' vec3 acc=vec3(0.),mul=vec3(1.);float bS=0.,gS=0.,aS=0.;',
    ' float hz=.7+.6*fbm3(p*1.7+vec2(uT*.015,-uT*.01));',
    ' for(int i=0;i<6;i++){',
    '  vec4 S=uS[i];vec2 K=uK[i];float fi=float(i);',
    '  vec2 o=vec2(S.x*uAspect,S.y);',
    '  vec2 tg=T+vec2(sin(fi*2.3),cos(fi*1.9))*.03;',
    '  vec2 dv=tg-o;float L=length(dv);dv/=L;',
    '  float ang=.035*sin(uT*.314+S.w);float cs=cos(ang),sn=sin(ang);',
    '  vec2 d=vec2(dv.x*cs-dv.y*sn,dv.x*sn+dv.y*cs);',
    '  vec2 v=p-o;float along=dot(v,d);float perp=d.x*v.y-d.y*v.x;',
    '  float a=perp/max(along,.08);',
    '  float hw=S.z*(1.+.08*sin(uT*.23+S.w*1.7));',
    '  float u=a/hw;',
    '  float mG=1.-smoothstep(.25,1.25,abs(u));',
    '  float mR=1.-smoothstep(.25,1.25,abs(u+.035));',
    '  float mB=1.-smoothstep(.25,1.25,abs(u-.035));',
    '  float n=fbm3(vec2(u*3.4+S.w*3.,along*1.3-uT*.05));',
    '  float st=.22+1.45*smoothstep(.22,.78,n);',
    '  float fall=smoothstep(0.,.3,along)*mix(.5,1.,smoothstep(0.,L,along))*exp(-max(along-L,0.)*2.6);',
    '  float base=fall*st*hz*K.y*uIntensity;',
    '  vec3 I=base*vec3(mR,mG,mB);',
    '  float isB=1.-step(.5,K.x);float isG=step(.5,K.x)*(1.-step(1.5,K.x));float isA=step(1.5,K.x);',
    '  vec3 c=isB*vec3(.282,.408,.643)+isG*vec3(.788,.643,.298)+isA*vec3(.604,.639,.698);',
    '  vec3 tn=isB*vec3(.46,.56,.76)+isG*vec3(.50,.38,.10)+isA*vec3(.66,.68,.74);',
    '  acc+=c*I;',
    '  mul*=1.-(1.-tn)*clamp(I,0.,1.2)*.72;',
    '  bS+=isB*I.g;gS+=isG*I.g;aS+=isA*I.g;',
    ' }',
    ' float ov=clamp(2.*bS*gS/(bS+gS+.05),0.,1.5);',
    ' float all=bS+gS+aS;',
    ' vec2 tp=(p-T)*vec2(1.,1.25);float r=length(tp);',
    ' float meet=clamp(all*.7,0.,1.);',
    ' float halo=(exp(-r*r*22.)*.45+exp(-r*3.)*.16)*(.4+.6*meet);',
    /* dust */
    ' float dust=0.;',
    ' for(int l=0;l<2;l++){',
    '  float sc=l==0?22.:38.;float sp=l==0?.10:.17;',
    '  vec2 g=p*sc+vec2(uT*.03*float(l+1),-uT*sp);',
    '  vec2 id=floor(g);vec2 f=fract(g)-.5;float h=hash(id+float(l)*9.3);',
    '  vec2 jit=vec2(hash(id+3.1),hash(id+7.7))-.5;',
    '  vec2 pos=jit*.5+vec2(sin(uT*.3+h*6.28),cos(uT*.23+h*9.))*.14;',
    '  float tw=.5+.5*sin(uT*.8+h*30.);',
    '  dust+=step(.55,h)*smoothstep(.075-.02*float(l),0.,length(f-pos))*(.4+.6*tw);',
    ' }',
    ' float dv2=dust*clamp(all,0.,1.2);',
    ' float grain=hash(gl_FragCoord.xy+fract(uT*.37)*61.7)-.5;',
    ' vec2 vv=uv-.5;',
    /* dark: additive light on stage */
    ' vec3 acd=acc;',
    ' acd+=vec3(.894,.812,.604)*ov*.45+vec3(.937,.914,.855)*ov*ov*.25;',
    ' vec3 hc=mix(vec3(.282,.408,.643),vec3(.788,.643,.298),smoothstep(-.4,.4,tp.x));',
    ' acd+=vec3(.93,.86,.68)*halo*.9+hc*exp(-r*1.5)*.25*meet;',
    ' acd+=vec3(.93,.88,.76)*dv2*1.5;',
    ' acd=acd*.5+vec3(.894,.812,.604)*uFlash*(.22+halo*.9+all*.4);',
    ' vec3 g0=vec3(.027,.035,.051);',
    ' vec3 dcol=g0+(1.-exp(-acd*1.05))*(vec3(.937,.914,.855)-g0);',
    ' dcol*=1.-.55*dot(vv,vv);',
    ' dcol+=grain*.045;',
    /* light: multiply light on porcelain */
    ' vec3 G=vec3(.914,.882,.804);',
    ' vec3 lcol=G*mul;',
    ' float w=clamp(smoothstep(.0,2.2,ov)*.4+halo*.9,0.,1.);',
    ' lcol=mix(lcol,vec3(.972,.953,.90),w*w*.8);',
    ' lcol=mix(lcol,vec3(1.,.98,.94),clamp(dv2*.7,0.,.7));',
    ' lcol=mix(lcol,vec3(.99,.97,.92),uFlash*.45*(.4+meet));',
    ' lcol*=1.-.14*dot(vv,vv);',
    ' lcol+=grain*.035;',
    ' gl_FragColor=vec4(mix(dcol,lcol,uL),1.);',
    '}'
  ].join('\n');

  /* ---------------------------------------------------------------- smoke */
  var SMOKE_FRAG = HEAD + NOISE + [
    'uniform vec2 uRes;uniform float uT,uAspect,uDensity,uL,uPtrK;uniform vec2 uPtr;uniform vec4 uHoles[8];',
    'float gRing=0.;',
    'float holes(float d,vec2 pp,float nz,float nq){',
    ' for(int i=0;i<8;i++){vec4 h=uHoles[i];if(h.w>=0.){',
    '  float open=1.-pow(1.-clamp(h.w/.15,0.,1.),3.);',
    '  float rf=clamp(h.w/5.,0.,1.);',
    '  float R=h.z*open*(1.-.5*rf*rf);',
    '  float e=length(pp-h.xy)+(nz-.5)*R*.42+(nq-.5)*R*.3+(fbm3(pp*11.+h.xy*7.)-.5)*R*.5;',
    '  float clear=(1.-smoothstep(R*.62,R*1.02,e))*(1.-rf*rf*rf);',
    '  float ring=smoothstep(R*.8,R*1.05,e)*(1.-smoothstep(R*1.05,R*1.45,e))*open*(1.-rf);',
    '  gRing=max(gRing,ring*.7);',
    '  d=clamp(d+ring*.4,0.,1.)*(1.-clear);',
    ' }}',
    ' return d;',
    '}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;uv.y=1.-uv.y;',
    ' vec2 p=vec2(uv.x*uAspect,uv.y);',
    ' vec2 s=p*2.5;float t=uT;',
    ' vec2 w=vec2(fbm3(s*.6+vec2(0.,t*.02)),fbm3(s*.6+vec2(5.2,1.3)-vec2(t*.015,0.)))-.5;',
    ' vec2 dr=vec2(t*.012,-t*.02);',
    ' vec2 base=s+.5*w+dr;',
    ' float f0=fbm5(base);',
    ' float dd=smoothstep(.36,.66,f0);',
    ' vec2 le=normalize(vec2(-1.,-1.))*.06*2.5;',
    ' float tau=0.;',
    ' for(int k=1;k<4;k++){tau+=smoothstep(.36,.66,fbm4(base+le*float(k)))*(1.-.18*float(k));}',
    ' float lit=exp(-tau*1.15);',
    ' float d0=clamp(dd*uDensity,0.,1.);',
    ' float dn=uPtrK*(1.-smoothstep(0.,.08,length(p-uPtr)));',
    ' d0*=1.-.55*dn;',
    ' d0=holes(d0,p,f0,w.x+.5);',
    ' lit=mix(lit,1.,gRing*.9);',
    ' float key=clamp(1.-length(uv)*.6,0.,1.);',
    ' float core=smoothstep(.45,1.,dd);',
    ' vec3 gw=vec3(.894,.812,.604),go=vec3(.788,.643,.298),bl=vec3(.082,.161,.306),bk=vec3(.02,.03,.06);',
    ' vec3 sh=mix(bk,bl*.55,(1.-core*.6)*.7+key*.3);',
    ' vec3 lc=mix(go,gw,lit)*(.4+.75*key);',
    ' vec3 dk=sh+lc*lit*(.75+.6*(1.-core*.4));',
    ' dk+=vec3(.28,.41,.64)*.08*(1.-lit)*key;',
    ' vec3 lt=mix(vec3(.66,.70,.79),vec3(.985,.97,.93),smoothstep(.0,.9,lit*(.55+.55*key)));',
    ' float al=d0*mix(.94,.9,uL);',
    ' vec3 col=mix(dk,lt,uL);',
    ' float gr=hash(gl_FragCoord.xy+fract(t*.37)*61.7)-.5;',
    ' col=clamp(col+gr*.03,0.,1.);',
    ' gl_FragColor=vec4(col*al,al);',
    '}'
  ].join('\n');

  /* -------------------------------------------------------------- runtime */
  function noopCtl(kind) {
    var c = { theme: function () {}, destroy: function () {} };
    if (kind === 'beams') { c.pointer = function () {}; c.release = function () {}; c.flash = function () {}; }
    else { c.punch = function () {}; c.pointer = function () {}; }
    return c;
  }

  function Runtime(canvas, cfg) {
    var self = this, gl = null, prog = null, raf = 0, last = 0, t = 0;
    var visible = true, destroyed = false, ro = null, io = null, mq = null, loc = {};
    self.ok = false; self.reduced = false; self.gl = null;
    canvas.setAttribute('data-fx-canvas', '');

    function fail() {
      var par = canvas.parentElement;
      if (par) par.classList.add('fx-off');
      canvas.style.display = 'none';
      self.ok = false;
    }
    function compile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        if (window.console) console.error('ISCCFX shader:', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }
    function build() {
      var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, cfg.frag);
      if (!vs || !fs) return false;
      prog = gl.createProgram();
      gl.attachShader(prog, vs); gl.attachShader(prog, fs);
      gl.bindAttribLocation(prog, 0, 'a');
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        if (window.console) console.error('ISCCFX link:', gl.getProgramInfoLog(prog));
        return false;
      }
      var buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.useProgram(prog);
      loc = {};
      cfg.uniforms.forEach(function (n) { loc[n] = gl.getUniformLocation(prog, n); });
      return true;
    }
    try {
      var attrs = { alpha: cfg.alpha, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' };
      gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs);
    } catch (e) { gl = null; }
    if (!gl || !build()) { fail(); return; }
    self.gl = gl; self.loc = loc; self.ok = true;
    if (cfg.alpha) { gl.clearColor(0, 0, 0, 0); }

    function resize() {
      var r = canvas.getBoundingClientRect();
      var cw = r.width || canvas.clientWidth || 300, ch = r.height || canvas.clientHeight || 150;
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = cw * dpr, h = ch * dpr, s = Math.min(1, 1280 / Math.max(w, h));
      w = Math.max(2, Math.round(w * s)); h = Math.max(2, Math.round(h * s));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      self.w = w; self.h = h;
      gl.viewport(0, 0, w, h);
    }
    function draw(T) {
      if (!gl || gl.isContextLost()) return;
      gl.useProgram(prog);
      gl.uniform2f(loc.uRes, self.w, self.h);
      gl.uniform1f(loc.uT, T);
      gl.uniform1f(loc.uAspect, self.w / self.h);
      cfg.set(gl, loc, self.w / self.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function active() { return !destroyed && visible && !document.hidden; }
    function frame(now) {
      raf = 0;
      if (!active()) return;
      var dt = Math.min(0.1, Math.max(0, (now - last) / 1000)); last = now;
      if (self.reduced) { cfg.update(0, true); draw(cfg.staticTime); return; }
      t += dt; cfg.update(dt, false); draw(t);
      raf = requestAnimationFrame(frame);
    }
    self.request = function () {
      if (raf || !active()) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    function onVis() { if (active()) self.request(); }
    function onLost(e) { e.preventDefault(); }
    function onRestored() { if (build()) { resize(); self.request(); } }
    function onMq() { self.reduced = !!(mq && mq.matches); self.request(); }
    function onWin() { resize(); self.request(); }

    try { mq = window.matchMedia('(prefers-reduced-motion: reduce)'); self.reduced = mq.matches; } catch (e) { mq = null; }
    if (mq) { if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq); }
    if (window.ResizeObserver) { ro = new ResizeObserver(function () { resize(); self.request(); }); ro.observe(canvas); }
    else window.addEventListener('resize', onWin);
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(function (en) {
        visible = en[en.length - 1].isIntersecting;
        if (visible) self.request();
      });
      io.observe(canvas);
    }
    document.addEventListener('visibilitychange', onVis);
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    resize();
    self.request();

    self.destroy = function () {
      if (destroyed) return;
      destroyed = true;
      if (raf) cancelAnimationFrame(raf); raf = 0;
      if (ro) ro.disconnect(); else window.removeEventListener('resize', onWin);
      if (io) io.disconnect();
      if (mq) { if (mq.removeEventListener) mq.removeEventListener('change', onMq); else if (mq.removeListener) mq.removeListener(onMq); }
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      try { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } catch (e) {}
    };
  }

  function themeVal(n) { return n === 'light' ? 1 : 0; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  /* ---------------------------------------------------------- beams API */
  function beams(canvas, opts) {
    opts = opts || {};
    var home = opts.target || [0.5, 0.78];
    var intensity = opts.intensity == null ? 1 : opts.intensity;
    var goal = [home[0], home[1]], cur = [home[0], home[1]];
    var themeGoal = themeVal(opts.theme), themeMix = themeGoal;
    var flashT0 = -1;
    /* x, y (normalised, above/outside top), tan half-width, phase | type, strength */
    var SH = [
      [-0.08, -0.30, 0.085, 0.0, 0, 1.0], [0.20, -0.42, 0.060, 1.9, 0, 0.9],
      [1.08, -0.30, 0.090, 3.3, 1, 1.0], [0.80, -0.42, 0.060, 4.6, 1, 0.9],
      [0.50, -0.45, 0.050, 2.6, 2, 0.45], [0.64, -0.38, 0.032, 5.9, 1, 0.85]
    ];
    var uS = new Float32Array(24), uK = new Float32Array(12);
    SH.forEach(function (s, i) {
      uS[i * 4] = s[0]; uS[i * 4 + 1] = s[1]; uS[i * 4 + 2] = s[2]; uS[i * 4 + 3] = s[3];
      uK[i * 2] = s[4]; uK[i * 2 + 1] = s[5];
    });
    var flashV = 0;
    var rt = new Runtime(canvas, {
      frag: BEAMS_FRAG, alpha: false, staticTime: 7.0,
      uniforms: ['uRes', 'uT', 'uAspect', 'uIntensity', 'uL', 'uFlash', 'uTarget', 'uS', 'uK'],
      update: function (dt, reduced) {
        if (reduced) { cur[0] = goal[0]; cur[1] = goal[1]; themeMix = themeGoal; flashV = 0; return; }
        var k = 1 - Math.exp(-dt / 0.23);
        cur[0] += (goal[0] - cur[0]) * k; cur[1] += (goal[1] - cur[1]) * k;
        themeMix += (themeGoal - themeMix) * (1 - Math.exp(-dt / 0.12));
        if (Math.abs(themeGoal - themeMix) < 0.002) themeMix = themeGoal;
        if (flashT0 >= 0) {
          var d = (performance.now() - flashT0) / 1000;
          if (d < 0.08) { var x = d / 0.08; flashV = x * x * (3 - 2 * x); }
          else { flashV = Math.exp(-(d - 0.08) * 4.6); if (flashV < 0.01) { flashV = 0; flashT0 = -1; } }
        }
      },
      set: function (gl, loc, aspect) {
        gl.uniform1f(loc.uIntensity, intensity);
        gl.uniform1f(loc.uL, themeMix);
        gl.uniform1f(loc.uFlash, 0.8 * flashV);
        gl.uniform2f(loc.uTarget, cur[0] * aspect, cur[1]);
        gl.uniform4fv(loc.uS, uS);
        gl.uniform2fv(loc.uK, uK);
      }
    });
    if (!rt.ok) return noopCtl('beams');
    return {
      pointer: function (nx, ny) { goal[0] = clamp01(nx); goal[1] = clamp01(ny); rt.request(); },
      release: function () { goal[0] = home[0]; goal[1] = home[1]; rt.request(); },
      flash: function () { if (rt.reduced) return; flashT0 = performance.now(); rt.request(); },
      theme: function (n) { themeGoal = themeVal(n); rt.request(); },
      destroy: function () { rt.destroy(); }
    };
  }

  /* ---------------------------------------------------------- smoke API */
  function smoke(canvas, opts) {
    opts = opts || {};
    var density = opts.density == null ? 1 : opts.density;
    var themeGoal = themeVal(opts.theme), themeMix = themeGoal;
    var holes = [], timers = [];
    var goal = [0, 0], cur = [0, 0], ptrOn = false, ptrK = 0;
    var arr = new Float32Array(32);
    function now() { return performance.now() / 1000; }
    var rt = new Runtime(canvas, {
      frag: SMOKE_FRAG, alpha: true, staticTime: 11.0,
      uniforms: ['uRes', 'uT', 'uAspect', 'uDensity', 'uL', 'uPtrK', 'uPtr', 'uHoles'],
      update: function (dt, reduced) {
        var n = now();
        holes = holes.filter(function (h) { return h.t0 === null || n - h.t0 < 5; });
        if (reduced) { themeMix = themeGoal; cur[0] = goal[0]; cur[1] = goal[1]; ptrK = ptrOn ? 1 : 0; return; }
        themeMix += (themeGoal - themeMix) * (1 - Math.exp(-dt / 0.12));
        if (Math.abs(themeGoal - themeMix) < 0.002) themeMix = themeGoal;
        var k = 1 - Math.exp(-dt / 0.18);
        cur[0] += (goal[0] - cur[0]) * k; cur[1] += (goal[1] - cur[1]) * k;
        ptrK += ((ptrOn ? 1 : 0) - ptrK) * (1 - Math.exp(-dt / 0.15));
      },
      set: function (gl, loc, aspect) {
        var n = now(), i;
        for (i = 0; i < 8; i++) {
          var h = holes[i];
          if (h) {
            if (h.t0 === null) { h.t0 = n; timers.push(setTimeout(function () { rt.request(); }, 5050)); }
            arr[i * 4] = h.x * aspect; arr[i * 4 + 1] = h.y; arr[i * 4 + 2] = h.r;
            /* reduced motion: static cleared hole (age fixed at fully open) */
            arr[i * 4 + 3] = rt.reduced ? 0.4 : n - h.t0;
          } else { arr[i * 4] = 0; arr[i * 4 + 1] = 0; arr[i * 4 + 2] = 0; arr[i * 4 + 3] = -1; }
        }
        gl.uniform4fv(loc.uHoles, arr);
        gl.uniform1f(loc.uDensity, density);
        gl.uniform1f(loc.uL, themeMix);
        gl.uniform1f(loc.uPtrK, ptrK);
        gl.uniform2f(loc.uPtr, cur[0] * aspect, cur[1]);
      }
    });
    if (!rt.ok) return noopCtl('smoke');
    return {
      punch: function (nx, ny, r) {
        var h = { x: nx, y: ny, r: r == null ? 0.12 : r, t0: null };
        if (holes.length >= 8) holes.shift();
        holes.push(h);
        rt.request();
      },
      pointer: function (nx, ny) {
        var on = nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1;
        if (on && !ptrOn) { cur[0] = nx; cur[1] = ny; }
        ptrOn = on; if (on) { goal[0] = nx; goal[1] = ny; }
        rt.request();
      },
      theme: function (n) { themeGoal = themeVal(n); rt.request(); },
      destroy: function () { timers.forEach(clearTimeout); timers = []; rt.destroy(); }
    };
  }

  window.ISCCFX = { beams: beams, smoke: smoke };
})();
