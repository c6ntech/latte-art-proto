import { LEVEL, TUNING } from './config.js';
import { Fluid } from './fluid.js';
import { Tilt } from './input.js';
import { Scene } from './scene.js';
import { SteamSound } from './audio.js';
import { samplePattern } from './pattern.js';
import tulip from './patterns/tulip.js';

const $ = id => document.getElementById(id);
const params = new URLSearchParams(location.search);
const DEV = { mouse: params.get('mouse')==='1', auto: params.get('auto')==='1', hand: params.get('hand')==='1', play: params.get('play')==='1' };
// 模擬真人手持：微抖（3–6Hz，±1.2°）+ 慢慢偏（±3.5°，數十秒週期）；play=1 再加上一個有 0.3 秒反應延遲、每 0.25 秒修正一次的玩家
const hand = { phase: [Math.random()*6, Math.random()*6, Math.random()*6], cmd: {x:0,y:0}, target: {x:0,y:0}, nextDecision: 0, errHist: [] };
function handTilt(tNow, dt, err){
  const jx = 1.2*(Math.sin(2*Math.PI*3.1*tNow) + 0.6*Math.sin(2*Math.PI*6.3*tNow+1)), jy = 1.2*(Math.sin(2*Math.PI*2.7*tNow+2) + 0.6*Math.sin(2*Math.PI*5.1*tNow));
  const bx = 3.5*(Math.sin(2*Math.PI*0.05*tNow+hand.phase[0]) + 0.5*Math.sin(2*Math.PI*0.11*tNow+hand.phase[1])), by = 3.5*Math.sin(2*Math.PI*0.07*tNow+hand.phase[2]);
  if(DEV.play && err){
    hand.errHist.push({t:tNow, e:err}); while(hand.errHist.length && hand.errHist[0].t < tNow-0.3) hand.errHist.shift();
    if(tNow >= hand.nextDecision){ hand.nextDecision = tNow + 0.25; const d = hand.errHist[0] ? hand.errHist[0].e : err;
      hand.target.x = hand.cmd.x + d.x*settings.maxDeg*0.6; hand.target.y = hand.cmd.y + d.y*settings.maxDeg*0.6; }
    const rate = 30*dt; hand.cmd.x += Math.max(-rate, Math.min(rate, hand.target.x-hand.cmd.x)); hand.cmd.y += Math.max(-rate, Math.min(rate, hand.target.y-hand.cmd.y));
  }
  return { x: jx + bx + hand.cmd.x, y: jy + by + hand.cmd.y };
}
let lastErr = null;

// ---------- 設定（可開關） ----------
const settings = { showTarget: true, invertY: false, debug: false, maxDeg: TUNING.tilt.maxDeg };
try { Object.assign(settings, JSON.parse(localStorage.getItem('latte.settings')||'{}')); } catch(e){}
function saveSettings(){ try{ localStorage.setItem('latte.settings', JSON.stringify(settings)); }catch(e){} }

// ---------- 物件 ----------
const pattern = tulip;
const tilt = new Tilt({ minCutoff: TUNING.tilt.filterMinCutoff, beta: TUNING.tilt.filterBeta, deadZone: TUNING.tilt.deadZone });
const scene = new Scene($('fg'));
const sound = new SteamSound();
let fluid = null;
const glCanvas = $('cup');
const cup = { x:0, y:0, R:100, scale:1, vx:0, vy:0, ax:0, ay:0 };
const home = { x:0, y:0 };
let state = 'intro';
let t = 0, lastTs = 0, sinceStart = 0;
let score = null, prevRel = null, prevCup = null, tipFrames = 0;
let steam = { held:false, progress:0 };
let drift = [0,0,0,0,0,0];
let fps = 0, fpsN = 0, fpsT = 0;

function layout(){
  scene.resize();
  const w = scene.w, h = scene.h;
  cup.R = TUNING.view.cupRadiusFrac * Math.min(w, h*0.62);
  home.x = w/2; home.y = h*TUNING.view.cupCenterY;
  const dpr = Math.min(2, window.devicePixelRatio||1);
  const px = Math.round(cup.R*2);
  glCanvas.style.width = px+'px'; glCanvas.style.height = px+'px';
  glCanvas.width = Math.round(px*dpr); glCanvas.height = Math.round(px*dpr);
  if(state==='intro' || state==='calib' || state==='steam' || state==='ready'){ cup.x = home.x; cup.y = home.y; }
}
window.addEventListener('resize', layout);

