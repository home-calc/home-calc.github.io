// 주택용 전력(저압) 요금표와 계산식. 브라우저와 build.js 가 같이 쓴다.
// 요금이 바뀌면 TARIFF 숫자만 고치면 된다.
export const TARIFF = {
  asOf: '2026년 4분기',
  // 누진 1~3단계: 기본요금(원/호), 전력량요금(원/kWh)
  tiers: [
    { basic: 910, rate: 120.0 },
    { basic: 1600, rate: 214.6 },
    { basic: 7300, rate: 307.3 },
  ],
  // 단계 상한(kWh). 7~8월만 구간이 완화된다.
  limits: { summer: [300, 450], winter: [200, 400], other: [200, 400] },
  // 여름·겨울에 1,000kWh 를 넘는 사용량에 붙는 단가
  superUser: { over: 1000, rate: 736.2, seasons: ['summer', 'winter'] },
  climateRate: 9, // 기후환경요금(원/kWh)
  fuelRate: 5, // 연료비조정요금(원/kWh)
  vatRate: 0.1, // 부가가치세
  fundRate: 0.027, // 전력산업기반기금
};

export function seasonOfMonth(month) {
  if (month === 7 || month === 8) return 'summer';
  if (month === 12 || month <= 2) return 'winter';
  return 'other';
}

// 월 사용량이 속하는 누진 단계(0~2)
export function tierOf(kwh, season) {
  const [l1, l2] = TARIFF.limits[season];
  return kwh <= l1 ? 0 : kwh <= l2 ? 1 : 2;
}

// 월 사용량(kWh)에 대한 청구 예상액
export function calcBill(kwh, season) {
  const { tiers, superUser, climateRate, fuelRate, vatRate, fundRate } = TARIFF;
  const [l1, l2] = TARIFF.limits[season];
  const superOn = superUser.seasons.includes(season);
  const top = superOn ? Math.min(kwh, superUser.over) : kwh;

  const energy =
    Math.min(kwh, l1) * tiers[0].rate +
    Math.max(0, Math.min(kwh, l2) - l1) * tiers[1].rate +
    Math.max(0, top - l2) * tiers[2].rate +
    (superOn ? Math.max(0, kwh - superUser.over) * superUser.rate : 0);

  const basic = tiers[tierOf(kwh, season)].basic;
  const subtotal = Math.floor(basic + energy + kwh * (climateRate + fuelRate));
  const vat = Math.round(subtotal * vatRate);
  const fund = Math.floor((subtotal * fundRate) / 10) * 10;
  return Math.floor((subtotal + vat + fund) / 10) * 10;
}

export function applianceKwh(watt, hoursPerDay, days) {
  return (watt / 1000) * hoursPerDay * days;
}

// 기존 사용량에 가전 사용량을 더했을 때 늘어나는 요금
export function addedCost(baseKwh, addKwh, season) {
  const before = calcBill(baseKwh, season);
  const after = calcBill(baseKwh + addKwh, season);
  return { before, after, added: after - before };
}
