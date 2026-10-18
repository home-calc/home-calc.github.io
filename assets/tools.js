// 평수별 가전 용량, TV 시청 거리, 사료 급여량, 공모주·배당, 청약 가점, 도시가스 요금, 육아 계산기의 브라우저 동작.
// 입력은 [data-in="이름"], 결과는 [data-out="이름"] 으로 찾는다.
import { PYEONG_M2, PET, TV_ANGLES, airconPyeong, dehumidifierLiters, feedGrams, purifierPyeong, rer, tvDistanceCm, tvInch } from './rules.js?v=1c3b8fb5';
import { accountScore, dayLabel, dependentScore, dividendAfterTax, dividendDates, homelessScore, ipoEqual, ipoProportional, ipoShares, LISTING_RANGE } from './money-rules.js?v=1c3b8fb5';
import { gasBill } from './gas-rules.js?v=1c3b8fb5';
import { MILESTONES, ageMonths, dayCount, formula, weaningStage } from './baby-rules.js?v=1c3b8fb5';

const root = document.querySelector('[data-tool]');
const val = (name) => {
  const el = root.querySelector(`[data-in="${name}"]`);
  if (el.type === 'checkbox') return el.checked;
  // 날짜처럼 글자 그대로 쓰는 입력
  if ('raw' in el.dataset) return el.value;
  return Math.max(0, Number(el.value) || 0);
};
const show = (name, text) => {
  const el = root.querySelector(`[data-out="${name}"]`);
  if (el) el.textContent = text;
};
const fix = (v, digits = 0) => v.toLocaleString('ko-KR', { maximumFractionDigits: digits });
const won = (v) => `${fix(Math.round(v))}원`;
// 1주 미만 배정은 추첨 확률로 보여 준다
const sharesText = (v) => (v >= 1 ? `${fix(Math.floor(v))}주` : v > 0 ? `추첨 (확률 약 ${fix(v * 100, 1)}%)` : '0주');

const tools = {
  dehumidifier() {
    const p = val('pyeong');
    show('main', `${fix(dehumidifierLiters(p), 1)}L`);
    show('sub', `${fix(p)}평(약 ${fix(p * PYEONG_M2)}㎡) 기준 하루 제습량`);
  },
  purifier() {
    const p = val('pyeong');
    const need = purifierPyeong(p);
    show('main', `${fix(need)}평형`);
    show('sub', `사용 면적 약 ${fix(need * PYEONG_M2)}㎡ 이상인 제품`);
  },
  aircon() {
    const p = val('pyeong');
    const need = airconPyeong(p, val('hot'));
    show('main', `${fix(need)}평형`);
    show('sub', `냉방 면적 약 ${fix(need * PYEONG_M2, 1)}㎡ 이상 · ${need > 10 ? '스탠드형' : '벽걸이형'}을 많이 씁니다`);
  },
  tv() {
    const cm = val('meter') * 100;
    const small = tvInch(cm, TV_ANGLES.standard);
    const big = tvInch(cm, TV_ANGLES.wide);
    show('main', `${fix(small)}~${fix(big)}인치`);
    show('sub', `${fix(cm / 100, 1)}m 에서 화면이 시야의 30~40도를 채우는 크기`);
  },
  pet() {
    const spec = PET[root.dataset.pet];
    const kg = val('kg');
    const factor = spec.states[val('state')][1];
    const grams = feedGrams(kg, factor, val('kcal') || spec.kcalPerKg);
    show('main', `${fix(grams)}g`);
    show('sub', `하루 필요 열량 약 ${fix(rer(kg) * factor)}kcal`);
    show('month', `${fix((grams * 30) / 1000, 1)}kg`);
    const bag = val('bag');
    show('bag', bag > 0 && grams > 0 ? `약 ${fix((bag * 1000) / grams)}일` : '-');
  },
};

