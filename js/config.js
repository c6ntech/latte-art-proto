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
  target: { x: 0, y: -0.04, rx: 0.42, ry: 0.58 },   // 葉子（rosetta）的落點範圍置中
  passRatio: 0.8,
  // 杯子難平衡：杯子會自己慢慢飄走，玩家要用傾斜把它拉回來。amp 是飄移幅度（R），speed 是飄移的基本頻率（Hz），
  // yScale 是前後方向的幅度比例，ramp 是開倒後幾秒內從 0 漸增到全幅。
  balance: { amp: 0.5, speed: 0.08, yScale: 0.5, ramp: 4 },
  assist: 0.3, // 瞄準輔助：落點往甜蜜點中心拉近的比例（0 = 完全真實）
  // 流體
  // layerLine: 兩次注入的奶泡相遇時畫分層線的門檻（層 id 差）
  sim: { simRes: 128, dyeRes: 384, pressureIters: 20, curl: 1, velDissipation: 3.0, layerLine: 0.12 },
  // 牛奶注入（UV 單位）
  pour: {
    dyeSigma: 0.028, dyeSigmaLow: 0.03,   // 奶流半徑：低拿（h=0）粗、高拿（h=1）細
    amountPerFrame: 0.2,                   // 每幀注入的奶泡量（60fps）
    pushSigma: 0.45, pushStrength: 0.08, pushR0: 0.035,     // 擴散推開（compressible push）
    jetStrength: 0.08, jetDir: -1,  // 奶離開壺嘴後繼續往前流（-1 = 往玩家方向，鋼杯在遠側）；葉子靠它把每次搖晃帶開、疊成一片片
    jetSigma: 0.045,     // 向前噴流（讓奶泡往前推、堆疊）
    momentum: 0.15,                           // 鋼杯相對杯子的速度帶入流場的比例
    slosh: 0.04,                             // 杯子加速度對液面的影響
    fuzzJet: 0.3, fuzzDyeScale: 1.6, fuzzAmount: 0.6, fuzzPush: 0.5, fuzzSoft: 0.25, // 落在甜蜜點外時的糊掉
    layerIds: [0.15, 0.55, 0.95, 0.35, 0.75, 0.15],  // 每一層換一個 id，相鄰兩層差 ≥ 0.4，分層線才畫得出來
    // 高拿會沉（D010）：鋼杯高度 h 在 sinkH[0] 以下奶會浮在表面，sinkH[1] 以上全部沉下去，只留一點 crema 色
    conveyor: 0.3, conveyorW: 0.06, conveyorL: 0.3,   // 輸送帶（UV/s、半寬、長度）：壺嘴前方的奶泡被往前帶，葉子靠它疊起來
    sinkH: [0.35, 0.65], sinkTint: 0.06, pushMinSurf: 0.0,   // 高拿時幾乎不推開表面（拉莖只拖出一條線）
    layerOn: 0.6, layerOff: 0.3          // 表面奶量（流量 × 浮起比例）超過 on 開始新的一層，低於 off 結束
  },
  // 畫面
  view: { cupRadiusFrac: 0.29, cupCenterY: 0.56 },
  // 3D 呈現（D007）：低面數 + 像素貼圖 + 接近俯視。單位 = 杯子半徑。只影響畫面，不影響判定與手感。
  view3d: {
    latteTexels: 72,                 // 液面像素格數（直徑）
    cupSegments: 12, pitcherSegments: 10,
    fov: 30, pitch: 70,              // 鏡頭：垂直視角、俯角（90 = 正上方）
    frameWidth: 5.0, frameHeight: 8.0, lookAt: [0.3, 0.6, -0.7],
    revealPitch: 82, revealZoom: 0.55, revealShift: 0.9,
    cupLift: 0.35,                   // 杯子離桌面的高度（被拿在手上）
    tiltVisual: 0.6, tiltMax: 14,    // 杯子畫面傾斜 = 手機角度 × 0.6，上限 14°
    pitcherYaw: -1.99,               // 鋼杯在杯子遠側偏右，壺嘴朝玩家方向
    tiltIdle: 0.35, tiltPour: 0.7,   // 鋼杯傾倒角（弧度）
    spoutHeight: 0.55, spoutHeightH: 1.1, spoutBack: [0.15, -0.4],   // 壺嘴相對落點：高度、往遠側偏移（x, z）
    tableRepeat: 18,
    grain: 1.6,                      // 所有程式貼圖的雜訊強度倍率（Reviewer r2：手機尺寸下顆粒太淡）
    sun: 2.1, ambient: 0.9, exposure: 1.0, background: 0x2a1d14
  },
  prepLead: 0.35, // 預備動作提前秒數
  prepMinMove: 0.25, // 位移超過這個距離（R）才做預備動作
  prepMinDur: 0.4    // 而且這段移動要超過這麼久（秒），快速的手腕搖晃不做
};
