import { TARIFF, addedCost, applianceKwh, seasonOfMonth, tierOf } from './tariff.js?v=1c3b8fb5';

const data = JSON.parse(document.getElementById('calc-data').textContent);
const $ = (id) => document.getElementById(id);
const won = (n) => `${Math.round(n).toLocaleString('ko-KR')}원`;
const num = (el) => Math.max(0, Number(el.value) || 0);

const watt = $('watt');
const hours = $('hours');
const days = $('days');
const base = $('base');
const season = $('season');
const presetInputs = [...document.querySelectorAll('input[name="preset"]')];
const currentPreset = () => data.presets[presetInputs.find((i) => i.checked).value];

season.value = seasonOfMonth(new Date().getMonth() + 1);

// 쿠팡이 준 링크 코드와 같은 속성으로 연다
const out = (url) => `href="${url}" target="_blank" rel="sponsored nofollow noopener" referrerpolicy="unsafe-url"`;
const buyLink = (url) => `<a class="buy" ${out(url)}>쿠팡에서 보기</a>`;
// 쿠팡 배너 이미지(세로 1:2)에서 상품 사진 부분만 보이게 CSS 로 잘라 쓴다
const thumb = (p) => (p.image ? `<a class="ph" ${out(p.link)} tabindex="-1" aria-hidden="true"><img src="${p.image}" alt="" loading="lazy"></a>` : '');
const price = (p) => (p.price ? `<small class="price">${won(p.price)}</small>` : '');
const monthly = (w) => addedCost(num(base), applianceKwh(w, Math.min(24, num(hours)), Math.min(31, num(days))), season.value).added;

// 저전력 대안 비교. 화면에 나온 제휴 링크 목록을 돌려준다.
function renderAlternatives(currentWatt, added) {
  const box = $('alts');
  if (!box) return [];
  const shown = (data.alternatives || []).filter((a) => a.watt < currentWatt);
  $('alt-list').innerHTML = shown
    .map((a) => {
      const cost = monthly(a.watt);
      return `<li>${thumb(a)}<div class="what"><b>${a.label || a.name}</b><small>${a.name} · 약 ${a.watt}W</small>${price(a)}</div>
        <div class="cost">월 ${won(cost)}<span class="save">${won(added - cost)} 덜 나와요</span></div>${a.link ? buyLink(a.link) : ''}</li>`;
    })
    .join('');
  box.hidden = shown.length === 0 || added <= 0;
  return box.hidden ? [] : shown.map((a) => a.link).filter(Boolean);
}

// 선택한 가전 종류의 추천 제품. 대안 비교에 이미 나온 제품은 빼고 보여 준다.
function renderRecs(skip) {
  const category = presetInputs.length ? currentPreset().name : data.category;
  const list = ((data.products || {})[category] || []).filter((p) => p.link && !skip.includes(p.link));
  $('rec-heading').textContent = `${category} 추천 제품`;
  $('rec-list').innerHTML = list
    .map((p) => {
      const cost = p.watt ? `<div class="cost">월 ${won(monthly(p.watt))}</div>` : '';
      return `<li>${thumb(p)}<div class="what"><b>${p.label}</b>${p.watt ? `<small>${p.watt}W</small>` : ''}${price(p)}</div>${cost}${buyLink(p.link)}</li>`;
    })
    .join('');
  $('recs').hidden = list.length === 0;
  return list.length > 0;
}

function render() {
  const w = num(watt);
  const d = Math.min(31, num(days));
  const kwh = applianceKwh(w, Math.min(24, num(hours)), d);
  const s = season.value;
  const { before, after, added } = addedCost(num(base), kwh, s);
  const tierBefore = tierOf(num(base), s);
  const tierAfter = tierOf(num(base) + kwh, s);

  $('r-added').textContent = won(added);
  $('r-daily').textContent = d > 0 ? won(added / d) : '-';
  $('r-kwh').textContent = `${kwh.toLocaleString('ko-KR', { maximumFractionDigits: 1 })}kWh`;
  $('r-before').textContent = won(before);
  $('r-after').textContent = won(after);
  $('r-tier').textContent = `${tierAfter + 1}단계 · kWh당 ${TARIFF.tiers[tierAfter].rate}원`;

  const jumped = tierAfter !== tierBefore;
  $('r-stamp').hidden = !jumped;
  $('r-stamp').textContent = `누진 ${tierAfter + 1}단계`;
  $('r-warn').hidden = !jumped;
  $('r-warn').textContent = `이 가전을 쓰면 누진 ${tierBefore + 1}단계에서 ${tierAfter + 1}단계로 올라가 단가가 비싸집니다.`;

  const altLinks = renderAlternatives(w, added);
  const recLinks = renderRecs(altLinks);
  $('coupang-notice').hidden = !(altLinks.length || recLinks);
}

presetInputs.forEach((input) =>
  input.addEventListener('change', () => {
    const p = currentPreset();
    watt.value = p.watt;
    hours.value = p.hours;
    render();
  }),
);

document.querySelectorAll('[data-watt]').forEach((btn) =>
  btn.addEventListener('click', () => {
    watt.value = btn.dataset.watt;
    render();
  }),
);

[watt, hours, days, base, season].forEach((el) => el.addEventListener('input', render));
render();
