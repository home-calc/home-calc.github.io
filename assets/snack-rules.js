// 간식 계산기(남녀노소 하루 간식 열량)와 남편 사료(성인 남성 하루 열량) 계산식. 페이지를 만들 때(build)와 브라우저에서 같이 쓴다.
// 하루 열량은 보건복지부 2020 한국인 영양소 섭취기준의 에너지 필요추정량, 남편 사료는 Mifflin-St Jeor 식을 따른다.

// 남성 기초대사량 (Mifflin-St Jeor): 10 × 체중 + 6.25 × 키 − 5 × 나이 + 5
export const bmrMale = (kg, cm, age) => Math.max(0, 10 * kg + 6.25 * cm - 5 * age + 5);
// 활동량 계수
export const ACTIVITY = [
  ['소파와 한 몸', 1.2],
  ['주 1~3번 운동', 1.375],
  ['주 3~5번 운동', 1.55],
  ['매일 운동·몸 쓰는 일', 1.725],
];
// 성인 에너지 필요추정량 (2020 한국인 영양소 섭취기준, kcal/일): [이 나이부터, 남자, 여자]
export const ADULT_EER = [[19, 2600, 2000], [30, 2500, 1900], [50, 2200, 1700], [65, 2000, 1600], [75, 1900, 1500]];
export const adultEer = (age, female) => {
  const row = [...ADULT_EER].reverse().find(([from]) => age >= from) || ADULT_EER[0];
  return female ? row[2] : row[1];
};
export const MALE_EER = ADULT_EER.map(([from, male]) => [from, male]);
export const maleEer = (age) => adultEer(age, false);
// 살을 뺄 때 흔히 줄이는 양
export const DIET_CUT = 500;

// 바꿔 보는 음식 단위 (어림 열량): [이름, kcal, 세는 말]
export const FOODS = {
  rice: ['밥 한 공기(210g)', 315, '공기'],
  pork: ['삼겹살 1인분(200g)', 660, '인분'],
  ramen: ['라면 1봉지', 500, '봉지'],
  chicken: ['프라이드치킨 한 마리', 2000, '마리'],
  nuts: ['하루견과 한 봉(20g)', 120, '봉'],
  milk: ['흰 우유 1팩(200ml)', 130, '팩'],
  soymilk: ['두유 1팩(190ml)', 130, '팩'],
  banana: ['바나나 1개', 90, '개'],
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
export const kidEer = (age, girl) => {
  const row = KID_EER.find(([[from, to]]) => age >= from && age <= to) || (age < KID_EER[0][0][0] ? KID_EER[0] : KID_EER.at(-1));
  return girl ? row[2] : row[1];
};
// 간식은 어린이는 하루 열량의 10~15%, 어른은 10% 안쪽으로 권하는 경우가 많다. 유아는 하루 2번, 그 뒤로는 1~2번으로 나눈다.
export const snackTimes = (age) => (age <= 5 ? 2 : 1);
// WHO: 첨가당(유리당)은 하루 열량의 10% 미만, 당 1g = 4kcal
export const sugarLimit = (kcal) => (kcal * 0.1) / 4;

// 간식 계산기 대상별 설정. female 이 없으면 성별을 입력받는다.
export const SNACK_WHO = {
  kids: { ages: [3, 11], share: [0.1, 0.15], foods: ['milk', 'banana'] },
  women: { ages: [19, 64], female: true, share: [0.1], foods: ['nuts', 'banana'] },
  men: { ages: [19, 64], female: false, share: [0.1], foods: ['nuts', 'banana'] },
  seniors: { ages: [65, 100], share: [0.1], foods: ['soymilk', 'banana'] },
};
export function snackBudget(who, age, female) {
  const w = SNACK_WHO[who];
  const a = Math.min(w.ages[1], Math.max(w.ages[0], age));
  const fem = w.female ?? female;
  const daily = who === 'kids' ? kidEer(a, fem) : adultEer(a, fem);
  const [lo, hi = lo] = w.share.map((s) => daily * s);
  return { age: a, daily, lo, hi, times: who === 'kids' ? snackTimes(a) : 1, sugar: sugarLimit(daily) };
}