function initFluid(){
  try {
    fluid = new Fluid(glCanvas, Object.assign({}, TUNING.sim, { cupShape: LEVEL.cupShape, velDissipation: TUNING.sim.velDissipation*LEVEL.viscosity }));
    return true;
  } catch(e){ $('gl-error').hidden = false; $('gl-error').textContent = '這個瀏覽器無法啟動 WebGL2 流體（'+e.message+'）。'; console.error(e); return false; }
}

// ---------- 畫面切換 ----------
const screens = ['intro','calib','steam','ready','reveal'];
function show(name){ for(const s of screens) $('scr-'+s).hidden = (s!==name); }
function setState(s){ state = s; show(['intro','calib','steam','ready','reveal'].includes(s) ? s : 'none'); $('hud').hidden = (s!=='pour'); }
function targetEll(){ const T = TUNING.target; return [0.5+T.x*0.5, 0.5-T.y*0.5, T.rx*0.5, T.ry*0.5]; }

// ---------- 介面事件 ----------
$('btn-enable').addEventListener('click', () => {
  sound.ensure();
  if(DEV.mouse){ tilt.mock = {x:0,y:0}; }
  const p = tilt.requestPermission();
  p.then(() => { setState('calib'); }).catch(() => { $('perm-error').hidden = false; });
  try { if(navigator.wakeLock) navigator.wakeLock.request('screen').catch(()=>{}); } catch(e){}
  // Android：全螢幕 + 鎖直向，避免傾斜時自動轉成橫向。iOS Safari 不支援，請開旋轉鎖定。
  try {
    const el = document.documentElement;
    const fs = el.requestFullscreen ? el.requestFullscreen({ navigationUI: 'hide' }) : Promise.reject();
    fs.then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('portrait')).catch(()=>{});
  } catch(e){}
});
$('btn-calib').addEventListener('click', () => { tilt.calibrate(); setState('steam'); });
$('btn-recalib').addEventListener('click', () => { setState('calib'); });
$('btn-recalib2').addEventListener('click', () => { setState('calib'); });
const steamBtn = $('btn-steam');
const onSteamDown = e => { e.preventDefault(); if(state!=='steam' || steam.held) return; steam.held = true; sound.start(); steamBtn.classList.add('held'); };
const onSteamUp = e => { e.preventDefault(); if(!steam.held) return; steam.held = false; sound.stop(); steamBtn.classList.remove('held'); $('steam-done').hidden = false; setTimeout(()=>{ if(state==='steam'){ setState('ready'); } }, 450); };
steamBtn.addEventListener('pointerdown', onSteamDown); steamBtn.addEventListener('pointerup', onSteamUp);
steamBtn.addEventListener('pointercancel', onSteamUp); steamBtn.addEventListener('pointerleave', e => { if(steam.held) onSteamUp(e); });
$('btn-start').addEventListener('click', startPour);
$('btn-again').addEventListener('click', startPour);
$('btn-resteam').addEventListener('click', () => { steam.progress = 0; $('steam-done').hidden = true; setState('steam'); });
// 設定
for(const id of ['set-target','set-invert','set-debug']){
  const el = $(id); const key = {'set-target':'showTarget','set-invert':'invertY','set-debug':'debug'}[id];
  el.checked = settings[key]; el.addEventListener('change', () => { settings[key] = el.checked; saveSettings(); $('debug').hidden = !settings.debug; });
}
$('set-deg').value = String(settings.maxDeg); $('set-deg').addEventListener('change', e => { settings.maxDeg = +e.target.value; saveSettings(); });
$('debug').hidden = !settings.debug;
for(const b of document.querySelectorAll('.btn-settings')) b.addEventListener('click', () => { $('settings').hidden = !$('settings').hidden; });
$('btn-close-settings').addEventListener('click', () => { $('settings').hidden = true; });
if(DEV.mouse){ window.addEventListener('pointermove', e => { tilt.mock = { x: (e.clientX - scene.w/2)/(scene.w/2)*settings.maxDeg*1.6, y: (e.clientY - scene.h/2)/(scene.h/2)*settings.maxDeg*1.6 }; }); }

