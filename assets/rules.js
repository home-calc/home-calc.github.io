// 도구들의 계산식. 페이지를 만들 때(build)와 브라우저에서 같이 쓴다.

export const PYEONG_M2 = 3.3058;

// 평수별 가전 용량: 흔히 쓰는 어림 기준
// 제습기: 하루 제습량(L)을 집 면적(평)의 절반쯤으로 잡는다
export const dehumidifierLiters = (pyeong) => pyeong * 0.5;
// 공기청정기: 쓰는 공간의 1.5배 면적용 제품을 고른다
export const purifierPyeong = (pyeong) => pyeong * 1.5;
// 에어컨: 냉방할 공간과 같은 평형, 더운 조건이면 20% 크게
export const airconPyeong = (pyeong, hot) => pyeong * (hot ? 1.2 : 1);

// TV 시청 거리: 화면이 시야에서 차지하는 가로 각도로 계산한다 (16:9 화면)
export const TV_ANGLES = { wide: 40, standard: 30 };
const WIDTH_RATIO = 16 / Math.hypot(16, 9);
// 대각선 inch 인 화면을 가로 시야각 angle 도로 보는 거리(cm)
export const tvDistanceCm = (inch, angle) => (inch * 2.54 * WIDTH_RATIO) / 2 / Math.tan(((angle / 2) * Math.PI) / 180);
// 거리 cm 에서 시야각 angle 도가 되는 화면 크기(inch)
export const tvInch = (cm, angle) => (cm * 2 * Math.tan(((angle / 2) * Math.PI) / 180)) / WIDTH_RATIO / 2.54;

// 사료 급여량: 휴식 에너지 요구량(RER) = 70 x 체중(kg)^0.75 에 상태별 계수를 곱한다
export const rer = (kg) => 70 * kg ** 0.75;
export const PET = {
  dog: {
    name: '강아지',
    states: [
      ['중성화한 성견', 1.6],
      ['중성화하지 않은 성견', 1.8],
      ['체중을 줄여야 하는 성견', 1.0],
      ['4개월 미만 강아지', 3.0],
      ['4개월~성견 전 강아지', 2.0],
    ],
    weights: [2, 3, 5, 7, 10, 15, 20, 30],
    defaultKg: 5,
    kcalPerKg: 3500,
  },
  cat: {
    name: '고양이',
    states: [
      ['중성화한 성묘', 1.2],
      ['중성화하지 않은 성묘', 1.4],
      ['체중을 줄여야 하는 성묘', 0.8],
      ['성장기 새끼 고양이', 2.5],
    ],
    weights: [2, 3, 4, 5, 6, 7, 8],
    defaultKg: 4,
    kcalPerKg: 3800,
  },
};
// 하루 급여량(g): 필요 열량 / 사료 1kg 의 열량
export const feedGrams = (kg, factor, kcalPerKg) => (rer(kg) * factor * 1000) / kcalPerKg;
