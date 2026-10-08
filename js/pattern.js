// 讀取一套拉花動作的資料，在時間 t 取樣鋼杯狀態，並算出「預備動作」提示。
import { TUNING } from './config.js';
const smooth = u => u*u*(3-2*u);
const easeFn = { smooth, linear: u=>u, step: u=> (u>=1?1:0) };

export function samplePattern(pattern, t){
  const kf = pattern.keyframes;
  if(t <= kf[0].t) return { ...kf[0], prep:0, prepDir:[0,0] };
  const last = kf[kf.length-1];
  if(t >= last.t) return { ...last, prep:0, prepDir:[0,0] };
  let i = 1; while(kf[i].t < t) i++;
  const a = kf[i-1], b = kf[i];
  const u = (t - a.t) / Math.max(1e-6, b.t - a.t);
  const e = (easeFn[b.ease] || smooth)(u);
  const out = { t, x: a.x + (b.x-a.x)*e, y: a.y + (b.y-a.y)*e, flow: a.flow + (b.flow-a.flow)*e, h: a.h + (b.h-a.h)*e };
  // 預備動作：找下一個「位移段」（flow 為 0 且 x 或 y 有明顯移動）
  let prep = 0, prepDir = [0,0];
  for(let j = i; j < kf.length; j++){
    const p = kf[j-1], q = kf[j];
    const dx = q.x - p.x, dy = q.y - p.y;
    if(Math.hypot(dx,dy) > 0.12 && p.flow < 0.05){
      const until = p.t - t;
      if(until >= 0 && until <= TUNING.prepLead){ prep = 1 - until / TUNING.prepLead; const L = Math.hypot(dx,dy); prepDir = [dx/L, dy/L]; }
      break;
    }
  }
  return { ...out, prep, prepDir };
}
