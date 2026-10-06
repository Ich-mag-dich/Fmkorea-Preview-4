/**
 * fmkorea 요청 공통 함수.
 *
 * 사이트는 요청마다 형식이 조금씩 달라서, 새 요청을 추가할 때는 개발자 도구 네트워크 탭에서
 * 사이트가 실제로 보내는 요청(주소, 헤더, 본문 순서)을 확인하고 그대로 맞추는 게 원칙이다.
 * 자주 쓰는 형식은 아래 함수로 묶어 두었다.
 */
import { urls } from "./urls";

/**
 * 로그인이 필요한 요청(추천, 댓글, 참여 등)에 쓰는 fetch.
 * Firefox content script의 기본 fetch는 확장 프로그램 쪽에서 나가는 요청이라 사이트 요청과
 * 출처가 다르다. content.fetch를 쓰면 페이지가 직접 보낸 요청처럼 나간다.
 * Chrome에는 content.fetch가 없어서 기본 fetch를 그대로 쓴다.
 */
export const pageFetch: typeof fetch =
  (globalThis as { content?: { fetch: typeof fetch } }).content?.fetch ?? fetch;

const AJAX_HEADER = { "x-requested-with": "XMLHttpRequest" };
const JSON_ACCEPT = "application/json, text/javascript, */*; q=0.01";
const XML_ACCEPT = "application/xml, text/xml, */*; q=0.01";

type RequestOptions = {
  /** 사이트가 보내는 Referer. 헤더로는 못 바꾸므로 fetch 옵션으로 넣음 */
  referrer?: string;
};

/**
 * `/?act=...` 형식의 JSON 요청 (추천, 승부예측, 핫딜 상품 등).
 * 본문은 form 형식(a=1&b=2)인데 content-type은 application/json이다.
 * 이상해 보이지만 사이트가 실제로 이렇게 보내므로 맞춘다.
 *
 * @param params 본문 파라미터. 사이트와 같은 순서로 넣을 것 (객체 순서대로 들어감)
 */
export const postAct = (
  act: string,
  params: Record<string, string>,
  { referrer }: RequestOptions = {},
) =>
  pageFetch(`${urls.BASE_URL}/?act=${act}`, {
    method: "POST",
    headers: {
      accept: JSON_ACCEPT,
      "content-type": "application/json",
      ...AJAX_HEADER,
    },
    credentials: "include",
    referrer,
    body: new URLSearchParams(params).toString(),
  });

/** XE(사이트 엔진)의 XML 요청 본문. 값은 CDATA로 감싸므로 따로 이스케이프하지 않음 */
const xmlBody = (params: Record<string, string>) =>
  `<?xml version="1.0" encoding="utf-8" ?>\n<methodCall>\n<params>\n${Object.entries(
    params,
  )
    .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
    .join("\n")}\n</params>\n</methodCall>`;

/**
 * XML 형식 요청 (회원 메뉴, 댓글 작성처럼 사이트가 XML로 주고받는 것).
 *
 * @param path BASE_URL 뒤 경로 (예: "/index.php?act=getMemberMenu")
 */
export const postXml = (
  path: string,
  params: Record<string, string>,
  { referrer }: RequestOptions = {},
) =>
  pageFetch(`${urls.BASE_URL}${path}`, {
    method: "POST",
    headers: {
      accept: XML_ACCEPT,
      "content-type": "text/xml; charset=UTF-8",
      ...AJAX_HEADER,
    },
    credentials: "include",
    referrer,
    body: xmlBody(params),
  });

/** 사이트 JSON 응답의 공통 부분 */
type JsonResult = { error: number; message: string };

/**
 * JSON 응답을 읽음. 사이트는 실패해도 HTTP 200에 `error`(0이 아님)와 `message`로
 * 알려주므로, 여기서 예외로 바꿔야 react-query mutation의 onError로 간다.
 *
 * @param failMessage HTTP 자체가 실패했을 때 보여줄 문구
 */
export const readJson = async <T extends JsonResult>(
  res: Response,
  failMessage: string,
): Promise<T> => {
  if (!res.ok) throw new Error(failMessage);
  const data: T = await res.json();
  if (data.error !== 0) throw new Error(data.message);
  return data;
};

/**
 * XML 응답을 문서로 읽음. 형식이 깨졌으면 예외
 *
 * @param failMessage 응답을 해석하지 못했을 때 보여줄 문구
 */
export const readXml = async (
  res: Response,
  failMessage: string,
): Promise<Document> => {
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  if (xml.querySelector("parsererror")) throw new Error(failMessage);
  return xml;
};

/**
 * 사이트 페이지(게시글, 댓글 페이지 등)를 HTML 문서로 받음.
 * 에러/요청 제한 페이지를 글로 파싱하지 않도록 HTTP 실패는 예외로 바꿔
 * 미리보기 에러 화면(다시 시도)으로 보낸다.
 */
export const fetchPage = async (
  url: string,
  failMessage: string,
): Promise<Document> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${failMessage} (${res.status})`);
  return new DOMParser().parseFromString(await res.text(), "text/html");
};
