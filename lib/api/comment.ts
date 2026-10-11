/** 댓글: 댓글 페이지 받기, 추천/비추천, 작성 */
import { parseComment, parsePagination } from "@/lib/parser";
import type { CommentData, VoteType } from "@/lib/types";
import { fetchPage, postAct, postXml, readXml } from "./request";
import type { VoteResult } from "./types";
import { urls, withCommentPage } from "./urls";

/** 댓글 페이지 문서에서 댓글 목록과 페이지 정보를 읽음 */
const readCommentPage = (doc: Document) => {
  const { comments, commentCount } = parseComment(doc);
  const { currentPage, totalPages } = parsePagination(doc);
  return { comments, commentCount, currentPage, totalPages };
};

/** 게시글의 n번째 댓글 페이지 (첫 페이지는 fetchPost에 들어 있음) */
export const fetchComments = async (url: string, cpage: number) =>
  readCommentPage(
    await fetchPage(withCommentPage(url, cpage), "댓글을 불러오지 못했습니다"),
  );

/**
 * 댓글 하나가 들어 있는 댓글 페이지 (베스트 댓글의 "댓글로 가기"용).
 * 몇 페이지에 있는지 몰라도 댓글 주소로 받으면 사이트가 그 페이지를 준다
 */
export const fetchCommentPageOf = async (docId: string, commentId: string) =>
  readCommentPage(
    await fetchPage(urls.comment(docId, commentId), "댓글을 찾지 못했습니다"),
  );

/**
 * 댓글 추천/비추천.
 * 댓글 추천은 성공/취소/실패 모두 error: -2로 와서 여기서 예외로 바꾸지 않는다.
 * 성공 여부는 useVoteComment에서 응답 필드로 판단
 */
export const voteComment = async (
  comment: CommentData,
  type: VoteType,
): Promise<VoteResult> => {
  const act = type === "up" ? "procCommentVoteUp" : "procCommentVoteDown";
  const res = await postAct(act, {
    target_srl: comment.id,
    module: "comment",
    act,
  });
  if (!res.ok) throw new Error("댓글을 추천하지 못했습니다");
  return res.json();
};

/** 입력한 텍스트를 use_html=Y 댓글 본문으로. 태그로 해석되지 않게 이스케이프하고 줄바꿈은 <br> */
const toCommentHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;") // ]]>도 같이 막혀서 CDATA가 깨지지 않음
    .replace(/\r?\n/g, "<br />");

/**
 * 댓글 작성. parentSrl을 주면 그 댓글에 대한 답글
 * @returns 새 댓글의 comment_srl
 */
export const insertComment = async ({
  mid,
  docId,
  content,
  parentSrl,
}: {
  mid: string;
  docId: string;
  content: string;
  parentSrl?: string;
}): Promise<string> => {
  const res = await postXml(
    "/write.php?act=procBoardInsertComment",
    {
      _filter: "insert_comment",
      mid,
      document_srl: docId,
      content: toCommentHtml(content),
      ...(parentSrl && { parent_srl: parentSrl }),
      use_html: "Y",
      module: "board",
      act: "procBoardInsertComment",
    },
    { referrer: `${urls.BASE_URL}/${docId}` },
  );

  const xml = await readXml(res, "댓글을 등록하지 못했습니다");
  const text = (tag: string) => xml.querySelector(tag)?.textContent?.trim();
  const commentSrl = text("comment_srl");
  if (text("error") !== "0" || !commentSrl) {
    // 비로그인, 도배 방지 등은 message에 사유가 옴
    throw new Error(text("message") || "댓글을 등록하지 못했습니다");
  }
  return commentSrl;
};
