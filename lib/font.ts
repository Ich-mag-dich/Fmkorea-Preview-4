/** 옵션 페이지에 보여줄 글꼴 목록. 웹 폰트는 안 쓰고 PC에 설치된 글꼴만 사용 */
export const FONT_PRESETS: { label: string; name: string }[] = [
  { label: "맑은 고딕", name: "Malgun Gothic" },
  { label: "Apple SD 산돌고딕 Neo", name: "Apple SD Gothic Neo" },
  { label: "Pretendard", name: "Pretendard" },
  { label: "나눔고딕", name: "NanumGothic" },
  { label: "나눔스퀘어", name: "NanumSquare" },
  { label: "Noto Sans KR", name: "Noto Sans KR" },
  { label: "스포카 한 산스 Neo", name: "Spoqa Han Sans Neo" },
  { label: "IBM Plex Sans KR", name: "IBM Plex Sans KR" },
];

/** 따옴표/세미콜론/중괄호 등 CSS를 깨뜨릴 수 있는 문자 제거 */
export const sanitizeFontName = (name: string) =>
  name.replace(/["'`;{}()<>\\]/g, "").trim();

/**
 * CSS font-family 값. 지정한 글꼴에 없는 글자(이모지 등)는 OS 기본 한글 글꼴로 대체
 * @returns 빈 이름이면 null (사이트 기본 글꼴 유지)
 */
export const toFontFamily = (name: string): string | null => {
  const safe = sanitizeFontName(name);
  if (!safe) return null;
  return `"${safe}", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
};

let canvasContext: CanvasRenderingContext2D | null = null;

/**
 * 글꼴이 설치돼 있는지 확인. 기본 글꼴(monospace/serif)과 글자 폭을 비교해서
 * 하나라도 다르면 지정한 글꼴로 그려진 것 = 설치됨
 */
export const isFontInstalled = (name: string): boolean => {
  const safe = sanitizeFontName(name);
  if (!safe) return false;
  canvasContext ??= document.createElement("canvas").getContext("2d");
  if (!canvasContext) return true; // 확인할 수 없으면 막지 않음
  const ctx = canvasContext;
  const sample = "가나다라 abcdefghij ABC 0123456789 mmmwwwiii";
  const width = (family: string) => {
    ctx.font = `32px ${family}`;
    return ctx.measureText(sample).width;
  };
  return ["monospace", "serif", "sans-serif"].some(
    base => width(`"${safe}", ${base}`) !== width(base),
  );
};
