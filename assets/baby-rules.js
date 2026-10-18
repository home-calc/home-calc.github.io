// 육아 계산기 계산식: 아기 개월 수·기념일, 분유 수유량. 페이지를 만들 때(build)와 브라우저에서 같이 쓴다.

const parse = (day) => new Date(`${day}T00:00:00`);
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const daysBetween = (from, to) => Math.round((parse(to) - parse(from)) / 86400000);

// 만 나이 개월: 태어난 날에서 꽉 찬 달 수와 남은 날 수
export function ageMonths(birth, today) {
  const b = parse(birth);
  const t = parse(today);
  let months = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) months -= 1;
  const anchor = new Date(b);
  anchor.setMonth(b.getMonth() + months);
  // 31일생이 짧은 달을 넘을 때 날짜가 밀리지 않게 그달 마지막 날로 맞춘다
  if (anchor.getDate() !== b.getDate()) anchor.setDate(0);
  return { months: Math.max(0, months), days: Math.max(0, daysBetween(iso(anchor), today)) };
}

// 태어난 날을 1일째로 센다: 100일 = 태어난 날 + 99일
export const dayCount = (birth, today) => daysBetween(birth, today) + 1;
export function nthDay(birth, n) {
  const d = parse(birth);
  d.setDate(d.getDate() + n - 1);
  return iso(d);
}
export function birthday(birth, years) {
  const d = parse(birth);
  d.setFullYear(d.getFullYear() + years);
  return iso(d);
}
export const MILESTONES = [
  ['50일', (b) => nthDay(b, 50)],
  ['100일 (백일)', (b) => nthDay(b, 100)],
  ['200일', (b) => nthDay(b, 200)],
  ['300일', (b) => nthDay(b, 300)],
  ['첫돌', (b) => birthday(b, 1)],
  ['500일', (b) => nthDay(b, 500)],
  ['두 돌', (b) => birthday(b, 2)],
  ['1000일', (b) => nthDay(b, 1000)],
];

// 이유식 단계 (대한소아청소년과학회 등에서 흔히 쓰는 시기 구분, 만 개월)
export const WEANING = [
  { from: 0, to: 4, name: '수유기', note: '모유나 분유만 먹습니다. 물이나 과즙도 따로 줄 필요가 없습니다.' },
  { from: 4, to: 7, name: '초기 이유식', note: '생후 4~6개월 사이, 보통 6개월 무렵 쌀미음부터 하루 1번 시작합니다. 철분 보충을 위해 소고기를 일찍 넣습니다.' },
  { from: 7, to: 9, name: '중기 이유식', note: '알갱이가 있는 죽으로 하루 2번. 혀로 으깰 수 있는 정도의 굳기입니다.' },
  { from: 9, to: 12, name: '후기 이유식', note: '무른 밥 형태로 하루 3번. 잇몸으로 씹을 수 있는 정도입니다.' },
  { from: 12, to: 999, name: '완료기 (유아식)', note: '어른 밥보다 부드럽고 싱겁게, 하루 3끼와 간식 1~2번. 생우유를 시작할 수 있습니다.' },
];
export const weaningStage = (months) => WEANING.find((s) => months >= s.from && months < s.to);

// 분유: 하루 총량은 체중 1kg당 약 150ml (최대 약 1,000ml), 하루 수유 횟수는 개월 수에 따라 줄어든다
export const ML_PER_KG = 150;
export const MAX_ML = 1000;
export const FEEDS = [
  { from: 0, to: 1, times: 8 },
  { from: 1, to: 2, times: 7 },
  { from: 2, to: 4, times: 6 },
  { from: 4, to: 6, times: 5 },
  { from: 6, to: 12, times: 4 },
];
export function formula(kg, months) {
  const total = Math.min(MAX_ML, kg * ML_PER_KG);
  const times = (FEEDS.find((f) => months >= f.from && months < f.to) || FEEDS.at(-1)).times;
  // 이유식을 시작하면 분유는 조금씩 줄인다 (6개월 이후 하루 500~800ml 가 흔한 범위)
  const daily = months >= 6 ? Math.min(total, 800) : total;
  return { daily, times, perFeed: daily / times };
}
