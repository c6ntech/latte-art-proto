// 手機陀螺儀（DeviceOrientation）輸入：授權、歸零校正、One-Euro 濾波。
class OneEuro {
  constructor(minCutoff=1.0, beta=0.0, dCutoff=1.0){ this.mc=minCutoff; this.beta=beta; this.dc=dCutoff; this.x=null; this.dx=0; this.t=null; }
  alpha(cut, dt){ const tau = 1/(2*Math.PI*cut); return 1/(1+tau/dt); }
  filter(x, t){
    if(this.x===null){ this.x=x; this.t=t; return x; }
    const dt = Math.max(1e-3, t-this.t); this.t=t;
    const dxRaw = (x-this.x)/dt; const ad = this.alpha(this.dc, dt); this.dx = ad*dxRaw + (1-ad)*this.dx;
    const cut = this.mc + this.beta*Math.abs(this.dx); const a = this.alpha(cut, dt);
    this.x = a*x + (1-a)*this.x; return this.x;
  }
  reset(){ this.x=null; this.dx=0; this.t=null; }
}

export class Tilt {
  constructor(opts){
    this.minCutoff = opts.minCutoff; this.beta = opts.beta; this.deadZone = opts.deadZone || 0;
    this.raw = { beta:0, gamma:0 }; this.zero = { beta:0, gamma:0 };
    this.fx = new OneEuro(this.minCutoff, this.beta); this.fy = new OneEuro(this.minCutoff, this.beta);
    this.hasData = false; this.events = 0; this.lastEventT = 0; this.hz = 0; this._hzT = performance.now(); this._hzN = 0;
    this.latencyMs = 0; this.mock = null; // mock: {x,y} degrees for desktop testing
    this._onEvent = e => this.onEvent(e);
  }
  // 必須在使用者點擊的事件處理器內同步呼叫（iOS Safari 要求）。
  requestPermission(){
    if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
      return DeviceOrientationEvent.requestPermission().then(r => { if(r !== 'granted') throw new Error('denied'); this.listen(); return true; });
    }
    this.listen(); return Promise.resolve(true);
  }
  listen(){ if(this.listening) return; this.listening = true; window.addEventListener('deviceorientation', this._onEvent, true); }
  onEvent(e){
    if(e.beta === null || e.gamma === null) return;
    const now = performance.now();
    this.raw.beta = e.beta; this.raw.gamma = e.gamma; this.hasData = true; this.events++;
    this._hzN++; if(now - this._hzT > 1000){ this.hz = this._hzN*1000/(now-this._hzT); this._hzN=0; this._hzT=now; }
    this.lastEventT = now;
  }
  orientation(){ try { if(screen.orientation && typeof screen.orientation.angle === 'number') return screen.orientation.angle; } catch(e){} return (typeof window.orientation === 'number') ? window.orientation : 0; }
  calibrate(){
    const o = this.orientation(); let b = this.raw.beta, g = this.raw.gamma;
    if(o === 90){ const t = b; b = g; g = -t; } else if(o === -90 || o === 270){ const t = b; b = -g; g = t; } else if(o === 180){ b = -b; g = -g; }
    this.zero.beta = b; this.zero.gamma = g; this.fx.reset(); this.fy.reset();
  }
  // 回傳相對歸零點的傾斜角（度）：x = 左右（右低為正），y = 前後（上緣往下為負）
  read(){
    const now = performance.now()/1000;
    let gx, gy;
    if(this.mock){ gx = this.mock.x; gy = this.mock.y; }
    else {
      // 依螢幕旋轉角把 beta/gamma 轉回「直立」的軸向（手機若被轉成橫向，遊戲軸不會跟著亂掉）
      const o = this.orientation();
      let b = this.raw.beta, g = this.raw.gamma;
      if(o === 90){ const t = b; b = g; g = -t; } else if(o === -90 || o === 270){ const t = b; b = -g; g = t; } else if(o === 180){ b = -b; g = -g; }
      gx = g - this.zero.gamma; gy = b - this.zero.beta;
      if(gx > 180) gx -= 360; if(gx < -180) gx += 360;
      if(gy > 180) gy -= 360; if(gy < -180) gy += 360;
      // 死區：手的微抖不算
      const dz = this.deadZone || 0;
      gx = Math.abs(gx) < dz ? 0 : gx - Math.sign(gx)*dz;
      gy = Math.abs(gy) < dz ? 0 : gy - Math.sign(gy)*dz;
    }
    return { x: this.fx.filter(gx, now), y: this.fy.filter(gy, now), rawX: gx, rawY: gy };
  }
}
