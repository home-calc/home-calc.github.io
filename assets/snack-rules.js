// 남편 사료(성인 남성 하루 열량)와 어린이 간식 계산식. 페이지를 만들 때(build)와 브라우저에서 같이 쓴다.
// 웃자고 만든 이름이지만 계산은 Mifflin-St Jeor 식과 보건복지부 2020 한국인 영양소 섭취기준을 따른다.

// 남성 기초대사량 (Mifflin-St Jeor): 10 × 체중 + 6.25 × 키 − 5 × 나이 + 5
export const bmrMale = (kg, cm, age) => Math.max(0, 10 * kg + 6.25 * cm - 5 * age + 5);
// 활동량 계수
export const ACTIVITY = [
  ['소파와 한 몸', 1.2],
  ['주 1~3번 운동', 1.375],
  ['주 3~5번 운동', 1.55],
  ['매일 운동·몸 쓰는 일', 1.725],
];
// 성인 남성 에너지 필요추정량 (2020 한국인 영양소 섭취기준, kcal/일): [이 나이부터, 열량]
export const MALE_EER = [[19, 2600], [30, 2500], [50, 2200], [65, 2000], [75, 1900]];
export const maleEer = (age) => [...MALE_EER].reverse().find(([from]) => age >= from)?.[1] || MALE_EER[0][1];
// 살을 뺄 때 흔히 줄이는 양
export const DIET_CUT = 500;

// 재미로 바꿔 보는 음식 단위 (어림 열량)
export const FOODS = {
  rice: ['밥 한 공기(210g)', 315],
  pork: ['삼겹살 1인분(200g)', 660],
  ramen: ['라면 1봉지', 500],
  chicken: ['프라이드치킨 한 마리', 2000],
  nuts: ['하루견과 한 봉(20g)', 120],
};
export const husband = (kg, cm, age, factor) => {
  const bmr = bmrMale(kg, cm, age);
  const daily = bmr * factor;
  return { bmr, daily, diet: Math.max(0, daily - DIET_CUT), snack: daily * 0.1 };
};

// 어린이 에너지 필요추정량 (2020 한국인 영양소 섭취기준, kcal/일): [나이 범위, 남자, 여자]
export const KID_EER = [
  [[3, 5], 1400, 1400],
  [[6, 8], 1700, 1500],
  [[9, 11], 2000, 1800],
];
export const KID_AGES = [3, 11];
export const kidEer = (age, girl) => {
  const row = KID_EER.find(([[from, to]]) => age >= from && age <= to) || (age < KID_AGES[0] ? KID_EER[0] : KID_EER.at(-1));
  return girl ? row[2] : row[1];
};
// 간식은 하루 열량의 10~15% 정도로 권하는 경우가 많다. 유아는 하루 2번, 학령기는 1~2번으로 나눈다.
export const SNACK_SHARE = [0.1, 0.15];
export const snackTimes = (age) => (age <= 5 ? 2 : 1);
// WHO: 첨가당(유리당)은 하루 열량의 10% 미만, 당 1g = 4kcal
export const sugarLimit = (kcal) => (kcal * 0.1) / 4;
export const KID_FOODS = {
  milk: ['흰 우유 1팩(200ml)', 130, '팩'],
  banana: ['바나나 1개', 90, '개'],
};
export const kidSnack = (age, girl) => {
  const daily = kidEer(age, girl);
  const [lo, hi] = SNACK_SHARE.map((s) => daily * s);
  return { daily, lo, hi, times: snackTimes(age), sugar: sugarLimit(daily) };
};
