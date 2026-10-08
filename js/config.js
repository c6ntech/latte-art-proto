// 關卡參數：之後每一關的難度來自這六個參數之一。第一階段全部用預設值。
export const LEVEL = {
  flowRate: 1.0,          // 流速倍率（影響每秒注入的牛奶量與擴散推力）
  gravity: 1.0,           // 重力倍率（影響牛奶落下的推開力道與噴流強度）
  cupShape: [1.0, 1.0],   // 容器形狀：杯面橢圓的 x/y 比例，[1,1] 是圓杯
  viscosity: 1.0,         // 液體黏度倍率（越高流場衰減越快、擴散越慢）
  cupDisturbance: 0.0,    // 杯子受到的干擾 0..1（在基本飄移之上再加快、加大）
  pitcherDisturbance: 0.0 // 奶泡鋼杯受到的干擾 0..1（風吹偏、手抖）
};

// 手感與判定的調整值。單位：R = 杯子半徑，UV = 杯面貼圖座標 (0..1)。
export const TUNING = {
  // 傾斜 → 位置（角度對應位置）。maxDeg 度對應 1R 的位移。
  tilt: { maxDeg: 18, tipDeg: 42, filterMinCutoff: 0.9, filterBeta: 0.03, smooth: 8, deadZone: 1.0 },
  // 甜蜜點：杯面上的橢圓（杯子座標，y 往上為負），rx/ry 是半徑（R）
  target: { x: 0, y: -0.08, rx: 0.42, ry: 0.58 },
  passRatio: 0.8,
  // 杯子難平衡：杯子會自己慢慢飄走，玩家要用傾斜把它拉回來。amp 是飄移幅度（R），speed 是飄移的基本頻率（Hz），
  // yScale 是前後方向的幅度比例，ramp 是開倒後幾秒內從 0 漸增到全幅。
  balance: { amp: 0.5, speed: 0.08, yScale: 0.5, ramp: 4 },
  assist: 0.3, // 瞄準輔助：落點往甜蜜點中心拉近的比例（0 = 完全真實）
  // 流體
  sim: { simRes: 128, dyeRes: 384, pressureIters: 20, curl: 1, velDissipation: 3.0 },
  // 牛奶注入（UV 單位）
  pour: {
    dyeSigma: 0.028, dyeSigmaLow: 0.03,   // 奶流半徑：低拿（h=0）粗、高拿（h=1）細
    amountPerFrame: 0.12,                   // 每幀注入的奶泡量（60fps）
    pushSigma: 0.45, pushStrength: 0.11, pushR0: 0.035,     // 擴散推開（compressible push）
    jetStrength: 0.03, jetSigma: 0.045,     // 向前噴流（讓奶泡往前推、堆疊）
    momentum: 0.15,                           // 鋼杯相對杯子的速度帶入流場的比例
    slosh: 0.04,                             // 杯子加速度對液面的影響
    fuzzJet: 0.3, fuzzDyeScale: 1.6, fuzzAmount: 0.6, fuzzPush: 0.5, fuzzSoft: 0.25 // 落在甜蜜點外時的糊掉
  },
  // 畫面
  view: { cupRadiusFrac: 0.29, cupCenterY: 0.56 },
  prepLead: 0.35 // 預備動作提前秒數
};
