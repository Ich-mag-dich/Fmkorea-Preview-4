/** 회원: 블라인드 상태 조회·변경, 게시판 이력 */
import { parseBlindStatus, parseBoardHistory } from "../parser";
import type { BlindType, BoardHistory, PostData } from "../types";
import { pageFetch, postXml, readXml } from "./request";
import { urls } from "./urls";

/**
 * 해당 회원의 블라인드 상태. 사이트의 회원 메뉴(닉네임 클릭) 요청을 그대로 보내고
 * 메뉴 항목에서 상태를 읽는다. 로그인 안 했으면 항목이 없어서 빈 객체
 */
export const fetchBlindStatus = async ({
  memberSrl,
  docId,
  mid,
}: {
  memberSrl: string;
  docId: string;
  mid: string;
}): Promise<Partial<Record<BlindType, boolean>>> => {
  const res = await postXml(
    "/index.php?act=getMemberMenu",
    {
      document_srl: docId,
      target_srl: memberSrl,
      cur_mid: mid,
      mid,
      cur_act: "",
      menu_id: `member_${memberSrl}`,
      page_x: "0",
      page_y: "0",
      module: "member",
      act: "getMemberMenu",
    },
    { referrer: `${urls.BASE_URL}/${docId}` },
  );
  const xml = await readXml(res, "회원 메뉴 응답을 해석하지 못했습니다");
  return parseBlindStatus(xml);
};

/**
 * 블라인드 추가/해제.
 * 응답 형식을 믿기 어려워서 성공 여부는 호출하는 쪽(useBlindMember)이
 * 상태를 다시 조회해서 판단한다. 응답은 실패 사유(message)를 보여줄 때만 씀
 */
export const blindMember = async ({
  memberSrl,
  docId,
  mid,
  type,
  mode,
  memo = "",
}: {
  memberSrl: string;
  docId: string;
  mid: string;
  type: BlindType | "all";
  mode: "add" | "cancel";
  memo?: string;
}): Promise<{ message?: string } | undefined> => {
  // 이 요청만 /?act= 형식이 아니고, content-type도 일반 form 형식
  const res = await pageFetch(`${urls.BASE_URL}/modules/blind/api.php`, {
    method: "POST",
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
    },
    credentials: "include",
    referrer: `${urls.BASE_URL}/${docId}`,
    body: new URLSearchParams({
      target_srl: memberSrl,
      type,
      mode,
      memo,
      target_document_srl: docId,
      current_mid: mid,
    }).toString(),
  });
  return res.json();
};

/**
 * 작성자의 이 게시판 이력(최근 글/댓글 8개씩, 가입일).
 * 게시글 페이지의 "게시판 이력" 버튼과 같은 요청
 */
export const fetchBoardHistory = async (
  post: PostData,
): Promise<BoardHistory> => {
  const history = post.historyParams;
  if (!history) throw new Error("이 글은 게시판 이력을 볼 수 없습니다");

  const params = new URLSearchParams({
    document_srl: post.docId,
    target_member_srl: history.memberSrl,
    is_mobile: "0",
    mid: post.mid,
    is_best: history.isBest ? "1" : "0",
    ch: history.ch,
  });
  const res = await pageFetch(
    `${urls.BASE_URL}/_call/humorHistory.php?${params}`,
    {
      headers: { accept: "*/*", "x-requested-with": "XMLHttpRequest" },
      credentials: "include",
      referrer: post.url,
    },
  );
  if (!res.ok) throw new Error("게시판 이력을 불러오지 못했습니다");

  const doc = new DOMParser().parseFromString(await res.text(), "text/html");
  return parseBoardHistory(doc);
};