function startPour(){
  if(!fluid && !initFluid()) return;
  fluid.reset(); t = 0; sinceStart = 0; prevRel = null; prevCup = null; tipFrames = 0;
  score = { inTime:0, pourTime:0, samples:[], spilled:false };
  drift = drift.map(() => Math.random()*Math.PI*2);
  cup.scale = 1; steam.progress = 0; $('steam-done').hidden = true;
  setState('pour');
}

// ---------- 傾斜 → 杯子位置 ----------
function cupFromTilt(dt){
  const r = tilt.read();
  const k = cup.R / settings.maxDeg;
  let tx = home.x + r.x*k, ty = home.y + (settings.invertY ? -r.y : r.y)*k;
  // 杯子難平衡：杯子自己慢慢飄走（三個不同頻率的正弦疊加，每次倒的相位都不同），玩家用傾斜抵銷
  const B = TUNING.balance, ramp = Math.min(1, sinceStart / B.ramp), dist = 1 + LEVEL.cupDisturbance;
  const w = 2*Math.PI*B.speed*dist, A = B.amp*cup.R*ramp*dist;
  const nx = 0.5*Math.sin(w*sinceStart + drift[0]) + 0.3*Math.sin(w*1.9*sinceStart + drift[1]) + 0.2*Math.sin(w*3.1*sinceStart + drift[2]);
  const ny = 0.5*Math.sin(w*0.8*sinceStart + drift[3]) + 0.3*Math.sin(w*2.1*sinceStart + drift[4]) + 0.2*Math.sin(w*2.7*sinceStart + drift[5]);
  tx += A*nx; ty += A*B.yScale*ny;
  // 限制在畫面內
  const lim = cup.R*1.6; tx = Math.max(home.x-lim, Math.min(home.x+lim, tx)); ty = Math.max(home.y-lim, Math.min(home.y+lim, ty));
  const sm = 1 - Math.exp(-TUNING.tilt.smooth*dt);
  tx = prevCup ? prevCup.x + (tx-prevCup.x)*sm : tx; ty = prevCup ? prevCup.y + (ty-prevCup.y)*sm : ty;
  if(prevCup){ const vx = (tx-prevCup.x)/dt, vy = (ty-prevCup.y)/dt; cup.ax = (vx-cup.vx)/dt; cup.ay = (vy-cup.vy)/dt; cup.vx=vx; cup.vy=vy; }
  prevCup = { x:tx, y:ty };
  cup.x = tx; cup.y = ty;
  return r;
}
function checkTip(r){
  const over = Math.abs(r.rawX) > TUNING.tilt.tipDeg || Math.abs(r.rawY) > TUNING.tilt.tipDeg;
  tipFrames = over ? tipFrames+1 : 0;
  const warn = Math.max(Math.abs(r.rawX), Math.abs(r.rawY)) / TUNING.tilt.tipDeg;
  $('tipwarn').style.opacity = String(Math.max(0, Math.min(1, (warn-0.6)/0.4)));
  return tipFrames >= 4;
}

