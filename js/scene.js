// 2D 前景：杯子、杯盤、奶泡鋼杯、手、奶流、提示。畫面固定在桌面上（相機不動）。
export class Scene {
  constructor(canvas){ this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.dpr = Math.min(2, window.devicePixelRatio||1); this.resize(); }
  resize(){
    const w = window.innerWidth, h = window.innerHeight; this.w=w; this.h=h;
    this.canvas.width = Math.round(w*this.dpr); this.canvas.height = Math.round(h*this.dpr);
    this.canvas.style.width = w+'px'; this.canvas.style.height = h+'px';
    this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
  }
  clear(){ this.ctx.clearRect(0,0,this.w,this.h); }

  // cup: {x,y,R,scale}; pitcher: {x,y,flow,h,prep,prepDir}（世界座標 px）；state: 'pour'|'reveal'|'ready'
  draw(cup, pitcher, s){
    const c = this.ctx; c.save();
    const R = cup.R*cup.scale;
    // 杯盤（在杯身外圍）
    c.beginPath(); c.arc(cup.x, cup.y+R*0.06, R*1.62, 0, Math.PI*2); c.arc(cup.x, cup.y, R*1.13, 0, Math.PI*2, true);
    c.fillStyle = '#e9e2d6'; c.fill('evenodd');
    c.beginPath(); c.arc(cup.x, cup.y+R*0.06, R*1.62, 0, Math.PI*2); c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth = 2; c.stroke();
    // 把手
    c.beginPath(); c.arc(cup.x+R*1.08, cup.y, R*0.42, -Math.PI*0.55, Math.PI*0.55);
    c.lineWidth = R*0.17; c.strokeStyle = '#f2ede4'; c.lineCap='round'; c.stroke();
    c.lineWidth = R*0.17 + 2; c.strokeStyle='rgba(0,0,0,0.1)'; c.globalCompositeOperation='destination-over'; c.stroke(); c.globalCompositeOperation='source-over';
    // 杯緣（蓋住流體畫布邊緣）
    c.beginPath(); c.arc(cup.x, cup.y, R*1.13, 0, Math.PI*2); c.arc(cup.x, cup.y, R*0.985, 0, Math.PI*2, true);
    c.fillStyle = '#f4f0e8'; c.fill('evenodd');
    c.beginPath(); c.arc(cup.x, cup.y, R*1.13, 0, Math.PI*2); c.strokeStyle='rgba(0,0,0,0.18)'; c.lineWidth=1.5; c.stroke();
    c.beginPath(); c.arc(cup.x, cup.y, R*0.985, 0, Math.PI*2); c.strokeStyle='rgba(60,30,10,0.35)'; c.lineWidth=2; c.stroke();

    if(pitcher && s.showPitcher){
      const P = pitcher; const Rr = cup.R;
      // 奶流落點 P.x,P.y；鋼杯嘴在落點右上方，越高（h）越遠
      const off = { x: Rr*(0.22 + 0.1*P.h), y: -Rr*(0.62 + 0.45*P.h) };
      const back = P.prep ? Math.sin(P.prep*Math.PI) : 0;
      const sx = P.x + off.x - P.prepDir[0]*Rr*0.09*back, sy = P.y + off.y - P.prepDir[1]*Rr*0.09*back - back*Rr*0.05;
      const tilt = 0.55 + 0.35*P.flow*(1-P.h*0.5) - P.prepDir[0]*0.18*back; // 傾倒角
      // 奶流
      if(P.flow > 0.02){
        const w = Rr*(0.035 + 0.075*P.flow*(1-0.55*P.h));
        c.save(); c.strokeStyle='rgba(250,246,238,0.92)'; c.lineWidth=w; c.lineCap='round';
        c.beginPath(); c.moveTo(sx, sy);
        const mx = (sx+P.x)/2 + Math.sin(s.time*31)*2, my = (sy+P.y)/2;
        c.quadraticCurveTo(mx, my, P.x, P.y); c.stroke();
        c.fillStyle='rgba(255,252,246,0.55)'; c.beginPath(); c.arc(P.x, P.y, w*0.9 + Math.sin(s.time*23)*1.5, 0, Math.PI*2); c.fill();
        if(s.outside){ // 落在甜蜜點外：濺出
          c.fillStyle='rgba(255,250,240,0.7)';
          for(let i=0;i<4;i++){ const a = s.time*7 + i*1.7; c.beginPath(); c.arc(P.x+Math.cos(a)*w*1.8, P.y+Math.sin(a)*w*1.8, w*0.22, 0, Math.PI*2); c.fill(); }
        }
        c.restore();
      }
      // 鋼杯（上視，旋轉）
      c.save(); c.translate(sx, sy); c.rotate(tilt);
      const bw = Rr*0.78, bh = Rr*0.62;
      c.shadowColor='rgba(0,0,0,0.25)'; c.shadowBlur=Rr*0.12*(1+P.h); c.shadowOffsetY = Rr*0.08*(1+P.h);
      // 杯身
      c.beginPath(); c.moveTo(0,0); c.lineTo(bw*0.25,-bh*0.22); c.lineTo(bw, -bh*0.4); c.quadraticCurveTo(bw*1.12, 0, bw, bh*0.4); c.lineTo(bw*0.25, bh*0.22); c.closePath();
      const g = c.createLinearGradient(0,-bh,0,bh); g.addColorStop(0,'#d9dde2'); g.addColorStop(0.5,'#9aa3ab'); g.addColorStop(1,'#6e767d');
      c.fillStyle=g; c.fill(); c.shadowColor='transparent';
      c.strokeStyle='rgba(30,35,40,0.5)'; c.lineWidth=1.5; c.stroke();
      // 杯口奶泡
      c.beginPath(); c.ellipse(bw*0.58, 0, bw*0.34, bh*0.25, 0, 0, Math.PI*2); c.fillStyle='#f6f2ea'; c.fill(); c.strokeStyle='rgba(0,0,0,0.15)'; c.stroke();
      // 把手 + 手
      c.translate(bw*1.02, 0);
      c.beginPath(); c.roundRect(0, -bh*0.12, bw*0.5, bh*0.24, 6); c.fillStyle='#4b5157'; c.fill();
      // 手（戴手套的手：掌 + 四指 + 拇指）
      const skin = '#e3b58f', skin2 = '#c9966f';
      c.fillStyle = skin; c.strokeStyle = skin2; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(bw*0.55, bh*0.05, bw*0.42, bh*0.5, 0.15, 0, Math.PI*2); c.fill(); c.stroke();
      for(let i=0;i<4;i++){ const fy = -bh*0.36 + i*bh*0.24; c.beginPath(); c.roundRect(bw*0.05 - i*2, fy, bw*0.5, bh*0.19, 8); c.fill(); c.stroke(); }
      c.beginPath(); c.ellipse(bw*0.2, -bh*0.5, bw*0.17, bh*0.14, -0.6, 0, Math.PI*2); c.fill(); c.stroke();
      // 手臂往畫面外
      c.beginPath(); c.moveTo(bw*0.7, -bh*0.4); c.lineTo(bw*2.6, -bh*1.2); c.lineTo(bw*2.8, -bh*0.2); c.lineTo(bw*0.8, bh*0.45); c.closePath(); c.fillStyle='#2f6f8f'; c.fill();
      c.restore();
    }
    c.restore();
  }
}
