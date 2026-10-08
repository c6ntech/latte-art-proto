// 打奶泡的機器聲（合成：噪音 + 帶通濾波 + 低頻嗡嗡）。
export class SteamSound {
  constructor(){ this.ctx = null; }
  ensure(){ if(!this.ctx){ const AC = window.AudioContext || window.webkitAudioContext; if(AC) this.ctx = new AC(); } if(this.ctx && this.ctx.state==='suspended') this.ctx.resume(); return this.ctx; }
  start(){
    const ctx = this.ensure(); if(!ctx || this.nodes) return;
    const len = ctx.sampleRate*2, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value = 900; bp.Q.value = 0.7;
    const hp = ctx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value = 300;
    const gain = ctx.createGain(); gain.gain.value = 0; 
    const osc = ctx.createOscillator(); osc.type='sawtooth'; osc.frequency.value = 55;
    const og = ctx.createGain(); og.gain.value = 0.0;
    const lp = ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value = 180;
    src.connect(hp).connect(bp).connect(gain).connect(ctx.destination);
    osc.connect(lp).connect(og).connect(ctx.destination);
    const t = ctx.currentTime;
    gain.gain.linearRampToValueAtTime(0.35, t+0.15); og.gain.linearRampToValueAtTime(0.08, t+0.2);
    src.start(); osc.start();
    this.nodes = { src, bp, gain, osc, og, t0: t };
  }
  update(progress){ // 0..1 奶泡上升：聲音變高、變尖
    if(!this.nodes) return; const n=this.nodes, t=this.ctx.currentTime;
    n.bp.frequency.setTargetAtTime(900 + 1800*progress, t, 0.1);
    n.osc.frequency.setTargetAtTime(55 + 30*progress, t, 0.1);
  }
  stop(){
    if(!this.nodes) return; const n=this.nodes, t=this.ctx.currentTime;
    n.gain.gain.setTargetAtTime(0, t, 0.08); n.og.gain.setTargetAtTime(0, t, 0.08);
    setTimeout(()=>{ try{ n.src.stop(); n.osc.stop(); }catch(e){} }, 400);
    this.nodes = null;
  }
}