// ---------- 主迴圈 ----------
function frame(ts){
  requestAnimationFrame(frame);
  let dt = lastTs ? (ts-lastTs)/1000 : 1/60; lastTs = ts; dt = Math.min(dt, 1/30); if(dt<=0) dt = 1/60;
  fpsN++; if(ts - fpsT > 500){ fps = fpsN*1000/(ts-fpsT); fpsN=0; fpsT=ts; }
  const time = ts/1000;
  let pitcher = null, outside = false, insideNow = false;

  if(state==='steam' && steam.held){ steam.progress = Math.min(1, steam.progress + dt/2.6); sound.update(steam.progress); }
  if(state==='steam'){ $('foam').style.height = (18 + 70*steam.progress)+'%'; }
  if(state==='calib'){
    const r = tilt.read();
    $('calib-vals').textContent = tilt.hasData || tilt.mock ? `β ${r.rawY.toFixed(1)}°  γ ${r.rawX.toFixed(1)}°  ${tilt.hz.toFixed(0)} Hz` : '等待感測器…';
    $('calib-nodata').hidden = tilt.hasData || !!tilt.mock || (performance.now() - bootT) < 2500;
  }

  if(state==='pour'){
    t += dt; sinceStart += dt;
    const s = samplePattern(pattern, t);
    // 鋼杯干擾（手抖、風吹）
    let nx = 0, ny = 0;
    if(LEVEL.pitcherDisturbance > 0){ const a = LEVEL.pitcherDisturbance*0.18; nx = a*(Math.sin(t*9.1)*0.6 + Math.sin(t*2.3)); ny = a*(Math.sin(t*7.7+1)*0.6 + Math.sin(t*1.9+2)); }
    const px = home.x + (s.x+nx)*cup.R, py = home.y + (s.y+ny)*cup.R;
    let r;
    if(DEV.hand){ tilt.mock = handTilt(sinceStart, dt, lastErr); }
    if(DEV.auto){ cup.x = home.x + s.x*cup.R; cup.y = home.y; r = {rawX:0,rawY:0}; if(prevCup){ cup.vx=(cup.x-prevCup.x)/dt; } prevCup={x:cup.x,y:cup.y}; }
    else r = cupFromTilt(dt);
    pitcher = { x:px, y:py, flow:s.flow*LEVEL.flowRate, h:s.h, prep:s.prep, prepDir:s.prepDir };
    if(!DEV.auto && checkTip(r)){ score.spilled = true; endPour(); }
    else {
      const T = TUNING.target;
      const rel = { x:(px-cup.x)/cup.R, y:(py-cup.y)/cup.R };
      // 瞄準輔助：落點往甜蜜點中心拉近一點（只影響落點，不影響杯子位置）
      rel.x = T.x + (rel.x-T.x)*(1-TUNING.assist); rel.y = T.y + (rel.y-T.y)*(1-TUNING.assist);
      pitcher.ix = cup.x + rel.x*cup.R; pitcher.iy = cup.y + rel.y*cup.R;
      lastErr = { x: rel.x - T.x, y: rel.y - T.y };
      const q = ((rel.x-T.x)/T.rx)**2 + ((rel.y-T.y)/T.ry)**2;
      const inside = q <= 1;
      const fuzz = inside ? 0 : Math.min(1, (Math.sqrt(q)-1)/TUNING.pour.fuzzSoft); // 剛出界只糊一點，越遠越糊
      const pouring = pitcher.flow > 0.05;
      outside = pouring && !inside; insideNow = pouring && inside;
      if(pouring){ score.pourTime += dt; if(inside) score.inTime += dt; score.samples.push({t, inside}); }
      // 注入
      const P = TUNING.pour;
      const u = 0.5 + rel.x*0.5, v = 0.5 - rel.y*0.5;
      let rvx = 0, rvy = 0;
      if(prevRel){ rvx = (rel.x-prevRel.x)/dt*0.5; rvy = -(rel.y-prevRel.y)/dt*0.5; }
      prevRel = rel;
      if(pouring){
        const f = pitcher.flow, h = s.h;
        let dyeR = (P.dyeSigma*(1-h) + P.dyeSigmaLow*h) * (0.7+0.5*f);
        let amount = P.amountPerFrame * f * (dt*60);
        let jet = P.jetStrength * f * (0.55 + 0.75*h) * LEVEL.gravity;
        let push = P.pushStrength * f * (1 - 0.6*h) * LEVEL.gravity * LEVEL.flowRate;
        let vx = rvx*P.momentum, vy = jet + rvy*P.momentum;
        if(fuzz > 0){ // 落在甜蜜點外：亂流、奶泡沉下去、圖案糊掉（依出界距離漸進）
          const a = Math.random()*Math.PI*2; vx += Math.cos(a)*P.fuzzJet*fuzz; vy += Math.sin(a)*P.fuzzJet*fuzz;
          dyeR *= 1 + (P.fuzzDyeScale-1)*fuzz; amount *= 1 - (1-P.fuzzAmount)*fuzz; push *= 1 - (1-P.fuzzPush)*fuzz;
        }
        const clampV = Math.min(1.2, Math.hypot(vx,vy)); const L = Math.hypot(vx,vy)||1; vx = vx/L*clampV; vy = vy/L*clampV;
        fluid.splat(u, v, vx, vy, P.jetSigma*(1+0.3*f), dyeR, amount);
        fluid.setPush(u, v, P.pushSigma, push, P.pushR0);
      } else fluid.setPush(u, v, P.pushSigma, 0, P.pushR0);
      // 杯子加速度 → 液面晃動
      const sl = P.slosh*(1 + 2*LEVEL.cupDisturbance);
      const fx = -cup.ax/cup.R*0.5*sl, fy = cup.ay/cup.R*0.5*sl;
      fluid.setForce(Math.max(-3,Math.min(3,fx)), Math.max(-3,Math.min(3,fy)));
      fluid.step(dt);
      $('progress').style.width = (Math.min(1, t/pattern.duration)*100)+'%';
      if(t >= pattern.duration + 0.3) endPour();
    }
  }
  if(state==='reveal'){
    // 揭曉：杯子滑回中間、放大
    const k = 1 - Math.pow(0.001, dt);
    cup.x += (home.x - cup.x)*k; cup.y += (home.y*0.72 - cup.y)*k; cup.scale += (1.28 - cup.scale)*k;
    cup.ax = cup.ay = 0;
  }
  if(state==='ready'){ pitcher = { x: home.x + 0.0*cup.R, y: home.y - 0.25*cup.R, flow:0, h:0.9, prep:0, prepDir:[0,0] }; }

  // 繪製
  glCanvas.style.transform = `translate(${cup.x-cup.R}px, ${cup.y-cup.R}px) scale(${cup.scale})`;
  if(fluid) fluid.render(settings.showTarget && state==='pour' ? (insideNow ? 1.6 : 0.9) : 0, targetEll());
  scene.clear();
  scene.draw(cup, pitcher, { showPitcher: !!pitcher, time, outside });

  if(settings.debug){
    const r = tilt.mock ? tilt.read() : { rawX: tilt.raw.gamma - tilt.zero.gamma, rawY: tilt.raw.beta - tilt.zero.beta };
    $('debug').textContent = `fps ${fps.toFixed(0)}  sensor ${tilt.hz.toFixed(0)}Hz  tilt x ${r.rawX.toFixed(1)}° y ${r.rawY.toFixed(1)}°  t ${t.toFixed(1)}s` + (score ? `  in ${(score.inTime/Math.max(1e-3,score.pourTime)*100).toFixed(0)}%` : '');
  }
}

