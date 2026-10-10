// WebGL2 stable-fluids simulation for the cup surface.
// Velocity is in UV units per second (1 UV = cup diameter).
// Dye channel R = milk foam amount (0..1).

const VERT = `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vUv, vL, vR, vT, vB;
uniform vec2 uTexel;
void main(){
  vUv = aPos*0.5+0.5;
  vL = vUv - vec2(uTexel.x,0.0); vR = vUv + vec2(uTexel.x,0.0);
  vT = vUv + vec2(0.0,uTexel.y); vB = vUv - vec2(0.0,uTexel.y);
  gl_Position = vec4(aPos,0.0,1.0);
}`;

const HEAD = `#version 300 es
precision highp float; precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB;
out vec4 frag;
uniform vec2 uCupShape;
float cupMask(vec2 uv){ vec2 p=(uv-0.5)*2.0/uCupShape; return 1.0-smoothstep(0.95,1.0,length(p)); }
`;

const FRAG = {
  clear: HEAD + `uniform sampler2D uTex; uniform float uValue;
void main(){ frag = uValue*texture(uTex,vUv); }`,

  curl: HEAD + `uniform sampler2D uVel;
void main(){ float L=texture(uVel,vL).y, R=texture(uVel,vR).y, T=texture(uVel,vT).x, B=texture(uVel,vB).x;
  frag=vec4(0.5*(R-L-T+B),0.0,0.0,1.0); }`,

  vorticity: HEAD + `uniform sampler2D uVel, uCurl; uniform float uCurlStr, uDt;
void main(){ float L=texture(uCurl,vL).x, R=texture(uCurl,vR).x, T=texture(uCurl,vT).x, B=texture(uCurl,vB).x, C=texture(uCurl,vUv).x;
  vec2 force = 0.5*vec2(abs(T)-abs(B), abs(R)-abs(L)); force /= length(force)+1e-4; force *= uCurlStr*C; force.y *= -1.0;
  vec2 vel = texture(uVel,vUv).xy + force*uDt; frag=vec4(vel*cupMask(vUv),0.0,1.0); }`,

  divergence: HEAD + `uniform sampler2D uVel;
void main(){ float L=texture(uVel,vL).x, R=texture(uVel,vR).x, T=texture(uVel,vT).y, B=texture(uVel,vB).y; vec2 C=texture(uVel,vUv).xy;
  if(vL.x<0.0) L=-C.x; if(vR.x>1.0) R=-C.x; if(vT.y>1.0) T=-C.y; if(vB.y<0.0) B=-C.y;
  frag=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`,

  pressure: HEAD + `uniform sampler2D uPressure, uDiv;
void main(){ float L=texture(uPressure,vL).x, R=texture(uPressure,vR).x, T=texture(uPressure,vT).x, B=texture(uPressure,vB).x;
  float div=texture(uDiv,vUv).x; frag=vec4((L+R+B+T-div)*0.25,0.0,0.0,1.0); }`,

  gradient: HEAD + `uniform sampler2D uPressure, uVel;
void main(){ float L=texture(uPressure,vL).x, R=texture(uPressure,vR).x, T=texture(uPressure,vT).x, B=texture(uPressure,vB).x;
  vec2 vel=texture(uVel,vUv).xy - vec2(R-L, T-B); frag=vec4(vel*cupMask(vUv),0.0,1.0); }`,

  // Semi-Lagrangian advection. uPush adds a compressible radial displacement (used for dye only)
  // so milk visibly spreads outward from the impact point and shoves older foam aside.
  advect: HEAD + `uniform sampler2D uVel, uSource; uniform float uDt, uDissipation, uMask;
uniform vec2 uPush; uniform float uPushR, uPushStr, uPushR0;
uniform vec2 uFwd; uniform float uConv, uConvW, uConvL;
void main(){
  vec2 vel = texture(uVel,vUv).xy;
  vec2 d = vUv - uPush; float r2 = dot(d,d); float r = sqrt(r2);
  // 像 2D 面積守恆的擴散：速度 ∝ 1/r（近處封頂），遠處再用高斯衰減。舊奶泡被往外推但層與層的間隔不會被追上。
  vec2 push = d/(r+1e-4) * uPushStr * (uPushR0/max(r,uPushR0)) * exp(-r2/uPushR);
  // 輸送帶：壺嘴前方一條窄帶裡的表面奶泡被往前帶（不經過壓力投影，所以不會捲成兩個渦）。
  // 搖晃時每一段奶被帶開、疊在前一段後面，形成葉子（rosetta）。
  float along = dot(d, uFwd), across = dot(d, vec2(-uFwd.y, uFwd.x));
  push += uFwd * uConv * exp(-across*across/(uConvW*uConvW)) * smoothstep(-0.02, 0.02, along) * exp(-along*along/(uConvL*uConvL));
  vec2 coord = vUv - uDt*(vel+push);
  vec4 res = texture(uSource, coord) / (1.0 + uDissipation*uDt);
  frag = mix(res, res*cupMask(vUv), uMask); }`,

  // Dye is RG: R = milk amount, G = which pour (layer id) the milk came from, mass-weighted where pours mix.
  splat: HEAD + `uniform sampler2D uTarget; uniform vec2 uPoint; uniform vec3 uColor; uniform float uRadius, uMode, uLayer;
void main(){ vec2 p=vUv-uPoint; float s=exp(-dot(p,p)/uRadius); vec3 base=texture(uTarget,vUv).xyz;
  if(uMode>0.5){
    float add = s*uColor.x, r0 = base.x;
    // fresh milk wells up from below and owns the surface where it lands (sharp layer boundaries);
    // only the faint tail of the splat blends, by mass
    float own = smoothstep(0.15, 0.5, s);
    float g = mix((base.y*r0 + uLayer*add) / max(r0 + add, 1e-4), uLayer, own);
    frag = vec4(min(r0 + add, 1.0), g, 0.0, 1.0); return;
  }
  vec3 v = (base + s*uColor) * cupMask(vUv);
  frag=vec4(v,1.0); }`,

  force: HEAD + `uniform sampler2D uVel; uniform vec2 uForce; uniform float uDt;
void main(){ frag=vec4((texture(uVel,vUv).xy + uForce*uDt)*cupMask(vUv),0.0,1.0); }`,

  display: HEAD + `uniform sampler2D uDye; uniform vec3 uCoffee, uMilk, uEdge; uniform float uTarget; uniform vec4 uTargetEll; uniform vec2 uTexel;
uniform float uPixel, uOut, uLayerLine; uniform vec3 uCrema;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  if(uPixel > 0.5){
    // Pixel mode: the canvas is uOut x uOut, so one fragment = one texel of the latte surface.
    // Average the dye over the texel, step the milk amount into a few tones, add fixed per-texel noise.
    // 3x3 taps inside the texel. Coffee wins over milk (min), so the thin coffee lines between layers survive
    // the downsampling; texels that straddle a milk/coffee boundary get the edge tone.
    float s = 0.33/uOut; vec2 cell = floor(vUv*uOut);
    float dsum = 0.0, dmin = 1e3, dmax = -1e3, gmin = 1e3, gmax = -1e3;
    for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++){
      vec2 t = texture(uDye, vUv + vec2(float(i), float(j))*s).xy; dsum += t.x; dmin = min(dmin, t.x); dmax = max(dmax, t.x);
      if(t.x > 0.3){ gmin = min(gmin, t.y); gmax = max(gmax, t.y); } }
    float dp = mix(dsum/9.0, dmin, 0.65);
    float mp = floor(smoothstep(0.14, 0.42, dp)*4.0 + 0.5)/4.0;
    // coffee tones: darker toward the cup wall; a crema halo where a little milk sits just under the surface
    float rr0 = length((vUv - 0.5)*2.0);
    vec3 coffee = uCoffee*(1.0 + (hash(floor(cell/3.0)) - 0.5)*0.18) * mix(1.0, 0.72, smoothstep(0.7, 1.0, rr0));
    vec3 crema = uCrema*(1.0 + (hash(floor(cell/2.0) + 7.0) - 0.5)*0.12);
    coffee = mix(coffee, crema, smoothstep(0.02, 0.12, dsum/9.0)*0.85);
    vec3 cp = mix(coffee, uMilk, mp);
    if(mp > 0.2 && mp < 0.8) cp = mix(cp, uEdge, 0.35);
    if(dmax > 0.3 && dmin < 0.2) cp = mix(cp, uEdge*0.8, 0.45);
    // Layer line, one pixel wide: this texel is milk and a neighbouring milk texel belongs to a lower layer id.
    // One-sided (only the higher side draws), so a boundary never becomes a 2-pixel brown band.
    if(mp > 0.4){
      vec2 c0 = texture(uDye, vUv).xy; float o = 1.0/uOut; float hit = 0.0;
      vec2 n1 = texture(uDye, vUv + vec2(o, 0.0)).xy, n2 = texture(uDye, vUv - vec2(o, 0.0)).xy;
      vec2 n3 = texture(uDye, vUv + vec2(0.0, o)).xy, n4 = texture(uDye, vUv - vec2(0.0, o)).xy;
      if(n1.x > 0.3 && c0.y - n1.y > uLayerLine) hit = 1.0;
      if(n2.x > 0.3 && c0.y - n2.y > uLayerLine) hit = 1.0;
      if(n3.x > 0.3 && c0.y - n3.y > uLayerLine) hit = 1.0;
      if(n4.x > 0.3 && c0.y - n4.y > uLayerLine) hit = 1.0;
      cp = mix(cp, uEdge*0.7, 0.8*hit);
    }
    cp *= 1.0 + (hash(cell) - 0.5)*0.09;
    if(uTarget>0.0){ // faint dashed guide ring (UI, not latte art); brighter while the stream is inside
      vec2 q=(vUv-uTargetEll.xy)/uTargetEll.zw; float rr=length(q);
      float tw = 0.8/(uOut*min(uTargetEll.z, uTargetEll.w));
      float dash = step(0.5, fract(atan(q.y, q.x)*3.8197));
      cp = mix(cp, vec3(0.95, 0.9, 0.8), step(abs(rr-1.0), tw)*dash*0.3*min(uTarget, 1.6)); }
    frag = vec4(cp, 1.0); return;
  }
  float d = texture(uDye,vUv).x;
  float dx = texture(uDye, vUv+vec2(uTexel.x,0.0)).x - texture(uDye, vUv-vec2(uTexel.x,0.0)).x;
  float dy = texture(uDye, vUv+vec2(0.0,uTexel.y)).x - texture(uDye, vUv-vec2(0.0,uTexel.y)).x;
  float m = smoothstep(0.16, 0.42, d);
  float edge = smoothstep(0.06,0.16,d)*(1.0-smoothstep(0.16,0.3,d));
  vec3 col = mix(uCoffee, uMilk, m);
  col = mix(col, uEdge, edge*0.6);
  { // layer lines (2D mode): where milk from different pours meets
    vec2 a = texture(uDye, vUv+vec2(uTexel.x,0.0)).xy, b = texture(uDye, vUv-vec2(uTexel.x,0.0)).xy;
    vec2 c = texture(uDye, vUv+vec2(0.0,uTexel.y)).xy, e = texture(uDye, vUv-vec2(0.0,uTexel.y)).xy;
    float both = step(0.3, min(min(a.x,b.x), min(c.x,e.x)));
    float lg = max(abs(a.y-b.y), abs(c.y-e.y));
    col = mix(col, uEdge*0.7, both*smoothstep(uLayerLine*0.25, uLayerLine*0.6, lg)*0.8); }
  float band = m*(1.0-m)*4.0;
  float shade = clamp(1.0 + (-dx*0.35 + dy*0.9)*1.4*band, 0.9, 1.08);
  col *= shade;
  vec2 p=(vUv-0.5)*2.0/uCupShape; float r=length(p);
  col *= 1.0 - 0.3*smoothstep(0.78,1.0,r);
  if(uTarget>0.0){ vec2 q=(vUv-uTargetEll.xy)/uTargetEll.zw; float rr=length(q);
    float ring=1.0-smoothstep(0.0,0.06,abs(rr-1.0)); float fill = 1.0-step(1.0,rr);
    col += (ring*0.3 + fill*0.06)*uTarget*vec3(1.0,0.93,0.75); }
  frag=vec4(col,1.0); }`
};

