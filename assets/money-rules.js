// 공모주·배당·청약 가점 계산식. 페이지를 만들 때(build)와 브라우저에서 같이 쓴다.

// ---- 공모주 ----
// 청약할 수 있는 주수: 증거금 ÷ (공모가 × 증거금률), 소수점 버림
export const ipoShares = (deposit, price, rate) => (price > 0 && rate > 0 ? Math.floor(deposit / (price * rate)) : 0);
// 1주당 필요한 증거금
export const ipoDepositPerShare = (price, rate) => price * rate;
// 균등 배정: 일반 배정 물량의 절반을 최소 수량 이상 청약한 계좌 수로 나눈다. 1주 미만이면 추첨 확률이다.
export const ipoEqual = (allotted, accounts) => (accounts > 0 ? allotted / 2 / accounts : 0);
// 비례 배정: 내 청약 주수 ÷ 비례 경쟁률 (= 비례 물량 대비 전체 청약 주수)
export const ipoProportional = (shares, ratio) => (ratio > 0 ? shares / ratio : 0);
// 상장일 가격 범위: 공모가의 60%~400% (2023년 6월부터)
export const LISTING_RANGE = [0.6, 4];
export const LISTING_STEPS = [0.6, 0.8, 1, 1.3, 1.5, 2, 3, 4];

// ---- 배당 ----
// 배당소득세 15.4% (소득세 14% + 지방소득세 1.4%). 원 단위 미만은 버린다.
export const DIVIDEND_TAX = 0.154;
export function dividendAfterTax(perShare, shares) {
  const gross = Math.floor(perShare * shares);
  const income = Math.floor((gross * 0.14) / 10) * 10;
  const local = Math.floor((income * 0.1) / 10) * 10;
  return { gross, tax: income + local, net: gross - income - local };
}

// 한국거래소 휴장일 (주말 빼고). 공휴일·대체공휴일·근로자의 날·연말 휴장일. 임시공휴일은 지정되면 더해야 한다.
export const MARKET_HOLIDAYS = [
  // 2026
  '2026-01-01', '2026-02-16', '2026-02-17', '2026-02-18', '2026-03-02', '2026-05-01', '2026-05-05', '2026-05-25',
  '2026-06-03', '2026-08-17', '2026-09-24', '2026-09-25', '2026-10-05', '2026-10-09', '2026-12-25', '2026-12-31',
  // 2027
  '2027-01-01', '2027-02-08', '2027-02-09', '2027-03-01', '2027-05-05', '2027-05-13', '2027-08-16', '2027-09-14',
  '2027-09-15', '2027-09-16', '2027-10-04', '2027-10-11', '2027-12-27', '2027-12-31',
];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const isTradingDay = (day) => {
  const d = new Date(`${day}T00:00:00`);
  return d.getDay() !== 0 && d.getDay() !== 6 && !MARKET_HOLIDAYS.includes(day);
};
// day 에서 n 영업일 앞(음수) 또는 뒤(양수)의 날
export function shiftTradingDays(day, n) {
  const d = new Date(`${day}T00:00:00`);
  let left = Math.abs(n);
  while (left > 0) {
    d.setDate(d.getDate() + Math.sign(n));
    if (isTradingDay(iso(d))) left -= 1;
  }
  return iso(d);
}
// 결제가 매수 2영업일 뒤라서, 배당기준일에 주주이려면 기준일 2영업일 전까지 사야 한다. 배당락일은 그다음 영업일.
// 기준일이 휴장일이면 그 전 마지막 영업일을 기준으로 센다.
export function dividendDates(recordDay) {
  // 결제일로 쓸 날: 기준일이 영업일이면 그날, 휴장일이면 그 전 마지막 영업일 (연말 12월 31일 휴장 등)
  const settle = isTradingDay(recordDay) ? recordDay : shiftTradingDays(recordDay, -1);
  const lastBuy = shiftTradingDays(settle, -2);
  return { lastBuy, exDate: shiftTradingDays(lastBuy, 1) };
}
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const dayLabel = (day) => {
  const d = new Date(`${day}T00:00:00`);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAYS[d.getDay()]})`;
};

// ---- 청약 가점 (민영주택 가점제, 84점 만점) ----
// 무주택 기간: 1년 미만 2점, 1년마다 2점씩, 15년 이상 32점. 유주택자는 0점.
export const homelessScore = (years, owner) => (owner ? 0 : Math.min(32, 2 + 2 * Math.floor(Math.max(0, years))));
// 부양가족 수: 0명 5점, 1명마다 5점씩, 6명 이상 35점 (본인 제외)
export const dependentScore = (n) => Math.min(35, 5 + 5 * Math.floor(Math.max(0, n)));
// 청약통장 가입 기간: 6개월 미만 1점, 6개월~1년 미만 2점, 그 뒤 1년마다 1점씩, 15년 이상 17점
export function accountScore(years) {
  if (years < 0.5) return 1;
  if (years < 1) return 2;
  return Math.min(17, 2 + Math.floor(years));
}
export const SCORE_MAX = { homeless: 32, dependent: 35, account: 17, total: 84 };
