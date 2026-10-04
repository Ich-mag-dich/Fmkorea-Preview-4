/**
 * 팝업/옵션 페이지용. 사이트 야간 모드 쿠키를 못 읽으므로 시스템 다크 모드를 따라
 * <html>에 .dark를 붙이고, 시스템 설정이 바뀌면 바로 반영
 */
export const followSystemTheme = () => {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () =>
    document.documentElement.classList.toggle("dark", query.matches);
  apply();
  query.addEventListener("change", apply);
};
