import type { PredictionPollBetResult } from "./api/types";
import type { PredictionPoll, PredictionPollOption } from "./types";

const POLL_SELECTOR = "form.fm-pp";

/** "188,361" → 188361 */
const toNumber = (text: string | null | undefined): number =>
  parseInt(text?.replace(/,/g, "") ?? "") || 0;

const text = (el: Element | null | undefined): string =>
  el?.textContent?.replace(/\s+/g, " ").trim() ?? "";

/**
 * .label-area 안에서 설명(.tooltip)이 name인 항목의 값(.ratio)을 찾음
 * 순서가 바뀌어도 되도록 위치 대신 설명 글자로 찾음
 */
const findLabelValue = (area: Element | null, name: string): string => {
  const label = Array.from(area?.querySelectorAll(".label") ?? []).find(
    l => text(l.querySelector(".tooltip")) === name,
  );
  return text(label?.querySelector(".ratio"));
};

/** "100 (161)" → [100, 161] */
const parsePair = (s: string): [number, number] => {
  const [a, b] = s.split("(");
  return [toNumber(a), toNumber(b)];
};

const parseOption = (o: Element): PredictionPollOption => {
  const area = o.querySelector(".label-area");
  const bar = o.querySelector<HTMLElement>(".pro .sum");
  // 참여한 선택지는 막대 안에 <span class="my">100 (161)</span>이 먼저 붙어 있음
  const my = bar?.querySelector(":scope > .my");
  // "60,848 (32%)"
  const [sum] = parsePair(text(bar?.querySelector(":scope > span:not(.my)")));
  const [myPoint, myExp] = parsePair(text(my));
  return {
    value: o.querySelector<HTMLInputElement>("input[name='o']")?.value ?? "",
    label: text(o.querySelector(".i label")),
    sum,
    percent: parseFloat(bar?.style.width ?? "") || 0,
    odds: findLabelValue(area, "배당률"),
    count: toNumber(findLabelValue(area, "참여 수")),
    myBet: my ? { point: myPoint, exp: myExp } : null,
  };
};

const parseBet = (form: Element): PredictionPoll["bet"] => {
  const input = form.querySelector<HTMLInputElement>(
    ".input-area input[name='bet']",
  );
  if (!input) return null;
  return {
    min: toNumber(input.getAttribute("min")),
    max: toNumber(input.getAttribute("max")),
    initial: toNumber(input.value),
    myPoint: toNumber(text(form.querySelector(".input-area .my_point"))),
  };
};

const parsePoll = (form: Element): PredictionPoll => {
  const titleEl = form.querySelector(":scope > .title");
  // 제목 줄에 .status(합산/참여 수)도 같이 들어 있어서 글자 노드만 씀
  const title = Array.from(titleEl?.childNodes ?? [])
    .filter(n => n.nodeType === Node.TEXT_NODE)
    .map(n => n.textContent)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    pk: form.querySelector<HTMLInputElement>("input[name='pk']")?.value ?? "",
    title,
    totalSum: toNumber(text(titleEl?.querySelector(".o_sum"))),
    totalCount: toNumber(text(titleEl?.querySelector(".o_count_sum"))),
    options: Array.from(form.querySelectorAll(".o_list > .o")).map(parseOption),
    bet: parseBet(form),
    endMessage: text(form.querySelector(".bet > .message-end")) || null,
    // 참여 입력 줄, 마감 안내, 버튼 줄(.info)을 뺀 나머지가 안내 문구
    notices: Array.from(
      form.querySelectorAll(
        ":scope > .bet > div:not(.input-area):not(.message-end):not(.info)",
      ),
    )
      .map(text)
      .filter(Boolean),
  };
};

/**
 * 본문 속 승부예측 폼을 읽어서 반환
 *
 * @param root 게시글 본문을 포함한 요소나 문서
 * @returns 승부예측 배열 (없으면 빈 배열)
 */
export const parsePredictionPolls = (
  root: Document | Element,
): PredictionPoll[] =>
  Array.from(root.querySelectorAll(POLL_SELECTOR)).map(parsePoll);

/**
 * 참여하기 응답을 승부예측에 반영한 새 객체를 반환
 * 선택지는 응답의 tpl(최신 수치로 다시 그린 선택지 HTML)을 다시 파싱해서 바꿈
 *
 * @param poll 참여 전 승부예측
 * @param result 참여하기 응답
 * @returns 참여 후 승부예측
 */
export const applyBetResult = (
  poll: PredictionPoll,
  result: PredictionPollBetResult,
): PredictionPoll => {
  const doc = new DOMParser().parseFromString(result.tpl, "text/html");
  const parsed = Array.from(doc.querySelectorAll(".o")).map(parseOption);
  // tpl을 못 읽으면 선택지는 그대로 두고 잉여력만 바꿈
  const options = parsed.length > 0 ? parsed : poll.options;

  return {
    ...poll,
    options,
    totalSum: options.reduce((acc, o) => acc + o.sum, 0),
    totalCount: options.reduce((acc, o) => acc + o.count, 0),
    bet: poll.bet && {
      ...poll.bet,
      myPoint: result.my_point,
      // 최대 참여 잉여력은 보유 잉여력을 넘을 수 없음
      max: Math.min(poll.bet.max, result.my_point),
    },
  };
};

/**
 * 본문에서 승부예측 폼을 지움. 따로 컴포넌트로 그리기 때문
 * !주의: root를 직접 수정함
 *
 * @param root 게시글 본문 요소
 */
export const removePredictionPolls = (root: Document | Element): void => {
  root.querySelectorAll(POLL_SELECTOR).forEach(form => form.remove());
};