Object.assign(tools, {
  ipo() {
    const price = val('price');
    const rate = val('rate') / 100;
    const shares = ipoShares(val('deposit'), price, rate);
    const ok = shares >= val('min');
    const equal = ok ? ipoEqual(val('allot'), val('accounts')) : 0;
    const prop = ok ? ipoProportional(shares, val('ratio')) : 0;
    const got = Math.floor(equal) + Math.floor(prop);
    show('main', `${fix(got)}주`);
    show('sub', ok ? `균등 ${fix(equal, 2)}주 + 비례 ${fix(prop, 2)}주 (1주 미만은 버린 값)` : `최소 ${fix(val('min'))}주 이상 청약해야 합니다`);
    show('shares', `${fix(shares)}주`);
    show('equal', sharesText(equal));
    show('prop', sharesText(prop));
    show('mindep', won(val('min') * price * rate));
    show('pay', won(got * price));
    show('refund', won(Math.max(0, shares * price * rate - got * price)));
  },
  listing() {
    const price = val('price');
    const qty = val('qty');
    const sell = val('sell');
    const profit = (sell - price) * qty;
    show('main', `${profit >= 0 ? '+' : ''}${won(profit)}`);
    show('sub', `1주당 ${sell >= price ? '+' : ''}${won(sell - price)} · ${fix(qty)}주`);
    show('pct', price > 0 ? `${sell >= price ? '+' : ''}${fix(((sell - price) / price) * 100, 1)}%` : '-');
    show('max', won(price * LISTING_RANGE[1]));
    show('double', won(price * 2));
    show('min', won(price * LISTING_RANGE[0]));
  },
  dividend() {
    const record = val('record');
    const { gross, tax, net } = dividendAfterTax(val('per'), val('qty'));
    show('main', won(net));
    show('sub', `${fix(val('qty'))}주 × 1주당 ${won(val('per'))}`);
    show('gross', won(gross));
    show('tax', `-${won(tax)}`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(record)) {
      const { lastBuy, exDate } = dividendDates(record);
      show('lastbuy', dayLabel(lastBuy));
      show('ex', dayLabel(exDate));
    }
  },
  gas() {
    // 지역별 단가는 페이지에 들어 있다 (값은 "지역코드:번호")
    const regions = JSON.parse(document.getElementById('gas-data').textContent);
    const [slug, i] = val('area').split(':');
    const rate = regions.find((r) => r.slug === slug).areas[Number(i)];
    const kind = val('kind');
    const { mj, basic, usage, vat, total } = gasBill(rate, val('m3'), kind, val('mjm3'));
    show('main', won(total));
    show('sub', `${fix(val('m3'))}㎥ · ${rate.company}`);
    show('mj', `${fix(mj)}MJ`);
    show('basic', won(basic));
    show('usage', won(usage));
    show('vat', won(vat));
    show('rate', kind === 'combo' && rate.cook !== rate.heat ? `취사 ${rate.cook}원 / 난방 ${rate.heat}원 (MJ당)` : `MJ당 ${rate[kind === 'cook' ? 'cook' : kind === 'central' ? 'central' : 'heat']}원`);
  },
  babyage() {
    const birth = val('birth');
    const today = val('today');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return;
    const { months, days } = ageMonths(birth, today);
    const born = today >= birth;
    show('main', born ? `${months}개월 ${days}일` : '태어나기 전');
    show('sub', born ? `만 ${months}개월` : '');
    show('count', born ? `${fix(dayCount(birth, today))}일째` : '-');
    show('stage', born ? weaningStage(months).name : '-');
    MILESTONES.forEach(([, at], i) => {
      const day = at(birth);
      show(`m${i}`, `${dayLabel(day)}${day < today ? ' (지남)' : day === today ? ' (오늘)' : ''}`);
    });
  },
  formula() {
    const { daily, times, perFeed } = formula(val('kg'), val('months'));
    show('main', `${fix(daily)}ml`);
    show('sub', `몸무게 ${fix(val('kg'), 1)}kg · 만 ${fix(val('months'))}개월`);
    show('times', `${times}번 안팎`);
    show('per', `약 ${fix(Math.round(perFeed / 10) * 10)}ml`);
  },
  score() {
    const h = homelessScore(val('homeless'), val('owner'));
    const d = dependentScore(val('dependents'));
    const a = accountScore(val('account'));
    show('main', `${h + d + a}점`);
    show('sub', '84점 만점');
    show('h', `${h}점 / 32점`);
    show('d', `${d}점 / 35점`);
    show('a', `${a}점 / 17점`);
  },
});

// 아기 개월 수 계산기는 기준일을 오늘로, 생년월일을 석 달 전으로 맞춰 둔다
if (root.dataset.tool === 'babyage') {
  const d = new Date();
  const iso = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  root.querySelector('[data-in="today"]').value = iso(d);
  d.setMonth(d.getMonth() - 3);
  root.querySelector('[data-in="birth"]').value = iso(d);
}

const run = tools[root.dataset.tool];
root.querySelectorAll('[data-in]').forEach((el) => el.addEventListener('input', run));
// 표의 줄을 누르면 그 값으로 계산한다
document.querySelectorAll('[data-set]').forEach((el) =>
  el.addEventListener('click', () => {
    const [name, value] = el.dataset.set.split('=');
    root.querySelector(`[data-in="${name}"]`).value = value;
    run();
    root.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }),
);
run();
