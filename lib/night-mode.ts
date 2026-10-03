/**
 * fmkorea 야간 모드 여부. 사이트가 쿠키 night_mode=Y/N 으로 저장한다
 *
 * @returns 야간 모드면 true
 */
export const isNightMode = (): boolean =>
  document.cookie.split("; ").some(cookie => cookie === "night_mode=Y");
