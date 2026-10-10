// 葉子（rosetta），一次倒完不中斷（D010、D011）。參考：Docs/concepts/approved/latte/rosetta_owner_ref.jpg
// x/y 是鋼杯落點（R 單位，相對杯子起始位置），y 向上（遠離玩家）為負。flow 流量，h 鋼杯高度（高 = 奶沉下去）。
// L：這一段注入屬於第幾片葉子（每半次搖晃一片）；沒有 L 的段落由 main.js 依高度自動判斷。
//
// 鋼杯在杯子遠側，奶往玩家方向流（TUNING.pour.jetDir）。照真實手法：
//   注入（高、細）→ 在靠玩家側放低，白色浮出 → 手腕左右小幅搖晃、同時往鋼杯方向（遠側）慢慢退，越退越小
//   → 抬高一點、回到中線最遠端 → 往玩家方向拉穿所有葉子，葉子被拖成一個個 V → 收。
// 手的位置不動（D001），只有手腕搖晃（±0.17R 以內，在甜蜜點裡，玩家不用跟）。
const K = (t, x, y, flow, h, ease, L) => ({ t, x, y, flow, h, ease: ease || 'smooth', L });

const W = { start: 3.35, halves: 14, step: 0.21, y0: 0.24, y1: -0.46, a0: 0.18, a1: 0.08, pullH: 0.6, pullFlow: 0.5 };

const kf = [
  K(0.0, 0.00, 0.00, 0.0, 1.0),
  K(0.7, 0.00, 0.00, 0.0, 1.0),
  K(0.9, 0.00, 0.00, 0.7, 1.0),           // 開始倒：拉高、細流注入，奶沉下去
  K(1.6, 0.10, -0.05, 0.7, 1.0),          // 注入時小幅畫圈
  K(2.3, -0.10, 0.05, 0.7, 1.0),
  K(2.8, 0.00, 0.10, 0.7, 1.0),
  K(3.1, 0.00, W.y0, 1.0, 0.2)            // 放低：白色在靠玩家側浮出（第一片葉子）
];
for(let i = 0; i < W.halves; i++){
  const u = (i + 1) / W.halves;
  const side = i % 2 === 0 ? 1 : -1;
  kf.push(K(W.start + i*W.step, side*(W.a0 + (W.a1 - W.a0)*u), W.y0 + (W.y1 - W.y0)*u, 1.0, 0.2 + 0.08*u, 'smooth', i));
}
const tw = W.start + (W.halves - 1)*W.step;
kf.push(K(tw + 0.3, 0.00, W.y1 - 0.08, W.pullFlow, W.pullH, 'smooth', W.halves));   // 抬高一點，回到中線最遠端
kf.push(K(tw + 1.6, 0.00, 0.44, W.pullFlow, W.pullH, 'linear', W.halves));          // 往玩家方向拉穿所有葉子
kf.push(K(tw + 2.0, 0.00, 0.50, 0.0, 1.0));                                          // 收：拉高、停
kf.push(K(tw + 2.6, 0.00, 0.52, 0.0, 1.0));

// 相鄰的葉子（同側相隔 2、左右相隔 1）層 id 都至少差 0.3，分層線才清楚
export default { id: 'rosetta', name: '葉子', duration: tw + 2.6, keyframes: kf, layerIds: [0.0, 0.3, 1.0, 0.7] };
