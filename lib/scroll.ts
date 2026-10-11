/** 사용자가 직접 움직이면 위치 맞추기를 멈추는 입력 */
const USER_INPUTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
/** 높이 변화가 이 시간 동안 없으면 다 로드된 것으로 보고 멈춤 */
const SETTLE_MS = 1000;
/** 계속 바뀌어도 이 시간이 지나면 멈춤 */
const MAX_MS = 5000;

let stopCurrent: (() => void) | undefined;

const scrollParentOf = (el: Element) => {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(p).overflowY)) return p;
  }
  return null;
};

/**
 * 요소가 보이게 부드럽게 스크롤하고, 그 뒤 잠시 내용 높이가 바뀌면 다시 맞춤.
 * 미리보기의 이미지·임베드는 늦게 로드되며 높이가 바뀌는데(loading="lazy", X·인스타그램 높이 조정),
 * Firefox는 부드러운 스크롤 중에 위쪽 높이가 바뀌어도 위치를 보정하지 않아 목표보다 위에서 멈춤.
 * 높이 변화가 SETTLE_MS 동안 없거나 사용자가 직접 스크롤·클릭·키 입력을 하면 멈춤
 */
export const scrollIntoViewSettled = (
  el: Element,
  block: ScrollLogicalPosition,
) => {
  stopCurrent?.();
  const scroll = () => el.scrollIntoView({ behavior: "smooth", block });
  scroll();

  const parent = scrollParentOf(el);
  if (!parent) return;
  let settle: ReturnType<typeof setTimeout>;
  const stop = () => {
    observer.disconnect();
    clearTimeout(settle);
    clearTimeout(max);
    for (const type of USER_INPUTS)
      parent.removeEventListener(type, stop, true);
    if (stopCurrent === stop) stopCurrent = undefined;
  };
  const observer = new ResizeObserver(() => {
    scroll();
    clearTimeout(settle);
    settle = setTimeout(stop, SETTLE_MS);
  });
  const max = setTimeout(stop, MAX_MS);
  // 스크롤 영역 안의 내용(미리보기 창)이 커지거나 줄어드는 것을 봄
  for (const child of parent.children) observer.observe(child);
  for (const type of USER_INPUTS) parent.addEventListener(type, stop, true);
  stopCurrent = stop;
};