function compile(gl, type, src){
  const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader: '+gl.getShaderInfoLog(sh)+'\n'+src.split('\n').slice(0,40).join('\n'));
  return sh;
}
class Program {
  constructor(gl, vs, fsSrc){
    this.gl = gl; this.prog = gl.createProgram();
    gl.attachShader(this.prog, vs); gl.attachShader(this.prog, compile(gl, gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(this.prog);
    if(!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) throw new Error('link: '+gl.getProgramInfoLog(this.prog));
    this.u = {}; const n = gl.getProgramParameter(this.prog, gl.ACTIVE_UNIFORMS);
    for(let i=0;i<n;i++){ const name = gl.getActiveUniform(this.prog,i).name; this.u[name] = gl.getUniformLocation(this.prog, name); }
  }
  use(){ this.gl.useProgram(this.prog); return this; }
}

function supportsRender(gl, internalFormat, format, type){
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
  const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.deleteFramebuffer(fbo); gl.deleteTexture(tex); return ok;
}
function pickFormat(gl, internalFormat, format, type){
  if(supportsRender(gl, internalFormat, format, type)) return {internalFormat, format};
  if(internalFormat===gl.R16F) return pickFormat(gl, gl.RG16F, gl.RG, type);
  if(internalFormat===gl.RG16F) return pickFormat(gl, gl.RGBA16F, gl.RGBA, type);
  return null;
}

function createFBO(gl, w, h, fmt, type, filter){
  const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, fmt.internalFormat, w, h, 0, fmt.format, type, null);
  const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.viewport(0,0,w,h); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  return { tex, fbo, w, h, texel:[1/w,1/h], attach(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; } };
}
function createDouble(gl, w, h, fmt, type, filter){
  let a = createFBO(gl,w,h,fmt,type,filter), b = createFBO(gl,w,h,fmt,type,filter);
  return { w, h, texel:a.texel, get read(){return a;}, get write(){return b;}, swap(){ const t=a; a=b; b=t; } };
}

export class Fluid {
  constructor(canvas, opts={}){
    this.canvas = canvas;
    this.opts = Object.assign({ simRes:128, dyeRes:384, pressureIters:20, curl:4,
      velDissipation:1.6, dyeDissipation:0.0, cupShape:[1,1], layerLine:0.12, crema:[0.56,0.36,0.21],
      coffee:[0.36,0.21,0.11], milk:[0.96,0.93,0.87], edge:[0.55,0.36,0.2] }, opts);
    const gl = canvas.getContext('webgl2', { alpha:false, depth:false, stencil:false, antialias:false, preserveDrawingBuffer:false, powerPreference:'high-performance' });
    if(!gl) throw new Error('no-webgl2');
    this.gl = gl;
    const extF = gl.getExtension('EXT_color_buffer_float');
    const extHF = extF ? null : gl.getExtension('EXT_color_buffer_half_float');
    if(!extF && !extHF) throw new Error('no-float-render');
    const type = gl.HALF_FLOAT;
    this.fmtR = pickFormat(gl, gl.R16F, gl.RED, type);
    this.fmtRG = pickFormat(gl, gl.RG16F, gl.RG, type);
    if(!this.fmtR || !this.fmtRG) throw new Error('no-float-format');
    this.type = type;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    this.p = {}; for(const k in FRAG) this.p[k] = new Program(gl, vs, FRAG[k]);

    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    this.vao = vao;
    this.initFBOs();
    this.pendingSplats = [];
    this.push = { x:0.5, y:0.5, r:0.04, str:0, r0:0.03 };
    this.force = [0,0];
  }
  initFBOs(){
    const gl=this.gl, o=this.opts, s=o.simRes, d=o.dyeRes;
    this.velocity = createDouble(gl, s, s, this.fmtRG, this.type, gl.LINEAR);
    this.dye = createDouble(gl, d, d, this.fmtRG, this.type, gl.LINEAR);
    this.divergence = createFBO(gl, s, s, this.fmtR, this.type, gl.NEAREST);
    this.curl = createFBO(gl, s, s, this.fmtR, this.type, gl.NEAREST);
    this.pressure = createDouble(gl, s, s, this.fmtR, this.type, gl.NEAREST);
  }
  reset(){
    const gl=this.gl;
    for(const t of [this.velocity.read, this.velocity.write, this.dye.read, this.dye.write, this.pressure.read, this.pressure.write]){
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); gl.viewport(0,0,t.w,t.h); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.pendingSplats.length = 0; this.push.str = 0; this.force=[0,0];
  }
  blit(target){
    const gl=this.gl;
    if(target){ gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); gl.viewport(0,0,target.w,target.h); }
    else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight); }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  // x,y in UV (0..1). vx,vy velocity in UV/s. dyeR / velR are gaussian sigma in UV. amount: dye per call.
  // layer: id of the current pour (0..1); each new pour gets a distinct value so its boundary with older milk shows
  splat(x, y, vx, vy, velR, dyeR, amount, layer=0.5){ this.pendingSplats.push({x,y,vx,vy,velR,dyeR,amount,layer}); }
  setPush(x, y, sigma, strength, r0){ this.push.x=x; this.push.y=y; this.push.r=sigma*sigma; this.push.str=strength; this.push.r0=r0||0.03; }
  // conveyor ahead of the pour point: fwd = unit direction in UV, strength in UV/s, w = half width, l = reach
  setConveyor(fx, fy, strength, w, l){ this.conv = { fx, fy, s: strength, w, l }; }
  setForce(fx, fy){ this.force=[fx,fy]; }

  step(dt){
    const gl=this.gl, o=this.opts, p=this.p; gl.disable(gl.BLEND); gl.bindVertexArray(this.vao);
    const shape = o.cupShape;
    const V=this.velocity;
    // vorticity
    p.curl.use(); gl.uniform2fv(p.curl.u.uTexel, V.texel); gl.uniform2fv(p.curl.u.uCupShape, shape);
    gl.uniform1i(p.curl.u.uVel, V.read.attach(0)); this.blit(this.curl);
    p.vorticity.use(); gl.uniform2fv(p.vorticity.u.uTexel, V.texel); gl.uniform2fv(p.vorticity.u.uCupShape, shape);
    gl.uniform1i(p.vorticity.u.uVel, V.read.attach(0)); gl.uniform1i(p.vorticity.u.uCurl, this.curl.attach(1));
    gl.uniform1f(p.vorticity.u.uCurlStr, o.curl); gl.uniform1f(p.vorticity.u.uDt, dt); this.blit(V.write); V.swap();
    // body force
    if(this.force[0]!==0 || this.force[1]!==0){
      p.force.use(); gl.uniform2fv(p.force.u.uTexel, V.texel); gl.uniform2fv(p.force.u.uCupShape, shape);
      gl.uniform1i(p.force.u.uVel, V.read.attach(0)); gl.uniform2fv(p.force.u.uForce, this.force); gl.uniform1f(p.force.u.uDt, dt);
      this.blit(V.write); V.swap();
    }
    // splats
    if(this.pendingSplats.length){
      p.splat.use(); gl.uniform2fv(p.splat.u.uCupShape, shape);
      for(const s of this.pendingSplats){
        gl.uniform2fv(p.splat.u.uTexel, V.texel);
        gl.uniform1i(p.splat.u.uTarget, V.read.attach(0)); gl.uniform2f(p.splat.u.uPoint, s.x, s.y);
        gl.uniform3f(p.splat.u.uColor, s.vx, s.vy, 0); gl.uniform1f(p.splat.u.uRadius, s.velR*s.velR); gl.uniform1f(p.splat.u.uMode, 0);
        this.blit(V.write); V.swap();
        if(s.amount>0){
          gl.uniform2fv(p.splat.u.uTexel, this.dye.texel);
          gl.uniform1i(p.splat.u.uTarget, this.dye.read.attach(0));
          gl.uniform3f(p.splat.u.uColor, s.amount, 0, 0); gl.uniform1f(p.splat.u.uRadius, s.dyeR*s.dyeR); gl.uniform1f(p.splat.u.uMode, 1);
          gl.uniform1f(p.splat.u.uLayer, s.layer);
          this.blit(this.dye.write); this.dye.swap();
        }
      }
      this.pendingSplats.length = 0;
    }
    // projection
    p.divergence.use(); gl.uniform2fv(p.divergence.u.uTexel, V.texel); gl.uniform2fv(p.divergence.u.uCupShape, shape);
    gl.uniform1i(p.divergence.u.uVel, V.read.attach(0)); this.blit(this.divergence);
    p.clear.use(); gl.uniform1i(p.clear.u.uTex, this.pressure.read.attach(0)); gl.uniform1f(p.clear.u.uValue, 0.8); this.blit(this.pressure.write); this.pressure.swap();
    p.pressure.use(); gl.uniform2fv(p.pressure.u.uTexel, V.texel); gl.uniform2fv(p.pressure.u.uCupShape, shape);
    gl.uniform1i(p.pressure.u.uDiv, this.divergence.attach(0));
    for(let i=0;i<o.pressureIters;i++){ gl.uniform1i(p.pressure.u.uPressure, this.pressure.read.attach(1)); this.blit(this.pressure.write); this.pressure.swap(); }
    p.gradient.use(); gl.uniform2fv(p.gradient.u.uTexel, V.texel); gl.uniform2fv(p.gradient.u.uCupShape, shape);
    gl.uniform1i(p.gradient.u.uPressure, this.pressure.read.attach(0)); gl.uniform1i(p.gradient.u.uVel, V.read.attach(1)); this.blit(V.write); V.swap();
    // advect velocity
    p.advect.use(); gl.uniform2fv(p.advect.u.uTexel, V.texel); gl.uniform2fv(p.advect.u.uCupShape, shape);
    gl.uniform1f(p.advect.u.uDt, dt); gl.uniform1f(p.advect.u.uPushStr, 0); gl.uniform2f(p.advect.u.uPush, 0.5,0.5); gl.uniform1f(p.advect.u.uPushR, 1); gl.uniform1f(p.advect.u.uPushR0, 0.03);
    gl.uniform1f(p.advect.u.uConv, 0); gl.uniform2f(p.advect.u.uFwd, 0, -1); gl.uniform1f(p.advect.u.uConvW, 0.1); gl.uniform1f(p.advect.u.uConvL, 0.3);   // velocity: no conveyor
    gl.uniform1i(p.advect.u.uVel, V.read.attach(0)); gl.uniform1i(p.advect.u.uSource, V.read.attach(0));
    gl.uniform1f(p.advect.u.uDissipation, o.velDissipation); gl.uniform1f(p.advect.u.uMask, 1); this.blit(V.write); V.swap();
    // advect dye (with compressible radial push from the milk stream)
    gl.uniform2fv(p.advect.u.uTexel, this.dye.texel);
    gl.uniform1i(p.advect.u.uVel, V.read.attach(0)); gl.uniform1i(p.advect.u.uSource, this.dye.read.attach(1));
    gl.uniform1f(p.advect.u.uDissipation, o.dyeDissipation); gl.uniform1f(p.advect.u.uMask, 0);
    gl.uniform2f(p.advect.u.uPush, this.push.x, this.push.y); gl.uniform1f(p.advect.u.uPushR, this.push.r); gl.uniform1f(p.advect.u.uPushStr, this.push.str); gl.uniform1f(p.advect.u.uPushR0, this.push.r0);
    const cv = this.conv || { fx:0, fy:-1, s:0, w:0.1, l:0.3 };
    gl.uniform2f(p.advect.u.uFwd, cv.fx, cv.fy); gl.uniform1f(p.advect.u.uConv, cv.s); gl.uniform1f(p.advect.u.uConvW, cv.w); gl.uniform1f(p.advect.u.uConvL, cv.l);
    this.blit(this.dye.write); this.dye.swap();
  }
  render(showTarget, ell){
    const gl=this.gl, o=this.opts, p=this.p; gl.bindVertexArray(this.vao);
    p.display.use(); gl.uniform2fv(p.display.u.uTexel, this.dye.texel); gl.uniform2fv(p.display.u.uCupShape, o.cupShape);
    gl.uniform1i(p.display.u.uDye, this.dye.read.attach(0));
    gl.uniform3fv(p.display.u.uCoffee, o.coffee); gl.uniform3fv(p.display.u.uMilk, o.milk); gl.uniform3fv(p.display.u.uEdge, o.edge);
    gl.uniform1f(p.display.u.uTarget, showTarget); gl.uniform4f(p.display.u.uTargetEll, ell[0], ell[1], ell[2], ell[3]);
    gl.uniform1f(p.display.u.uPixel, this.pixelOut ? 1 : 0); gl.uniform1f(p.display.u.uOut, this.pixelOut || 1);
    gl.uniform1f(p.display.u.uLayerLine, o.layerLine); gl.uniform3fv(p.display.u.uCrema, o.crema);
    this.blit(null);
  }
  // Pixel mode for the 3D view: render the surface at n x n into this canvas (read back as a texture by three.js).
  setPixelOut(n){ this.pixelOut = n || 0; }
}
