// 3D view (D007): faceted low-poly meshes with low-res pixel textures, smooth real lighting, near top-down camera.
// Gameplay stays 2D: game coordinates are screen px; world units are cup radii (1 unit = cup.R px).
// World axes: x right, y up, z toward the player (screen down). The liquid surface is the fluid canvas as a texture.
import * as THREE from '../vendor/three-0.170.0.module.min.js';
import { TUNING } from './config.js';
import { GLTFLoader } from '../vendor/three-addons/loaders/GLTFLoader.js';
import { VERSION } from './version.js';

const V = () => TUNING.view3d;

// ---------- pixel textures painted in code ----------
function rng(seed){ let s = (seed*2654435761)>>>0 || 1; return () => { s ^= s<<13; s>>>=0; s ^= s>>>17; s ^= s<<5; s>>>=0; return s/4294967296; }; }
const hex = c => [(c>>16)&255, (c>>8)&255, c&255];

function makeTexture(w, h, paint, repeat){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); const img = g.createImageData(w, h);
  paint(img.data, w, h);
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if(repeat) t.repeat.set(repeat[0], repeat[1]);
  return t;
}
function put(d, k, rgb, f){ for(let i=0;i<3;i++) d[k+i] = Math.max(0, Math.min(255, Math.round(rgb[i]*f))); d[k+3] = 255; }

// flat colour with per-texel noise and coarse blotches (like the reference ceramics and skin)
function noisy(base, seed, amp=0.06, blotch=0.05, cell=4){
  amp *= V().grain; blotch *= V().grain;
  return (d, w, h) => {
    const r = rng(seed), b = hex(base), cw = Math.ceil(w/cell), coarse = [];
    for(let i=0;i<cw*Math.ceil(h/cell);i++) coarse.push(r()-0.5);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      put(d, (y*w+x)*4, b, 1 + (r()-0.5)*amp + coarse[Math.floor(y/cell)*cw + Math.floor(x/cell)]*blotch);
    }
  };
}
// brushed steel: vertical streaks
function steel(base, seed){
  return (d, w, h) => {
    const G = V().grain, r = rng(seed), b = hex(base), col = []; for(let x=0;x<w;x++) col.push((r()-0.5)*0.12*G);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) put(d, (y*w+x)*4, b, 1 + col[x] + (r()-0.5)*0.05*G + 0.06*Math.sin(y*0.35));
  };
}
// long walnut planks along x: one-texel seams, one plank end per row, soft wavy grain
function wood(seed){
  const tones = [0x7a5638, 0x6e4e33, 0x80603f, 0x664831].map(hex);
  return (d, w, h) => {
    const r = rng(seed), plank = 8, offs = [], ends = [];
    for(let p=0;p<Math.ceil(h/plank);p++){ offs.push(r()*10); ends.push(Math.floor(r()*w)); }
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const p = Math.floor(y/plank), base = tones[p % tones.length];
      const G = V().grain;
      let f = 1 + 0.06*G*Math.sin(x*0.3 + offs[p] + 0.8*Math.sin(y*0.9 + offs[p])) + (r()-0.5)*0.06*G;
      if(y % plank === 0) f *= 0.8;
      if(x === ends[p] && y % plank !== 0) f *= 0.82;
      put(d, (y*w+x)*4, base, f);
    }
  };
}
// shirt fabric: faint woven checks
function fabric(base, seed){
  return (d, w, h) => {
    const r = rng(seed), b = hex(base);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      let f = 1 + (r()-0.5)*0.12; if(x % 4 === 0) f *= 0.9; if(y % 4 === 0) f *= 1.08;
      put(d, (y*w+x)*4, b, f);
    }
  };
}

// ---------- faceted geometry ----------
function lathe(profile, segments){
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);
  return g;
}
function mat(map, opts={}){
  return new THREE.MeshStandardMaterial(Object.assign({ map, roughness: 0.75, metalness: 0.0, flatShading: true }, opts));
}
function shadowy(o){ o.traverse(m => { if(m.isMesh){ m.castShadow = true; m.receiveShadow = true; } }); return o; }

