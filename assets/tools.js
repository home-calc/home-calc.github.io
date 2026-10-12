// 평수별 가전 용량, TV 시청 거리, 사료 급여량 계산기의 브라우저 동작.
// 입력은 [data-in="이름"], 결과는 [data-out="이름"] 으로 찾는다.
import { PYEONG_M2, PET, TV_ANGLES, airconPyeong, dehumidifierLiters, feedGrams, purifierPyeong, rer, tvDistanceCm, tvInch } from './rules.js';

const root = document.querySelector('[data-tool]');
const val = (name) => {
  const el = root.querySelector(`[data-in="${name}"]`);
  return el.type === 'checkbox' ? el.checked : Math.max(0, Number(el.value) || 0);
};
const show = (name, text) => {
  const el = root.querySelector(`[data-out="${name}"]`);
  if (el) el.textContent = text;
};
const fix = (v, digits = 0) => v.toLocaleString('ko-KR', { maximumFractionDigits: digits });

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
