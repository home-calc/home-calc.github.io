// 도시가스 주택용 요금 계산식. 페이지를 만들 때(build)와 브라우저에서 같이 쓴다.
// 지역별 단가는 gas-rates.json (한국도시가스협회 "시·도별 도시가스 요금표", 원/MJ, 부가세 별도)에 있고,
// 매달 scripts/gas-update.js 가 협회 자료실의 새 요금표로 고친다. 빌드할 때 페이지에 넣어 브라우저로 넘긴다.
// gas-rates.json 의 지역 하나: { area, company, basic(개별난방 가구 월 기본요금), cook, heat, central(취사·주택난방·중앙난방 단가), row(요금표의 지역 칸) }

// 도시가스 1㎥ 의 열량(MJ). 회사·달마다 조금씩 다르고 고지서에 "단위열량"으로 적혀 있다.
export const MJ_PER_M3 = 42.7;
// 취사·난방을 같이 쓰는 집은 한 달 516MJ 까지 취사 단가, 넘는 부분은 난방 단가를 매긴다 (지역에 따라 조금 다를 수 있음)
export const COOK_LIMIT_MJ = 516;
export const VAT = 0.1;

// 한 달 요금. kind: 'combo'(취사·개별난방 겸용) | 'central'(중앙난방) | 'cook'(취사만)
export function gasBill(rate, m3, kind = 'combo', mjPerM3 = MJ_PER_M3) {
  const mj = m3 * mjPerM3;
  let usage;
  if (kind === 'central') usage = mj * rate.central;
  else if (kind === 'cook') usage = mj * rate.cook;
  else usage = Math.min(mj, COOK_LIMIT_MJ) * rate.cook + Math.max(0, mj - COOK_LIMIT_MJ) * rate.heat;
  const basic = rate.basic;
  const vat = (basic + usage) * VAT;
  // 고지서는 10원 미만을 버린다
  const total = Math.floor((basic + usage + vat) / 10) * 10;
  return { mj, basic, usage, vat, total };
}
