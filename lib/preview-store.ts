type Listener = () => void;

// 현재 열려 있는 프리뷰 링크
let current: string | null = null;

// 미리보기가 쌓은 방문 기록 항목의 주소. 닫은 뒤 앞으로 가기로 돌아오면 다시 열려고 기억해 둠.
// history.state에 표시를 붙여 구분하지 않는 이유: Chromium에서는 content script가 읽는
// history.state와 popstate의 e.state가 갱신되지 않고 이전 값으로 남을 때가 있어서,
// 원래 페이지로 돌아와도 미리보기 항목으로 착각해 그 페이지 주소로 미리보기를 다시 열었음
let entryHref: string | null = null;

// 미리보기를 연 페이지 주소 (목록 등). 주소창이 글 주소로 바뀐 뒤에도 원래 페이지를 알기 위해 둠
let openerHref: string | null = null;

// X/ESC/바깥 클릭으로 닫으며 부른 history.back()의 popstate를 기다리는 중인지
let backPending = false;

const listeners = new Set<Listener>();

// 현재 열려 있는 프리뷰 링크가 바뀌었음을 구독자들에게 알림
const emit = () => listeners.forEach(l => l());

export const previewStore = {
  /**
   * 미리보기를 열고 주소창을 게시글 주소로 바꿈
   *
   * @param fromHistory 앞으로 가기로 다시 열 때 true. 이미 주소가 바뀐 상태라 기록을 건드리지 않음
   */
  open(href: string, { fromHistory = false } = {}) {
    if (!fromHistory) {
      // 열린 상태에서 다른 글로 바뀌면 기록을 더 쌓지 않고 교체
      if (current) {
        history.replaceState(null, "", href);
      } else {
        openerHref = location.href;
        history.pushState(null, "", href);
      }
      entryHref = location.href;
    }
    current = href;
    emit();
  },
  /** X/ESC/바깥 클릭으로 닫기. 열 때 쌓은 기록을 되돌림 */
  close() {
    if (!current) return;
    current = null;
    emit();
    backPending = true;
    history.back();
  },
  /** 뒤로 가기 → 미리보기 닫기, 앞으로 가기로 미리보기 기록에 돌아오면 → 다시 열기 */
  onPopState() {
    if (backPending) {
      backPending = false;
      return;
    }
    if (current) {
      // 미리보기 항목에서 벗어남. 이미 이전 항목이라 기록은 건드리지 않음
      current = null;
      emit();
    } else if (location.href === entryHref) {
      previewStore.open(location.href, { fromHistory: true });
    }
  },
  get: () => current,
  getOpener: () => openerHref,
  subscribe(l: Listener) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