function endPour(){
  const ratio = score.pourTime > 0 ? score.inTime/score.pourTime : 0;
  const pass = !score.spilled && ratio >= TUNING.passRatio;
  $('reveal-title').textContent = score.spilled ? '翻倒了' : (pass ? '成功' : '沒接好');
  $('reveal-title').className = pass ? 'ok' : 'bad';
  $('reveal-ratio').textContent = score.spilled ? '杯子傾斜超過門檻，整杯失敗。' : `牛奶落在甜蜜點的時間：${(ratio*100).toFixed(0)}%（門檻 ${(TUNING.passRatio*100).toFixed(0)}%）`;
  $('reveal-pattern').textContent = pattern.name;
  setState('reveal');
  drawTimeline(score.samples, score.spilled);
}
function drawTimeline(samples, spilled){
  const c = $('timeline'); const ctx = c.getContext('2d'); const w = c.width = c.clientWidth*2, h = c.height = 28;
  ctx.clearRect(0,0,w,h);
  if(!samples.length){ return; }
  const dur = pattern.duration;
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 8, w, 12);
  for(let i=0;i<samples.length;i++){
    const a = samples[i], b = samples[i+1];
    const x0 = a.t/dur*w, x1 = (b ? b.t : a.t+1/60)/dur*w;
    ctx.fillStyle = a.inside ? '#9fd08a' : '#d96b5c';
    ctx.fillRect(x0, 8, Math.max(1, x1-x0+0.5), 12);
  }
  if(spilled){ ctx.fillStyle='#d96b5c'; ctx.fillRect(samples[samples.length-1].t/dur*w, 0, 3, h); }
}

// ---------- 啟動 ----------
const bootT = performance.now();
layout();
if(!initFluid()){ /* 錯誤已顯示 */ }
if(DEV.auto || DEV.hand){ tilt.mock = {x:0,y:0}; }
setState('intro');
requestAnimationFrame(frame);
