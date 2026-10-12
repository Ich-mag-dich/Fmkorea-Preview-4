/**
 * 개발 모드(bun run dev)에서만 콘솔에 찍음. 배포 빌드에선 빈 함수.
 * console.log.bind라서 개발자 도구에 이 파일이 아니라 부른 곳의 줄 번호가 나옴.
 * 앞머리를 붙여서 에펨코리아 사이트가 찍는 로그와 구분하고 필터로 걸러 볼 수 있게 함
 *
 * 사용자가 버그를 제보할 때 도움이 되는 실패는 이걸 쓰지 말고 console.warn/error로 배포판에도 남긴다
 */
export const devLog: (...args: unknown[]) => void =
  import.meta.env.DEV ? console.log.bind(console, "[FMP]") : () => {};