export class Scene3D {
  constructor(canvas, latteSource){
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = V().exposure;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(V().background);
    this.camera = new THREE.PerspectiveCamera(V().fov, 1, 0.5, 200);
    this.time = 0; this.reveal = 0; this.pitcherVis = 0; this.tilt = { x:0, z:0 };

    this.buildLights();
    this.buildTable();
    this.buildCup(latteSource);
    this.buildPitcher();
    this.buildStream();
    this.resize();
    this.assets = [];   // names of Blender assets that replaced the code-built ones
    if(!/[?&]assets=0/.test(location.search)) this.loadAssets();
  }

  buildLights(){
    const s = this.scene;
    s.add(new THREE.HemisphereLight(0xfff1dd, 0x4a3524, V().ambient));
    const sun = this.sun = new THREE.DirectionalLight(0xffe4c0, V().sun);
    sun.position.set(-5, 11, -4); sun.target.position.set(0.3, 0, 0.3);
    sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 30;
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4;
    s.add(sun); s.add(sun.target);
  }

  buildTable(){
    const tex = makeTexture(64, 32, wood(7), [V().tableRepeat/2, V().tableRepeat]);
    const table = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), mat(tex, { roughness: 0.85, flatShading: false }));
    table.rotation.x = -Math.PI/2; table.receiveShadow = true;
    this.scene.add(table); this.tableProc = table;
  }

  buildCup(latteSource){
    const seg = V().cupSegments;
    const ceramic = makeTexture(32, 32, noisy(0xebe6dd, 3, 0.05, 0.05), [6, 2]);
    const ceramicMat = mat(ceramic, { roughness: 0.45 });
    // Inner radius is exactly 1.0 at liquid height (y = LIQ), so the fluid disk (radius 1) matches the wall polygon.
    const LIQ = 0.86;
    const cupProfile = [[0,0],[0.74,0],[0.8,0.06],[1.0,0.5],[1.12,0.96],[1.13,1.03],[1.08,1.06],[1.04,1.05],[1.03,1.0],[1.0,LIQ],[0.94,0.6],[0.72,0.24],[0,0.2]];
    const saucerProfile = [[0,-0.12],[0.9,-0.12],[1.35,-0.08],[1.7,0.02],[1.76,0.08],[1.68,0.09],[1.3,0.0],[0.86,-0.02],[0,-0.02]];

    this.cupRoot = new THREE.Group();          // translation only (follows the game's cup position)
    this.cupTilt = new THREE.Group();          // visual tilt from the phone, pivot at the liquid centre
    this.cupRoot.add(this.cupTilt);
    const body = this.cupBody = new THREE.Group(); body.position.y = -LIQ;   // so the pivot is the liquid surface centre
    this.cupTilt.add(body);
    body.add(new THREE.Mesh(lathe(cupProfile, seg), ceramicMat));
    const saucerMat = mat(makeTexture(32, 32, noisy(0xe2dccf, 4, 0.05, 0.05), [8, 2]), { roughness: 0.5 });
    const saucer = new THREE.Mesh(lathe(saucerProfile, seg), saucerMat); body.add(saucer);
    // handle: low-poly half torus on the +x side
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.075, 4, 6, Math.PI), ceramicMat);
    handle.position.set(1.12, 0.55, 0); handle.rotation.z = -Math.PI/2; body.add(handle);
    shadowy(body);

    // liquid: level surface (does not tilt), same polygon as the wall
    this.latteTex = new THREE.CanvasTexture(latteSource);
    this.latteTex.magFilter = THREE.NearestFilter; this.latteTex.minFilter = THREE.NearestFilter;
    this.latteTex.generateMipmaps = false; this.latteTex.colorSpace = THREE.SRGBColorSpace;
    const disk = new THREE.Mesh(new THREE.CircleGeometry(1.0, seg), new THREE.MeshStandardMaterial({ map: this.latteTex, roughness: 0.55 }));
    disk.rotation.x = -Math.PI/2; disk.receiveShadow = true;
    this.liquid = new THREE.Group(); this.liquid.add(disk);
    this.cupRoot.add(this.liquid);

    this.cupRoot.position.y = V().cupLift + LIQ;
    this.scene.add(this.cupRoot);
  }

  buildPitcher(){
    const seg = V().pitcherSegments;
    // no environment map, so keep metalness low: a high value renders almost black
    const steelTex = makeTexture(32, 32, steel(0xc3c8cc, 11), [4, 2]);
    const steelMat = mat(steelTex, { roughness: 0.42, metalness: 0.12 });
    const prof = [[0,0],[0.52,0],[0.56,0.08],[0.55,0.7],[0.46,1.12],[0.48,1.3],[0.45,1.31],[0.43,1.14],[0.51,0.7],[0.5,0.12],[0,0.1]];
    const g = lathe(prof, seg);
    // pull a spout out of the rim on local +x
    const pos = g.attributes.position;
    for(let i=0;i<pos.count;i++){
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      if(y < 1.0) continue;
      const w = Math.pow(Math.max(0, Math.cos(Math.atan2(z, x))), 4) * Math.min(1, (y-1.0)/0.3);
      pos.setXYZ(i, x*(1 + 0.55*w), y + 0.12*w, z*(1 - 0.25*w));
    }
    g.computeVertexNormals();
    this.spoutLocal = new THREE.Vector3(0.48*1.55, 1.42, 0);

    this.pitcherRoot = new THREE.Group();   // yaw + position
    this.pitcherTilt = new THREE.Group();   // pour tilt about local z
    this.pitcherRoot.add(this.pitcherTilt);
    const jug = new THREE.Mesh(g, steelMat); this.pitcherTilt.add(jug);
    // foam visible inside
    const foamTex = makeTexture(16, 16, noisy(0xf3ece0, 5, 0.05, 0.04));
    const foam = new THREE.Mesh(new THREE.CircleGeometry(0.44, seg), mat(foamTex, { roughness: 0.9 }));
    foam.rotation.x = -Math.PI/2; foam.position.y = 1.08; this.pitcherTilt.add(foam);
    // handle on -x
    const dark = mat(makeTexture(16, 16, steel(0x9aa1a7, 13)), { roughness: 0.45, metalness: 0.1 });
    const hb = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.14), dark); hb.position.set(-0.78, 0.68, 0); this.pitcherTilt.add(hb);
    for(const y of [0.98, 0.38]){ const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.09, 0.12), dark); c.position.set(-0.64, y, 0); this.pitcherTilt.add(c); }
    this.pitcherTilt.add(this.buildHand());
    this.pitcherProc = [...this.pitcherTilt.children];
    shadowy(this.pitcherRoot);
    this.scene.add(this.pitcherRoot);
  }

  // blocky hand gripping the handle, arm leaving the frame (built from boxes, like the reference people)
  buildHand(){
    const skin = mat(makeTexture(16, 16, noisy(0xc89a7a, 21, 0.08, 0.07)), { roughness: 0.8 });
    const sleeve = mat(makeTexture(16, 32, fabric(0x34485a, 23), [2, 3]), { roughness: 0.95 });
    const cuff = mat(makeTexture(16, 16, noisy(0xe3dccf, 25, 0.06, 0.05)), { roughness: 0.9 });
    // origin = middle of the handle bar (pitcher local x = -0.78); +x points at the jug. Scaled up 1.3x.
    const hand = new THREE.Group(); hand.position.set(-0.8, 0.7, 0); hand.scale.setScalar(1.3);
    const box = (w, h, d, m, x, y, z, rz=0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.z = rz; hand.add(b); return b; };
    box(0.2, 0.46, 0.4, skin, -0.13, 0.0, 0.0);                                      // back of the hand, outside the handle
    for(let i=0;i<4;i++) box(0.26, 0.095, 0.1, skin, 0.03, 0.17 - i*0.115, 0.21);   // four fingers wrapped round the front
    box(0.28, 0.1, 0.11, skin, 0.03, 0.29, -0.07, -0.2);                             // thumb over the top of the handle
    box(0.24, 0.34, 0.36, skin, -0.32, 0.05, 0.0, 0.2);                              // wrist
    box(0.12, 0.42, 0.42, cuff, -0.47, 0.11, 0.0, 0.35);                             // shirt cuff
    // tapered forearm (6-sided), thicker toward the elbow, long enough to leave the frame
    const len = 3.4, dir = new THREE.Vector2(-Math.cos(0.35), -Math.sin(0.35));
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.19, len, 6), sleeve);
    arm.position.set(-0.5 + dir.x*len/2, 0.11 + dir.y*len/2, 0); arm.rotation.z = Math.PI/2 + 0.35;
    hand.add(arm);
    return hand;
  }

  buildStream(){
    const milk = this.milkMat = new THREE.MeshStandardMaterial({ color: 0xf0e4cf, roughness: 0.5, flatShading: true });
    // the stream is a short tube along a curve, rebuilt each frame (8 x 5 segments, cheap)
    this.stream = new THREE.Mesh(new THREE.BufferGeometry(), milk);
    this.stream.castShadow = true;
    this.splash = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.02, 6), milk);
    this.scene.add(this.stream, this.splash);
    // white cubes that pop when the milk lands outside the sweet spot
    this.bits = [];
    const bitGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
    for(let i=0;i<18;i++){ const b = new THREE.Mesh(bitGeo, milk); b.visible = false; b.userData = { life: 0, v: new THREE.Vector3() }; this.scene.add(b); this.bits.push(b); }
  }

  // Blender assets (art/blender/build_assets.py -> assets/models/*.glb). Each one replaces its code-built
  // stand-in once it has loaded; if a file fails, the stand-in stays. ?assets=0 forces the stand-ins.
  async loadAssets(){
    const loader = new GLTFLoader();
    const load = async name => {
      const g = await loader.loadAsync(`assets/models/${name}.glb?v=${VERSION}`);
      g.scene.traverse(o => {
        if(!o.isMesh) return;
        o.castShadow = true; o.receiveShadow = true;
        const m = o.material;
        if(m && m.map){ m.map.magFilter = THREE.NearestFilter; m.map.minFilter = THREE.NearestFilter; m.map.generateMipmaps = false; m.map.needsUpdate = true; }
      });
      g.scene.updateMatrixWorld(true);
      return g.scene;
    };
    const tryLoad = async (name, apply) => {
      try { apply(await load(name)); this.assets.push(name); }
      catch(e){ console.warn(`asset ${name} not loaded, keeping the code-built stand-in`, e); }
    };
    await Promise.all([
      tryLoad('table', s => { this.tableProc.visible = false; s.traverse(o => { if(o.isMesh) o.castShadow = false; }); this.scene.add(s); }),
      tryLoad('cup', s => { for(const c of this.cupBody.children) c.visible = false; this.cupBody.add(s); }),
      tryLoad('pitcher', s => {
        const j = n => s.getObjectByName(n);
        const joints = { grip: j('grip'), thumb: j('thumb'), wrist: j('wrist'), fingers: [0, 1, 2, 3].map(i => j('finger_' + i)).filter(Boolean) };
        if(joints.grip){
          this.joints = joints; this.jointRest = new Map();
          for(const o of [joints.grip, joints.thumb, joints.wrist, ...joints.fingers]) if(o) this.jointRest.set(o, { p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone() });
          if(this.pose) this.applyPose(this.pose);
        }
        const tip = s.getObjectByName('spout_tip');
        if(tip) this.spoutLocal = new THREE.Vector3().setFromMatrixPosition(tip.matrixWorld);
        for(const c of this.pitcherProc) c.visible = false;
        this.pitcherTilt.add(s);
      }),
      tryLoad('customer_hand', s => { s.visible = false; this.customerHand = s; this.scene.add(s); })   // for the transitions (not wired yet)
    ]);
  }

  // Hand pose (KIT_ADOPTION Q8): degrees per joint, offsets in pitcher units. The owner sets these with ?pose=1;
  // the chosen pose is committed to assets/poses/hand.json and applied on every load.
  setPose(p){ this.pose = Object.assign({ fingerCurl: 0, thumbSwing: 0, thumbLift: 0, wristPitch: 0, wristYaw: 0, handRoll: 0, gripY: 0, scale: 1 }, p); if(this.joints) this.applyPose(this.pose); }
  applyPose(p){
    const D = THREE.MathUtils.degToRad, J = this.joints, rest = this.jointRest;
    const set = (o, e, dp, sc) => {
      if(!o) return; const r = rest.get(o);
      o.position.copy(r.p); if(dp) o.position.add(dp);
      o.quaternion.copy(r.q).multiply(new THREE.Quaternion().setFromEuler(e));
      o.scale.copy(r.s); if(sc) o.scale.multiplyScalar(sc);
    };
    set(J.grip, new THREE.Euler(0, D(p.handRoll), 0), new THREE.Vector3(0, p.gripY, 0), p.scale);
    for(const f of J.fingers) set(f, new THREE.Euler(0, D(p.fingerCurl), 0));
    set(J.thumb, new THREE.Euler(0, D(p.thumbSwing), D(p.thumbLift)));
    set(J.wrist, new THREE.Euler(0, D(p.wristYaw), D(p.wristPitch)));
  }

  resize(){
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    // distance that fits the play width (and a minimum height) at the look target
    const vt = Math.tan(THREE.MathUtils.degToRad(V().fov/2)), ht = vt * this.camera.aspect;
    this.dist = Math.max((V().frameWidth/2)/ht, (V().frameHeight/2)/vt);
  }

  // g: { cup, home, pitcher, state, dt, outside }
  render(g){
    const dt = g.dt, R = g.cup.R, v = V();
    const toWorld = (px, py) => [(px - g.home.x)/R, (py - g.home.y)/R];
    const k = 1 - Math.exp(-8*dt);

    // cup position and visual tilt (liquid stays level)
    const [cx, cz] = toWorld(g.cup.x, g.cup.y);
    this.cupRoot.position.x = cx; this.cupRoot.position.z = cz;
    const tx = g.state === 'pour' ? (g.cup.tiltX || 0) : 0, ty = g.state === 'pour' ? (g.cup.tiltY || 0) : 0;
    const lim = v.tiltMax;
    this.tilt.z += (THREE.MathUtils.clamp(-tx*v.tiltVisual, -lim, lim) - this.tilt.z)*k;
    this.tilt.x += (THREE.MathUtils.clamp(ty*v.tiltVisual, -lim, lim) - this.tilt.x)*k;
    this.cupTilt.rotation.set(THREE.MathUtils.degToRad(this.tilt.x), 0, THREE.MathUtils.degToRad(this.tilt.z));
    this.latteTex.needsUpdate = true;

    // pitcher: the stream lands on the (assisted) landing point; the spout sits above it
    const P = g.pitcher;
    this.pitcherVis += ((P ? 1 : 0) - this.pitcherVis)*(1 - Math.exp(-5*dt));
    const surfY = this.cupRoot.position.y;
    let land = this.lastLand || new THREE.Vector3(0, surfY, -0.25);
    let flow = 0, h = 0.9, prep = 0, prepDir = [0,0];
    if(P){
      const [lx, lz] = toWorld(P.ix !== undefined ? P.ix : P.x, P.iy !== undefined ? P.iy : P.y);
      land = new THREE.Vector3(lx, surfY, lz); this.lastLand = land;
      flow = P.flow; h = P.h; prep = P.prep || 0; prepDir = P.prepDir || [0,0];
    }
    const back = prep ? Math.sin(prep*Math.PI) : 0;
    // K02: the jug body swings with the wrist wiggle so the motion reads from above; the spout is re-solved onto the stream below
    const lx = P ? (P.x - g.home.x)/R : 0;
    const vxw = this.lastLx === undefined ? 0 : (lx - this.lastLx)/Math.max(dt, 1e-3);
    this.lastLx = lx;
    this.swing = (this.swing || 0) + (THREE.MathUtils.clamp(vxw*v.swingYaw, -v.swingMax, v.swingMax) - (this.swing || 0))*(1 - Math.exp(-12*dt));
    this.pitcherRoot.rotation.y = v.pitcherYaw + this.swing;
    this.pitcherTilt.rotation.x = this.swing*0.6;
    this.pitcherTilt.rotation.z = -(v.tiltIdle + v.tiltPour*flow*(1 - 0.4*h) - 0.15*back);
    this.pitcherRoot.position.set(0, 0, 0); this.pitcherRoot.updateMatrixWorld(true);
    const tip = this.pitcherTilt.localToWorld(this.spoutLocal.clone());
    // the spout sits behind the landing point (toward the far side), so the near top-down camera sees the stream
    const want = land.clone().add(new THREE.Vector3(v.spoutBack[0] - prepDir[0]*0.1*back, v.spoutHeight + v.spoutHeightH*h + 0.08*back, v.spoutBack[1] - prepDir[1]*0.1*back));
    const hide = (1 - this.pitcherVis);
    want.add(new THREE.Vector3(3.5*hide, 4.0*hide, -3.0*hide));
    this.pitcherRoot.position.copy(want.sub(tip));
    this.pitcherRoot.updateMatrixWorld(true);
    const tipNow = this.pitcherTilt.localToWorld(this.spoutLocal.clone());

    // stream
    const pouring = flow > 0.02 && this.pitcherVis > 0.9;
    this.stream.visible = this.splash.visible = pouring;
    if(pouring){
      const rad = (0.018 + 0.045*flow*(1 - 0.55*h)) * (1 + 0.08*Math.sin(this.time*31));
      // milk leaves the spout moving toward the cup, then falls: a quadratic arc from the tip to the landing point
      const ctrl = new THREE.Vector3(land.x + (tipNow.x - land.x)*0.15, tipNow.y + 0.05, land.z + (tipNow.z - land.z)*0.15);
      const curve = new THREE.QuadraticBezierCurve3(tipNow, ctrl, land);
      this.stream.geometry.dispose();
      const TS = 8, RS = 5, tube = new THREE.TubeGeometry(curve, TS, rad, RS, false);
      // taper: full width at the spout, 55% at the surface, with a small wobble along the fall
      const pos = tube.attributes.position, c = new THREE.Vector3(), q = new THREE.Vector3();
      for(let i=0;i<=TS;i++){
        curve.getPointAt(i/TS, c);
        const sc = (1 - 0.45*i/TS) * (1 + 0.12*Math.sin(this.time*27 + i*1.7));
        for(let j=0;j<=RS;j++){ const k = i*(RS+1) + j; q.fromBufferAttribute(pos, k).sub(c).multiplyScalar(sc).add(c); pos.setXYZ(k, q.x, q.y, q.z); }
      }
      tube.computeVertexNormals();
      this.stream.geometry = tube;
      this.splash.position.set(land.x, surfY + 0.012, land.z);
      const sr = rad*1.9 + 0.01*Math.sin(this.time*23); this.splash.scale.set(sr, 1, sr);
    }
    // splash bits when outside the sweet spot
    if(g.outside && pouring){
      for(let n=0;n<2;n++){
        const b = this.bits.find(x => x.userData.life <= 0); if(!b) break;
        const a = Math.random()*Math.PI*2, sp = 0.6 + Math.random()*0.8;
        b.position.copy(land); b.userData.life = 0.45; b.userData.v.set(Math.cos(a)*sp, 1.2 + Math.random(), Math.sin(a)*sp); b.visible = true;
      }
    }
    for(const b of this.bits){
      if(b.userData.life <= 0){ b.visible = false; continue; }
      b.userData.life -= dt; b.userData.v.y -= 6*dt;
      b.position.addScaledVector(b.userData.v, dt);
      const s = Math.max(0.2, b.userData.life/0.45); b.scale.setScalar(s);
    }

    // camera: near top-down; on reveal, move in over the cup
    this.reveal += ((g.state === 'reveal' ? 1 : 0) - this.reveal)*(1 - Math.exp(-3*dt));
    const e = this.reveal;
    const pitch = THREE.MathUtils.degToRad(v.pitch + (v.revealPitch - v.pitch)*e);
    const dist = this.dist*(1 - e*(1 - v.revealZoom));
    const target = new THREE.Vector3(
      v.lookAt[0]*(1-e) + cx*e,
      v.lookAt[1]*(1-e) + surfY*e,
      v.lookAt[2]*(1-e) + (cz + v.revealShift)*e);   // shift so the cup sits above the result card
    if(this.closeUp && this.joints){   // pose tool: close-up on the hand
      this.joints.grip.getWorldPosition(target);
      const cp = THREE.MathUtils.degToRad(55), cd = 5;
      this.camera.position.set(target.x + 1.2, target.y + Math.sin(cp)*cd, target.z + Math.cos(cp)*cd);
      this.camera.lookAt(target); this.time += dt; this.renderer.render(this.scene, this.camera); return;
    }
    this.camera.position.set(target.x, target.y + Math.sin(pitch)*dist, target.z + Math.cos(pitch)*dist);
    this.camera.lookAt(target);

    this.time += dt;
    this.renderer.render(this.scene, this.camera);
  }
}
